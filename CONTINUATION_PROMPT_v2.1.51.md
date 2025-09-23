# Charity Tracker Continuation Context - v2.1.51

## Current Version
- **Version:** 2.1.51
- **Last Updated:** 2025-01-23
- **Context Usage:** Currently at ~12%
- **Database:** Cloudflare D1 (charity-tracker-qwik-db)
- **Deployment:** Auto-deploy via GitHub to Cloudflare Pages

## 🚨 CRITICAL ISSUES TO FIX:

### 1. Category-Item Misalignment STILL BROKEN:
- **Problem**: Items showing in wrong categories (e.g., Air compressor in Jewelry, All-in-One PC in Furniture)
- **Previous attempt**: Updated category IDs in item_categories table but still misaligned
- **Need to**: Re-verify the mapping between items.category and item_categories.name

### 2. Edit Donation Not Showing Items:
- **Problem**: When editing an item donation, individual items not displayed
- **Need to**: Check if items are being loaded from donation_items table in edit modal
- **File**: `/dist/dashboard.html` - look for editDonation function

### 3. Crypto Type Display Bug:
- **Problem**: Shows "ETH Ether" instead of just "ETH" or "Crypto"
- **Location**: Donation list type column
- **File**: `/dist/dashboard.html` - donation type display logic

## ✅ FIXED ISSUES (v2.1.42 - v2.1.51):

### Items Dropdown Partially Fixed:
1. ✅ Items API queries correct `items` table
2. ❌ Category filtering broken - items in wrong categories
3. ✅ Condition values fixed (using 'very_good' not 'Very Good')
4. ✅ Items save to donation_items table

### All Donation Types Working:
1. ✅ Cash donations
2. ✅ Stock donations
3. ✅ Crypto donations (but display issue)
4. ✅ Miles donations
5. ⚠️ Item donations (save works but edit broken)

## 🔧 AUTO-DEPLOYMENT SETUP:
- **GitHub Repo**: https://github.com/robpress123-png/charity-tracker-qwik
- **Auto-deploy**: Commits to main branch trigger Cloudflare Pages deployment
- **Process**:
  1. Make changes locally
  2. `npm run bump:patch` (auto commits, pushes, and deploys)
  3. Cloudflare Pages builds and deploys in ~1-2 minutes
- **Production URL**: https://charity-tracker-qwik.pages.dev

## Database Structure:
```sql
-- Main tables:
donations (id TEXT PRIMARY KEY, user_id, charity_id, amount, date, type, etc.)
donation_items (id TEXT PRIMARY KEY, donation_id, item_name, category, condition, quantity, unit_value)
items (id TEXT PRIMARY KEY, name, category TEXT, low_value, high_value) -- 497 items
item_categories (id INTEGER PRIMARY KEY, name TEXT) -- 12 categories
charities (id, name, ein, category, etc.) -- IRS charities
user_charities (id, user_id, name, ein, etc.) -- Personal charities
users (id, email, name, password_hash)
```

## Key Files:
- **Frontend**: `/dist/dashboard.html` - Main UI (all forms, modals, JS)
- **Backend APIs**: `/functions/api/`
  - `donations.js` - CRUD for donations
  - `items.js` - Get items by category
  - `charities.js` - Search charities
  - `donations/[id].js` - Get/update specific donation
  - `donations/import.js` - CSV import
- **Config**: `wrangler.toml` - Cloudflare Pages config
- **Version**: `package.json` - Current version
- **Build**: No build needed - static HTML + Cloudflare Functions

## D1 Database Access:
```bash
# List tables (in D1 console)
SELECT name FROM sqlite_master WHERE type='table';

# Check items in category
SELECT * FROM items WHERE category = 'Jewelry & Accessories' LIMIT 5;

# Check category IDs
SELECT id, name FROM item_categories ORDER BY id;
```

## Version Bumping Commands:
```bash
npm run bump:patch  # Auto version, commit, push, deploy
npm run bump:minor  # For feature additions
npm run bump:major  # For breaking changes
```

## Testing Approach:
1. Test locally with: `npx wrangler pages dev --local`
2. Test each donation type after changes
3. Verify CSV import still works
4. Check edit functionality for all types

## DO NOT:
- Create new tables without checking what exists
- Rename functions without checking references
- Change working features while fixing others
- Deploy without version bump
- Forget to test ALL donation types

## PRIORITY FIXES:
1. Fix category-item alignment issue (CRITICAL)
2. Fix edit donation not showing items (CRITICAL)
3. Fix crypto type display (MINOR)