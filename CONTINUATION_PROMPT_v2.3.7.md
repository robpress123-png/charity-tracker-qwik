# Charity Tracker Continuation Context - v2.3.7
**Generated:** 2025-09-25
**Current Version:** 2.3.7
**Status:** Import timeout issues, working on solution

## 🔥 CURRENT ISSUE:
CSV import timing out with 175 donations due to Cloudflare 10-second limit. Need solution that:
- Calculates item values (required for admin dashboard)
- Matches charities properly (90% should match)
- Doesn't timeout on 175+ donations
- Simulates manual entry (not bulk optimization)

## 📊 RECENT CHANGES (v2.3.0-2.3.7):
### v2.3.0-2.3.1: Tax Settings Migration
- ✅ Moved tax settings from localStorage to database
- ✅ Added columns: address, city, state, zip_code, tax_bracket, filing_status, income_range
- ✅ Created `/api/users/settings` endpoint
- ✅ One-time migration from localStorage to DB
- ⚠️ Removed ALL localStorage dependencies (except auth tokens)

### v2.3.2-2.3.4: Bug Fixes
- ✅ Fixed async function error in filterDonations
- ✅ Removed localStorage fallbacks completely

### v2.3.5-2.3.7: Import Optimization Attempts
- ❌ Created import-optimized endpoint (had bugs)
- ❌ Removed debug logs (helped but not enough)
- ❌ Pre-loaded 500-1000 charities (still too much)
- 🔄 Current: Pre-loads all 496 items for value lookups

## 🚨 CRITICAL PROBLEMS:

### 1. Import Timeout
**Problem:** 175 donations × multiple DB queries = >10 seconds
**Current approach:** Pre-load items (496) + limited charities (500)
**Issue:** Limited charities breaks matching algorithm (need most of 10k)
**Options considered:**
- Batch processing (but needs to simulate manual entry)
- Reduce charity loading (but breaks 90% match rate)
- Skip value calculations (but breaks admin dashboard)

### 2. Database Column Migration Complete
**Fixed:** All users table columns added via D1 console:
```sql
PRAGMA table_info(users);
-- Shows: address, city, state, zip_code, tax_bracket, filing_status, income_range
```

## 🗂 TEST DATA READY:
**5 Test Users with Unique Data:**
1. **user1_test_v2.2.23.csv** - Healthcare & Education ($250 avg)
2. **user2_test_v2.2.23.csv** - Arts & Culture ($500 avg)
3. **user3_test_v2.2.23.csv** - Environmental & Animal ($150 avg)
4. **user4_test_v2.2.23.csv** - Community & Religious ($300 avg)
5. **user5_test_v2.2.23.csv** - International Aid ($400 avg)

Each CSV:
- 175 donations across 2024-2026
- Mix of cash, items, miles, stock, crypto
- 90% real charities (should match DB)
- 10% personal charities (tests creation)
- Uses exact item names from 496-item database

## 📁 PROJECT STRUCTURE
```
charity-tracker-qwik/
├── dist/
│   └── dashboard.html      # v2.3.7 - localStorage removed
├── functions/api/
│   ├── donations/
│   │   ├── import.js       # Main import - timing out
│   │   └── import-optimized.js # Broken attempt
│   └── users/
│       └── settings.js     # New tax settings API
├── db_migration_tax_tables.sql  # Tax tables schema ready
├── TAX_TABLES_IMPLEMENTATION_PLAN.md # Full tax system design
└── generate_test_csvs_v2.2.23.py # Creates test data
```

## 💡 SOLUTION IDEAS:

### Option 1: Progressive Import
- Import first 25 donations immediately
- Queue rest for background processing
- Poll for completion status

### Option 2: Smart Charity Loading
- Pre-scan import for unique charity names
- Load ONLY those specific charities
- Keep full items pre-load

### Option 3: Client-Side Chunking
- Split CSV on client into 25-row chunks
- Send multiple requests
- Show real progress per chunk

### Option 4: Two-Phase Import
- Phase 1: Validate & create personal charities
- Phase 2: Import donations with known IDs

## 🎯 NEXT STEPS:
1. **Fix import timeout** - Must handle 175+ donations
2. **Test all 5 CSVs** - Verify comprehensive data import
3. **Deploy tax tables** - Run migration SQL in D1
4. **Create tax API** - `/api/tax/rates` endpoint
5. **Update calculations** - Use DB tax rates not hardcoded

## 🚀 PROJECT OVERVIEW
Charity Tracker is a web application for tracking charitable donations for tax purposes. Built with vanilla JavaScript (NOT Qwik framework despite the folder name), Cloudflare Pages, and D1 database.

## 📍 PROJECT LOCATION
**Path:** `/home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik`

## 🔧 AUTO-DEPLOYMENT SYSTEM

### Deployment Process:
1. **Version Bump:** `npm run bump:patch` (or bump:minor, bump:major)
2. **Auto-commit:** Script automatically commits with version number
3. **Push to GitHub:** Automatic push to repository
4. **GitHub Webhook:** Triggers Cloudflare Pages deployment
5. **Live in ~1-2 minutes:** https://charity-tracker-qwik.pages.dev

