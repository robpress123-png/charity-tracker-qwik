# Charity Tracker Qwik - Complete Continuation Prompt v2.15.3

## 🚨 CRITICAL DEVELOPMENT GUIDELINES - READ FIRST

### ⚠️ MANDATORY: Research Before Coding
**NEVER write code without first understanding the existing system. This pattern has caused multiple bugs.**

#### Required Investigation Steps:
1. **Before Creating ANY API Call:**
   - Check `functions/api/` for existing endpoints
   - Verify exact endpoint paths and parameter names
   - Confirm authentication format (Bearer token, etc.)
   - Test endpoint with curl if possible

2. **Before Database Operations:**
   - Check schema files in `/data/sql/schema/`
   - Verify table names and column names
   - Understand relationships between tables
   - Check if data is in `users` table or separate tables like `user_tax_settings`

3. **Before Creating New Files:**
   - Search for existing similar functionality
   - Check if the feature already exists
   - Look for naming patterns and conventions

4. **Before Modifying Existing Code:**
   - Read the entire file first
   - Understand the current implementation
   - Check for dependencies and side effects

## 🎉 Version 2.14.0 - ITSDEDUCTIBLE DATABASE MIGRATION

### What's New (v2.14.0)
- 🗄️ **ItsDeductible Items Database Support**: Ready to migrate from 496 test items to 1,757 real-world valuations
- 🗑️ **Delete All Items Tool**: Admin dashboard now has safe deletion with double confirmation
- 📊 **Enhanced Item Structure**: Support for hierarchical items with variants and search keywords
- 🔍 **Smart Search Ready**: Database schema supports progressive search across all items

### Migration Process for ItsDeductible Database

#### Key Migration Files Location
```bash
# Base directory for all migration files
cd /home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/Itsdeductible/

# Main files:
csvfmv_guide.csv                    # Original ItsDeductible CSV (1,757 items)
transform_itsdeductible.py          # Python script to transform CSV to SQL
items_database_itsdeductible.csv   # Transformed CSV output
items_database_itsdeductible.sql   # SQL INSERT statements (ready to run)
migration_schema_update.sql         # Database schema changes
add_columns_only.sql               # Alternative: just add columns to existing table

# API endpoint for delete all:
../functions/api/items/delete-all.js  # Delete all items endpoint

# Admin UI with delete button:
../dist/admin-dashboard.html        # Line 1039-1051: Delete All Items section
```

#### Step 1: Prepare Database
1. Go to Admin Dashboard → Items Database → Manage Items
2. Click "Delete All Items" (red section)
3. Type "DELETE ALL" and confirm twice
4. Verify 0 items remaining

#### Step 2: Update Database Schema
Run in Cloudflare D1 Console:
```sql
-- From /home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/Itsdeductible/migration_schema_update.sql
DROP TABLE IF EXISTS items;
CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    category_id INTEGER,
    name TEXT NOT NULL,
    item_variant TEXT,
    description TEXT,
    value_good DECIMAL(10,2),
    value_very_good DECIMAL(10,2),
    value_excellent DECIMAL(10,2),
    source_reference TEXT DEFAULT 'ItsDeductible 2024',
    date_of_valuation DATE DEFAULT '2024-01-01',
    search_keywords TEXT,
    original_description TEXT,
    -- Legacy compatibility
    category TEXT,
    low_value DECIMAL(10,2),
    high_value DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_search_keywords ON items(search_keywords);
```

#### Step 3: Import ItsDeductible Data
1. Run the transformation script (if needed):
   ```bash
   cd /home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/Itsdeductible
   python3 transform_itsdeductible.py
   ```
2. Import via D1 Console: Copy/paste from `/home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/Itsdeductible/items_database_itsdeductible.sql`
3. Update backward compatibility fields:
```sql
UPDATE items SET
    category = (SELECT name FROM item_categories WHERE id = items.category_id),
    low_value = value_good,
    high_value = value_excellent;
```

#### Step 4: Verify
```sql
SELECT COUNT(*) FROM items;  -- Should show 1,757
SELECT * FROM items WHERE name LIKE '%television%' LIMIT 5;
```

### ItsDeductible Benefits
- **3.5x more items** (1,757 vs 496)
- **Real-world valuations** commonly used for IRS filing
- **Hierarchical structure** (e.g., "Baby Monitor: Audio" vs "Baby Monitor: Video")
- **Better search** with keywords field
- **Industry standard** valuations

### Previous Versions Summary

#### v2.13.4 - CSV Export Fix
- Fixed double-counting in CSV exports (donation total only on first item row)

#### v2.13.0-3 - Enhanced Reporting
- Year selector for quick reports
- Item detail toggle
- Custom report filters by donation type
- Money formatting with commas
- Tax bracket percentage display

#### v2.12.1-4 - Critical Fixes
- Tax settings properly query `user_tax_settings` table
- Logout button infinite recursion fixed
- Reports module references corrected

## Current System Status

