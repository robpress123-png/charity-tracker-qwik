# Charity Tracker Continuation Context - v2.1.59

## Current Status
- **Version:** 2.1.59
- **Last Updated:** 2025-09-23
- **Date/Time Context:** September 23, 2025

## 🚨 CURRENT ISSUES (CHANGE THIS SECTION):

### 1. 500 Error When Saving Donations:
- **Problem**: Server returns 500 when trying to save donations
- **Cause**: Added `value_source` column to INSERT but migration not run on production D1
- **Fix**: Remove value_source from INSERT until migration is run

### 2. Category-Item Misalignment:
- **Problem**: Items showing in wrong categories (exercise bikes in Books & Media, cookbooks in Appliances)
- **Root Cause**: Mismatch between items.category and item_categories.name
- **Location**: `/functions/api/items.js` line 132-133

## 📌 NEXT STEPS ON RESTART:
1. **Ask for CLOUDFLARE_API_TOKEN** to query D1 database directly
2. Run migration `migration_add_value_source.sql` on production D1
3. Query D1 to verify actual category names match between tables
4. Re-enable value_source in INSERT statements after migration

## ✅ RECENT FIXES (CHANGE THIS SECTION):
- Edit donation now fetches items from donation_items table (v2.1.54)
- Edit modal fields read-only except Condition (v2.1.55)
- Added "Other item in [category]" option with value_source (v2.1.55)
- Fixed crypto display to show "crypto" not symbol (v2.1.52)
- Year selector fixed to 2024, 2025, 2026 (v2.1.59)

---

# 📋 STABLE REFERENCE (DON'T CHANGE UNLESS INFRASTRUCTURE CHANGES)

## 🔧 AUTO-DEPLOYMENT:
- **GitHub Repo**: https://github.com/robpress123-png/charity-tracker-qwik
- **Production URL**: https://charity-tracker-qwik.pages.dev
- **Process**: `npm run bump:patch` → auto commit → push → GitHub webhook → Cloudflare Pages deploy
- **Deploy Time**: ~1-2 minutes after push

## 💾 DATABASE:
- **Type**: Cloudflare D1 (SQLite)
- **Name**: charity-tracker-qwik-db
- **Location**: Cloudflare account (robpress123)
- **Access**: Via Wrangler CLI or Cloudflare Dashboard

### Database Schema:
```sql
-- Core Tables:
users (id TEXT PRIMARY KEY, email, name, password_hash)
donations (id TEXT PRIMARY KEY, user_id, charity_id, amount, date, donation_type, ...)
donation_items (id TEXT PRIMARY KEY, donation_id, item_name, category, condition, quantity, unit_value, total_value)
  -- PENDING: value_source TEXT column (migration file exists)

-- Reference Tables:
items (id TEXT PRIMARY KEY, name, category TEXT, low_value, high_value) -- 497 test items
item_categories (id INTEGER PRIMARY KEY, name TEXT) -- 12 categories
charities (id, name, ein, category, ...) -- IRS charity database
user_charities (id, user_id, name, ein, ...) -- User's custom charities
```

## 📁 PROJECT STRUCTURE:
```
/dist/
  dashboard.html     # Main app UI (all JS inline)
  index.html        # Landing page
  login.html        # Login page

/functions/api/
  donations.js      # Main donations CRUD
  donations/[id].js # Individual donation operations
  donations/import.js # CSV import
  items.js         # Items by category lookup
  charities.js     # Charity search
  auth.js          # Authentication

/scripts/
  auto-version-bump.js # Version management

package.json       # Version here
wrangler.toml     # Cloudflare config
```

## 🛠 COMMON COMMANDS:
```bash
# Development
source ~/.nvm/nvm.sh && nvm use 20
npx wrangler pages dev --local --port 8788

# Deployment
npm run bump:patch  # Patch version + deploy
npm run bump:minor  # Minor version + deploy
npm run bump:major  # Major version + deploy

# Database (needs CLOUDFLARE_API_TOKEN)
npx wrangler d1 execute charity-tracker-qwik-db --remote --command="SELECT..."
```

## ⚠️ IMPORTANT RULES:
1. **Always version bump** before deploying
2. **Test locally** with all donation types
3. **Check D1 schema** before adding columns
4. **Run migrations** on production before using new columns
5. **Don't break working features** while fixing others

## 🔍 DEBUGGING:
- Local server logs: Check terminal running wrangler
- Production logs: Cloudflare Dashboard → Pages → Functions
- Database state: Use D1 queries or Cloudflare Dashboard
- Version deployed: Check VERSION.json or package.json

## 📝 NOTES:
- Items table has TEST data, not IRS values
- Category names must match EXACTLY between tables
- User auth is token-based (localStorage)
- All donation types must work: cash, items, miles, stock, crypto