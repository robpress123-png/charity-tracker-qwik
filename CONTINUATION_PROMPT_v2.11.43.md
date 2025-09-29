# Charity Tracker Qwik - Complete Continuation Prompt v2.11.43

## 🎉 Version 2.11.43 - Further Display Optimizations

### Latest Updates (v2.11.43)
- ✅ **v2.11.43**: Additional space-saving optimizations
  - Fixed: Profile page - Tax Year, Filing Status, and Tax Bracket now on ONE row (4-digit year input)
  - Fixed: Tools page - Removed "Powerful Tools" intro block, reduced icon sizes (40px), smaller headers
  - Improved: Modal widths - Only Items modal uses 1600px width, all others (Cash, Mileage, Stock, Crypto) use standard 800px
  - Applied: Universal space-saving pattern - Total Donation and Tax Savings always side-by-side
  - Consolidated: Crypto modal from 4 field rows to 3 rows (Name/Symbol/Time, Quantity/Price/Cost, Exchange/Period)
  - 🔍 **NEEDS INVESTIGATION**: Tax bracket dropdown may not update income ranges when filing status changes

### Previous Updates (v2.11.39 - v2.11.42)
- ✅ **v2.11.42**: Major display optimizations for 1920x1080 monitors
  - Fixed: Quick Insights scrolling by reducing font sizes (0.75rem-0.813rem)
  - Fixed: My Charities height increased to 650px min/75vh max on Add Donation page
  - Fixed: Profile and Tools pages better height calc (100vh - 120px)
  - Added: Dynamic modal width based on type (Cash/Mileage: 800px, Complex forms: 1600px)
  - Improved: Stat cards more compact (padding 1.25rem, values 1.875rem)
- ✅ **v2.11.41**: Initial fixes for standard monitor optimization
  - Increased modal heights to 95vh on standard monitors
  - Added wide-modal class for complex forms
  - Fixed My Charities height from 400px to 600px/70vh
  - Adjusted Profile/Tools to calc(100vh - 140px)
- ✅ **v2.11.40**: Responsive layout improvements
  - Dashboard sections use percentage heights instead of calc()
  - Reduced spacing throughout (gaps, margins, padding)
  - Consolidated header to save 40px vertical space
  - Tax savings display made more compact
- ✅ **v2.11.39**: Header consolidation
  - Removed redundant version banner
  - Version number integrated into main header with gold styling

### Previous Updates (v2.11.30 - v2.11.38)
- ✅ **v2.11.38**: Admin console improvements
  - Added: Plan column showing Free/Premium status in user table
  - Visual badges: Free (gray), Premium (gold star)
  - Filter for plan type already existed
- ✅ **v2.11.37**: Major fixes to registration and admin
  - Fixed: Registration Step 2 tax fields now ask for income range (not tax bracket)
  - Dynamic income ranges based on year/filing status from tax tables
  - 2026 shows AGI field for OBBBA calculations
  - Added: Working delete user function in admin console
  - Deletes all associated data (donations, items, charities, tax settings)
- ✅ **v2.11.36**: Registration flow improvements
  - Fixed: Form now properly proceeds from Step 1 to Step 2
  - Fixed: Pressing Enter on Step 1 goes to Step 2 (not submit)
- ✅ **v2.11.35**: Fixed registration flow and Quick Insights
  - Fixed: Step 2 profile screen now properly shows after Step 1
  - Fixed: Quick Insights shows helpful message for new users instead of "Loading..."
  - Added: Better empty state messaging throughout dashboard
- ✅ **v2.11.34**: Implemented two-step registration flow
  - Step 1: Basic account info (email, password, name)
  - Step 2: Optional profile completion (address, tax settings)
  - "Skip & Go to Dashboard" option for quick start
  - Automatic login after registration (no separate login required)
  - Profile data properly saved to users and user_tax_settings tables
- ✅ **v2.11.33**: Started registration improvements (incomplete)
- ✅ **v2.11.30**: Implemented hybrid progressive charity search
  - Updated `handleCharitySearch` to use new `/api/charities/search` endpoint
  - Reduced initial load from 2000 to 500 charities for faster page load
  - Added "⏳ Searching all 10,000+ charities..." loading indicator
  - Improved result ranking and deduplication
  - Backup created as `dashboard_v2.11.29_backup.html` for rollback
