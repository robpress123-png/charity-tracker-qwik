-- CHARITY CONVERSION LOGIC
-- When admin approves a user charity, it becomes a system charity

-- ============================================
-- ADMIN APPROVAL PROCESS
-- ============================================

-- Step 1: Admin approves a user charity
-- This procedure converts a user charity to a system charity
-- and updates all donations to point to the new system charity

DELIMITER //
CREATE PROCEDURE approve_user_charity(
    IN user_charity_id TEXT,
    IN admin_id TEXT
)
BEGIN
    DECLARE new_system_charity_id TEXT;
    DECLARE charity_ein TEXT;

    -- Generate new ID for system charity
    SET new_system_charity_id = lower(hex(randomblob(16)));

    -- Get the EIN to check for duplicates
    SELECT ein INTO charity_ein
    FROM user_charities
    WHERE id = user_charity_id;

    -- Check if charity with same EIN already exists in system
    IF charity_ein IS NOT NULL THEN
        SELECT id INTO new_system_charity_id
        FROM charities
        WHERE ein = charity_ein
        LIMIT 1;
    END IF;

    -- If no existing system charity found, create new one
    IF new_system_charity_id IS NULL THEN
        SET new_system_charity_id = lower(hex(randomblob(16)));

        -- Copy user charity to system charities table
        INSERT INTO charities (id, name, ein, category, address, city, state, zip_code, website, description, phone, is_verified, created_at)
        SELECT
            new_system_charity_id,
            name, ein, category, address, city, state, zip_code, website, description, phone,
            1, -- is_verified = true
            CURRENT_TIMESTAMP
        FROM user_charities
        WHERE id = user_charity_id;
    END IF;

    -- Update all donations from this user charity to point to system charity
    UPDATE donations
    SET charity_id = new_system_charity_id,
        user_charity_id = NULL
    WHERE user_charity_id = user_charity_id;

    -- Mark user charity as approved
    UPDATE user_charities
    SET status = 'approved',
        review_notes = 'Approved and converted to system charity',
        reviewed_by = admin_id,
        reviewed_at = CURRENT_TIMESTAMP
    WHERE id = user_charity_id;

END//
DELIMITER ;

-- ============================================
-- SQLITE VERSION (since SQLite doesn't support stored procedures)
-- Run these as a transaction in your application code
-- ============================================

-- 1. Admin clicks "Approve" on a user charity
-- 2. Application runs this SQL transaction:

BEGIN TRANSACTION;

-- Check if charity with same EIN exists in system
-- (Do this check in application code)

-- Insert into system charities table
INSERT INTO charities (name, ein, category, address, city, state, zip_code, website, description, phone, is_verified, created_at)
SELECT name, ein, category, address, city, state, zip_code, website, description, phone, 1, CURRENT_TIMESTAMP
FROM user_charities
WHERE id = ? AND status = 'pending_review';

-- Get the new system charity ID (last_insert_rowid() in SQLite)
-- Store this in application variable: new_system_charity_id

-- Update all donations to point to the new system charity
UPDATE donations
SET charity_id = ?,  -- new_system_charity_id
    user_charity_id = NULL
WHERE user_charity_id = ?;  -- original user_charity_id

-- Mark user charity as approved
UPDATE user_charities
SET status = 'approved',
    review_notes = 'Approved and converted to system charity',
    reviewed_by = ?,  -- admin_id
    reviewed_at = CURRENT_TIMESTAMP
WHERE id = ?;  -- user_charity_id

COMMIT;

-- ============================================
-- ADMIN VIEWS FOR REVIEW QUEUE
-- ============================================

-- View for pending charities with usage statistics
CREATE VIEW admin_charity_review_queue AS
SELECT
    uc.id,
    uc.name,
    uc.ein,
    uc.category,
    uc.city,
    uc.state,
    uc.description,
    uc.created_at,
    u.email as submitted_by,
    u.name as user_name,
    COUNT(DISTINCT d.id) as donation_count,
    COUNT(DISTINCT d.user_id) as unique_users,
    SUM(d.amount) as total_donations,
    -- Check if EIN already exists in system
    CASE WHEN EXISTS (SELECT 1 FROM charities c WHERE c.ein = uc.ein)
        THEN 'Duplicate EIN'
        ELSE 'New'
    END as ein_status
FROM user_charities uc
JOIN users u ON uc.user_id = u.id
LEFT JOIN donations d ON d.user_charity_id = uc.id
WHERE uc.status = 'pending_review'
GROUP BY uc.id
ORDER BY donation_count DESC, uc.created_at ASC;

-- ============================================
-- USER EXPERIENCE FLOW
-- ============================================

-- 1. User searches for charity, not found
-- 2. User clicks "Add Custom Charity"
-- 3. INSERT INTO user_charities with status = 'pending_review'
-- 4. User can IMMEDIATELY use this charity for donations
-- 5. Admin sees it in review queue
-- 6. If approved, it becomes system charity
-- 7. User's donations automatically reference the system charity
-- 8. Other users can now find and use this charity

-- ============================================
-- API ENDPOINT LOGIC (pseudocode)
-- ============================================

/*
// When fetching charities for dropdown:
function getCharitiesForUser(userId) {
    // Get system charities
    systemCharities = query("SELECT * FROM charities WHERE name LIKE ?")

    // Get user's personal charities (active and pending)
    userCharities = query("
        SELECT * FROM user_charities
        WHERE user_id = ?
        AND status IN ('active', 'pending_review')
    ")

    // Combine and return (mark which are personal vs system)
    return [...systemCharities, ...userCharities.map(c => ({...c, isPersonal: true}))]
}

// When user adds a custom charity:
function addCustomCharity(userId, charityData) {
    // Insert with pending_review status
    query("
        INSERT INTO user_charities (user_id, name, ein, ..., status)
        VALUES (?, ?, ?, ..., 'pending_review')
    ")

    // Return success - user can use immediately
    return { success: true, message: "Charity added and available for use" }
}
*/