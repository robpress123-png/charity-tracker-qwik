/**
 * Export all donations as JSON
 * GET /api/donations/export-all
 * Admin only endpoint
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
            return new Response(JSON.stringify({
                success: true,
                donations: [],
                message: 'Database not available'
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get all donations with related data
        const donations = await env.DB.prepare(`
            SELECT
                d.*,
                c.name as charity_name,
                c.ein as charity_ein,
                u.email as user_email,
                u.name as user_name
            FROM donations d
            LEFT JOIN charities c ON d.charity_id = c.id
            LEFT JOIN users u ON d.user_id = u.id
            ORDER BY d.date DESC
        `).all();

        // Get donation items for items type donations
        const donationsList = donations.results || [];

        // For each donation of type 'items', get the items
        for (let donation of donationsList) {
            if (donation.type === 'items') {
                const items = await env.DB.prepare(`
                    SELECT * FROM donation_items
                    WHERE donation_id = ?
                `).bind(donation.id).all();

                donation.items = items.results || [];
            }
        }

        return new Response(JSON.stringify({
            success: true,
            donations: donationsList,
            count: donationsList.length,
            exportDate: new Date().toISOString()
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Export donations error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to export donations: ' + error.message
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