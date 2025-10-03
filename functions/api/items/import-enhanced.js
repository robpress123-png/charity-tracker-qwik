/**
 * Enhanced Items Import with Smart Matching and Versioning
 * POST /api/items/import-enhanced
 * Supports duplicate detection, fuzzy matching, and date-based versioning
 */

// Simple fuzzy matching function
function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 100;

    // Calculate Levenshtein distance
    const matrix = [];
    for (let i = 0; i <= s2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= s1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= s2.length; i++) {
        for (let j = 1; j <= s1.length; j++) {
            if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    const distance = matrix[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return Math.round(((maxLength - distance) / maxLength) * 100);
}

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
            source = 'Manual Import',
            effectiveDate = new Date().toISOString().split('T')[0],
            duplicateHandling = 'review', // 'replace', 'keep_both', 'skip', 'review'
            matchThreshold = 85, // Similarity threshold for fuzzy matching
            overrideSettings = false // Whether UI settings override CSV values
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
            skipped: 0,
            potentialMatches: [],
            errors: []
        };

        // Process each row
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            results.processed++;

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

                // Use CSV source/date if present and not overridden
                const itemSource = (!overrideSettings && item.source_reference) ? item.source_reference : source;
                const itemDate = (!overrideSettings && item.effective_date) ? item.effective_date : effectiveDate;

                // Find exact and potential matches
                const exactMatch = await env.DB.prepare(`
                    SELECT id, name, category_id, item_variant, effective_date,
                           value_good, value_very_good, value_excellent
                    FROM items
                    WHERE name = ?
                      AND (category_id = ? OR (category_id IS NULL AND ? IS NULL))
                      AND (item_variant = ? OR (item_variant IS NULL AND ? IS NULL))
                `).bind(
                    item.name,
                    item.category_id || null, item.category_id || null,
                    item.item_variant || null, item.item_variant || null
                ).first();

                // Find similar items for fuzzy matching
                const similarItems = await env.DB.prepare(`
                    SELECT id, name, category_id, item_variant, effective_date,
                           value_good, value_very_good, value_excellent
                    FROM items
                    WHERE category_id = ? OR category_id IS NULL
                    LIMIT 100
                `).bind(item.category_id || null).all();

                const potentialMatches = [];
                if (similarItems.results) {
                    for (const similar of similarItems.results) {
                        const similarity = calculateSimilarity(item.name, similar.name);
                        if (similarity >= matchThreshold && similarity < 100) {
                            potentialMatches.push({
                                ...similar,
                                similarity,
                                newItem: item
                            });
                        }
                    }
                }

                // Handle based on duplicate strategy
                if (exactMatch) {
                    switch (duplicateHandling) {
                        case 'replace':
                            // Update with new values
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
                                item.description || exactMatch.description,
                                parseFloat(item.value_good) || 0,
                                parseFloat(item.value_very_good) || 0,
                                parseFloat(item.value_excellent) || 0,
                                itemSource,
                                itemDate,
                                item.search_keywords || null,
                                item.original_description || null,
                                parseFloat(item.value_good) || 0,
                                parseFloat(item.value_excellent) || 0,
                                exactMatch.id
                            ).run();
                            results.updated++;
                            break;

                        case 'keep_both':
                            // Insert as new with different effective date
                            await insertNewItem(env.DB, item, itemSource, itemDate);
                            results.added++;
                            break;

                        case 'skip':
                            results.skipped++;
                            break;

                        case 'review':
                        default:
                            results.potentialMatches.push({
                                row: i,
                                item: item,
                                match: exactMatch,
                                type: 'exact',
                                similarity: 100
                            });
                            break;
                    }
                } else if (potentialMatches.length > 0 && duplicateHandling === 'review') {
                    // Only flag for review if there's a VERY close match (90%+)
                    const hasCloseMatch = potentialMatches.some(m => m.similarity >= 90);
                    if (hasCloseMatch) {
                        // Store for review
                        results.potentialMatches.push({
                            row: i,
                            item: item,
                            matches: potentialMatches.filter(m => m.similarity >= 90),
                            type: 'fuzzy'
                        });
                    } else {
                        // No close match, just insert as new
                        await insertNewItem(env.DB, item, itemSource, itemDate);
                        results.added++;
                    }
                } else {
                    // Insert new item
                    await insertNewItem(env.DB, item, itemSource, itemDate);
                    results.added++;
                }

            } catch (error) {
                results.errors.push(`Row ${i}: ${error.message}`);
            }
        }

        // Log import history
        try {
            await env.DB.prepare(`
                INSERT INTO import_history (
                    import_type, source, effective_date,
                    records_processed, records_added, records_updated, records_skipped,
                    error_log, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
                'items',
                source,
                effectiveDate,
                results.processed,
                results.added,
                results.updated,
                results.skipped,
                results.errors.length > 0 ? results.errors.join('\n') : null
            ).run();
        } catch (e) {
            // Import history table might not exist
            console.log('Import history logging skipped:', e.message);
        }

        return new Response(JSON.stringify({
            success: true,
            results,
            needsReview: results.potentialMatches.length > 0
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

async function insertNewItem(db, item, source, effectiveDate) {
    // Map category_id to category name if needed
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

    const categoryName = item.category || categoryMap[item.category_id] || 'Miscellaneous';

    return await db.prepare(`
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
        categoryName,
        parseFloat(item.value_good) || 0,
        parseFloat(item.value_excellent) || 0
    ).run();
}