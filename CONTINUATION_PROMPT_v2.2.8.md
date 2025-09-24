# Charity Tracker Continuation Context - v2.2.9

## Current Status
- **Version:** 2.2.9 (deployed)
- **Last Updated:** 2025-09-24
- **Date/Time Context:** September 24, 2025

## 🚨 CURRENT ISSUES (CHANGE THIS SECTION):

None - All systems operational!

## 📌 NEXT STEPS ON RESTART:

### Immediate Tasks:
- **TODO**: Test with new diverse 60-donation CSV files (test_user*_diverse_60.csv)
  - User 2: Medical/Health focus
  - User 3: Arts/Culture focus
  - User 4: Youth/Food Security focus
  - User 5: Animals/Environment focus
- **TODO**: Run comprehensive test plan - see `/TEST_PLAN_v2.2.9.md`

### Freemium Implementation:
- **TODO**: Implement freemium model demo - see `/FREEMIUM_STRATEGY.md`:
  - Make existing users premium (grandfathered)
  - New users: Free tier with 3 donation limit
  - Premium tier: $49/year unlimited
  - Demo payment flow (no real Stripe yet)

### Price Lookup Features:
- **PLANNED**: Stock price lookup integration - see `/PRICE_LOOKUP_INTEGRATION_PLAN.md`:
  - Alpha Vantage API for closing prices
  - Automatic FMV calculation
  - Premium feature only
- **PLANNED**: Crypto price lookup:
  - CoinGecko API for FMV
  - IRS-compliant noon EST pricing
  - Support BTC, ETH, major coins
- **PLANNED**: Charity Navigator integration:
  - Start with external links
  - Show ratings inline (future)
  - Help users evaluate charities

### Monetization Strategy:
- **DECISION**: No ads, no affiliates, no enterprise - see `/MONETIZATION_ALTERNATIVES.md`
- **ONLY REVENUE**: Freemium subscriptions ($49/year) - Need 5,000 subscribers = $245k
- **KEY PARTNERSHIP**: Tax software APIs (not for revenue, but essential for value)
- **FOCUS**: Make the $49 worth it with premium features (price lookups, unlimited, exports)

## ✅ RECENT FIXES (CHANGE THIS SECTION):
- v2.2.9: Auto-logout feature with admin-configurable timeout (default 30 min)
- v2.2.9: Lost password link shows "coming soon" modal with admin contact info
- v2.2.9: Admin can reset user passwords via Edit button in User Management
- v2.2.9: Settings table added to database for system configuration
- v2.2.8: Import validation auto-confirms personal charity when no matches found
- v2.2.8: Admin can reset user passwords via Manage Users (temporary password)
- Created larger test data files (60 donations each for users 2-5) (v2.2.7)
- Fixed year selector to default to current year (2025) (v2.2.7)
- Improved progress bar timing for accurate import feedback (v2.2.7)
- Tax savings now updates when adding/removing items (v2.2.7)

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