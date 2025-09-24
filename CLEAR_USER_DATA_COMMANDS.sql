-- Clear User Data Commands for Testing
-- Run these in the D1 Console before importing new test data

-- ============================================
-- IMPORTANT: Get User IDs first
-- ============================================
-- Run this to get the user IDs:
SELECT id, email FROM users WHERE email IN ('user2@test.com', 'user3@test.com', 'user4@test.com', 'user5@test.com');

-- ============================================
-- Clear User 2 Data (replace USER_ID_2 with actual ID)
-- ============================================
-- Delete donation items first (foreign key constraint)
DELETE FROM donation_items WHERE donation_id IN (SELECT id FROM donations WHERE user_id = 'USER_ID_2');

-- Delete all donations
DELETE FROM donations WHERE user_id = 'USER_ID_2';

-- Delete personal charities
DELETE FROM user_charities WHERE user_id = 'USER_ID_2';

-- Clear tax settings
UPDATE users SET tax_bracket = NULL, filing_status = NULL WHERE id = 'USER_ID_2';

-- ============================================
-- Clear User 3 Data (replace USER_ID_3 with actual ID)
-- ============================================
DELETE FROM donation_items WHERE donation_id IN (SELECT id FROM donations WHERE user_id = 'USER_ID_3');
DELETE FROM donations WHERE user_id = 'USER_ID_3';
DELETE FROM user_charities WHERE user_id = 'USER_ID_3';
UPDATE users SET tax_bracket = NULL, filing_status = NULL WHERE id = 'USER_ID_3';

-- ============================================
-- Clear User 4 Data (replace USER_ID_4 with actual ID)
-- ============================================
DELETE FROM donation_items WHERE donation_id IN (SELECT id FROM donations WHERE user_id = 'USER_ID_4');
DELETE FROM donations WHERE user_id = 'USER_ID_4';
DELETE FROM user_charities WHERE user_id = 'USER_ID_4';
UPDATE users SET tax_bracket = NULL, filing_status = NULL WHERE id = 'USER_ID_4';

-- ============================================
-- Clear User 5 Data (replace USER_ID_5 with actual ID)
-- ============================================
DELETE FROM donation_items WHERE donation_id IN (SELECT id FROM donations WHERE user_id = 'USER_ID_5');
DELETE FROM donations WHERE user_id = 'USER_ID_5';
DELETE FROM user_charities WHERE user_id = 'USER_ID_5';
UPDATE users SET tax_bracket = NULL, filing_status = NULL WHERE id = 'USER_ID_5';

-- ============================================
-- Verify Data is Cleared
-- ============================================
-- Check donation counts (should be 0 for cleared users):
SELECT u.email, COUNT(d.id) as donation_count
FROM users u
LEFT JOIN donations d ON u.id = d.user_id
WHERE u.email IN ('user2@test.com', 'user3@test.com', 'user4@test.com', 'user5@test.com')
GROUP BY u.email;

-- Check personal charities (should be 0 for cleared users):
SELECT u.email, COUNT(uc.id) as personal_charity_count
FROM users u
LEFT JOIN user_charities uc ON u.id = uc.user_id
WHERE u.email IN ('user2@test.com', 'user3@test.com', 'user4@test.com', 'user5@test.com')
GROUP BY u.email;

-- ============================================
-- After Clearing, Import New Test Data:
-- ============================================
-- 1. User 2: test_user2_diverse_60.csv (Medical/Health focus)
-- 2. User 3: test_user3_diverse_60.csv (Arts/Culture focus)
-- 3. User 4: test_user4_diverse_60.csv (Youth/Food Security focus)
-- 4. User 5: test_user5_diverse_60.csv (Animals/Environment focus)