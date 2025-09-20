/**
 * Cloudflare Pages Function for donation operations
 * POST /api/donations - Create a new donation
 * GET /api/donations - List all donations for user
 * GET /api/donations/:id - Get specific donation
 * PUT /api/donations/:id - Update donation
 * DELETE /api/donations/:id - Delete donation
 * GET /api/donations/stats - Get donation statistics
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Parse request body
    const body = await request.json();
    const {
      charity_id,
      amount,
      donation_date,
      notes,
      donation_type = 'cash',
      // Type-specific fields
      miles_driven,
      mileage_rate,
      mileage_purpose,
      item_description,
      estimated_value,
      quantity,
      cost_basis,
      fair_market_value,
      crypto_type
    } = body;

    // For now, use test user ID
    const userId = 'test-user-id';

    if (!charity_id || !amount || !donation_date) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.DB) {
      // Return mock response for local development
      return new Response(JSON.stringify({
        success: true,
        donation: {
          id: 'mock-' + Date.now(),
          user_id: userId,
          charity_id,
          amount,
          donation_date,
          notes,
          donation_type,
          miles_driven,
          mileage_rate,
          mileage_purpose,
          item_description,
          estimated_value,
          quantity,
          cost_basis,
          fair_market_value,
          crypto_type,
          created_at: new Date().toISOString()
        },
        message: 'Donation created (mock mode)'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Insert donation into database
    const stmt = env.DB.prepare(`
      INSERT INTO donations (
        user_id, charity_id, amount, donation_date, notes, donation_type,
        miles_driven, mileage_rate, mileage_purpose,
        item_description, estimated_value,
        quantity, cost_basis, fair_market_value,
        crypto_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      userId, charity_id, amount, donation_date, notes, donation_type,
      miles_driven, mileage_rate, mileage_purpose,
      item_description, estimated_value,
      quantity, cost_basis, fair_market_value,
      crypto_type
    ).run();

    if (result.meta.last_row_id) {
      // Fetch the created donation
      const getDonation = env.DB.prepare('SELECT * FROM donations WHERE id = ?');
      const donation = await getDonation.bind(result.meta.last_row_id).first();

      return new Response(JSON.stringify({
        success: true,
        donation
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    throw new Error('Failed to create donation');

  } catch (error) {
    console.error('Error creating donation:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create donation: ' + error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  
  // For now, use test user ID
  const userId = 'test-user-id';

  try {
    // Check if this is a stats request
    if (url.pathname.endsWith('/stats')) {
      return handleStatsRequest(env, userId);
    }

    // Check if specific donation ID requested
    const pathParts = url.pathname.split('/');
    const donationId = pathParts[pathParts.length - 1];
    if (donationId && donationId !== 'donations') {
      return handleGetDonation(env, donationId, userId);
    }

    // List donations with optional filters
    const year = url.searchParams.get('year');
    const charityId = url.searchParams.get('charity_id');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!env.DB) {
      // Return mock data for local development
      const mockDonations = [
        {
          id: '1',
          charity_id: '1',
          charity_name: 'American Red Cross',
          amount: 100.00,
          donation_date: '2024-01-15',
          notes: 'Monthly donation'
        },
        {
          id: '2',
          charity_id: '2',
          charity_name: 'Doctors Without Borders',
          amount: 250.00,
          donation_date: '2024-02-01',
          notes: 'Quarterly contribution'
        }
      ];

      return new Response(JSON.stringify({
        success: true,
        donations: mockDonations,
        total: mockDonations.length,
        message: 'Using mock data (D1 not available locally)'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Build query with filters
    let query = `
      SELECT d.*, c.name as charity_name, c.ein as charity_ein, c.category as charity_category
      FROM donations d
      LEFT JOIN charities c ON d.charity_id = c.id
      WHERE d.user_id = ?
    `;
    let queryParams = [userId];

    if (year) {
      query += ` AND strftime('%Y', d.donation_date) = ?`;
      queryParams.push(year);
    }

    if (charityId) {
      query += ` AND d.charity_id = ?`;
      queryParams.push(charityId);
    }

    query += ` ORDER BY d.donation_date DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const stmt = env.DB.prepare(query);
    const result = await stmt.bind(...queryParams).all();

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM donations WHERE user_id = ?';
    let countParams = [userId];
    
    if (year) {
      countQuery += ` AND strftime('%Y', donation_date) = ?`;
      countParams.push(year);
    }
    
    if (charityId) {
      countQuery += ` AND charity_id = ?`;
      countParams.push(charityId);
    }

    const countStmt = env.DB.prepare(countQuery);
    const countResult = await countStmt.bind(...countParams).first();

    return new Response(JSON.stringify({
      success: true,
      donations: result.results || [],
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
    console.error('Error fetching donations:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch donations: ' + error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;
  
  try {
    // Extract donation ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const donationId = pathParts[pathParts.length - 1];
    
    if (!donationId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Donation ID required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const {
      amount,
      donation_date,
      notes,
      donation_type = 'cash',
      // Type-specific fields
      miles_driven,
      mileage_rate,
      mileage_purpose,
      item_description,
      estimated_value,
      quantity,
      cost_basis,
      fair_market_value,
      crypto_type
    } = body;
    const userId = 'test-user-id';

    if (!env.DB) {
      // Return mock response for local development
      return new Response(JSON.stringify({
        success: true,
        donation: { id: donationId, ...body },
        message: 'Donation updated (mock mode)'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Update donation
    const stmt = env.DB.prepare(`
      UPDATE donations
      SET amount = ?, donation_date = ?, notes = ?, donation_type = ?,
          miles_driven = ?, mileage_rate = ?, mileage_purpose = ?,
          item_description = ?, estimated_value = ?,
          quantity = ?, cost_basis = ?, fair_market_value = ?,
          crypto_type = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    const result = await stmt.bind(
      amount, donation_date, notes, donation_type,
      miles_driven, mileage_rate, mileage_purpose,
      item_description, estimated_value,
      quantity, cost_basis, fair_market_value,
      crypto_type,
      donationId, userId
    ).run();

    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Donation not found or unauthorized'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch updated donation
    const getDonation = env.DB.prepare('SELECT * FROM donations WHERE id = ?');
    const donation = await getDonation.bind(donationId).first();

    return new Response(JSON.stringify({
      success: true,
      donation
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error updating donation:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update donation: ' + error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  
  try {
    // Extract donation ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const donationId = pathParts[pathParts.length - 1];
    
    if (!donationId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Donation ID required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = 'test-user-id';

    if (!env.DB) {
      // Return mock response for local development
      return new Response(JSON.stringify({
        success: true,
        message: 'Donation deleted (mock mode)'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Delete donation
    const stmt = env.DB.prepare('DELETE FROM donations WHERE id = ? AND user_id = ?');
    const result = await stmt.bind(donationId, userId).run();

    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Donation not found or unauthorized'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Donation deleted successfully'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error deleting donation:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete donation: ' + error.message
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

// Helper function for stats endpoint
async function handleStatsRequest(env, userId) {
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

// Helper function to get specific donation
async function handleGetDonation(env, donationId, userId) {
  if (!env.DB) {
    // Return mock donation
    return new Response(JSON.stringify({
      success: true,
      donation: {
        id: donationId,
        charity_id: '1',
        amount: 100.00,
        donation_date: '2024-01-15',
        notes: 'Mock donation'
      }
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const stmt = env.DB.prepare(`
      SELECT d.*, c.name as charity_name, c.ein as charity_ein 
      FROM donations d
      LEFT JOIN charities c ON d.charity_id = c.id
      WHERE d.id = ? AND d.user_id = ?
    `);
    const donation = await stmt.bind(donationId, userId).first();

    if (!donation) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Donation not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      donation
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error fetching donation:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch donation: ' + error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}