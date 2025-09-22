/**
 * Cloudflare Pages Function for clearing donation items only
 * DELETE /api/donations/clear-items - Admin only endpoint to clear donation_items table
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

export async function onRequestDelete(context) {
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

        // Check if D1 database is available
        if (!env.DB) {
            return new Response(JSON.stringify({
                success: true,
                message: 'Mock delete (D1 not available locally)',
                deletedCount: 0
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get count before deletion
        const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM donation_items').first();
        const beforeCount = countResult?.count || 0;

        // Delete all donation items only (keeps donation records)
        await env.DB.prepare('DELETE FROM donation_items').run();

        return new Response(JSON.stringify({
            success: true,
            message: `Successfully cleared all donation items`,
            deletedItemsCount: beforeCount
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Clear donation items error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to clear donation items: ' + error.message
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
            'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}