# Charity Tracker Continuation Context - v2.2.7

## Current Status
- **Version:** 2.2.7
- **Last Updated:** 2025-09-24
- **Date/Time Context:** September 24, 2025

## 🚨 CURRENT ISSUES (CHANGE THIS SECTION):

None - All systems operational!

## 📌 NEXT STEPS ON RESTART:
- **TODO**: Implement auto-logout feature with admin-configurable timeout setting
- **TODO**: Implement freemium model demo - see `/FREEMIUM_STRATEGY.md` for detailed plan:
  - Free tier: 3 donations max, no exports
  - Premium tier: $29/year unlimited
  - Demo payment flow (no real Stripe yet)
- Test with new 60-donation CSV files for users 2-5 (created in project root)

## ✅ RECENT FIXES (CHANGE THIS SECTION):
- Created larger test data files (60 donations each for users 2-5) (v2.2.7)
- Fixed year selector to default to current year (2025) (v2.2.7)
- Improved progress bar timing for accurate import feedback (v2.2.7)
- Tax savings now updates when adding/removing items (v2.2.7)
- Removed old ITEMS format from notes field (v2.2.7)
- Fixed item donation import to parse CSV columns correctly (v2.2.7)
- Restored fuzzy charity matching with auto-create for no matches (v2.2.7)
- Added progress bar to import process (v2.2.7)
- Fixed import authentication bug (v2.2.7)

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
donation_items (id TEXT PRIMARY KEY, donation_id, item_name, category, condition, quantity, unit_value, total_value, value_source TEXT)

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