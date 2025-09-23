# Charity Tracker Continuation Context - v2.1.41

## Current Version
- **Version:** 2.1.41
- **Last Updated:** 2025-01-23
- **Context Usage:** Currently at ~97% - CRITICAL

## CRITICAL ONGOING ISSUE: Item Donations Not Working

### The Problem:
1. **Items dropdown is EMPTY** when selecting a category in Add Donation
2. **Error:** `no such column: name` when querying items
3. **This WAS working** before recent changes to support item editing

### What We Know:
- 497 IRS-based items ARE in the database (uploaded earlier)
- Categories load correctly (working)
- Charity selection fixed in v2.1.38 (working)
- Items were previously stored in notes field (worked but not editable)

### Table Structure Confusion:
We have TWO `donation_items` tables with different schemas:

1. **Original table** (INTEGER id) - Has the 497 IRS valuations:
   - Columns: id, category_id, name, value_poor, value_fair, value_good, value_excellent
   - This is what we need to query for the dropdown

2. **New table** (TEXT id) - For tracking donated items:
   - Columns: id, donation_id, item_name, condition, quantity, unit_value
   - Created for storing individual items from donations

### Current SQL Errors:
```
Failed to fetch items: D1_ERROR: no such column: name at offset 46: SQLITE_ERROR
```

### Attempts Made:
- v2.1.39: Query `donation_items WHERE category_id = ?`
- v2.1.40: Added `id <= 500` filter
- v2.1.41: Tried `items` table instead

### What Needs to Happen:
1. Find the correct table/query for the 497 IRS items
2. Fix the items API to populate the dropdown
3. Ensure items can be saved to the new tracking table
4. Make items editable after saving

## Database Design (Confirmed Correct):
- **Multi-user**: Single shared `donations` table with `user_id` column ✓
- **Scalability**: Good for 5000+ users with proper indexes ✓
- **Items storage**: Separate `donation_items` table for normalization ✓

## CSV Import Format:
See `CSV_DATA_REQUIREMENTS.md`
- Items format: `ItemName:condition` or `ItemName:condition:quantity`
- Conditions: fair ($0), good, very_good, excellent

## Features Working:
1. ✅ Cash, stock, crypto, miles donations
2. ✅ Charity matching with aliases
3. ✅ CSV import validation
4. ✅ Year filter (2024, 2025, 2026)
5. ✅ Multi-user support

## Features BROKEN:
1. ❌ Items dropdown in Add Donation (CRITICAL)
2. ❌ Item value lookup during import
3. ❌ Editing existing item donations

## Next Steps When Context Resets:
1. **Get database schema**: Ask user to run `PRAGMA table_info(donation_items);`
2. **Check for items table**: Ask for `.tables` command output
3. **Find the 497 items**: Need to know exact table and column names
4. **Fix the API query**: Update `/functions/api/items.js` with correct query

## Important Files:
- `/functions/api/items.js` - Needs fixing (line 119-133)
- `/dist/dashboard.html` - Has two `selectCharity` functions (fixed in v2.1.38)
- `/functions/api/donations/import.js` - Parses items from CSV

## Test Data:
- `test_donations_final_50.csv` - 50 donations with all types

## DO NOT:
- Create new tables without checking what exists
- Rename functions without checking for duplicates
- Change working features while fixing items

## PRIORITY:
Fix the items dropdown - this is blocking users from creating item donations!