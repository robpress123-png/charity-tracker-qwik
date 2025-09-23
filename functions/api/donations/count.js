/**
 * Get total count of donations
 * GET /api/donations/count
 */

export async function onRequestGet(context) {
    const { env } = context;

    try {
        // Check if D1 database is available
        if (!env.DB) {
            return new Response(JSON.stringify({
                success: true,
                count: 0,
                message: 'Database not available'
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get total donation count
        const result = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM donations'
        ).first();

        return new Response(JSON.stringify({
            success: true,
            count: result?.count || 0
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Count donations error:', error);
        return new Response(JSON.stringify({
            success: false,
            count: 0,
            error: error.message
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