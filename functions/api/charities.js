/**
 * Cloudflare Pages Function for charity operations
 * GET /api/charities - List all charities
 * GET /api/charities?search=term - Search charities
 */

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Check if D1 database is available
    if (!env.DB) {
      // Return mock data for local development
      const mockCharities = [
        {
          id: '1',
          name: 'American Red Cross',
          ein: '53-0196605',
          category: 'Human Services',
          description: 'Humanitarian organization providing emergency assistance'
        },
        {
          id: '2',
          name: 'Doctors Without Borders',
          ein: '13-3433452',
          category: 'Health',
          description: 'Medical humanitarian organization'
        },
        {
          id: '3',
          name: 'World Wildlife Fund',
          ein: '52-1693387',
          category: 'Environment',
          description: 'Wildlife conservation organization'
        }
      ];

      return new Response(JSON.stringify({
        success: true,
        charities: mockCharities,
        total: mockCharities.length,
        message: 'Using mock data (D1 not available locally)'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    let query;
    let queryParams = [];

    if (searchTerm) {
      // Search in name, EIN, and category
      query = `
        SELECT id, name, ein, category, website, description
        FROM charities
        WHERE name LIKE ? OR ein LIKE ? OR category LIKE ?
        ORDER BY name
        LIMIT ? OFFSET ?
      `;
      const searchPattern = `%${searchTerm}%`;
      queryParams = [searchPattern, searchPattern, searchPattern, limit, offset];
    } else {
      // Get all charities
      query = `
        SELECT id, name, ein, category, website, description
        FROM charities
        ORDER BY name
        LIMIT ? OFFSET ?
      `;
      queryParams = [limit, offset];
    }

    // Execute query
    const stmt = env.DB.prepare(query);
    const result = await stmt.bind(...queryParams).all();

    // Get total count for pagination
    let countQuery = searchTerm
      ? 'SELECT COUNT(*) as total FROM charities WHERE name LIKE ? OR ein LIKE ? OR category LIKE ?'
      : 'SELECT COUNT(*) as total FROM charities';

    const countStmt = env.DB.prepare(countQuery);
    const countResult = searchTerm
      ? await countStmt.bind(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`).first()
      : await countStmt.first();

    return new Response(JSON.stringify({
      success: true,
      charities: result.results || [],
      total: countResult?.total || 0,
      limit,
      offset
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error fetching charities:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch charities: ' + error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle preflight requests
export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}