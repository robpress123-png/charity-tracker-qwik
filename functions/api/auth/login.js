/**
 * Cloudflare Pages Function for login
 * This handles authentication without needing Wrangler
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { email, password } = body;

    // Check if D1 database is available
    if (env.DB) {
      // Query the database for the user
      const result = await env.DB.prepare(
        'SELECT id, email, name, plan FROM users WHERE email = ? AND password = ?'
      )
        .bind(email, password)
        .first();

      if (result) {
        return new Response(JSON.stringify({
          success: true,
          user: result,
          token: `token-${result.id}-${Date.now()}`
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    } else {
      // Fallback for local testing without D1
      if (email === 'test@example.com' && password === 'password123') {
        return new Response(JSON.stringify({
          success: true,
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            plan: 'free'
          },
          token: 'test-token-123'
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid credentials'
    }), {
      status: 401,
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
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}