#!/usr/bin/env node

/**
 * Script to split large SQL file into smaller chunks for Cloudflare D1 upload
 * Each chunk will be under 100KB for safe uploading
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQL_FILE = path.join(__dirname, '../data/top_10000_charities.sql');
const OUTPUT_DIR = path.join(__dirname, '../data/sql-chunks');

// Read the SQL file
const sqlContent = fs.readFileSync(SQL_FILE, 'utf-8');

// Split by INSERT statements (each batch is a complete statement)
const lines = sqlContent.split('\n');
const chunks = [];
let currentChunk = [];
let currentSize = 0;
const MAX_CHUNK_SIZE = 90000; // 90KB to be safe

// Always include the table creation in the first chunk
let inTableCreation = true;
let tableCreationLines = [];

for (const line of lines) {
    // Collect table creation statements
    if (inTableCreation) {
        tableCreationLines.push(line);
        if (line.includes('INSERT INTO global_charities')) {
            inTableCreation = false;
            // Start the first chunk with table creation
            currentChunk = [...tableCreationLines];
            currentSize = currentChunk.join('\n').length;
        }
        continue;
    }

    const lineSize = line.length;

    // Check if adding this line would exceed the chunk size
    // But make sure we don't split in the middle of an INSERT statement
    if (currentSize + lineSize > MAX_CHUNK_SIZE && line.trim().endsWith(';')) {
        // Save current chunk
        chunks.push(currentChunk.join('\n'));
        currentChunk = [];
        currentSize = 0;
    }

    currentChunk.push(line);
    currentSize += lineSize + 1; // +1 for newline
}

// Add the last chunk
if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
}

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Write chunks to separate files
console.log(`Splitting SQL file into ${chunks.length} chunks...`);

for (let i = 0; i < chunks.length; i++) {
    const chunkNum = String(i + 1).padStart(3, '0');
    const chunkFile = path.join(OUTPUT_DIR, `charities_chunk_${chunkNum}.sql`);
    fs.writeFileSync(chunkFile, chunks[i]);
    const size = (chunks[i].length / 1024).toFixed(1);
    console.log(`  Chunk ${chunkNum}: ${size} KB -> ${chunkFile}`);
}

console.log('\n✅ SQL file split successfully!');
console.log('\nTo upload to Cloudflare D1, run these commands in order:');
console.log('(Note: Only run chunk 001 once, as it creates the tables)\n');

for (let i = 0; i < Math.min(5, chunks.length); i++) {
    const chunkNum = String(i + 1).padStart(3, '0');
    console.log(`npx wrangler d1 execute charity-tracker-qwik-db --file=./data/sql-chunks/charities_chunk_${chunkNum}.sql --remote`);
}

if (chunks.length > 5) {
    console.log(`... and ${chunks.length - 5} more files`);
}

console.log('\n📝 Pro tip: You can also create a shell script to run all commands:');
console.log('for file in data/sql-chunks/*.sql; do');
console.log('  echo "Uploading $file..."');
console.log('  npx wrangler d1 execute charity-tracker-qwik-db --file="$file" --remote');
console.log('  sleep 2  # Small delay between uploads');
console.log('done');