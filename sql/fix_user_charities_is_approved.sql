-- Migration to ensure is_approved column exists in user_charities table
-- This migration can be run safely multiple times

-- First, check if the table exists and create it if not
CREATE TABLE IF NOT EXISTS user_charities (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_charities_user ON user_charities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_charities_approved ON user_charities(is_approved);
CREATE INDEX IF NOT EXISTS idx_user_charities_name ON user_charities(name);

-- Note: SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS
-- So if the table existed without is_approved column, you'll need to:
-- 1. Create a new table with the correct schema
-- 2. Copy the data
-- 3. Drop the old table
-- 4. Rename the new table

-- Alternative approach for existing table without is_approved:
-- This will only work if the column doesn't exist yet
-- ALTER TABLE user_charities ADD COLUMN is_approved INTEGER DEFAULT 0;