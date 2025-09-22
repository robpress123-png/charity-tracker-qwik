/**
 * Cloudflare Pages Function for importing donations
 * POST /api/donations/import - Import donations from CSV with smart charity matching
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

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Check authentication
        const token = request.headers.get('Authorization');
        const user = getUserFromToken(token);

        if (!user) {
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

        // First, get all charities for name matching
        const allCharities = await env.DB.prepare(`
            SELECT id, name, ein FROM charities
            UNION ALL
            SELECT id, name, ein FROM user_charities WHERE user_id = ?
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

                // First try: direct ID if provided
                if (donation.charity_id) {
                    charityId = donation.charity_id;
                }
                // Second try: match by name
                else if (donation.charity_name) {
                    const searchName = donation.charity_name.toLowerCase();
                    const match = charityMap.get(searchName);

                    if (match) {
                        charityId = match.id;
                        results.charityMatches.found++;
                    } else {
                        // Try cleaned name
                        const cleanName = searchName
                            .replace(/\b(inc|incorporated|llc|ltd|foundation|fund|charity|organization|org)\b/gi, '')
                            .replace(/[^\w\s]/g, '')
                            .trim();

                        const cleanMatch = charityMap.get(cleanName);
                        if (cleanMatch) {
                            charityId = cleanMatch.id;
                            results.charityMatches.found++;
                        } else {
                            // Try partial match
                            for (const [key, charity] of charityMap) {
                                if (key.includes(searchName) || searchName.includes(key)) {
                                    charityId = charity.id;
                                    results.charityMatches.found++;
                                    break;
                                }
                            }

                            if (!charityId) {
                                results.charityMatches.notFound.push(donation.charity_name);
                                results.failed++;
                                results.errors.push(`Row ${results.processed}: Charity not found: ${donation.charity_name}`);
                                continue;
                            }
                        }
                    }
                }

                if (!charityId) {
                    results.failed++;
                    results.errors.push(`Row ${results.processed}: No charity specified`);
                    continue;
                }

                // Prepare donation data
                const donationId = generateId();
                const donationType = donation.donation_type || 'cash';
                const amount = parseFloat(donation.amount) || 0;
                const donationDate = donation.donation_date || donation.date || new Date().toISOString().split('T')[0];

                // Build notes object based on donation type
                const notesData = {
                    notes: donation.notes || '',
                    donation_type: donationType
                };

                // Add type-specific fields
                if (donationType === 'items' && (donation.item_description || donation.estimated_value)) {
                    notesData.item_description = donation.item_description || '';
                    notesData.estimated_value = parseFloat(donation.estimated_value) || amount;
                } else if (donationType === 'miles' && donation.miles_driven) {
                    notesData.miles_driven = parseFloat(donation.miles_driven) || 0;
                } else if (donationType === 'stock' && donation.stock_symbol) {
                    notesData.stock_symbol = donation.stock_symbol;
                    notesData.shares = parseFloat(donation.shares) || 0;
                } else if (donationType === 'crypto' && donation.crypto_symbol) {
                    notesData.crypto_symbol = donation.crypto_symbol;
                    notesData.crypto_amount = parseFloat(donation.crypto_amount) || 0;
                }

                // Insert donation
                await env.DB.prepare(`
                    INSERT INTO donations (
                        id, user_id, charity_id, amount, date, notes, created_at
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
                    )
                `).bind(
                    donationId,
                    user.id,
                    charityId,
                    amount,
                    donationDate,
                    JSON.stringify(notesData)
                ).run();

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

// Handle OPTIONS requests for CORS
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}