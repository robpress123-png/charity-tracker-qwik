-- Test donations for 2025
-- Run this on your D1 database to add test data

INSERT INTO donations (user_id, charity_id, amount, donation_date, donation_type, notes, item_description, miles_driven, mileage_rate, mileage_purpose) VALUES
('test-user-id', '1', 500.00, '2025-01-15', 'cash', 'New Year donation to Red Cross', NULL, NULL, NULL, NULL),
('test-user-id', '2', 1200.00, '2025-01-20', 'stock', 'Apple stock donation', NULL, NULL, NULL, NULL),
('test-user-id', '3', 150.00, '2025-02-01', 'cash', 'Monthly contribution', NULL, NULL, NULL, NULL),
('test-user-id', '4', 250.00, '2025-02-14', 'items', 'Clothing donation', 'Winter coats (3), Jeans (5), Shoes (2 pairs)', NULL, NULL, NULL),
('test-user-id', '5', 75.00, '2025-02-28', 'miles', 'Volunteer driving', NULL, 535.71, 0.14, 'Food delivery for food bank'),
('test-user-id', '1', 300.00, '2025-03-10', 'cash', 'Disaster relief fund', NULL, NULL, NULL, NULL),
('test-user-id', '6', 450.00, '2025-03-15', 'items', 'Furniture donation', 'Office desk, Chair, Bookshelf', NULL, NULL, NULL),
('test-user-id', '7', 2000.00, '2025-03-20', 'crypto', 'Bitcoin donation', NULL, NULL, NULL, NULL),
('test-user-id', '8', 100.00, '2025-04-01', 'cash', 'Spring fundraiser', NULL, NULL, NULL, NULL),
('test-user-id', '9', 180.00, '2025-04-15', 'items', 'Electronics donation', 'Laptop, Printer, Monitor', NULL, NULL, NULL),
('test-user-id', '10', 42.00, '2025-04-22', 'miles', 'Earth Day event transport', NULL, 300, 0.14, 'Transporting supplies for cleanup'),
('test-user-id', '2', 750.00, '2025-05-01', 'cash', 'Annual pledge payment', NULL, NULL, NULL, NULL),
('test-user-id', '3', 350.00, '2025-05-15', 'items', 'Book donation', 'Textbooks (20), Novels (15)', NULL, NULL, NULL),
('test-user-id', '4', 500.00, '2025-05-30', 'stock', 'Microsoft shares', NULL, NULL, NULL, NULL),
('test-user-id', '5', 125.00, '2025-06-01', 'cash', 'Summer campaign', NULL, NULL, NULL, NULL),
('test-user-id', '6', 56.00, '2025-06-15', 'miles', 'Medical transport volunteer', NULL, 400, 0.14, 'Driving patients to appointments'),
('test-user-id', '7', 220.00, '2025-06-20', 'items', 'Sports equipment', 'Bicycles (2), Golf clubs, Tennis rackets', NULL, NULL, NULL),
('test-user-id', '8', 1500.00, '2025-06-30', 'crypto', 'Ethereum donation', NULL, NULL, NULL, NULL),
('test-user-id', '9', 400.00, '2025-07-04', 'cash', 'Independence Day fundraiser', NULL, NULL, NULL, NULL),
('test-user-id', '10', 280.00, '2025-07-15', 'items', 'Household goods', 'Kitchen appliances, Bedding, Towels', NULL, NULL, NULL);