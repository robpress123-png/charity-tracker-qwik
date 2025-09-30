# Charity Tracker Qwik - Complete Continuation Prompt v2.13.4

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

## 🎉 Version 2.13.4 - CSV EXPORT DOUBLE-COUNTING FIX

### Latest Fixes (v2.13.4)
- ✅ **CSV Export Fix**: Donation total now only appears on first item row to prevent double-counting
- ✅ **Clear Totaling**: When item donations have multiple items, total is shown once, not repeated

### Previous Fixes (v2.13.3)
- ✅ **Item Values from Database**: Reports now correctly sum `total_value` from `donation_items` table
- ✅ **Fixed Items Endpoint**: `/api/donations/[id]/items` now queries actual stored values, not reference table
- ✅ **Proper Calculation**: Total = sum of all items' `total_value` (which is quantity × unit_value)

### ⚠️ IMPORTANT: Item Value Storage Pattern
- **When Saved**: Item values are stored in `donation_items` table (unit_value, quantity, total_value)
- **When Retrieved**: We use the STORED values from `donation_items`, NOT recalculated from items reference table
- **Reference Table**: The `items` table (496 items) is only for suggesting values during creation
- **Immutability**: Once saved, donation values should never change even if reference values update
- **CSV Export**: When exporting item details, donation total appears only on first row to avoid confusion

### Previous Fixes (v2.13.1)
- ✅ **Money Formatting**: All reports now display currency with proper comma formatting ($10,000.00)
- ✅ **Tax Bracket Display**: Fixed percentage display (shows 12% instead of 0.12%)
- ✅ **Item Donation Totals**: Reports now correctly calculate and include item donation values
- ✅ **API Endpoint Created**: Added missing `/api/donations/[id]/items` endpoint

### Major Feature Release (v2.13.0)
- 📊 **Enhanced Reporting Interface**
  - **Year Selector for Quick Reports**: Dropdown to select tax year
  - **Item Detail Toggle**: Checkbox to include/exclude item-by-item details
  - **Custom Report Filters**: Filter by donation type (Cash, Items, Stock, etc.)
  - **Multiple Report Formats**: CSV, Summary (modal), Detailed
  - **Dynamic Filtered Exports**: Export only selected donation types

### What's New in Reports
1. **Quick Reports Section**
   - Year dropdown (2024, 2025, 2026-OBBBA)
   - "Include item details" checkbox
   - All buttons use selected year

2. **Custom Report Generator**
   - Filter by any combination of donation types
   - Choose export format (CSV/Summary/Detailed)
   - Separate item detail control
   - Summary displays in modal for quick viewing

3. **Technical Enhancements**
   - `exportFilteredDonations()` function for custom filtering
   - Optional `includeItemDetails` parameter throughout
   - Dynamic filename generation based on filters
   - `formatMoney()` function for proper currency display
   - `formatPercentage()` function for tax bracket display
   - `getDonationAmount()` function handles all donation types including items

### Previous Fixes (v2.12.1-4)
- ✅ Tax settings properly query `user_tax_settings` table
- ✅ Logout button infinite recursion fixed
- ✅ Reports module references corrected (CharityReportsV2)
- ✅ Tax Summary displays in modal instead of popup
- ✅ All API calls use Bearer token prefix

## Current System Status

### Working Features
✅ **Enhanced Reporting System** (v2.13.0)
✅ **Complete Phase 1 Reports** (5 types with filtering)
✅ **All Donation Types**: Cash, Mileage, Stock, Crypto, Items
✅ **Tax Tables**: 2024-2026 rates, OBBBA compliant
✅ **Authentication**: SessionStorage with fallbacks
✅ **Two-Step Registration**: Optional profile completion
✅ **Admin Console**: Role-based authentication
✅ **Auto-Deployment**: GitHub → Cloudflare Pages

### Known Issues

