#!/usr/bin/env node

/**
 * Automatic version bumping script for Charity Tracker
 * Usage:
 *   npm run version:patch  (2.0.0 -> 2.0.1)
 *   npm run version:minor  (2.0.0 -> 2.1.0)
 *   npm run version:major  (2.0.0 -> 3.0.0)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get version bump type from command line
const bumpType = process.argv[2] || 'patch';

// Read current version from package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const currentVersion = packageJson.version;

// Parse version
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Calculate new version
let newVersion;
switch (bumpType) {
    case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
    case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
    case 'patch':
    default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
}

console.log(`📦 Bumping version from ${currentVersion} to ${newVersion}`);

// Files to update
const filesToUpdate = [
    {
        path: 'package.json',
        replacements: [
            { from: `"version": "${currentVersion}"`, to: `"version": "${newVersion}"` }
        ]
    },
    {
        path: 'dist/dashboard.html',
        replacements: [
            { from: new RegExp(`v${currentVersion.replace(/\./g, '\\.')}`, 'g'), to: `v${newVersion}` },
            { from: new RegExp(`Version ${currentVersion.replace(/\./g, '\\.')}`, 'g'), to: `Version ${newVersion}` }
        ]
    },
    {
        path: 'dist/index.html',
        replacements: [
            { from: new RegExp(`v${currentVersion.replace(/\./g, '\\.')}`, 'g'), to: `v${newVersion}` }
        ]
    },
    {
        path: 'dist/login.html',
        replacements: [
            { from: new RegExp(`v${currentVersion.replace(/\./g, '\\.')}`, 'g'), to: `v${newVersion}` }
        ]
    },
    {
        path: 'dist/register.html',
        replacements: [
            { from: new RegExp(`v${currentVersion.replace(/\./g, '\\.')}`, 'g'), to: `v${newVersion}` }
        ]
    },
    {
        path: 'dist/admin-dashboard.html',
        replacements: [
            { from: new RegExp(`v${currentVersion.replace(/\./g, '\\.')}`, 'g'), to: `v${newVersion}` }
        ]
    },
    {
        path: 'dist/admin-login.html',
        replacements: [
            { from: new RegExp(`v${currentVersion.replace(/\./g, '\\.')}`, 'g'), to: `v${newVersion}` }
        ]
    },
    {
        path: 'CONTINUATION_PROMPT_v2.0.0.md',
        replacements: [
            { from: `# Charity Tracker v${currentVersion}`, to: `# Charity Tracker v${newVersion}` },
            { from: `Current State: v1.8.0 → v${currentVersion}`, to: `Current State: v${currentVersion} → v${newVersion}` }
        ]
    }
];

// Update all files
let updatedFiles = [];
filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, '..', file.path);

    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        file.replacements.forEach(replacement => {
            if (replacement.from instanceof RegExp) {
                const newContent = content.replace(replacement.from, replacement.to);
                if (newContent !== content) {
                    content = newContent;
                    changed = true;
                }
            } else {
                if (content.includes(replacement.from)) {
                    content = content.replace(replacement.from, replacement.to);
                    changed = true;
                }
            }
        });

        if (changed) {
            fs.writeFileSync(filePath, content);
            updatedFiles.push(file.path);
            console.log(`✅ Updated ${file.path}`);
        }
    } else {
        console.log(`⚠️  File not found: ${file.path}`);
    }
});

// Create a version file for tracking
const versionInfo = {
    version: newVersion,
    previousVersion: currentVersion,
    timestamp: new Date().toISOString(),
    bumpType: bumpType,
    changes: updatedFiles
};

fs.writeFileSync(
    path.join(__dirname, '..', 'VERSION.json'),
    JSON.stringify(versionInfo, null, 2)
);

console.log(`\n✨ Version bumped to ${newVersion}`);
console.log(`📝 Updated ${updatedFiles.length} files`);
console.log(`\n💡 Next steps:`);
console.log(`   1. Review the changes`);
console.log(`   2. Commit: git add -A && git commit -m "chore: bump version to ${newVersion}"`);
console.log(`   3. Push: git push origin main`);