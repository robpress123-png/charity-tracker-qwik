-- FRESH START MIGRATION - Clean slate approach
-- Since charities table is already gone, we'll start fresh
-- Date: 2025-01-21

-- ============================================
-- STEP 1: CLEAN UP - Remove orphaned donations
-- ============================================
DELETE FROM donations;

-- Verify donations are cleared
SELECT 'Donations cleared:' as status, COUNT(*) as count FROM donations;

-- ============================================
-- STEP 2: CREATE NEW CHARITIES TABLE (System-wide)
-- ============================================
-- No user_id - these are available to ALL users
CREATE TABLE IF NOT EXISTS charities (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    ein TEXT UNIQUE,
    category TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    website TEXT,
    description TEXT,
    phone TEXT,
    is_verified INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

-- ============================================
-- STEP 3: CREATE USER_CHARITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_charities (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    ein TEXT,
    category TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    website TEXT,
    description TEXT,
    phone TEXT,
    status TEXT DEFAULT 'pending_review',
    review_notes TEXT,
    reviewed_by TEXT,
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- STEP 4: UPDATE DONATIONS TABLE STRUCTURE
-- ============================================
-- First, drop the existing donations table
DROP TABLE IF EXISTS donations;

-- Recreate with new structure
CREATE TABLE donations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    charity_id TEXT,              -- References system charity
    user_charity_id TEXT,          -- OR references user charity
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    receipt_url TEXT,
    notes TEXT,
    donation_type TEXT DEFAULT 'cash',
    miles_driven REAL,
    mileage_rate REAL,
    mileage_purpose TEXT,
    quantity REAL,
    cost_basis REAL,
    fair_market_value REAL,
    item_description TEXT,
    estimated_value REAL,
    crypto_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE SET NULL,
    FOREIGN KEY (user_charity_id) REFERENCES user_charities(id) ON DELETE CASCADE,
    CHECK ((charity_id IS NOT NULL AND user_charity_id IS NULL) OR
           (charity_id IS NULL AND user_charity_id IS NOT NULL))
);

-- ============================================
-- STEP 5: CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_charities_ein ON charities(ein);
CREATE INDEX IF NOT EXISTS idx_charities_state ON charities(state);
CREATE INDEX IF NOT EXISTS idx_charities_category ON charities(category);

CREATE INDEX IF NOT EXISTS idx_user_charities_user_id ON user_charities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_charities_status ON user_charities(status);

CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_charity_id ON donations(charity_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_charity_id ON donations(user_charity_id);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(date);

-- ============================================
-- STEP 6: VERIFY NEW STRUCTURE
-- ============================================
SELECT 'Tables created:' as status;
SELECT name FROM sqlite_master WHERE type='table' AND name IN ('charities', 'user_charities', 'donations');

-- Check charities has no user_id
SELECT sql FROM sqlite_master WHERE name = 'charities';

-- Ready for charity import!