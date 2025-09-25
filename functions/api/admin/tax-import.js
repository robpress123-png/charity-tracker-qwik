// API endpoint for importing tax data from CSV
// POST /api/admin/tax-import

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
        const tableType = formData.get('tableType');

        if (!file || !tableType) {
            return Response.json({
                success: false,
                error: 'Missing file or table type'
            }, { status: 400 });
        }

        // Read CSV content
        const csvContent = await file.text();
        const lines = csvContent.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        let tableName;
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // Determine table based on type
        switch(tableType) {
            case 'tax_brackets':
                tableName = 'tax_brackets';
                break;
            case 'capital_gains':
                tableName = 'capital_gains_rates';
                break;
            case 'standard_deductions':
                tableName = 'standard_deductions';
                break;
            case 'mileage_rates':
                tableName = 'irs_mileage_rates';
                break;
            case 'contribution_limits':
                tableName = 'contribution_limits';
                break;
            default:
                return Response.json({
                    success: false,
                    error: 'Invalid table type'
                }, { status: 400 });
        }

        // Process each data row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',').map(v => v.trim());
            const row = {};

            // Map values to headers
            headers.forEach((header, index) => {
                let value = values[index];
                // Handle empty values (NULL for max_income, etc.)
                if (value === '' || value === 'NULL' || value === 'null') {
                    value = null;
                }
                row[header] = value;
            });

            try {
                // Build INSERT statement based on table type
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
                }

                // Execute the insert
                await env.DB.prepare(insertSQL).bind(...bindValues).run();
                successCount++;

            } catch (rowError) {
                errorCount++;
                errors.push({
                    row: i,
                    error: rowError.message,
                    data: row
                });
                console.error(`Error inserting row ${i}:`, rowError);
            }
        }

        return Response.json({
            success: true,
            message: `Import completed: ${successCount} rows imported, ${errorCount} errors`,
            details: {
                tableName,
                totalRows: lines.length - 1,
                successCount,
                errorCount,
                errors: errors.slice(0, 10) // Return first 10 errors
            }
        });

    } catch (error) {
        console.error('Tax import error:', error);
        return Response.json({
            success: false,
            error: 'Failed to import tax data: ' + error.message
        }, { status: 500 });
    }
}

// GET endpoint to check if tables exist and get counts
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
            'contribution_limits'
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
            tables: tableCounts
        });

    } catch (error) {
        console.error('Tax table check error:', error);
        return Response.json({
            success: false,
            error: 'Failed to check tax tables: ' + error.message
        }, { status: 500 });
    }
}

// DELETE endpoint to clear a table (be careful!)
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

        const { tableType } = await request.json();

        let tableName;
        switch(tableType) {
            case 'tax_brackets':
                tableName = 'tax_brackets';
                break;
            case 'capital_gains':
                tableName = 'capital_gains_rates';
                break;
            case 'standard_deductions':
                tableName = 'standard_deductions';
                break;
            case 'mileage_rates':
                tableName = 'irs_mileage_rates';
                break;
            case 'contribution_limits':
                tableName = 'contribution_limits';
                break;
            default:
                return Response.json({
                    success: false,
                    error: 'Invalid table type'
                }, { status: 400 });
        }

        const result = await env.DB.prepare(`DELETE FROM ${tableName}`).run();

        return Response.json({
            success: true,
            message: `Cleared ${result.meta.changes} rows from ${tableName}`
        });

    } catch (error) {
        console.error('Tax table clear error:', error);
        return Response.json({
            success: false,
            error: 'Failed to clear tax table: ' + error.message
        }, { status: 500 });
    }
}