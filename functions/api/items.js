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
              value_poor: 4,
              value_fair: 8,
              value_good: 15,
              value_excellent: 25
            },
            {
              id: 2,
              name: "Blouse",
              description: "Women's blouse or shirt",
              value_poor: 2,
              value_fair: 4,
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
      const stmt = env.DB.prepare('SELECT id, name, description, icon FROM item_categories ORDER BY name');
      const result = await stmt.all();

      return new Response(JSON.stringify({
        success: true,
        categories: result.results || []
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else if (categoryId) {
      const stmt = env.DB.prepare(`
        SELECT id, name, description, value_poor, value_fair, value_good, value_excellent
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
      SELECT di.*, ic.name as category_name
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