/**
 * Cloudflare Pages Function for deleting all charities
 * DELETE /api/charities/delete-all - Delete all charities from database
 */

export async function onRequestDelete(context) {
    const { request, env } = context;

    try {
        // Check authorization
        const token = request.headers.get('Authorization');

        if (!token || !token.startsWith('Bearer ')) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Authorization required'
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
            // Return mock response for local development
            return new Response(JSON.stringify({
                success: true,
                deletedCount: 0,
                message: 'Mock delete (D1 not available locally)'
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get current count before deletion
        const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM charities').first();
        const initialCount = countResult?.count || 0;

        // Delete all charities
        const deleteResult = await env.DB.prepare('DELETE FROM charities').run();

        return new Response(JSON.stringify({
            success: true,
            deletedCount: initialCount,
            message: `Successfully deleted ${initialCount} charities`
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Error deleting charities:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to delete charities: ' + error.message
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
            'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}