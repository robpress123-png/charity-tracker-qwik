// API endpoint for importing ItsDeductible donation data
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        console.log('[ItsDeductible Import] Starting import process...');

        // Verify authentication (same pattern as donations.js)
        const authHeader = request.headers.get('Authorization');
        let userId = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            // Parse the token to get user ID
            // Token format is "token-{userId}-{timestamp}" from login.js
            if (token.startsWith('token-')) {
                const parts = token.split('-');
                if (parts.length >= 2) {
                    userId = parts[1]; // Extract the user ID from token
                }
            } else if (token === 'test-token') {
                // For test token, we need to look up the test user
                const testUserStmt = env.DB.prepare("SELECT id FROM users WHERE email = 'test@example.com'");
                const testUser = await testUserStmt.first();
                if (testUser) {
                    userId = testUser.id;
                }
            }
        }

        if (!userId) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Unauthorized - invalid or missing token'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse the import data
        let importData;
        try {
            importData = await request.json();
            console.log('[ItsDeductible Import] Successfully parsed JSON data');
            console.log('[ItsDeductible Import] Data structure:', {
                hasItems: !!importData.items,
                hasMoney: !!importData.money,
                hasMileage: !!importData.mileage,
                hasStock: !!importData.stock,
                hasDonations: !!importData.donations,
                keys: Object.keys(importData)
            });
        } catch (parseError) {
            console.error('[ItsDeductible Import] Failed to parse JSON:', parseError);
            throw new Error('Invalid JSON data: ' + parseError.message);
        }

        // Determine donation types based on column headers
        const categorizedDonations = {
            items: [],
            money: [],
            mileage: [],
            stock: []
        };

        // Helper function to determine donation type from column headers
        function determineDonationType(row) {
            if (!row || typeof row !== 'object') {
                console.error('[ItsDeductible Import] Invalid row:', row);
                return 'items';
            }

            const columns = Object.keys(row);
            console.log('[ItsDeductible Import] Analyzing columns:', columns);
            const columnsLower = columns.map(c => c.toLowerCase());

            // Check for unique columns that identify each type
            // Mileage: has "Miles Driven" or "IRS Rate per Mile"
            if (columns.some(c => c.includes('Miles Driven')) ||
                columns.some(c => c.includes('IRS Rate per Mile'))) {
                return 'mileage';
            }

            // Stock: has "Stock Symbol" or "Original Cost Adjusted Basis" or "Full Name of Stock"
            if (columns.some(c => c.includes('Stock Symbol')) ||
                columns.some(c => c.includes('Original Cost Adjusted Basis')) ||
                columns.some(c => c.includes('Full Name of Stock'))) {
                return 'stock';
            }

            // Cash/Money: has "Payment Type" but no Item Description/Quality
            if (columns.some(c => c.includes('Payment Type')) &&
                !columns.some(c => c.includes('Item Description') || c.includes('Quality'))) {
                return 'money';
            }

            // Items: has "Item Description" or "Quality" or "Quantity" (for items)
            if (columns.some(c => c.includes('Item Description')) ||
                columns.some(c => c.includes('Quality')) ||
                (columns.some(c => c.includes('Quantity')) && !columns.some(c => c.includes('Stock')))) {
                return 'items';
            }

            // Default to items if unsure
            console.warn('Could not determine donation type from columns:', columns);
            return 'items';
        }

        // Process each type of donation from the import
        try {
            if (importData.items && Array.isArray(importData.items)) {
                console.log(`[ItsDeductible Import] Processing ${importData.items.length} items`);
                for (const row of importData.items) {
                    const type = determineDonationType(row);
                    categorizedDonations[type].push(row);
                }
            }
            if (importData.money && Array.isArray(importData.money)) {
                console.log(`[ItsDeductible Import] Processing ${importData.money.length} money donations`);
                for (const row of importData.money) {
                    const type = determineDonationType(row);
                    categorizedDonations[type].push(row);
                }
            }
            if (importData.mileage && Array.isArray(importData.mileage)) {
                console.log(`[ItsDeductible Import] Processing ${importData.mileage.length} mileage donations`);
                for (const row of importData.mileage) {
                    const type = determineDonationType(row);
                    categorizedDonations[type].push(row);
                }
            }
            if (importData.stock && Array.isArray(importData.stock)) {
                console.log(`[ItsDeductible Import] Processing ${importData.stock.length} stock donations`);
                for (const row of importData.stock) {
                    const type = determineDonationType(row);
                    categorizedDonations[type].push(row);
                }
            }

            // Also check if we got a flat array (all donations in one array)
            if (importData.donations && Array.isArray(importData.donations)) {
                console.log(`[ItsDeductible Import] Processing ${importData.donations.length} donations (flat array)`);
                for (const row of importData.donations) {
                    const type = determineDonationType(row);
                    categorizedDonations[type].push(row);
                }
            }
        } catch (categorizationError) {
            console.error('[ItsDeductible Import] Error categorizing donations:', categorizationError);
            throw new Error('Failed to categorize donations: ' + categorizationError.message);
        }

        // Log what we determined
        console.log('Categorized donations:', {
            itemsCount: categorizedDonations.items.length,
            moneyCount: categorizedDonations.money.length,
            mileageCount: categorizedDonations.mileage.length,
            stockCount: categorizedDonations.stock.length
        });

        // Log sample of each type to verify categorization
        if (categorizedDonations.items.length > 0) {
            console.log('First item columns:', Object.keys(categorizedDonations.items[0]));
        }
        if (categorizedDonations.money.length > 0) {
            console.log('First money columns:', Object.keys(categorizedDonations.money[0]));
        }
        if (categorizedDonations.mileage.length > 0) {
            console.log('First mileage columns:', Object.keys(categorizedDonations.mileage[0]));
        }
        if (categorizedDonations.stock.length > 0) {
            console.log('First stock columns:', Object.keys(categorizedDonations.stock[0]));
        }

        const { items, money, mileage, stock } = categorizedDonations;

        let imported = 0;
        let errors = [];

        // Helper function to parse dates from ItsDeductible format
        function parseItsDeductibleDate(dateStr) {
            // Check if date string is valid
            if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
                // Return today's date as fallback
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            // Format: "October 3, 2025" or "June 7, 2025"
            const months = {
                'January': '01', 'February': '02', 'March': '03', 'April': '04',
                'May': '05', 'June': '06', 'July': '07', 'August': '08',
                'September': '09', 'October': '10', 'November': '11', 'December': '12'
            };

            try {
                const parts = dateStr.split(' ');
                if (parts.length < 3) {
                    throw new Error('Invalid date format');
                }

                const month = months[parts[0]];
                const day = parts[1].replace(',', '').padStart(2, '0');
                const year = parts[2];

                if (!month || !day || !year) {
                    throw new Error('Invalid date components');
                }

                return `${year}-${month}-${day}`;
            } catch (error) {
                console.error('Error parsing ItsDeductible date:', dateStr, error);
                // Return today's date as fallback
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        }

        // Helper to find or create charity
        async function findOrCreateCharity(charityName, charityAddress) {
            // Validate charity name
            if (!charityName || charityName.trim() === '') {
                throw new Error('Charity name is required');
            }

            // First check if charity exists in main database
            let charityResult = await env.DB.prepare(
                'SELECT id FROM charities WHERE LOWER(name) = LOWER(?) LIMIT 1'
            ).bind(charityName).first();

            if (charityResult) {
                return charityResult.id;
            }

            // Check user's personal charities
            charityResult = await env.DB.prepare(
                'SELECT id FROM user_charities WHERE user_id = ? AND LOWER(name) = LOWER(?) LIMIT 1'
            ).bind(userId, charityName).first();

            if (charityResult) {
                return charityResult.id;
            }

            // Create new personal charity
            const newCharityId = `charity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await env.DB.prepare(
                'INSERT INTO user_charities (id, user_id, name, address) VALUES (?, ?, ?, ?)'
            ).bind(newCharityId, userId, charityName, charityAddress).run();

            return newCharityId;
        }

        // Process ITEM donations
        if (items && items.length > 0) {
            console.log(`[ItsDeductible Import] Processing ${items.length} categorized items`);
            // Group items by charity and date to create consolidated item donations
            const groupedItems = {};

            for (const item of items) {
                // Skip items without required fields
                if (!item['Charity'] || !item['Donation Date']) {
                    console.log('[ItsDeductible Import] Skipping item with missing charity or date:', item);
                    continue;
                }

                const key = `${item['Charity']}_${item['Donation Date']}`;

                if (!groupedItems[key]) {
                    groupedItems[key] = {
                        charity: item['Charity'],
                        charityAddress: item['Charity Address'] || '',
                        date: item['Donation Date'],
                        items: [],
                        // Include mapping info if present (from any item in the group)
                        mapped_charity_id: item.mapped_charity_id || undefined,
                        create_personal: item.create_personal || false
                    };
                } else if (!groupedItems[key].mapped_charity_id && item.mapped_charity_id) {
                    // If this item has mapping info and the group doesn't, add it
                    groupedItems[key].mapped_charity_id = item.mapped_charity_id;
                    groupedItems[key].create_personal = item.create_personal || false;
                }

                // Map ItsDeductible quality to our condition values
                let condition = 'good';
                if (item['Quality'] === 'High') {
                    condition = 'excellent';
                } else if (item['Quality'] === 'Medium') {
                    condition = 'very_good';
                } else if (item['Quality'] === 'Low') {
                    condition = 'good';
                }

                // Handle different possible column names
                const itemDesc = item['Item Description'] || item['Item'] || item['Description'] || '';
                const qty = item['Quantity'] || item['Qty'] || '1';
                const unitVal = item['Fair Market Value per Unit in $'] || item['Unit Value'] || item['FMV per Unit'] || '0';
                const totalVal = item['Donation Value in $'] || item['Total Value'] || item['FMV'] || '0';

                groupedItems[key].items.push({
                    itemName: itemDesc,
                    quantity: parseInt(qty) || 1,
                    unitValue: parseFloat(unitVal) || 0,
                    totalValue: parseFloat(totalVal) || 0,
                    condition: condition
                });
            }

            // Create donations for each group
            for (const group of Object.values(groupedItems)) {
                try {
                    console.log('Processing item group for charity:', group.charity, 'mapped_id:', group.mapped_charity_id);

                    // Use mapped charity ID if provided, otherwise find/create
                    let charityId;
                    if (group.mapped_charity_id) {
                        charityId = group.mapped_charity_id;
                        console.log('Using mapped charity ID:', charityId);
                    } else if (group.create_personal) {
                        charityId = await findOrCreateCharity(group.charity, group.charityAddress);
                        console.log('Created personal charity:', charityId);
                    } else {
                        charityId = await findOrCreateCharity(group.charity, group.charityAddress);
                        console.log('Found/created charity:', charityId);
                    }
                    const donationDate = parseItsDeductibleDate(group.date);
                    const totalValue = group.items.reduce((sum, item) => sum + item.totalValue, 0);

                    // Create the main donation record
                    const donationId = `don_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                    await env.DB.prepare(`
                        INSERT INTO donations (
                            id, user_id, charity_id, charity_name, donation_date,
                            donation_type, amount, notes
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        donationId, userId, charityId, group.charity, donationDate,
                        'items', totalValue, 'Imported from ItsDeductible'
                    ).run();

                    // Add individual items
                    for (const item of group.items) {
                        // Try to find matching item category
                        let category = 'Miscellaneous';

                        // Simple category matching based on keywords
                        const itemNameLower = item.itemName.toLowerCase();
                        if (itemNameLower.includes('clothing') || itemNameLower.includes('shirt') ||
                            itemNameLower.includes('pants') || itemNameLower.includes('dress') ||
                            itemNameLower.includes('shoes') || itemNameLower.includes('jacket')) {
                            category = 'Clothing, Footwear & Accessories';
                        } else if (itemNameLower.includes('furniture')) {
                            category = 'Furniture & Furnishings';
                        } else if (itemNameLower.includes('book')) {
                            category = 'Books, Movies & Music';
                        } else if (itemNameLower.includes('toy')) {
                            category = 'Toys, Games & Hobbies';
                        } else if (itemNameLower.includes('kitchen')) {
                            category = 'Kitchen';
                        } else if (itemNameLower.includes('bed') || itemNameLower.includes('sheet')) {
                            category = 'Bedding & Linens';
                        }

                        const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                        await env.DB.prepare(`
                            INSERT INTO donation_items (
                                id, donation_id, item_name, category, condition,
                                quantity, unit_value, total_value
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `).bind(
                            itemId, donationId, item.itemName, category, item.condition,
                            item.quantity, item.unitValue, item.totalValue
                        ).run();
                    }

                    imported++;
                } catch (error) {
                    errors.push(`Failed to import items for ${group.charity}: ${error.message}`);
                }
            }
        }

        // Process CASH donations
        if (money && money.length > 0) {
            for (const donation of money) {
                try {
                    // Skip donations without required fields
                    if (!donation['Charity'] || !donation['Donation Date']) {
                        console.log('Skipping cash donation with missing charity or date:', donation);
                        continue;
                    }

                    // Use mapped charity ID if provided, otherwise find/create
                    let charityId;
                    if (donation.mapped_charity_id) {
                        charityId = donation.mapped_charity_id;
                    } else {
                        charityId = await findOrCreateCharity(donation['Charity'], donation['Charity Address'] || '');
                    }
                    const donationDate = parseItsDeductibleDate(donation['Donation Date']);
                    const amount = parseFloat(donation['Donation Value in $']) || 0;

                    const donationId = `don_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                    const notes = `Payment: ${donation['Payment Type']}${donation['Additional Description'] && donation['Additional Description'] !== '-' ?
                                  `, ${donation['Additional Description']}` : ''} (Imported from ItsDeductible)`;

                    await env.DB.prepare(`
                        INSERT INTO donations (
                            id, user_id, charity_id, charity_name, donation_date,
                            donation_type, amount, notes
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        donationId, userId, charityId, donation['Charity'], donationDate,
                        'cash', amount, notes
                    ).run();

                    imported++;
                } catch (error) {
                    errors.push(`Failed to import cash donation for ${donation['Charity']}: ${error.message}`);
                }
            }
        }

        // Process MILEAGE donations
        if (mileage && mileage.length > 0) {
            for (const donation of mileage) {
                try {
                    // Skip donations without required fields
                    if (!donation['Charity'] || !donation['Donation Date']) {
                        console.log('Skipping mileage donation with missing charity or date:', donation);
                        continue;
                    }

                    // Use mapped charity ID if provided, otherwise find/create
                    let charityId;
                    if (donation.mapped_charity_id) {
                        charityId = donation.mapped_charity_id;
                    } else {
                        charityId = await findOrCreateCharity(donation['Charity'], donation['Charity Address'] || '');
                    }
                    const donationDate = parseItsDeductibleDate(donation['Donation Date']);
                    const milesDriven = parseFloat(donation['Miles Driven']) || 0;
                    const mileageRate = parseFloat(donation['IRS Rate per Mile in $']) || 0.14;
                    const totalValue = parseFloat(donation['Donation Value in $']) || 0;

                    const donationId = `don_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                    await env.DB.prepare(`
                        INSERT INTO donations (
                            id, user_id, charity_id, charity_name, donation_date,
                            donation_type, miles_driven, mileage_rate, amount,
                            mileage_purpose, notes
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        donationId, userId, charityId, donation['Charity'], donationDate,
                        'mileage', milesDriven, mileageRate, totalValue,
                        'Charitable', 'Imported from ItsDeductible'
                    ).run();

                    imported++;
                } catch (error) {
                    errors.push(`Failed to import mileage donation for ${donation['Charity']}: ${error.message}`);
                }
            }
        }

        // Process STOCK donations
        if (stock && stock.length > 0) {
            for (const donation of stock) {
                try {
                    // Skip donations without required fields
                    if (!donation['Charity'] || !donation['Donation Date']) {
                        console.log('Skipping stock donation with missing charity or date:', donation);
                        continue;
                    }

                    // Use mapped charity ID if provided, otherwise find/create
                    let charityId;
                    if (donation.mapped_charity_id) {
                        charityId = donation.mapped_charity_id;
                    } else {
                        charityId = await findOrCreateCharity(donation['Charity'], donation['Charity Address'] || '');
                    }
                    const donationDate = parseItsDeductibleDate(donation['Donation Date']);
                    const costBasis = parseFloat(donation['Original Cost Adjusted Basis in $']) || 0;
                    const fairMarketValue = parseFloat(donation['Fair Market Value on Date Donated in $']) || 0;
                    const totalValue = parseFloat(donation['Donation Value in $']) || 0;

                    const donationId = `don_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                    const notes = `Stock: ${donation['Full Name of Stock']} (${donation['Stock Symbol']}), ` +
                                 `Purchased: ${donation['Original Purchase Date']} (Imported from ItsDeductible)`;

                    await env.DB.prepare(`
                        INSERT INTO donations (
                            id, user_id, charity_id, charity_name, donation_date,
                            donation_type, stock_symbol, cost_basis, fair_market_value,
                            amount, notes
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        donationId, userId, charityId, donation['Charity'], donationDate,
                        'stock', donation['Stock Symbol'], costBasis, fairMarketValue,
                        totalValue, notes
                    ).run();

                    imported++;
                } catch (error) {
                    errors.push(`Failed to import stock donation for ${donation['Charity']}: ${error.message}`);
                }
            }
        }

        // Return results
        return new Response(JSON.stringify({
            success: true,
            imported: imported,
            errors: errors.length > 0 ? errors : undefined,
            message: `Successfully imported ${imported} donations from ItsDeductible`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[ItsDeductible Import] CRITICAL ERROR:', error);
        console.error('[ItsDeductible Import] Error stack:', error.stack);
        console.error('[ItsDeductible Import] Error details:', {
            message: error.message,
            name: error.name,
            cause: error.cause
        });

        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Import failed',
            details: error.stack,
            type: error.name
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}