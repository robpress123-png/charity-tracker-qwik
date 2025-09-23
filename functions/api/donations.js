/**
 * Cloudflare Pages Function for donation operations - v2.0.0
 * Supports proper relational donation_items table
 * POST /api/donations - Create a new donation (with items support)
 * GET /api/donations - List all donations for user
 * GET /api/donations/:id - Get specific donation (includes items)
 * PUT /api/donations/:id - Update donation (with items support)
 * DELETE /api/donations/:id - Delete donation (cascades to items)
 * GET /api/donations/stats - Get donation statistics
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Parse request body
    const body = await request.json();
    const {
      charity_id,
      user_charity_id,
      amount,
      donation_date,
      notes,
      donation_type = 'cash',
      // Type-specific fields
      miles_driven,
      mileage_rate,
      mileage_purpose,
      // Stock fields
      stock_name,
      stock_symbol,
      shares_donated,
      cost_basis,
      fair_market_value,
      // Crypto fields
      crypto_name,
      crypto_symbol,
      crypto_quantity,
      crypto_price_per_unit,
      crypto_exchange,
      crypto_cost_basis,
      crypto_holding_period,
      crypto_donation_datetime,
      // Items array for items donations
      items
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

    // Validate required fields
    if ((!charity_id && !user_charity_id) || !amount || !donation_date) {
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
          user_charity_id,
          amount,
          donation_date,
          donation_type,
          notes,
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

    // Determine which charity field to use
    let systemCharityId = null;
    let personalCharityId = null;

    if (user_charity_id) {
      // Verify personal charity belongs to user
      const personalCharityCheck = env.DB.prepare(
        'SELECT id FROM user_charities WHERE id = ? AND user_id = ?'
      );
      const isPersonalCharity = await personalCharityCheck.bind(user_charity_id, userId).first();

      if (!isPersonalCharity) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Personal charity not found or does not belong to user'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      personalCharityId = user_charity_id;
    } else if (charity_id) {
      // Verify system charity exists
      const systemCharityCheck = env.DB.prepare('SELECT id FROM charities WHERE id = ?');
      const isSystemCharity = await systemCharityCheck.bind(charity_id).first();

      if (!isSystemCharity) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Charity not found'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      systemCharityId = charity_id;
    }

    // Notes is now just user-entered text

    // Generate donation ID
    const donationId = crypto.randomUUID();

    // Insert main donation record with proper columns
    const stmt = env.DB.prepare(`
      INSERT INTO donations (
        id, user_id, charity_id, user_charity_id, donation_type, amount, date, notes,
        miles_driven, mileage_rate, mileage_purpose,
        item_description, estimated_value,
        stock_symbol, stock_quantity, fair_market_value,
        crypto_symbol, crypto_quantity, crypto_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      donationId,
      userId,
      systemCharityId,  // Will be NULL for personal charities
      personalCharityId, // Will be NULL for system charities
      donation_type,
      amount,
      donation_date,
      notes || '',  // Just the actual user notes, not JSON
      miles_driven || null,
      mileage_rate || null,
      mileage_purpose || null,
      item_description || null,
      estimated_value || null,
      stock_symbol || null,
      stock_quantity || null,
      fair_market_value || null,
      crypto_symbol || null,
      crypto_quantity || null,
      crypto_type || null
    ).run();

    // If this is an items donation, insert the items
    if (donation_type === 'items' && items && Array.isArray(items)) {
      const itemStmt = env.DB.prepare(`
        INSERT INTO donation_items (
          donation_id, item_name, category, condition, quantity, unit_value, total_value
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        await itemStmt.bind(
          donationId,
          item.item_name || item.name,
          item.category,
          item.condition,
          item.quantity || 1,
          item.unit_value || item.value,
          item.total_value || (item.quantity || 1) * (item.unit_value || item.value || 0)
        ).run();
      }
    }

    // Fetch the complete donation with items
    let donation = await getDonationWithItems(env, donationId);

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
    const limit = parseInt(url.searchParams.get('limit') || '10000');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!env.DB) {
      // Return mock data for local development
      return new Response(JSON.stringify({
        success: true,
        donations: [],
        total: 0,
        message: 'Using mock data (D1 not available locally)'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Build query with LEFT JOINs to get charity names
    let query = `
      SELECT
        d.id,
        d.user_id,
        d.charity_id,
        d.user_charity_id,
        d.donation_type,
        d.amount,
        d.date as donation_date,
        d.notes,
        d.receipt_url,
        d.created_at,
        d.miles_driven,
        d.mileage_rate,
        d.mileage_purpose,
        d.item_description,
        d.estimated_value,
        d.stock_symbol,
        d.stock_quantity,
        d.fair_market_value,
        d.crypto_symbol,
        d.crypto_quantity,
        d.crypto_type,
        COALESCE(c.name, uc.name) as charity_name,
        COALESCE(c.ein, uc.ein) as charity_ein,
        COALESCE(c.category, uc.category) as charity_category,
        CASE
          WHEN d.charity_id IS NOT NULL THEN 'system'
          WHEN d.user_charity_id IS NOT NULL THEN 'personal'
          ELSE 'unknown'
        END as charity_type
      FROM donations d
      LEFT JOIN charities c ON d.charity_id = c.id
      LEFT JOIN user_charities uc ON d.user_charity_id = uc.id
      WHERE d.user_id = ?
    `;

    const params = [userId];

    // Add optional filters
    if (year) {
      query += ` AND strftime('%Y', d.date) = ?`;
      params.push(year);
    }

    if (charityId) {
      query += ` AND (d.charity_id = ? OR d.user_charity_id = ?)`;
      params.push(charityId, charityId);
    }

    query += ` ORDER BY d.date DESC, d.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const stmt = env.DB.prepare(query);
    const result = await stmt.bind(...params).all();

    // For items donations, fetch the items
    const donationsWithItems = await Promise.all(result.results.map(async (donation) => {
      if (donation.donation_type === 'items') {
        const itemsStmt = env.DB.prepare(
          'SELECT * FROM donation_items WHERE donation_id = ?'
        );
        const itemsResult = await itemsStmt.bind(donation.id).all();
        donation.items = itemsResult.results || [];
      }
      return donation;
    }));

    return new Response(JSON.stringify({
      success: true,
      donations: donationsWithItems,
      total: donationsWithItems.length
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
  const { request, env, params } = context;

  try {
    // Get donation ID from URL
    const pathParts = new URL(request.url).pathname.split('/');
    const donationId = pathParts[pathParts.length - 1];

    if (!donationId || donationId === 'donations') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Donation ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json();
    const {
      charity_id,
      user_charity_id,
      amount,
      donation_date,
      donation_type,
      notes,
      items,
      // Other type-specific fields...
      miles_driven,
      mileage_rate,
      mileage_purpose,
      stock_name,
      stock_symbol,
      shares_donated,
      cost_basis,
      fair_market_value,
      crypto_name,
      crypto_symbol,
      crypto_quantity,
      crypto_price_per_unit,
      crypto_exchange,
      crypto_cost_basis,
      crypto_holding_period,
      crypto_donation_datetime
    } = body;

    // Get user ID from authorization
    const authHeader = request.headers.get('Authorization');
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token.startsWith('token-')) {
            const parts = token.split('-');
            if (parts.length >= 2) {
                userId = parts[1];
            }
        }
    }

    if (!userId) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Unauthorized'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Donation updated (mock mode)'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Verify the donation belongs to the user
    const checkStmt = env.DB.prepare('SELECT id FROM donations WHERE id = ? AND user_id = ?');
    const exists = await checkStmt.bind(donationId, userId).first();

    if (!exists) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Donation not found or unauthorized'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Determine which charity field to use
    let systemCharityId = null;
    let personalCharityId = null;

    if (user_charity_id) {
      personalCharityId = user_charity_id;
    } else if (charity_id) {
      systemCharityId = charity_id;
    }

    // Notes is now just user-entered text

    // Update the donation with proper columns
    const updateStmt = env.DB.prepare(`
      UPDATE donations
      SET charity_id = ?,
          user_charity_id = ?,
          donation_type = ?,
          amount = ?,
          date = ?,
          notes = ?,
          miles_driven = ?,
          mileage_rate = ?,
          mileage_purpose = ?,
          item_description = ?,
          estimated_value = ?,
          stock_symbol = ?,
          stock_quantity = ?,
          fair_market_value = ?,
          crypto_symbol = ?,
          crypto_quantity = ?,
          crypto_type = ?
      WHERE id = ? AND user_id = ?
    `);

    await updateStmt.bind(
      systemCharityId,
      personalCharityId,
      donation_type,
      amount,
      donation_date,
      notes || '',  // Just the actual user notes, not JSON
      miles_driven || null,
      mileage_rate || null,
      mileage_purpose || null,
      item_description || null,
      estimated_value || null,
      stock_symbol || null,
      stock_quantity || null,
      fair_market_value || null,
      crypto_symbol || null,
      crypto_quantity || null,
      crypto_type || null,
      donationId,
      userId
    ).run();

    // Handle items for items donations
    if (donation_type === 'items') {
      // Delete existing items
      const deleteItemsStmt = env.DB.prepare('DELETE FROM donation_items WHERE donation_id = ?');
      await deleteItemsStmt.bind(donationId).run();

      // Insert new items
      if (items && Array.isArray(items)) {
        const itemStmt = env.DB.prepare(`
          INSERT INTO donation_items (
            donation_id, item_name, category, condition, quantity, unit_value, total_value
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of items) {
          await itemStmt.bind(
            donationId,
            item.item_name || item.name,
            item.category,
            item.condition,
            item.quantity || 1,
            item.unit_value || item.value,
            item.total_value || (item.quantity || 1) * (item.unit_value || item.value || 0)
          ).run();
        }
      }
    }

    // Fetch updated donation with items
    const donation = await getDonationWithItems(env, donationId);

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
    // Get donation ID from URL
    const pathParts = new URL(request.url).pathname.split('/');
    const donationId = pathParts[pathParts.length - 1];

    if (!donationId || donationId === 'donations') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Donation ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user ID from authorization
    const authHeader = request.headers.get('Authorization');
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token.startsWith('token-')) {
            const parts = token.split('-');
            if (parts.length >= 2) {
                userId = parts[1];
            }
        }
    }

    if (!userId) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Unauthorized'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!env.DB) {
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

    // Delete the donation (items will cascade delete due to foreign key)
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

// Helper function to get donation with items
async function getDonationWithItems(env, donationId) {
  const donationStmt = env.DB.prepare(`
    SELECT
      d.*,
      COALESCE(c.name, uc.name) as charity_name,
      COALESCE(c.ein, uc.ein) as charity_ein,
      COALESCE(c.category, uc.category) as charity_category
    FROM donations d
    LEFT JOIN charities c ON d.charity_id = c.id
    LEFT JOIN user_charities uc ON d.user_charity_id = uc.id
    WHERE d.id = ?
  `);

  const donation = await donationStmt.bind(donationId).first();

  if (donation && donation.donation_type === 'items') {
    const itemsStmt = env.DB.prepare('SELECT * FROM donation_items WHERE donation_id = ?');
    const itemsResult = await itemsStmt.bind(donationId).all();
    donation.items = itemsResult.results || [];
  }

  return donation;
}

// Handle specific donation GET request
async function handleGetDonation(env, donationId, userId) {
  if (!env.DB) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Database not available'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const donation = await getDonationWithItems(env, donationId);

    if (!donation || donation.user_id !== userId) {
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
      error: 'Failed to fetch donation'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle stats request
async function handleStatsRequest(env, userId) {
  if (!env.DB) {
    return new Response(JSON.stringify({
      success: true,
      stats: {
        total_donated: 0,
        total_donations: 0,
        average_donation: 0,
        largest_donation: 0
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const currentYear = new Date().getFullYear();
    const statsQuery = `
      SELECT
        COUNT(*) as total_donations,
        COALESCE(SUM(amount), 0) as total_donated,
        COALESCE(AVG(amount), 0) as average_donation,
        COALESCE(MAX(amount), 0) as largest_donation
      FROM donations
      WHERE user_id = ? AND strftime('%Y', date) = ?
    `;

    const stats = await env.DB.prepare(statsQuery).bind(userId, currentYear.toString()).first();

    // Get donations by type
    const typeQuery = `
      SELECT
        donation_type,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total
      FROM donations
      WHERE user_id = ? AND strftime('%Y', date) = ?
      GROUP BY donation_type
    `;

    const typeStats = await env.DB.prepare(typeQuery).bind(userId, currentYear.toString()).all();

    return new Response(JSON.stringify({
      success: true,
      stats: {
        ...stats,
        by_type: typeStats.results
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
      error: 'Failed to fetch statistics'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// CORS preflight handler
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}