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

        // Parse request body
        const data = await request.json();

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
        const donationType = data.donation_type || 'cash';

        // Notes field should ONLY contain user-entered text, never structured data
        const notesText = data.notes || '';

        // Determine if this is a personal or system charity
        const isPersonalCharity = data.charity_source === 'personal' ||
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

        // Update the donation with proper charity field handling
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
                cost_basis = ?,
                crypto_symbol = ?,
                crypto_quantity = ?,
                crypto_type = ?,
                item_description = ?,
                estimated_value = ?
            WHERE id = ? AND user_id = ?
        `).bind(
            isPersonalCharity ? null : data.charity_id,
            isPersonalCharity ? data.user_charity_id : null,
            amount,
            date,
            donationType,
            notesText,
            data.receipt_url || null,
            donationType === 'miles' ? data.miles_driven : null,
            donationType === 'miles' ? data.mileage_rate : null,
            donationType === 'miles' ? data.mileage_purpose : null,
            donationType === 'stock' ? data.stock_symbol : null,
            donationType === 'stock' ? data.stock_quantity : null,
            donationType === 'stock' || donationType === 'crypto' ? data.fair_market_value : null,
            donationType === 'stock' || donationType === 'crypto' ? data.cost_basis : null,
            donationType === 'crypto' ? data.crypto_symbol : null,
            donationType === 'crypto' ? data.crypto_quantity : null,
            donationType === 'crypto' ? data.crypto_type : null,
            donationType === 'items' ? data.item_description : null,
            donationType === 'items' ? data.estimated_value : null,
            donationId,
            user.id
        ).run();

        if (result.meta.changes === 0) {
            return Response.json({
                success: false,
                error: 'No changes made'
            }, { status: 400 });
        }

        // If this is an items donation, update the items in donation_items table
        if (donationType === 'items' && data.items && Array.isArray(data.items)) {
            // First, delete existing items for this donation
            await env.DB.prepare('DELETE FROM donation_items WHERE donation_id = ?')
                .bind(donationId)
                .run();

            const itemStmt = env.DB.prepare(`
                INSERT INTO donation_items (
                    donation_id, item_name, category, condition, quantity, unit_value, total_value
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            for (const item of data.items) {
                await itemStmt.bind(
                    donationId,
                    item.item_name || item.name,
                    item.category,
                    item.condition,
                    item.quantity || 1,
                    item.unit_value || item.value,
                    item.total_value || (item.quantity || 1) * (item.unit_value || item.value || 0)
                ).run();
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