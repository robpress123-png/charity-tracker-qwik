export async function onRequestPost(context) {
    const { request, env } = context;

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
                    // Update existing item
                    await env.DB.prepare(`
                        UPDATE donation_items
                        SET description = ?,
                            unit = ?,
                            value_good = ?,
                            value_very_good = ?,
                            value_excellent = ?,
                            source_reference = ?,
                            min_condition_note = ?,
                            updated_at = datetime('now'),
                            last_updated_by = 'csv_import'
                        WHERE id = ?
                    `).bind(
                        item.description || item.name,
                        item.unit || 'each',
                        parseFloat(item.value_good) || 0,
                        parseFloat(item.value_very_good) || parseFloat(item.value_good) * 1.5,
                        parseFloat(item.value_excellent) || parseFloat(item.value_good) * 2,
                        item.source_reference || 'Goodwill Guide 2024',
                        item.min_condition_note || 'Good condition or better required',
                        existingCheck.id
                    ).run();

                    results.updated++;
                } else if (!existingCheck) {
                    // Insert new item
                    await env.DB.prepare(`
                        INSERT INTO donation_items (
                            category_id, name, description, unit,
                            value_poor, value_fair, value_good, value_excellent,
                            source_reference, min_condition_note,
                            is_active, sort_order,
                            created_at, updated_at, last_updated_by
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 'csv_import')
                    `).bind(
                        parseInt(item.category_id),
                        item.name,
                        item.description || item.name,
                        item.unit || 'each',
                        0, // value_poor - not used but in schema
                        0, // value_fair - not used but in schema
                        parseFloat(item.value_good) || 0,
                        parseFloat(item.value_excellent) || parseFloat(item.value_good) * 2,
                        item.source_reference || 'Goodwill Guide 2024',
                        item.min_condition_note || 'Good condition or better required',
                        1, // is_active
                        parseInt(item.sort_order) || 100
                    ).run();

                    results.added++;
                }

            } catch (error) {
                results.failed++;
                results.errors.push(`Row ${i}: ${error.message}`);
            }
        }

        // Log import to history
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