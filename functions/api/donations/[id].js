// API endpoints for individual donation operations
// Handles GET, PUT, DELETE for /api/donations/{id}

// Helper function to verify authentication
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

// GET /api/donations/{id} - Retrieve a single donation
export async function onRequestGet(context) {
    const { params, env, request } = context;
    const donationId = params.id;

    try {
        // Verify authentication
        const token = request.headers.get('Authorization');
        const user = getUserFromToken(token);

        if (!user) {
            return Response.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        // Query the database for the specific donation
        // IMPORTANT: Join both system charities and user charities to get the name
        const donation = await env.DB.prepare(`
            SELECT
                d.id,
                d.user_id,
                d.charity_id,
                d.user_charity_id,
                d.amount,
                d.date,
                d.donation_type,
                d.receipt_url,
                d.notes,
                d.created_at,
                d.miles_driven,
                d.mileage_rate,
                d.mileage_purpose,
                d.item_description,
                d.estimated_value,
                d.stock_symbol,
                d.stock_quantity,
                d.fair_market_value,
                d.crypto_symbol,
                d.crypto_quantity,
                d.crypto_type,
                d.cost_basis,
                COALESCE(c.name, uc.name) as charity_name,
                COALESCE(c.ein, uc.ein) as charity_ein,
                CASE
                    WHEN d.user_charity_id IS NOT NULL THEN 'personal'
                    ELSE 'system'
                END as charity_source
            FROM donations d
            LEFT JOIN charities c ON d.charity_id = c.id
            LEFT JOIN user_charities uc ON d.user_charity_id = uc.id
            WHERE d.id = ? AND d.user_id = ?
        `).bind(donationId, user.id).first();

        if (!donation) {
            return Response.json({
                success: false,
                error: 'Donation not found'
            }, { status: 404 });
        }

        // If this is an items donation, fetch the items from donation_items table
        if (donation.donation_type === 'items') {
            const items = await env.DB.prepare(`
                SELECT
                    item_name,
                    category,
                    condition,
                    quantity,
                    unit_value,
                    total_value
                    -- value_source  TODO: Add after migration
                FROM donation_items
                WHERE donation_id = ?
                ORDER BY item_name
            `).bind(donationId).all();

            donation.items = items.results || [];
        }

        // Notes is now just user-entered text, no JSON parsing needed

        return Response.json({
            success: true,
            donation: donation
        });

    } catch (error) {
        console.error('Error fetching donation:', error);
        return Response.json({
            success: false,
            error: 'Failed to fetch donation'
        }, { status: 500 });
    }
}

// PUT /api/donations/{id} - Update a donation
export async function onRequestPut(context) {
    console.log('[PUT START] onRequestPut called');
    const { params, env, request } = context;
    const donationId = params.id;
    console.log('[PUT START] Donation ID:', donationId);

    // Define these outside try block for error handler
    let donationType = null;
    let isPersonalCharity = false;
    let data = {};

    try {
        console.log('[PUT AUTH] Checking authentication');
        // Verify authentication
        const token = request.headers.get('Authorization');
        const user = getUserFromToken(token);
        console.log('[PUT AUTH] User:', user ? user.id : 'null');
        console.log('[PUT AUTH] Full user object:', user);

        if (!user || !user.id) {
            return Response.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        // Parse request body
        data = await request.json();

        // First, verify the donation exists and belongs to the user
        const existing = await env.DB.prepare(
            'SELECT id FROM donations WHERE id = ? AND user_id = ?'
        ).bind(donationId, user.id).first();

        if (!existing) {
            return Response.json({
                success: false,
                error: 'Donation not found or unauthorized'
            }, { status: 404 });
        }

        // Prepare the update data
        const amount = data.amount || 0;
        const date = data.donation_date || data.date || new Date().toISOString().split('T')[0];
        donationType = data.donation_type || 'cash';

        console.log('[PUT DATA] Processing update data:', {
            amount,
            date,
            donationType,
            charity_id: data.charity_id,
            user_charity_id: data.user_charity_id,
            items_count: data.items ? data.items.length : 0
        });

        // Notes field should ONLY contain user-entered text, never structured data
        const notesText = data.notes || '';

        // Determine if this is a personal or system charity
        isPersonalCharity = data.charity_source === 'personal' ||
                                 (data.user_charity_id && !data.charity_id);

        // Debug logging
        console.log('Update donation debug:', {
            donationId,
            donationType,
            isPersonalCharity,
            charity_id: data.charity_id,
            user_charity_id: data.user_charity_id,
            charity_source: data.charity_source,
            amount,
            date
        });

        // Prepare all bind values with explicit null handling
        const bindValues = [
            isPersonalCharity ? null : (data.charity_id || null),
            isPersonalCharity ? (data.user_charity_id || null) : null,
            amount,
            date,
            donationType,
            notesText || '',
            data.receipt_url || null,
            donationType === 'miles' ? (data.miles_driven || null) : null,
            donationType === 'miles' ? (data.mileage_rate || null) : null,
            donationType === 'miles' ? (data.mileage_purpose || null) : null,
            donationType === 'stock' ? (data.stock_symbol || null) : null,
            donationType === 'stock' ? (data.stock_quantity || null) : null,
            donationType === 'stock' || donationType === 'crypto' ? (data.fair_market_value || null) : null,
            donationType === 'crypto' ? (data.crypto_symbol || null) : null,
            donationType === 'crypto' ? (data.crypto_quantity || null) : null,
            donationType === 'crypto' ? (data.crypto_type || null) : null,
            null,  // item_description - deprecated, items stored in donation_items table
            donationType === 'items' ? amount : null,  // estimated_value - use total amount for items
            donationId,
            user.id
        ];

        console.log('[PUT UPDATE] Bind values:', bindValues.map((v, i) => `[${i}]: ${v === null ? 'null' : v === undefined ? 'UNDEFINED!' : v}`));

        // Check for undefined values
        const undefinedIndex = bindValues.findIndex(v => v === undefined);
        if (undefinedIndex !== -1) {
            console.error('[PUT UPDATE] UNDEFINED value found at index:', undefinedIndex);
            throw new Error(`Undefined value at bind position ${undefinedIndex}`);
        }

        // Update the donation with proper charity field handling
        // NOTE: cost_basis column removed - not in production DB
        const result = await env.DB.prepare(`
            UPDATE donations
            SET
                charity_id = ?,
                user_charity_id = ?,
                amount = ?,
                date = ?,
                donation_type = ?,
                notes = ?,
                receipt_url = COALESCE(?, receipt_url),
                miles_driven = ?,
                mileage_rate = ?,
                mileage_purpose = ?,
                stock_symbol = ?,
                stock_quantity = ?,
                fair_market_value = ?,
                crypto_symbol = ?,
                crypto_quantity = ?,
                crypto_type = ?,
                item_description = ?,
                estimated_value = ?
            WHERE id = ? AND user_id = ?
        `).bind(...bindValues).run();

        if (result.meta.changes === 0) {
            return Response.json({
                success: false,
                error: 'No changes made'
            }, { status: 400 });
        }

        // If this is an items donation, update the items in donation_items table
        if (donationType === 'items' && data.items && Array.isArray(data.items)) {
            console.log('[ITEMS UPDATE] Starting items update for donation:', donationId);
            console.log('[ITEMS UPDATE] Number of items:', data.items.length);
            console.log('[ITEMS UPDATE] Items data:', JSON.stringify(data.items, null, 2));

            try {
                // First, delete existing items for this donation
                console.log('[ITEMS DELETE] Deleting existing items for donation:', donationId);
                const deleteResult = await env.DB.prepare('DELETE FROM donation_items WHERE donation_id = ?')
                    .bind(donationId)
                    .run();
                console.log('[ITEMS DELETE] Delete result:', {
                    success: deleteResult.success,
                    meta: deleteResult.meta
                });

                console.log('[ITEMS INSERT] Starting to insert', data.items.length, 'new items');

                // Insert new items one by one for better error tracking
                for (let i = 0; i < data.items.length; i++) {
                    const item = data.items[i];
                    console.log(`[ITEMS INSERT] Processing item ${i + 1}/${data.items.length}:`, {
                        item_name: item.item_name || item.name,
                        category: item.category,
                        condition: item.condition,
                        quantity: item.quantity,
                        unit_value: item.unit_value || item.value,
                        total_value: item.total_value
                    });

                    try {
                        // Prepare values with detailed logging
                        const itemName = item.item_name || item.name || 'Unknown Item';
                        const category = item.category || 'General';
                        const condition = item.condition || 'good';
                        const quantity = parseInt(item.quantity) || 1;
                        const unitValue = parseFloat(item.unit_value) || parseFloat(item.value) || 0;
                        const totalValue = parseFloat(item.total_value) || 0;

                        console.log(`[ITEMS INSERT] Binding values for item ${i + 1}:`, {
                            donation_id: donationId,
                            item_name: itemName,
                            category: category,
                            condition: condition,
                            quantity: quantity,
                            unit_value: unitValue,
                            total_value: totalValue
                        });

                        // Simplify to bare minimum INSERT
                        const insertResult = await env.DB.prepare(`
                            INSERT INTO donation_items (donation_id, item_name, category, condition, quantity, unit_value, total_value)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        `).bind(
                            donationId,
                            itemName,
                            category,
                            condition,
                            quantity,
                            unitValue,
                            totalValue
                        ).run();

                        console.log(`[ITEMS INSERT] Item ${i + 1} insert result:`, {
                            success: insertResult.success,
                            meta: insertResult.meta
                        });
                    } catch (itemError) {
                        console.error(`[ITEMS ERROR] Failed to insert item ${i + 1}:`, itemError);
                        console.error('[ITEMS ERROR] Item data was:', JSON.stringify(item));
                        console.error('[ITEMS ERROR] Error details:', {
                            message: itemError.message,
                            stack: itemError.stack
                        });
                        // Return error response instead of throwing
                        return Response.json({
                            success: false,
                            error: `Failed to insert item: ${itemError.message}`,
                            item: item,
                            itemIndex: i + 1
                        }, { status: 500 });
                    }
                }
            } catch (itemsError) {
                console.error('Error updating donation items:', itemsError);
                // Return error response instead of throwing
                return Response.json({
                    success: false,
                    error: `Failed to update items: ${itemsError.message}`
                }, { status: 500 });
            }
        }

        return Response.json({
            success: true,
            message: 'Donation updated successfully',
            id: donationId
        });

    } catch (error) {
        console.error('Error updating donation:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            donationId: donationId,
            donationType: donationType,
            isPersonalCharity: isPersonalCharity,
            charity_id: data.charity_id,
            user_charity_id: data.user_charity_id,
            charity_source: data.charity_source
        });
        return Response.json({
            success: false,
            error: `Failed to update donation: ${error.message}`
        }, { status: 500 });
    }
}

// DELETE /api/donations/{id} - Delete a donation
export async function onRequestDelete(context) {
    const { params, env, request } = context;
    const donationId = params.id;

    try {
        // Verify authentication
        const token = request.headers.get('Authorization');
        const user = getUserFromToken(token);

        if (!user) {
            return Response.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        // Delete the donation (only if it belongs to the user)
        const result = await env.DB.prepare(
            'DELETE FROM donations WHERE id = ? AND user_id = ?'
        ).bind(donationId, user.id).run();

        if (result.meta.changes === 0) {
            return Response.json({
                success: false,
                error: 'Donation not found or unauthorized'
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: 'Donation deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting donation:', error);
        return Response.json({
            success: false,
            error: 'Failed to delete donation'
        }, { status: 500 });
    }
}

// OPTIONS request for CORS
export async function onRequestOptions(context) {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}