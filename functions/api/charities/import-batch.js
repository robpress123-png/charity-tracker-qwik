/**
 * Cloudflare Pages Function for batch importing charities
 * POST /api/charities/import-batch - Import charities in chunks to avoid D1 limits
 * Handles batching automatically on the backend
 */

// Helper function to get user from token
function getUserFromToken(token) {
    if (!token || !token.startsWith('Bearer ')) {
        return null;
    }

    const tokenValue = token.replace('Bearer ', '');

    // Admin tokens
    if (tokenValue === 'admin-token') {
        return { id: 'admin', email: 'admin@example.com', isAdmin: true };
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
        // Check authentication - admin only
        const token = request.headers.get('Authorization');
        const user = getUserFromToken(token);

        if (!user || !user.isAdmin) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Unauthorized - Admin access required'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        const body = await request.json();
        const { charities, startIndex = 0, batchSize = 200 } = body;

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

        // Process only a batch to stay under D1 limits
        const endIndex = Math.min(startIndex + batchSize, charities.length);
        const batch = charities.slice(startIndex, endIndex);

        const results = {
            processed: 0,
            added: 0,
            skipped: 0,
            failed: 0,
            errors: []
        };

        // Process the batch
        for (const charity of batch) {
            results.processed++;

            try {
                // Validate required fields
                if (!charity.name || !charity.ein) {
                    results.failed++;
                    continue;
                }

                // Clean EIN
                const cleanEIN = charity.ein.replace(/[^0-9]/g, '').padStart(9, '0');

                // Skip duplicate check for speed - rely on UNIQUE constraint
                // This saves ~200 DB queries per batch

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

            } catch (error) {
                results.failed++;
                if (results.errors.length < 10) {
                    results.errors.push(`Row ${startIndex + results.processed}: ${error.message}`);
                }
            }
        }

        // Return results with progress info
        const hasMore = endIndex < charities.length;
        const progress = {
            current: endIndex,
            total: charities.length,
            percentage: Math.round((endIndex / charities.length) * 100)
        };

        return new Response(JSON.stringify({
            success: true,
            results,
            progress,
            hasMore,
            nextIndex: hasMore ? endIndex : null,
            message: hasMore
                ? `Batch processed. ${charities.length - endIndex} charities remaining.`
                : 'Import completed!'
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