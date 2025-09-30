/**
 * Charity Tracker - Phase 1 Reporting System
 * Version: 2.11.63
 *
 * This module provides comprehensive reporting functionality including:
 * - CSV exports (All Donations, Schedule A format)
 * - PDF generation (Annual Tax Summary)
 * - Receipt Audit Reports
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
     * Fetch all donations for a tax year
     */
    async fetchDonations(year) {
        const token = getReportAuthToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        try {
            const response = await fetch(`/api/donations?year=${year}`, {
                headers: {
                    'Authorization': token
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
            const response = await fetch(`/api/users/tax-settings?year=${year}`, {
                headers: {
                    'Authorization': token
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
            return data;
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
 * Phase 1 Report Generators
 */
const ReportGenerators = {
    /**
     * 1. All Donations Export (CSV)
     * Complete export of all donation data
     */
    async generateAllDonationsCSV(year) {
        const donations = await ReportDataFetcher.fetchDonations(year);
        const user = getReportAuthUser();

        // Transform donations for export
        const exportData = donations.map(d => ({
            donation_date: d.donation_date,
            charity_name: d.charity_name || d.charity?.name || 'Unknown',
            charity_ein: d.charity_ein || d.charity?.ein || '',
            donation_type: d.donation_type,
            amount: d.amount || 0,
            description: d.description || '',

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
        }));

        const columns = [
            { key: 'donation_date', label: 'Date' },
            { key: 'charity_name', label: 'Charity Name' },
            { key: 'charity_ein', label: 'EIN' },
            { key: 'donation_type', label: 'Type' },
            { key: 'amount', label: 'Amount' },
            { key: 'description', label: 'Description' },
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
        return { success: true, count: exportData.length };
    },

    /**
     * 2. Schedule A Export (CSV)
     * Format compatible with TurboTax/H&R Block
     */
    async generateScheduleAExport(year) {
        const donations = await ReportDataFetcher.fetchDonations(year);
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
     * 3. Receipt Audit Report (CSV)
     * Shows documentation status for all donations
     */
    async generateReceiptAudit(year) {
        const donations = await ReportDataFetcher.fetchDonations(year);
        const user = getReportAuthUser();

        // Analyze receipt status
        const auditData = donations.map(d => {
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

            return {
                date: d.donation_date,
                charity: d.charity_name || d.charity?.name || 'Unknown',
                type: d.donation_type,
                amount: amount.toFixed(2),
                has_receipt: hasReceipt ? 'Yes' : 'No',
                status: status,
                action_required: action,
                description: d.description || ''
            };
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
     * 4. Annual Tax Summary (PDF)
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
        <p>Generated by Charity Tracker v2.11.63 | ${window.location.hostname}</p>
        <p>This report is for informational purposes only. Consult with a tax professional for advice specific to your situation.</p>
    </div>

    <div class="no-print" style="margin-top: 30px;">
        <button onclick="window.print()" style="background: #667eea; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
            Print / Save as PDF
        </button>
    </div>
</body>
</html>`;

        // Open in new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();

        return { success: true, type: 'html' };
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
                    this.showSuccess(`Exported ${result.count} donations`);
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
                    this.showSuccess('Tax summary generated - check popup window');
                    break;

                default:
                    throw new Error(`Unknown report type: ${type}`);
            }
        } catch (error) {
            console.error('Report generation error:', error);
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
     * Show message
     */
    showMessage(message, type = 'info') {
        const container = document.getElementById('reportMessages');
        if (!container) {
            console.log(`Report ${type}: ${message}`);
            return;
        }

        const messageEl = document.createElement('div');
        messageEl.className = `report-message report-${type}`;
        messageEl.textContent = message;

        container.appendChild(messageEl);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }
};

// Export for use in dashboard
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CSVExporter,
        ReportDataFetcher,
        ReportGenerators,
        ReportUI
    };
} else {
    // Make available globally
    window.CharityReports = {
        CSVExporter,
        ReportDataFetcher,
        ReportGenerators,
        ReportUI,

        // Quick access methods
        exportAllDonations: (year) => ReportGenerators.generateAllDonationsCSV(year || new Date().getFullYear()),
        exportScheduleA: (year) => ReportGenerators.generateScheduleAExport(year || new Date().getFullYear()),
        generateReceiptAudit: (year) => ReportGenerators.generateReceiptAudit(year || new Date().getFullYear()),
        generateTaxSummary: (year) => ReportGenerators.generateAnnualTaxSummary(year || new Date().getFullYear())
    };
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ReportUI.init());
} else {
    ReportUI.init();
}