### Working Features
✅ **Complete Donation Tracking**: All types (Cash, Items, Stock, Crypto, Mileage)
✅ **Enhanced Reporting System**: 5 report types with filtering
✅ **Tax Calculations**: 2024-2026 tables, OBBBA compliant
✅ **Multi-User Support**: Full authentication system
✅ **Admin Console**: Complete management interface
✅ **Auto-Deployment**: GitHub → Cloudflare Pages
✅ **Items Database**: Ready for ItsDeductible migration

### Known Issues

#### 🔴 HIGH PRIORITY
1. **Payment Integration**: Stripe not implemented ($49/year tier)
2. **Mobile Responsiveness**: Not optimized for mobile/tablets

#### 🟡 MEDIUM PRIORITY
1. **Charity Database**: Missing major charities (Salvation Army, etc.)
2. **Receipt Upload Flow**: Must save donation first

## Database Schema (CRITICAL REFERENCE)

### Core Tables
```sql
-- Users with profile and subscription
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    password_hash TEXT,
    role TEXT DEFAULT 'user',  -- user/admin
    plan TEXT DEFAULT 'free',   -- free/pro
    address TEXT, city TEXT, state TEXT, zip_code TEXT,
    filing_status TEXT,         -- Legacy tax fields
    tax_bracket DECIMAL,
    income_range TEXT
);

-- Donations with all types
CREATE TABLE donations (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    charity_id TEXT,
    charity_name TEXT,
    donation_date DATE,
    donation_type TEXT,  -- cash/items/stock/crypto/mileage
    amount DECIMAL(10,2),  -- For cash donations
    -- Type-specific fields
    miles_driven DECIMAL(10,2),
    mileage_rate DECIMAL(10,4),
    mileage_purpose TEXT,
    stock_symbol TEXT,
    stock_quantity DECIMAL(10,4),
    crypto_symbol TEXT,
    crypto_quantity DECIMAL(10,8),
    cost_basis DECIMAL(10,2),
    fair_market_value DECIMAL(10,2),
    receipt_url TEXT,
    notes TEXT
);

-- Individual items within item donations
CREATE TABLE donation_items (
    id TEXT PRIMARY KEY,
    donation_id TEXT,
    item_name TEXT,
    category TEXT,
    condition TEXT,
    quantity INTEGER,
    unit_value DECIMAL(10,2),
    total_value DECIMAL(10,2),  -- quantity × unit_value
    FOREIGN KEY (donation_id) REFERENCES donations(id)
);

-- Items reference table (enhanced with versioning)
CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    category_id INTEGER,
    name TEXT,
    item_variant TEXT,          -- e.g., "Audio", "Video", "Men's", "Women's"
    description TEXT,
    value_good DECIMAL(10,2),   -- Good condition value
    value_very_good DECIMAL(10,2), -- Very good condition value
    value_excellent DECIMAL(10,2), -- Excellent condition value
    search_keywords TEXT,        -- For improved search
    source_reference TEXT,       -- e.g., "Valuation Guide 2024"
    date_of_valuation DATE,      -- When valued
    effective_date DATE,         -- NEW: When this valuation becomes active
    -- Legacy compatibility
    category TEXT,
    low_value DECIMAL(10,2),     -- Maps to value_good
    high_value DECIMAL(10,2)     -- Maps to value_excellent
);

-- Charities (10,000+ IRS verified)
CREATE TABLE charities (
    id TEXT PRIMARY KEY,
    ein TEXT UNIQUE,
    name TEXT,
    is_verified BOOLEAN DEFAULT 1
);

-- User's personal charities
CREATE TABLE user_charities (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    ein TEXT,
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tax settings by year
CREATE TABLE user_tax_settings (
    user_id TEXT,
    tax_year INTEGER,
    filing_status TEXT,
    tax_bracket DECIMAL(5,4),
    agi_range TEXT,  -- Note: agi_range, not income_range
    UNIQUE(user_id, tax_year)
);
```

### Tax Tables (6 types)
- `tax_brackets`: All filing statuses 2024-2026
- `capital_gains_rates`: 0%, 15%, 20% thresholds
- `standard_deductions`: By year and filing status
- `irs_mileage_rates`: Business, charity, medical
- `contribution_limits`: AGI percentages
- `user_tax_settings`: User's tax profile per year

### Item Categories (21 ItsDeductible + 1 Misc)
1. Automotive Supplies
2. Baby Gear
3. Bedding & Linens
4. Books, Movies & Music
5. Cameras & Equipment
6. Clothing, Footwear & Accessories (389 items!)
7. Computers & Office
8. Furniture & Furnishings
9. Health & Beauty
10. Home Audio & Video
11. Housekeeping
12. Kitchen
13. Lawn & Patio
14. Luggage, Backpacks & Cases
15. Major Appliances
16. Musical Instruments
17. Pet Supplies
18. Phones & Communications
19. Sporting Goods
20. Tools & Hardware
21. Toys, Games & Hobbies
22. Portable Audio & Video (catch-all)
99. Miscellaneous

## API Endpoints (VERIFIED)

