export async function onRequestGet(context) {
    const { env } = context;

    try {
        // Check database connection - try different binding names
        const db = env.DB || env['charity-tracker-qwik-db'] || env.DATABASE;

        if (!db) {
            console.error('Database not configured. Available env keys:', Object.keys(env));
            return new Response(JSON.stringify({
                success: false,
                error: 'Database connection not available. Please configure D1 binding in Cloudflare Pages settings.',
                debug: Object.keys(env) // Show available keys for debugging
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Use the found database for all operations
        env.DB = db;

        // Get total users
        const usersResult = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM users'
        ).first();

        // Get total donations amount and count
        const donationsResult = await env.DB.prepare(
            'SELECT COUNT(*) as count, SUM(amount) as total FROM donations'
        ).first();

        // Get active charities count
        const charitiesResult = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM charities'
        ).first();

        // Get database items count
        const itemsResult = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM donation_items WHERE is_active = 1'
        ).first();

        // Get monthly statistics (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        const monthlyDonations = await env.DB.prepare(
            'SELECT COUNT(*) as count, SUM(amount) as total FROM donations WHERE donation_date >= ?'
        ).bind(thirtyDaysAgoStr).first();

        const newUsersMonth = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM users WHERE created_at >= datetime("now", "-30 days")'
        ).first();

        const newCharitiesMonth = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM charities WHERE created_at >= datetime("now", "-30 days")'
        ).first();

        return new Response(JSON.stringify({
            success: true,
            stats: {
                totalUsers: usersResult?.count || 0,
                totalDonations: donationsResult?.total || 0,
                totalDonationCount: donationsResult?.count || 0,
                activeCharities: charitiesResult?.count || 0,
                databaseItems: itemsResult?.count || 0,
                monthlyDonations: monthlyDonations?.total || 0,
                monthlyDonationCount: monthlyDonations?.count || 0,
                newUsersThisMonth: newUsersMonth?.count || 0,
                newCharitiesThisMonth: newCharitiesMonth?.count || 0
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Stats error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}