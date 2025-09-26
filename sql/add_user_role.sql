-- Add role field to users table for proper admin authentication
-- Run this in Cloudflare D1 console

-- Add role column to users table (default to 'user')
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin'));

-- Set the test account as admin for testing
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';

-- You can also promote other users to admin as needed:
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';