### Version Bump Script:
- Location: `scripts/auto-version-bump.js`
- Commands:
  - `npm run bump:patch` - Patch version (2.3.7 → 2.3.8)
  - `npm run bump:minor` - Minor version (2.3.7 → 2.4.0)
  - `npm run bump:major` - Major version (2.3.7 → 3.0.0)
- Automatically updates package.json, commits, and pushes

### GitHub Repository:
- **URL:** https://github.com/robpress123-png/charity-tracker-qwik
- **Production:** https://charity-tracker-qwik.pages.dev

## 💾 DATABASE MANAGEMENT

### Access:
- **Type:** Cloudflare D1 (SQLite)
- **Name:** charity-tracker-qwik-db
- **Management:** Via Cloudflare Dashboard Console (NOT CLI)
- **Account:** robpress123
- **Token:** Stored in environment (CLOUDFLARE_API_TOKEN)

### Database Operations:
- **IMPORTANT:** All database schema changes are done via Cloudflare Console
- Navigate to: Cloudflare Dashboard → Workers & Pages → D1 → charity-tracker-qwik-db → Console
- Use PRAGMA commands for schema inspection
- Direct SQL for data manipulation

## 🔧 DEVELOPMENT COMMANDS:
```bash
# Start dev server
cd /home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik
source ~/.nvm/nvm.sh && nvm use 20
npx wrangler pages dev --local --port 8788

# Deploy (auto-commits)
npm run bump:patch  # 2.3.7 → 2.3.8
npm run bump:minor  # 2.3.7 → 2.4.0
npm run bump:major  # 2.3.7 → 3.0.0

# Test import with any CSV
# Login as test@example.com
# Upload any user*_test_v2.2.23.csv file
```

## 🐛 KNOWN ISSUES:
1. **Import fails on 175 donations** - 503/500 errors
2. **Tax tables not deployed** - Still using hardcoded 2024 rates
3. **Progress bar** - Fixed but import itself fails
4. **Capital gains** - Not implemented yet

## 📝 KEY INSIGHTS:
- Cloudflare Functions have 10-second CPU limit
- Can't load all 10,000 charities (too much memory)
- Must calculate item values during import (admin needs them)
- Each donation import = ~5-10 DB queries currently
- 175 donations = 875-1750 queries = timeout

## ⚠️ DON'T BREAK:
- Tax settings in DB (working now)
- Progress bar animation (fixed in v2.2.26)
- Item value calculations (required for totals)
- Charity matching logic (90% success rate needed)

## 📊 COMPLETE DATABASE SCHEMA

### Core Tables:

#### users
```sql
id TEXT PRIMARY KEY DEFAULT lower(hex(randomblob(16)))
email TEXT NOT NULL UNIQUE
password TEXT NOT NULL
name TEXT NOT NULL
plan TEXT DEFAULT 'free'
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- Tax settings added in v2.3.0:
address TEXT
city TEXT
state TEXT
zip_code TEXT
tax_bracket REAL
filing_status TEXT
income_range TEXT
```

#### donations
```sql
id TEXT PRIMARY KEY DEFAULT lower(hex(randomblob(16)))
user_id TEXT NOT NULL
charity_id TEXT (FK to charities.id)
user_charity_id TEXT (FK to user_charities.id)
amount DECIMAL(10,2) NOT NULL
date DATE NOT NULL
receipt_url TEXT
notes TEXT -- User notes ONLY (e.g., "Annual donation", "Christmas drive")
donation_type TEXT DEFAULT 'cash' -- cash, items, miles, stock, crypto
miles_driven REAL
mileage_rate REAL
mileage_purpose TEXT
quantity REAL -- For stock/crypto
cost_basis REAL
fair_market_value REAL
item_description TEXT -- General description for items
estimated_value REAL -- Total for items
crypto_type TEXT
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
stock_symbol TEXT
stock_quantity REAL
crypto_symbol TEXT
crypto_quantity REAL
```

#### donation_items
```sql
id TEXT PRIMARY KEY DEFAULT lower(hex(randomblob(16)))
donation_id TEXT NOT NULL (FK to donations.id)
item_name TEXT NOT NULL
category TEXT
condition TEXT -- fair, good, very_good, excellent
quantity INTEGER DEFAULT 1
unit_value DECIMAL(10,2)
total_value DECIMAL(10,2)
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
value_source TEXT
```

#### charities (IRS Database - ~10,000 records)
```sql
id TEXT PRIMARY KEY DEFAULT lower(hex(randomblob(16)))
name TEXT NOT NULL
ein TEXT
category TEXT
address TEXT
city TEXT
state TEXT
zip_code TEXT
website TEXT
description TEXT
phone TEXT
is_verified INTEGER DEFAULT 1
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME
```

