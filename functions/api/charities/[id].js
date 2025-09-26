/**
 * Get charity details by ID
 * GET /api/charities/{id}
 */

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