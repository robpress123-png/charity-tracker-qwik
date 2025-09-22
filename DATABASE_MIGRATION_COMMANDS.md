# Database Migration Commands for Charity Tracker v1.7.1

## Prerequisites
1. Ensure you're logged into Cloudflare Wrangler
2. Have Node.js v20+ installed
3. Be in the project directory

## Step 1: Set up Node.js Environment
```bash
source ~/.nvm/nvm.sh && nvm use 20
```

## Step 2: Login to Cloudflare (if needed)
```bash
npx wrangler login
```

## Step 3: Execute Database Migrations

### 3.1 Fix user_charities table (add is_approved column if missing)

#### Option A: Simple ALTER TABLE (if table exists but missing column)
Run this first command in the Cloudflare D1 Console:
```sql
ALTER TABLE user_charities ADD COLUMN is_approved INTEGER DEFAULT 0;
```

Then run these to add indexes:
```sql
CREATE INDEX IF NOT EXISTS idx_user_charities_user ON user_charities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_charities_name ON user_charities(name);
CREATE INDEX IF NOT EXISTS idx_user_charities_approved ON user_charities(is_approved);
```

#### Option B: Complete Table Rebuild (if ALTER fails)
If you get an error that the column already exists, or if you want to ensure the table is correct, use the rebuild approach:

```bash
npx wrangler d1 execute charity-tracker-qwik-db --file=sql/rebuild_user_charities_table.sql --remote
```

### 3.2 Alternative: Manual execution via Cloudflare Dashboard

1. Go to Cloudflare Dashboard: https://dash.cloudflare.com/
2. Navigate to Workers & Pages > D1
3. Select "charity-tracker-qwik-db"
4. Go to Console tab
5. Execute each SQL command one at a time:

**First, check if the column exists:**
```sql
PRAGMA table_info(user_charities);
```

**If is_approved column is missing, add it:**
```sql
ALTER TABLE user_charities ADD COLUMN is_approved INTEGER DEFAULT 0;
```

**Then create the indexes:**
```sql
CREATE INDEX IF NOT EXISTS idx_user_charities_user ON user_charities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_charities_name ON user_charities(name);
CREATE INDEX IF NOT EXISTS idx_user_charities_approved ON user_charities(is_approved);
```

## Step 4: Verify Database Structure

### Check donations count for test user:
```sql
-- Get test user ID
SELECT id, email FROM users WHERE email = 'test@example.com';

-- Count donations for user (replace USER_ID with actual ID from above)
SELECT COUNT(*) as total_donations FROM donations WHERE user_id = 'USER_ID';

-- List recent donations
SELECT d.*, c.name as charity_name
FROM donations d
LEFT JOIN charities c ON d.charity_id = c.id
WHERE d.user_id = 'USER_ID'
ORDER BY d.date DESC
LIMIT 10;
```

### Check admin statistics:
```sql
-- Count donations by year
SELECT
    strftime('%Y', date) as year,
    COUNT(*) as donation_count,
    SUM(amount) as total_amount
FROM donations
GROUP BY strftime('%Y', date)
ORDER BY year DESC;

-- Count donations this month
SELECT COUNT(*) as donations_this_month, SUM(amount) as total_this_month
FROM donations
WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now');

-- Count total charities
SELECT COUNT(*) as total_charities FROM charities;
```

## Step 5: Fix Data Inconsistencies

### If donation counts are incorrect, check for duplicates:
```sql
-- Check for duplicate donations
SELECT charity_id, date, amount, COUNT(*) as count
FROM donations
GROUP BY charity_id, date, amount
HAVING COUNT(*) > 1;
```

### Ensure all imported donations are properly linked:
```sql
-- Check donations without valid charity links
SELECT COUNT(*) as orphaned_donations
FROM donations d
LEFT JOIN charities c ON d.charity_id = c.id
WHERE c.id IS NULL;
```

## Step 6: Deploy Updated Code

After database migrations are complete:

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name charity-tracker-qwik
```

## Troubleshooting

### If you get authentication errors:
1. Set your Cloudflare API token:
```bash
export CLOUDFLARE_API_TOKEN=your_token_here
```

2. Or use the Cloudflare Dashboard Console directly

### If migrations fail:
1. Check the error message for specific column conflicts
2. You may need to backup and recreate tables if columns are in wrong state
3. Use the FRESH_START_MIGRATION.sql if needed for complete reset

## Important Notes
- Always backup your database before major migrations
- Test migrations in a development environment first if possible
- The `is_approved` column is critical for the personal charity feature
- Donation counts should match between localStorage and database