/**
 * Cloudflare Pages Function for adding personal charities
 * POST /api/charities/add-personal - Add a user's personal charity
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
        const { name, ein, category, website, description, address, city, state, zip_code, phone } = body;

        // Validate required fields
        if (!name) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Charity name is required'
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

        // Clean EIN if provided
        const cleanEIN = ein ? ein.replace(/[^0-9]/g, '').padStart(9, '0') : null;

        // Check if user already has this charity (by name or EIN)
        if (cleanEIN) {
            const existing = await env.DB.prepare(
                'SELECT id FROM user_charities WHERE user_id = ? AND (name = ? OR ein = ?)'
            ).bind(user.id, name, cleanEIN).first();

            if (existing) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'You already have this charity in your personal list'
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        } else {
            const existing = await env.DB.prepare(
                'SELECT id FROM user_charities WHERE user_id = ? AND name = ?'
            ).bind(user.id, name).first();

            if (existing) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'You already have this charity in your personal list'
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }

        // Add personal charity
        const charityId = generateId();

        await env.DB.prepare(`
            INSERT INTO user_charities (
                id, user_id, name, ein, category,
                address, city, state, zip_code,
                phone, website, description, is_approved, created_at
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, 0, CURRENT_TIMESTAMP
            )
        `).bind(
            charityId,
            user.id,
            name,
            cleanEIN,
            category || 'Other',
            address || '',
            city || '',
            state || '',
            zip_code || '',
            phone || '',
            website || '',
            description || ''
        ).run();

        // Return the created charity
        const newCharity = await env.DB.prepare(
            'SELECT * FROM user_charities WHERE id = ?'
        ).bind(charityId).first();

        return new Response(JSON.stringify({
            success: true,
            charity: newCharity,
            message: 'Personal charity added successfully. It will be available immediately for your use.'
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Error adding personal charity:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to add charity: ' + error.message
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