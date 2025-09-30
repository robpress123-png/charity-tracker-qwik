/**
 * API endpoint to fetch items for a specific donation
 * GET /api/donations/{id}/items
 */

export async function onRequestGet(context) {
    const { env, params } = context;
    const donationId = params.id;

    try {
        // Check if database is available
        if (!env.DB) {
            // In local development without D1 binding, return mock data
            console.warn('Database not available in local development. Returning mock data.');
            return new Response(JSON.stringify({
                success: true,
                items: [
                    {
                        id: 'mock-item-1',
                        donation_id: donationId,
                        name: 'Mock Item (DB not available in local)',
                        category: 'Test',
                        quantity: 1,
                        condition: 'good',
                        value: 50,
                        fair_market_value: 50,
                        notes: 'This is mock data - database not connected in local development'
                    }
                ]
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get auth token
        const authHeader = context.request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'No authorization token' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const token = authHeader.substring(7);

        // Parse user ID from token
        const tokenParts = token.split('-');
        if (tokenParts.length < 3 || tokenParts[0] !== 'token') {
            return new Response(JSON.stringify({ error: 'Invalid token format' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const userId = tokenParts[1];

        // Verify donation belongs to user
        const donation = await env.DB.prepare(
            'SELECT * FROM donations WHERE id = ? AND user_id = ?'
        ).bind(donationId, userId).first();

        if (!donation) {
            return new Response(JSON.stringify({ error: 'Donation not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Fetch donation items - donation_items table has the actual values
        const items = await env.DB.prepare(`
            SELECT
                di.id,
                di.donation_id,
                di.item_name,
                di.category,
                di.condition,
                di.quantity,
                di.unit_value,
                di.total_value,
                di.value_source,
                di.created_at
            FROM donation_items di
            WHERE di.donation_id = ?
            ORDER BY di.created_at DESC
        `).bind(donationId).all();

        // Format the items with the actual values from donation_items table
        const itemsWithValues = items.results.map(item => {
            return {
                id: item.id,
                donation_id: item.donation_id,
                name: item.item_name || 'Unknown Item',
                category: item.category,
                quantity: parseFloat(item.quantity) || 1,
                condition: item.condition,
                value: parseFloat(item.unit_value) || 0,  // Value per item
                unit_value: parseFloat(item.unit_value) || 0,
                total_value: parseFloat(item.total_value) || 0,  // quantity × unit_value
                fair_market_value: parseFloat(item.total_value) || 0,  // For compatibility
                value_source: item.value_source,
                created_at: item.created_at
            };
        });

        return new Response(JSON.stringify({
            success: true,
            items: itemsWithValues
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error fetching donation items:', error);
        return new Response(JSON.stringify({
            error: 'Failed to fetch donation items',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}