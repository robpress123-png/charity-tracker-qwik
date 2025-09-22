-- REDESIGNED CHARITY ARCHITECTURE
-- Separates system charities from user charities for better scalability

-- ============================================
-- STEP 1: Drop user_id from system charities table
-- ============================================
-- System charities are IRS-verified and available to ALL users
-- No user_id needed - these are system-wide resources

CREATE TABLE charities_system (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    ein TEXT UNIQUE NOT NULL,  -- EIN should be unique for system charities
    category TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    website TEXT,
    description TEXT,
    phone TEXT,
    is_verified BOOLEAN DEFAULT 1,  -- All system charities are IRS-verified
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

-- ============================================
-- STEP 2: Create user_charities table
-- ============================================
-- Personal charities created by users
-- Can be submitted for review to add to system table

CREATE TABLE user_charities (
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
    status TEXT DEFAULT 'active',  -- active, pending_review, approved, rejected
    review_notes TEXT,  -- Admin notes about why approved/rejected
    reviewed_by TEXT,  -- Admin who reviewed
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- STEP 3: Update donations table to reference both
-- ============================================
-- Donations can reference either system or user charities

CREATE TABLE donations_new (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    charity_id TEXT,  -- References charities_system.id
    user_charity_id TEXT,  -- References user_charities.id
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
    FOREIGN KEY (charity_id) REFERENCES charities_system(id) ON DELETE SET NULL,
    FOREIGN KEY (user_charity_id) REFERENCES user_charities(id) ON DELETE CASCADE,
    -- Ensure donation references exactly one charity
    CHECK ((charity_id IS NOT NULL AND user_charity_id IS NULL) OR
           (charity_id IS NULL AND user_charity_id IS NOT NULL))
);

-- ============================================
-- STEP 4: Create review queue view for admins
-- ============================================
CREATE VIEW charity_review_queue AS
SELECT
    uc.*,
    u.email as submitted_by_email,
    u.name as submitted_by_name,
    (SELECT COUNT(*) FROM donations_new d WHERE d.user_charity_id = uc.id) as donation_count
FROM user_charities uc
JOIN users u ON uc.user_id = u.id
WHERE uc.status = 'pending_review'
ORDER BY uc.created_at ASC;

-- ============================================
-- STEP 5: Create indexes for performance
-- ============================================
CREATE INDEX idx_charities_system_ein ON charities_system(ein);
CREATE INDEX idx_charities_system_state ON charities_system(state);
CREATE INDEX idx_charities_system_category ON charities_system(category);

CREATE INDEX idx_user_charities_user_id ON user_charities(user_id);
CREATE INDEX idx_user_charities_status ON user_charities(status);
CREATE INDEX idx_user_charities_ein ON user_charities(ein);

CREATE INDEX idx_donations_user_id ON donations_new(user_id);
CREATE INDEX idx_donations_charity_id ON donations_new(charity_id);
CREATE INDEX idx_donations_user_charity_id ON donations_new(user_charity_id);
CREATE INDEX idx_donations_date ON donations_new(date);

-- ============================================
-- MIGRATION STEPS (Run these after creating new tables)
-- ============================================

-- 1. Copy existing charities to system table (remove user_id)
INSERT INTO charities_system (id, name, ein, category, address, city, state, zip_code, website, description, phone, created_at)
SELECT id, name, ein, category, address, city, state, zip_code, website, description, phone, created_at
FROM charities;

-- 2. Migrate existing donations
INSERT INTO donations_new
SELECT
    id, user_id, charity_id, NULL as user_charity_id, amount, date, receipt_url, notes,
    donation_type, miles_driven, mileage_rate, mileage_purpose, quantity, cost_basis,
    fair_market_value, item_description, estimated_value, crypto_type, created_at
FROM donations;

-- 3. Drop old tables and rename new ones
DROP TABLE donations;
ALTER TABLE donations_new RENAME TO donations;

DROP TABLE charities;
ALTER TABLE charities_system RENAME TO charities;

-- ============================================
-- BENEFITS OF THIS DESIGN:
-- ============================================
-- 1. Clean separation: IRS-verified vs user-created charities
-- 2. Scalable: No mixing of system and user data
-- 3. Review queue: Easy admin review process
-- 4. Performance: Smaller, focused tables with proper indexes
-- 5. Data integrity: System charities remain pristine
-- 6. Flexibility: Users can have private charities
-- 7. Growth path: Approved user charities can be promoted to system charities