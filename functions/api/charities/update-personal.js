/**
 * Cloudflare Pages Function for updating personal charities
 * PUT /api/charities/update-personal/:id - Update a personal charity
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

export async function onRequestPut(context) {
    const { request, env, params } = context;

    try {
        // Get charity ID from URL
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const charityId = pathParts[pathParts.length - 1];

        if (!charityId || charityId === 'update-personal') {
            return new Response(JSON.stringify({
                success: false,
                error: 'Charity ID is required'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

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

        // Validate at least name is provided
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

        // Verify charity belongs to user
        const existingCharity = await env.DB.prepare(
            'SELECT id, user_id FROM user_charities WHERE id = ? AND user_id = ?'
        ).bind(charityId, user.id).first();

        if (!existingCharity) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Charity not found or access denied'
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Clean EIN if provided
        const cleanEIN = ein ? ein.replace(/[^0-9]/g, '').padStart(9, '0') : null;

        // Check for duplicate name or EIN (excluding current charity)
        if (cleanEIN) {
            const duplicate = await env.DB.prepare(
                'SELECT id FROM user_charities WHERE user_id = ? AND id != ? AND (name = ? OR ein = ?)'
            ).bind(user.id, charityId, name, cleanEIN).first();

            if (duplicate) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'You already have another charity with this name or EIN'
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        } else {
            const duplicate = await env.DB.prepare(
                'SELECT id FROM user_charities WHERE user_id = ? AND id != ? AND name = ?'
            ).bind(user.id, charityId, name).first();

            if (duplicate) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'You already have another charity with this name'
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }

        // Update the charity
        await env.DB.prepare(`
            UPDATE user_charities SET
                name = ?,
                ein = ?,
                category = ?,
                address = ?,
                city = ?,
                state = ?,
                zip_code = ?,
                phone = ?,
                website = ?,
                description = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `).bind(
            name,
            cleanEIN,
            category || 'Other',
            address || '',
            city || '',
            state || '',
            zip_code || '',
            phone || '',
            website || '',
            description || '',
            charityId,
            user.id
        ).run();

        // Get the updated charity
        const updatedCharity = await env.DB.prepare(
            'SELECT * FROM user_charities WHERE id = ?'
        ).bind(charityId).first();

        return new Response(JSON.stringify({
            success: true,
            charity: updatedCharity,
            message: 'Personal charity updated successfully'
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Error updating personal charity:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to update charity: ' + error.message
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
            'Access-Control-Allow-Methods': 'PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}