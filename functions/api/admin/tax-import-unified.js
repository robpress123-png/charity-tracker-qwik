// API endpoint for importing unified tax data CSV
// POST /api/admin/tax-import-unified
// Imports a single CSV file containing all tax data

export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        // Verify admin authentication
        const token = request.headers.get('Authorization');
        if (!token || !token.includes('admin')) {
            return Response.json({
                success: false,
                error: 'Unauthorized - Admin access required'
            }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return Response.json({
                success: false,
                error: 'No file uploaded'
            }, { status: 400 });
        }

        // Read CSV content
        const csvContent = await file.text();
        const lines = csvContent.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        // Track success and errors by table
        const stats = {
            tax_brackets: { success: 0, errors: 0 },
            capital_gains: { success: 0, errors: 0 },
            standard_deductions: { success: 0, errors: 0 },
            mileage_rates: { success: 0, errors: 0 },
            contribution_limits: { success: 0, errors: 0 }
        };
        const errors = [];

        // Process each data row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',').map(v => v.trim());
            const row = {};

            // Map values to headers
            headers.forEach((header, index) => {
                let value = values[index];
                // Handle empty values
                if (value === '' || value === 'NULL' || value === 'null') {
                    value = null;
                }
                row[header] = value;
            });

            const tableType = row.table_type;
            if (!tableType) {
                errors.push({ row: i, error: 'Missing table_type' });
                continue;
            }

            try {
                let insertSQL;
                let bindValues;

                switch(tableType) {
                    case 'tax_brackets':
                        insertSQL = `
                            INSERT OR REPLACE INTO tax_brackets
                            (tax_year, filing_status, min_income, max_income, rate)
                            VALUES (?, ?, ?, ?, ?)
                        `;
                        bindValues = [
                            parseInt(row.tax_year),
                            row.filing_status,
                            parseFloat(row.min_income),
                            row.max_income ? parseFloat(row.max_income) : null,
                            parseFloat(row.rate)
                        ];
                        break;

                    case 'capital_gains':
                        insertSQL = `
                            INSERT OR REPLACE INTO capital_gains_rates
                            (tax_year, filing_status, gain_type, min_income, max_income, rate)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `;
                        bindValues = [
                            parseInt(row.tax_year),
                            row.filing_status,
                            row.gain_type,
                            parseFloat(row.min_income),
                            row.max_income ? parseFloat(row.max_income) : null,
                            parseFloat(row.rate)
                        ];
                        break;

                    case 'standard_deductions':
                        insertSQL = `
                            INSERT OR REPLACE INTO standard_deductions
                            (tax_year, filing_status, amount)
                            VALUES (?, ?, ?)
                        `;
                        bindValues = [
                            parseInt(row.tax_year),
                            row.filing_status,
                            parseFloat(row.amount)
                        ];
                        break;

                    case 'mileage_rates':
                        insertSQL = `
                            INSERT OR REPLACE INTO irs_mileage_rates
                            (tax_year, purpose, rate, effective_date)
                            VALUES (?, ?, ?, ?)
                        `;
                        bindValues = [
                            parseInt(row.tax_year),
                            row.purpose,
                            parseFloat(row.rate),
                            row.effective_date
                        ];
                        break;

                    case 'contribution_limits':
                        insertSQL = `
                            INSERT OR REPLACE INTO contribution_limits
                            (tax_year, rule_type, filing_status, value, description)
                            VALUES (?, ?, ?, ?, ?)
                        `;
                        bindValues = [
                            parseInt(row.tax_year),
                            row.rule_type,
                            row.filing_status || null,
                            parseFloat(row.value),
                            row.description
                        ];
                        break;

                    default:
                        errors.push({
                            row: i,
                            error: `Unknown table_type: ${tableType}`
                        });
                        continue;
                }

                // Execute the insert
                await env.DB.prepare(insertSQL).bind(...bindValues).run();
                stats[tableType].success++;

            } catch (rowError) {
                const tableName = tableType === 'capital_gains' ? 'capital_gains' : tableType;
                stats[tableName] ? stats[tableName].errors++ : null;
                errors.push({
                    row: i,
                    table: tableType,
                    error: rowError.message,
                    data: row
                });
                console.error(`Error inserting row ${i}:`, rowError);
            }
        }

        // Calculate totals
        const totalSuccess = Object.values(stats).reduce((sum, s) => sum + s.success, 0);
        const totalErrors = Object.values(stats).reduce((sum, s) => sum + s.errors, 0);

        return Response.json({
            success: true,
            message: `Import completed: ${totalSuccess} rows imported, ${totalErrors} errors`,
            stats,
            errors: errors.slice(0, 10) // Return first 10 errors
        });

    } catch (error) {
        console.error('Tax import error:', error);
        return Response.json({
            success: false,
            error: 'Failed to import tax data: ' + error.message
        }, { status: 500 });
    }
}

// GET endpoint to check table status
export async function onRequestGet(context) {
    const { env, request } = context;

    try {
        // Verify admin authentication
        const token = request.headers.get('Authorization');
        if (!token || !token.includes('admin')) {
            return Response.json({
                success: false,
                error: 'Unauthorized - Admin access required'
            }, { status: 401 });
        }

        // Check each table and get row counts
        const tables = [
            'tax_brackets',
            'capital_gains_rates',
            'standard_deductions',
            'irs_mileage_rates',
            'contribution_limits',
            'user_tax_settings'
        ];

        const tableCounts = {};

        for (const table of tables) {
            try {
                const result = await env.DB.prepare(`SELECT COUNT(*) as count FROM ${table}`).first();
                tableCounts[table] = result ? result.count : 0;
            } catch (e) {
                tableCounts[table] = 'Not created';
            }
        }

        return Response.json({
            success: true,
            tables: tableCounts,
            message: 'Use the import tool to upload all_tax_data_2024_2026.csv'
        });

    } catch (error) {
        console.error('Tax table check error:', error);
        return Response.json({
            success: false,
            error: 'Failed to check tax tables: ' + error.message
        }, { status: 500 });
    }
}

// DELETE endpoint to clear ALL tax tables
export async function onRequestDelete(context) {
    const { env, request } = context;

    try {
        // Verify admin authentication
        const token = request.headers.get('Authorization');
        if (!token || !token.includes('admin')) {
            return Response.json({
                success: false,
                error: 'Unauthorized - Admin access required'
            }, { status: 401 });
        }

        const tables = [
            'tax_brackets',
            'capital_gains_rates',
            'standard_deductions',
            'irs_mileage_rates',
            'contribution_limits'
        ];

        let totalDeleted = 0;

        for (const table of tables) {
            try {
                const result = await env.DB.prepare(`DELETE FROM ${table}`).run();
                totalDeleted += result.meta.changes;
            } catch (e) {
                console.error(`Error clearing ${table}:`, e);
            }
        }

        return Response.json({
            success: true,
            message: `Cleared ${totalDeleted} total rows from all tax tables`
        });

    } catch (error) {
        console.error('Tax table clear error:', error);
        return Response.json({
            success: false,
            error: 'Failed to clear tax tables: ' + error.message
        }, { status: 500 });
    }
}