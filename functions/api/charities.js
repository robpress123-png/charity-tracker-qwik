/**
 * Cloudflare Pages Function for charity operations
 * GET /api/charities - List all charities
 * GET /api/charities?search=term - Search charities
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
    // Get user from authorization header
    const token = request.headers.get('Authorization');
    const user = getUserFromToken(token);

    // For charity listing, authentication is optional
    // If authenticated, show user's charities
    // If not authenticated, show global charities (for landing page)

    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const withDonations = url.searchParams.get('with_donations') === 'true';

    // Check if D1 database is available
    if (!env.DB) {
      // Return mock data for local development
      const mockCharities = [
        {
          id: '1',
          name: 'American Red Cross',
          ein: '53-0196605',
          category: 'Human Services',
          description: 'Humanitarian organization with annual revenue of $3.8B'
        },
        {
          id: '2',
          name: 'Doctors Without Borders',
          ein: '13-3433452',
          category: 'Health',
          description: 'Medical humanitarian organization with annual revenue of $2.1B'
        },
        {
          id: '3',
          name: 'World Wildlife Fund',
          ein: '52-1693387',
          category: 'Environment',
          description: 'Wildlife conservation organization with annual revenue of $380M'
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

    if (withDonations) {
      // Only get charities that have donations for this user
      if (!user) {
        // If not authenticated but requesting with_donations, return empty
        return new Response(JSON.stringify({
          success: true,
          charities: [],
          total: 0,
          message: 'Authentication required for user-specific charities'
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      if (searchTerm) {
        query = `
          SELECT DISTINCT c.id, c.name, c.ein, c.category, c.website, c.description
          FROM charities c
          INNER JOIN donations d ON c.id = d.charity_id
          WHERE d.user_id = ? AND (c.name LIKE ? OR c.ein LIKE ? OR c.category LIKE ?)
          ORDER BY c.name
          LIMIT ? OFFSET ?
        `;
        const searchPattern = `%${searchTerm}%`;
        queryParams = [user.id, searchPattern, searchPattern, searchPattern, limit, offset];
      } else {
        query = `
          SELECT DISTINCT c.id, c.name, c.ein, c.category, c.website, c.description
          FROM charities c
          INNER JOIN donations d ON c.id = d.charity_id
          WHERE d.user_id = ?
          ORDER BY c.name
          LIMIT ? OFFSET ?
        `;
        queryParams = [user.id, limit, offset];
      }
    } else {
      // Get all charities (existing logic)
      if (searchTerm) {
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
        query = `
          SELECT id, name, ein, category, website, description
          FROM charities
          ORDER BY name
          LIMIT ? OFFSET ?
        `;
        queryParams = [limit, offset];
      }
    }

    // Execute query
    const stmt = env.DB.prepare(query);
    const result = await stmt.bind(...queryParams).all();

    // Get total count for pagination
    let countQuery;
    let countParams = [];

    if (withDonations) {
      // Count must also filter by user_id
      countQuery = searchTerm
        ? 'SELECT COUNT(DISTINCT c.id) as total FROM charities c INNER JOIN donations d ON c.id = d.charity_id WHERE d.user_id = ? AND (c.name LIKE ? OR c.ein LIKE ? OR c.category LIKE ?)'
        : 'SELECT COUNT(DISTINCT c.id) as total FROM charities c INNER JOIN donations d ON c.id = d.charity_id WHERE d.user_id = ?';

      if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        countParams = [user.id, searchPattern, searchPattern, searchPattern];
      } else {
        countParams = [user.id];
      }
    } else {
      countQuery = searchTerm
        ? 'SELECT COUNT(*) as total FROM charities WHERE name LIKE ? OR ein LIKE ? OR category LIKE ?'
        : 'SELECT COUNT(*) as total FROM charities';

      if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        countParams = [searchPattern, searchPattern, searchPattern];
      }
    }

    const countStmt = env.DB.prepare(countQuery);
    const countResult = countParams.length > 0
      ? await countStmt.bind(...countParams).first()
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