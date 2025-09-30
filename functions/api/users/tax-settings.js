/**
 * Cloudflare Pages Function for user tax settings by year
 * GET /api/users/tax-settings?year=2024 - Get tax settings for a specific year
 * PUT /api/users/tax-settings - Update tax settings for a specific year
 */

// Helper function to get user from token
function getUserFromToken(token) {
    if (!token) {
        return null;
    }

    // Remove Bearer prefix if present
    const tokenValue = token.replace('Bearer ', '').trim();

    // For demo/test mode
    if (tokenValue === 'test-token' || tokenValue === 'demo-token' || tokenValue === 'test-token-12345') {
        return { id: '1', email: 'test@example.com' };
    }

    // Parse real token format: token-{userId}-{timestamp}
    if (tokenValue.startsWith('token-')) {
        const parts = tokenValue.split('-');
        if (parts.length >= 3) {
            return { id: parts[1], email: 'user@example.com' };
        }
    }

    return null;
}

// GET tax settings for a specific year
export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        const url = new URL(request.url);
        const year = url.searchParams.get('year') || new Date().getFullYear().toString();

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
            // Return mock data for local development
            return new Response(JSON.stringify({
                success: true,
                filing_status: 'single',
                tax_bracket: 22,
                income_range: '50000-100000',
                tax_year: parseInt(year)
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // First try to get from user_tax_settings table
        let taxSettings = await env.DB.prepare(`
            SELECT filing_status, tax_bracket, agi_range as income_range
            FROM user_tax_settings
            WHERE user_id = ? AND tax_year = ?
        `).bind(user.id, parseInt(year)).first();

        // If not found in user_tax_settings, try to get from users table (backward compatibility)
        if (!taxSettings) {
            const userData = await env.DB.prepare(`
                SELECT filing_status, tax_bracket, income_range
                FROM users
                WHERE id = ?
            `).bind(user.id).first();

            if (userData && (userData.filing_status || userData.tax_bracket)) {
                taxSettings = {
                    filing_status: userData.filing_status || 'single',
                    tax_bracket: userData.tax_bracket || 22,
                    income_range: userData.income_range
                };
            }
        }

        // Return defaults if no settings found
        if (!taxSettings) {
            taxSettings = {
                filing_status: 'single',
                tax_bracket: 22,
                income_range: null
            };
        }

        return new Response(JSON.stringify({
            success: true,
            filing_status: taxSettings.filing_status || 'single',
            tax_bracket: parseFloat(taxSettings.tax_bracket) || 22,
            income_range: taxSettings.income_range,
            tax_year: parseInt(year)
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Get tax settings error:', error);

        // Return defaults on error
        return new Response(JSON.stringify({
            success: true,
            filing_status: 'single',
            tax_bracket: 22,
            income_range: null,
            tax_year: new Date().getFullYear()
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// PUT update tax settings for a specific year
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

        const body = await request.json();
        const {
            tax_year = new Date().getFullYear(),
            filing_status,
            tax_bracket,
            income_range
        } = body;

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

        // Upsert into user_tax_settings table
        await env.DB.prepare(`
            INSERT INTO user_tax_settings (user_id, tax_year, filing_status, tax_bracket, agi_range, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, tax_year) DO UPDATE SET
                filing_status = excluded.filing_status,
                tax_bracket = excluded.tax_bracket,
                agi_range = excluded.agi_range,
                updated_at = CURRENT_TIMESTAMP
        `).bind(
            user.id,
            parseInt(tax_year),
            filing_status,
            parseFloat(tax_bracket),
            income_range
        ).run();

        // Also update users table for backward compatibility
        await env.DB.prepare(`
            UPDATE users
            SET filing_status = ?, tax_bracket = ?, income_range = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(filing_status, parseFloat(tax_bracket), income_range, user.id).run();

        return new Response(JSON.stringify({
            success: true,
            message: 'Tax settings updated successfully'
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Update tax settings error:', error);
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

// Handle OPTIONS for CORS
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