- ✅ **v2.11.31**: Fixed stock/crypto donation report display
  - Stock: Changed `shares_donated` → `stock_quantity`
  - Crypto: Added missing `crypto_price_per_unit` assignment
- ✅ **v2.11.32**: Applied scrolling fix to modal forms
  - Added `max-height: 90vh` to modals for ultrawide monitors
  - Forms now scroll when content exceeds viewport height

### Current Status (v2.11.42)
- ✅ **Display Issues RESOLVED** (from v2.11.29):
  - Dashboard scrolling works perfectly on standard and ultrawide monitors
  - My Charities has working scroll bar (fixed with explicit height)
  - Headers align perfectly with dashboard content (1600px + 1rem padding)
  - Action dots no longer overlap headers when scrolling

- ✅ **Charity Search IMPROVED**:
  - Instant local search from 500 most common charities
  - Progressive search of full database via `/api/charities/search`
  - Ranked results (exact match > starts with > contains)
  - Loading indicator shows during full database search
  - Results limited to 50 for performance

## 🔍 Hybrid Charity Search Logic (NEW in v2.11.30)

### How It Works:
1. **Initial Load**: 500 most common charities preloaded for instant search
2. **Stage 1 - Instant Results** (< 300ms):
   - Searches preloaded charities locally
   - Shows up to 10 instant results
   - Displays "⏳ Searching all 10,000+ charities..." indicator
3. **Stage 2 - Full Database Search** (after 300ms):
   - Calls `/api/charities/search?q=${query}&limit=50`
   - Searches entire database with smart ranking:
     - Rank 1: Exact name match
     - Rank 2: Name starts with query
     - Rank 3: Name contains query
     - Rank 4: Exact EIN match
     - Rank 5: Other matches
   - Merges and deduplicates with local results
   - Shows up to 50 total results

### Examples of Charities Requiring Database Search:
These charities are NOT in the first 500 preloaded (will only appear after database search):
1. **MARRAKECH HOUSING OPTIONS INC** (EIN: 061319874)
2. **MICCOSUKEE CORPORATION** (EIN: 591374440)
3. **BREAKING GROUND HOUSING DEVELOPMENT FUND CORPORATION** (EIN: 113048002)
4. **NATIONS FINEST** (EIN: 942699571)
5. **JEWISH FOUNDATION FOR GROUP HOMES** (EIN: 521263608)

### ✅ RESOLVED - Charity Search Issues (Fixed in v2.11.30)

#### Problems That Were Fixed:
1. ✅ **Search Limitations** - RESOLVED:
   - Reduced initial load from 2000 to 500 (faster page load)
   - Created new `/api/charities/search` endpoint (no hardcoded limits)
   - Implemented hybrid search with full database access
   - Dashboard now searches all 10,000+ charities

2. ✅ **Subset Issues** - RESOLVED:
   - Audited and fixed charity loading functions
   - Hybrid search ensures full database coverage
   - Progressive loading with clear UI indicators

#### Remaining Issue:
1. ⚠️ **Missing Major Charities**: Some major charities (Salvation Army, Purple Heart) not in database
   - Current CSV has 10,000 charities but missing some major ones
   - **TODO**: Need updated/complete charity database from IRS
   - **Future Goal**: Scale to full IRS database (1M+ charities)

### Previous Updates (v2.11.20 - v2.11.26)
- **v2.11.19**: Last stable before display issues
- **v2.11.20-24**: Multiple attempts to fix scrolling
- **v2.11.25**: FIXED My Charities scroll (explicit height, removed flex-wrap)
- **v2.11.26**: Applied scroll fixes to all screens

### Current Dashboard Layout (PERFECT)
- **Container alignment**: Both header and dashboard use 1600px + 1rem padding
- **Donation History**: `height: calc(45vh - 60px)` with scroll ✓
- **My Charities/Quick Insights**: `height: calc(45vh - 60px)` with scroll ✓
- **All sections**: Proper overflow handling ✓

## Complete Feature Set

### Working Features
✅ **All Donation Types**: Cash, Mileage, Stock, Crypto, Items
✅ **Professional Landing Page**: Hero, pricing, clean navigation
✅ **Tax Tables System**: 6 tables, 2024-2026 rates, OBBBA ready
✅ **Item Donations**: 496 items, 12 categories, IRS valuations
✅ **Admin Console**: Role-based auth, collapsible menus
✅ **CSV Import**: 175+ donations tested, 90% match rate
✅ **Auto-Deployment**: GitHub → Cloudflare Pages

