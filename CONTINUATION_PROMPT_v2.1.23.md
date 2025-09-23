# Charity Tracker Continuation Prompt - v2.1.23
## Last Updated: 2025-09-23 (September 23, 2025)

## 🔴 CRITICAL DATABASE ARCHITECTURE 🔴

### DATABASE STRUCTURE - DO NOT VIOLATE
1. **donations table** - Core donation data
   - id, user_id, charity_id, amount, date, donation_type, notes, receipt_url
   - miles_driven, mileage_rate, mileage_purpose (for mileage donations)
   - stock_symbol, stock_quantity, fair_market_value (for stock donations)
   - crypto_symbol, crypto_quantity, crypto_type (for crypto donations)
   - item_description, estimated_value (summary for items donations)

2. **donation_items table** - Individual items for items donations
   - donation_id (FK to donations.id)
   - item_name, category, condition, quantity, unit_value, total_value
   - Each item donation can have MULTIPLE items in this table

3. **notes field** - ONLY for user-entered text notes
   - NEVER store JSON, structured data, or system data here
   - This is ONLY for optional user comments about the donation

### CSV IMPORT/EXPORT FORMAT
- **Items donations use special format in CSV**:
  - Items column: "name|category|condition|qty|value,name|category|condition|qty|value"
  - Example: "Clothing|Clothing - Women|excellent|10|150.00,Books|Books|very_good|25|50.00"
  - Import parses this and creates entries in donation_items table

### CRITICAL RULES
- NEVER store structured data in notes field
- ALWAYS use proper database columns for all data
- Items donations MUST create entries in donation_items table
- Edit functionality MUST fetch from database, not localStorage

## 🚨 CURRENT STATUS v2.1.23 🚨

### What's Working
- ✅ Database column usage fixed (no more JSON in notes)
- ✅ CSV export includes all type-specific columns
- ✅ CSV import saves to proper database columns
- ✅ Import dialog requires user acknowledgment (no auto-close)
- ✅ Edit fetches from API (not localStorage)
- ✅ Mileage rate stored for historical accuracy

### Known Issues
1. **Charity Matching in Import**
   - User test CSVs created with common charity names (Red Cross, etc.)
   - These don't exist in database - has actual IRS charity names
   - Need to use actual charity names from charities_import.csv

2. **500 Error on Dashboard Load**
   - Happens when querying donations with year=2025
   - Likely due to old data structure before column fixes
   - Resolves after delete all + reimport

### Test Data Files
- **Working**: test_data_50_corrected.csv (has matching charity names)
- **New with actual charities**: test_donations_50_actual.csv
- **User files with wrong charities**: user1-5_test_data_2025.csv (have items format but wrong charity names)

## 🔧 DEPLOYMENT PROCESS 🔧

### Version Bumping - REQUIRED
```bash
npm run bump:patch  # For bug fixes (most common)
npm run bump:minor  # For new features
npm run bump:major  # For breaking changes
```

This automatically:
1. Updates package.json version
2. Updates all HTML files
3. Updates VERSION.json
4. Commits with version message
5. Pushes to GitHub
6. Triggers Cloudflare auto-deploy

### NEVER:
- Manually edit version numbers
- Use `wrangler deploy` directly
- Push without version bump

### URLs:
- Production: https://charity-tracker-qwik.pages.dev
- GitHub: https://github.com/robpress123-png/charity-tracker-qwik
- Check deployment: Cloudflare dashboard

## 📁 Project Structure

### Key Files
- `/dist/dashboard.html` - Main user application (v2.1.23)
- `/dist/admin-dashboard.html` - Admin console
- `/functions/api/donations.js` - Main donations API (fixed column usage)
- `/functions/api/donations/[id].js` - Single donation operations
- `/functions/api/donations/import.js` - CSV import (with items support)
- `/functions/api/donations/delete-all.js` - Admin delete all

### Database Location
- Cloudflare D1: charity-tracker-qwik-db
- Tables: users, donations, donation_items, charities, user_charities

## 🎯 Next Steps

1. **Fix Charity Names in Test Data**
   - Use test_donations_50_actual.csv (created with actual charity names)
   - OR add test charities as Personal Charities first

2. **Complete Testing**
   - Import with proper charity names
   - Verify all donation types save correctly
   - Test edit functionality for all types
   - Verify items create entries in donation_items table

3. **Production Data Migration**
   - Delete all donations via admin
   - Reimport with v2.1.23+ to ensure proper column usage

## ⚠️ REMEMBER ⚠️

1. Today is **September 23, 2025** (not January!)
2. The `notes` field is ONLY for user text
3. Items donations use the donation_items table
4. Always bump version before deploying
5. Charity names must match exactly for import
6. Edit function MUST fetch from database API

## Recent Version History
- v2.1.19: Fixed database column usage, removed JSON from notes
- v2.1.20: Fixed CSV import/export with all columns
- v2.1.21: Import dialog improvements
- v2.1.22: Removed auto-close, added Continue button
- v2.1.23: Added import debugging, fixed charity query

## Test Data Status
- ✅ test_donations_50_actual.csv - Ready with actual charity names
- ⚠️ user1-5_test_data_2025.csv - Have correct items format but wrong charity names
- ✅ test_data_50_corrected.csv - Original working file

The system is at ~90% functionality. Main issue is charity name matching in imports.