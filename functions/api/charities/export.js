/**
 * Cloudflare Pages Function for exporting charities to CSV
 * GET /api/charities/export - Export all charities as CSV
 */

// Helper function to get user from token
function getUserFromToken(token) {
    if (!token || !token.startsWith('Bearer ')) {
        return null;
    }

    const tokenValue = token.replace('Bearer ', '');

    // For admin/test mode - check various admin token formats
    if (tokenValue === 'test-token' ||
        tokenValue === 'demo-token' ||
        tokenValue === 'admin-token' ||
        tokenValue.includes('admin')) {
        return { id: '1', email: 'admin@example.com', isAdmin: true };
    }

    // Parse real token format: token-{userId}-{timestamp}
    // Admin users would have logged in through admin-login
    if (tokenValue.startsWith('token-')) {
        const parts = tokenValue.split('-');
        if (parts.length >= 3) {
            // Check if this is an admin user (simplified check)
            // In production, you'd verify against a database
            return { id: parts[1], isAdmin: true };
        }
    }

    return null;
}

// Escape CSV value
function escapeCsvValue(value) {
    if (value === null || value === undefined) return '';

    // Convert to string
    value = String(value);

    // Check if value contains comma, quote, or newline
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        // Escape quotes by doubling them
        value = value.replace(/"/g, '""');
        // Wrap in quotes
        return `"${value}"`;
    }

    return value;
}

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        // Check authentication - simplified for now
        const token = request.headers.get('Authorization');

        // For now, accept any bearer token (we'll improve this later)
        if (!token || !token.startsWith('Bearer ')) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Authorization header required'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Extract user info (simplified)
        const user = { id: '1', isAdmin: true };

        // Check if D1 database is available
        if (!env.DB) {
            // Return mock CSV for local development
            const mockCsv = `name,ein,category,website,description,user_id,created_at
"American Red Cross","53-0196605","Human Services","https://www.redcross.org","Humanitarian organization","1","2024-01-01"
"Doctors Without Borders","13-3433452","Health","https://www.msf.org","Medical humanitarian organization","1","2024-01-01"
"World Wildlife Fund","52-1693387","Environment","https://www.worldwildlife.org","Wildlife conservation organization","1","2024-01-01"`;

            return new Response(mockCsv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="charities_export.csv"',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get all charities from database (IRS charity database)
        const query = `
            SELECT
                name,
                ein,
                category,
                address,
                city,
                state,
                zip_code,
                website,
                description,
                phone,
                is_verified,
                created_at
            FROM charities
            ORDER BY name
        `;

        const result = await env.DB.prepare(query).all();

        if (!result.success) {
            throw new Error('Failed to fetch charities');
        }

        // Build CSV
        const headers = ['name', 'ein', 'category', 'address', 'city', 'state', 'zip_code', 'website', 'description', 'phone', 'is_verified', 'created_at'];
        let csv = headers.join(',') + '\n';

        for (const charity of result.results) {
            const row = [
                escapeCsvValue(charity.name),
                escapeCsvValue(charity.ein),
                escapeCsvValue(charity.category),
                escapeCsvValue(charity.address),
                escapeCsvValue(charity.city),
                escapeCsvValue(charity.state),
                escapeCsvValue(charity.zip_code),
                escapeCsvValue(charity.website),
                escapeCsvValue(charity.description),
                escapeCsvValue(charity.phone),
                escapeCsvValue(charity.is_verified),
                escapeCsvValue(charity.created_at)
            ];
            csv += row.join(',') + '\n';
        }

        // Return CSV file
        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="charities_export.csv"',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            }
        });

    } catch (error) {
        console.error('Error exporting charities:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to export charities: ' + error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Handle preflight requests
export async function onRequestOptions(context) {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}