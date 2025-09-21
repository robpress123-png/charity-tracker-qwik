# Database Schema Verification - Charity Tracker
## Date: 2025-01-20

## ACTUAL DATABASE SCHEMAS

### 1. USERS TABLE
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- SHA-256 hashed
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    created_at DATETIME,
    updated_at DATETIME
)
```

### 2. DONATIONS TABLE
```sql
CREATE TABLE donations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    charity_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,          -- NOTE: Column is 'date', not 'donation_date'
    receipt_url TEXT,
    notes TEXT,                  -- Currently stores JSON with donation type info
    created_at DATETIME
)
```

### 3. CHARITIES TABLE
```sql
CREATE TABLE charities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,       -- NOTE: This suggests user-specific charities
    name TEXT NOT NULL,
    ein TEXT,
    category TEXT,
    website TEXT,
    description TEXT,
    created_at DATETIME
)
```

### 4. ITEM_CATEGORIES TABLE
```sql
CREATE TABLE item_categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT
)
```

### 5. DONATION_ITEMS TABLE (CRITICAL!)
```sql
CREATE TABLE donation_items (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    value_poor REAL,         -- NOT value_low
    value_fair REAL,         -- NOT value_high
    value_good REAL,         -- This exists
    value_excellent REAL     -- NOT value_very_good
)
```

## CURRENT MISMATCHES

### 1. Items API (/functions/api/items.js)
❌ **WRONG** - Currently queries:
```javascript
SELECT id, name, description, value_good, value_very_good, value_excellent
```

✅ **SHOULD BE**:
```javascript
SELECT id, name, description, value_poor, value_fair, value_good, value_excellent
```

### 2. Dashboard HTML Item Quality Options
❌ **WRONG** - Currently has:
```html
<option value="good">Good</option>
<option value="very_good">Very Good</option>
<option value="excellent">Excellent</option>
```

✅ **SHOULD BE**:
```html
<option value="poor">Poor</option>
<option value="fair">Fair</option>
<option value="good">Good</option>
<option value="excellent">Excellent</option>
```

### 3. Dashboard Value Calculation
❌ **WRONG** - Currently checks:
```javascript
if (quality === 'good') {
    unitValue = item.value_good || 0;
} else if (quality === 'very_good') {
    unitValue = item.value_very_good || 0;  // This column doesn't exist!
} else if (quality === 'excellent') {
    unitValue = item.value_excellent || 0;
}
```

✅ **SHOULD BE**:
```javascript
if (quality === 'poor') {
    unitValue = item.value_poor || 0;
} else if (quality === 'fair') {
    unitValue = item.value_fair || 0;
} else if (quality === 'good') {
    unitValue = item.value_good || 0;
} else if (quality === 'excellent') {
    unitValue = item.value_excellent || 0;
}
```

## DONATION TYPE FIELDS MAPPING

### Cash Donations
- **DB**: amount, date, notes
- **Frontend**: amount, donation_date, notes
- **Status**: ✅ Working (fixed)

### Mileage Donations
- **DB**: Stored in notes JSON: miles_driven, mileage_rate, mileage_purpose
- **Frontend**: miles_driven, mileage_purpose
- **Calculation**: miles × $0.14 (IRS rate)
- **Status**: ⚠️ Should work but needs testing

### Stock Donations
- **DB**: Stored in notes JSON: stock_name, stock_symbol, shares_donated
- **Frontend**: stockName, stockSymbol, shares, pricePerShare
- **Status**: ⚠️ Should work but needs testing

### Crypto Donations
- **DB**: Stored in notes JSON: crypto_name, crypto_symbol, crypto_quantity, crypto_donation_datetime
- **Frontend**: cryptoName, cryptoSymbol, cryptoQuantity, cryptoPricePerUnit, cryptoDonationDate, cryptoDonationTime
- **Status**: ⚠️ Should work but needs testing

### Item Donations
- **DB**: Stored in notes JSON: item list with categories, names, quality, quantity, values
- **Frontend**: category dropdown, item dropdown, quality dropdown (poor/fair/good/excellent), quantity
- **Status**: ❌ BROKEN - quality options don't match DB columns

## IMMEDIATE FIXES NEEDED

1. **Fix items.js API** - Change columns from value_good, value_very_good, value_excellent to value_poor, value_fair, value_good, value_excellent

2. **Fix dashboard.html quality dropdown** - Add all four quality options (poor, fair, good, excellent)

3. **Fix dashboard.html value calculation** - Handle all four quality levels properly

4. **Fix mock data in items.js** - Update to use correct column names

## NOTES
- The charities table has user_id, suggesting charities are user-specific (not global)
- The donations table uses 'date' not 'donation_date' as the column name
- All donation type-specific data is currently stored as JSON in the notes field
- This is a temporary solution - should be normalized in future versions