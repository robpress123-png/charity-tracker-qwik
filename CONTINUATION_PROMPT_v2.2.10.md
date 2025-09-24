# Charity Tracker Continuation Context - v2.2.10

## Current Status
- **Version:** 2.2.9 (deployed, needs bump to 2.2.10)
- **Last Updated:** 2025-09-24
- **Date/Time Context:** September 24, 2025

## 🚨 IMMEDIATE FIX NEEDED:
- **Tax Settings Storage**: Currently in localStorage (bad!). Move to database:
  - Add `tax_bracket` and `filing_status` columns to users table
  - Migrate localStorage values to DB on next login
  - Update dashboard to save/load from API

## 📌 NEXT STEPS ON RESTART:

### Urgent Tasks:
1. **Fix Tax Settings Storage** - Move from localStorage to database
2. **Test New CSV Files** - Import diverse 60-donation files:
   - `test_user2_diverse_60.csv` - Medical/Health focus
   - `test_user3_diverse_60.csv` - Arts/Culture focus
   - `test_user4_diverse_60.csv` - Youth/Food Security focus
   - `test_user5_diverse_60.csv` - Animals/Environment focus

### Freemium Implementation:
- **TODO**: Implement freemium model demo - see `/FREEMIUM_STRATEGY.md`:
  - Make ALL EXISTING users premium (grandfathered)
  - New users: Free tier with 3 donation limit
  - Premium tier: $49/year unlimited
  - Demo payment flow (no real Stripe)

### Features to Add:
- **Stock/Crypto Price Lookups** - see `/PRICE_LOOKUP_INTEGRATION_PLAN.md`
- **Charity Navigator Integration** - Start with external links

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
users (id TEXT PRIMARY KEY, email, name, password_hash, plan)
donations (id TEXT PRIMARY KEY, user_id, charity_id, amount, date, donation_type, ...)
donation_items (id TEXT PRIMARY KEY, donation_id, item_name, category, condition, quantity, unit_value, total_value)
settings (id TEXT PRIMARY KEY, key, value, description) -- System settings

-- Reference Tables:
items (id TEXT PRIMARY KEY, name, category, low_value, high_value) -- 497 test items
item_categories (id INTEGER PRIMARY KEY, name TEXT) -- 12 categories
charities (id, name, ein, category, ...) -- IRS charity database
user_charities (id, user_id, name, ein, ...) -- User's custom charities
```

## 📁 PROJECT STRUCTURE:
```
/dist/
  dashboard.html     # Main app UI (vanilla JS, not Qwik framework)
  admin-dashboard.html # Admin panel with dropdown user actions
  login.html        # Login with lost password modal

/functions/api/
  donations/        # CRUD, import, export
  users/[id]/clear-all-data.js # NEW: Clear user data endpoint
  settings/auto-logout-timeout.js # Auto-logout config
  charities/        # Search and manage
  items/           # Item valuation
```

## 🛠 COMMON COMMANDS:
```bash
# Development
source ~/.nvm/nvm.sh && nvm use 20
npx wrangler pages dev --local --port 8788

# Deployment
npm run bump:patch  # Patch version + deploy
npm run bump:minor  # Minor version + deploy

# Database (manual in D1 console for now)
# No direct CLI access - use Cloudflare Dashboard
```

## ✅ RECENT CHANGES (v2.2.9-2.2.10):

### Admin Panel Improvements:
- **Dropdown Menu Actions** - Replaced Edit/Delete buttons with ⋮ menu:
  - 🔑 Reset Password (sets to "password123")
  - 📥 Export Donations
  - 👁️ View Details
  - 🗑️ Clear All Data (NEW!)
  - ❌ Delete User

### Clear User Data Function:
- **API Endpoint**: `/api/users/[id]/clear-all-data`
- **Clears**: All donations, donation_items, user_charities
- **Note**: Tax settings need migration from localStorage to DB

### Test Data:
- Created 4 diverse CSV files with minimal overlap
- Each user has distinct charity focus
- Ready for import after clearing old data

### Other Features:
- Auto-logout with configurable timeout
- Lost password shows "coming soon" modal
- Settings table in database

## ⚠️ IMPORTANT RULES:
1. **Always version bump** before deploying
2. **Test locally** with all donation types
3. **No manual SQL** - Use admin panel functions
4. **Don't break working features** while fixing others
5. **Tax settings** must move to database (critical!)

## 📊 MONETIZATION STRATEGY:
- **NO ADS** - Damages trust with financial data
- **NO AFFILIATES** - We need tax software APIs, they don't need us
- **NO ENTERPRISE** - Too personal for companies
- **ONLY REVENUE**: Freemium @ $49/year
- **TARGET**: 5,000 subscribers = $245k/year

## 🔍 KEY FILES:
- `/TEST_PLAN_v2.2.9.md` - Comprehensive test checklist
- `/FREEMIUM_STRATEGY.md` - Implementation plan
- `/PRICE_LOOKUP_INTEGRATION_PLAN.md` - Stock/crypto pricing
- `/MONETIZATION_ALTERNATIVES.md` - Revenue analysis

## 📝 NOTES:
- Dashboard uses vanilla JS, not Qwik framework
- Auth is token-based (localStorage)
- All donation types must work: cash, items, miles, stock, crypto
- Personal charities auto-created when no match found

---

**END OF CONTINUATION PROMPT v2.2.10**