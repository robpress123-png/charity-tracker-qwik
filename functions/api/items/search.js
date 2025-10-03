/**
 * Search endpoint for donation items
 * Searches across all items in the database
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const searchQuery = url.searchParams.get('q') || '';
  const categoryId = url.searchParams.get('category_id');

  if (!searchQuery || searchQuery.length < 2) {
    return new Response(JSON.stringify({
      success: true,
      items: []
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    // Build the query
    let query = `
      SELECT
        i.id,
        i.name,
        i.description,
        i.category_id,
        i.category,
        0 as value_poor,
        0 as value_fair,
        COALESCE(i.value_good, 0) as value_good,
        COALESCE(i.value_very_good, (i.value_good + i.value_excellent) / 2, i.value_good, 0) as value_very_good,
        COALESCE(i.value_excellent, i.value_good, 0) as value_excellent
      FROM items i
      WHERE (LOWER(i.name) LIKE LOWER(?) OR LOWER(i.description) LIKE LOWER(?))
    `;

    const params = [`%${searchQuery}%`, `%${searchQuery}%`];

    // Add category filter if provided
    if (categoryId) {
      query += ' AND i.category_id = ?';
      params.push(parseInt(categoryId));
    }

    query += ' ORDER BY i.name LIMIT 50';

    // Execute the search
    const stmt = env.DB.prepare(query);
    const result = await stmt.bind(...params).all();

    return new Response(JSON.stringify({
      success: true,
      items: result.results || [],
      count: result.results?.length || 0,
      query: searchQuery,
      category_id: categoryId
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Search error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Search failed: ' + error.message,
      items: []
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}