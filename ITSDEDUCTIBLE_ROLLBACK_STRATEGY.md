# ItsDeductible Migration - Rollback Strategy

## 🔄 Making the Migration Reversible

### Strategy: Parallel Databases with Feature Flag

Instead of replacing, we'll run BOTH systems in parallel with an instant switch:

```javascript
// settings.js - Feature flag approach
const ITEM_DATABASE_VERSION = localStorage.getItem('itemDatabaseVersion') || 'v2'; // Default to new

// Switch between databases instantly
function getItemsTable() {
  return ITEM_DATABASE_VERSION === 'v1' ? 'items_legacy' : 'items';
}
```

## 1. Database Strategy: Keep Both

### Table Structure:
```sql
-- Original test data (496 items)
CREATE TABLE items_legacy (
  id INTEGER PRIMARY KEY,
  category_id INTEGER,
  name TEXT,
  description TEXT,
  unit TEXT,
  value_good DECIMAL,
  value_very_good DECIMAL,
  value_excellent DECIMAL,
  source_reference TEXT
);

-- New ItsDeductible data (1,757 items)
CREATE TABLE items (
  id INTEGER PRIMARY KEY,
  category_id INTEGER,
  name TEXT,
  item_variant TEXT,
  description TEXT,
  value_good DECIMAL,
  value_very_good DECIMAL,
  value_excellent DECIMAL,
  source_reference TEXT,
  date_of_valuation DATE,
  search_keywords TEXT,
  original_description TEXT
);

-- Categories for each version
CREATE TABLE categories_legacy (12 categories);
CREATE TABLE categories (21 categories);
```

## 2. Backup Scripts

### A. Pre-Migration Backup
```bash
#!/bin/bash
# backup_before_migration.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/items_migration_$TIMESTAMP"

mkdir -p $BACKUP_DIR

# Export current data
echo "Backing up current items database..."
sqlite3 charity-tracker.db <<EOF
.headers on
.mode csv
.output $BACKUP_DIR/items_original.csv
SELECT * FROM items;
.output $BACKUP_DIR/categories_original.csv
SELECT * FROM item_categories;
.output $BACKUP_DIR/donation_items_original.csv
SELECT * FROM donation_items WHERE item_id IS NOT NULL;
EOF

# Create SQL restore script
cat > $BACKUP_DIR/restore.sql <<EOF
-- Restore original items database
DELETE FROM items;
DELETE FROM item_categories;
.mode csv
.import $BACKUP_DIR/items_original.csv items
.import $BACKUP_DIR/categories_original.csv item_categories
EOF

echo "Backup complete: $BACKUP_DIR"
```

### B. Quick Rollback Script
```bash
#!/bin/bash
# rollback_items.sh

echo "⚠️  Rolling back to original items database..."
read -p "Are you sure? (y/N): " confirm

if [ "$confirm" = "y" ]; then
  # Find most recent backup
  LATEST_BACKUP=$(ls -t backups/items_migration_*/restore.sql | head -1)

  if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found!"
    exit 1
  fi

  echo "Restoring from: $LATEST_BACKUP"
  sqlite3 charity-tracker.db < "$LATEST_BACKUP"
  echo "✅ Rollback complete"
else
  echo "Rollback cancelled"
fi
```

## 3. Feature Flag Implementation

### A. Admin Control Panel
```javascript
// Add to admin-dashboard.html
function addItemDatabaseToggle() {
  const settingsHTML = `
    <div class="database-version-control">
      <h3>Item Database Version</h3>
      <label>
        <input type="radio"
               name="itemDB"
               value="v1"
               ${getItemDBVersion() === 'v1' ? 'checked' : ''}
               onchange="switchItemDatabase('v1')">
        Original (496 items - Test Data)
      </label>
      <label>
        <input type="radio"
               name="itemDB"
               value="v2"
               ${getItemDBVersion() === 'v2' ? 'checked' : ''}
               onchange="switchItemDatabase('v2')">
        ItsDeductible (1,757 items - Real Valuations)
      </label>
      <p class="info">Current: ${getItemDBVersion() === 'v1' ? 'Test Data' : 'ItsDeductible'}</p>
    </div>
  `;

  document.getElementById('adminSettings').innerHTML += settingsHTML;
}

function switchItemDatabase(version) {
  if (confirm(`Switch to ${version === 'v1' ? 'original test' : 'ItsDeductible'} database?`)) {
    localStorage.setItem('itemDatabaseVersion', version);
    // Clear caches
    localStorage.removeItem('itemsCache');
    sessionStorage.removeItem('itemsCache');
    showToast(`Switched to ${version === 'v1' ? 'original' : 'ItsDeductible'} database`, 'success');
    setTimeout(() => location.reload(), 1000);
  }
}
```