#### user_charities (Personal/Custom Charities)
```sql
id TEXT PRIMARY KEY DEFAULT lower(hex(randomblob(16)))
user_id TEXT NOT NULL
name TEXT NOT NULL
ein TEXT
category TEXT
address TEXT
city TEXT
state TEXT
zip_code TEXT
website TEXT
description TEXT
phone TEXT
status TEXT DEFAULT 'pending_review'
review_notes TEXT
reviewed_by TEXT
reviewed_at DATETIME
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
is_approved INTEGER DEFAULT 0
```

#### items (496 donation items)
```sql
id TEXT PRIMARY KEY DEFAULT lower(hex(randomblob(16)))
name TEXT NOT NULL
category TEXT NOT NULL -- 12 categories
condition TEXT
low_value DECIMAL(10,2) -- "good" condition value
high_value DECIMAL(10,2) -- "excellent" condition value
tax_deductible BOOLEAN DEFAULT 1
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
valuation_source TEXT
source_date DATE
source_url TEXT
```

#### settings
```sql
id TEXT PRIMARY KEY DEFAULT lower(hex(randomblob(16)))
key TEXT NOT NULL UNIQUE
value TEXT NOT NULL
description TEXT
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

### Item Categories (12 total, 496 items):
- Appliances (48 items)
- Books & Media (39 items)
- Clothing - Children (30 items)
- Clothing - Men (43 items)
- Clothing - Women (40 items)
- Electronics (55 items)
- Furniture (47 items)
- Household Items (46 items)
- Jewelry & Accessories (22 items)
- Sports & Recreation (55 items)
- Tools & Equipment (38 items)
- Toys & Games (33 items)

### Item Valuation Rules:
- **good:** low_value from database
- **excellent:** high_value from database
- **very_good:** (low_value + high_value) / 2
- **fair:** 0 (not IRS deductible)

## 🚀 DEPLOYMENT STATUS:
- **GitHub:** https://github.com/robpress123-png/charity-tracker-qwik
- **Production:** https://charity-tracker-qwik.pages.dev
- **Version:** 2.3.7 (import broken)
- **Auto-deploy:** On every version bump

## 💭 CURRENT THINKING:
The import needs to work like a user manually entering data, not a bulk database operation. But we have Cloudflare's 10-second limit. We need a creative solution that:
1. Feels like manual entry
2. Completes in <10 seconds
3. Calculates all values
4. Matches charities properly

Maybe the answer is client-side chunking with multiple API calls?

## 📋 CSV IMPORT RULES
1. **Item Donations:**
   - Must use exact item names from 496-item database
   - Conditions: fair, good, very_good, excellent
   - System calculates values from database
   - NO item data in notes field
2. **Charity Matching:**
   - ~10,000 charities in database
   - Auto-creates user_charities for non-matches
   - Target: 90%+ match rate
3. **Notes Field:**
   - User comments ONLY
   - Examples: "Annual donation", "Christmas drive", "Memorial gift"
   - NEVER put item details or structured data

## 🔐 AUTHENTICATION
- Token-based auth (localStorage)
- Format: `token-{userId}-{timestamp}`
- Test user: test@example.com (password: test123)
- Admin access through admin-login.html

## 📈 MONETIZATION PLAN
- **Model:** Freemium
- **Free:** 3 donation limit for new users
- **Premium:** $49/year unlimited
- **Grandfathered:** All existing users get premium
- **NO:** Ads, affiliates, or enterprise sales

## 🗂 REFERENCE DOCS
- `/TEST_PLAN_v2.2.9.md` - Comprehensive test checklist
- `/FREEMIUM_STRATEGY.md` - Implementation plan
- `/PRICE_LOOKUP_INTEGRATION_PLAN.md` - Stock/crypto pricing
- `/MONETIZATION_ALTERNATIVES.md` - Revenue analysis
- `/TAX_TABLES_IMPLEMENTATION_PLAN.md` - Database-driven tax system
- `/db_migration_tax_tables.sql` - Tax tables schema ready

## 📝 IMPORTANT NOTES
- Dashboard uses vanilla JavaScript, NOT Qwik framework
- All database changes via Cloudflare Console
- Auto-deployment on every version bump
- Never put structured data in notes field
- Items must match database exactly
- Test all donation types: cash, items, miles, stock, crypto

## ✅ WORKING FEATURES (as of v2.3.7):
- User authentication & registration
- Cash donations (add, edit, delete)
- Item donations with multi-item support
- Miles tracking with IRS rates
- Stock & crypto donations
- Personal charity creation
- CSV import (broken at 175+ donations)
- Tax settings in database (v2.3.0)
- Admin dashboard with analytics
- Search & filter donations
- Year-end tax summary
- Receipt upload & storage

## 🏃 RESTART TIPS
1. Check if dev server still running: `lsof -i :8788`
2. Test CSVs are in project root, ready to import
3. Database console: Cloudflare Dashboard → D1
4. Always use `npm run bump:patch` for deployment
5. Check GitHub Actions for deployment status

---
**END OF CONTINUATION PROMPT v2.3.7**