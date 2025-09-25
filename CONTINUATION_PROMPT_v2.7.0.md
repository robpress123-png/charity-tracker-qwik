# Charity Tracker Qwik - Continuation Prompt v2.7.0

## 🎉 Version 2.7.0 - Tax Settings in User Profile

### Latest Updates (v2.7.0)
- ✅ Removed user_tax_settings from tax import validation (it's user data, not reference data)
- ✅ Added tax settings UI to user profile section
- ✅ Users can now select tax year (2024-2026), filing status, and tax bracket
- ✅ Tax settings saved to database via user_tax_settings table
- ✅ Added AGI estimate field for 2026 OBBBA calculations
- ✅ Tax brackets loaded dynamically from database
- ✅ Privacy-focused: Users select bracket range, not exact income

### Previous Updates (v2.6.0)
- ✅ Fixed tax import drag-and-drop functionality
- ✅ Reorganized admin console menu with collapsible sections
- ✅ Moved Tax Configuration to Content Management section
- ✅ Moved Donations to Users section (now "Users & Donations")
- ✅ Added missing tax import event handlers and functions

### Admin Console Menu Structure
**New Collapsible Organization:**
- **Dashboard** (Always visible)
- **Content Management**: Charities, Items Database, Tax Configuration
- **Users & Donations**: User Management, All Donations, Backup/Restore
- **System**: Database, Backup, Logs, Settings

## Current Working Features

✅ **All Donation Types**
- Cash, Mileage, Stock, Crypto, Items
- Personal and system charities
- Full CRUD operations
- CSV bulk import with 90% charity match rate

✅ **Tax Tables System** (v2.4.0+)
- 6 database tables created and populated
- Import tool in admin panel (drag-and-drop fixed in v2.6.0)
- Official 2024-2025 IRS rates
- 2026 OBBBA rules (0.5% AGI floor, 35% cap)
- Privacy-focused design (users select bracket, not income)

✅ **CSV Import** (v2.2.24-25)
- Bulk donation import (175+ donations tested)
- Smart charity matching (90% match rate achieved)
- Real item database integration
- Item values calculated from 496-item database
- Multiple items per donation support

✅ **Admin Console** (v2.5.0-2.6.0)
- Collapsible menu sections for better organization
- Tax import with working drag-and-drop
- All management functions accessible
- User management, charity verification, item database

## Project Infrastructure

### Live Environment
- **Live URL**: https://charity-tracker-qwik.pages.dev
- **GitHub**: https://github.com/robpress123-png/charity-tracker-qwik
- **Auto-deployment**: Enabled via GitHub integration
- **Database**: Cloudflare D1 (charity-tracker-qwik-db)
- **Database ID**: 4b7b5031-1844-4ed9-aac0-fcb0e4bf0b3d

### Tech Stack
- **Frontend**: Vanilla JavaScript (NOT Qwik framework despite folder name)
- **Hosting**: Cloudflare Pages with Functions
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: GitHub webhook triggers auto-deployment

### Authentication
- Token-based auth (localStorage)
- Passwords are SHA-256 hashed
- Test account: test@example.com / password123
- Token format: `token-{userId}-{timestamp}`
- Admin access through admin-dashboard.html

## Complete Database Schema

### Core Tables
- **users**: Multi-user support with plans (free/pro)
- **donations**: Tracks all donation types with type-specific fields
- **charities**: ~10,000 IRS verified charities
- **user_charities**: Personal/custom charities
- **donation_items**: Individual items within donations
- **items**: 496 items with IRS-approved valuations

### Tax Tables (6)
- **tax_brackets**: All filing statuses and brackets 2024-2026
- **capital_gains_rates**: 0%, 15%, 20% thresholds
- **standard_deductions**: By year and filing status
- **irs_mileage_rates**: Business, charity, medical, moving
- **contribution_limits**: AGI percentages, special rules
- **user_tax_settings**: User's tax profile per year

### Item Categories (12 total, 496 items)
- Appliances (48), Books & Media (39), Clothing - Children (30)
- Clothing - Men (43), Clothing - Women (40), Electronics (55)
- Furniture (47), Household Items (46), Jewelry (22)
- Sports & Recreation (55), Tools (38), Toys & Games (33)

### Donation Types Storage
All types store type-specific data in dedicated columns:
- **Cash**: Basic amount and notes
- **Miles**: miles_driven, mileage_rate, mileage_purpose
- **Stock**: stock_symbol, stock_quantity, cost_basis, fair_market_value
- **Crypto**: crypto_symbol, crypto_quantity, cost_basis, fair_market_value
- **Items**: Uses donation_items table for detailed breakdown

### IRS Item Quality Standards
- **Fair**: $0 (not IRS deductible - below minimum)
- **Good**: Uses `low_value` (minimum IRS acceptable)
- **Very Good**: Average of low and high values
- **Excellent**: Uses `high_value`

## Auto-Deployment System

### Version Bump Commands
```bash
npm run bump:patch  # 2.6.0 → 2.6.1
npm run bump:minor  # 2.6.0 → 2.7.0
npm run bump:major  # 2.6.0 → 3.0.0
```

### Process
1. Script updates package.json and all HTML files
2. Auto-commits with version number
3. Pushes to GitHub
4. GitHub webhook triggers Cloudflare deployment
5. Live in ~1-2 minutes

## Tax Tables Documentation

### Quick Setup for Tax Import
1. **SQL Already Run** ✅ (6 tables created)
2. **Import Tax Data**:
   - Go to `/admin-dashboard.html`
   - Find "Tax Configuration" under Content Management
   - Upload `/tax_data/all_tax_data_2024_2026.csv`
   - Drag-and-drop now works! (fixed in v2.6.0)
   - Click "Import Tax Data"

### 2026 OBBBA Special Rules
- **0.5% AGI Floor**: First 0.5% of AGI in donations not deductible
- **35% Rate Cap**: Max benefit capped at 35% even for 37% bracket
- **Non-itemizer Addon**: $1,000/$2,000 cash donation deduction

## Next Priority Tasks

### 1. Complete Tax Integration
- ✅ API endpoints created (/api/tax/rates GET and POST)
- ✅ User tax settings UI in profile (bracket selection)
- ⏳ Update donation calculations to use real rates from database
- ⏳ Apply 2026 OBBBA special rules (0.5% AGI floor)
- ⏳ Test complete tax calculation flow with real data

### 2. Tax Settings Storage (COMPLETED)
- ✅ Migrated from localStorage to database
- ✅ Using user_tax_settings table for persistence
- ✅ Tax brackets loaded dynamically from database
- ✅ Users select bracket range for privacy (not exact income)

### 3. Monetization Implementation
- **Model**: Freemium
- **Free**: 3 donation limit for new users
- **Premium**: $49/year unlimited
- **Grandfathered**: All existing users get premium

## Development Notes

### Cardinal Rules
1. **Don't break working features** - Always test after changes
2. **Version bump on changes** - Use npm run bump:patch/minor/major
3. **Update continuation prompt** - Keep documentation current
4. **Auto-deployment** - Push to GitHub triggers Cloudflare Pages deployment
5. **Database changes** - Use Cloudflare Dashboard Console, not CLI

### Common Commands
```bash
# Development
source ~/.nvm/nvm.sh && nvm use 20
npx wrangler pages dev --local --port 8788

# Database access
# Use Cloudflare Dashboard Console - NO CLI ACCESS
# Navigate: Cloudflare Dashboard → Workers & Pages → D1 → charity-tracker-qwik-db
```

### Recent Fixes Timeline
- v2.2.24-25: CSV import calculates item values from database
- v2.3.37: Fixed item edit undefined values issue
- v2.3.38: Initial tax tables implementation
- v2.4.0: Tax tables feature release
- v2.5.0: Admin console reorganization with collapsible menus
- v2.6.0: Fixed tax import drag-and-drop, refined menu structure

## File Structure
```
charity-tracker-qwik/
├── dist/
│   ├── dashboard.html          # v2.6.1 - Main user dashboard
│   ├── admin-dashboard.html    # v2.6.1 - Fixed drag-drop, reorganized menu
│   └── admin.html             # v2.6.1 - Legacy admin page
├── functions/api/             # Cloudflare Pages Functions
│   ├── donations/
│   │   └── import.js         # CSV import with value calculation
│   ├── admin/
│   │   └── tax-import-unified.js  # Tax data import endpoint (v2.6.1 fixed)
│   └── [other endpoints]
├── data/                      # ORGANIZED DATA STRUCTURE (v2.6.1)
│   ├── core/                 # Core reference data
│   │   ├── charities/
│   │   │   └── charities_10k_full.csv    # 10,000 IRS charities
│   │   ├── items/
│   │   │   └── items_database_497.csv    # 496 items with valuations
│   │   └── tax/
│   │       └── all_tax_data_2024_2026.csv # Tax tables 2024-2026
│   ├── exports/              # User-generated exports
│   ├── imports/              # Import-ready files
│   │   └── test_data/        # Test CSV files
│   ├── archive/              # Old/unused files (55+ test CSVs)
│   └── README.md             # Data structure documentation
├── scripts/
│   └── auto-version-bump.js  # Deployment automation
└── [documentation files]
```

### Critical File Locations (v2.6.1)
- **Charity Database**: `data/core/charities/charities_10k_full.csv`
- **Items Database**: `data/core/items/items_database_497.csv`
- **Tax Tables**: `data/core/tax/all_tax_data_2024_2026.csv`
- **Test CSVs**: `data/imports/test_data/user*.csv`
- **Archived Files**: `data/archive/` (can be cleaned periodically)

## Important Notes & Gotchas
1. **Dashboard uses vanilla JavaScript**, NOT Qwik framework
2. **Item values**: Import looks up from database, not CSV
3. **All database changes** via Cloudflare Console, not CLI
4. **Notes field**: User comments ONLY, no structured data
5. **Charity matching**: Uses fuzzy matching, creates user_charities for misses
6. **Items must match** database exactly (496 predefined items)
7. **Tax settings** currently in localStorage (needs migration)

Ready for continued development!