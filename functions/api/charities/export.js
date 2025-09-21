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

    // For admin/test mode
    if (tokenValue === 'test-token' || tokenValue === 'demo-token' || tokenValue === 'admin-token') {
        return { id: '1', email: 'admin@example.com', isAdmin: true };
    }

    // Parse real token format: token-{userId}-{timestamp}
    if (tokenValue.startsWith('token-')) {
        const parts = tokenValue.split('-');
        if (parts.length >= 3) {
            return { id: parts[1], isAdmin: true }; // Assume export is admin-only
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
        // Check authentication (admin only)
        const token = request.headers.get('Authorization');
        const user = getUserFromToken(token);

        if (!user || !user.isAdmin) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Unauthorized - Admin access required'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

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

        // Get all charities from database
        const query = `
            SELECT
                c.name,
                c.ein,
                c.category,
                c.website,
                c.description,
                c.user_id,
                c.created_at,
                u.email as user_email
            FROM charities c
            LEFT JOIN users u ON c.user_id = u.id
            ORDER BY c.name
        `;

        const result = await env.DB.prepare(query).all();

        if (!result.success) {
            throw new Error('Failed to fetch charities');
        }

        // Build CSV
        const headers = ['name', 'ein', 'category', 'website', 'description', 'user_id', 'user_email', 'created_at'];
        let csv = headers.join(',') + '\n';

        for (const charity of result.results) {
            const row = [
                escapeCsvValue(charity.name),
                escapeCsvValue(charity.ein),
                escapeCsvValue(charity.category),
                escapeCsvValue(charity.website),
                escapeCsvValue(charity.description),
                escapeCsvValue(charity.user_id),
                escapeCsvValue(charity.user_email),
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