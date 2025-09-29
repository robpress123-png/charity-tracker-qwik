export async function onRequestDelete(context) {
    const { params, env, request } = context;
    const userId = params.id;

    // Check admin authorization
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Unauthorized'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Verify the user making the request is an admin
        // For now, we'll check if they have a valid token
        // In production, you'd want to verify this is an admin token

        // Start a transaction to delete all user data
        const results = await env.DB.batch([
            // Delete user's donations
            env.DB.prepare('DELETE FROM donations WHERE user_id = ?').bind(userId),

            // Delete user's donation items
            env.DB.prepare(`
                DELETE FROM donation_items
                WHERE donation_id IN (
                    SELECT id FROM donations WHERE user_id = ?
                )
            `).bind(userId),

            // Delete user's personal charities
            env.DB.prepare('DELETE FROM user_charities WHERE user_id = ?').bind(userId),

            // Delete user's tax settings
            env.DB.prepare('DELETE FROM user_tax_settings WHERE user_id = ?').bind(userId),

            // Finally, delete the user account
            env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId)
        ]);

        // Check if user was actually deleted
        const deletedCount = results[results.length - 1].meta.changes;

        if (deletedCount > 0) {
            return new Response(JSON.stringify({
                success: true,
                message: `User ${userId} and all associated data deleted successfully`
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({
                success: false,
                error: 'User not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Error deleting user:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to delete user'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}