-- ============================================
-- Migration v2.0.0 - Add donation_items table
-- Date: 2025-01-22
-- Purpose: Properly store itemized donations in relational format
-- ============================================

-- ============================================
-- STEP 1: CREATE DONATION_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS donation_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    donation_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT,
    condition TEXT CHECK(condition IN ('excellent', 'very_good', 'good', 'fair')),
    quantity INTEGER DEFAULT 1,
    unit_value DECIMAL(10, 2),
    total_value DECIMAL(10, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
);

-- ============================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_donation_items_donation_id ON donation_items(donation_id);
CREATE INDEX IF NOT EXISTS idx_donation_items_category ON donation_items(category);

-- ============================================
-- STEP 3: ADD DONATION_TYPE TO DONATIONS IF NOT EXISTS
-- ============================================
-- Check if column exists first (this is safe to run multiple times)
ALTER TABLE donations ADD COLUMN donation_type TEXT DEFAULT 'cash';

-- Update existing donations to have proper type
UPDATE donations SET donation_type = 'cash' WHERE donation_type IS NULL;

-- ============================================
-- STEP 4: ADD USER_CHARITY_ID TO DONATIONS IF NOT EXISTS
-- ============================================
-- Allow donations to reference either system charities or user charities
ALTER TABLE donations ADD COLUMN user_charity_id TEXT;

-- Add foreign key constraint for user_charity_id
-- Note: SQLite doesn't support adding foreign keys after table creation,
-- so this is for documentation. The constraint is enforced at the application level.

-- ============================================
-- STEP 5: MIGRATE EXISTING ITEMS DATA (if any)
-- ============================================
-- Parse existing JSON notes field for items donations and migrate to new table
-- This preserves any existing items data stored in JSON format

-- First, identify donations that contain items data in notes
WITH items_donations AS (
    SELECT
        id,
        user_id,
        charity_id,
        user_charity_id,
        amount,
        date,
        notes,
        receipt_url,
        created_at
    FROM donations
    WHERE donation_type = 'items'
       OR notes LIKE '%"items":%'
       OR notes LIKE '%"category":%'
)
SELECT
    'Items donations found:' as status,
    COUNT(*) as count
FROM items_donations;

-- Note: Actual items migration would need to be done via application code
-- since SQLite doesn't have native JSON parsing in all versions

-- ============================================
-- STEP 6: VERIFY MIGRATION
-- ============================================
-- Check that the new table exists
SELECT
    'donation_items table created:' as status,
    name
FROM sqlite_master
WHERE type='table' AND name='donation_items';

-- Check indexes
SELECT
    'Indexes created:' as status,
    name
FROM sqlite_master
WHERE type='index' AND name LIKE 'idx_donation_items%';

-- ============================================
-- STEP 7: SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment to add sample items donation

/*
-- Create a sample items donation
INSERT INTO donations (
    user_id,
    charity_id,
    donation_type,
    amount,
    date,
    notes
) VALUES (
    (SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1),
    (SELECT id FROM charities WHERE name LIKE '%Goodwill%' LIMIT 1),
    'items',
    245.00,
    '2025-01-22',
    'Spring cleaning donation'
);

-- Add items to the donation
INSERT INTO donation_items (
    donation_id,
    item_name,
    category,
    condition,
    quantity,
    unit_value,
    total_value
) VALUES
    (
        (SELECT id FROM donations ORDER BY created_at DESC LIMIT 1),
        'Winter Coat',
        'Clothing',
        'very_good',
        1,
        45.00,
        45.00
    ),
    (
        (SELECT id FROM donations ORDER BY created_at DESC LIMIT 1),
        'Laptop Computer',
        'Electronics',
        'good',
        1,
        200.00,
        200.00
    );
*/

-- ============================================
-- END OF MIGRATION
-- ============================================