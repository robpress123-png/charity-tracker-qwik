# Charity Tracker Qwik - Comprehensive Continuation Context
## Last Updated: 2025-01-20 (Version 1.4.7)

## Project Overview
**Charity Tracker Qwik** - A multi-user web application for tracking charitable donations with tax optimization features, built on Cloudflare Pages with D1 database.

### Current Status
- **Version:** 1.4.7
- **Live URL:** https://charity-tracker-qwik.pages.dev
- **GitHub:** https://github.com/robpress123-png/charity-tracker-qwik
- **Auto-deployment:** Enabled via GitHub integration
- **Database:** Cloudflare D1 (charity-tracker-qwik-db)
- **Database ID:** 4b7b5031-1844-4ed9-aac0-fcb0e4bf0b3d

## CRITICAL: Complete Database Schema

### 1. USERS TABLE
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- SHA-256 hashed
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### 2. DONATIONS TABLE
```sql
CREATE TABLE donations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    charity_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,          -- NOTE: Column is 'date', not 'donation_date'
    receipt_url TEXT,
    notes TEXT,                  -- Currently stores JSON with donation type info
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE CASCADE
)
```

### 3. CHARITIES TABLE
```sql
CREATE TABLE charities (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,       -- NOTE: This suggests user-specific charities
    name TEXT NOT NULL,
    ein TEXT,
    category TEXT,
    website TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

### 4. ITEM_CATEGORIES TABLE
```sql
CREATE TABLE item_categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT
)
-- Has 12 categories: Clothing (Women/Men/Children), Household, Electronics, Furniture, Books & Media, Sports, Toys, Appliances, Jewelry, Tools
```

### 5. DONATION_ITEMS TABLE (CRITICAL!)
```sql
CREATE TABLE donation_items (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    value_poor REAL,         -- Not used for IRS deductions
    value_fair REAL,         -- Not used for IRS deductions
    value_good REAL,         -- Used for IRS (minimum acceptable condition)
    value_excellent REAL,    -- Used for IRS
    FOREIGN KEY (category_id) REFERENCES item_categories(id)
)
-- Contains 497 items with IRS-approved valuations
```

## Key Implementation Details

### Authentication
- Passwords are SHA-256 hashed
- Test account: test@example.com / password123
- Multi-user support with data isolation by user_id
- Token format: `token-{userId}-{timestamp}`

### Donation Types & Storage
All donation types store type-specific data in the notes field as JSON:
```javascript
{
  donation_type: "miles|stock|crypto|items|cash",
  miles_driven: 56,
  mileage_purpose: "deliver meals",
  stock_symbol: "AAPL",
  shares_donated: 100,
  crypto_symbol: "BTC",
  crypto_quantity: 0.5,
  crypto_donation_datetime: "2025-01-20T14:30:00",
  notes: "User's actual notes text"
}
```

### Item Quality Mapping (IRS Standards)
- **Fair**: Always $0 (not IRS deductible - below minimum condition requirement)
- **Good**: Uses `value_good` from database (minimum IRS acceptable condition)
- **Very Good**: Calculated as average of `value_good` and `value_excellent`
- **Excellent**: Uses `value_excellent` from database
- Note: IRS only accepts items in "Good" condition or better for tax deductions. Fair items can be tracked but have no deductible value.

### API Endpoints
- `/api/auth/login` - User authentication
- `/api/auth/register` - User registration
- `/api/donations` - CRUD operations for donations
- `/api/charities` - Charity search/management
- `/api/items` - Donation items by category
- `/api/admin/stats` - Dashboard statistics

## Recent Fixes (Session 2025-01-20)

### 1. Database Column Alignment
- **Problem**: Items API was querying non-existent columns
- **Fix**: Updated to use correct columns: `value_poor`, `value_fair`, `value_good`, `value_excellent`

### 2. Cash Donation Save Error
- **Problem**: New donations treated as edits due to null/undefined check
- **Fix**: Check both null AND undefined for `window.editingDonationId`

### 3. Items Donation Form
- **Redesigned**: Changed category from text search to dropdown select
- **Layout**: Horizontal layout for category, item, quality, quantity
- **Quality Options**: Fair ($0), Good, Very Good, Excellent (IRS-compliant)
- **Value Calculation**: Fair = $0, Very Good = average of Good and Excellent

### 4. Authorization in PUT Endpoint
- **Problem**: PUT endpoint didn't extract userId from token
- **Fix**: Added proper token parsing to donations.js PUT handler

## Known Issues & TODO

### Current Issues (Resolved)
1. ✅ Items API column mismatch
2. ✅ Cash donation save error
3. ✅ Items dropdown not populating
4. ✅ Quality options alignment

### Pending Features
1. **Version Numbers**: Update all pages to 1.4.6 (index.html, login.html still show 1.4.3)
2. **Database Normalization**: Add donation_type column instead of JSON in notes
3. **Automatic Price Lookups**: For stocks and crypto
4. **Receipt Uploads**: Photo storage capability
5. **Bank Imports**: Transaction import feature
6. **Recurring Donations**: Scheduling system

## Important Configuration Files

### wrangler.toml
```toml
name = "charity-tracker-qwik"
compatibility_date = "2023-12-01"
pages_build_output_dir = "./dist"

