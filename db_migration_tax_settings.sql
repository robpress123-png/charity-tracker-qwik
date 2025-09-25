-- Migration script to add tax settings columns to users table
-- Run this in Cloudflare D1 Console

-- Add address fields if they don't exist
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN city TEXT;
ALTER TABLE users ADD COLUMN state TEXT;
ALTER TABLE users ADD COLUMN zip_code TEXT;

-- Add tax settings columns
ALTER TABLE users ADD COLUMN tax_bracket REAL;
ALTER TABLE users ADD COLUMN filing_status TEXT;
ALTER TABLE users ADD COLUMN income_range TEXT;

-- Update test user with default values
UPDATE users
SET filing_status = 'single',
    income_range = '50000',
    tax_bracket = 0.22
WHERE email = 'test@example.com' OR email = 'test2@example.com';