### Core Endpoints
```javascript
// Authentication - ALWAYS use Bearer prefix
headers: { 'Authorization': `Bearer ${token}` }

// User endpoints
GET /api/users/settings           // General settings
GET /api/users/tax-settings?year=2024  // Tax by year
PUT /api/users/tax-settings       // Update tax settings

// Donation endpoints
GET /api/donations?year=2024      // Get by year
GET /api/donations/{id}/items     // Get item details
POST /api/donations               // Create donation
DELETE /api/donations/{id}        // Delete donation

// Items endpoints
GET /api/items?type=categories    // Get categories
GET /api/items/search?q=television // Search items
DELETE /api/items/delete-all      // Delete all (admin)
POST /api/items/import            // Import CSV

// Charity endpoints
GET /api/charities/search?q=red%20cross
POST /api/charities/add-personal
```

## File Structure
```
charity-tracker-qwik/
├── dist/                       # Frontend files
│   ├── dashboard.html         # Main app
│   ├── admin-dashboard.html   # Admin console
│   ├── js/
│   │   ├── reports-module-v2.js  # Active reports
│   │   └── storage-helper.js
├── functions/api/             # Cloudflare Functions
│   ├── items/
│   │   ├── delete-all.js     # NEW: Delete all items
│   │   ├── import.js
│   │   └── search.js
├── data/
│   ├── core/items/
│   │   └── items_database_497.csv  # Current test data
├── Itsdeductible/
│   ├── csvfmv_guide.csv      # Original ItsDeductible
│   ├── transform_itsdeductible.py  # Transformation script
│   ├── items_database_itsdeductible.csv  # Transformed
│   ├── items_database_itsdeductible.sql  # SQL inserts
│   └── migration_schema_update.sql  # Schema changes
```

## Infrastructure

### Environment
- **Live URL**: https://charity-tracker-qwik.pages.dev
- **GitHub**: https://github.com/robpress123-png/charity-tracker-qwik
- **Database**: Cloudflare D1 (ID: 4b7b5031-1844-4ed9-aac0-fcb0e4bf0b3d)
- **Version**: 2.15.3

### Tech Stack
- Frontend: Vanilla JavaScript (NOT Qwik framework despite name)
- Hosting: Cloudflare Pages with Functions
- Database: Cloudflare D1 (SQLite)
- Auth: SHA-256 hashed, sessionStorage tokens
- Reports: Client-side CSV/HTML generation

## Development Guidelines

### Cardinal Rules
1. **RESEARCH FIRST**: Check existing code before writing
2. **Check Schema**: Verify table/column names
3. **Test Endpoints**: Use curl to verify
4. **Bearer Token**: All API calls need `Bearer ${token}`
5. **No Qwik**: Use vanilla JS despite folder name
6. **Web Crypto**: Use Web Crypto API, not Node.js crypto

### Common Commands
```bash
# Development
source ~/.nvm/nvm.sh && nvm use 20
npx wrangler pages dev --local --port 8788

# Deployment
npm run bump:patch  # x.x.+1
npm run bump:minor  # x.+1.0
npm run bump:major  # +1.0.0
git add -A && git commit -m "message"
git push  # Auto-deploys to Cloudflare

# Database - Use Cloudflare Dashboard Console
# Workers & Pages → D1 → charity-tracker-qwik-db
```

## Testing Checklist for v2.15.0
- [ ] Enhanced import UI shows source/date fields
- [ ] CSV template downloads properly
- [ ] Smart matching detects duplicates correctly
- [ ] Match review UI displays for conflicts
- [ ] Bulk user delete with checkboxes works
- [ ] Dashboard auto-refreshes when switching sections
- [ ] Dropdown menus don't get cut off
- [ ] Import processes 1,757 items successfully
- [ ] Effective date filtering works in donations

## Business Model
- **Free Tier**: 3 donations limit
- **Premium**: $49/year unlimited (not implemented)
- **Market**: ItsDeductible shutting down Oct 2025
- **Advantages**: Free tier, crypto support, real-time tax calc

## Critical Gotchas
1. **Items table**: Now supports hierarchical structure
2. **Double values**: `low_value`/`high_value` for legacy, `value_good`/`value_excellent` for new
3. **Category field**: Both ID and text name for compatibility
4. **Search keywords**: New field for better search
5. **Admin delete**: Requires typing "DELETE ALL" exactly
6. **Version**: Current version 2.15.3
7. **Smart matching**: 90% threshold for review prompts (reduced from 85%)
8. **Category mapping**: Fixed - 1=Automotive, 6=Clothing (not 1=Women's)
7. **Import endpoint**: Use `/api/items/import-enhanced` not `/api/items/import`
8. **Condition values**: Fair=$0 (not deductible), Good/Very Good/Excellent have values

## Import Strategy
1. **Initial Import**: Use "Replace existing" for clean migration
2. **Future Updates**: Use "Review matches" to handle duplicates carefully
3. **Source tracking**: Always specify source for audit trail
4. **Date management**: Items remain valid until newer version imported

Ready for enhanced valuation database migration!