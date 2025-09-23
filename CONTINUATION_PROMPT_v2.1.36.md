# Charity Tracker Continuation Context - v2.1.36

## Current Version
- **Version:** 2.1.36
- **Last Updated:** 2025-01-23

## Critical Understanding: Item Donations
**One donation of type "items" contains MULTIPLE individual items**
- Each donation record links to multiple donation_items records
- Example: One Goodwill donation might have 10+ different items
- Total value = sum of all individual item values

## Database Structure for Items

### Three Related Tables:
1. **donations table**: Main donation record (type="items")
2. **donation_items table (for tracking)**: Individual items within a donation
   - TEXT PRIMARY KEY, linked by donation_id
   - Stores: item_name, condition, quantity, unit_value
3. **donation_items table (for valuations)**: The 497 IRS items with values
   - INTEGER PRIMARY KEY
   - Has: name, value_poor, value_fair, value_good, value_excellent

**CONFLICT**: Two tables named `donation_items` with different schemas!

## CSV Import Format
See `CSV_DATA_REQUIREMENTS.md` for complete specification

### Items Column Format:
- Single item: `ItemName:condition`
- Multiple items: `Item1:condition|Item2:condition|Item3:condition`
- With quantity: `ItemName:condition:quantity`
- Conditions: fair ($0), good, very_good, excellent

### Example:
```csv
2025-01-15,"Goodwill",items,0,"Spring cleaning","Closet cleanout",,,,,,,,,"Coat:good|Sweater:excellent|Jeans:good:2|Dress:fair"
```

## Current Issues Being Addressed
1. ✅ Items API queries wrong table/columns
2. ✅ Import parses items from CSV column
3. ⚠️ Imported items stored with $0 value (need lookup)
4. ⚠️ Add donation UI not loading items for autocomplete
5. ⚠️ Table naming conflict (two donation_items tables)

## Key Features Working
1. **CSV Import with Validation**
   - Two-step: validate then import
   - Charity fuzzy matching with user confirmation
   - All donation types supported

2. **Charity System**
   - 10,000+ IRS charities in database
   - Alias system in code (`/functions/utils/charity-aliases.js`)
   - Personal charities supported

3. **Year Filter**
   - Fixed to show 2024, 2025, 2026
   - Filters dashboard, stats, exports

## Test Data Files
- `test_donations_final_50.csv` - Mixed years, all types, realistic items

## Future Features (See FUTURE_FEATURES.md)
- Database-driven charity aliases (currently in code)

## Important Notes
- Database changes require SQL in D1 console
- Auto-version with `npm run bump:patch`
- Cloudflare Pages auto-deploys from GitHub
- Item values based on IRS Publication 561