### Known Issues

#### 🔴 HIGH PRIORITY - Charity Search
- Only searching subset of charities (2000 of 10,000)
- Missing major charities from database
- API hardcodes search limit to 100
- **Impact**: Users can't find common charities
- **Solution in progress**: Hybrid search implementation

#### Mobile Responsiveness
- Not optimized for mobile/tablets
- Layout issues on small screens

#### Receipt Upload Flow
- Can't upload during donation creation
- Must save first, then add receipt

#### Item Donations - "Other" Category
- Missing from dropdown for custom items
- Backend logic exists, UI missing

## Infrastructure

### Environment
- **Live URL**: https://charity-tracker-qwik.pages.dev
- **GitHub**: https://github.com/robpress123-png/charity-tracker-qwik
- **Database**: Cloudflare D1 (4b7b5031-1844-4ed9-aac0-fcb0e4bf0b3d)
- **Deployment**: Auto via GitHub webhook

### Tech Stack
- Frontend: Vanilla JavaScript (NOT Qwik)
- Hosting: Cloudflare Pages with Functions
- Database: Cloudflare D1 (SQLite)
- Auth: SHA-256 hashed, localStorage tokens

## Database Schema

### Core Tables
- users (with plan and role fields)
- donations (all types with type-specific fields)
- charities (~10,000 IRS verified) ⚠️ Missing major charities
- user_charities (personal/custom)
- donation_items (relational)
- items (496 IRS valuations)

### Tax Tables (6)
- tax_brackets, capital_gains_rates, standard_deductions
- irs_mileage_rates, contribution_limits, user_tax_settings

## Business Model
- **Free**: 3 donations limit
- **Premium**: $49/year unlimited
- **Status**: Payment integration pending (Stripe)

## Auto-Deployment
```bash
npm run bump:patch  # 2.11.29 → 2.11.30
npm run bump:minor  # 2.11.29 → 2.12.0
npm run bump:major  # 2.11.29 → 3.0.0
```

## Next Priorities

### IMMEDIATE - Fix Charity Search
1. Implement hybrid progressive search
2. Fix API limit parameter respect
3. Add search indicators
4. Audit all charity loading code
5. Plan for 1M+ charity database

### Payment Integration
- Stripe gateway
- Subscription management
- Grandfathering logic

### Mobile Version
- Responsive design
- Touch-friendly interface

### Tax Package Export
- TurboTax/H&R Block APIs
- Form 8283, Schedule A

## Development Notes

### Cardinal Rules
1. **Version bump after changes** - npm run bump:patch
2. **Update continuation prompt** - Keep current
3. **Test before deploy** - Don't break working features
4. **Rollback plan** - Be ready to revert
5. **Database via Console** - No CLI access

### Common Commands
```bash
# Development
source ~/.nvm/nvm.sh && nvm use 20
npx wrangler pages dev --local --port 8788

# Database - Cloudflare Dashboard Console ONLY
```

## File Structure
```
charity-tracker-qwik/
├── dist/
│   ├── dashboard.html         # v2.11.29 - Main app
│   └── [other pages]
├── functions/api/
│   ├── charities.js          # ⚠️ Has search limitations
│   └── charities/
│       └── [endpoints]
├── data/core/charities/
│   └── charities_10k_full.csv # ⚠️ Missing major charities
└── scripts/
    └── auto-version-bump.js
```

## Critical Gotchas
1. **Charity search LIMITED** - Only searches 2000, returns max 100
2. **Missing charities** - Salvation Army, Purple Heart not in DB
3. **Use Web Crypto API** - NOT Node.js crypto
4. **Dashboard scrolling** - Must use explicit height
5. **Header alignment** - 1600px + 1rem padding
6. **Test on both** - Standard and ultrawide monitors

## Success Metrics
✅ Dashboard fits standard screens
✅ Scroll bars work properly
✅ Headers align with content
✅ Minimal ultrawide scrolling
⚠️ Charity search finds all charities (IN PROGRESS)

## Rollback Points
- **v2.11.29**: Current stable with display fixes
- **v2.11.19**: Last stable before display issues
- **v2.11.25**: My Charities scroll fixed

## Complete Feature History

