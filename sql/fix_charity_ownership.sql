-- Fix charity ownership model
-- Charities should be system-wide, not owned by individual users

-- Step 1: Make user_id nullable for charities
-- This allows system-wide charities that all users can access
-- Run this in Cloudflare D1 console:

-- First, we need to recreate the table since SQLite doesn't support ALTER COLUMN
-- Save existing data
CREATE TABLE charities_new (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT,  -- Now NULLABLE - NULL means system charity
    name TEXT NOT NULL,
    ein TEXT,
    category TEXT,
    website TEXT,
    description TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Copy data from old table
INSERT INTO charities_new (id, user_id, name, ein, category, website, description, address, city, state, zip_code, phone, created_at)
SELECT id, user_id, name, ein, category, website, description, address, city, state, zip_code, phone, created_at
FROM charities;

-- Drop old table
DROP TABLE charities;

-- Rename new table
ALTER TABLE charities_new RENAME TO charities;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_charities_ein ON charities(ein);
CREATE INDEX IF NOT EXISTS idx_charities_state ON charities(state);
CREATE INDEX IF NOT EXISTS idx_charities_city ON charities(city);
CREATE INDEX IF NOT EXISTS idx_charities_user_id ON charities(user_id);

-- Step 2: Update all existing charities to be system-wide (no owner)
UPDATE charities SET user_id = NULL WHERE user_id IS NOT NULL;

-- Step 3: Create admin user if not exists
INSERT OR IGNORE INTO users (id, email, password, name, plan, created_at)
VALUES ('admin-system', 'admin@charitytracker.com', 'admin-password-hash', 'System Administrator', 'admin', CURRENT_TIMESTAMP);

-- Note: In the application:
-- - System charities (user_id = NULL) are available to ALL users
-- - User-created charities (user_id = specific user) are private to that user
-- - Admin can manage all system charities