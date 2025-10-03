-- ============================================
-- ItsDeductible Items Database Schema Migration
-- Version: 2.14.0
-- Date: 2024
-- ============================================

-- Step 1: Backup existing items table (if exists)
-- NOTE: Run this in Cloudflare D1 console to save current data
-- .output items_backup.csv
-- .mode csv
-- SELECT * FROM items;

-- Step 2: Drop old items table (after backing up!)
DROP TABLE IF EXISTS items;

-- Step 3: Create new items table with ItsDeductible structure
CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    category_id INTEGER,
    name TEXT NOT NULL,
    item_variant TEXT,
    description TEXT,

    -- Values (matching ItsDeductible structure)
    value_good DECIMAL(10,2),
    value_very_good DECIMAL(10,2),
    value_excellent DECIMAL(10,2),

    -- Metadata fields
    source_reference TEXT DEFAULT 'ItsDeductible 2024',
    date_of_valuation DATE DEFAULT '2024-01-01',

    -- Search optimization
    search_keywords TEXT,
    original_description TEXT,

    -- Legacy compatibility fields (if needed by existing code)
    category TEXT,  -- Category name for backward compatibility
    low_value DECIMAL(10,2),  -- Maps to value_good
    high_value DECIMAL(10,2), -- Maps to value_excellent

    -- System fields
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create categories table for ItsDeductible categories
DROP TABLE IF EXISTS item_categories;
CREATE TABLE item_categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    item_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Insert ItsDeductible categories
INSERT INTO item_categories (id, name, description, icon) VALUES
(1, 'Automotive Supplies', 'Car and vehicle accessories', '🚗'),
(2, 'Baby Gear', 'Baby and infant items', '👶'),
(3, 'Bedding & Linens', 'Sheets, blankets, and bedding', '🛏️'),
(4, 'Books, Movies & Music', 'Media and entertainment', '📚'),
(5, 'Cameras & Equipment', 'Photography and video equipment', '📷'),
(6, 'Clothing, Footwear & Accessories', 'All clothing items', '👔'),
(7, 'Computers & Office', 'Computer equipment and office supplies', '💻'),
(8, 'Furniture & Furnishings', 'Home and office furniture', '🪑'),
(9, 'Health & Beauty', 'Personal care and beauty products', '💄'),
(10, 'Home Audio & Video', 'Entertainment systems', '📺'),
(11, 'Housekeeping', 'Cleaning and household supplies', '🧹'),
(12, 'Kitchen', 'Cookware and kitchen items', '🍳'),
(13, 'Lawn & Patio', 'Outdoor and garden items', '🌿'),
(14, 'Luggage, Backpacks & Cases', 'Travel and storage bags', '💼'),
(15, 'Major Appliances', 'Large household appliances', '🔌'),
(16, 'Musical Instruments', 'Musical instruments and equipment', '🎵'),
(17, 'Pet Supplies', 'Pet care items', '🐕'),
(18, 'Phones & Communications', 'Phone and communication devices', '📱'),
(19, 'Sporting Goods', 'Sports equipment and gear', '⚽'),
(20, 'Tools & Hardware', 'Tools and hardware supplies', '🔧'),
(21, 'Toys, Games & Hobbies', 'Toys and hobby items', '🧸'),
(22, 'Portable Audio & Video', 'Portable entertainment devices', '🎧'),
(99, 'Miscellaneous', 'Other items not categorized', '📦');

-- Step 6: Create indexes for performance
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_search_keywords ON items(search_keywords);
CREATE INDEX idx_items_category ON items(category); -- For legacy queries
CREATE INDEX idx_items_values ON items(value_good, value_very_good, value_excellent);

-- Step 7: Create a view for backward compatibility
-- This allows old code expecting 'low_value' and 'high_value' to still work
CREATE VIEW IF NOT EXISTS items_legacy AS
SELECT
    id,
    name,
    category,
    value_good as low_value,
    value_excellent as high_value,
    description,
    created_at,
    updated_at
FROM items;

-- Step 8: Update statistics trigger
CREATE TRIGGER IF NOT EXISTS update_item_count
AFTER INSERT ON items
BEGIN
    UPDATE item_categories
    SET item_count = (
        SELECT COUNT(*)
        FROM items
        WHERE category_id = NEW.category_id
    )
    WHERE id = NEW.category_id;
END;

-- Step 9: Now run the ItsDeductible import
-- The items_database_itsdeductible.sql file has all INSERT statements
-- Run that file after this migration

-- Step 10: After import, populate backward compatibility fields
-- UPDATE items SET
--     category = (SELECT name FROM item_categories WHERE id = items.category_id),
--     low_value = value_good,
--     high_value = value_excellent
-- WHERE category IS NULL;

-- Verification queries:
-- SELECT COUNT(*) as total_items FROM items;
-- SELECT category_id, COUNT(*) FROM items GROUP BY category_id;
-- SELECT * FROM items WHERE name LIKE '%television%' LIMIT 5;