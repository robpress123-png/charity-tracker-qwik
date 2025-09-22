-- ============================================
-- Sample Data for v2.0.0 Testing
-- Date: 2025-01-22
-- Purpose: Test donation_items table and all donation types
-- ============================================

-- ============================================
-- STEP 1: Create test user if not exists
-- ============================================
INSERT OR IGNORE INTO users (email, password, name, plan)
VALUES ('test@example.com', 'password123', 'Test User', 'premium');

-- Get the user ID for reference
SELECT id, email FROM users WHERE email = 'test@example.com';

-- ============================================
-- STEP 2: Sample Cash Donations (5 donations)
-- ============================================
INSERT INTO donations (user_id, charity_id, donation_type, amount, date, notes)
SELECT
    u.id,
    c.id,
    'cash',
    CASE
        WHEN random() % 5 = 0 THEN 250.00
        WHEN random() % 5 = 1 THEN 100.00
        WHEN random() % 5 = 2 THEN 500.00
        WHEN random() % 5 = 3 THEN 75.00
        ELSE 150.00
    END,
    date('2025-01-' || printf('%02d', (abs(random()) % 22) + 1)),
    '{"notes": "Cash donation - tax deductible", "donation_type": "cash"}'
FROM users u, charities c
WHERE u.email = 'test@example.com'
AND c.name IN (
    SELECT name FROM charities
    WHERE name LIKE '%Red Cross%'
    OR name LIKE '%Salvation Army%'
    OR name LIKE '%Goodwill%'
    OR name LIKE '%United Way%'
    OR name LIKE '%Food Bank%'
    LIMIT 5
)
LIMIT 5;

-- ============================================
-- STEP 3: Sample Stock Donations (3 donations)
-- ============================================
INSERT INTO donations (user_id, charity_id, donation_type, amount, date, notes)
SELECT
    u.id,
    c.id,
    'stock',
    CASE
        WHEN random() % 3 = 0 THEN 2500.00
        WHEN random() % 3 = 1 THEN 1000.00
        ELSE 1750.00
    END,
    date('2025-01-' || printf('%02d', (abs(random()) % 22) + 1)),
    json_object(
        'donation_type', 'stock',
        'stock_name',
        CASE
            WHEN random() % 3 = 0 THEN 'Apple Inc.'
            WHEN random() % 3 = 1 THEN 'Microsoft Corp.'
            ELSE 'Amazon.com Inc.'
        END,
        'stock_symbol',
        CASE
            WHEN random() % 3 = 0 THEN 'AAPL'
            WHEN random() % 3 = 1 THEN 'MSFT'
            ELSE 'AMZN'
        END,
        'shares_donated', 10,
        'cost_basis', 500.00,
        'fair_market_value', 1500.00,
        'notes', 'Long-term capital gains eligible'
    )
FROM users u, charities c
WHERE u.email = 'test@example.com'
AND c.name LIKE '%Hospital%' OR c.name LIKE '%Foundation%'
LIMIT 3;

-- ============================================
-- STEP 4: Sample Crypto Donations (2 donations)
-- ============================================
INSERT INTO donations (user_id, charity_id, donation_type, amount, date, notes)
VALUES
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    (SELECT id FROM charities WHERE name LIKE '%Education%' LIMIT 1),
    'crypto',
    3500.00,
    '2025-01-15',
    json_object(
        'donation_type', 'crypto',
        'crypto_name', 'Bitcoin',
        'crypto_symbol', 'BTC',
        'crypto_quantity', 0.05,
        'crypto_price_per_unit', 70000.00,
        'crypto_exchange', 'Coinbase',
        'crypto_cost_basis', 1000.00,
        'crypto_holding_period', 'long_term',
        'notes', 'Cryptocurrency donation - held over 1 year'
    )
),
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    (SELECT id FROM charities WHERE name LIKE '%Animal%' OR name LIKE '%Wildlife%' LIMIT 1),
    'crypto',
    1200.00,
    '2025-01-18',
    json_object(
        'donation_type', 'crypto',
        'crypto_name', 'Ethereum',
        'crypto_symbol', 'ETH',
        'crypto_quantity', 0.5,
        'crypto_price_per_unit', 2400.00,
        'crypto_exchange', 'Binance',
        'crypto_cost_basis', 500.00,
        'crypto_holding_period', 'short_term',
        'notes', 'ETH donation - short term holding'
    )
);

-- ============================================
-- STEP 5: Sample Mileage Donations (3 donations)
-- ============================================
INSERT INTO donations (user_id, charity_id, donation_type, amount, date, notes)
VALUES
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    (SELECT id FROM charities WHERE name LIKE '%Church%' LIMIT 1),
    'mileage',
    7.00,
    '2025-01-10',
    json_object(
        'donation_type', 'mileage',
        'miles_driven', 50,
        'mileage_rate', 0.14,
        'mileage_purpose', 'Volunteer delivery service',
        'notes', 'Weekly food delivery for church pantry'
    )
),
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    (SELECT id FROM charities WHERE name LIKE '%Habitat%' LIMIT 1),
    'mileage',
    28.00,
    '2025-01-12',
    json_object(
        'donation_type', 'mileage',
        'miles_driven', 200,
        'mileage_rate', 0.14,
        'mileage_purpose', 'Construction volunteer work',
        'notes', 'Weekend build project - round trip'
    )
),
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    (SELECT id FROM charities WHERE name LIKE '%School%' OR name LIKE '%Academy%' LIMIT 1),
    'mileage',
    14.00,
    '2025-01-20',
    json_object(
        'donation_type', 'mileage',
        'miles_driven', 100,
        'mileage_rate', 0.14,
        'mileage_purpose', 'Tutoring volunteer',
        'notes', 'Weekly tutoring sessions'
    )
);

