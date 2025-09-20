/**
 * Cloudflare Pages Function for donation statistics
 * GET /api/donations/stats - Get donation statistics
 */

export async function onRequestGet(context) {
  const { env } = context;

  // For now, use test user ID
  const userId = 'test-user-id';

  if (!env.DB) {
    // Return mock stats for local development
    return new Response(JSON.stringify({
      success: true,
      stats: {
        total_donations: 350.00,
        charity_count: 2,
        year_total: 350.00,
        current_year: new Date().getFullYear()
      },
      message: 'Using mock data (D1 not available locally)'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const currentYear = new Date().getFullYear();

    // Get total donations
    const totalStmt = env.DB.prepare('SELECT SUM(amount) as total FROM donations WHERE user_id = ?');
    const totalResult = await totalStmt.bind(userId).first();

    // Get charity count
    const charityStmt = env.DB.prepare('SELECT COUNT(DISTINCT charity_id) as count FROM donations WHERE user_id = ?');
    const charityResult = await charityStmt.bind(userId).first();

    // Get current year total
    const yearStmt = env.DB.prepare(`
      SELECT SUM(amount) as total
      FROM donations
      WHERE user_id = ? AND strftime('%Y', donation_date) = ?
    `);
    const yearResult = await yearStmt.bind(userId, currentYear.toString()).first();

    return new Response(JSON.stringify({
      success: true,
      stats: {
        total_donations: totalResult?.total || 0,
        charity_count: charityResult?.count || 0,
        year_total: yearResult?.total || 0,
        current_year: currentYear
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch statistics: ' + error.message
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
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}