### v2.11.0 - v2.11.19
- ✅ **Dashboard Improvements**: Various UI enhancements
- ✅ **Simplified Landing Page**: Removed integrated login forms, clean navigation buttons
- ✅ **Dashboard Stats Enhanced**: Bigger stat cards with visual hierarchy
- ✅ **My Charities Compact View**: Efficient table layout
- ✅ **Landing Page Version**: Version in header (top-left)
- ✅ **Updated Messaging**: Generic "fair market value" language, removed IRS claims

### v2.10.0 - v2.10.9
- ✅ **Secure Admin Access**: Database-driven admin authentication with role field
- ✅ **Admin UI Improvements**: Horizontal dots (⋯) menu instead of vertical
- ✅ **Freemium Pricing Model**: $49/year vs free tier (3 donations)
- ✅ **Other/Custom Items**: Full support in Edit Item form

### v2.9.x Series
- ✅ **Edit Item Form Completed**:
  - Green tax savings box
  - Custom item support with value source field
  - Read-only descriptions
  - Inline dropdowns matching Add form UX
  - Live receipt preview on right side

### v2.8.x Series - Tax System Overhaul
- ✅ **Tax System Completely Fixed**:
  - All calculations use year-specific rates from database
  - Fixed hardcoded 22% default (now 0% until loaded)
  - Filing status displays correctly from database
  - 3-column display shows all years (2024-2026)
  - Cache management for performance

### v2.7.0 - Tax Settings
- ✅ Tax settings UI in profile with year/filing status/bracket selection
- ✅ Privacy-focused: Users select bracket range, not exact income
- ✅ AGI estimate field for 2026 OBBBA calculations

### v2.6.0 - Admin Console
- ✅ Fixed tax import drag-and-drop functionality
- ✅ Reorganized admin console menu with collapsible sections
- ✅ Moved Tax Configuration to Content Management section
- ✅ Added missing tax import event handlers

### Admin Console Menu Structure
**Collapsible Organization:**
- **Dashboard** (Always visible)
- **Content Management**: Charities, Items Database, Tax Configuration
- **Users & Donations**: User Management, All Donations, Backup/Restore
- **System**: Database, Backup, Logs, Settings

## Current Working Features

✅ **Two-Step Registration (NEW v2.11.34)**
- Step 1: Required account creation (email, password, name)
- Step 2: Optional profile setup (address, tax info)
- Skip option for immediate dashboard access
- Automatic login after registration
- Profile completion tracking

✅ **All Donation Types**
- Cash, Mileage, Stock, Crypto, Items
- Personal and system charities
- Full CRUD operations
- CSV bulk import with 90% charity match rate

✅ **Professional Landing Page**
- Hero section with value proposition
- 6 key features highlighted
- Pricing tiers (Free: 3 donations, Premium: $49/year)
- Clean navigation buttons
- Smooth animations
- Admin login link maintained

✅ **Tax Tables System**
- 6 database tables populated
- Import tool in admin panel (drag-and-drop works)
- Official 2024-2025 IRS rates
- 2026 OBBBA rules ready (0.5% AGI floor, 35% cap)
- Privacy-focused (users select bracket, not income)
- Year-aware calculations throughout

✅ **Item Donations**
- 496 items with IRS valuations
- 12 categories
- Other/Custom items supported
- Value source tracking for IRS compliance
- Quality standards:
  - **Fair**: $0 (not IRS deductible)
  - **Good**: Uses `low_value` (minimum IRS acceptable)
  - **Very Good**: Average of low and high values
  - **Excellent**: Uses `high_value`

✅ **Admin Console**
- Secure role-based authentication (v2.10.0+)
- User management
- Charity verification
- Item database management
- Tax table imports
- Horizontal dots (⋯) for action menus
- Proper number formatting (no decimals)
- Collapsible menu sections

✅ **CSV Import**
- Bulk donation import tested with 175+ donations
- Smart charity matching (90% success rate)
- Real item database integration
- Item values calculated from 496-item database
- Multiple items per donation support

## Infrastructure

### Live Environment
- **Live URL**: https://charity-tracker-qwik.pages.dev
- **GitHub**: https://github.com/robpress123-png/charity-tracker-qwik
- **Auto-deployment**: GitHub webhook → Cloudflare Pages
- **Database**: Cloudflare D1 (charity-tracker-qwik-db)
- **Database ID**: 4b7b5031-1844-4ed9-aac0-fcb0e4bf0b3d

