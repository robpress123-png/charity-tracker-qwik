-- ============================================
-- Clear existing test data and prepare for v2.0.0
-- ============================================

-- Step 1: Clear existing donations and related data
DELETE FROM donation_items;
DELETE FROM donations;
DELETE FROM user_charities;

-- Step 2: Verify clean slate
SELECT
    'Donations cleared:' as status,
    COUNT(*) as count
FROM donations;

SELECT
    'Donation items cleared:' as status,
    COUNT(*) as count
FROM donation_items;

SELECT
    'User charities cleared:' as status,
    COUNT(*) as count
FROM user_charities;

-- Step 3: Add some personal charities for the test user
INSERT INTO user_charities (id, user_id, name, ein, category, is_approved) VALUES
('pc-001', 'f5c8cf6be42d4da14cec091ca2ddb4df', 'Local Community Garden', '99-1234567', 'Community', 1),
('pc-002', 'f5c8cf6be42d4da14cec091ca2ddb4df', 'Neighborhood Food Pantry', '99-2345678', 'Food', 1),
('pc-003', 'f5c8cf6be42d4da14cec091ca2ddb4df', 'Youth Sports League', '99-3456789', 'Recreation', 0);

-- Step 4: Verify personal charities added
SELECT COUNT(*) as personal_charities FROM user_charities;

-- Step 5: Get first 10 system charities for testing
SELECT id, name, category FROM charities LIMIT 10;