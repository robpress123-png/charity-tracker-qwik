/**
 * Clear all data for a specific user
 * DELETE /api/users/[id]/clear-all-data
 * Removes: donations, donation_items, user_charities, tax settings
 */

export async function onRequestDelete(context) {
    const { params, env, request } = context;
    const userId = params.id;

    try {
        // Check admin authorization
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.includes('admin')) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Admin access required'
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Start a transaction to ensure all deletions happen together
        const results = {
            donation_items: 0,
            donations: 0,
            user_charities: 0
        };

        // 1. Delete donation items first (due to foreign key constraints)
        const itemsResult = await env.DB.prepare(`
            DELETE FROM donation_items
            WHERE donation_id IN (
                SELECT id FROM donations WHERE user_id = ?
            )
        `).bind(userId).run();
        results.donation_items = itemsResult.meta.changes;

        // 2. Delete all donations
        const donationsResult = await env.DB.prepare(
            'DELETE FROM donations WHERE user_id = ?'
        ).bind(userId).run();
        results.donations = donationsResult.meta.changes;

        // 3. Delete user's personal charities
        const charitiesResult = await env.DB.prepare(
            'DELETE FROM user_charities WHERE user_id = ?'
        ).bind(userId).run();
        results.user_charities = charitiesResult.meta.changes;

        // Note: Tax settings are stored in client localStorage, not database

        return new Response(JSON.stringify({
            success: true,
            message: 'All user data cleared successfully',
            results: results
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Error clearing user data:', error);
        return new Response(JSON.stringify({
            success: false,
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

// Handle OPTIONS for CORS
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}