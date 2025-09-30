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

        // Fetch donation items with item details
        const items = await env.DB.prepare(`
            SELECT
                di.*,
                i.name as item_name,
                i.category,
                i.low_value,
                i.high_value,
                i.description as item_description
            FROM donation_items di
            LEFT JOIN items i ON di.item_id = i.id
            WHERE di.donation_id = ?
            ORDER BY di.created_at DESC
        `).bind(donationId).all();

        // Calculate value for each item based on condition
        const itemsWithValues = items.results.map(item => {
            let value = item.value || 0;

            // If no custom value set, calculate based on condition and item values
            if (!value && item.low_value && item.high_value) {
                switch(item.condition) {
                    case 'good':
                        value = item.low_value;
                        break;
                    case 'very_good':
                        value = (item.low_value + item.high_value) / 2;
                        break;
                    case 'excellent':
                        value = item.high_value;
                        break;
                    default:
                        value = 0;
                }
            }

            return {
                id: item.id,
                donation_id: item.donation_id,
                item_id: item.item_id,
                name: item.item_name || item.name || 'Unknown Item',
                category: item.category,
                quantity: item.quantity || 1,
                condition: item.condition,
                value: value,
                fair_market_value: value * (item.quantity || 1),
                value_source: item.value_source,
                notes: item.notes,
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