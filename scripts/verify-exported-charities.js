#!/usr/bin/env node

/**
 * Script to verify exported charities CSV against IRS 501(c)(3) data
 * Reads exported CSV and checks each EIN
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to IRS data file
const IRS_DATA_PATH = '/mnt/c/Users/RobertPressman/charity-tracker/IRS Data/eo1.csv';

async function loadIRS501c3Data() {
    console.log('Loading IRS 501(c)(3) database...');
    const deductibleEINs = new Map(); // Use Map to store EIN -> organization name

    const fileStream = fs.createReadStream(IRS_DATA_PATH);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isFirstLine = true;
    let totalCount = 0;
    let deductibleCount = 0;

    for await (const line of rl) {
        if (isFirstLine) {
            isFirstLine = false;
            continue;
        }

        const fields = line.split(',');
        const ein = fields[0] ? fields[0].replace(/[^0-9]/g, '') : '';
        const name = fields[1] ? fields[1].trim() : '';
        const subsection = fields[8] ? fields[8].trim() : '';

        if (ein) {
            totalCount++;
            if (subsection === '03') {
                deductibleEINs.set(ein, name);
                deductibleCount++;
            }
        }
    }

    console.log(`✅ Loaded ${deductibleCount} tax-deductible charities (out of ${totalCount} total)\n`);
    return deductibleEINs;
}

async function verifyExportedCharities(csvPath) {
    // Load IRS data first
    const irsDeductibleEINs = await loadIRS501c3Data();

    console.log('Verifying Exported Charities');
    console.log('=============================\n');

    // Check if CSV file exists
    if (!fs.existsSync(csvPath)) {
        console.error(`❌ CSV file not found: ${csvPath}`);
        console.log('\nPlease export charities from the admin dashboard first:');
        console.log('1. Go to Admin Dashboard');
        console.log('2. Navigate to "Import/Export Charities"');
        console.log('3. Click "Export Current Charities to CSV"');
        console.log('4. Save the file as data/exported_charities.csv');
        return;
    }

    // Read and parse CSV
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].toLowerCase().split(',');

    // Find EIN column index
    const einIndex = headers.findIndex(h => h.includes('ein'));
    const nameIndex = headers.findIndex(h => h.includes('name'));

    if (einIndex === -1) {
        console.error('❌ EIN column not found in CSV');
        return;
    }

    const results = {
        total: 0,
        verified501c3: [],
        notVerified: [],
        noEIN: []
    };

    // Process each charity
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV line (handle quoted values)
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
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

        const ein = values[einIndex] ? values[einIndex].replace(/[^0-9]/g, '') : '';
        const name = values[nameIndex] || 'Unknown';

        results.total++;

        if (!ein) {
            results.noEIN.push({ name, line: i + 1 });
            continue;
        }

        if (irsDeductibleEINs.has(ein)) {
            results.verified501c3.push({
                name,
                ein,
                irsName: irsDeductibleEINs.get(ein)
            });
        } else {
            results.notVerified.push({ name, ein });
        }
    }

    // Display results
    console.log(`📊 Total Charities Analyzed: ${results.total}`);
    console.log(`✅ Verified 501(c)(3): ${results.verified501c3.length} (${((results.verified501c3.length / results.total) * 100).toFixed(1)}%)`);
    console.log(`❌ Not Verified as 501(c)(3): ${results.notVerified.length} (${((results.notVerified.length / results.total) * 100).toFixed(1)}%)`);
    console.log(`❓ Missing EIN: ${results.noEIN.length}\n`);

    // Show sample of non-verified charities
    if (results.notVerified.length > 0) {
        console.log('⚠️  NON-VERIFIED CHARITIES (first 10):');
        console.log('These may not be tax-deductible or may have incorrect EINs:\n');

        const sample = results.notVerified.slice(0, 10);
        sample.forEach(charity => {
            console.log(`  ❌ ${charity.name} (EIN: ${charity.ein})`);
        });

        if (results.notVerified.length > 10) {
            console.log(`  ... and ${results.notVerified.length - 10} more\n`);
        }
    }

    // Show verified charities sample
    if (results.verified501c3.length > 0) {
        console.log('\n✅ VERIFIED 501(c)(3) CHARITIES (first 5):');
        const verifiedSample = results.verified501c3.slice(0, 5);
        verifiedSample.forEach(charity => {
            console.log(`  ✅ ${charity.name} (EIN: ${charity.ein})`);
            if (charity.name !== charity.irsName) {
                console.log(`     IRS Name: ${charity.irsName}`);
            }
        });
    }

    // Save detailed report
    const report = {
        timestamp: new Date().toISOString(),
        csvFile: csvPath,
        summary: {
            total: results.total,
            verified: results.verified501c3.length,
            notVerified: results.notVerified.length,
            missingEIN: results.noEIN.length,
            verificationRate: ((results.verified501c3.length / results.total) * 100).toFixed(1) + '%'
        },
        notVerified: results.notVerified,
        verified: results.verified501c3.map(c => ({ name: c.name, ein: c.ein }))
    };

    const reportPath = path.join(__dirname, '../data/charity-verification-report-detailed.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    // Recommendation
    if (results.notVerified.length > results.total * 0.1) {
        console.log('\n🔴 RECOMMENDATION:');
        console.log('More than 10% of your charities are not verified as 501(c)(3).');
        console.log('Consider replacing them with the verified charities from charities_import.csv');
    } else if (results.notVerified.length > 0) {
        console.log('\n🟡 RECOMMENDATION:');
        console.log(`You have ${results.notVerified.length} non-verified charities.`);
        console.log('Consider reviewing and removing them or verifying their tax-exempt status.');
    } else {
        console.log('\n🟢 EXCELLENT!');
        console.log('All your charities are verified 501(c)(3) tax-deductible organizations!');
    }
}

// Main execution
const csvPath = process.argv[2] || path.join(__dirname, '../data/exported_charities.csv');

console.log(`Checking file: ${csvPath}\n`);
verifyExportedCharities(csvPath).catch(console.error);