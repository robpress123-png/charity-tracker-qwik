/**
 * Optimized Cloudflare Pages Function for importing donations
 * POST /api/donations/import-optimized - Faster import with batch processing
 */

// Helper function to get user from token
function getUserFromToken(token) {
    if (!token || !token.startsWith('Bearer ')) {
        return null;
    }

    const tokenValue = token.replace('Bearer ', '');

    // For demo/test mode
    if (tokenValue === 'test-token' || tokenValue === 'demo-token') {
        return { id: '1', email: 'test@example.com' };
    }

    // Parse real token format: token-{userId}-{timestamp}
    if (tokenValue.startsWith('token-')) {
        const parts = tokenValue.split('-');
        if (parts.length >= 3) {
            return { id: parts[1], email: parts[2] || 'user@example.com' };
        }
    }

    return null;
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Check authentication
        const token = request.headers.get('Authorization');
        let user = getUserFromToken(token);

        if (!user) {
            // Try to get real user ID from database
            if (token && token.startsWith('Bearer token-')) {
                const parts = token.replace('Bearer token-', '').split('-');
                if (parts.length >= 1 && env.DB) {
                    const userId = parts[0];
                    const userCheck = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
                    if (userCheck) {
                        user = { id: userId, email: 'user@example.com' };
                    }
                }
            }

            if (!user || !user.id) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Authentication required'
                }), {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }

        const body = await request.json();
        const { donations, batchSize = 25 } = body; // Process in smaller chunks

        if (!donations || !Array.isArray(donations)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid request: donations array required'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Check if D1 database is available
        if (!env.DB) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Database not available'
            }), {
                status: 503,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get test user ID if needed
        if (user.id === '1') {
            const testUser = await env.DB.prepare("SELECT id FROM users WHERE email = 'test@example.com'").first();
            if (testUser) {
                user.id = testUser.id;
            }
        }

        // Load charities once (optimized query)
        const charityData = await env.DB.prepare(`
            SELECT id, name, 'system' as type FROM charities
            UNION ALL
            SELECT id, name, 'personal' as type FROM user_charities WHERE user_id = ?
        `).bind(user.id).all();

        // Create fast lookup map
        const charityMap = new Map();
        charityData.results.forEach(charity => {
            const key = charity.name.toLowerCase().trim();
            charityMap.set(key, charity);

            // Also store without common suffixes
            const cleanName = key.replace(/\b(inc|incorporated|llc|ltd|foundation|fund)\b/gi, '').trim();
            if (cleanName !== key) {
                charityMap.set(cleanName, charity);
            }
        });

        // Track personal charities we need to create
        const personalCharitiesToCreate = new Map();

        // First pass: identify all charities that need to be created
        for (const donation of donations) {
            if (donation.charity_name) {
                const searchName = donation.charity_name.toLowerCase().trim();
                if (!charityMap.has(searchName) && !personalCharitiesToCreate.has(searchName)) {
                    personalCharitiesToCreate.set(searchName, donation.charity_name);
                }
            }
        }

        // Batch create all personal charities at once
        const personalCharityIds = new Map();
        if (personalCharitiesToCreate.size > 0) {
            const batch = env.DB.batch([]);

            for (const [key, name] of personalCharitiesToCreate) {
                const id = crypto.randomUUID();
                personalCharityIds.set(key, id);

                batch.push(
                    env.DB.prepare(`
                        INSERT INTO user_charities (id, user_id, name, created_at)
                        VALUES (?, ?, ?, datetime('now'))
                    `).bind(id, user.id, name)
                );
            }

            // Execute all personal charity inserts at once
            await env.DB.batch(batch);
        }

        const results = {
            processed: 0,
            added: 0,
            failed: 0,
            errors: [],
            personalCharitiesCreated: personalCharitiesToCreate.size
        };

        // Process donations in batches
        const donationBatches = [];
        for (let i = 0; i < donations.length; i += batchSize) {
            donationBatches.push(donations.slice(i, i + batchSize));
        }

        for (const batch of donationBatches) {
            const donationInserts = [];
            const itemInserts = [];

            for (const donation of batch) {
                results.processed++;

                try {
                    const donationId = crypto.randomUUID();
                    const donationType = donation.donation_type || 'cash';
                    const amount = parseFloat(donation.amount) || 0;
                    const donationDate = donation.donation_date || donation.date || new Date().toISOString().split('T')[0];

                    // Find charity
                    let charityId = null;
                    let userCharityId = null;

                    if (donation.charity_name) {
                        const searchName = donation.charity_name.toLowerCase().trim();
                        const existing = charityMap.get(searchName);

                        if (existing) {
                            if (existing.type === 'personal') {
                                userCharityId = existing.id;
                            } else {
                                charityId = existing.id;
                            }
                        } else if (personalCharityIds.has(searchName)) {
                            userCharityId = personalCharityIds.get(searchName);
                        }
                    }

                    if (!charityId && !userCharityId) {
                        results.failed++;
                        continue;
                    }

                    // Queue donation insert
                    donationInserts.push(
                        env.DB.prepare(`
                            INSERT INTO donations (
                                id, user_id, charity_id, user_charity_id, donation_type,
                                amount, date, notes, created_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                        `).bind(
                            donationId, user.id, charityId, userCharityId,
                            donationType, amount, donationDate, donation.notes || ''
                        )
                    );

                    // Handle items if present
                    if (donationType === 'items') {
                        for (let i = 1; i <= 10; i++) {
                            const itemName = donation[`item_${i}_name`];
                            if (itemName && itemName.trim()) {
                                const category = donation[`item_${i}_category`] || 'General';
                                const condition = donation[`item_${i}_condition`] || 'good';
                                const quantity = parseInt(donation[`item_${i}_quantity`]) || 1;

                                itemInserts.push(
                                    env.DB.prepare(`
                                        INSERT INTO donation_items (
                                            donation_id, item_name, category, condition, quantity
                                        ) VALUES (?, ?, ?, ?, ?)
                                    `).bind(donationId, itemName, category, condition, quantity)
                                );
                            }
                        }
                    }

                    results.added++;

                } catch (error) {
                    results.failed++;
                    if (results.errors.length < 10) {
                        results.errors.push(`Row ${results.processed}: ${error.message}`);
                    }
                }
            }

            // Execute batch inserts
            if (donationInserts.length > 0) {
                await env.DB.batch(donationInserts);
            }
            if (itemInserts.length > 0) {
                await env.DB.batch(itemInserts);
            }
        }

        // Return results
        return new Response(JSON.stringify({
            success: true,
            results,
            message: `Import completed: ${results.added} donations added, ${results.personalCharitiesCreated} personal charities created`
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Import error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Import failed: ' + error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// CORS preflight handler
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        }
    });
}