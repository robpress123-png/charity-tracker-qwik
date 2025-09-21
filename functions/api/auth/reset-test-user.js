/**
 * Reset test user password to work with hashing
 */

export async function onRequestGet(context) {
  const { env } = context;

  try {
    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database not available'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Hash the standard test password
    const password = 'password123';
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check if test user exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind('test@example.com').first();

    let result;
    if (existingUser) {
      // Update existing user
      result = await env.DB.prepare(
        'UPDATE users SET password = ? WHERE email = ?'
      ).bind(hashedPassword, 'test@example.com').run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Test user password updated to hashed version',
        email: 'test@example.com',
        password: 'password123 (now hashed)',
        action: 'updated'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      // Create test user
      result = await env.DB.prepare(`
        INSERT INTO users (email, password, name, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `).bind(
        'test@example.com',
        hashedPassword,
        'Test User'
      ).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Test user created with hashed password',
        email: 'test@example.com',
        password: 'password123 (hashed)',
        action: 'created'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

  } catch (error) {
    console.error('Reset error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
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