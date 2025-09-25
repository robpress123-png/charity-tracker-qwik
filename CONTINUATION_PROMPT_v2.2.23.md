# Charity Tracker Continuation Context - v2.2.23
**Generated:** 2025-09-25
**Current Version:** 2.2.22 (check package.json for latest)

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
  - `npm run bump:patch` - Patch version (2.2.22 → 2.2.23)
  - `npm run bump:minor` - Minor version (2.2.22 → 2.3.0)
  - `npm run bump:major` - Major version (2.2.22 → 3.0.0)
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
-- MISSING: tax_bracket, filing_status (currently in localStorage - NEEDS FIX)
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

#### item_categories
```sql
id INTEGER PRIMARY KEY
name TEXT NOT NULL
description TEXT
icon TEXT
is_active BOOLEAN DEFAULT 1
sort_order INTEGER DEFAULT 100
created_at DATETIME
updated_at DATETIME
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

## 📁 PROJECT STRUCTURE
```
charity-tracker-qwik/
├── dist/                    # Frontend files
│   ├── dashboard.html       # Main user dashboard
│   ├── admin-dashboard.html # Admin panel
│   └── login.html          # User login
├── functions/api/          # Cloudflare Pages Functions
│   ├── donations/          # Donation CRUD, import, export
│   ├── charities/          # Charity search, management
│   ├── items/              # Item database management
│   ├── users/              # User management
│   └── settings/           # System settings
├── scripts/
│   └── auto-version-bump.js # Deployment automation
├── data/
│   └── items_database_497.csv # Source items (1 rejected on import = 496)
├── charities_export_2025-09-25.csv # 10,000 charities from database
├── package.json            # Version tracking
└── wrangler.toml          # Cloudflare configuration
```

### Key Data Files:
- **Items Database:** `/data/items_database_497.csv` - 496 valid donation items
- **Charities Database:** `/charities_export_2025-09-25.csv` - 10,000 IRS charities

## 🛠 COMMON COMMANDS
```bash
# Development
source ~/.nvm/nvm.sh && nvm use 20
npx wrangler pages dev --local --port 8788

# Deployment (auto-commits and pushes)
npm run bump:patch  # 2.2.22 → 2.2.23
npm run bump:minor  # 2.2.22 → 2.3.0
npm run bump:major  # 2.2.22 → 3.0.0

# Database access
# Use Cloudflare Dashboard Console - NO CLI ACCESS
```

## 🚨 CRITICAL ISSUES TO FIX

### 1. Tax Settings in localStorage (HIGH PRIORITY)
- **Problem:** Tax bracket & filing status stored in browser localStorage
- **Risk:** Lost on browser clear, not synced across devices
- **Solution:**
  - Add columns to users table: tax_bracket, filing_status
  - Migrate localStorage values on next login
  - Update API endpoints to save/load from database

### 2. CSV Import Format
- **Problem:** Legacy format puts items in notes field as ITEMS:[...]
- **Solution:** Items should be in separate columns:
  - item_1_name, item_1_category, item_1_condition, item_1_quantity
  - item_2_name, item_2_category, item_2_condition, item_2_quantity
  - NO values in CSV - system calculates from database
  - Notes field ONLY for user notes

## ✅ RECENT FIXES (v2.2.20-2.2.22)
- Added export tools for items and charities databases
- Generated compliant CSV test files with proper format
- Items now use database values, not hardcoded in CSV
- Fixed admin dropdown menus for user actions

## 📋 CSV IMPORT RULES
1. **Item Donations:**
   - Must use exact item names from 496-item database
   - Conditions: fair, good, very_good, excellent
   - System calculates values from database
   - NO items data in notes field
2. **Charity Matching:**
   - ~10,000 charities in database
   - Auto-creates user_charities for non-matches
   - Target: 80%+ match rate
3. **Notes Field:**
   - User comments ONLY
   - Examples: "Annual donation", "Christmas drive", "Memorial gift"
   - NEVER put item details or structured data

## 🔐 AUTHENTICATION
- Token-based auth (localStorage)
- Format: `token-{userId}-{timestamp}`
- Admin access through admin-login.html

## 📈 MONETIZATION PLAN
- **Model:** Freemium
- **Free:** 3 donation limit for new users
- **Premium:** $49/year unlimited
- **Grandfathered:** All existing users get premium
- **NO:** Ads, affiliates, or enterprise sales

## 🎯 NEXT PRIORITIES
1. Fix tax settings storage (localStorage → database)
2. Test CSV imports with new format
3. Implement freemium model
4. Add stock/crypto price lookups
5. Charity Navigator integration

## 📝 IMPORTANT NOTES
- Dashboard uses vanilla JavaScript, NOT Qwik framework
- All database changes via Cloudflare Console
- Auto-deployment on every version bump
- Never put structured data in notes field
- Items must match database exactly
- Test all donation types: cash, items, miles, stock, crypto

---
**END OF CONTINUATION PROMPT v2.2.23**