### Tech Stack
- **Frontend**: Vanilla JavaScript (NOT Qwik framework despite folder name)
- **Hosting**: Cloudflare Pages with Functions
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Automatic via GitHub push

### Authentication
- **Multi-user**: Full registration and login
- **Security**: SHA-256 hashed passwords
- **Token format**: `token-{userId}-{timestamp}`
- **Storage**: localStorage
- **Test account**: test@example.com / password123 (live account with test data)
- **Admin access**:
  - Database-driven with role field (v2.10.0+)
  - API endpoint: /api/admin/auth
  - Requires role = 'admin' in users table
  - SQL provided in /sql/add_user_role.sql

## Complete Database Schema

### Core Tables
- **users**: Multi-user support with plans (free/pro) and role field
  - Profile fields: address, city, state, zip_code
  - Tax fields: tax_bracket, filing_status, income_range
  - System: role (user/admin), plan (free/pro)
- **donations**: Tracks all donation types with type-specific fields
- **charities**: ~10,000 IRS verified charities ⚠️ Missing major charities
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

### Donation Types Storage
All types store type-specific data in dedicated columns:
- **Cash**: Basic amount and notes
- **Miles**: miles_driven, mileage_rate, mileage_purpose
- **Stock**: stock_symbol, stock_quantity, cost_basis, fair_market_value
- **Crypto**: crypto_symbol, crypto_quantity, cost_basis, fair_market_value, crypto_price_per_unit
- **Items**: Uses donation_items table for detailed breakdown

### Item Categories (12 total, 496 items)
- Appliances (48), Books & Media (39), Clothing - Children (30)
- Clothing - Men (43), Clothing - Women (40), Electronics (55)
- Furniture (47), Household Items (46), Jewelry (22)
- Sports & Recreation (55), Tools (38), Toys & Games (33)

## Business Model

### Free Tier
- 3 donations limit
- All donation types
- Tax calculations
- Receipt storage

### Premium ($49/year)
- Unlimited donations
- CSV import
- Advanced reporting
- Priority support
- Tax package export (future)

### Implementation Status
- Frontend displays pricing correctly
- Database has plan field
- Payment integration pending (Stripe planned)
- Grandfathering logic for existing users planned

## Auto-Deployment

### Commands
```bash
npm run bump:patch  # 2.11.38 → 2.11.39
npm run bump:minor  # 2.11.38 → 2.12.0
npm run bump:major  # 2.11.38 → 3.0.0
```

### Process
1. Script updates package.json and all HTML files
2. Auto-commits with version message
3. Pushes to GitHub
4. Cloudflare auto-deploys (~1-2 minutes)

## Tax System Documentation

### Quick Setup for Tax Import
1. **SQL Already Run** ✅ (6 tables created)
2. **Import Tax Data**:
   - Go to `/admin-dashboard.html`
   - Find "Tax Configuration" under Content Management
   - Upload `/data/core/tax/all_tax_data_2024_2026.csv`
   - Drag-and-drop works (fixed in v2.6.0)
   - Click "Import Tax Data"

### 2026 OBBBA Special Rules
- **0.5% AGI Floor**: First 0.5% of AGI in donations not deductible
- **35% Rate Cap**: Max benefit capped at 35% even for 37% bracket
- **Non-itemizer Addon**: $1,000/$2,000 cash donation deduction

## Known Issues

### Charity Search (Partially Fixed)
- ✅ Now searches all 10,000+ charities via hybrid approach
- ⚠️ Some major charities (Salvation Army, Purple Heart) missing from database
- **Future Goal**: Scale to full IRS database (1M+ charities)

### Mobile Responsiveness
- **Problem**: Not optimized for mobile devices
- **Impact**: Layout issues on phones/tablets
- **Priority**: High

### Receipt Upload Flow
- **Current limitation**: Can't upload during donation creation
- **Reality**: Users often have receipts at creation time
- **Current workaround**: Save first, then add receipt
- **Needed**: Inline receipt upload option

### Item Donations - "Other" Category
- **Problem**: "Other" category not appearing in dropdown for custom items
- **Impact**: Users cannot add custom items not in database
- **Note**: Backend logic exists, just missing from dropdown
- **Priority**: Medium

## Next Priorities

### 1. Payment Integration (CRITICAL FOR MONETIZATION)
- Stripe payment gateway
- Subscription management
- Payment status tracking
- Grace period handling
- Grandfather existing users

