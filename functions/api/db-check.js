export async function onRequestGet(context) {
    const { env } = context;

    if (!env.DB) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Database not connected'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Check what tables exist
        const tablesResult = await env.DB.prepare(`
            SELECT name FROM sqlite_master
            WHERE type='table'
            ORDER BY name
        `).all();

        // Check if specific tables exist
        const tableNames = tablesResult.results.map(t => t.name);

        const requiredTables = {
            users: tableNames.includes('users'),
            charities: tableNames.includes('charities'),
            donations: tableNames.includes('donations'),
            donation_items: tableNames.includes('donation_items'),
            item_categories: tableNames.includes('item_categories')
        };

        // Try to get counts for existing tables
        let counts = {};

        if (requiredTables.users) {
            try {
                const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
                counts.users = userCount.count;
            } catch (e) {
                counts.users = 'error: ' + e.message;
            }
        }

        if (requiredTables.donation_items) {
            try {
                const itemCount = await env.DB.prepare('SELECT COUNT(*) as count FROM donation_items').first();
                counts.donation_items = itemCount.count;
            } catch (e) {
                counts.donation_items = 'error: ' + e.message;
            }
        }

        if (requiredTables.item_categories) {
            try {
                const catCount = await env.DB.prepare('SELECT COUNT(*) as count FROM item_categories').first();
                counts.item_categories = catCount.count;
            } catch (e) {
                counts.item_categories = 'error: ' + e.message;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            existingTables: tableNames,
            requiredTables,
            counts,
            message: tableNames.length === 0 ? 'Database is empty - needs initialization' : 'Database has tables'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}