#### ✅ RESOLVED IN v2.13.1-2.13.2
1. ~~**Annual Tax Summary Shows $0**~~: FIXED (v2.13.2) - Now uses estimated_value field for items
2. ~~**Money Formatting Missing**~~: FIXED (v2.13.1) - All reports use formatMoney() with comma formatting
3. ~~**Custom Reports Generate Errors**~~: FIXED (v2.13.1-2) - Created endpoint with proper fallback handling

#### 🔴 HIGH PRIORITY - BUSINESS
1. **Payment Integration**: Stripe not yet implemented
   - Critical for business model monetization
   - $49/year premium tier

2. **Orphan Code**: ~150KB of unused files
   - `dist/js/reports-module.js` (28KB) - old version
   - 4 backup HTML files (dashboard backups, register backup)
   - Should be cleaned up

#### 🟡 MEDIUM PRIORITY
- **Charity Search**: Missing major charities (Salvation Army, Purple Heart, etc.)
  - Current CSV has 10,000 charities but missing major ones
  - Future goal: Scale to full IRS database (1M+ charities)
- **Mobile Responsiveness**: Not optimized for mobile/tablets
- **Receipt Upload Flow**: Must save donation first, then add receipt
- **Item "Other" Category**: Missing from dropdown for custom items

## Database Schema (CRITICAL REFERENCE)

### Core Tables
- **users**: Multi-user support with plans (free/pro) and role field
  - Profile fields: address, city, state, zip_code
  - Tax fields: tax_bracket, filing_status, income_range (legacy)
  - System: role (user/admin), plan (free/pro)
- **donations**: All donation types with type-specific fields
  - Cash: amount, notes
  - Miles: miles_driven, mileage_rate, mileage_purpose
  - Stock: stock_symbol, stock_quantity, cost_basis, fair_market_value
  - Crypto: crypto_symbol, crypto_quantity, cost_basis, fair_market_value, crypto_price_per_unit
  - Items: Uses donation_items table for item-by-item breakdown
- **charities**: ~10,000 IRS verified charities
- **user_charities**: Personal/custom charities
- **donation_items**: Individual items within donations (relational)
- **items**: 496 items with IRS-approved valuations

### Tax Tables (6)
- **tax_brackets**: All filing statuses and brackets 2024-2026
- **capital_gains_rates**: 0%, 15%, 20% thresholds
- **standard_deductions**: By year and filing status
- **irs_mileage_rates**: Business, charity, medical, moving
- **contribution_limits**: AGI percentages, special rules
- **user_tax_settings**: User's tax profile per year

### Tax Settings Storage
```sql
-- Tax settings are stored BY YEAR in a separate table
CREATE TABLE user_tax_settings (
    user_id TEXT NOT NULL,
    tax_year INTEGER NOT NULL,
    filing_status TEXT,
    tax_bracket DECIMAL(5,4),
    agi_range TEXT,  -- Note: column is agi_range, not income_range
    UNIQUE(user_id, tax_year)
);

-- Some legacy data might be in users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    filing_status TEXT,    -- Legacy location
    tax_bracket DECIMAL,   -- Legacy location
    income_range TEXT      -- Legacy location
);
```

### Item Categories (12 total, 496 items)
- Appliances (48), Books & Media (39), Clothing - Children (30)
- Clothing - Men (43), Clothing - Women (40), Electronics (55)
- Furniture (47), Household Items (46), Jewelry (22)
- Sports & Recreation (55), Tools (38), Toys & Games (33)

## API Endpoints (VERIFIED)

### User Endpoints
- `GET /api/users/settings` - General user settings (from users table)
- `GET /api/users/tax-settings?year=2024` - Tax settings by year (from user_tax_settings)
- `PUT /api/users/tax-settings` - Update tax settings for a year

### Donation Endpoints
- `GET /api/donations?year=2024` - Get donations for a year
- `GET /api/donations/{id}/items` - Get item details for a donation

### Authentication Format
```javascript
// ALWAYS use Bearer prefix
headers: {
    'Authorization': `Bearer ${token}`
}
```

## Reports Module Interface (v2.13.0)

