-- Complete rebuild of user_charities table with all required columns
-- This is the safest approach when ALTER TABLE might fail

-- Step 1: Rename existing table (if it exists)
ALTER TABLE user_charities RENAME TO user_charities_backup;

-- Step 2: Create new table with correct schema
CREATE TABLE user_charities (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    ein TEXT,
    category TEXT DEFAULT 'Other',
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    phone TEXT,
    website TEXT,
    description TEXT,
    is_approved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name),
    UNIQUE(user_id, ein)
);

-- Step 3: Copy data from backup table (only columns that exist)
INSERT INTO user_charities (
    id, user_id, name, ein, category,
    address, city, state, zip_code,
    phone, website, description, created_at, updated_at
)
SELECT
    id, user_id, name, ein, category,
    address, city, state, zip_code,
    phone, website, description, created_at, updated_at
FROM user_charities_backup;

-- Step 4: Drop the backup table
DROP TABLE user_charities_backup;

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_charities_user ON user_charities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_charities_approved ON user_charities(is_approved);
CREATE INDEX IF NOT EXISTS idx_user_charities_name ON user_charities(name);