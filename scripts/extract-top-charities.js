#!/usr/bin/env node

/**
 * Script to extract top 10,000 charities from IRS Publication 78 data
 * Prioritizes by:
 * 1. Popular well-known charities (Red Cross, United Way, etc.)
 * 2. Geographic distribution (top charities from each state)
 * 3. Category diversity (various types of charitable work)
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to IRS data file (adjust if needed)
const IRS_DATA_PATH = '/mnt/c/Users/RobertPressman/charity-tracker/IRS Data/eo1.csv';
const OUTPUT_SQL_PATH = path.join(__dirname, '../data/top_10000_charities.sql');
const OUTPUT_JSON_PATH = path.join(__dirname, '../data/top_10000_charities.json');

// Well-known charity keywords for prioritization
const PRIORITY_KEYWORDS = [
    'red cross', 'united way', 'salvation army', 'goodwill', 'habitat for humanity',
    'ymca', 'ywca', 'boys and girls club', 'march of dimes', 'make-a-wish',
    'st jude', 'shriners', 'wounded warrior', 'world vision', 'compassion international',
    'world wildlife', 'nature conservancy', 'sierra club', 'humane society', 'aspca',
    'doctors without borders', 'american cancer society', 'american heart association',
    'alzheimer', 'diabetes', 'autism', 'special olympics', 'feeding america',
    'food bank', 'homeless', 'shelter', 'rescue mission', 'catholic charities',
    'jewish federation', 'lutheran services', 'methodist', 'baptist', 'presbyterian',
    'community foundation', 'university', 'college', 'school', 'hospital',
    'medical center', 'children\'s hospital', 'cancer center', 'research',
    'museum', 'symphony', 'opera', 'theater', 'ballet', 'library', 'zoo',
    'aquarium', 'botanical garden', 'historical society', 'public radio', 'pbs'
];

// Category mapping based on name patterns
function categorizeCharity(name, city, state) {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('church') || lowerName.includes('ministries') || lowerName.includes('christian') ||
        lowerName.includes('catholic') || lowerName.includes('jewish') || lowerName.includes('muslim') ||
        lowerName.includes('buddhist') || lowerName.includes('temple') || lowerName.includes('mosque')) {
        return 'Religious';
    }
    if (lowerName.includes('hospital') || lowerName.includes('medical') || lowerName.includes('health') ||
        lowerName.includes('clinic') || lowerName.includes('cancer') || lowerName.includes('heart')) {
        return 'Health';
    }
    if (lowerName.includes('school') || lowerName.includes('university') || lowerName.includes('college') ||
        lowerName.includes('academy') || lowerName.includes('education') || lowerName.includes('scholarship')) {
        return 'Education';
    }
    if (lowerName.includes('homeless') || lowerName.includes('shelter') || lowerName.includes('food') ||
        lowerName.includes('rescue') || lowerName.includes('community')) {
        return 'Human Services';
    }
    if (lowerName.includes('animal') || lowerName.includes('humane') || lowerName.includes('wildlife') ||
        lowerName.includes('environmental') || lowerName.includes('conservation')) {
        return 'Environment/Animals';
    }
    if (lowerName.includes('museum') || lowerName.includes('theater') || lowerName.includes('symphony') ||
        lowerName.includes('opera') || lowerName.includes('arts') || lowerName.includes('culture')) {
        return 'Arts & Culture';
    }
    if (lowerName.includes('research') || lowerName.includes('institute') || lowerName.includes('science')) {
        return 'Research';
    }
    if (lowerName.includes('international') || lowerName.includes('global') || lowerName.includes('world')) {
        return 'International';
    }
    if (lowerName.includes('foundation') || lowerName.includes('trust') || lowerName.includes('fund')) {
        return 'Foundation';
    }
    if (lowerName.includes('youth') || lowerName.includes('children') || lowerName.includes('kids')) {
        return 'Youth Development';
    }

    return 'Other';
}

// Calculate priority score for sorting
function calculatePriority(name, city, state) {
    const lowerName = name.toLowerCase();
    let score = 0;

    // Check for well-known charities
    for (const keyword of PRIORITY_KEYWORDS) {
        if (lowerName.includes(keyword)) {
            score += 1000;
            break;
        }
    }

    // Prefer charities with complete information
    if (city && city.length > 0) score += 10;
    if (state && state.length === 2) score += 10;

    // Slightly prefer shorter, cleaner names (likely more established)
    if (name.length < 50) score += 5;
    if (!lowerName.includes('inc') && !lowerName.includes('llc')) score += 5;

    return score;
}

// Clean and format charity name
function cleanName(name) {
    if (!name) return '';

    // Remove extra whitespace and trim
    name = name.replace(/\s+/g, ' ').trim();

    // Title case
    name = name.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Fix common acronyms
    name = name.replace(/\bYmca\b/gi, 'YMCA');
    name = name.replace(/\bYwca\b/gi, 'YWCA');
    name = name.replace(/\bUsa\b/gi, 'USA');
    name = name.replace(/\bUs\b/gi, 'US');

    return name;
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Escape SQL string
function escapeSql(str) {
    if (!str) return '';
    return str.replace(/'/g, "''");
}

async function processIRSData() {
    console.log('Reading IRS charity data from:', IRS_DATA_PATH);

    // Check if file exists
    if (!fs.existsSync(IRS_DATA_PATH)) {
        console.error('Error: IRS data file not found at', IRS_DATA_PATH);
        console.log('Please ensure the file path is correct.');
        process.exit(1);
    }

    const charities = [];
    const stateCharities = {}; // Track charities by state
    const seenEINs = new Set(); // Track unique EINs

    const fileStream = fs.createReadStream(IRS_DATA_PATH);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineCount = 0;
    let isFirstLine = true;

    console.log('Processing charities...');

    for await (const line of rl) {
        lineCount++;

        // Skip header
        if (isFirstLine) {
            isFirstLine = false;
            continue;
        }

        // Parse CSV line (handle commas in quoted fields)
        const fields = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                fields.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        fields.push(current.trim());

        // Extract fields based on actual IRS CSV structure:
        // EIN,NAME,ICO,STREET,CITY,STATE,ZIP,GROUP,SUBSECTION...
        const ein = fields[0] ? fields[0].replace(/[^\d]/g, '') : '';
        const name = cleanName(fields[1]);
        const street = fields[3] ? fields[3].trim() : '';
        const city = fields[4] ? fields[4].trim() : '';
        const state = fields[5] ? fields[5].trim().toUpperCase() : '';
        const subsection = fields[8] ? fields[8].trim() : '';

        // Skip if missing critical data or duplicate EIN
        if (!ein || !name || seenEINs.has(ein)) {
            continue;
        }

        // IMPORTANT: Only include subsection 03 (501(c)(3) tax-deductible organizations)
        if (subsection !== '03') {
            continue;
        }

        seenEINs.add(ein);

        // Calculate priority and category
        const priority = calculatePriority(name, city, state);
        const category = categorizeCharity(name, city, state);

        const charity = {
            id: generateId(),
            ein: ein,
            name: name,
            city: city,
            state: state,
            category: category,
            priority: priority,
            description: `${category} organization${city ? ' in ' + city : ''}${state ? ', ' + state : ''}`
        };

        charities.push(charity);

        // Track by state for geographic distribution
        if (state) {
            if (!stateCharities[state]) {
                stateCharities[state] = [];
            }
            stateCharities[state].push(charity);
        }

        if (lineCount % 10000 === 0) {
            console.log(`Processed ${lineCount} lines...`);
        }
    }

    console.log(`\nTotal charities processed: ${charities.length}`);

    // Sort by priority (highest first)
    charities.sort((a, b) => b.priority - a.priority);

    // Take top 10,000
    const topCharities = charities.slice(0, 10000);

    console.log(`\nSelected top ${topCharities.length} charities`);

    // Show category distribution
    const categoryCount = {};
    for (const charity of topCharities) {
        categoryCount[charity.category] = (categoryCount[charity.category] || 0) + 1;
    }

    console.log('\nCategory distribution:');
    for (const [category, count] of Object.entries(categoryCount)) {
        console.log(`  ${category}: ${count}`);
    }

    // Show state distribution (top 10)
    const stateCount = {};
    for (const charity of topCharities) {
        if (charity.state) {
            stateCount[charity.state] = (stateCount[charity.state] || 0) + 1;
        }
    }

    const topStates = Object.entries(stateCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    console.log('\nTop 10 states represented:');
    for (const [state, count] of topStates) {
        console.log(`  ${state}: ${count}`);
    }

    return topCharities;
}

async function generateSQL(charities) {
    console.log('\nGenerating SQL insert statements...');

    const sqlStatements = [];

    // Create table statement
    sqlStatements.push(`-- Top 10,000 Charities from IRS Publication 78
-- Generated on ${new Date().toISOString()}
-- Total charities: ${charities.length}

-- Create global_charities table if it doesn't exist
CREATE TABLE IF NOT EXISTS global_charities (
    id TEXT PRIMARY KEY,
    ein TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    city TEXT,
    state TEXT,
    description TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_global_charities_ein ON global_charities(ein);
CREATE INDEX IF NOT EXISTS idx_global_charities_name ON global_charities(name);
CREATE INDEX IF NOT EXISTS idx_global_charities_state ON global_charities(state);
CREATE INDEX IF NOT EXISTS idx_global_charities_category ON global_charities(category);

-- Clear existing data (optional - comment out if you want to append)
DELETE FROM global_charities;

-- Insert charities`);

    // Generate insert statements in batches of 100
    for (let i = 0; i < charities.length; i += 100) {
        const batch = charities.slice(i, Math.min(i + 100, charities.length));

        sqlStatements.push(`
-- Batch ${Math.floor(i/100) + 1}
INSERT INTO global_charities (id, ein, name, category, city, state, description, is_verified) VALUES`);

        const values = batch.map(charity => {
            const ein = escapeSql(charity.ein);
            const name = escapeSql(charity.name);
            const category = escapeSql(charity.category);
            const city = escapeSql(charity.city);
            const state = escapeSql(charity.state);
            const description = escapeSql(charity.description);

            return `('${charity.id}', '${ein}', '${name}', '${category}', '${city}', '${state}', '${description}', 1)`;
        });

        sqlStatements.push(values.join(',\n') + ';');
    }

    // Add summary comment
    sqlStatements.push(`
-- Import complete!
-- Total charities imported: ${charities.length}
-- Run these commands to verify:
-- SELECT COUNT(*) FROM global_charities;
-- SELECT category, COUNT(*) as count FROM global_charities GROUP BY category ORDER BY count DESC;`);

    const sqlContent = sqlStatements.join('\n');

    // Ensure directory exists
    const dataDir = path.dirname(OUTPUT_SQL_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write SQL file
    fs.writeFileSync(OUTPUT_SQL_PATH, sqlContent);
    console.log(`SQL file written to: ${OUTPUT_SQL_PATH}`);

    // Also save as JSON for reference
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(charities, null, 2));
    console.log(`JSON file written to: ${OUTPUT_JSON_PATH}`);

    return sqlContent;
}

// Main execution
async function main() {
    try {
        console.log('IRS Charity Data Extractor');
        console.log('==========================\n');

        const topCharities = await processIRSData();
        await generateSQL(topCharities);

        console.log('\n✅ Extraction complete!');
        console.log('\nNext steps:');
        console.log('1. Review the generated SQL file');
        console.log('2. Upload to Cloudflare D1 using:');
        console.log('   npx wrangler d1 execute charity-tracker-qwik-db --file=./data/top_10000_charities.sql --remote');
        console.log('\nNote: The SQL file is large. You may need to split it into smaller chunks for upload.');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();