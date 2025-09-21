# Charity Tracker Qwik - Comprehensive Continuation Context
## Last Updated: 2025-01-20 (Version 1.4.6)

## Project Overview
**Charity Tracker Qwik** - A multi-user web application for tracking charitable donations with tax optimization features, built on Cloudflare Pages with D1 database.

### Current Status
- **Version:** 1.4.6
- **Live URL:** https://charity-tracker-qwik.pages.dev
- **GitHub:** https://github.com/robpress123-png/charity-tracker-qwik
- **Auto-deployment:** Enabled via GitHub integration
- **Database:** Cloudflare D1 (charity-tracker-qwik-db)
- **Database ID:** 4b7b5031-1844-4ed9-aac0-fcb0e4bf0b3d

## Critical Technical Details

### 1. Architecture
- **Frontend:** Single HTML files (dashboard.html, login.html, register.html)
- **Backend:** Cloudflare Pages Functions (serverless)
- **Database:** Cloudflare D1 (SQLite)
- **Authentication:** Token-based (format: `token-{userId}-{timestamp}`)
- **Deployment:** Automatic via GitHub push to main branch

### 2. Database Schema
```sql
Tables:
- users (id, email, password [SHA-256 hashed], name, plan, created_at)
- donations (id, user_id, charity_id, amount, date, notes [JSON])
- charities (500+ records imported)
- donation_items (497 items with value_low, value_high)
- item_categories (12 categories)
- cryptocurrencies (10 major cryptos for donations)
- crypto_price_history (for IRS documentation)
```

### 3. Key Implementation Details

#### Authentication
- Passwords are SHA-256 hashed
- Test account: test@example.com / password123
- Multi-user support with data isolation by user_id
- Token format: `token-{userId}-{timestamp}`

#### Donation Types & Storage
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

#### API Endpoints
- `/api/auth/login` - User authentication
- `/api/auth/register` - User registration
- `/api/donations` - CRUD operations for donations
- `/api/charities` - Charity search/management
- `/api/items` - Donation items by category
- `/api/admin/stats` - Dashboard statistics

### 4. Recent Fixes & Improvements (v1.4.6)

#### Fixed Issues
1. **Authentication:** Fixed password hashing mismatch between register and login
2. **Donation Types:** Fixed all donations showing as "cash" - now correctly shows miles, stock, crypto, items
3. **Notes Field:** Fixed JSON appearing in notes - now only shows user-entered text
4. **Items API:** Fixed column names (value_low, value_high instead of value_good, etc.)
5. **UI Layout:** Redesigned item donation form to use horizontal layout

#### Working Features
- Multi-user authentication with isolated data
- Cash donations with amount tracking
- Mileage donations with automatic IRS deduction ($0.14/mile)
- Stock donations with symbol, shares, and price tracking
- Crypto donations with exact timestamp for IRS compliance
- Item donations with category selection and quality grading
- Charity autocomplete (500+ charities)
- Tax savings calculator
- CSV export for tax filing
- Admin dashboard with statistics

### 5. Known Issues & TODO

#### Current Issues
1. **Items Dropdown:** May not populate after category selection (500 error from API)
2. **Item Values:** Using simplified calculation (average of value_low/value_high × quality multiplier)
3. **Receipt Display:** Running receipt for items may not be visible

#### Pending Features
1. Database normalization - donation_type should be a column, not stored in JSON
2. Automatic price lookups for stocks and crypto
3. Receipt photo uploads
4. Bank transaction imports
5. Recurring donation scheduling

### 6. Important Configuration Files

#### wrangler.toml
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

### 7. Development Guidelines

#### When Making Changes
1. **Version Control:** Always update version in package.json and dashboard.html
2. **Git Commits:** Use descriptive commit messages with emoji prefix
3. **Database Changes:** Test with remote D1, not local mock data
4. **Authentication:** Always include Authorization header with token
5. **Notes Field:** ONLY store user-entered text, no automated data

#### Testing Checklist
- [ ] Login with test@example.com / password123
- [ ] Create new user and verify isolated data
- [ ] Test all donation types (cash, miles, stock, crypto, items)
- [ ] Verify notes field only shows user input
- [ ] Check donation type icons and descriptions
- [ ] Test charity autocomplete
- [ ] Verify tax calculations

### 8. User Requirements & Goals

#### Primary Goals
1. Support 5000+ users with isolated data
2. Track all IRS-deductible donation types
3. Maximize tax deduction benefits
4. Simplify tax filing with comprehensive reports
5. Maintain IRS compliance for all donation types

#### User Preferences
- Clean, simple interface
- No unnecessary alerts or popups
- Toast notifications instead of modals
- Horizontal layouts to minimize scrolling
- Only show user-entered data in notes field

### 9. Console Commands for Database Management

#### Check Database Tables
```sql
-- In Cloudflare D1 Console
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
```

#### Reset Test User (if needed)
```
Visit: https://charity-tracker-qwik.pages.dev/api/auth/reset-test-user
```

#### Debug Endpoints
- `/api/debug-donations` - Check raw donation data
- `/api/auth/debug-login` - Debug authentication issues

### 10. Session Context from Today (2025-01-20)

#### Major Accomplishments
1. Fixed multi-user authentication system
2. Resolved donation type display issues
3. Cleaned up notes field to only show user input
4. Added stock name/symbol fields
5. Implemented crypto donations with exact timestamp
6. Created cryptocurrencies reference table
7. Fixed registration page errors
8. Updated to version 1.4.6

#### Key Decisions
- Store all type-specific data in notes field as JSON (temporary solution)
- Use SHA-256 for password hashing
- Calculate item values as: (value_low + value_high) / 2 × quality_multiplier
- Quality multipliers: Good=0.8x, Very Good=1.0x, Excellent=1.2x

#### User Feedback Addressed
- Removed duplicate "Add Donation" button
- Fixed annoying alert popups
- Ensured notes field only shows user input
- Added stock/crypto specific fields
- Improved donation type display

### 11. Next Session Priorities

1. **Fix Items Donation Form**
   - Ensure dropdown populates after category selection
   - Make quality selector visible
   - Display running receipt properly

2. **Database Normalization**
   - Add donation_type column to donations table
   - Add type-specific tables for better querying

3. **UI Improvements**
   - Further optimize horizontal layouts
   - Add better visual feedback for actions
   - Improve mobile responsiveness

4. **Feature Additions**
   - Receipt photo upload capability
   - Bank transaction import
   - Recurring donation management
   - Advanced reporting features

### 12. Important Notes for Next Session

- **Authentication:** System is fully multi-user capable
- **Database Binding:** Must be in env.production section of wrangler.toml
- **Node Version:** Use Node 20+ for wrangler commands
- **Auto-deploy:** All changes pushed to GitHub main branch deploy automatically
- **Testing:** Always test with real database, not mock data
- **Version:** Remember to increment version numbers consistently

## Contact & Resources
- Production URL: https://charity-tracker-qwik.pages.dev
- GitHub: https://github.com/robpress123-png/charity-tracker-qwik
- Cloudflare Dashboard: Use for D1 database console access
- Test Login: test@example.com / password123

---
*This context should be provided at the start of the next session to maintain continuity.*