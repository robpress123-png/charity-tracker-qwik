# Charity Tracker Continuation Context - v2.3.12
**Generated:** 2025-01-25
**Current Version:** 2.3.12
**Status:** Working - Test data fixed, item edit values fixed, UI improvements

## ✅ RECENT FIXES (Session 2025-01-25):
1. **Created real data test generator** (`generate_test_csvs_real_data.py`)
   - Loads 10,000 real charities from export
   - Loads 496 real items from database
   - Generates proper CSV structure for all donation types
2. **Fixed item edit values showing 0**
   - Corrected API field mapping (value_good, value_verygood, value_excellent)
3. **UI Improvements**
   - Changed "Unit $" to "Unit FMV" in edit form
   - Updated icons: Items 🎁, Crypto 🪙
   - Made Actions button more prominent (purple with shadow)

### CSV Structure Requirements:
#### Item Donations MUST have (per item):
- `item_1_category` - Must match database categories exactly
- `item_1_name` - Must match database item names exactly
- `item_1_quantity` - Number of items
- `item_1_condition` - ONLY: fair, good, very_good, excellent
- (Repeat for item_2, item_3, etc. up to 5 items per donation)

#### Stock Donations MUST have:
- `stock_symbol` - Ticker symbol
- `stock_quantity` - Number of shares
- `cost_basis` - Original purchase price (total)
- `fair_market_value` - Current value (total)

#### Crypto Donations MUST have:
- `crypto_symbol` - Ticker (BTC, ETH, etc.)
- `crypto_quantity` - Amount
- `crypto_type` - Full name (Bitcoin, Ethereum, etc.)
- `cost_basis` - Original cost
- `fair_market_value` - Current value

#### Mileage Donations MUST have:
- `miles_driven` - Number of miles
- `mileage_rate` - IRS rate (0.14 for 2024)
- `mileage_purpose` - Description of charity work

## 📊 RECENT CHANGES (v2.3.8-2.3.11):

### v2.3.8: CSV Import Chunking
- ✅ Client-side chunking (25 donations per chunk)
- ✅ Deferred value calculations to avoid timeout
- ✅ Created `/api/donations/assign-values` endpoint
- ✅ Successfully imports 175+ donations without timeout

### v2.3.9: Display Fixes
- ✅ Fixed item donations showing $0.00 (now uses estimated_value)
- ✅ Enhanced stock/crypto/miles donation detail views
- ✅ Added comprehensive donation details display

### v2.3.10: Edit View Fixes
- ✅ Fixed stock donation edit (populates fields correctly)
- ✅ Fixed crypto donation edit
- ✅ Calculates price per share from stored data
- ✅ Shows user notes on all donation types

### v2.3.11: Filter Fix
- ✅ Type filter now reapplies when year changes
- ✅ Fixed donation filtering persistence

### v2.3.12: Test Data & UI Fixes
- ✅ Real data test CSV generator created
- ✅ Fixed item edit value calculations
- ✅ UI improvements (Unit FMV, icons, button styling)

## ✅ PREVIOUSLY RESOLVED ISSUES:

### Test Data Generation (FIXED):
**Previous Problem:** Test CSVs used made-up data
**Solution Applied:**
- Created `generate_test_csvs_real_data.py`
- Loads real charities from `charities_export_2025-09-25.csv`
- Loads real items from `/mnt/c/Users/RobertPressman/charity-tracker/items_database_2025-09-25 (1).csv`
- Generated files: `user1_test_real_data.csv` through `user5_test_real_data.csv`
- Successfully imported 175+ donations per user

## 📁 PROJECT STRUCTURE
```
charity-tracker-qwik/
├── dist/
│   └── dashboard.html      # v2.3.11 - All fixes applied
├── functions/api/
│   ├── donations/
│   │   ├── import.js       # Handles chunked imports
│   │   ├── import-v2.3.7-backup.js # Old version backup
│   │   └── assign-values.js # Batch value calculation
│   └── users/
│       └── settings.js     # Tax settings API
├── charities_export_2025-09-25.csv # REAL CHARITIES EXPORT (~10,000 charities)
├── generate_test_csvs_real_data.py # WORKING - uses real data from exports
├── user1_test_real_data.csv # Generated test data with real charities/items
├── user2_test_real_data.csv # Generated test data with real charities/items
├── user3_test_real_data.csv # Generated test data with real charities/items
├── user4_test_real_data.csv # Generated test data with real charities/items
├── user5_test_real_data.csv # Generated test data with real charities/items
├── db_migration_tax_tables.sql  # Tax tables schema
└── TAX_TABLES_IMPLEMENTATION_PLAN.md # Full tax system design
```

## 📊 CRITICAL DATA FILES (Must use these!):
**Charities Export:**
- **Linux Path:** `/home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/charities_export_2025-09-25.csv`
- **Windows Path:** `\\wsl$\Ubuntu\home\robpressman\workspace\Charity-Tracker-Qwik-Design\charity-tracker-qwik\charities_export_2025-09-25.csv`
- **Contains:** ~10,000 real charities from database

**Items Export:**
- **Windows Path:** `C:\Users\RobertPressman\charity-tracker\items_database_2025-09-25 (1).csv`
- **Linux Path (if copied):** `/mnt/c/Users/RobertPressman/charity-tracker/items_database_2025-09-25 (1).csv`
- **Contains:** 496 real items with categories and values

## 🗂 TEST DATA STATUS:
**Working Files (Use these):**
- `user1_test_real_data.csv` through `user5_test_real_data.csv`
- Generated with `generate_test_csvs_real_data.py`
- Contains real charity names and real item names
- 175-176 donations per user
- Proper column structure for all donation types

