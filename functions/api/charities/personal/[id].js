export async function onGet(context) {
    const { env, request, params } = context;
    const charityId = params.id;

    // Get auth header
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

    // Parse token to get user ID
    const tokenParts = token.split('-');
    if (tokenParts.length < 3 || tokenParts[0] !== 'token') {
        return new Response(JSON.stringify({
            success: false,
            error: 'Invalid token format'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const userId = tokenParts[1];

    try {
        // Fetch the specific personal charity
        const stmt = env.DB.prepare(
            'SELECT * FROM user_charities WHERE id = ? AND user_id = ?'
        );
        const charity = await stmt.bind(charityId, userId).first();

        if (!charity) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Charity not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            charity: charity
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching personal charity:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Failed to fetch charity'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}