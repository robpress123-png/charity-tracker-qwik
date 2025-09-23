#!/usr/bin/env node

/**
 * Injects the current version from package.json into all HTML files
 * This ensures all files always show the same version number
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read version from package.json (single source of truth)
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const VERSION = packageJson.version;

console.log(`📦 Injecting version ${VERSION} into all HTML files...`);

// Find all HTML files in dist directory
const distPath = path.join(__dirname, '..', 'dist');
const htmlFiles = fs.readdirSync(distPath)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(distPath, file));

let updatedCount = 0;

htmlFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace all version patterns
    const patterns = [
        // Match v1.8.0, v2.0.0, v2.0.1, v2.0.2, etc.
        /v\d+\.\d+\.\d+/g,
        // Match Version 1.8.0, Version 2.0.0, etc.
        /Version \d+\.\d+\.\d+/g,
        // Match version numbers in titles
        /Charity Tracker v\d+\.\d+\.\d+/g,
        // Match admin dashboard version
        />v\d+\.\d+\.\d+</g
    ];

    patterns.forEach(pattern => {
        const newContent = content.replace(pattern, (match) => {
            if (match.startsWith('Version ')) {
                return `Version ${VERSION}`;
            } else if (match.startsWith('Charity Tracker v')) {
                return `Charity Tracker v${VERSION}`;
            } else if (match.startsWith('>v')) {
                return `>v${VERSION}<`;
            } else if (match.startsWith('v')) {
                return `v${VERSION}`;
            }
            return match;
        });

        if (newContent !== content) {
            content = newContent;
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, content);
        updatedCount++;
        console.log(`✅ Updated ${path.basename(filePath)}`);
    }
});

console.log(`\n✨ Version injection complete!`);
console.log(`📝 Updated ${updatedCount} files with version ${VERSION}`);
console.log(`\n💡 This script should be run after any version bump or before deployment.`);