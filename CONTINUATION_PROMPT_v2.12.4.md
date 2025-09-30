# Charity Tracker Qwik - Complete Continuation Prompt v2.12.4

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

#### Examples of Problems Caused by Not Researching:
- Created `/api/users/tax-settings` endpoint when settings were at `/api/users/settings`
- Assumed tax data was in wrong table structure
- Created duplicate reports-module files instead of fixing existing
- Called wrong function names causing infinite recursion

#### Correct Workflow:
```bash
# ALWAYS do this first:
1. grep -r "endpoint_name" functions/api/  # Find API endpoints
2. grep -r "table_name" *.sql             # Find database schema
3. ls -la functions/api/users/            # Check what exists
4. curl -s http://localhost:8788/api/...  # Test endpoints
```

## Version 2.12.4 - Complete Fixes Deployed

### Latest Fixes (v2.12.4)
- ✅ **Created proper tax-settings endpoint**: Now queries `user_tax_settings` table by year
- ✅ **Fixed API authentication**: Added Bearer prefix to all API calls
- ✅ **Tax Summary Modal**: Integrated display instead of popup window
- ✅ **Database queries**: Properly uses `user_tax_settings` table with fallbacks

### Previous Critical Fixes (v2.12.2-3)
- Fixed logout infinite recursion
- Fixed reports module references (CharityReports → CharityReportsV2)
- Fixed reports returning empty data

## Current System Status

### Working Features
✅ **Complete Reporting System** (All 5 types working with data)
✅ **Logout Functionality** (No infinite recursion)
✅ **Tax Settings API** (Proper database queries)
✅ **All Donation Types**: Cash, Mileage, Stock, Crypto, Items
✅ **Authentication**: SessionStorage with fallbacks
✅ **Auto-Deployment**: GitHub → Cloudflare Pages

### Known Issues

#### 🔴 HIGH PRIORITY
1. **Payment Integration**: Stripe not yet implemented
2. **Orphan Code**: ~150KB of unused files need cleanup

#### 🟡 MEDIUM PRIORITY
- Charity search missing major charities
- Mobile responsiveness not implemented
- Receipt upload requires save-first workflow

## Database Schema (CRITICAL REFERENCE)

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

## File Structure (ACTUAL)
```
charity-tracker-qwik/
├── functions/api/
│   ├── users/
│   │   ├── settings.js         # General user settings
│   │   └── tax-settings.js     # Tax settings by year (NEW)
│   └── donations/
├── dist/
│   ├── js/
│   │   ├── reports-module.js   # ORPHAN - to be deleted
│   │   ├── reports-module-v2.js # ACTIVE version
│   │   └── storage-helper.js   # Session storage utilities
│   └── dashboard.html           # Uses reports-module-v2.js
└── data/sql/schema/            # DATABASE SCHEMAS - CHECK FIRST
```

## Orphan Files to Clean Up
1. `dist/js/reports-module.js` (28KB)
2. `dist/dashboard-backup-20250121.html`
3. `dist/dashboard_v2.11.29_backup.html`
4. `dist/dashboard_v2.11.40_backup.html`
5. `dist/register_backup_v2.11.33.html`

## Development Guidelines

### Cardinal Rules
1. **RESEARCH FIRST**: Never write code without understanding existing system
2. **Check Database Schema**: Always verify table/column names
3. **Test API Endpoints**: Use curl to verify before coding
4. **Look for Existing Code**: Don't create duplicates
5. **Use Correct References**: CharityReportsV2, not CharityReports
6. **Add Bearer Prefix**: All API calls need `Bearer ${token}`

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
npm run bump:patch  # 2.12.4 → 2.12.5
```

## Infrastructure

### Environment
- **Live URL**: https://charity-tracker-qwik.pages.dev
- **GitHub**: https://github.com/robpress123-png/charity-tracker-qwik
- **Database**: Cloudflare D1 (ID: 4b7b5031-1844-4ed9-aac0-fcb0e4bf0b3d)
- **Current Version**: 2.12.4

### Tech Stack
- Frontend: Vanilla JavaScript (NOT Qwik framework)
- Hosting: Cloudflare Pages with Functions
- Database: Cloudflare D1 (SQLite)

## Testing Checklist
- [x] Logout works without infinite recursion
- [x] All report buttons work without errors
- [x] Tax Summary displays in modal with data
- [x] CSV exports contain actual donation data
- [x] API endpoints return JSON not HTML

## Next Priorities

### IMMEDIATE
1. **Clean up orphan code** (~150KB)
2. **Payment Integration**: Implement Stripe

### Research Requirements for New Features
Before implementing ANY new feature:
1. Document all related database tables
2. List all existing API endpoints
3. Identify any existing similar functionality
4. Create a plan BEFORE coding

## About This Continuation Prompt

### Purpose
Comprehensive project state to prevent repeating mistakes and maintain code quality.

### Critical Lessons Learned
- **Always research before coding**
- **Database schema is the source of truth**
- **API endpoints must be verified before use**
- **Existing code patterns must be followed**

### Version History
- v2.12.0: Phase 1 Reporting System
- v2.12.1: Reports module with item details
- v2.12.2: Critical fixes (logout, reports)
- v2.12.3: API endpoint fixes
- v2.12.4: Tax settings properly implemented

Ready for cleanup and payment integration!