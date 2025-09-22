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

        // Get database items count - try with is_active first, fallback to without
        let itemsResult;
        try {
            itemsResult = await env.DB.prepare(
                'SELECT COUNT(*) as count FROM donation_items WHERE is_active = 1'
            ).first();
        } catch (e) {
            // Fallback if is_active column doesn't exist
            itemsResult = await env.DB.prepare(
                'SELECT COUNT(*) as count FROM donation_items'
            ).first();
        }

        // Get monthly statistics - simplified queries
        let monthlyDonations = { count: 0, total: 0 };
        let newUsersMonth = { count: 0 };
        let newCharitiesMonth = { count: 0 };

        try {
            // Get donations from the current month
            const now = new Date();
            const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
            const currentYear = now.getFullYear();
            const monthPattern = `${currentYear}-${currentMonth}-%`;

            monthlyDonations = await env.DB.prepare(
                'SELECT COUNT(*) as count, SUM(amount) as total FROM donations WHERE date LIKE ?'
            ).bind(monthPattern).first();
        } catch (e) {
            console.log('Monthly donations query failed:', e);
        }

        try {
            // Note: users table might not have created_at column
            newUsersMonth = await env.DB.prepare(
                'SELECT COUNT(*) as count FROM users'
            ).first();
        } catch (e) {
            console.log('New users query failed:', e);
        }

        try {
            // Note: charities table might not have created_at column
            newCharitiesMonth = await env.DB.prepare(
                'SELECT COUNT(*) as count FROM charities'
            ).first();
        } catch (e) {
            console.log('New charities query failed:', e);
        }

        // Get donations by year
        let yearlyDonations = [];
        try {
            const yearlyResult = await env.DB.prepare(`
                SELECT
                    strftime('%Y', date) as year,
                    COUNT(*) as count,
                    SUM(amount) as total
                FROM donations
                GROUP BY strftime('%Y', date)
                ORDER BY year DESC
                LIMIT 10
            `).all();

            if (yearlyResult && yearlyResult.results) {
                yearlyDonations = yearlyResult.results.map(row => ({
                    year: row.year || new Date().getFullYear(),
                    count: row.count || 0,
                    total: row.total || 0
                }));
            }
        } catch (e) {
            console.log('Yearly donations query failed:', e);
            // If no donations exist yet, show current year with 0
            const currentYear = new Date().getFullYear();
            yearlyDonations = [{
                year: currentYear,
                count: 0,
                total: 0
            }];
        }

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
                newCharitiesThisMonth: newCharitiesMonth?.count || 0,
                yearlyDonations: yearlyDonations
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