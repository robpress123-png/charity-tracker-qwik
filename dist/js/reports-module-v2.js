/**
 * Charity Tracker - Enhanced Phase 1 Reporting System with Item Details
 * Version: 2.12.1-fixed
 *
 * FIXED ISSUES:
 * - Now includes detailed item information for item donations
 * - Added missing Annual Tax Summary HTML generation
 * - Added complete ReportUI functionality
 * - Fixed error handling and null checks
 */

// Utility function to safely get auth token
function getReportAuthToken() {
    if (typeof getAuthToken !== 'undefined') {
        return getAuthToken();
    }
    // Fallback if main utilities not available
    if (typeof secureStorage !== 'undefined' && secureStorage.getAuth) {
        const auth = secureStorage.getAuth();
        if (auth?.token) return auth.token;
    }
    return sessionStorage.getItem('token') || localStorage.getItem('token');
}

// Utility function to safely get user data
function getReportAuthUser() {
    if (typeof getAuthUser !== 'undefined') {
        return getAuthUser();
    }
    // Fallback
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Failed to parse user data:', e);
        }
    }
    return null;
}

/**
 * CSV Export Utilities
 */
const CSVExporter = {
    /**
     * Convert array of objects to CSV string
     */
    arrayToCSV(data, columns) {
        if (!data || data.length === 0) {
            return '';
        }

        // If columns not specified, use all keys from first object
        if (!columns) {
            columns = Object.keys(data[0]);
        }

        // Create header row
        const header = columns.map(col => {
            // Handle column labels
            const label = typeof col === 'object' ? col.label : col;
            // Escape quotes and wrap in quotes if contains comma
            return label.includes(',') || label.includes('"')
                ? `"${label.replace(/"/g, '""')}"`
                : label;
        }).join(',');

        // Create data rows
        const rows = data.map(row => {
            return columns.map(col => {
                const key = typeof col === 'object' ? col.key : col;
                let value = row[key] || '';

                // Format based on type
                if (value instanceof Date) {
                    value = value.toISOString().split('T')[0];
                } else if (typeof value === 'number') {
                    value = value.toString();
                } else if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }

                // Escape and quote if necessary
                value = value.toString();
                return value.includes(',') || value.includes('"') || value.includes('\n')
                    ? `"${value.replace(/"/g, '""')}"`
                    : value;
            }).join(',');
        });

        return [header, ...rows].join('\n');
    },

    /**
     * Download CSV file
     */
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }
};

/**
 * Report Data Fetcher
 */
const ReportDataFetcher = {
    /**
     * Fetch all donations for a tax year with item details
     */
    async fetchDonationsWithItems(year) {
        const token = getReportAuthToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        try {
            const response = await fetch(`/api/donations?year=${year}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch donations');
            }

            const data = await response.json();
            const donations = data.donations || [];

            // For each item donation, fetch the detailed items
            const donationsWithDetails = await Promise.all(donations.map(async (donation) => {
                if (donation.donation_type === 'items' && donation.id) {
                    try {
                        // Fetch item details for this donation
                        const itemsResponse = await fetch(`/api/donations/${donation.id}/items`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (itemsResponse.ok) {
                            const itemsData = await itemsResponse.json();
                            donation.items = itemsData.items || [];
                        } else {
                            donation.items = [];
                        }
                    } catch (error) {
                        console.error(`Error fetching items for donation ${donation.id}:`, error);
                        donation.items = [];
                    }
                } else {
                    donation.items = [];
                }
                return donation;
            }));

            return donationsWithDetails;
        } catch (error) {
            console.error('Error fetching donations:', error);
            throw error;
        }
    },

    /**
     * Fetch all donations for a tax year (without item details for performance)
     */
    async fetchDonations(year) {
        const token = getReportAuthToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        try {
            const response = await fetch(`/api/donations?year=${year}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch donations');
            }

            const data = await response.json();
            return data.donations || [];
        } catch (error) {
            console.error('Error fetching donations:', error);
            throw error;
        }
    },

    /**
     * Fetch user tax settings for a year
     */
    async fetchTaxSettings(year) {
        const token = getReportAuthToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        try {
            // Use correct endpoint - /api/users/settings not tax-settings
            const response = await fetch(`/api/users/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`  // Add Bearer prefix
                }
            });

            if (!response.ok) {
                // Return defaults if no settings
                return {
                    filing_status: 'single',
                    tax_bracket: 22,
                    income_range: null
                };
            }

            const data = await response.json();
            // Extract tax settings for the specified year
            const taxSettings = data.tax_settings?.[year] || data;

            return {
                filing_status: taxSettings.filing_status || 'single',
                tax_bracket: taxSettings.tax_bracket || 22,
                income_range: taxSettings.income_range || null
            };
        } catch (error) {
            console.error('Error fetching tax settings:', error);
            // Return defaults
            return {
                filing_status: 'single',
                tax_bracket: 22,
                income_range: null
            };
        }
    },

    /**
     * Calculate tax savings
     */
    calculateTaxSavings(donations, taxBracket) {
        const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
        const taxSavings = (totalDonations * taxBracket) / 100;
        return {
            totalDonations,
            taxSavings,
            effectiveCost: totalDonations - taxSavings
        };
    }
};

