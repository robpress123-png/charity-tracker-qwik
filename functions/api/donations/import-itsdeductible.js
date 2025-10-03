// API endpoint for importing ItsDeductible donation data
export async function onRequestPost({ request, env }) {
    try {
        // Verify authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const token = authHeader.substring(7);
        const sessionData = await env.KV.get(`session_${token}`);

        if (!sessionData) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid session' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const session = JSON.parse(sessionData);
        const userId = session.userId;

        // Parse the import data
        const importData = await request.json();
        const { items, money, mileage, stock } = importData;

        let imported = 0;
        let errors = [];

        // Helper function to parse dates from ItsDeductible format
        function parseItsDeductibleDate(dateStr) {
            // Format: "October 3, 2025" or "June 7, 2025"
            const months = {
                'January': '01', 'February': '02', 'March': '03', 'April': '04',
                'May': '05', 'June': '06', 'July': '07', 'August': '08',
                'September': '09', 'October': '10', 'November': '11', 'December': '12'
            };

            const parts = dateStr.split(' ');
            const month = months[parts[0]];
            const day = parts[1].replace(',', '').padStart(2, '0');
            const year = parts[2];

            return `${year}-${month}-${day}`;
        }

        // Helper to find or create charity
        async function findOrCreateCharity(charityName, charityAddress) {
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
            // Group items by charity and date to create consolidated item donations
            const groupedItems = {};

            for (const item of items) {
                const key = `${item['Charity']}_${item['Donation Date']}`;

                if (!groupedItems[key]) {
                    groupedItems[key] = {
                        charity: item['Charity'],
                        charityAddress: item['Charity Address'] || '',
                        date: item['Donation Date'],
                        items: []
                    };
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

                groupedItems[key].items.push({
                    itemName: item['Item Description'],
                    quantity: parseInt(item['Quantity']) || 1,
                    unitValue: parseFloat(item['Fair Market Value per Unit in $']) || 0,
                    totalValue: parseFloat(item['Donation Value in $']) || 0,
                    condition: condition
                });
            }

            // Create donations for each group
            for (const group of Object.values(groupedItems)) {
                try {
                    const charityId = await findOrCreateCharity(group.charity, group.charityAddress);
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
                    const charityId = await findOrCreateCharity(donation['Charity'], donation['Charity Address'] || '');
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
                    const charityId = await findOrCreateCharity(donation['Charity'], donation['Charity Address'] || '');
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
                    const charityId = await findOrCreateCharity(donation['Charity'], donation['Charity Address'] || '');
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
        console.error('ItsDeductible import error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Import failed'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}