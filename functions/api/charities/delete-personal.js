/**
 * Cloudflare Pages Function for deleting personal charities
 * DELETE /api/charities/delete-personal/:id - Delete a personal charity
 */

export async function onRequestDelete(context) {
  const { request, env, params } = context;

  try {
    // Get charity ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const charityId = pathParts[pathParts.length - 1];

    if (!charityId || charityId === 'delete-personal') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Charity ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user from authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    let userId = null;

    if (token.startsWith('token-')) {
      const parts = token.split('-');
      if (parts.length >= 2) {
        userId = parts[1];
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.DB) {
      // Return mock response for local development
      return new Response(JSON.stringify({
        success: true,
        message: 'Personal charity deleted successfully (mock)'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Check if the charity exists and belongs to the user
    const checkStmt = env.DB.prepare(
      'SELECT id FROM user_charities WHERE id = ? AND user_id = ?'
    );
    const charity = await checkStmt.bind(charityId, userId).first();

    if (!charity) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Personal charity not found or you do not have permission to delete it'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if there are any donations linked to this charity
    const donationCheckStmt = env.DB.prepare(
      'SELECT COUNT(*) as count FROM donations WHERE charity_id = ? AND user_id = ?'
    );
    const donationCheck = await donationCheckStmt.bind(charityId, userId).first();

    if (donationCheck && donationCheck.count > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `Cannot delete charity with ${donationCheck.count} existing donation(s). Please delete the donations first.`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete the charity
    const deleteStmt = env.DB.prepare(
      'DELETE FROM user_charities WHERE id = ? AND user_id = ?'
    );
    const result = await deleteStmt.bind(charityId, userId).run();

    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to delete personal charity'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Personal charity deleted successfully'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error deleting personal charity:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete personal charity: ' + error.message
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
export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}