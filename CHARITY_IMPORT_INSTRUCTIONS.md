# IRS Charity Data Import Instructions

## Overview
Successfully extracted and prepared the top 10,000 charities from IRS Publication 78 data (270,505 total organizations).

## Files Created

### 1. Scripts
- **`scripts/extract-top-charities.js`** - Extracts top 10,000 charities from IRS CSV
- **`scripts/split-sql-file.js`** - Splits large SQL file into 90KB chunks
- **`scripts/upload-charities-to-d1.sh`** - Bash script to upload all chunks to D1

### 2. Data Files
- **`data/top_10000_charities.json`** - JSON format of all charities (2.6MB)
- **`data/top_10000_charities.sql`** - Complete SQL file (1.5MB)
- **`data/sql-chunks/`** - Directory with 16 SQL chunks (~90KB each)

## Charity Selection Criteria

The script prioritizes charities based on:

1. **Well-known organizations** - Red Cross, United Way, Salvation Army, etc.
2. **Geographic distribution** - Charities from different states
3. **Category diversity** - Various charitable purposes

### Category Distribution
- Education: 3,028 organizations
- Religious: 2,832 organizations
- Other: 2,550 organizations
- Arts & Culture: 579 organizations
- Health: 443 organizations
- Human Services: 190 organizations
- Research: 125 organizations
- Foundation: 102 organizations
- International: 97 organizations
- Environment/Animals: 47 organizations
- Youth Development: 7 organizations

### Geographic Distribution (Top States)
- New York: 4,022 charities
- New Jersey: 1,956 charities
- Massachusetts: 1,211 charities
- Maine: 830 charities
- Connecticut: 732 charities
- New Hampshire: 629 charities
- Rhode Island: 332 charities
- Vermont: 288 charities

## How to Import Charities to Cloudflare D1

### Option 1: Use the Upload Script (Recommended)
```bash
# Run the interactive upload script
./scripts/upload-charities-to-d1.sh
```

The script will:
- Ask if you want to upload to local or remote database
- Upload all 16 chunks sequentially
- Show progress and handle errors
- Provide verification commands

### Option 2: Manual Upload
Upload each chunk individually:

```bash
# First chunk creates the table
npx wrangler d1 execute charity-tracker-qwik-db --file=./data/sql-chunks/charities_chunk_001.sql --remote

# Upload remaining chunks
npx wrangler d1 execute charity-tracker-qwik-db --file=./data/sql-chunks/charities_chunk_002.sql --remote
# ... continue for all 16 chunks
```

### Option 3: Batch Upload with Loop
```bash
# Upload all chunks with a shell loop
for file in data/sql-chunks/*.sql; do
  echo "Uploading $file..."
  npx wrangler d1 execute charity-tracker-qwik-db --file="$file" --remote
  sleep 2
done
```

## Verification

After import, verify the data:

```bash
# Check total count
npx wrangler d1 execute charity-tracker-qwik-db --remote --command "SELECT COUNT(*) FROM global_charities;"

# Check category distribution
npx wrangler d1 execute charity-tracker-qwik-db --remote --command "SELECT category, COUNT(*) as count FROM global_charities GROUP BY category ORDER BY count DESC;"

# Search for specific charity
npx wrangler d1 execute charity-tracker-qwik-db --remote --command "SELECT name, ein, city, state FROM global_charities WHERE name LIKE '%Red Cross%';"
```

## Database Schema

The `global_charities` table structure:

```sql
CREATE TABLE global_charities (
    id TEXT PRIMARY KEY,
    ein TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    city TEXT,
    state TEXT,
    description TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Storage Considerations

- **Free Cloudflare Account Limits:**
  - D1 Database: 500 MB storage
  - 10,000 charities uses approximately 2-3 MB
  - Plenty of room for user data and growth

## Next Steps

After importing charities:

1. Update the application to use `global_charities` table for charity search
2. Modify the charity API endpoints to search both user and global charities
3. Add UI to distinguish between IRS-verified and user-added charities
4. Consider caching popular charities for faster access

## Troubleshooting

### If upload fails:
- Check Cloudflare authentication: `npx wrangler whoami`
- Verify database exists: `npx wrangler d1 list`
- Try uploading to local first for testing
- Check for SQL syntax errors in specific chunk

### If charities don't appear:
- Verify table was created: Check for `global_charities` table
- Check import count: Should be 10,000 records
- Review API endpoints for proper table references

## File Sizes
- Original IRS data: 270,505 organizations
- Selected top: 10,000 organizations
- SQL file: 1.5 MB (split into 16 chunks)
- JSON backup: 2.6 MB
- Each chunk: ~90 KB (safe for D1 upload)