[env.production]
vars = { ENVIRONMENT = "production" }

[[env.production.d1_databases]]
binding = "DB"
database_name = "charity-tracker-qwik-db"
database_id = "4b7b5031-1844-4ed9-aac0-fcb0e4bf0b3d"
```

## Development Guidelines

### When Making Changes
1. **Database Schema**: Always check actual column names before querying
2. **Quality Levels**: Use only Good, Very Good, Excellent for IRS compliance
3. **Value Calculation**: Very Good = (value_good + value_excellent) / 2
4. **Version Control**: Update version in all HTML files consistently
5. **Git Commits**: Use descriptive messages with emoji prefix
6. **Testing**: Always test with real D1 database, not mock data

### Testing Checklist
- [ ] Login with test@example.com / password123
- [ ] Create new user and verify isolated data
- [ ] Test all donation types (cash, miles, stock, crypto, items)
- [ ] Verify notes field only shows user input
- [ ] Check donation type icons and descriptions
- [ ] Test charity autocomplete
- [ ] Verify tax calculations
- [ ] Test item donation workflow (category → item → quality → add)

## User Requirements & Goals

### Primary Goals
1. Support 5000+ users with isolated data
2. Track all IRS-deductible donation types
3. Maximize tax deduction benefits
4. Simplify tax filing with comprehensive reports
5. Maintain IRS compliance for all donation types

### User Preferences
- Clean, simple interface
- No unnecessary alerts or popups
- Toast notifications instead of modals
- Horizontal layouts to minimize scrolling
- Only show user-entered data in notes field
- IRS-compliant quality levels for items

## Console Commands for Database Management

### Check Database Schema
```sql
-- In Cloudflare D1 Console
SELECT sql FROM sqlite_master WHERE type='table' ORDER BY name;
```

### Reset Test User (if needed)
```
Visit: https://charity-tracker-qwik.pages.dev/api/auth/reset-test-user
```

### Debug Endpoints
- `/api/debug-donations` - Check raw donation data
- `/api/auth/debug-login` - Debug authentication issues

## Next Session Priorities

1. **Update Version Numbers**
   - index.html, login.html, admin.html → 1.4.6
   - Ensure consistency across all pages

2. **Test Complete Workflows**
   - Full item donation flow with new quality options
   - Stock and crypto donations
   - Verify all values calculate correctly

3. **Database Normalization (Future)**
   - Add donation_type column to donations table
   - Move type-specific fields to separate tables
   - Remove JSON storage from notes field

## Important Notes for Next Session

- **Column Names**: donation_items has value_poor, value_fair, value_good, value_excellent (NOT value_low/value_high or value_very_good)
- **Quality Mapping**: Very Good is calculated, not stored in database
- **IRS Compliance**: Only Good, Very Good, and Excellent are valid quality options
- **Database Binding**: Must be in env.production section of wrangler.toml
- **Node Version**: Use Node 20+ for wrangler commands
- **Auto-deploy**: All changes pushed to GitHub main branch deploy automatically

## Contact & Resources
- Production URL: https://charity-tracker-qwik.pages.dev
- GitHub: https://github.com/robpress123-png/charity-tracker-qwik
- Cloudflare Dashboard: Use for D1 database console access
- Test Login: test@example.com / password123

---
*This context should be provided at the start of the next session to maintain continuity.*
*Database schema has been verified and aligned with frontend on 2025-01-20.*