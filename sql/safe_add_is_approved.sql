-- Safe migration to add is_approved column to user_charities table
-- Run these commands one by one in the Cloudflare D1 console

-- Step 1: Add the is_approved column
ALTER TABLE user_charities ADD COLUMN is_approved INTEGER DEFAULT 0;

-- Step 2: Create indexes (run after column is added)
CREATE INDEX IF NOT EXISTS idx_user_charities_user ON user_charities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_charities_name ON user_charities(name);
CREATE INDEX IF NOT EXISTS idx_user_charities_approved ON user_charities(is_approved);