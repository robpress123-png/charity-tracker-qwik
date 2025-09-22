/**
 * Cloudflare Pages Function for managing personal charities
 * GET /api/charities/personal - List user's personal charities
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

export async function onRequestGet(context) {
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

        // Get user's personal charities
        const charities = await env.DB.prepare(`
            SELECT
                id,
                name,
                ein,
                category,
                address,
                city,
                state,
                zip_code,
                phone,
                website,
                description,
                is_approved,
                created_at
            FROM user_charities
            WHERE user_id = ?
            ORDER BY created_at DESC
        `).bind(user.id).all();

        // Also get donation counts for each charity
        const charitiesWithStats = await Promise.all(
            (charities.results || []).map(async (charity) => {
                const donationStats = await env.DB.prepare(`
                    SELECT
                        COUNT(*) as donation_count,
                        SUM(amount) as total_donated
                    FROM donations
                    WHERE user_id = ? AND charity_id = ?
                `).bind(user.id, charity.id).first();

                return {
                    ...charity,
                    donation_count: donationStats?.donation_count || 0,
                    total_donated: donationStats?.total_donated || 0
                };
            })
        );

        return new Response(JSON.stringify({
            success: true,
            charities: charitiesWithStats,
            total: charitiesWithStats.length
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Error fetching personal charities:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch personal charities: ' + error.message
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