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

    // Get user ID from session or header
    const authHeader = request.headers.get('Authorization');
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // Parse the token to get user ID
        // Token format is "token-{userId}-{timestamp}" from login.js
        if (token.startsWith('token-')) {
            const parts = token.split('-');
            if (parts.length >= 2) {
                userId = parts[1]; // Extract the user ID from token
            }
        } else if (token === 'test-token') {
            // For test token, we need to look up the test user
            const testUserStmt = env.DB.prepare("SELECT id FROM users WHERE email = 'test@example.com'");
            const testUser = await testUserStmt.first();
            if (testUser) {
                userId = testUser.id;
            }
        }
    }

    if (!userId) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Unauthorized - invalid or missing token'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

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

    // First check if this is a personal charity
    console.log('[DEBUG] Checking charity type for ID:', charity_id);

    const personalCharityCheck = env.DB.prepare(
      'SELECT id FROM user_charities WHERE id = ? AND user_id = ?'
    );
    const isPersonalCharity = await personalCharityCheck.bind(charity_id, userId).first();

    if (!isPersonalCharity) {
      // Check if it's a system charity
      const systemCharityCheck = env.DB.prepare('SELECT id FROM charities WHERE id = ?');
      const isSystemCharity = await systemCharityCheck.bind(charity_id).first();

      if (!isSystemCharity) {
        console.error('[DEBUG] Charity not found:', charity_id);
        return new Response(JSON.stringify({
          success: false,
          error: 'Charity not found. Please select a valid charity.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    console.log('[DEBUG] Charity verified, type:', isPersonalCharity ? 'personal' : 'system');

    // Insert donation into database
    // Since the table doesn't have a donation_type column, we'll store it in notes as JSON
    const notesData = {
      donation_type: donation_type || 'cash',
      miles_driven,
      mileage_rate,
      mileage_purpose,
      item_description,
      estimated_value,
      stock_name: body.stock_name,
      stock_symbol: body.stock_symbol,
      shares_donated: body.shares_donated,
      crypto_name: body.crypto_name,
      crypto_symbol: body.crypto_symbol,
      crypto_quantity: body.crypto_quantity,
      crypto_price_per_unit: body.crypto_price_per_unit,
      crypto_exchange: body.crypto_exchange,
      crypto_cost_basis: body.crypto_cost_basis,
      crypto_holding_period: body.crypto_holding_period,
      crypto_donation_datetime: body.crypto_donation_datetime,
      notes: notes || ''
    };

    // We need to temporarily disable foreign key constraints for personal charities
    if (isPersonalCharity) {
      console.log('[DEBUG] Inserting donation for personal charity');
      // For personal charities, we'll use a different approach
      // Store the charity_id but without the foreign key constraint
      const stmt = env.DB.prepare(`
        INSERT INTO donations (
          user_id, charity_id, amount, date, notes
        )
        VALUES (?, ?, ?, ?, ?)
      `);

      try {
        // Try with PRAGMA to disable foreign keys temporarily
        await env.DB.prepare('PRAGMA foreign_keys = OFF').run();
        const result = await stmt.bind(
          userId, charity_id, amount, donation_date, JSON.stringify(notesData)
        ).run();
        await env.DB.prepare('PRAGMA foreign_keys = ON').run();

        if (result.meta.last_row_id) {
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
      } catch (error) {
        console.error('[DEBUG] Error inserting with PRAGMA:', error);
        await env.DB.prepare('PRAGMA foreign_keys = ON').run();
        throw error;
      }
    } else {
      // For system charities, normal insert
      const stmt = env.DB.prepare(`
        INSERT INTO donations (
          user_id, charity_id, amount, date, notes
        )
        VALUES (?, ?, ?, ?, ?)
      `);

      const result = await stmt.bind(
        userId, charity_id, amount, donation_date, JSON.stringify(notesData)
      ).run();

      if (result.meta.last_row_id) {
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

  // Get user ID from authorization header
  const authHeader = request.headers.get('Authorization');
  let userId = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token.startsWith('token-')) {
          const parts = token.split('-');
          if (parts.length >= 2) {
              userId = parts[1];
          }
      } else if (token === 'test-token' && env.DB) {
          const testUserStmt = env.DB.prepare("SELECT id FROM users WHERE email = 'test@example.com'");
          const testUser = await testUserStmt.first();
          if (testUser) {
              userId = testUser.id;
          }
      }
  }

  // Default to test for backwards compatibility if no auth
  if (!userId) {
      userId = 'test-user-id';
  }

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

    // Build query with filters (using 'date' column, not 'donation_date')
    // Join with both system charities and user's personal charities
    let query = `
      SELECT d.*,
        COALESCE(c.name, uc.name) as charity_name,
        COALESCE(c.ein, uc.ein) as charity_ein,
        COALESCE(c.category, uc.category) as charity_category,
        CASE
          WHEN c.id IS NOT NULL THEN 'system'
          WHEN uc.id IS NOT NULL THEN 'personal'
          ELSE NULL
        END as charity_source
      FROM donations d
      LEFT JOIN charities c ON d.charity_id = c.id
      LEFT JOIN user_charities uc ON d.charity_id = uc.id AND uc.user_id = d.user_id
      WHERE d.user_id = ?
    `;
    let queryParams = [userId];

    if (year) {
      query += ` AND strftime('%Y', d.date) = ?`;
      queryParams.push(year);
    }

    if (charityId) {
      query += ` AND d.charity_id = ?`;
      queryParams.push(charityId);
    }

    query += ` ORDER BY d.date DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const stmt = env.DB.prepare(query);
    const result = await stmt.bind(...queryParams).all();

    // Parse notes JSON to extract donation_type and other fields
    const donations = (result.results || []).map(donation => {
      let parsedNotes = {};
      let isJsonNotes = false;

      try {
        if (donation.notes && donation.notes.startsWith('{')) {
          parsedNotes = JSON.parse(donation.notes);
          isJsonNotes = true;
        }
      } catch (e) {
        // If notes is not JSON, treat it as plain text
        parsedNotes = { notes: donation.notes };
      }

      // Extract the actual notes text
      let notesText = '';
      if (isJsonNotes) {
        // If it was JSON, use the notes field from the parsed object
        notesText = parsedNotes.notes || '';
      } else {
        // If it wasn't JSON, use the raw notes field
        notesText = donation.notes || '';
      }

      return {
        ...donation,
        donation_type: parsedNotes.donation_type || 'cash',
        miles_driven: parsedNotes.miles_driven,
        mileage_rate: parsedNotes.mileage_rate,
        mileage_purpose: parsedNotes.mileage_purpose,
        item_description: parsedNotes.item_description,
        estimated_value: parsedNotes.estimated_value,
        stock_name: parsedNotes.stock_name,
        stock_symbol: parsedNotes.stock_symbol,
        shares_donated: parsedNotes.shares_donated,
        crypto_name: parsedNotes.crypto_name,
        crypto_symbol: parsedNotes.crypto_symbol,
        crypto_quantity: parsedNotes.crypto_quantity,
        crypto_price_per_unit: parsedNotes.crypto_price_per_unit,
        crypto_exchange: parsedNotes.crypto_exchange,
        crypto_cost_basis: parsedNotes.crypto_cost_basis,
        crypto_holding_period: parsedNotes.crypto_holding_period,
        crypto_donation_datetime: parsedNotes.crypto_donation_datetime,
        notes: notesText,
        // Rename 'date' to 'donation_date' for consistency
        donation_date: donation.date
      };
    });

    // Get total count (using 'date' column)
    let countQuery = 'SELECT COUNT(*) as total FROM donations WHERE user_id = ?';
    let countParams = [userId];

    if (year) {
      countQuery += ` AND strftime('%Y', date) = ?`;
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
      donations: donations,
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

    // Get user ID from authorization header
    const authHeader = request.headers.get('Authorization');
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token.startsWith('token-')) {
            const parts = token.split('-');
            if (parts.length >= 2) {
                userId = parts[1];
            }
        } else if (token === 'test-token' && env.DB) {
            const testUserStmt = env.DB.prepare("SELECT id FROM users WHERE email = 'test@example.com'");
            const testUser = await testUserStmt.first();
            if (testUser) {
                userId = testUser.id;
            }
        }
    }

    if (!userId) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Unauthorized - invalid or missing token'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

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

    // Update donation (using simple schema columns)
    const stmt = env.DB.prepare(`
      UPDATE donations
      SET amount = ?, date = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `);

    const result = await stmt.bind(
      amount, donation_date, notes || '',
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
    
    // Get current year total (using 'date' column)
    const yearStmt = env.DB.prepare(`
      SELECT SUM(amount) as total
      FROM donations
      WHERE user_id = ? AND strftime('%Y', date) = ?
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
    // Join with both system charities and user's personal charities
    const stmt = env.DB.prepare(`
      SELECT d.*,
        COALESCE(c.name, uc.name) as charity_name,
        COALESCE(c.ein, uc.ein) as charity_ein,
        CASE
          WHEN c.id IS NOT NULL THEN 'system'
          WHEN uc.id IS NOT NULL THEN 'personal'
          ELSE NULL
        END as charity_source
      FROM donations d
      LEFT JOIN charities c ON d.charity_id = c.id
      LEFT JOIN user_charities uc ON d.charity_id = uc.id AND uc.user_id = d.user_id
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