### B. API Endpoint Updates
```javascript
// api/items.js - Version-aware endpoint
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  // Check version preference
  const version = url.searchParams.get('version') ||
                  request.headers.get('X-Items-Version') ||
                  'v2'; // Default to new

  const tableName = version === 'v1' ? 'items_legacy' : 'items';
  const categoriesTable = version === 'v1' ? 'categories_legacy' : 'categories';

  // Query appropriate table
  const query = url.searchParams.get('q');
  const results = await env.DB.prepare(`
    SELECT * FROM ${tableName}
    WHERE name LIKE ?
    LIMIT 20
  `).bind(`%${query}%`).all();

  return json({
    items: results.results,
    version: version,
    totalItems: version === 'v1' ? 496 : 1757
  });
}
```

## 4. Migration Testing Checklist

### Before Going Live:
```markdown
- [ ] Run both databases in parallel for 1 week
- [ ] A/B test with small user group
- [ ] Compare donation creation success rates
- [ ] Monitor search performance
- [ ] Check value accuracy concerns
- [ ] Gather user feedback
```

### Success Metrics:
```javascript
// Track metrics for comparison
const metrics = {
  v1: {
    avgSearchTime: [],
    itemsFound: [],
    customItemsCreated: [], // High = bad (couldn't find item)
    userSatisfaction: []
  },
  v2: {
    avgSearchTime: [],
    itemsFound: [],
    customItemsCreated: [], // Should be lower
    userSatisfaction: []
  }
};
```

## 5. Gradual Migration Path

### Phase 1: Shadow Mode (1 week)
- Import ItsDeductible to parallel table
- Admin users can toggle between versions
- Collect metrics but don't switch users

### Phase 2: Opt-in Beta (1 week)
```javascript
// Show to active users
if (user.donations_count > 10) {
  showBetaInvite(`
    Try our new expanded item database!
    • 3x more items (1,757 vs 496)
    • Real-world valuations
    • Better search
    [Try Beta] [Maybe Later]
  `);
}
```

### Phase 3: Default with Opt-out (2 weeks)
- New users get ItsDeductible by default
- Existing users see one-time notice
- Easy switch back in Settings

### Phase 4: Full Migration
- Only if metrics show improvement
- Keep legacy table for 6 months
- Archive before final deletion

## 6. Emergency Rollback

### One-Command Rollback:
```bash
# emergency_rollback.sh
#!/bin/bash

echo "🚨 EMERGENCY ROLLBACK INITIATED"

# 1. Switch all users to v1
redis-cli SET "global:itemDatabaseVersion" "v1"

# 2. Clear caches
redis-cli FLUSHDB

# 3. Update feature flag
curl -X POST https://api.cloudflare.com/client/v4/accounts/{account}/storage/kv/namespaces/{namespace}/values/ITEM_DB_VERSION \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -d "v1"

# 4. Notify
curl -X POST $SLACK_WEBHOOK \
  -d '{"text":"⚠️ Items database rolled back to v1"}'

echo "✅ Rollback complete - all users on original database"
```

## 7. Why This Approach Works

### Advantages:
1. **Zero commitment** - Switch back instantly
2. **A/B testing** - Compare real metrics
3. **Gradual rollout** - Reduce risk
4. **User control** - Let users choose
5. **Data preservation** - Nothing deleted

### Cost:
- **Storage**: ~500KB extra (negligible)
- **Complexity**: Minimal (one flag check)
- **Time**: 1 hour additional setup

## Implementation Commands

```bash
# 1. Create backup
./backup_before_migration.sh

# 2. Import new data to parallel table
sqlite3 charity-tracker.db < items_itsdeductible.sql

# 3. Rename tables for parallel operation
sqlite3 charity-tracker.db <<EOF
ALTER TABLE items RENAME TO items_legacy;
ALTER TABLE item_categories RENAME TO categories_legacy;
-- Import new tables without overwriting
EOF

# 4. Test switching
curl /api/items?version=v1  # Original
curl /api/items?version=v2  # ItsDeductible

# 5. Monitor metrics
tail -f logs/item_database_metrics.log
```

## Summary

This rollback strategy gives you:
- ✅ **Instant switching** between versions
- ✅ **Zero data loss**
- ✅ **A/B testing capability**
- ✅ **Gradual migration option**
- ✅ **Emergency rollback** in seconds
- ✅ **User feedback period**

The only "cost" is keeping both tables temporarily, which is trivial for 1,757 records. You can confidently try the new system knowing you can switch back instantly if needed!