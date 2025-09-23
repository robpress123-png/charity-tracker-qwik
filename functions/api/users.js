/**
 * Get list of all users
 * GET /api/users
 * Admin endpoint
 */

// Helper function to get user from token
function getUserFromToken(token) {
    if (!token || !token.startsWith('Bearer ')) {
        return null;
    }

    const tokenValue = token.replace('Bearer ', '');

    // Admin tokens only
    if (tokenValue === 'admin-token' ||
        tokenValue === 'admin' ||
        tokenValue === 'admin-dev' ||
        tokenValue.startsWith('admin-') ||
        tokenValue.startsWith('token-admin')) {
        return { id: 'admin', email: 'admin@example.com', isAdmin: true };
    }

    // For regular user tokens, could verify and return user info
    // For now, return null for non-admin tokens
    return null;
}

export async function onRequestGet(context) {
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
            // Return mock data for local development
            return new Response(JSON.stringify({
                success: true,
                users: [
                    {
                        id: '1',
                        email: 'test@example.com',
                        name: 'Test User',
                        created_at: '2024-01-15',
                        total_donations: 5420
                    }
                ]
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get all users with their donation totals
        const users = await env.DB.prepare(`
            SELECT
                u.id,
                u.email,
                u.name,
                u.created_at,
                u.plan,
                COUNT(d.id) as donation_count,
                SUM(d.amount) as total_donations
            FROM users u
            LEFT JOIN donations d ON u.id = d.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `).all();

        return new Response(JSON.stringify({
            success: true,
            users: users.results || []
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to get users: ' + error.message
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
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}