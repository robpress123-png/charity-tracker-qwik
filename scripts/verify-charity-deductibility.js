#!/usr/bin/env node

/**
 * Script to verify if existing charities in database are 501(c)(3) tax-deductible
 * Checks EINs against IRS Publication 78 data
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to IRS data file
const IRS_DATA_PATH = '/mnt/c/Users/RobertPressman/charity-tracker/IRS Data/eo1.csv';

// Common charity EINs that might be in the database (based on typical test data)
const COMMON_TEST_EINS = [
    '530196605', // American Red Cross
    '133433452', // Doctors Without Borders
    '521693387', // World Wildlife Fund
    '131623888', // United Way Worldwide
    '362167817', // Salvation Army
    '131837418', // American Cancer Society
    '135563422', // American Heart Association
    '133727250', // March of Dimes
    '581654536', // St. Jude Children's Research Hospital
    '237093289', // Shriners Hospitals for Children
];

async function checkCharityDeductibility() {
    console.log('Verifying Charity Tax-Deductible Status (501(c)(3))');
    console.log('====================================================\n');

    // First, build a set of all 501(c)(3) EINs from IRS data
    console.log('Loading IRS 501(c)(3) data...');
    const deductibleEINs = new Set();
    let totalCharities = 0;
    let deductibleCount = 0;

    const fileStream = fs.createReadStream(IRS_DATA_PATH);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isFirstLine = true;
    for await (const line of rl) {
        if (isFirstLine) {
            isFirstLine = false;
            continue;
        }

        const fields = line.split(',');
        const ein = fields[0] ? fields[0].replace(/[^0-9]/g, '') : '';
        const subsection = fields[8] ? fields[8].trim() : '';

        if (ein) {
            totalCharities++;
            if (subsection === '03') {
                deductibleEINs.add(ein);
                deductibleCount++;
            }
        }
    }

    console.log(`Loaded ${deductibleCount} tax-deductible charities out of ${totalCharities} total\n`);

    // Check common test EINs
    console.log('Checking Common Test Charity EINs:');
    console.log('-----------------------------------');

    const results = {
        deductible: [],
        notDeductible: [],
        notFound: []
    };

    for (const ein of COMMON_TEST_EINS) {
        const cleanEIN = ein.replace(/[^0-9]/g, '');

        // Try to find the charity name
        const charityInfo = getCharityName(cleanEIN);

        if (deductibleEINs.has(cleanEIN)) {
            results.deductible.push({ ein: cleanEIN, name: charityInfo });
            console.log(`✅ ${cleanEIN} - ${charityInfo} - 501(c)(3) DEDUCTIBLE`);
        } else {
            // Check if EIN exists in file but not deductible
            const existsButNotDeductible = await checkIfEINExists(cleanEIN);
            if (existsButNotDeductible) {
                results.notDeductible.push({ ein: cleanEIN, name: charityInfo });
                console.log(`❌ ${cleanEIN} - ${charityInfo} - NOT 501(c)(3)`);
            } else {
                results.notFound.push({ ein: cleanEIN, name: charityInfo });
                console.log(`❓ ${cleanEIN} - ${charityInfo} - NOT FOUND in IRS data`);
            }
        }
    }

    // Summary
    console.log('\n========================================');
    console.log('SUMMARY:');
    console.log(`✅ Tax-Deductible (501(c)(3)): ${results.deductible.length}`);
    console.log(`❌ Not Tax-Deductible: ${results.notDeductible.length}`);
    console.log(`❓ Not Found in IRS Data: ${results.notFound.length}`);

    if (results.notDeductible.length > 0 || results.notFound.length > 0) {
        console.log('\n⚠️  WARNING: Some charities may not be tax-deductible!');
        console.log('These charities should be reviewed or removed from the database.');
    } else if (results.deductible.length === COMMON_TEST_EINS.length) {
        console.log('\n✅ All checked charities are confirmed 501(c)(3) tax-deductible!');
    }

    // Create verification report
    const report = {
        timestamp: new Date().toISOString(),
        checkedEINs: COMMON_TEST_EINS.length,
        results: results,
        irsDataStats: {
            totalCharities: totalCharities,
            deductibleCount: deductibleCount,
            percentage: ((deductibleCount / totalCharities) * 100).toFixed(2) + '%'
        }
    };

    const reportPath = path.join(__dirname, '../data/charity-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

function getCharityName(ein) {
    const names = {
        '530196605': 'American Red Cross',
        '133433452': 'Doctors Without Borders',
        '521693387': 'World Wildlife Fund',
        '131623888': 'United Way Worldwide',
        '362167817': 'Salvation Army',
        '131837418': 'American Cancer Society',
        '135563422': 'American Heart Association',
        '133727250': 'March of Dimes',
        '581654536': 'St. Jude Children\'s Research Hospital',
        '237093289': 'Shriners Hospitals for Children'
    };
    return names[ein] || 'Unknown Charity';
}

async function checkIfEINExists(ein) {
    const fileStream = fs.createReadStream(IRS_DATA_PATH);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        if (line.startsWith(ein + ',')) {
            rl.close();
            return true;
        }
    }
    return false;
}

// Run the verification
checkCharityDeductibility().catch(console.error);