### Quick Report Functions
```javascript
// All accept year and includeDetails parameters
CharityReportsV2.generateTaxSummary(year)
CharityReportsV2.exportScheduleA(year)
CharityReportsV2.exportAllDonations(year, includeDetails)
CharityReportsV2.generateReceiptAudit(year)
```

### Custom Report Function
```javascript
// New filtered export with type selection
CharityReportsV2.exportFilteredDonations(
    year,           // Tax year
    types,          // Array: ['cash', 'items', 'stock', etc.]
    format,         // 'csv', 'summary', or 'detailed'
    includeDetails  // Boolean for item-by-item details
)
```

## File Structure (ACTUAL)
```
charity-tracker-qwik/
├── dist/
│   ├── index.html             # Landing page
│   ├── register.html          # Two-step registration
│   ├── dashboard.html          # Main app (updated with new report UI)
│   ├── admin-dashboard.html    # Admin console with role-based auth
│   ├── admin-login.html       # Admin login page
│   ├── js/
│   │   ├── reports-module.js   # ORPHAN - to be deleted
│   │   ├── reports-module-v2.js # ACTIVE - v2.13.0 enhanced
│   │   └── storage-helper.js   # Session storage utilities
│   └── [backup files]          # ORPHAN - to be deleted
├── functions/api/              # Cloudflare Functions
│   ├── admin/
│   │   ├── auth.js            # Uses Web Crypto API
│   │   └── tax-import-unified.js
│   ├── auth/
│   │   └── register.js        # Two-step registration
│   ├── users/
│   │   ├── settings.js        # General user settings
│   │   └── tax-settings.js    # Tax settings by year
│   ├── donations/
│   │   └── import.js          # CSV import
│   └── charities/
│       └── search.js          # Full database search
├── data/
│   ├── core/
│   │   ├── charities/
│   │   │   └── charities_10k_full.csv    # 10,000 IRS charities
│   │   ├── items/
│   │   │   └── items_database_497.csv    # 496 items with valuations
│   │   └── tax/
│   │       └── all_tax_data_2024_2026.csv # Tax tables 2024-2026
│   ├── sql/schema/            # DATABASE SCHEMAS - CHECK FIRST
│   └── imports/test_data/     # Test CSV files
├── scripts/
│   └── auto-version-bump.js  # Deployment automation
└── sql/
    └── add_user_role.sql     # Admin role migration
```

## Infrastructure

### Environment
- **Live URL**: https://charity-tracker-qwik.pages.dev
- **GitHub**: https://github.com/robpress123-png/charity-tracker-qwik
- **Database**: Cloudflare D1 (ID: 4b7b5031-1844-4ed9-aac0-fcb0e4bf0b3d)
- **Current Version**: 2.13.4

### Tech Stack
- Frontend: Vanilla JavaScript (NOT Qwik framework)
- Hosting: Cloudflare Pages with Functions
- Database: Cloudflare D1 (SQLite)
- Auth: SHA-256 hashed, sessionStorage tokens
- Reports: Client-side CSV/HTML generation

## Business Model & Market Opportunity
- **Free**: 3 donations limit
- **Premium**: $49/year unlimited
- **Market**: ItsDeductible shutting down Oct 2025
- **Competitive Advantages**:
  - Free tier available
  - Native crypto support
  - Real-time tax calculations
  - Flexible reporting options

## Authentication & Security
- **Multi-user**: Full registration and login
- **Security**: SHA-256 hashed passwords (Web Crypto API, NOT Node.js crypto)
- **Token format**: `token-{userId}-{timestamp}`
- **Storage**: sessionStorage with localStorage fallback
- **Admin access**: Database-driven with role field
  - API endpoint: /api/admin/auth
  - Requires role = 'admin' in users table
- **Two-Step Registration**: Optional profile completion after account creation

## Development Guidelines

### Cardinal Rules
1. **RESEARCH FIRST**: Never write code without understanding existing system
2. **Check Database Schema**: Always verify table/column names
3. **Test API Endpoints**: Use curl to verify before coding
4. **Look for Existing Code**: Don't create duplicates
5. **Use Correct References**: CharityReportsV2, not CharityReports
6. **Add Bearer Prefix**: All API calls need `Bearer ${token}`
7. **Clean Code**: Remove orphan files regularly

