/**
 * Cloudflare Pages Function for importing donations - v2.0.0
 * POST /api/donations/import - Import donations from CSV with smart charity matching
 * Supports proper donation_items table for itemized donations
 */

// Helper function to get user from token
function getUserFromToken(token) {
    if (!token || !token.startsWith('Bearer ')) {
        return null;
    }

    const tokenValue = token.replace('Bearer ', '');

    // For demo/test mode
    if (tokenValue === 'test-token' || tokenValue === 'demo-token') {
        return { id: '1', email: 'test@example.com' };
    }

    // Parse real token format: token-{userId}-{timestamp}
    if (tokenValue.startsWith('token-')) {
        const parts = tokenValue.split('-');
        if (parts.length >= 3) {
            return { id: parts[1], email: parts[2] || 'user@example.com' };
        }
    }

    return null;
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Check authentication
        const token = request.headers.get('Authorization');
        console.log('[IMPORT DEBUG] Token received:', token ? token.substring(0, 20) + '...' : 'None');
        let user = getUserFromToken(token);
        console.log('[IMPORT DEBUG] Initial user from token:', user);

        if (!user) {
            // Try to get real user ID from database
            if (token && token.startsWith('Bearer token-')) {
                const parts = token.replace('Bearer token-', '').split('-');
                if (parts.length >= 1 && env.DB) {
                    const userId = parts[0];
                    const userCheck = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
                    if (userCheck) {
                        // Create a user object since it was null
                        user = { id: userId, email: 'user@example.com' };
                        console.log('[IMPORT DEBUG] Created user object from token:', user);
                    } else {
                        console.log('[IMPORT DEBUG] User ID not found in database:', userId);
                    }
                }
            }

            if (!user || !user.id) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Authentication required'
                }), {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }

        const body = await request.json();
        const { donations, charityMappings } = body;

        if (!donations || !Array.isArray(donations)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid request: donations array required'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Check if D1 database is available
        if (!env.DB) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Database not available'
            }), {
                status: 503,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get test user ID if needed
        if (user.id === '1') {
            const testUser = await env.DB.prepare("SELECT id FROM users WHERE email = 'test@example.com'").first();
            if (testUser) {
                user.id = testUser.id;
            }
        }

        // First, get all charities for name matching
        let allCharities = { results: [] };
        try {
            // Try to get system charities - get ALL of them for better matching
            const systemCharities = await env.DB.prepare(`
                SELECT id, name, ein, 'system' as type FROM charities
            `).all();

            // Try to get user charities
            const userCharities = await env.DB.prepare(`
                SELECT id, name, ein, 'personal' as type FROM user_charities WHERE user_id = ?
            `).bind(user.id).all();

            allCharities.results = [
                ...(systemCharities.results || []),
                ...(userCharities.results || [])
            ];

            console.log(`[DEBUG] Found ${systemCharities.results?.length || 0} system charities and ${userCharities.results?.length || 0} user charities`);
        } catch (charityError) {
            console.error('[ERROR] Failed to load charities:', charityError);
            // Continue with empty charity list - all will need to be personal charities
        }

        // Create a lookup map for charity names (case-insensitive)
        const charityMap = new Map();
        allCharities.results.forEach(charity => {
            // Store by exact name
            charityMap.set(charity.name.toLowerCase(), charity);

            // Also store common variations
            const cleanName = charity.name.toLowerCase()
                .replace(/\b(inc|incorporated|llc|ltd|foundation|fund|charity|organization|org)\b/gi, '')
                .replace(/[^\w\s]/g, '')
                .trim();
            if (cleanName !== charity.name.toLowerCase()) {
                charityMap.set(cleanName, charity);
            }
        });

        const results = {
            processed: 0,
            added: 0,
            skipped: 0,
            failed: 0,
            errors: [],
            charityMatches: {
                found: 0,
                notFound: [],
                totalCharitiesInDB: allCharities.results.length
            }
        };

        console.log('[IMPORT DEBUG] Starting import for user:', user.id);
        console.log('[IMPORT DEBUG] Total donations to process:', donations.length);
        console.log('[IMPORT DEBUG] Total charities in DB:', allCharities.results.length);

        // Process donations
        for (const donation of donations) {
            results.processed++;

            try {
                // Smart charity matching
                let charityId = null;
                let userCharityId = null;
                let charityType = null;

                // First try: Use validated mappings if provided
                if (charityMappings && charityMappings[donation.charity_name]) {
                    const mapping = charityMappings[donation.charity_name];
                    if (mapping.type === 'personal') {
                        userCharityId = mapping.id;
                        charityType = 'personal';
                    } else {
                        charityId = mapping.id;
                        charityType = 'system';
                    }
                    results.charityMatches.found++;
                }
                // Second try: direct ID if provided
                else if (donation.charity_id) {
                    charityId = donation.charity_id;
                    charityType = 'system';
                }
                // Third try: match by name
                else if (donation.charity_name) {
                    const searchName = donation.charity_name.toLowerCase();
                    const match = charityMap.get(searchName);

                    if (match) {
                        // Exact match found
                        if (match.type === 'personal') {
                            userCharityId = match.id;
                            charityType = 'personal';
                        } else {
                            charityId = match.id;
                            charityType = 'system';
                        }
                        results.charityMatches.found++;
                        console.log(`[IMPORT DEBUG] Found exact match for "${donation.charity_name}"`);
                    } else {
                        // Try cleaned name for fuzzy matching
                        const cleanName = searchName
                            .replace(/\b(inc|incorporated|llc|ltd|foundation|fund|charity|organization|org)\b/gi, '')
                            .replace(/[^\w\s]/g, '')
                            .trim();

                        const cleanMatch = charityMap.get(cleanName);
                        if (cleanMatch) {
                            if (cleanMatch.type === 'personal') {
                                userCharityId = cleanMatch.id;
                                charityType = 'personal';
                            } else {
                                charityId = cleanMatch.id;
                                charityType = 'system';
                            }
                            results.charityMatches.found++;
                            console.log(`[IMPORT DEBUG] Found fuzzy match for "${donation.charity_name}" -> "${cleanMatch.name}"`);
                        } else {
                            // Try partial match
                            let foundPartialMatch = false;
                            for (const [key, charity] of charityMap) {
                                if (key.includes(searchName) || searchName.includes(key)) {
                                    if (charity.type === 'personal') {
                                        userCharityId = charity.id;
                                        charityType = 'personal';
                                    } else {
                                        charityId = charity.id;
                                        charityType = 'system';
                                    }
                                    results.charityMatches.found++;
                                    foundPartialMatch = true;
                                    console.log(`[IMPORT DEBUG] Found partial match for "${donation.charity_name}" -> "${charity.name}"`);
                                    break;
                                }
                            }

                            if (!foundPartialMatch) {
                                // No matches at all - check if personal charity already exists or create new one
                                console.log(`[IMPORT DEBUG] No match for "${donation.charity_name}" - checking for existing personal charity`);
                                try {
                                    // First check if this personal charity already exists for this user
                                    const existingPersonalCharity = await env.DB.prepare(`
                                        SELECT id FROM user_charities
                                        WHERE user_id = ? AND LOWER(name) = LOWER(?)
                                    `).bind(user.id, donation.charity_name).first();

                                    if (existingPersonalCharity) {
                                        // Reuse existing personal charity
                                        userCharityId = existingPersonalCharity.id;
                                        charityType = 'personal';
                                        console.log(`[IMPORT DEBUG] Found existing personal charity with ID: ${userCharityId}`);

                                        // Update charity map to include this for future donations in same import
                                        charityMap.set(donation.charity_name.toLowerCase(), {
                                            id: userCharityId,
                                            name: donation.charity_name,
                                            type: 'personal'
                                        });
                                    } else {
                                        // Create new personal charity
                                        const newCharityId = crypto.randomUUID();
                                        await env.DB.prepare(`
                                            INSERT INTO user_charities (id, user_id, name, ein, created_at)
                                            VALUES (?, ?, ?, ?, datetime('now'))
                                        `).bind(newCharityId, user.id, donation.charity_name, null).run();

                                        userCharityId = newCharityId;
                                        charityType = 'personal';
                                        results.charityMatches.notFound.push(donation.charity_name);

                                        // Track personal charity creation
                                        if (!results.personalCharitiesCreated) {
                                            results.personalCharitiesCreated = 0;
                                        }
                                        results.personalCharitiesCreated++;
                                        console.log(`[IMPORT DEBUG] Created new personal charity with ID: ${newCharityId}`);

                                        // Add to charity map for future donations in same import
                                        charityMap.set(donation.charity_name.toLowerCase(), {
                                            id: newCharityId,
                                            name: donation.charity_name,
                                            type: 'personal'
                                        });
                                    }
                                } catch (createError) {
                                    console.error(`[IMPORT DEBUG] Failed to handle personal charity: ${createError.message}`);
                                    results.failed++;
                                    results.errors.push(`Row ${results.processed}: Failed to handle personal charity: ${donation.charity_name}`);
                                    continue;
                                }
                            }
                        }
                    }
                }

                if (!charityId && !userCharityId) {
                    results.failed++;
                    results.errors.push(`Row ${results.processed}: No charity specified`);
                    continue;
                }

                // Prepare donation data
                const donationId = crypto.randomUUID();
                const donationType = donation.donation_type || 'cash';
                const amount = parseFloat(donation.amount) || 0;
                const donationDate = donation.donation_date || donation.date || new Date().toISOString().split('T')[0];

                // Notes will be stored as plain text in the database
                // For items donations, the ITEMS:[...] format in notes will be parsed separately

                // Parse type-specific fields from CSV
                let miles_driven = null, mileage_rate = null, mileage_purpose = null;
                let stock_symbol = null, stock_quantity = null, fair_market_value = null;
                let crypto_symbol = null, crypto_quantity = null, crypto_type = null;
                let item_description = null, estimated_value = null;

                // Extract type-specific data based on donation type
                if (donationType === 'miles') {
                    miles_driven = parseFloat(donation.miles_driven) || parseFloat(donation.miles) || null;
                    mileage_rate = parseFloat(donation.mileage_rate) || 0.14;
                    mileage_purpose = donation.mileage_purpose || donation.purpose || null;

                    // Try to parse from description if fields not provided
                    if (!miles_driven && donation.description) {
                        const milesMatch = donation.description.match(/(\d+\.?\d*)\s*miles/i);
                        if (milesMatch) miles_driven = parseFloat(milesMatch[1]);
                        const purposeMatch = donation.description.match(/- (.+)$/);
                        if (purposeMatch) mileage_purpose = purposeMatch[1];
                    }
                } else if (donationType === 'stock') {
                    stock_symbol = donation.stock_symbol || donation.symbol || null;
                    stock_quantity = parseFloat(donation.stock_quantity) || parseFloat(donation.shares) || null;
                    fair_market_value = parseFloat(donation.fair_market_value) || parseFloat(donation.price_per_share) || null;

                    // Try to parse from description if fields not provided
                    if (!stock_symbol && donation.description) {
                        const symbolMatch = donation.description.match(/^([A-Z]+):/);
                        if (symbolMatch) stock_symbol = symbolMatch[1];
                        const sharesMatch = donation.description.match(/(\d+\.?\d*)\s*shares/i);
                        if (sharesMatch) stock_quantity = parseFloat(sharesMatch[1]);
                        const priceMatch = donation.description.match(/@\s*\$(\d+\.?\d*)/);
                        if (priceMatch) fair_market_value = parseFloat(priceMatch[1]);
                    }
                } else if (donationType === 'crypto') {
                    crypto_symbol = donation.crypto_symbol || donation.symbol || null;
                    crypto_quantity = parseFloat(donation.crypto_quantity) || parseFloat(donation.quantity) || null;
                    crypto_type = donation.crypto_type || donation.crypto_name || null;

                    // Try to parse from description if fields not provided
                    if (!crypto_symbol && donation.description) {
                        const symbolMatch = donation.description.match(/^([A-Z]+):/);
                        if (symbolMatch) crypto_symbol = symbolMatch[1];
                        const qtyMatch = donation.description.match(/(\d+\.?\d*)\s*units/i);
                        if (qtyMatch) crypto_quantity = parseFloat(qtyMatch[1]);
                    }
                } else if (donationType === 'items') {
                    item_description = donation.item_description || donation.description || null;
                    estimated_value = parseFloat(donation.estimated_value) || amount || null;
                }

                // Insert donation with ALL proper columns
                console.log(`[IMPORT DEBUG] Inserting donation ${results.processed}:`, {
                    donationId,
                    userId: user.id,
                    charityId,
                    userCharityId,
                    donationType,
                    amount,
                    donationDate
                });

                await env.DB.prepare(`
                    INSERT INTO donations (
                        id, user_id, charity_id, user_charity_id, donation_type, amount, date, notes,
                        miles_driven, mileage_rate, mileage_purpose,
                        stock_symbol, stock_quantity, fair_market_value,
                        crypto_symbol, crypto_quantity, crypto_type,
                        item_description, estimated_value,
                        created_at
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?,
                        ?, ?, ?,
                        ?, ?, ?,
                        ?, ?, ?,
                        ?, ?,
                        CURRENT_TIMESTAMP
                    )
                `).bind(
                    donationId,
                    user.id,
                    charityId,      // Will be NULL for personal charities
                    userCharityId,  // Will be NULL for system charities
                    donationType,
                    amount,
                    donationDate,
                    donation.notes || '',  // User notes only
                    miles_driven, mileage_rate, mileage_purpose,
                    stock_symbol, stock_quantity, fair_market_value,
                    crypto_symbol, crypto_quantity, crypto_type,
                    item_description, estimated_value
                ).run();

                console.log(`[IMPORT DEBUG] Successfully inserted donation ${donationId}`);

                // For items donations, parse items from notes or items column
                if (donationType === 'items') {
                    const itemsCreated = [];

                    // First check for individual item columns (item_1_name, item_2_name, etc.)
                    let hasIndividualItems = false;
                    for (let i = 1; i <= 10; i++) {
                        const itemName = donation[`item_${i}_name`];
                        if (itemName && itemName.trim()) {
                            hasIndividualItems = true;
                            const category = donation[`item_${i}_category`] || 'General';
                            const condition = donation[`item_${i}_condition`] || 'good';
                            const quantity = parseInt(donation[`item_${i}_quantity`]) || 1;

                            // Look up value from database if not provided in CSV
                            let value = parseFloat(donation[`item_${i}_value`]) || 0;
                            let unitValue = value / quantity;

                            // If no value provided, look it up from the items database
                            if (!value || value === 0) {
                                try {
                                    const itemResult = await env.DB.prepare(`
                                        SELECT low_value, high_value
                                        FROM items
                                        WHERE name = ? AND category = ?
                                    `).bind(itemName, category).first();

                                    if (itemResult) {
                                        // Calculate value based on condition
                                        const lowValue = parseFloat(itemResult.low_value) || 0;
                                        const highValue = parseFloat(itemResult.high_value) || 0;

                                        if (condition === 'excellent') {
                                            unitValue = highValue;
                                        } else if (condition === 'very_good') {
                                            unitValue = (lowValue + highValue) / 2;
                                        } else if (condition === 'good') {
                                            unitValue = lowValue;
                                        } else { // fair
                                            unitValue = 0; // Not tax deductible
                                        }

                                        value = unitValue * quantity;
                                        console.log(`[IMPORT DEBUG] Calculated value for ${itemName}: ${condition} = $${unitValue} x ${quantity} = $${value}`);
                                    } else {
                                        console.log(`[IMPORT DEBUG] Item not found in database: ${itemName} (${category})`);
                                    }
                                } catch (lookupError) {
                                    console.error(`[IMPORT DEBUG] Error looking up item value:`, lookupError);
                                }
                            }

                            console.log(`[IMPORT DEBUG] Adding item ${i}: ${itemName}, ${category}, ${condition}, qty=${quantity}, value=${value}`);

                            await env.DB.prepare(`
                                INSERT INTO donation_items (
                                    donation_id, item_name, category, condition, quantity, unit_value, total_value
                                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                                donationId,
                                itemName,
                                category,
                                condition,
                                quantity,
                                unitValue,
                                value
                            ).run();

                            itemsCreated.push(itemName);
                        }
                    }

                    // If no individual items found, check if items column exists (from CSV)
                    if (!hasIndividualItems && donation.items) {
                        // Parse format: ItemName:condition or ItemName:condition:quantity
                        // Multiple items separated by |
                        const itemsList = donation.items.split('|');

                        for (const itemStr of itemsList) {
                            const parts = itemStr.trim().split(':');
                            if (parts.length >= 2) {
                                const itemName = parts[0];
                                const condition = parts[1];
                                const quantity = parts[2] ? parseInt(parts[2]) : 1;

                                // For now, use estimated values - will be looked up from DB later
                                const unitValue = 0; // Will be looked up based on item and condition

                                await env.DB.prepare(`
                                    INSERT INTO donation_items (
                                        donation_id, item_name, category, condition, quantity, unit_value, total_value
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                                `).bind(
                                    donationId,
                                    itemName,
                                    null, // Category will be determined later
                                    condition,
                                    quantity,
                                    unitValue,
                                    unitValue * quantity
                                ).run();

                                itemsCreated.push(itemName);
                            }
                        }
                    }
                    // Legacy format: Check if notes contains structured items data
                    else if (donation.notes && donation.notes.includes('ITEMS:')) {
                        // Parse format: ITEMS:[name|category|condition|qty|value][name|category|condition|qty|value]
                        const itemsMatch = donation.notes.match(/ITEMS:\[(.+)\]/g);
                        if (itemsMatch) {
                            const itemsString = itemsMatch[0].replace('ITEMS:', '');
                            const itemMatches = itemsString.match(/\[([^\]]+)\]/g);

                            if (itemMatches) {
                                for (const itemMatch of itemMatches) {
                                    const itemData = itemMatch.replace(/\[|\]/g, '').split('|');
                                    if (itemData.length >= 5) {
                                        const [itemName, category, condition, quantity, value] = itemData;
                                        const qty = parseInt(quantity) || 1;
                                        const unitValue = parseFloat(value) / qty;

                                        await env.DB.prepare(`
                                            INSERT INTO donation_items (
                                                donation_id, item_name, category, condition, quantity, unit_value, total_value
                                            ) VALUES (?, ?, ?, ?, ?, ?, ?)
                                        `).bind(
                                            donationId,
                                            itemName,
                                            category,
                                            condition,
                                            qty,
                                            unitValue,
                                            parseFloat(value)
                                        ).run();

                                        itemsCreated.push(itemName);
                                    }
                                }
                            }
                        }
                    }

                    // Only create generic items if no real items were found AND this is an items donation
                    if (itemsCreated.length === 0) {
                        console.log('[IMPORT DEBUG] No items found in CSV, creating generic items');
                        // Parse item count from notes if available
                        const itemCountMatch = donation.notes ? donation.notes.match(/(\d+)\s*items/i) : null;
                        const itemCount = itemCountMatch ? parseInt(itemCountMatch[1]) : 3;

                        // Create generic items based on amount
                        const avgValue = amount / itemCount;

                        for (let i = 1; i <= Math.min(itemCount, 10); i++) {
                            await env.DB.prepare(`
                                INSERT INTO donation_items (
                                    donation_id, item_name, category, condition, quantity, unit_value, total_value
                                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                                donationId,
                                `Donated Item ${i}`,
                                'General',
                                'good',
                                1,
                                avgValue,
                                avgValue
                            ).run();
                        }
                    } else {
                        console.log(`[IMPORT DEBUG] Created ${itemsCreated.length} items for donation ${donationId}`);
                    }
                }

                results.added++;

            } catch (error) {
                console.error(`[IMPORT DEBUG] Error processing donation ${results.processed}:`, error);
                results.failed++;
                if (results.errors.length < 20) {
                    results.errors.push(`Row ${results.processed}: ${error.message}`);
                }
            }
        }

        console.log('[IMPORT DEBUG] Final Results:', {
            processed: results.processed,
            added: results.added,
            failed: results.failed,
            skipped: results.skipped,
            personalCharitiesCreated: results.personalCharitiesCreated || 0,
            errors: results.errors.length
        });

        // Return detailed results
        return new Response(JSON.stringify({
            success: true,
            results,
            message: results.personalCharitiesCreated > 0
                ? `Import completed: ${results.added} donations added (${results.charityMatches.found} matched existing charities, ${results.personalCharitiesCreated} personal charities created)`
                : `Import completed: ${results.added} donations added (all matched existing charities)`,
            unmatchedCharities: results.charityMatches.notFound.length > 0
                ? `Created ${results.personalCharitiesCreated || 0} personal charities for: ${results.charityMatches.notFound.join(', ')}`
                : null
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Import error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Import failed: ' + error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// CORS preflight handler
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        }
    });
}