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

                // Check if item exists
                const existingCheck = await env.DB.prepare(
                    'SELECT id FROM donation_items WHERE name = ? AND category_id = ?'
                ).bind(item.name, item.category_id).first();

                if (existingCheck && !updateExisting) {
                    results.failed++;
                    results.errors.push(`Row ${i}: Item "${item.name}" already exists in category ${item.category_id}`);
                    continue;
                }

                if (existingCheck && updateExisting) {
                    // Update existing item - simplified for basic schema
                    await env.DB.prepare(`
                        UPDATE donation_items
                        SET description = ?,
                            value_poor = ?,
                            value_fair = ?,
                            value_good = ?,
                            value_excellent = ?
                        WHERE id = ?
                    `).bind(
                        item.description || item.name,
                        0, // value_poor - not used
                        parseFloat(item.value_very_good) || parseFloat(item.value_good) * 1.5,
                        parseFloat(item.value_good) || 0,
                        parseFloat(item.value_excellent) || parseFloat(item.value_good) * 2,
                        existingCheck.id
                    ).run();

                    results.updated++;
                } else if (!existingCheck) {
                    // Insert new item - simplified for basic schema
                    await env.DB.prepare(`
                        INSERT INTO donation_items (
                            category_id, name, description,
                            value_poor, value_fair, value_good, value_excellent
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        parseInt(item.category_id),
                        item.name,
                        item.description || item.name,
                        0, // value_poor - not used but in schema
                        parseFloat(item.value_very_good) || parseFloat(item.value_good) * 1.5, // use very_good for fair column
                        parseFloat(item.value_good) || 0,
                        parseFloat(item.value_excellent) || parseFloat(item.value_good) * 2
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
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}