-- STEP 1: CREATE BACKUP TABLES
-- Run this FIRST to safely backup existing data
-- Date: 2025-01-21

-- Backup existing charities table
CREATE TABLE IF NOT EXISTS charities_backup_20250121 AS
SELECT * FROM charities;

-- Backup existing donations table
CREATE TABLE IF NOT EXISTS donations_backup_20250121 AS
SELECT * FROM donations;

-- Verify backups were created successfully
SELECT 'Charities backup count:' as info, COUNT(*) as count FROM charities_backup_20250121
UNION ALL
SELECT 'Donations backup count:', COUNT(*) FROM donations_backup_20250121;

-- If counts look good, proceed to STEP 2