/**
 * Phase 1 Report Generators - ENHANCED
 */
const ReportGenerators = {
    /**
     * 1. All Donations Export (CSV) - ENHANCED WITH ITEM DETAILS
     */
    async generateAllDonationsCSV(year) {
        const donations = await ReportDataFetcher.fetchDonationsWithItems(year);
        const user = getReportAuthUser();

        // Create flat export data with item details expanded
        const exportData = [];

        donations.forEach(d => {
            if (d.donation_type === 'items' && d.items && d.items.length > 0) {
                // For item donations, create a row for each item
                d.items.forEach(item => {
                    exportData.push({
                        donation_date: d.donation_date,
                        charity_name: d.charity_name || d.charity?.name || 'Unknown',
                        charity_ein: d.charity_ein || d.charity?.ein || '',
                        donation_type: 'items',

                        // Item-specific details
                        item_name: item.item_name || item.name || '',
                        item_category: item.category || '',
                        item_quantity: item.quantity || 1,
                        item_condition: item.condition || '',
                        item_value_per: item.value || 0,
                        item_total_value: (item.value || 0) * (item.quantity || 1),

                        // Keep donation total for reference
                        donation_total: d.amount || 0,

                        // Empty fields for non-applicable types
                        miles_driven: '',
                        mileage_rate: '',
                        mileage_purpose: '',
                        stock_symbol: '',
                        stock_quantity: '',
                        stock_price: '',
                        cost_basis: '',
                        crypto_symbol: '',
                        crypto_quantity: '',
                        crypto_price: '',

                        receipt_url: d.receipt_url || '',
                        notes: d.notes || '',
                        created_at: d.created_at
                    });
                });
            } else {
                // For non-item donations, create single row
                exportData.push({
                    donation_date: d.donation_date,
                    charity_name: d.charity_name || d.charity?.name || 'Unknown',
                    charity_ein: d.charity_ein || d.charity?.ein || '',
                    donation_type: d.donation_type,

                    // Empty item fields
                    item_name: '',
                    item_category: '',
                    item_quantity: '',
                    item_condition: '',
                    item_value_per: '',
                    item_total_value: '',

                    donation_total: d.amount || 0,

                    // Type-specific fields
                    miles_driven: d.miles_driven || '',
                    mileage_rate: d.mileage_rate || '',
                    mileage_purpose: d.mileage_purpose || '',

                    stock_symbol: d.stock_symbol || '',
                    stock_quantity: d.stock_quantity || '',
                    stock_price: d.fair_market_value || '',
                    cost_basis: d.cost_basis || '',

                    crypto_symbol: d.crypto_symbol || '',
                    crypto_quantity: d.crypto_quantity || '',
                    crypto_price: d.crypto_price_per_unit || '',

                    receipt_url: d.receipt_url || '',
                    notes: d.notes || '',
                    created_at: d.created_at
                });
            }
        });

        const columns = [
            { key: 'donation_date', label: 'Date' },
            { key: 'charity_name', label: 'Charity Name' },
            { key: 'charity_ein', label: 'EIN' },
            { key: 'donation_type', label: 'Type' },

            // Item-specific columns
            { key: 'item_name', label: 'Item Name' },
            { key: 'item_category', label: 'Item Category' },
            { key: 'item_quantity', label: 'Item Quantity' },
            { key: 'item_condition', label: 'Item Condition' },
            { key: 'item_value_per', label: 'Value Per Item' },
            { key: 'item_total_value', label: 'Item Total Value' },

            { key: 'donation_total', label: 'Donation Total' },

            // Other type fields
            { key: 'miles_driven', label: 'Miles' },
            { key: 'mileage_rate', label: 'Mileage Rate' },
            { key: 'mileage_purpose', label: 'Mileage Purpose' },
            { key: 'stock_symbol', label: 'Stock Symbol' },
            { key: 'stock_quantity', label: 'Shares' },
            { key: 'stock_price', label: 'Stock Price' },
            { key: 'cost_basis', label: 'Cost Basis' },
            { key: 'crypto_symbol', label: 'Crypto Symbol' },
            { key: 'crypto_quantity', label: 'Crypto Amount' },
            { key: 'crypto_price', label: 'Crypto Price' },
            { key: 'receipt_url', label: 'Receipt' },
            { key: 'notes', label: 'Notes' }
        ];

        const csv = CSVExporter.arrayToCSV(exportData, columns);
        const filename = `charity_tracker_all_donations_${year}_${user?.name?.replace(/\s+/g, '_') || 'export'}.csv`;

        CSVExporter.downloadCSV(csv, filename);
        return { success: true, count: exportData.length, donations: donations.length };
    },

    /**
     * 2. Item Donations Detail Report (CSV) - NEW
     */
    async generateItemDonationsReport(year) {
        const donations = await ReportDataFetcher.fetchDonationsWithItems(year);
        const user = getReportAuthUser();

        // Filter to only item donations and create detailed report
        const itemDonations = donations.filter(d => d.donation_type === 'items');
        const itemDetails = [];

        itemDonations.forEach(donation => {
            if (donation.items && donation.items.length > 0) {
                donation.items.forEach(item => {
                    itemDetails.push({
                        date: donation.donation_date,
                        charity: donation.charity_name || donation.charity?.name || 'Unknown',
                        ein: donation.charity_ein || donation.charity?.ein || '',
                        item_name: item.item_name || item.name || 'Unknown Item',
                        category: item.category || 'Other',
                        condition: item.condition || 'Good',
                        quantity: item.quantity || 1,
                        value_per_item: item.value || 0,
                        total_value: (item.value || 0) * (item.quantity || 1),
                        valuation_source: item.value_source || 'IRS Guidelines',
                        has_receipt: donation.receipt_url ? 'Yes' : 'No',
                        notes: item.notes || donation.notes || ''
                    });
                });
            } else {
                // Donation has no item details - add placeholder row
                itemDetails.push({
                    date: donation.donation_date,
                    charity: donation.charity_name || donation.charity?.name || 'Unknown',
                    ein: donation.charity_ein || donation.charity?.ein || '',
                    item_name: donation.description || 'Items (details not available)',
                    category: 'Unknown',
                    condition: 'Unknown',
                    quantity: '',
                    value_per_item: '',
                    total_value: donation.amount || 0,
                    valuation_source: 'Aggregate',
                    has_receipt: donation.receipt_url ? 'Yes' : 'No',
                    notes: donation.notes || ''
                });
            }
        });

        // Add summary row
        const totalValue = itemDetails.reduce((sum, item) => sum + (item.total_value || 0), 0);
        const totalItems = itemDetails.length;

        itemDetails.push({
            date: 'SUMMARY',
            charity: `${itemDonations.length} donations`,
            ein: '',
            item_name: `${totalItems} total items`,
            category: '',
            condition: '',
            quantity: '',
            value_per_item: '',
            total_value: totalValue,
            valuation_source: '',
            has_receipt: '',
            notes: ''
        });

        const columns = [
            { key: 'date', label: 'Date' },
            { key: 'charity', label: 'Charity' },
            { key: 'ein', label: 'EIN' },
            { key: 'item_name', label: 'Item Description' },
            { key: 'category', label: 'Category' },
            { key: 'condition', label: 'Condition' },
            { key: 'quantity', label: 'Quantity' },
            { key: 'value_per_item', label: 'Value Per Item' },
            { key: 'total_value', label: 'Total Value' },
            { key: 'valuation_source', label: 'Valuation Source' },
            { key: 'has_receipt', label: 'Receipt' },
            { key: 'notes', label: 'Notes' }
        ];

        const csv = CSVExporter.arrayToCSV(itemDetails, columns);
        const filename = `item_donations_detail_${year}_${user?.name?.replace(/\s+/g, '_') || 'export'}.csv`;

        CSVExporter.downloadCSV(csv, filename);
        return {
            success: true,
            donations: itemDonations.length,
            items: totalItems,
            totalValue: totalValue
        };
    },

    /**
     * 3. Schedule A Export (CSV) - ENHANCED
     * Now properly includes item donation totals
     */
    async generateScheduleAExport(year) {
        const donations = await ReportDataFetcher.fetchDonationsWithItems(year);
        const user = getReportAuthUser();

        // Group donations by charity
        const byCharity = {};
        donations.forEach(d => {
            const key = d.charity_ein || d.charity?.ein || 'UNKNOWN';
            if (!byCharity[key]) {
                byCharity[key] = {
                    ein: d.charity_ein || d.charity?.ein || '',
                    name: d.charity_name || d.charity?.name || 'Unknown Charity',
                    cash: 0,
                    noncash: 0,
                    total: 0
                };
            }

            const amount = d.amount || 0;
            if (d.donation_type === 'cash') {
                byCharity[key].cash += amount;
            } else {
                byCharity[key].noncash += amount;
            }
            byCharity[key].total += amount;
        });

        // Format for Schedule A
        const scheduleAData = Object.values(byCharity).map(charity => ({
            'Organization Name': charity.name,
            'EIN': charity.ein,
            'Cash Contributions': charity.cash.toFixed(2),
            'Non-Cash Contributions': charity.noncash.toFixed(2),
            'Total Contributions': charity.total.toFixed(2),
            'Type': 'Charitable Contribution',
            'Tax Year': year
        }));

        // Add summary row
        const totalCash = Object.values(byCharity).reduce((sum, c) => sum + c.cash, 0);
        const totalNonCash = Object.values(byCharity).reduce((sum, c) => sum + c.noncash, 0);
        const grandTotal = totalCash + totalNonCash;

        scheduleAData.push({
            'Organization Name': 'TOTAL',
            'EIN': '',
            'Cash Contributions': totalCash.toFixed(2),
            'Non-Cash Contributions': totalNonCash.toFixed(2),
            'Total Contributions': grandTotal.toFixed(2),
            'Type': 'Summary',
            'Tax Year': year
        });

        const csv = CSVExporter.arrayToCSV(scheduleAData);
        const filename = `schedule_a_${year}_${user?.name?.replace(/\s+/g, '_') || 'export'}.csv`;

        CSVExporter.downloadCSV(csv, filename);
        return {
            success: true,
            charities: Object.keys(byCharity).length,
            total: grandTotal
        };
    },

    /**
     * 4. Receipt Audit Report (CSV) - ENHANCED
     * Now includes item-level audit details
     */
    async generateReceiptAudit(year) {
        const donations = await ReportDataFetcher.fetchDonationsWithItems(year);
        const user = getReportAuthUser();

        // Analyze receipt status
        const auditData = [];

        donations.forEach(d => {
            const hasReceipt = !!d.receipt_url;
            const amount = d.amount || 0;
            const requiresReceipt = amount >= 250; // IRS requires receipts for $250+
            const requiresAppraisal = amount >= 5000 && d.donation_type !== 'cash'; // Non-cash over $5000

            let status = 'OK';
            let action = '';

            if (requiresAppraisal) {
                status = hasReceipt ? 'NEEDS APPRAISAL' : 'MISSING DOCS';
                action = 'Obtain qualified appraisal and attach Form 8283';
            } else if (requiresReceipt && !hasReceipt) {
                status = 'MISSING RECEIPT';
                action = 'Obtain written acknowledgment from charity';
            } else if (amount >= 75 && !hasReceipt) {
                status = 'RECEIPT RECOMMENDED';
                action = 'Consider obtaining receipt for your records';
            }

            // For item donations, add item-level details
            if (d.donation_type === 'items' && d.items && d.items.length > 0) {
                const itemList = d.items.map(item =>
                    `${item.quantity || 1}x ${item.item_name || item.name || 'Unknown'} ($${item.value || 0} each)`
                ).join('; ');

                auditData.push({
                    date: d.donation_date,
                    charity: d.charity_name || d.charity?.name || 'Unknown',
                    type: d.donation_type,
                    amount: amount.toFixed(2),
                    has_receipt: hasReceipt ? 'Yes' : 'No',
                    status: status,
                    action_required: action,
                    description: itemList
                });
            } else {
                auditData.push({
                    date: d.donation_date,
                    charity: d.charity_name || d.charity?.name || 'Unknown',
                    type: d.donation_type,
                    amount: amount.toFixed(2),
                    has_receipt: hasReceipt ? 'Yes' : 'No',
                    status: status,
                    action_required: action,
                    description: d.description || ''
                });
            }
        });

        // Add summary statistics
        const stats = {
            total: donations.length,
            with_receipts: auditData.filter(d => d.has_receipt === 'Yes').length,
            missing_required: auditData.filter(d => d.status === 'MISSING RECEIPT').length,
            needs_appraisal: auditData.filter(d => d.status === 'NEEDS APPRAISAL').length
        };

        // Add summary row
        auditData.push({
            date: 'SUMMARY',
            charity: `${stats.with_receipts}/${stats.total} documented`,
            type: '',
            amount: '',
            has_receipt: `${Math.round(stats.with_receipts / stats.total * 100)}%`,
            status: stats.missing_required > 0 ? 'ACTION NEEDED' : 'COMPLETE',
            action_required: `${stats.missing_required} receipts needed, ${stats.needs_appraisal} appraisals needed`,
            description: ''
        });

        const columns = [
            { key: 'date', label: 'Date' },
            { key: 'charity', label: 'Charity' },
            { key: 'type', label: 'Type' },
            { key: 'amount', label: 'Amount' },
            { key: 'has_receipt', label: 'Has Receipt' },
            { key: 'status', label: 'Status' },
            { key: 'action_required', label: 'Action Required' },
            { key: 'description', label: 'Description' }
        ];

        const csv = CSVExporter.arrayToCSV(auditData, columns);
        const filename = `receipt_audit_${year}_${user?.name?.replace(/\s+/g, '_') || 'export'}.csv`;

        CSVExporter.downloadCSV(csv, filename);
        return {
            success: true,
            stats: stats
        };
    },

    /**
     * 5. Annual Tax Summary (PDF/HTML)
     * Comprehensive tax document for filing
     */
    async generateAnnualTaxSummary(year) {
        const donations = await ReportDataFetcher.fetchDonations(year);
        const taxSettings = await ReportDataFetcher.fetchTaxSettings(year);
        const user = getReportAuthUser();

        // Calculate totals by type
        const byType = {
            cash: { count: 0, total: 0 },
            miles: { count: 0, total: 0, miles: 0 },
            stock: { count: 0, total: 0 },
            crypto: { count: 0, total: 0 },
            items: { count: 0, total: 0 }
        };

        // Group by charity
        const byCharity = {};

        donations.forEach(d => {
            const amount = d.amount || 0;
            const type = d.donation_type || 'cash';

            // Update type totals
            if (byType[type]) {
                byType[type].count++;
                byType[type].total += amount;
                if (type === 'miles') {
                    byType[type].miles += d.miles_driven || 0;
                }
            }

            // Update charity totals
            const charityKey = d.charity_name || d.charity?.name || 'Unknown';
            if (!byCharity[charityKey]) {
                byCharity[charityKey] = {
                    name: charityKey,
                    ein: d.charity_ein || d.charity?.ein || '',
                    total: 0,
                    donations: []
                };
            }
            byCharity[charityKey].total += amount;
            byCharity[charityKey].donations.push({
                date: d.donation_date,
                type: type,
                amount: amount,
                description: d.description || ''
            });
        });

        // Calculate tax impact
        const taxCalcs = ReportDataFetcher.calculateTaxSavings(donations, taxSettings.tax_bracket || 22);

        // Generate PDF using jsPDF (assuming it's loaded)
        if (typeof jsPDF === 'undefined') {
            // Fallback to HTML if jsPDF not available
            return this.generateTaxSummaryHTML(year, user, donations, byType, byCharity, taxSettings, taxCalcs);
        }

        // Full PDF generation would go here
        // For now, return HTML version
        return this.generateTaxSummaryHTML(year, user, donations, byType, byCharity, taxSettings, taxCalcs);
    },

    /**
     * Generate Tax Summary as HTML (fallback or for display)
     */
    generateTaxSummaryHTML(year, user, donations, byType, byCharity, taxSettings, taxCalcs) {
        // Get current version from package.json or default
        const currentVersion = window.CHARITY_TRACKER_VERSION || '2.12.1';

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Annual Tax Summary - ${year}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
        h1 { color: #667eea; margin: 0; }
        .subtitle { color: #666; margin-top: 5px; }
        .section { margin: 30px 0; }
        .section h2 { color: #667eea; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-weight: bold; }
        .total-row { font-weight: bold; background: #f8f9fa; }
        .tax-summary { background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .tax-summary h3 { margin-top: 0; color: #075985; }
        .amount { text-align: right; font-family: monospace; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Annual Tax Summary - ${year}</h1>
        <div class="subtitle">Charitable Contribution Report for ${user?.name || 'Taxpayer'}</div>
        <div class="subtitle">Generated: ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="tax-summary">
        <h3>Tax Impact Summary</h3>
        <table>
            <tr>
                <td>Total Charitable Contributions:</td>
                <td class="amount">$${taxCalcs.totalDonations.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Filing Status:</td>
                <td>${taxSettings.filing_status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Single'}</td>
            </tr>
            <tr>
                <td>Tax Bracket:</td>
                <td>${taxSettings.tax_bracket || 22}%</td>
            </tr>
            <tr>
                <td><strong>Estimated Tax Savings:</strong></td>
                <td class="amount"><strong>$${taxCalcs.taxSavings.toFixed(2)}</strong></td>
            </tr>
            <tr>
                <td>Effective Cost of Donations:</td>
                <td class="amount">$${taxCalcs.effectiveCost.toFixed(2)}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2>Donations by Type</h2>
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Count</th>
                    <th>Details</th>
                    <th class="amount">Total</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(byType).map(([type, data]) => data.count > 0 ? `
                <tr>
                    <td>${type.charAt(0).toUpperCase() + type.slice(1)}</td>
                    <td>${data.count}</td>
                    <td>${type === 'miles' ? `${data.miles} miles` : ''}</td>
                    <td class="amount">$${data.total.toFixed(2)}</td>
                </tr>
                ` : '').join('')}
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td>Total</td>
                    <td>${donations.length}</td>
                    <td></td>
                    <td class="amount">$${taxCalcs.totalDonations.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
    </div>

    <div class="section">
        <h2>Donations by Charity</h2>
        <table>
            <thead>
                <tr>
                    <th>Charity</th>
                    <th>EIN</th>
                    <th>Donations</th>
                    <th class="amount">Total</th>
                </tr>
            </thead>
            <tbody>
                ${Object.values(byCharity)
                    .sort((a, b) => b.total - a.total)
                    .map(charity => `
                <tr>
                    <td>${charity.name}</td>
                    <td>${charity.ein}</td>
                    <td>${charity.donations.length}</td>
                    <td class="amount">$${charity.total.toFixed(2)}</td>
                </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td>Total</td>
                    <td></td>
                    <td>${donations.length}</td>
                    <td class="amount">$${taxCalcs.totalDonations.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
    </div>

    <div class="section">
        <h2>Important Tax Notes</h2>
        <ul>
            <li>This summary is for tax preparation purposes only and should be reviewed with your tax professional.</li>
            <li>Ensure you have receipts for all donations over $250 (IRS requirement).</li>
            <li>Non-cash donations over $500 require Form 8283 to be filed with your return.</li>
            <li>Non-cash donations over $5,000 require a qualified appraisal.</li>
            <li>Tax savings shown are estimates based on your marginal tax rate.</li>
        </ul>
    </div>

    <div class="footer">
        <p>Generated by Charity Tracker v${currentVersion} | ${window.location.hostname}</p>
        <p>This report is for informational purposes only. Consult with a tax professional for advice specific to your situation.</p>
    </div>

    <div class="no-print" style="margin-top: 30px;">
        <button onclick="window.print()" style="background: #667eea; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
            Print / Save as PDF
        </button>
    </div>
</body>
</html>`;

        // Create modal instead of popup window
        const existingModal = document.getElementById('taxSummaryModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'taxSummaryModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            width: 90%;
            max-width: 1000px;
            height: 90vh;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        `;

        const modalHeader = document.createElement('div');
        modalHeader.style.cssText = `
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        modalHeader.innerHTML = `
            <h2 style="margin: 0; color: #667eea;">Annual Tax Summary - ${year}</h2>
            <div>
                <button onclick="window.print()" style="background: #667eea; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">
                    Print / Save PDF
                </button>
                <button onclick="document.getElementById('taxSummaryModal').remove()" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;

        const modalBody = document.createElement('div');
        modalBody.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        `;

        // Create iframe for print-friendly content
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
        modalBody.appendChild(iframe);

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modal.appendChild(modalContent);

        // Add to page
        document.body.appendChild(modal);

        // Write content to iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        // Update print functionality to print iframe content
        const printBtn = modalHeader.querySelector('button[onclick*="print"]');
        printBtn.onclick = () => {
            iframe.contentWindow.print();
        };

        return { success: true, type: 'modal' };
    }
};

/**
 * Report UI Manager
 */
const ReportUI = {
    /**
     * Initialize the reports interface
     */
    init() {
        // Add event listeners to existing report buttons if they exist
        const reportButtons = document.querySelectorAll('[data-report-type]');
        reportButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reportType = e.target.dataset.reportType;
                const year = document.getElementById('reportYear')?.value || new Date().getFullYear();
                this.generateReport(reportType, year);
            });
        });
    },

    /**
     * Generate a report based on type
     */
    async generateReport(type, year) {
        // Show loading state
        this.showLoading(true);

        try {
            let result;
            switch (type) {
                case 'all-donations':
                    result = await ReportGenerators.generateAllDonationsCSV(year);
                    this.showSuccess(`Exported ${result.count} donation records`);
                    break;

                case 'item-details':
                    result = await ReportGenerators.generateItemDonationsReport(year);
                    this.showSuccess(`Exported ${result.items} items from ${result.donations} donations`);
                    break;

                case 'schedule-a':
                    result = await ReportGenerators.generateScheduleAExport(year);
                    this.showSuccess(`Schedule A exported: ${result.charities} charities, $${result.total.toFixed(2)} total`);
                    break;

                case 'receipt-audit':
                    result = await ReportGenerators.generateReceiptAudit(year);
                    const stats = result.stats;
                    this.showSuccess(`Audit complete: ${stats.with_receipts}/${stats.total} documented`);
                    if (stats.missing_required > 0) {
                        this.showWarning(`Action needed: ${stats.missing_required} receipts missing`);
                    }
                    break;

                case 'tax-summary':
                    result = await ReportGenerators.generateAnnualTaxSummary(year);
                    this.showSuccess('Tax summary generated');
                    break;

                default:
                    throw new Error(`Unknown report type: ${type}`);
            }
        } catch (error) {
            console.error('Report generation failed:', error);
            this.showError(`Failed to generate report: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    },

    /**
     * Show loading state
     */
    showLoading(show) {
        const loader = document.getElementById('reportLoader');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    },

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    },

    /**
     * Show error message
     */
    showError(message) {
        this.showMessage(message, 'error');
    },

    /**
     * Show warning message
     */
    showWarning(message) {
        this.showMessage(message, 'warning');
    },

    /**
     * Show message with type
     */
    showMessage(message, type = 'info') {
        const container = document.getElementById('reportMessages') || document.querySelector('.report-messages');
        if (!container) {
            console.log(`[${type.toUpperCase()}] ${message}`);
            return;
        }

        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;

        // Style based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        messageEl.style.cssText = `
            background: ${colors[type]}20;
            border-left: 4px solid ${colors[type]};
            color: ${colors[type]};
            padding: 12px;
            margin: 10px 0;
            border-radius: 4px;
            animation: slideIn 0.3s ease-out;
        `;

        container.appendChild(messageEl);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => messageEl.remove(), 300);
        }, 5000);
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CSVExporter,
        ReportDataFetcher,
        ReportGenerators,
        ReportUI
    };
} else {
    window.CharityReportsV2 = {
        CSVExporter,
        ReportDataFetcher,
        ReportGenerators,
        ReportUI,

        // Quick access methods - ENHANCED
        exportAllDonations: (year) => ReportGenerators.generateAllDonationsCSV(year || new Date().getFullYear()),
        exportItemDetails: (year) => ReportGenerators.generateItemDonationsReport(year || new Date().getFullYear()),
        exportScheduleA: (year) => ReportGenerators.generateScheduleAExport(year || new Date().getFullYear()),
        generateReceiptAudit: (year) => ReportGenerators.generateReceiptAudit(year || new Date().getFullYear()),
        generateTaxSummary: (year) => ReportGenerators.generateAnnualTaxSummary(year || new Date().getFullYear()),

        // Initialize UI if needed
        init: () => ReportUI.init()
    };
}