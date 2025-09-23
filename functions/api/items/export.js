/**
 * Export items pricing database as CSV
 * GET /api/items/export
 */

export async function onRequestGet(context) {
    const { env } = context;

    try {
        // Check if D1 database is available
        if (!env.DB) {
            return new Response('name,category,low_value,high_value,tax_deductible,valuation_source,source_date\n', {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="items_database.csv"',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get all items from pricing database
        const items = await env.DB.prepare(`
            SELECT
                name,
                category,
                low_value,
                high_value,
                tax_deductible,
                valuation_source,
                source_date
            FROM items
            ORDER BY category, name
        `).all();

        // Create CSV content
        let csv = 'name,category,low_value,high_value,tax_deductible,valuation_source,source_date\n';

        for (const item of items.results || []) {
            // Escape fields that might contain commas
            const name = item.name?.includes(',') ? `"${item.name}"` : item.name || '';
            const category = item.category?.includes(',') ? `"${item.category}"` : item.category || '';
            const source = item.valuation_source?.includes(',') ? `"${item.valuation_source}"` : item.valuation_source || '';

            csv += `${name},${category},${item.low_value || 0},${item.high_value || 0},${item.tax_deductible || 1},${source},${item.source_date || ''}\n`;
        }

        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="items_database_${new Date().toISOString().split('T')[0]}.csv"`,
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Export items error:', error);
        return new Response('Error exporting items: ' + error.message, {
            status: 500,
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Handle OPTIONS requests for CORS
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}