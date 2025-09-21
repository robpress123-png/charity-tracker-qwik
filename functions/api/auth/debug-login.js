/**
 * Debug endpoint to check user authentication issues
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { email, password } = body;

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

    // Hash the password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Get user info
    const user = await env.DB.prepare(
      'SELECT id, email, password, created_at FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first();

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        debug: {
          message: 'No user found with this email',
          emailSearched: email.toLowerCase()
        }
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Check password format
    const storedPasswordIsHashed = user.password && user.password.length === 64 && /^[a-f0-9]+$/.test(user.password);

    return new Response(JSON.stringify({
      success: true,
      debug: {
        userFound: true,
        userId: user.id,
        email: user.email,
        createdAt: user.created_at,
        providedPasswordHash: hashedPassword,
        storedPasswordHash: user.password ? user.password.substring(0, 10) + '...' : 'null',
        storedPasswordLength: user.password ? user.password.length : 0,
        storedPasswordIsHashed: storedPasswordIsHashed,
        passwordsMatch: user.password === hashedPassword,
        plainTextMatch: user.password === password,
        suggestion: !storedPasswordIsHashed ?
          'Password is stored as plain text. User needs to reset password.' :
          (user.password === hashedPassword ? 'Login should work!' : 'Password incorrect')
      }
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}