### Common Commands
```bash
# ALWAYS START WITH THESE:
grep -r "function_name" dist/           # Find where functions are defined
grep -r "endpoint" functions/api/       # Find API endpoints
find . -name "*.sql" | xargs grep "table_name"  # Find database schemas

# Development
source ~/.nvm/nvm.sh && nvm use 20
npx wrangler pages dev --local --port 8788

# Testing endpoints
curl -s http://localhost:8788/api/users/tax-settings?year=2024 \
  -H "Authorization: Bearer test-token-12345"

# Deployment
npm run bump:patch  # 2.13.0 → 2.13.1
npm run bump:minor  # 2.13.0 → 2.14.0
npm run bump:major  # 2.13.0 → 3.0.0

# Database - Cloudflare Dashboard Console ONLY
# Workers & Pages → D1 → charity-tracker-qwik-db
```

### Critical Gotchas
1. **Use vanilla JavaScript** - NOT Qwik framework despite folder name
2. **Admin needs role='admin'** in database
3. **Use Web Crypto API** for auth, NOT Node.js crypto
   - Correct: `await crypto.subtle.digest('SHA-256', data)`
   - Wrong: `import { createHash } from 'crypto'`
4. **Database access** - Cloudflare Console only, no CLI
5. **Custom items** need value_source field for IRS compliance
6. **Item values**: Import looks up from database, not CSV
7. **Notes field**: User comments ONLY, no structured data
8. **Charity matching**: Uses fuzzy matching, creates user_charities for misses
9. **Test on both** standard and ultrawide monitors

## Testing Checklist
- [x] Year selector works for all quick reports
- [x] Item detail toggle controls CSV output
- [x] Custom filters work by donation type
- [x] Summary report displays in modal
- [x] Filtered exports generate correct filenames
- [x] Tax Summary displays in integrated modal
- [x] All API endpoints return JSON not HTML
- [x] Logout works without infinite recursion

## Next Priorities

### IMMEDIATE
1. **Clean up orphan code** (~150KB)
   ```bash
   rm dist/js/reports-module.js
   rm dist/*backup*.html
   ```

2. **Payment Integration** (Critical)
   - Implement Stripe
   - Subscription management
   - Free tier enforcement

#### Phase 2 Features
1. **Mobile Responsive Design**
2. **Complete Charity Database** (1M+ organizations)
3. **Receipt OCR** and auto-categorization
4. **Form 8283** generation for non-cash > $500
5. **Tax Package Export**
   - TurboTax API integration
   - H&R Block export
   - FreeTaxUSA compatibility
   - Generic forms (8283, Schedule A)

## Success Metrics
✅ Reports generate with user-selected options
✅ Item details toggle works as expected
✅ Custom filters properly filter donations
✅ All 5 report types functional
✅ No JavaScript errors in console
✅ Version 2.13.0 deployed and live

## About This Continuation Prompt

### Purpose
Comprehensive project state to maintain continuity across sessions, preserving critical patterns and preventing repeated mistakes.

### Critical Lessons Learned
- **Always research before coding** - Prevents wrong assumptions
- **Database schema is truth** - Check actual tables/columns
- **API endpoints must be verified** - Test with curl first
- **User feedback matters** - Year selector and filters were user suggestions

### Version History
- v2.12.0: Phase 1 Reporting System
- v2.12.1-4: Critical fixes (logout, API endpoints, tax settings)
- v2.13.0: Enhanced reporting with filters and year selection
- v2.13.1: Fixed money formatting, tax bracket display, item totals in reports
- v2.13.2: Fixed item donation value calculation using estimated_value field
- v2.13.3: Fixed items endpoint to use stored values from donation_items table
- v2.13.4: Fixed CSV export to show donation total only on first item row

### When to Update
- After major feature releases
- When critical bugs are fixed
- Before context limit reached
- When architecture changes

Ready for payment integration and cleanup!