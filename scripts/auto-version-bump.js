#!/usr/bin/env node

/**
 * Fully automated version bumping and deployment
 * This script handles everything: bump, inject, commit, and push
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get bump type from command line (patch, minor, or major)
const bumpType = process.argv[2] || 'patch';

// Read current version
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

console.log(`🚀 Auto Version Bump: ${currentVersion} → ${newVersion}`);
console.log('━'.repeat(50));

try {
    // Step 1: Update package.json
    console.log('\n📝 Step 1: Updating package.json...');
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('✅ package.json updated');

    // Step 2: Inject version into all HTML files
    console.log('\n💉 Step 2: Injecting version into HTML files...');
    execSync('node scripts/inject-version.js', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
    });

    // Step 3: Update VERSION.json
    console.log('\n📋 Step 3: Updating VERSION.json...');
    const versionInfo = {
        version: newVersion,
        previousVersion: currentVersion,
        timestamp: new Date().toISOString(),
        bumpType: bumpType
    };
    fs.writeFileSync(
        path.join(__dirname, '..', 'VERSION.json'),
        JSON.stringify(versionInfo, null, 2) + '\n'
    );
    console.log('✅ VERSION.json updated');

    // Step 4: Git operations
    console.log('\n🔧 Step 4: Git operations...');

    // Add all changes
    console.log('  Adding changes...');
    execSync('git add -A', { cwd: path.join(__dirname, '..') });

    // Commit with descriptive message
    const commitMessage = `chore: bump version to ${newVersion}\n\n- Automated version bump (${bumpType})\n- All HTML files updated\n- VERSION.json updated`;
    console.log('  Committing...');
    execSync(`git commit -m "${commitMessage}"`, { cwd: path.join(__dirname, '..') });

    // Push to remote
    console.log('  Pushing to GitHub...');
    execSync('git push origin main', { cwd: path.join(__dirname, '..') });

    console.log('✅ Changes committed and pushed');

    // Success!
    console.log('\n' + '═'.repeat(50));
    console.log(`✨ SUCCESS! Version ${newVersion} deployed`);
    console.log('═'.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`  • Version: ${currentVersion} → ${newVersion}`);
    console.log(`  • Type: ${bumpType} bump`);
    console.log(`  • Status: Deployed to GitHub`);
    console.log(`  • Auto-deploy: Cloudflare Pages will update shortly`);

} catch (error) {
    console.error('\n❌ Error during version bump:', error.message);
    process.exit(1);
}