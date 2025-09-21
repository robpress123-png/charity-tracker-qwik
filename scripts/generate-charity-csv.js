#!/usr/bin/env node

/**
 * Script to generate a CSV file from the extracted charity JSON data
 * This will be used for importing charities via the admin dashboard
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_FILE = path.join(__dirname, '../data/top_10000_charities.json');
const OUTPUT_CSV = path.join(__dirname, '../data/charities_import.csv');

// Function to escape CSV values
function escapeCsvValue(value) {
    if (value === null || value === undefined) return '';

    // Convert to string
    value = String(value);

    // Check if value contains comma, quote, or newline
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        // Escape quotes by doubling them
        value = value.replace(/"/g, '""');
        // Wrap in quotes
        return `"${value}"`;
    }

    return value;
}

function generateCSV() {
    console.log('Generating CSV file from charity JSON data...');

    // Check if JSON file exists
    if (!fs.existsSync(JSON_FILE)) {
        console.error('Error: JSON file not found. Please run extract-top-charities.js first.');
        process.exit(1);
    }

    // Read JSON file
    const charitiesData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
    console.log(`Found ${charitiesData.length} charities to convert`);

    // CSV headers
    const headers = ['name', 'ein', 'category', 'city', 'state', 'website', 'description'];

    // Create CSV content
    let csvContent = headers.join(',') + '\n';

    // Add charity data
    for (const charity of charitiesData) {
        const row = [
            escapeCsvValue(charity.name),
            escapeCsvValue(charity.ein),
            escapeCsvValue(charity.category),
            escapeCsvValue(charity.city),
            escapeCsvValue(charity.state),
            escapeCsvValue(charity.website || ''), // website might not exist
            escapeCsvValue(charity.description)
        ];
        csvContent += row.join(',') + '\n';
    }

    // Write CSV file
    fs.writeFileSync(OUTPUT_CSV, csvContent);

    // Get file size
    const stats = fs.statSync(OUTPUT_CSV);
    const fileSizeKB = (stats.size / 1024).toFixed(1);

    console.log(`\n✅ CSV file generated successfully!`);
    console.log(`📁 Output: ${OUTPUT_CSV}`);
    console.log(`📊 Size: ${fileSizeKB} KB`);
    console.log(`📈 Rows: ${charitiesData.length} charities`);

    // Show category distribution
    const categories = {};
    for (const charity of charitiesData) {
        categories[charity.category] = (categories[charity.category] || 0) + 1;
    }

    console.log('\n📊 Category Distribution:');
    const sortedCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    for (const [category, count] of sortedCategories) {
        console.log(`  ${category}: ${count}`);
    }

    console.log('\n🚀 Next Steps:');
    console.log('1. Log into the admin dashboard');
    console.log('2. Navigate to "Import Charities" section');
    console.log('3. Upload the charities_import.csv file');
    console.log('4. Review the preview and click Import');
    console.log('\nThe import will automatically skip duplicates based on EIN.');
}

// Run the script
generateCSV();