/**
 * Batch Items Import with Chunking
 * POST /api/items/import-batch
 * Processes items in chunks to avoid Cloudflare Workers limits
 */

export async function onRequestPost(context) {
    const { request, env } = context;

    // Check database connection
    const db = env.DB || env['charity-tracker-qwik-db'] || env.DATABASE;

    if (!db) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Database connection not available'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    env.DB = db;

    try {
        const body = await request.json();
        const {
            csvData,
            chunk,
            totalChunks,
            source = 'ItsDeductible 2024',
            effectiveDate = new Date().toISOString().split('T')[0],
            duplicateHandling = 'replace', // 'replace', 'skip', 'keep_both'
            sessionId = Date.now().toString() // For tracking multi-chunk imports
        } = body;

        if (!csvData) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No CSV data provided'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse CSV
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        // Map headers to our schema
        const headerMap = {
            'id': 'id',
            'category_id': 'category_id',
            'category': 'category',
            'name': 'name',
            'item_variant': 'item_variant',
            'variant': 'item_variant',
            'description': 'description',
            'value_good': 'value_good',
            'good': 'value_good',
            'value_very_good': 'value_very_good',
            'very_good': 'value_very_good',
            'value_excellent': 'value_excellent',
            'excellent': 'value_excellent',
            'search_keywords': 'search_keywords',
            'keywords': 'search_keywords',
            'original_description': 'original_description'
        };

        const results = {
            processed: 0,
            added: 0,
            updated: 0,
            unchanged: 0,
            skipped: 0,
            failed: 0,
            errors: [],
            chunk: chunk || 1,
            totalChunks: totalChunks || 1,
            sessionId: sessionId
        };

        // Category mapping for backward compatibility
        const categoryMap = {
            1: "Automotive Supplies",
            2: "Baby Gear",
            3: "Bedding & Linens",
            4: "Books, Movies & Music",
            5: "Cameras & Equipment",
            6: "Clothing, Footwear & Accessories",
            7: "Computers & Office",
            8: "Furniture & Furnishings",
            9: "Health & Beauty",
            10: "Home Audio & Video",
            11: "Housekeeping",
            12: "Kitchen",
            13: "Lawn & Patio",
            14: "Luggage, Backpacks & Cases",
            15: "Major Appliances",
            16: "Musical Instruments",
            17: "Pet Supplies",
            18: "Phones & Communications",
            19: "Sporting Goods",
            20: "Tools & Hardware",
            21: "Toys, Games & Hobbies",
            22: "Portable Audio & Video",
            99: "Miscellaneous"
        };

        // Batch all items for processing
        const itemsToProcess = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            try {
                // Parse CSV row with proper quote handling
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

                // Map values to item object
                const item = {};
                headers.forEach((header, index) => {
                    const mappedHeader = headerMap[header] || header;
                    item[mappedHeader] = values[index] || '';
                });

                // Validate required fields
                if (!item.name) {
                    results.errors.push(`Row ${i}: Missing item name`);
                    continue;
                }

                // Add category name for backward compatibility
                item.category = item.category || categoryMap[item.category_id] || 'Miscellaneous';
                item.rowNum = i;
                itemsToProcess.push(item);

            } catch (error) {
                results.errors.push(`Row ${i}: ${error.message}`);
            }
        }

        // Get all existing items in one query (much more efficient)
        const existingItems = {};
        if (duplicateHandling !== 'keep_both') {
            const existing = await env.DB.prepare(`
                SELECT id, name, category_id, item_variant,
                       value_good, value_very_good, value_excellent
                FROM items
            `).all();

            if (existing.results) {
                for (const item of existing.results) {
                    const key = `${item.name}|${item.category_id || ''}|${item.item_variant || ''}`;
                    existingItems[key] = item;
                }
            }
        }

        // Process items in batches to avoid too many bindings
        // SQLite limit is ~999 variables, with 14 fields per item = ~70 items max
        // Using 20 to be safe: 20 items × 14 fields = 280 variables
        const BATCH_SIZE = 20; // Process 20 items at a time to stay under SQLite limits

        for (let i = 0; i < itemsToProcess.length; i += BATCH_SIZE) {
            const batch = itemsToProcess.slice(i, Math.min(i + BATCH_SIZE, itemsToProcess.length));

            // Prepare batch insert/update statements
            const insertValues = [];
            const updateStatements = [];

            for (const item of batch) {
                try {
                    const key = `${item.name}|${item.category_id || ''}|${item.item_variant || ''}`;
                    const exists = existingItems[key];

                    results.processed++;

                    if (exists) {
                        if (duplicateHandling === 'replace') {
                            // Check if values actually changed
                            const valuesChanged =
                                parseFloat(exists.value_good || 0) !== parseFloat(item.value_good || 0) ||
                                parseFloat(exists.value_very_good || 0) !== parseFloat(item.value_very_good || 0) ||
                                parseFloat(exists.value_excellent || 0) !== parseFloat(item.value_excellent || 0);

                            if (valuesChanged) {
                                // Prepare update only if values changed
                                updateStatements.push({
                                    id: exists.id,
                                    item: item
                                });
                                results.updated++;
                            } else {
                                results.unchanged++;
                            }
                        } else if (duplicateHandling === 'skip') {
                            results.skipped++;
                        }
                    } else {
                        // Prepare insert
                        insertValues.push(item);
                        results.added++;
                    }
                } catch (itemError) {
                    results.failed++;
                    results.errors.push(`Item ${item.name}: ${itemError.message}`);
                }
            }

            // Execute inserts one at a time (like charity import which works)
            for (const item of insertValues) {
                try {
                    await env.DB.prepare(`
                        INSERT INTO items (
                            category_id, name, item_variant, description,
                            value_good, value_very_good, value_excellent,
                            source_reference, effective_date, search_keywords, original_description,
                            category, low_value, high_value,
                            created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    `).bind(
                        parseInt(item.category_id) || null,
                        item.name,
                        item.item_variant || null,
                        item.description || null,
                        parseFloat(item.value_good) || 0,
                        parseFloat(item.value_very_good) || 0,
                        parseFloat(item.value_excellent) || 0,
                        source,
                        effectiveDate,
                        item.search_keywords || null,
                        item.original_description || null,
                        item.category,
                        parseFloat(item.value_good) || 0,
                        parseFloat(item.value_excellent) || 0
                    ).run();
                } catch (error) {
                    // More detailed error logging to identify the problem
                    const errorDetail = {
                        name: item.name,
                        category_id: item.category_id,
                        variant: item.item_variant,
                        error: error.message
                    };
                    console.error(`Failed to insert item:`, errorDetail);

                    // Show first 5 detailed errors, rest as summary
                    if (results.errors.length < 5) {
                        results.errors.push(`${item.name} (Cat:${item.category_id}): ${error.message}`);
                    } else if (results.errors.length === 5) {
                        results.errors.push(`... and more items failed with similar errors`);
                    }

                    results.failed++;
                    results.added--; // Revert the count
                }
            }

            // Execute batch updates (one at a time due to binding limitations)
            for (const update of updateStatements) {
                try {
                    await env.DB.prepare(`
                        UPDATE items SET
                            description = ?,
                            value_good = ?,
                            value_very_good = ?,
                            value_excellent = ?,
                            source_reference = ?,
                            effective_date = ?,
                            search_keywords = ?,
                            original_description = ?,
                            low_value = ?,
                            high_value = ?,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).bind(
                        update.item.description || null,
                        parseFloat(update.item.value_good) || 0,
                        parseFloat(update.item.value_very_good) || 0,
                        parseFloat(update.item.value_excellent) || 0,
                        source,
                        effectiveDate,
                        update.item.search_keywords || null,
                        update.item.original_description || null,
                        parseFloat(update.item.value_good) || 0,
                        parseFloat(update.item.value_excellent) || 0,
                        update.id
                    ).run();
                } catch (error) {
                    results.errors.push(`Update failed for ${update.item.name}: ${error.message}`);
                    results.failed++;
                    results.updated--;
                }
            }
        }

        // Log import history (only on last chunk)
        if (chunk === totalChunks || !chunk) {
            try {
                await env.DB.prepare(`
                    INSERT INTO import_history (
                        import_type, source, effective_date,
                        records_processed, records_added, records_updated, records_skipped,
                        error_log, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                `).bind(
                    'items_batch',
                    source,
                    effectiveDate,
                    results.processed,
                    results.added,
                    results.updated,
                    results.skipped,
                    results.errors.length > 0 ? results.errors.slice(0, 100).join('\n') : null
                ).run();
            } catch (e) {
                // Import history table might not exist
                console.log('Import history logging skipped:', e.message);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            results,
            completed: chunk === totalChunks || !chunk
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Import error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}