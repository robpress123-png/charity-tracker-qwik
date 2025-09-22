-- Migration to add is_approved column to existing user_charities table
-- This handles the case where the table exists but is missing the column

-- First, try to add the column (this will fail if it already exists, which is fine)
ALTER TABLE user_charities ADD COLUMN is_approved INTEGER DEFAULT 0;

-- Create indexes (these use IF NOT EXISTS so they're safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_user_charities_user ON user_charities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_charities_name ON user_charities(name);

-- Note: We can't create an index on is_approved until we know the column exists
-- So we'll create that index separately after the ALTER TABLE succeeds