**Test Requirements Met:**
- 175 donations per user
- Minimum 3 of each type in 2025
- 90% real charities from database
- 10% personal charities
- ALL items from actual database
- Date distribution: ~10% 2024, ~80% 2025, ~10% 2026

## 📊 COMPLETE DATABASE SCHEMA

### donations table columns:
```sql
-- Core fields
id, user_id, charity_id, user_charity_id,
donation_type, amount, date, notes

-- Mileage fields
miles_driven, mileage_rate, mileage_purpose

-- Stock fields
stock_symbol, stock_quantity, cost_basis, fair_market_value

-- Crypto fields
crypto_symbol, crypto_quantity, crypto_type

-- Item fields (summary)
item_description, estimated_value
```

### donation_items table (for item details):
```sql
id, donation_id, item_name, category, condition,
quantity, unit_value, total_value, value_source
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
- **fair:** 0 (not tax deductible)
- **good:** low_value from database
- **very_good:** (low_value + high_value) / 2
- **excellent:** high_value from database

## 🚀 PROJECT OVERVIEW
Charity Tracker is a web application for tracking charitable donations for tax purposes. Built with vanilla JavaScript (NOT Qwik framework), Cloudflare Pages, and D1 database.

## 🔧 AUTO-DEPLOYMENT SYSTEM
- `npm run bump:patch` - Auto commits, pushes, deploys
- GitHub webhook triggers Cloudflare Pages
- Live at: https://charity-tracker-qwik.pages.dev

## 💾 DATABASE MANAGEMENT
- **Type:** Cloudflare D1 (SQLite)
- **Management:** Via Cloudflare Dashboard Console (NOT CLI)
- **IMPORTANT:** All schema changes via Console, not code

## 🔧 DEVELOPMENT COMMANDS:
```bash
# Start dev server
cd /home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik
source ~/.nvm/nvm.sh && nvm use 20
npx wrangler pages dev --local --port 8788

# Deploy
npm run bump:patch  # 2.3.11 → 2.3.12

# Test import
# Login as test@example.com (password: test123)
# Upload properly formatted CSV with REAL data
```

## 📋 CSV IMPORT RULES
1. **Charities MUST match database** (90% match rate expected)
2. **Items MUST use exact names** from 496-item database
3. **Conditions:** ONLY fair, good, very_good, excellent
4. **No structured data in notes** - User comments only
5. **All type-specific fields required** (see structure above)

## 🔐 AUTHENTICATION
- Token-based auth (localStorage)
- Test user: test@example.com / test123

## ✅ WORKING FEATURES (v2.3.12):
- ✅ Chunked CSV import (no timeout on 175+ donations)
- ✅ Proper display of all donation types
- ✅ Edit works for all donation types with value updates
- ✅ Value calculations from database
- ✅ Tax settings in database
- ✅ Filter persistence across year changes
- ✅ Real data test CSV generator
- ✅ Item edit form shows correct FMV based on condition

## 🐛 KNOWN ISSUES:
1. **Tax tables not deployed** - Schema ready but not in D1
2. **Capital gains calculations** - Not implemented
3. **Mileage rates hardcoded** - Should be year-specific from database

## ⚠️ DON'T BREAK:
- Chunked import system (working well)
- Value calculations for items
- Edit functionality for all types
- Filter persistence

## 💡 SOLUTION FOR TEST DATA:
The generator MUST:
1. Read `/home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/charities_export_2025-09-25.csv`
2. Read `/mnt/c/Users/RobertPressman/charity-tracker/items_database_2025-09-25 (1).csv`
3. Pick ONLY from those real names (no made-up names!)
4. Use exact spelling/capitalization from exports
5. Include ALL proper type-specific columns
6. For items: use EXACT item names and EXACT category names from the export

## 🎯 NEXT STEPS:
1. **Fix test data generator** - Use real exported data ✅ COMPLETED
2. **Deploy tax tables** - Run migration in D1
3. **Create tax API endpoints**
4. **Implement capital gains calculations**
5. **Add year-specific mileage rates** - Store in tax tables (2024: $0.14, 2025: $0.14)

## 🔮 FUTURE ENHANCEMENTS:
1. **Three-tier item valuations** - Add `mid_value` column to items table
   - Currently: Only `low_value` (Good) and `high_value` (Excellent) stored
   - Very Good: Calculated as average
   - Better: Store actual mid-tier values from sources like:
     - Salvation Army Donation Value Guide (free PDF)
     - Goodwill Valuation Guide (free PDF)
     - IRS Publication 561
   - Would allow more accurate valuations when sources provide 3 tiers

## 📝 KEY INSIGHTS:
- Cloudflare Functions have 10-second CPU limit
- Chunking solves timeout issues
- Data MUST match database exactly for calculations
- Edit views need proper column data, not notes

## 🚀 DEPLOYMENT STATUS:
- **Version:** 2.3.12
- **GitHub:** https://github.com/robpress123-png/charity-tracker-qwik
- **Production:** https://charity-tracker-qwik.pages.dev
- **Status:** Fully functional with real test data

## 💭 CURRENT THINKING:
All major functionality is working. Test data now uses real charity and item names. Next priorities are deploying tax tables for proper tax calculations and implementing year-specific mileage rates. The three-tier valuation enhancement would improve accuracy but the current calculated average for "very good" items works adequately.

---
**END OF CONTINUATION PROMPT v2.3.12**