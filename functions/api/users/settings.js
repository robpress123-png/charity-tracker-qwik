/**
 * Cloudflare Pages Function for user settings
 * GET /api/users/settings - Get user settings including tax info
 * PUT /api/users/settings - Update user settings including tax info
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

// GET user settings
export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        const token = request.headers.get('Authorization');
        const user = getUserFromToken(token);

        if (!user || !user.id) {
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

        // Get user data including tax settings
        // Use safe column selection to handle missing columns
        let userData;
        try {
            userData = await env.DB.prepare(`
                SELECT id, email, name, plan, created_at, updated_at,
                       address, city, state, zip_code,
                       tax_bracket, filing_status, income_range
                FROM users
                WHERE id = ?
            `).bind(user.id).first();
        } catch (error) {
            // If columns don't exist, try basic query
            console.log('Tax columns may not exist, falling back to basic query');
            userData = await env.DB.prepare(`
                SELECT id, email, name, plan, created_at, updated_at
                FROM users
                WHERE id = ?
            `).bind(user.id).first();
        }

        if (!userData) {
            return new Response(JSON.stringify({
                success: false,
                error: 'User not found'
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            settings: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                plan: userData.plan || 'free',
                address: userData.address,
                city: userData.city,
                state: userData.state,
                zipCode: userData.zip_code,
                taxBracket: userData.tax_bracket,
                filingStatus: userData.filing_status || 'single',
                incomeRange: userData.income_range || '50000',
                createdAt: userData.created_at,
                updatedAt: userData.updated_at
            }
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Get settings error:', error);
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

// PUT update user settings
export async function onRequestPut(context) {
    const { request, env } = context;

    try {
        const token = request.headers.get('Authorization');
        const user = getUserFromToken(token);

        if (!user || !user.id) {
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

        const body = await request.json();

        // Build update query based on provided fields
        const updateFields = [];
        const params = [];

        if (body.name !== undefined) {
            updateFields.push('name = ?');
            params.push(body.name);
        }
        if (body.address !== undefined) {
            updateFields.push('address = ?');
            params.push(body.address);
        }
        if (body.city !== undefined) {
            updateFields.push('city = ?');
            params.push(body.city);
        }
        if (body.state !== undefined) {
            updateFields.push('state = ?');
            params.push(body.state);
        }
        if (body.zipCode !== undefined) {
            updateFields.push('zip_code = ?');
            params.push(body.zipCode);
        }
        if (body.taxBracket !== undefined) {
            updateFields.push('tax_bracket = ?');
            params.push(body.taxBracket);
        }
        if (body.filingStatus !== undefined) {
            updateFields.push('filing_status = ?');
            params.push(body.filingStatus);
        }
        if (body.incomeRange !== undefined) {
            updateFields.push('income_range = ?');
            params.push(body.incomeRange);
        }

        // Always update the timestamp
        updateFields.push('updated_at = CURRENT_TIMESTAMP');

        if (updateFields.length === 1) {  // Only timestamp
            return new Response(JSON.stringify({
                success: false,
                error: 'No fields to update'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Add user ID as last parameter
        params.push(user.id);

        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        await env.DB.prepare(updateQuery).bind(...params).run();

        // Return updated settings
        const updatedUser = await env.DB.prepare(`
            SELECT id, email, name, plan,
                   address, city, state, zip_code,
                   tax_bracket, filing_status, income_range,
                   updated_at
            FROM users
            WHERE id = ?
        `).bind(user.id).first();

        return new Response(JSON.stringify({
            success: true,
            message: 'Settings updated successfully',
            settings: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                plan: updatedUser.plan || 'free',
                address: updatedUser.address,
                city: updatedUser.city,
                state: updatedUser.state,
                zipCode: updatedUser.zip_code,
                taxBracket: updatedUser.tax_bracket,
                filingStatus: updatedUser.filing_status || 'single',
                incomeRange: updatedUser.income_range || '50000',
                updatedAt: updatedUser.updated_at
            }
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Update settings error:', error);
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

// CORS preflight handler
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        }
    });
}