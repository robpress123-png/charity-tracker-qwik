-- STEP 3: MIGRATE EXISTING DATA
-- Run this AFTER creating new tables
-- Date: 2025-01-21

-- 1. Copy existing charities to new system charities table (removing user_id)
INSERT INTO charities_new (id, name, ein, category, address, city, state, zip_code, website, description, phone, created_at)
SELECT
    id,
    name,
    ein,
    category,
    address,
    city,
    state,
    zip_code,
    website,
    description,
    phone,
    created_at
FROM charities;

-- 2. Migrate existing donations to reference system charities
INSERT INTO donations_new (
    id, user_id, charity_id, user_charity_id, amount, date,
    receipt_url, notes, donation_type, miles_driven, mileage_rate,
    mileage_purpose, quantity, cost_basis, fair_market_value,
    item_description, estimated_value, crypto_type, created_at
)
SELECT
    id,
    user_id,
    charity_id,  -- Keep reference to system charity
    NULL,        -- No user charity reference for existing donations
    amount,
    date,
    receipt_url,
    notes,
    donation_type,
    miles_driven,
    mileage_rate,
    mileage_purpose,
    quantity,
    cost_basis,
    fair_market_value,
    item_description,
    estimated_value,
    crypto_type,
    created_at
FROM donations;

-- 3. Verify migration counts
SELECT 'Original charities:' as info, COUNT(*) as count FROM charities
UNION ALL
SELECT 'Migrated charities:', COUNT(*) FROM charities_new
UNION ALL
SELECT 'Original donations:', COUNT(*) FROM donations
UNION ALL
SELECT 'Migrated donations:', COUNT(*) FROM donations_new;

-- If counts match, proceed to STEP 4