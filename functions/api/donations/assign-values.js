/**
 * Cloudflare Pages Function for assigning values to donation items
 * POST /api/donations/assign-values - Batch update item values after import
 */

// Helper function to get user from token
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
            return { id: parts[1], email: parts[2] || 'user@example.com' };
        }
    }

    return null;
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Check authentication
        const token = request.headers.get('Authorization');
        let user = getUserFromToken(token);

        if (!user) {
            // Try to get real user ID from database
            if (token && token.startsWith('Bearer token-')) {
                const parts = token.replace('Bearer token-', '').split('-');
                if (parts.length >= 1 && env.DB) {
                    const userId = parts[0];
                    const userCheck = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
                    if (userCheck) {
                        user = { id: userId, email: 'user@example.com' };
                    } else {
                        return new Response(JSON.stringify({
                            success: false,
                            error: 'Invalid user token'
                        }), {
                            status: 401,
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            }
                        });
                    }
                }
            } else {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Authentication required'
                }), {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }

        const body = await request.json();
        const { importBatch } = body;

        if (!env.DB) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Database not available'
            }), {
                status: 503,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Load all items for value lookups
        const itemsQuery = await env.DB.prepare(`
            SELECT name, category, low_value, high_value FROM items
        `).all();

        // Create fast lookup map: "name|category" -> values
        const itemsLookup = new Map();
        itemsQuery.results.forEach(item => {
            const key = `${item.name}|${item.category}`;
            itemsLookup.set(key, {
                low: parseFloat(item.low_value) || 0,
                high: parseFloat(item.high_value) || 0
            });
        });

        // Get all donation items that need values (where unit_value = 0 or NULL)
        // We'll get recent items for this user that don't have values yet
        const itemsToUpdate = await env.DB.prepare(`
            SELECT
                di.id,
                di.item_name,
                di.category,
                di.condition,
                di.quantity,
                di.donation_id
            FROM donation_items di
            JOIN donations d ON di.donation_id = d.id
            WHERE d.user_id = ?
                AND (di.unit_value = 0 OR di.unit_value IS NULL)
                AND d.created_at >= datetime('now', '-1 hour')
            LIMIT 1000
        `).bind(user.id).all();

        let updatedCount = 0;
        let failedCount = 0;

        // Update each item with calculated values
        for (const item of itemsToUpdate.results) {
            const lookupKey = `${item.item_name}|${item.category}`;
            const itemValues = itemsLookup.get(lookupKey);

            if (itemValues) {
                let unitValue = 0;

                // Calculate value based on condition
                if (item.condition === 'excellent') {
                    unitValue = itemValues.high;
                } else if (item.condition === 'very_good') {
                    unitValue = (itemValues.low + itemValues.high) / 2;
                } else if (item.condition === 'good') {
                    unitValue = itemValues.low;
                } else { // fair
                    unitValue = 0; // Not tax deductible
                }

                const totalValue = unitValue * (item.quantity || 1);

                try {
                    // Update the donation_item with calculated values
                    await env.DB.prepare(`
                        UPDATE donation_items
                        SET unit_value = ?, total_value = ?, value_source = 'database'
                        WHERE id = ?
                    `).bind(unitValue, totalValue, item.id).run();

                    updatedCount++;
                } catch (updateError) {
                    console.error(`Failed to update item ${item.id}:`, updateError);
                    failedCount++;
                }
            } else {
                // Item not found in database, skip
                console.log(`No values found for item: ${item.item_name} in category: ${item.category}`);
                failedCount++;
            }
        }

        // Update the donation totals for affected donations
        if (updatedCount > 0) {
            try {
                await env.DB.prepare(`
                    UPDATE donations
                    SET estimated_value = (
                        SELECT SUM(total_value)
                        FROM donation_items
                        WHERE donation_id = donations.id
                    )
                    WHERE user_id = ?
                        AND donation_type = 'items'
                        AND created_at >= datetime('now', '-1 hour')
                `).bind(user.id).run();
            } catch (totalUpdateError) {
                console.error('Failed to update donation totals:', totalUpdateError);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            results: {
                updated: updatedCount,
                failed: failedCount,
                total: itemsToUpdate.results.length
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });

    } catch (error) {
        console.error('[ERROR] assign-values:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Internal server error'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
        }
    });
}