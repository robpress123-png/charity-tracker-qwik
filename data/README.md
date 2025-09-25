# Data Directory Structure

## Organization

### `/core/` - Core Reference Data
Essential data files that power the application. These files should rarely change.

- **`/charities/`** - IRS charity database
  - `charities_10k_full.csv` - 10,000 verified IRS charities

- **`/items/`** - Donation item valuations
  - `items_database_497.csv` - 496 items with IRS-approved valuations

- **`/tax/`** - Tax tables and rates
  - `all_tax_data_2024_2026.csv` - Complete tax data for 2024-2026
    - Tax brackets for all filing statuses
    - Capital gains rates
    - Standard deductions
    - IRS mileage rates
    - Contribution limits (including 2026 OBBBA rules)

### `/exports/` - User-Generated Exports
Files exported from the application by users.

### `/imports/` - Import-Ready Files
Files prepared for importing into the application.

- **`/test_data/`** - Test CSV files for development

### `/archive/` - Historical/Unused Files
Old files kept for reference but not actively used.

- **`/charity_batches/`** - Original charity import batches
- **`/test_csvs/`** - Various test CSV files from development

### `/sql/` - Database Scripts
SQL scripts for database management.

- **`/schema/`** - Database structure creation scripts
- **`/migrations/`** - Database migration and update scripts

## Important Files

### Core Data Files (Do Not Delete!)
- `core/charities/charities_10k_full.csv` - Required for charity lookup
- `core/items/items_database_497.csv` - Required for item valuations
- `core/tax/all_tax_data_2024_2026.csv` - Required for tax calculations

### File Paths in Code
If you need to reference these files in code, use these paths:
```javascript
// From project root:
const CHARITY_DB = 'data/core/charities/charities_10k_full.csv';
const ITEMS_DB = 'data/core/items/items_database_497.csv';
const TAX_DATA = 'data/core/tax/all_tax_data_2024_2026.csv';
```

## Maintenance Notes

1. **Always backup** before modifying core data files
2. **Export files** are automatically timestamped
3. **Archive folder** can be cleaned periodically
4. **Test data** should be in `/imports/test_data/`

Last updated: 2025-09-25 (v2.6.1)