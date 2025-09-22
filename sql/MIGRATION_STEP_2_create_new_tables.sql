-- STEP 2: CREATE NEW TABLE STRUCTURE
-- Run this AFTER backing up data
-- Date: 2025-01-21

-- 1. Create system charities table (no user_id - these are system-wide)
CREATE TABLE IF NOT EXISTS charities_new (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    ein TEXT UNIQUE,  -- EIN should be unique for system charities
    category TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    website TEXT,
    description TEXT,
    phone TEXT,
    is_verified INTEGER DEFAULT 1,  -- Boolean: 1 = IRS verified
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

-- 2. Create user charities table
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
    status TEXT DEFAULT 'pending_review',  -- pending_review, approved, rejected
    review_notes TEXT,
    reviewed_by TEXT,
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Create new donations table that can reference either charity type
CREATE TABLE IF NOT EXISTS donations_new (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    charity_id TEXT,  -- References charities_new.id
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
    FOREIGN KEY (charity_id) REFERENCES charities_new(id) ON DELETE SET NULL,
    FOREIGN KEY (user_charity_id) REFERENCES user_charities(id) ON DELETE CASCADE,
    -- Ensure donation references exactly one charity
    CHECK ((charity_id IS NOT NULL AND user_charity_id IS NULL) OR
           (charity_id IS NULL AND user_charity_id IS NOT NULL))
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_charities_new_ein ON charities_new(ein);
CREATE INDEX IF NOT EXISTS idx_charities_new_state ON charities_new(state);
CREATE INDEX IF NOT EXISTS idx_charities_new_category ON charities_new(category);

CREATE INDEX IF NOT EXISTS idx_user_charities_user_id ON user_charities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_charities_status ON user_charities(status);

CREATE INDEX IF NOT EXISTS idx_donations_new_user_id ON donations_new(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_new_charity_id ON donations_new(charity_id);
CREATE INDEX IF NOT EXISTS idx_donations_new_user_charity_id ON donations_new(user_charity_id);

-- Verify tables were created
SELECT 'Tables created successfully' as status;