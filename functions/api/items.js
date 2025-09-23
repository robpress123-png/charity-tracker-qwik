/**
 * API endpoints for donation items and categories
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Check if requesting categories or items
  const type = url.searchParams.get('type');
  const categoryId = url.searchParams.get('category_id');

  try {
    if (!env.DB) {
      // Return mock data for local development
      if (type === 'categories') {
        return new Response(JSON.stringify({
          success: true,
          categories: [
            { id: 1, name: "Clothing - Women", icon: "👗" },
            { id: 2, name: "Clothing - Men", icon: "👔" },
            { id: 3, name: "Clothing - Children", icon: "👶" },
            { id: 4, name: "Household Items", icon: "🏠" },
            { id: 5, name: "Electronics", icon: "💻" },
            { id: 6, name: "Furniture", icon: "🛋️" },
            { id: 7, name: "Books & Media", icon: "📚" },
            { id: 8, name: "Sports & Recreation", icon: "⚽" }
          ]
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } else if (categoryId) {
        return new Response(JSON.stringify({
          success: true,
          items: [
            {
              id: 1,
              name: "Dress",
              description: "Women's dress",
              value_poor: 0,   // Not IRS deductible
              value_fair: 0,   // Not IRS deductible
              value_good: 15,
              value_excellent: 25
            },
            {
              id: 2,
              name: "Blouse",
              description: "Women's blouse or shirt",
              value_poor: 0,   // Not IRS deductible
              value_fair: 0,   // Not IRS deductible
              value_good: 7,
              value_excellent: 12
            }
          ]
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // Fetch from database
    if (type === 'categories') {
      try {
        const stmt = env.DB.prepare('SELECT id, name, description, icon FROM item_categories ORDER BY name');
        const result = await stmt.all();

        // If we have results from DB, use them
        if (result && result.results && result.results.length > 0) {
          return new Response(JSON.stringify({
            success: true,
            categories: result.results
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      } catch (dbError) {
        console.log('item_categories table not found or empty, using defaults');
      }

      // Return default categories if DB is empty or table doesn't exist
      return new Response(JSON.stringify({
        success: true,
        categories: [
          { id: 'clothing', name: 'Clothing', icon: '👔' },
          { id: 'electronics', name: 'Electronics', icon: '💻' },
          { id: 'furniture', name: 'Furniture', icon: '🪑' },
          { id: 'books', name: 'Books & Media', icon: '📚' },
          { id: 'toys', name: 'Toys & Games', icon: '🧸' },
          { id: 'sports', name: 'Sports Equipment', icon: '⚽' },
          { id: 'household', name: 'Household Items', icon: '🏠' },
          { id: 'kitchenware', name: 'Kitchenware', icon: '🍳' },
          { id: 'tools', name: 'Tools & Hardware', icon: '🔧' },
          { id: 'art', name: 'Art & Crafts', icon: '🎨' },
          { id: 'musical', name: 'Musical Instruments', icon: '🎵' },
          { id: 'other', name: 'Other Items', icon: '📦' }
        ]
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else if (categoryId) {
      // Query the donation_items table that has the 497 IRS-based valuations
      // This is the original table with value columns
      const stmt = env.DB.prepare(`
        SELECT id, name, description,
               COALESCE(value_poor, 0) as value_poor,
               COALESCE(value_fair, 0) as value_fair,
               COALESCE(value_good, 0) as value_good,
               COALESCE(value_excellent, 0) as value_excellent
        FROM donation_items
        WHERE category_id = ?
        ORDER BY name
      `);
      const result = await stmt.bind(categoryId).all();

      return new Response(JSON.stringify({
        success: true,
        items: result.results || []
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Return all items if no specific request
    const stmt = env.DB.prepare(`
      SELECT di.id, di.name, di.description,
             di.value_poor, di.value_fair, di.value_good, di.value_excellent,
             ic.name as category_name
      FROM donation_items di
      JOIN item_categories ic ON di.category_id = ic.id
      ORDER BY ic.name, di.name
    `);
    const result = await stmt.all();

    return new Response(JSON.stringify({
      success: true,
      items: result.results || []
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error fetching items:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch items: ' + error.message
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
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}