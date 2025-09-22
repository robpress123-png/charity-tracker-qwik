/**
 * Cloudflare Pages Function for bulk importing charities
 * POST /api/charities/import - Import charities from CSV with duplicate checking
 * Fixed version with proper user handling and address fields
 */

// Helper function to get user from token
function getUserFromToken(token) {
    if (!token || !token.startsWith('Bearer ')) {
        return null;
    }

    const tokenValue = token.replace('Bearer ', '');

    // For admin/test mode
    if (tokenValue === 'test-token' || tokenValue === 'demo-token' || tokenValue === 'admin-token') {
        return { id: 'admin', email: 'admin@example.com', isAdmin: true };
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

        // No user_id needed anymore - charities are system-wide!

        // Process charities
        const results = {
            processed: 0,
            added: 0,
            updated: 0,
            skipped: 0,
            failed: 0,
            errors: []
        };

        // Process in smaller batches to avoid timeout and show all charities
        const BATCH_SIZE = 50;
        const MAX_ERRORS_TO_SHOW = 10;

        for (let i = 0; i < charities.length; i += BATCH_SIZE) {
            const batch = charities.slice(i, Math.min(i + BATCH_SIZE, charities.length));

            for (const charity of batch) {
                results.processed++;

                try {
                    // Validate required fields
                    if (!charity.name || !charity.ein) {
                        results.failed++;
                        if (results.errors.length < MAX_ERRORS_TO_SHOW) {
                            results.errors.push(`Row ${results.processed}: Missing required fields (name or EIN)`);
                        }
                        continue;
                    }

                    // Clean EIN (remove non-numeric characters)
                    const cleanEIN = charity.ein.replace(/[^0-9]/g, '').padStart(9, '0');

                    // Check for existing charity by EIN (system-wide)
                    const existing = await env.DB.prepare(
                        'SELECT id FROM charities WHERE ein = ?'
                    ).bind(cleanEIN).first();

                    if (existing) {
                        if (skipDuplicates && !updateExisting) {
                            results.skipped++;
                            continue;
                        }

                        if (updateExisting) {
                            // Update existing charity with all fields including address
                            await env.DB.prepare(`
                                UPDATE charities SET
                                    name = ?,
                                    category = ?,
                                    address = ?,
                                    city = ?,
                                    state = ?,
                                    zip_code = ?,
                                    website = ?,
                                    description = ?,
                                    phone = ?,
                                    updated_at = CURRENT_TIMESTAMP
                                WHERE id = ?
                            `).bind(
                                charity.name,
                                charity.category || 'Other',
                                charity.address || '',
                                charity.city || '',
                                charity.state || '',
                                charity.zip_code || charity.zip || '',
                                charity.website || '',
                                charity.description || '',
                                charity.phone || '',
                                existing.id
                            ).run();

                            results.updated++;
                        } else {
                            results.skipped++;
                        }
                    } else {
                        // Add new charity (no user_id needed!)
                        const charityId = generateId();

                        await env.DB.prepare(`
                            INSERT INTO charities (
                                id, name, ein, category,
                                address, city, state, zip_code,
                                website, description, phone, is_verified, created_at
                            ) VALUES (
                                ?, ?, ?, ?,
                                ?, ?, ?, ?,
                                ?, ?, ?, 1, CURRENT_TIMESTAMP
                            )
                        `).bind(
                            charityId,
                            charity.name,
                            cleanEIN,
                            charity.category || 'Other',
                            charity.address || '',
                            charity.city || '',
                            charity.state || '',
                            charity.zip_code || charity.zip || '',
                            charity.website || '',
                            charity.description || '',
                            charity.phone || ''
                        ).run();

                        results.added++;
                    }
                } catch (error) {
                    results.failed++;
                    if (results.errors.length < MAX_ERRORS_TO_SHOW) {
                        results.errors.push(`Row ${results.processed}: ${error.message}`);
                    }
                }
            }

            // If we've processed a lot and have many errors, stop early
            if (results.failed > 100 && results.added === 0) {
                results.errors.push(`Stopping import due to too many errors (${results.failed} failures)`);
                break;
            }
        }

        // Add summary if there were more errors than shown
        if (results.failed > MAX_ERRORS_TO_SHOW) {
            results.errors.push(`... and ${results.failed - MAX_ERRORS_TO_SHOW} more errors`);
        }

        return new Response(JSON.stringify({
            success: results.added > 0 || results.updated > 0,
            results: results,
            message: `Import completed: ${results.added} added, ${results.updated} updated, ${results.skipped} skipped, ${results.failed} failed`
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