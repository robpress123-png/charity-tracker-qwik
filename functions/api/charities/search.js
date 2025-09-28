/**
 * Dedicated charity search endpoint
 * GET /api/charities/search?q=term&limit=30
 *
 * Always searches the FULL charity database
 * Returns ranked results (exact match > starts with > contains)
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
        const url = new URL(request.url);
        const searchTerm = url.searchParams.get('q') || url.searchParams.get('search');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '30'), 100); // Cap at 100 for performance

        if (!searchTerm || searchTerm.length < 2) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Search term must be at least 2 characters'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get user for personal charities
        const token = request.headers.get('Authorization');
        const user = getUserFromToken(token);

        // Build search query with ranking
        let query;
        let queryParams;

        const searchLower = searchTerm.toLowerCase();
        const searchPattern = `%${searchLower}%`;
        const startsWithPattern = `${searchLower}%`;

        if (user) {
            // Include both system and personal charities with ranking
            query = `
                SELECT id, name, ein, category, website, description, source,
                       CASE
                         WHEN LOWER(name) = ? THEN 1
                         WHEN LOWER(name) LIKE ? THEN 2
                         WHEN LOWER(name) LIKE ? THEN 3
                         WHEN LOWER(ein) = ? THEN 4
                         ELSE 5
                       END as rank
                FROM (
                    SELECT id, name, ein, category, website, description, 'system' as source
                    FROM charities
                    WHERE LOWER(name) LIKE ?
                       OR LOWER(ein) LIKE ?
                       OR LOWER(category) LIKE ?

                    UNION ALL

                    SELECT id, name, ein, category, website, description, 'personal' as source
                    FROM user_charities
                    WHERE user_id = ?
                      AND (LOWER(name) LIKE ?
                           OR LOWER(ein) LIKE ?
                           OR LOWER(category) LIKE ?)
                )
                ORDER BY rank, name
                LIMIT ?
            `;

            queryParams = [
                searchLower,        // exact match
                startsWithPattern,  // starts with
                searchPattern,      // contains
                searchLower,        // exact EIN match
                searchPattern,      // system charity name search
                searchPattern,      // system charity EIN search
                searchPattern,      // system charity category search
                user.id,            // user ID for personal charities
                searchPattern,      // personal charity name search
                searchPattern,      // personal charity EIN search
                searchPattern,      // personal charity category search
                limit
            ];
        } else {
            // Only system charities
            query = `
                SELECT id, name, ein, category, website, description, 'system' as source,
                       CASE
                         WHEN LOWER(name) = ? THEN 1
                         WHEN LOWER(name) LIKE ? THEN 2
                         WHEN LOWER(name) LIKE ? THEN 3
                         WHEN LOWER(ein) = ? THEN 4
                         ELSE 5
                       END as rank
                FROM charities
                WHERE LOWER(name) LIKE ?
                   OR LOWER(ein) LIKE ?
                   OR LOWER(category) LIKE ?
                ORDER BY rank, name
                LIMIT ?
            `;

            queryParams = [
                searchLower,        // exact match
                startsWithPattern,  // starts with
                searchPattern,      // contains
                searchLower,        // exact EIN match
                searchPattern,      // name search
                searchPattern,      // EIN search
                searchPattern,      // category search
                limit
            ];
        }

        // Execute search
        const stmt = env.DB.prepare(query);
        const results = await stmt.bind(...queryParams).all();

        // Get total count for this search
        let countQuery;
        let countParams;

        if (user) {
            countQuery = `
                SELECT COUNT(*) as total FROM (
                    SELECT id FROM charities
                    WHERE LOWER(name) LIKE ? OR LOWER(ein) LIKE ? OR LOWER(category) LIKE ?
                    UNION ALL
                    SELECT id FROM user_charities
                    WHERE user_id = ? AND (LOWER(name) LIKE ? OR LOWER(ein) LIKE ? OR LOWER(category) LIKE ?)
                )
            `;
            countParams = [
                searchPattern, searchPattern, searchPattern,
                user.id, searchPattern, searchPattern, searchPattern
            ];
        } else {
            countQuery = `
                SELECT COUNT(*) as total FROM charities
                WHERE LOWER(name) LIKE ? OR LOWER(ein) LIKE ? OR LOWER(category) LIKE ?
            `;
            countParams = [searchPattern, searchPattern, searchPattern];
        }

        const countStmt = env.DB.prepare(countQuery);
        const countResult = await countStmt.bind(...countParams).first();

        return new Response(JSON.stringify({
            success: true,
            charities: results.results || [],
            total: countResult?.total || 0,
            displayed: results.results?.length || 0,
            searchTerm: searchTerm
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
            }
        });

    } catch (error) {
        console.error('Search error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Search failed',
            message: error.message
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
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}