### 2. Mobile Version
- Responsive dashboard
- Touch-friendly forms
- Mobile navigation
- Responsive tables

### 3. Tax Package Export
- TurboTax API integration
- H&R Block export
- FreeTaxUSA compatibility
- Generic forms (8283, Schedule A)

### 4. Full Charity Database
- Obtain complete IRS charity database
- Scale to 1M+ charities
- Improve search performance

## Development Notes

### Cardinal Rules
1. **Test before deploying** - Don't break working features
2. **Version bump** - Use npm run bump:patch/minor/major
3. **Update this doc** - Keep documentation current
4. **Use Cloudflare Console** - For database changes (NO CLI)
5. **Test scrolling** - On both standard and ultrawide screens

### Common Commands
```bash
# Development
source ~/.nvm/nvm.sh && nvm use 20
npx wrangler pages dev --local --port 8788

# Database - Use Cloudflare Dashboard Console ONLY
# Workers & Pages → D1 → charity-tracker-qwik-db
```

### Test Data Location
- **Location**: `/data/imports/test_data/`
- **Format**: Compliant v2.2.23+ CSV format
- **Available files**:
  - user2_test_real_data.csv
  - user3_test_real_data.csv
  - user4_test_real_data.csv
  - user5_test_v2.3.11.csv

## File Structure
```
charity-tracker-qwik/
├── dist/
│   ├── index.html             # Landing page
│   ├── register.html          # Two-step registration (v2.11.34)
│   ├── dashboard.html          # Main app
│   ├── admin-dashboard.html    # Admin console with role-based auth
│   ├── admin-login.html       # Admin login page
│   └── [auth pages]
├── functions/api/              # Cloudflare Functions
│   ├── admin/
│   │   ├── auth.js           # Uses Web Crypto API (NOT Node.js crypto)
│   │   └── tax-import-unified.js  # Tax data import
│   ├── auth/
│   │   └── register.js       # Updated for two-step registration (v2.11.34)
│   ├── donations/
│   │   └── import.js         # CSV import with value calculation
│   └── [other endpoints]
├── data/                      # ORGANIZED DATA STRUCTURE
│   ├── core/                 # Core reference data
│   │   ├── charities/
│   │   │   └── charities_10k_full.csv    # 10,000 IRS charities ⚠️ Missing major ones
│   │   ├── items/
│   │   │   └── items_database_497.csv    # 496 items with valuations
│   │   └── tax/
│   │       └── all_tax_data_2024_2026.csv # Tax tables 2024-2026
│   ├── exports/              # User-generated exports
│   ├── imports/              # Import-ready files
│   │   └── test_data/        # Test CSV files
│   └── archive/              # Old/unused files
├── sql/
│   └── add_user_role.sql     # Admin role migration
├── scripts/
│   └── auto-version-bump.js  # Deployment automation
└── [documentation]
```

## Critical Gotchas
1. **Use vanilla JavaScript** - NOT Qwik framework
2. **Admin needs role='admin'** in database
3. **Use Web Crypto API** for auth, NOT Node.js crypto
   - Correct: `await crypto.subtle.digest('SHA-256', data)`
   - Wrong: `import { createHash } from 'crypto'`
4. **Dashboard scrolling** - Must use explicit height, not max-height
5. **Header alignment** - Keep all elements at 1600px max-width
6. **Database access** - Cloudflare Console only, no CLI
7. **Custom items** need value_source field for IRS compliance
8. **Item values**: Import looks up from database, not CSV
9. **Notes field**: User comments ONLY, no structured data
10. **Charity matching**: Uses fuzzy matching, creates user_charities for misses
11. **Items must match** database exactly (496 predefined items)
12. **Test on both** standard and ultrawide monitors
13. **Registration flow**: Two-step with optional profile (v2.11.34)

## Success Metrics
- ✅ Dashboard fits on standard screen without scrolling
- ✅ My Charities has working scroll bar
- ✅ Donation History has working scroll bar
- ✅ Headers align with content (1600px width)
- ✅ Minimal scrolling needed on ultrawide monitors
- ✅ All sections (Tools, Reports, etc.) handle overflow
- ✅ Tax calculations are year-aware
- ✅ Admin console uses role-based authentication
- ✅ Charity search finds all 10,000+ charities (hybrid approach)
- ✅ Registration has two-step flow with skip option

