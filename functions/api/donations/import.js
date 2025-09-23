/**
 * Cloudflare Pages Function for importing donations - v2.0.0
 * POST /api/donations/import - Import donations from CSV with smart charity matching
 * Supports proper donation_items table for itemized donations
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
        const user = getUserFromToken(token);

        if (!user) {
            // Try to get real user ID from database
            if (token && token.startsWith('Bearer token-')) {
                const parts = token.replace('Bearer token-', '').split('-');
                if (parts.length >= 1) {
                    const userId = parts[0];
                    const userCheck = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
                    if (userCheck) {
                        user.id = userId;
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
        const { donations } = body;

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

        // First, get all charities for name matching
        const allCharities = await env.DB.prepare(`
            SELECT id, name, ein, 'system' as type FROM charities
            UNION ALL
            SELECT id, name, ein, 'personal' as type FROM user_charities WHERE user_id = ?
        `).bind(user.id).all();

        // Create a lookup map for charity names (case-insensitive)
        const charityMap = new Map();
        allCharities.results.forEach(charity => {
            // Store by exact name
            charityMap.set(charity.name.toLowerCase(), charity);

            // Also store common variations
            const cleanName = charity.name.toLowerCase()
                .replace(/\b(inc|incorporated|llc|ltd|foundation|fund|charity|organization|org)\b/gi, '')
                .replace(/[^\w\s]/g, '')
                .trim();
            if (cleanName !== charity.name.toLowerCase()) {
                charityMap.set(cleanName, charity);
            }
        });

        const results = {
            processed: 0,
            added: 0,
            skipped: 0,
            failed: 0,
            errors: [],
            charityMatches: {
                found: 0,
                notFound: []
            }
        };

        // Process donations
        for (const donation of donations) {
            results.processed++;

            try {
                // Smart charity matching
                let charityId = null;
                let userCharityId = null;
                let charityType = null;

                // First try: direct ID if provided
                if (donation.charity_id) {
                    charityId = donation.charity_id;
                    charityType = 'system';
                }
                // Second try: match by name
                else if (donation.charity_name) {
                    const searchName = donation.charity_name.toLowerCase();
                    const match = charityMap.get(searchName);

                    if (match) {
                        if (match.type === 'personal') {
                            userCharityId = match.id;
                            charityType = 'personal';
                        } else {
                            charityId = match.id;
                            charityType = 'system';
                        }
                        results.charityMatches.found++;
                    } else {
                        // Try cleaned name
                        const cleanName = searchName
                            .replace(/\b(inc|incorporated|llc|ltd|foundation|fund|charity|organization|org)\b/gi, '')
                            .replace(/[^\w\s]/g, '')
                            .trim();

                        const cleanMatch = charityMap.get(cleanName);
                        if (cleanMatch) {
                            if (cleanMatch.type === 'personal') {
                                userCharityId = cleanMatch.id;
                                charityType = 'personal';
                            } else {
                                charityId = cleanMatch.id;
                                charityType = 'system';
                            }
                            results.charityMatches.found++;
                        } else {
                            // Try partial match
                            for (const [key, charity] of charityMap) {
                                if (key.includes(searchName) || searchName.includes(key)) {
                                    if (charity.type === 'personal') {
                                        userCharityId = charity.id;
                                        charityType = 'personal';
                                    } else {
                                        charityId = charity.id;
                                        charityType = 'system';
                                    }
                                    results.charityMatches.found++;
                                    break;
                                }
                            }

                            if (!charityId && !userCharityId) {
                                results.charityMatches.notFound.push(donation.charity_name);
                                results.failed++;
                                results.errors.push(`Row ${results.processed}: Charity not found: ${donation.charity_name}`);
                                continue;
                            }
                        }
                    }
                }

                if (!charityId && !userCharityId) {
                    results.failed++;
                    results.errors.push(`Row ${results.processed}: No charity specified`);
                    continue;
                }

                // Prepare donation data
                const donationId = crypto.randomUUID();
                const donationType = donation.donation_type || 'cash';
                const amount = parseFloat(donation.amount) || 0;
                const donationDate = donation.donation_date || donation.date || new Date().toISOString().split('T')[0];

                // Notes will be stored as plain text in the database
                // For items donations, the ITEMS:[...] format in notes will be parsed separately

                // Insert donation with v2.0.0 structure
                await env.DB.prepare(`
                    INSERT INTO donations (
                        id, user_id, charity_id, user_charity_id, donation_type, amount, date, notes, created_at
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
                    )
                `).bind(
                    donationId,
                    user.id,
                    charityId,      // Will be NULL for personal charities
                    userCharityId,  // Will be NULL for system charities
                    donationType,   // Now stored in its own column
                    amount,
                    donationDate,
                    donation.notes || ''  // Store plain text notes, not JSON
                ).run();

                // For items donations, parse items from notes or create defaults
                if (donationType === 'items') {
                    const itemsCreated = [];

                    // Check if notes contains structured items data
                    if (donation.notes && donation.notes.includes('ITEMS:')) {
                        // Parse format: ITEMS:[name|category|condition|qty|value][name|category|condition|qty|value]
                        const itemsMatch = donation.notes.match(/ITEMS:\[(.+)\]/g);
                        if (itemsMatch) {
                            const itemsString = itemsMatch[0].replace('ITEMS:', '');
                            const itemMatches = itemsString.match(/\[([^\]]+)\]/g);

                            if (itemMatches) {
                                for (const itemMatch of itemMatches) {
                                    const itemData = itemMatch.replace(/\[|\]/g, '').split('|');
                                    if (itemData.length >= 5) {
                                        const [itemName, category, condition, quantity, value] = itemData;
                                        const qty = parseInt(quantity) || 1;
                                        const unitValue = parseFloat(value) / qty;

                                        await env.DB.prepare(`
                                            INSERT INTO donation_items (
                                                donation_id, item_name, category, condition, quantity, unit_value, total_value
                                            ) VALUES (?, ?, ?, ?, ?, ?, ?)
                                        `).bind(
                                            donationId,
                                            itemName,
                                            category,
                                            condition,
                                            qty,
                                            unitValue,
                                            parseFloat(value)
                                        ).run();

                                        itemsCreated.push(itemName);
                                    }
                                }
                            }
                        }
                    }

                    // If no structured items found, create generic items
                    if (itemsCreated.length === 0) {
                        // Parse item count from notes if available
                        const itemCountMatch = donation.notes ? donation.notes.match(/(\d+)\s*items/i) : null;
                        const itemCount = itemCountMatch ? parseInt(itemCountMatch[1]) : 3;

                        // Create generic items based on amount
                        const avgValue = amount / itemCount;

                        for (let i = 1; i <= Math.min(itemCount, 10); i++) {
                            await env.DB.prepare(`
                                INSERT INTO donation_items (
                                    donation_id, item_name, category, condition, quantity, unit_value, total_value
                                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                                donationId,
                                `Donated Item ${i}`,
                                'General',
                                'good',
                                1,
                                avgValue,
                                avgValue
                            ).run();
                        }
                    }
                }

                results.added++;

            } catch (error) {
                results.failed++;
                if (results.errors.length < 20) {
                    results.errors.push(`Row ${results.processed}: ${error.message}`);
                }
            }
        }

        // Return detailed results
        return new Response(JSON.stringify({
            success: true,
            results,
            message: `Import completed: ${results.added} donations added`,
            unmatchedCharities: results.charityMatches.notFound.length > 0
                ? `Could not match ${results.charityMatches.notFound.length} charity names`
                : null
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