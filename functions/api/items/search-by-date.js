/**
 * Search items valid for a specific date
 * GET /api/items/search-by-date?q=television&date=2025-01-15&category=10
 * Returns items that were effective on the given date
 */

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    const searchQuery = url.searchParams.get('q') || '';
    const searchDate = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    const categoryId = url.searchParams.get('category');

    // Check database connection
    const db = env.DB || env['charity-tracker-qwik-db'] || env.DATABASE;

    if (!db) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Database connection not available'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        let query = `
            SELECT DISTINCT
                i1.id, i1.name, i1.category_id, i1.category, i1.item_variant,
                i1.value_good, i1.value_very_good, i1.value_excellent,
                i1.description, i1.source_reference, i1.effective_date
            FROM items i1
            WHERE i1.effective_date = (
                SELECT MAX(i2.effective_date)
                FROM items i2
                WHERE i2.name = i1.name
                    AND i2.category_id = i1.category_id
                    AND COALESCE(i2.item_variant, '') = COALESCE(i1.item_variant, '')
                    AND i2.effective_date <= ?
            )
        `;

        const params = [searchDate];

        // Add search filter if provided
        if (searchQuery) {
            query += ` AND (
                LOWER(i1.name) LIKE LOWER(?) OR
                LOWER(i1.description) LIKE LOWER(?) OR
                LOWER(i1.search_keywords) LIKE LOWER(?)
            )`;
            const searchPattern = `%${searchQuery}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        // Add category filter if provided
        if (categoryId) {
            query += ` AND i1.category_id = ?`;
            params.push(parseInt(categoryId));
        }

        query += ` ORDER BY i1.name LIMIT 100`;

        const results = await db.prepare(query).bind(...params).all();

        // Add a note about which valuation date is being used
        const valuationInfo = {
            searchDate: searchDate,
            searchYear: new Date(searchDate).getFullYear(),
            itemsFound: results.results?.length || 0,
            note: `Showing item values effective as of ${searchDate}`
        };

        return new Response(JSON.stringify({
            success: true,
            items: results.results || [],
            valuationInfo
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Search error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}