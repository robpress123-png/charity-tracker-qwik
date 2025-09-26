/**
 * Get charity details by ID
 * GET /api/charities/{id}
 */

// Helper function for authentication (optional for public charities)
function getUserFromToken(token) {
    if (!token || !token.startsWith('Bearer ')) {
        return null;
    }

    const tokenValue = token.replace('Bearer ', '');

    // For demo/test mode
    if (tokenValue === 'test-token' || tokenValue === 'demo-token') {
        return { id: '1', email: 'test@example.com' };
    }

    // Parse real token format: token-{userId}-{timestamp}
    if (tokenValue.startsWith('token-')) {
        const parts = tokenValue.split('-');
        if (parts.length >= 3) {
            return { id: parts[1] };
        }
    }

    return null;
}

export async function onRequestGet(context) {
    const { env, request, params } = context;
    const charityId = params.id;

    // Get auth header (optional for public charities)
    const authHeader = request.headers.get('Authorization');

    try {
        // Fetch the charity from the main charities table
        const stmt = env.DB.prepare(
            'SELECT id, name, ein, category, address, city, state, zip_code, description, website, is_verified FROM charities WHERE id = ?'
        );
        const charity = await stmt.bind(charityId).first();

        if (!charity) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Charity not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Log what we're returning for debugging
        console.log('Charity data being returned:', {
            id: charity.id,
            name: charity.name,
            hasDescription: !!charity.description,
            descriptionLength: charity.description ? charity.description.length : 0,
            descriptionPreview: charity.description ? charity.description.substring(0, 50) : 'No description'
        });

        return new Response(JSON.stringify({
            success: true,
            charity: charity
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching charity:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch charity details'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}