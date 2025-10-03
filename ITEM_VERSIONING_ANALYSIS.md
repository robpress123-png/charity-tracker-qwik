# Item Database Versioning Analysis

## Option 1: Temporal Versioning (expiration_date)
```sql
SELECT * FROM items
WHERE name = ? AND category_id = ?
  AND effective_date <= donation_date
  AND expiration_date >= donation_date
```

### Pros:
- Complete audit trail
- Single source of truth
- Supports any date range

### Cons:
- **Every search needs date filtering** (slower)
- Complex queries
- Database grows linearly with years
- 1,757 items × 10 years = 17,570 rows to search

### Performance Impact:
- Search: O(n) where n = total versions
- Storage: ~17MB after 10 years

---

## Option 2: Keep All Versions (Never Update)
```sql
SELECT * FROM items
WHERE name = ? AND category_id = ?
  AND effective_date <= donation_date
ORDER BY effective_date DESC LIMIT 1
```

### Pros:
- Simple import logic
- Complete history

### Cons:
- **Massive database bloat**
- Searches get progressively slower
- Must scan all versions to find right one
- 1,757 × yearly updates = exponential growth

### Performance Impact:
- Search: O(n log n) due to sorting
- Storage: ~35MB+ after 10 years

---

## Option 3: Year-Based Databases
```javascript
// Switch database based on year
const db = year === 2024 ? DB_2024 : year === 2025 ? DB_2025 : DB_2026;
```

### Pros:
- **Fastest searches** (only 1,757 items per DB)
- Clean separation
- Easy archival

### Cons:
- Major code changes required
- Multiple database connections
- Complex multi-year reports
- Cloudflare D1 limitations

### Performance Impact:
- Search: O(1) - constant time
- Storage: Distributed across databases

---

## Option 4: Hybrid - Active Window Approach 🎯 **RECOMMENDED**

### Design:
```sql
-- Main items table (current + 2 years)
CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    name TEXT,
    category_id INTEGER,
    effective_year INTEGER, -- New: just year, not full date
    ...values...
);

-- Archive table (older than 2 years)
CREATE TABLE items_archive (
    -- Same structure
);

-- Index for fast year-based queries
CREATE INDEX idx_items_year ON items(effective_year, name, category_id);
```

### Implementation:
1. **Import**: Add items with effective_year (2024, 2025, etc.)
2. **Matching**: Same item + same year = update, different year = new row
3. **Archival**: Annually move items older than 3 years to archive
4. **Search Logic**:
   ```javascript
   // For creating donations
   if (donationYear >= currentYear - 2) {
       // Use main items table
       searchItems(year: donationYear)
   } else {
       // Show warning: "Using current values for old donation"
       // Or: Load from archive (slower)
   }
   ```

### Pros:
- **Fast searches** (max 3 years × 1,757 = 5,271 items)
- **IRS compliant** for recent years (most important)
- **Scalable** (auto-archives old data)
- **Simple queries** (filter by year)
- **Reasonable storage** (controlled growth)

### Cons:
- Older donations use current values (acceptable?)
- Annual maintenance to archive

### Performance Impact:
- Search: O(1) with year index
- Storage: ~5MB active, archived separately

---

## Recommendation: Hybrid Active Window

### Why it's best:
1. **Performance**: 3x faster than temporal versioning
2. **IRS Compliance**: Accurate for 3 years (covers most audits)
3. **User Experience**: Simple year selector in UI
4. **Scalability**: Database size stays constant
5. **Implementation**: Minimal schema changes

### Implementation Steps:
1. Add `effective_year INTEGER` column
2. Update import to use year-based matching
3. Add year selector to donation form
4. Create annual archive job
5. Show warning for donations > 3 years old

### Example UI:
```
Creating donation for: [2024 ▼]
✓ Using 2024 item values

Creating donation for: [2020 ▼]
⚠️ 2020 values not available, using current values
   [Load archived values] (slower)
```

This approach balances performance, compliance, and complexity perfectly!