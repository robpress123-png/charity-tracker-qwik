/**
 * Cloudflare Pages Function for bulk importing charities
 * Admin endpoint for importing charity data
 */

// Simple admin authentication
const ADMIN_TOKEN = 'admin-secret-2024'; // In production, use environment variable

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Check admin authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.includes(ADMIN_TOKEN)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const body = await request.json();
    const { charities } = body;

    if (!charities || !Array.isArray(charities)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid data format'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Check if D1 database is available
    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database not configured'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Note: Charities are imported as system charities (no user_id)
    // This allows all users to access them

    // Process charities in batches of 50
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < charities.length; i += batchSize) {
      const batch = charities.slice(i, i + batchSize);

      try {
        // Use batch insert with prepared statement
        const statements = [];

        for (const charity of batch) {
          if (!charity.name || !charity.ein) {
            errorCount++;
            continue;
          }

          // Clean and validate data
          const name = charity.name.substring(0, 200);
          const ein = charity.ein.substring(0, 20);
          const category = charity.category || 'Other';
          const website = charity.website || '';
          const description = charity.description || '';

          statements.push(
            env.DB.prepare(
              `INSERT OR IGNORE INTO charities
               (user_id, name, ein, category, website, description)
               VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(null, name, ein, category, website, description)
          );
        }

        // Execute batch
        if (statements.length > 0) {
          const results = await env.DB.batch(statements);
          successCount += statements.length;
        }

      } catch (batchError) {
        errorCount += batch.length;
        errors.push(`Batch ${i/batchSize + 1}: ${batchError.message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Import completed`,
      stats: {
        total: charities.length,
        successful: successCount,
        failed: errorCount,
        errors: errors.slice(0, 5) // Return first 5 errors
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Server error: ' + error.message
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}