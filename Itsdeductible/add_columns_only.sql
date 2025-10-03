-- ============================================
-- Alternative: Add Columns to Existing Items Table
-- Use this if you want to preserve existing structure
-- ============================================

-- Add new columns to existing items table
ALTER TABLE items ADD COLUMN item_variant TEXT;
ALTER TABLE items ADD COLUMN value_good DECIMAL(10,2);
ALTER TABLE items ADD COLUMN value_very_good DECIMAL(10,2);
ALTER TABLE items ADD COLUMN value_excellent DECIMAL(10,2);
ALTER TABLE items ADD COLUMN source_reference TEXT DEFAULT 'ItsDeductible 2024';
ALTER TABLE items ADD COLUMN date_of_valuation DATE DEFAULT '2024-01-01';
ALTER TABLE items ADD COLUMN search_keywords TEXT;
ALTER TABLE items ADD COLUMN original_description TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_items_search ON items(search_keywords);
CREATE INDEX IF NOT EXISTS idx_items_variant ON items(item_variant);

-- After adding columns, you can:
-- 1. Import ItsDeductible data
-- 2. Map values: value_good -> low_value, value_excellent -> high_value
UPDATE items SET
    low_value = COALESCE(value_good, low_value),
    high_value = COALESCE(value_excellent, high_value)
WHERE value_good IS NOT NULL;