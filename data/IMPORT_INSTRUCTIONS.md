# Import Test Data Instructions for v2.0.0

## Step 1: Clear Existing Test Data (Optional)

Run these commands in the Cloudflare D1 console to clear existing test donations:

```sql
-- Clear existing test data
DELETE FROM donation_items;
DELETE FROM donations WHERE user_id = 'f5c8cf6be42d4da14cec091ca2ddb4df';
DELETE FROM user_charities WHERE user_id = 'f5c8cf6be42d4da14cec091ca2ddb4df';
```

## Step 2: Add Personal Charities

```sql
-- Add personal charities for test user
INSERT INTO user_charities (id, user_id, name, ein, category, is_approved) VALUES
('pc-001', 'f5c8cf6be42d4da14cec091ca2ddb4df', 'Local Community Garden', '99-1234567', 'Community', 1),
('pc-002', 'f5c8cf6be42d4da14cec091ca2ddb4df', 'Neighborhood Food Pantry', '99-2345678', 'Food', 1);
```

## Step 3: Verify Setup

```sql
-- Check personal charities
SELECT COUNT(*) as personal_charities FROM user_charities WHERE user_id = 'f5c8cf6be42d4da14cec091ca2ddb4df';

-- Check system charities exist
SELECT COUNT(*) as system_charities FROM charities;
```

## Step 4: Import CSV Data

1. Login to the application as test@example.com
2. Navigate to the Tools section
3. Click on "Import Donations"
4. Upload the file: `test_data_complete_v2.csv`
5. The import will:
   - Match charity names automatically
   - Parse detailed items from the ITEMS: format
   - Create proper donation_items records
   - Handle all donation types correctly

## CSV Format Details

### Basic Format
```csv
charity_name,donation_date,donation_type,amount,notes
```

### Items Donation with Details
For items donations with multiple items, use this format in the notes field:
```
ITEMS:[item_name|category|condition|quantity|total_value][next_item|category|condition|quantity|value]
```

Example:
```
Goodwill Industries,2025-01-06,items,385.00,"ITEMS:[Winter Coat|Clothing|excellent|1|85.00][Designer Dress|Clothing|very_good|1|120.00]"
```

### Categories
- Clothing
- Electronics
- Furniture
- Books
- Household
- Toys
- Sports
- Tools
- Accessories
- Appliances

### Conditions
- excellent
- very_good
- good
- fair (not tax deductible)

## Step 5: Verify Import

```sql
-- Check total donations imported
SELECT
    donation_type,
    COUNT(*) as count,
    SUM(amount) as total
FROM donations
WHERE user_id = 'f5c8cf6be42d4da14cec091ca2ddb4df'
GROUP BY donation_type;

-- Check items were created
SELECT
    d.id,
    d.amount,
    COUNT(di.id) as item_count
FROM donations d
LEFT JOIN donation_items di ON d.id = di.donation_id
WHERE d.donation_type = 'items'
AND d.user_id = 'f5c8cf6be42d4da14cec091ca2ddb4df'
GROUP BY d.id;

-- View sample items
SELECT * FROM donation_items LIMIT 10;
```

## Test Data Summary

The `test_data_complete_v2.csv` file contains:
- **9 Cash donations**: $2,185 total
- **6 Items donations**: $2,700 total with detailed items
- **4 Stock donations**: $11,550 total
- **3 Crypto donations**: $7,450 total
- **4 Mileage donations**: $84 total (600 miles)
- **2 Personal charity donations**: $500 total

**Total: 28 donations worth $24,469**

Each items donation includes 3-6 specific items with:
- Item names
- Categories
- Conditions
- Quantities
- Individual values

This provides comprehensive test data for all features of v2.0.0!