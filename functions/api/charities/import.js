/**
 * Cloudflare Pages Function for bulk importing charities
 * POST /api/charities/import - Import charities from CSV with duplicate checking
 */

// Helper function to get user from token
function getUserFromToken(token) {
    if (!token || !token.startsWith('Bearer ')) {
        return null;
    }

    const tokenValue = token.replace('Bearer ', '');

    // For admin/test mode
    if (tokenValue === 'test-token' || tokenValue === 'demo-token' || tokenValue === 'admin-token') {
        return { id: '1', email: 'admin@example.com', isAdmin: true };
    }

    // Parse real token format: token-{userId}-{timestamp}
    if (tokenValue.startsWith('token-')) {
        const parts = tokenValue.split('-');
        if (parts.length >= 3) {
            return { id: parts[1] };
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
                error: 'Unauthorized'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        const body = await request.json();
        const { charities, skipDuplicates = true, updateExisting = false } = body;

        if (!charities || !Array.isArray(charities)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid request: charities array required'
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
            // Return mock response for local development
            return new Response(JSON.stringify({
                success: true,
                results: {
                    processed: charities.length,
                    added: Math.floor(charities.length * 0.8),
                    skipped: Math.floor(charities.length * 0.15),
                    updated: Math.floor(charities.length * 0.05),
                    failed: 0,
                    errors: []
                },
                message: 'Mock import (D1 not available locally)'
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Process charities
        const results = {
            processed: 0,
            added: 0,
            updated: 0,
            skipped: 0,
            failed: 0,
            errors: []
        };

        // Process in batches to avoid timeout
        const BATCH_SIZE = 100;
        for (let i = 0; i < charities.length; i += BATCH_SIZE) {
            const batch = charities.slice(i, Math.min(i + BATCH_SIZE, charities.length));

            for (const charity of batch) {
                results.processed++;

                try {
                    // Validate required fields
                    if (!charity.name || !charity.ein) {
                        results.failed++;
                        results.errors.push(`Row ${results.processed}: Missing required fields (name or EIN)`);
                        continue;
                    }

                    // Clean EIN (remove non-numeric characters)
                    const cleanEIN = charity.ein.replace(/[^0-9]/g, '');
                    if (cleanEIN.length < 9) {
                        results.failed++;
                        results.errors.push(`Row ${results.processed}: Invalid EIN "${charity.ein}"`);
                        continue;
                    }

                    // Check for existing charity by EIN
                    const existing = await env.DB.prepare(
                        'SELECT id FROM charities WHERE ein = ? AND user_id = ?'
                    ).bind(cleanEIN, user.id).first();

                    if (existing) {
                        if (skipDuplicates && !updateExisting) {
                            results.skipped++;
                            continue;
                        }

                        if (updateExisting) {
                            // Update existing charity
                            await env.DB.prepare(`
                                UPDATE charities SET
                                    name = ?,
                                    category = ?,
                                    website = ?,
                                    description = ?,
                                    updated_at = CURRENT_TIMESTAMP
                                WHERE id = ? AND user_id = ?
                            `).bind(
                                charity.name,
                                charity.category || 'Other',
                                charity.website || null,
                                charity.description || null,
                                existing.id,
                                user.id
                            ).run();

                            results.updated++;
                        } else {
                            results.skipped++;
                        }
                    } else {
                        // Add new charity
                        const charityId = generateId();

                        await env.DB.prepare(`
                            INSERT INTO charities (
                                id, user_id, name, ein, category, website, description, created_at
                            ) VALUES (
                                ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
                            )
                        `).bind(
                            charityId,
                            user.id,
                            charity.name,
                            cleanEIN,
                            charity.category || 'Other',
                            charity.website || null,
                            charity.description || null
                        ).run();

                        results.added++;
                    }
                } catch (error) {
                    results.failed++;
                    results.errors.push(`Row ${results.processed}: ${error.message}`);

                    // Stop if too many errors
                    if (results.errors.length >= 50) {
                        results.errors.push('Too many errors, stopping import');
                        break;
                    }
                }
            }

            // Break if too many errors
            if (results.errors.length >= 50) {
                break;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            results: results
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Error importing charities:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to import charities: ' + error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Handle preflight requests
export async function onRequestOptions(context) {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}