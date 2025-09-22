-- STEP 4: SWITCH TO NEW TABLES
-- Run this ONLY AFTER verifying migration worked correctly
-- Date: 2025-01-21

-- 1. Drop old tables
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS charities;

-- 2. Rename new tables to original names
ALTER TABLE charities_new RENAME TO charities;
ALTER TABLE donations_new RENAME TO donations;

-- 3. Verify final structure
SELECT 'Final table structure:' as info;

-- Check charities table has no user_id
SELECT sql FROM sqlite_master WHERE name = 'charities';

-- Check donations table has both charity_id types
SELECT sql FROM sqlite_master WHERE name = 'donations';

-- Check user_charities exists
SELECT sql FROM sqlite_master WHERE name = 'user_charities';

-- 4. Final counts
SELECT 'System charities count:' as info, COUNT(*) as count FROM charities
UNION ALL
SELECT 'User charities count:', COUNT(*) FROM user_charities
UNION ALL
SELECT 'Donations count:', COUNT(*) FROM donations;

-- SUCCESS! Tables have been migrated to the new structure