-- ============================================
-- STEP 6: Sample Items Donations (3 donations with items)
-- ============================================

-- Items Donation 1: Clothing donation to Goodwill
INSERT INTO donations (id, user_id, charity_id, donation_type, amount, date, notes)
VALUES
(
    'items-donation-001',
    (SELECT id FROM users WHERE email = 'test@example.com'),
    (SELECT id FROM charities WHERE name LIKE '%Goodwill%' LIMIT 1),
    'items',
    245.00,
    '2025-01-08',
    json_object(
        'donation_type', 'items',
        'notes', 'Spring cleaning donation - clothing and household items'
    )
);

-- Add items for donation 1
INSERT INTO donation_items (donation_id, item_name, category, condition, quantity, unit_value, total_value)
VALUES
('items-donation-001', 'Winter Coat', 'Clothing', 'very_good', 1, 45.00, 45.00),
('items-donation-001', 'Mens Suit', 'Clothing', 'excellent', 1, 80.00, 80.00),
('items-donation-001', 'Dress Shirts', 'Clothing', 'good', 5, 12.00, 60.00),
('items-donation-001', 'Leather Shoes', 'Clothing', 'very_good', 2, 25.00, 50.00),
('items-donation-001', 'Womens Handbag', 'Accessories', 'good', 1, 10.00, 10.00);

-- Items Donation 2: Electronics and furniture
INSERT INTO donations (id, user_id, charity_id, donation_type, amount, date, notes)
VALUES
(
    'items-donation-002',
    (SELECT id FROM users WHERE email = 'test@example.com'),
    (SELECT id FROM charities WHERE name LIKE '%Salvation Army%' LIMIT 1),
    'items',
    520.00,
    '2025-01-14',
    json_object(
        'donation_type', 'items',
        'notes', 'Office equipment and furniture donation'
    )
);

-- Add items for donation 2
INSERT INTO donation_items (donation_id, item_name, category, condition, quantity, unit_value, total_value)
VALUES
('items-donation-002', 'Laptop Computer', 'Electronics', 'good', 1, 200.00, 200.00),
('items-donation-002', 'Office Chair', 'Furniture', 'very_good', 2, 75.00, 150.00),
('items-donation-002', 'Desk Lamp', 'Household', 'excellent', 3, 20.00, 60.00),
('items-donation-002', 'Printer', 'Electronics', 'good', 1, 50.00, 50.00),
('items-donation-002', 'File Cabinet', 'Furniture', 'good', 1, 60.00, 60.00);

-- Items Donation 3: Books and toys
INSERT INTO donations (id, user_id, charity_id, donation_type, amount, date, notes)
VALUES
(
    'items-donation-003',
    (SELECT id FROM users WHERE email = 'test@example.com'),
    (SELECT id FROM charities WHERE name LIKE '%Library%' OR name LIKE '%School%' LIMIT 1),
    'items',
    185.00,
    '2025-01-19',
    json_object(
        'donation_type', 'items',
        'notes', 'Books and educational materials donation'
    )
);

-- Add items for donation 3
INSERT INTO donation_items (donation_id, item_name, category, condition, quantity, unit_value, total_value)
VALUES
('items-donation-003', 'Hardcover Books', 'Books', 'excellent', 20, 3.00, 60.00),
('items-donation-003', 'Childrens Books', 'Books', 'very_good', 30, 2.00, 60.00),
('items-donation-003', 'Educational Games', 'Toys', 'good', 5, 8.00, 40.00),
('items-donation-003', 'Art Supplies', 'Household', 'excellent', 1, 25.00, 25.00);

-- ============================================
-- STEP 7: Add personal charities for testing
-- ============================================
INSERT OR IGNORE INTO user_charities (user_id, name, ein, category, is_approved)
VALUES
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    'Local Community Garden',
    '99-1234567',
    'Community',
    1
),
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    'Neighborhood Food Pantry',
    '99-2345678',
    'Food',
    1
),
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    'Youth Sports League',
    '99-3456789',
    'Recreation',
    0
);

-- ============================================
-- STEP 8: Add donation to personal charity
-- ============================================
INSERT INTO donations (user_id, user_charity_id, donation_type, amount, date, notes)
VALUES
(
    (SELECT id FROM users WHERE email = 'test@example.com'),
    (SELECT id FROM user_charities WHERE name = 'Local Community Garden' LIMIT 1),
    'cash',
    300.00,
    '2025-01-21',
    json_object(
        'donation_type', 'cash',
        'notes', 'Annual membership and donation to community garden'
    )
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count donations by type
SELECT
    donation_type,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM donations
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
GROUP BY donation_type;

-- Count items in donation_items table
SELECT COUNT(*) as total_items FROM donation_items;

-- Verify items donations have related items
SELECT
    d.id,
    d.amount,
    COUNT(di.id) as item_count,
    SUM(di.total_value) as items_total
FROM donations d
LEFT JOIN donation_items di ON d.id = di.donation_id
WHERE d.donation_type = 'items'
GROUP BY d.id;

-- Total donations for current year
SELECT
    COUNT(*) as total_donations,
    SUM(amount) as total_amount
FROM donations
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
AND strftime('%Y', date) = '2025';