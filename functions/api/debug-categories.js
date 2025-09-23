export async function onRequest({ env, request }) {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get('id');

  try {
    // Get all categories with their IDs
    const categoriesResult = await env.DB.prepare('SELECT * FROM item_categories ORDER BY id').all();

    // Get distinct categories from items table
    const itemCategoriesResult = await env.DB.prepare('SELECT DISTINCT category, COUNT(*) as count FROM items GROUP BY category ORDER BY category').all();

    let debugInfo = {
      item_categories_table: categoriesResult.results,
      items_table_categories: itemCategoriesResult.results
    };

    // If a specific category ID is provided, show the mapping
    if (categoryId) {
      const catId = parseInt(categoryId);

      // Get category name from item_categories
      const categoryResult = await env.DB.prepare('SELECT * FROM item_categories WHERE id = ?').bind(catId).first();

      // Get items for that category name
      const itemsResult = await env.DB.prepare('SELECT name, category FROM items WHERE category = ? LIMIT 5').bind(categoryResult?.name).all();

      debugInfo.specific_lookup = {
        requested_id: catId,
        category_from_table: categoryResult,
        items_found: itemsResult.results
      };
    }

    return new Response(JSON.stringify(debugInfo, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}