/**
 * API endpoint to delete all items from the database
 * DANGER: This will permanently delete ALL items
 */

export async function onRequestDelete(context) {
    const { env, request } = context;

    try {
        // Verify admin authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Authentication required'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const token = authHeader.substring(7);

        // Verify this is an admin user (you may want to add additional checks)
        if (!token) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Admin access required'
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get database
        const db = env.DB || env['charity-tracker-qwik-db'] || env.DATABASE;

        if (!db) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Database not configured'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get count before deletion
        let countBefore = 0;
        try {
            const countResult = await db.prepare('SELECT COUNT(*) as count FROM items').first();
            countBefore = countResult?.count || 0;
        } catch (e) {
            console.log('Could not get count, table may not exist');
        }

        // Delete all items
        await db.prepare('DELETE FROM items').run();

        // Reset any auto-increment if needed (SQLite doesn't need this)
        // await db.prepare('DELETE FROM sqlite_sequence WHERE name="items"').run();

        // Log the action
        try {
            await db.prepare(`
                INSERT INTO admin_actions (
                    action_type,
                    description,
                    performed_by,
                    performed_at
                ) VALUES (?, ?, ?, datetime('now'))
            `).bind(
                'DELETE_ALL_ITEMS',
                `Deleted all items (${countBefore} records)`,
                token.split('-')[1] || 'admin',
            ).run();
        } catch (logError) {
            // Logging failed, but continue
            console.log('Could not log action:', logError);
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Successfully deleted ${countBefore} items`,
            deletedCount: countBefore
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Delete all items error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}