## About This Continuation Prompt

### What is this document?
This is a comprehensive state snapshot of the Charity Tracker project that allows AI assistants (like Claude) to quickly understand:
- Current version and recent changes
- System architecture and tech stack
- Database schema and structure
- Known issues and work in progress
- Development guidelines and best practices

### When to update:
- After significant feature additions or changes
- When version bumps occur (especially minor/major)
- When critical bugs are fixed
- When architecture changes
- **Auto-update trigger**: When context usage approaches 90% in a conversation

### Why it matters:
- Enables seamless continuation across sessions
- Preserves critical project knowledge
- Prevents regression of fixed issues
- Maintains development velocity
- Documents institutional knowledge

## 🎯 CRITICAL: Outstanding Issues for v2.11.43

### User Testing Results (v2.11.42)
#### ✅ What's Working:
- **Quick Insights**: No more internal scrolling - PERFECT
- **My Charities on Add Donation**: Height is PERFECT at 650px/75vh
- **Cash Modal Width**: PERFECT at 800px
- **Dynamic Modal Widths**: Working (but needs refinement - see below)

#### ❌ Still Needs Fixes:

### 1. **PROFILE PAGE** - Still Scrolling
- **Problem**: Too much vertical space wasted
- **Solution**: Combine Tax Year (4-digit field), Filing Status, and Tax Bracket on ONE row
- **🔴 CRITICAL**: Need to verify tax brackets dynamically adjust based on filing status selection
  - User concern: "Not sure if we are adjusting the tax bracket based on what the user says is their filing status in any given year"
  - This is a CORE calculation that must work correctly

### 2. **TOOLS PAGE** - Significant Scrolling
- **Remove**: "Powerful Tools to Manage Your Charitable Giving" intro block (waste of space)
- **Reduce/Remove**: Icons/emojis from headers - unprofessional for financial tool
- **Make headers smaller**: Current headers with icons are too large

### 3. **MODAL WIDTH ADJUSTMENTS**
- **Stock Modal**: Currently 1600px but "unnecessarily wide" - reduce to standard width
- **Mileage Modal**: Should be standard width (800px) like Cash
- **Crypto Modal**: Can likely be standard width with field consolidation
- **Items Modal**: May be only one needing extra width due to receipt display

### 4. **UNIVERSAL SPACE-SAVING PATTERN** 🔑
**Apply to ALL donation forms:**
- Put **Donation Total** and **Tax Savings** side-by-side (currently stacked)
- Put **Notes** field next to Tax Savings box (2/3 Notes, 1/3 Tax)
- Move tax disclaimer inline: "💰 Tax Savings (if itemizing)"
- Remove separate disclaimer line "*Based on marginal tax rate..."

### 5. **CRYPTO MODAL** - Major Consolidation Needed
- Combine Date and Time fields on same row
- Put Crypto Name, Symbol, and Time on one row
- Put Quantity, Price, Cost Basis on one row
- Apply universal pattern (Total + Tax side-by-side)

### 6. **EDIT MODALS** - Various Issues
- **Edit Cash**: Width is good but needs Notes/Tax side-by-side
- **Edit Mileage**: Too wide (uses main modal width) - needs standard width
- **Edit Item**: Slight scrolling for buttons - needs height adjustment
- **Edit Stock**: Unnecessary scroll bar - needs minor height tweak
- **Edit Crypto**: Lots of scrolling - needs same consolidation as Add Crypto

### 7. **OTHER IMPROVEMENTS NOTED**
- **View Summary in Reports**: Convert to modal popup instead of inline display
- **Dashboard My Charities**: Consider tighter spacing and smaller font to show more charities
- **Dashboard Donation History**: Same - tighter spacing to show more donations

## 📢 Implementation Strategy
The universal patterns (side-by-side layouts, inline disclaimers) will solve most scrolling issues across all modals. Focus on:
1. Consistent side-by-side layouts for Total/Tax/Notes
2. Standard modal widths (800px) except Items
3. Field consolidation on complex forms
4. Remove decorative elements from professional interfaces

## 🔄 Current State Summary
- Version: 2.11.42
- Goal: App-like experience on 1920x1080 monitors at 100% zoom
- Progress: ~60% complete - main layouts working, modals need refinement
- Context usage when stopped: 11%

Ready for continued development at v2.11.43!