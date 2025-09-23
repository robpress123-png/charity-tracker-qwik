export async function onRequestPost(context) {
    const { request, env } = context;

    // Check database connection - try different binding names
    const db = env.DB || env['charity-tracker-qwik-db'] || env.DATABASE;

    if (!db) {
        console.error('Database not configured. Available env keys:', Object.keys(env));
        return new Response(JSON.stringify({
            success: false,
            error: 'Database connection not available. Please configure D1 binding in Cloudflare Pages settings.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Use the found database for all operations
    env.DB = db;

    try {
        const contentType = request.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Content-Type must be application/json'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { csvData, updateExisting = false } = await request.json();

        if (!csvData) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No CSV data provided'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse CSV data
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        // Validate required headers
        const requiredHeaders = ['category_id', 'name', 'value_good', 'value_very_good', 'value_excellent'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
            return new Response(JSON.stringify({
                success: false,
                error: `Missing required columns: ${missingHeaders.join(', ')}`
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const results = {
            processed: 0,
            added: 0,
            updated: 0,
            failed: 0,
            errors: []
        };

        // Process each row
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            results.processed++;

            try {
                // Parse CSV row (handle quoted values)
                const values = [];
                let current = '';
                let inQuotes = false;

                for (let char of lines[i]) {
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        values.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                values.push(current.trim());

                // Create item object
                const item = {};
                headers.forEach((header, index) => {
                    item[header] = values[index] || '';
                });

                // Validate required fields
                if (!item.category_id || !item.name || !item.value_good) {
                    results.failed++;
                    results.errors.push(`Row ${i}: Missing required fields`);
                    continue;
                }

                // Check database connection
                if (!env.DB) {
                    console.error('Database connection not available');
                    results.failed++;
                    results.errors.push(`Row ${i}: Database connection error`);
                    continue;
                }

                // Map category_id to category name
                const categoryMap = {
                    1: "Clothing - Women",
                    2: "Clothing - Men",
                    3: "Clothing - Children",
                    4: "Electronics",
                    5: "Furniture",
                    6: "Household Items",
                    7: "Appliances",
                    8: "Books & Media",
                    9: "Sports & Recreation",
                    10: "Toys & Games",
                    11: "Tools & Equipment",
                    12: "Jewelry & Accessories"
                };

                const categoryName = categoryMap[item.category_id] || `Category ${item.category_id}`;

                // Check if item exists
                const existingCheck = await env.DB.prepare(
                    'SELECT id FROM items WHERE name = ? AND category = ?'
                ).bind(item.name, categoryName).first();

                if (existingCheck && !updateExisting) {
                    results.failed++;
                    results.errors.push(`Row ${i}: Item "${item.name}" already exists in category ${item.category_id}`);
                    continue;
                }

                if (existingCheck && updateExisting) {
                    // Update existing item
                    await env.DB.prepare(`
                        UPDATE items
                        SET low_value = ?,
                            high_value = ?,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).bind(
                        parseFloat(item.value_good) || 0,
                        parseFloat(item.value_excellent) || parseFloat(item.value_good) * 2,
                        existingCheck.id
                    ).run();

                    results.updated++;
                } else if (!existingCheck) {
                    // Insert new item into items table
                    await env.DB.prepare(`
                        INSERT INTO items (
                            name, category, low_value, high_value, tax_deductible
                        ) VALUES (?, ?, ?, ?, ?)
                    `).bind(
                        item.name,
                        categoryName,
                        parseFloat(item.value_good) || 0,
                        parseFloat(item.value_excellent) || parseFloat(item.value_good) * 2,
                        1  // tax_deductible = true
                    ).run();

                    results.added++;
                }

            } catch (error) {
                results.failed++;
                results.errors.push(`Row ${i}: ${error.message}`);
            }
        }

        // Skip import history logging if table doesn't exist
        try {
            await env.DB.prepare(`
                INSERT INTO import_history (
                    file_name, import_type,
                    records_processed, records_added, records_updated, records_failed,
                    error_log, imported_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `).bind(
                'csv_import',
                'donation_items',
                results.processed,
                results.added,
                results.updated,
                results.failed,
                results.errors.length > 0 ? results.errors.join('\n') : null,
                'admin'
            ).run();
        } catch (e) {
            // Import history table might not exist, continue anyway
            console.log('Import history logging skipped:', e.message);
        }

        return new Response(JSON.stringify({
            success: true,
            results
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Import error details:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack,
            details: 'Check browser console and Cloudflare logs for more details'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}