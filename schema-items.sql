-- Item Categories and Values Schema for Charity Tracker
-- Based on IRS Publication 561 and Goodwill Valuation Guide

-- Categories table
CREATE TABLE IF NOT EXISTS item_categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT
);

-- Items table with quality-based pricing
CREATE TABLE IF NOT EXISTS donation_items (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    value_poor REAL,
    value_fair REAL,
    value_good REAL,
    value_excellent REAL,
    FOREIGN KEY (category_id) REFERENCES item_categories(id)
);

-- Insert categories
INSERT INTO item_categories (name, description, icon) VALUES
('Clothing - Women', 'Women''s clothing and accessories', '👗'),
('Clothing - Men', 'Men''s clothing and accessories', '👔'),
('Clothing - Children', 'Children''s clothing and accessories', '👶'),
('Household Items', 'Kitchen, bedroom, and household goods', '🏠'),
('Electronics', 'Computers, phones, and electronic devices', '💻'),
('Furniture', 'Tables, chairs, sofas, and other furniture', '🛋️'),
('Books & Media', 'Books, DVDs, CDs, and games', '📚'),
('Sports & Recreation', 'Sports equipment and recreational items', '⚽'),
('Toys & Games', 'Children''s toys and games', '🎮'),
('Appliances', 'Small and large appliances', '🔌'),
('Jewelry & Accessories', 'Jewelry, watches, and accessories', '💍'),
('Tools & Equipment', 'Hand tools and power tools', '🔧');

-- Insert items with quality-based values
-- Women's Clothing
INSERT INTO donation_items (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(1, 'Blouse', 'Women''s blouse or shirt', 2, 4, 7, 12),
(1, 'Dress', 'Women''s dress', 4, 8, 15, 25),
(1, 'Suit', 'Women''s business suit', 10, 20, 40, 80),
(1, 'Coat', 'Women''s coat or jacket', 8, 15, 30, 60),
(1, 'Shoes', 'Women''s shoes (per pair)', 3, 6, 12, 25),
(1, 'Handbag', 'Purse or handbag', 3, 8, 20, 40),
(1, 'Sweater', 'Women''s sweater', 3, 6, 12, 20),
(1, 'Jeans', 'Women''s jeans or pants', 4, 8, 15, 25),
(1, 'Skirt', 'Women''s skirt', 3, 6, 10, 18);

-- Men's Clothing
INSERT INTO donation_items (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(2, 'Shirt', 'Men''s dress shirt', 3, 6, 12, 20),
(2, 'Suit', 'Men''s business suit', 15, 30, 60, 120),
(2, 'Pants', 'Men''s pants or slacks', 4, 8, 15, 25),
(2, 'Jeans', 'Men''s jeans', 4, 8, 15, 25),
(2, 'Coat', 'Men''s coat or jacket', 8, 15, 35, 75),
(2, 'Shoes', 'Men''s shoes (per pair)', 4, 8, 18, 35),
(2, 'Tie', 'Necktie', 1, 2, 4, 8),
(2, 'Sweater', 'Men''s sweater', 4, 8, 15, 25),
(2, 'Belt', 'Men''s belt', 2, 4, 8, 15);

-- Children's Clothing
INSERT INTO donation_items (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(3, 'Shirt/Blouse', 'Child''s shirt or blouse', 1, 2, 4, 8),
(3, 'Pants/Jeans', 'Child''s pants or jeans', 2, 4, 7, 12),
(3, 'Dress', 'Child''s dress', 2, 4, 8, 15),
(3, 'Coat', 'Child''s coat or jacket', 4, 8, 15, 25),
(3, 'Shoes', 'Child''s shoes (per pair)', 2, 4, 8, 15),
(3, 'Baby Clothes', 'Infant clothing items', 1, 2, 3, 5),
(3, 'Sweater', 'Child''s sweater', 2, 4, 6, 10);

-- Household Items
INSERT INTO donation_items (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(4, 'Pots & Pans', 'Cookware set', 3, 8, 15, 30),
(4, 'Dishes (set)', 'Complete dish set', 5, 15, 30, 60),
(4, 'Glassware (set)', 'Set of glasses', 3, 8, 15, 25),
(4, 'Bedding (set)', 'Sheets and pillowcases', 5, 10, 20, 35),
(4, 'Towels', 'Bath towels (each)', 1, 2, 4, 8),
(4, 'Blanket', 'Blanket or comforter', 3, 8, 15, 30),
(4, 'Curtains', 'Window curtains (per panel)', 2, 5, 10, 20),
(4, 'Kitchen Utensils', 'Set of kitchen utensils', 2, 5, 10, 20),
(4, 'Small Appliances', 'Toaster, blender, etc.', 5, 10, 20, 40);

-- Electronics
INSERT INTO donation_items (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(5, 'Computer - Desktop', 'Desktop computer system', 50, 100, 200, 400),
(5, 'Computer - Laptop', 'Laptop computer', 75, 150, 300, 600),
(5, 'Tablet', 'iPad or tablet device', 25, 50, 100, 200),
(5, 'Smartphone', 'Mobile phone', 25, 50, 100, 250),
(5, 'Television', 'TV (size varies)', 25, 75, 150, 300),
(5, 'Printer', 'Computer printer', 10, 20, 40, 80),
(5, 'Game Console', 'Video game system', 20, 50, 100, 200),
(5, 'Camera', 'Digital camera', 20, 50, 100, 250),
(5, 'Monitor', 'Computer monitor', 15, 30, 60, 120);

-- Furniture
INSERT INTO donation_items (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(6, 'Sofa', 'Couch or sofa', 35, 85, 200, 500),
(6, 'Chair', 'Armchair or recliner', 15, 35, 75, 150),
(6, 'Dining Table', 'Dining room table', 25, 60, 150, 400),
(6, 'Dining Chairs', 'Dining chair (each)', 5, 12, 25, 50),
(6, 'Coffee Table', 'Coffee or end table', 10, 25, 50, 100),
(6, 'Dresser', 'Bedroom dresser', 20, 50, 100, 200),
(6, 'Bed Frame', 'Bed frame (no mattress)', 25, 50, 100, 200),
(6, 'Desk', 'Office or computer desk', 15, 35, 75, 150),
(6, 'Bookcase', 'Bookshelf', 10, 25, 50, 100);

-- Books & Media
INSERT INTO donation_items (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(7, 'Hardback Book', 'Hardcover book', 1, 2, 3, 5),
(7, 'Paperback Book', 'Paperback book', 0.50, 1, 2, 3),
(7, 'Textbook', 'College textbook', 5, 10, 20, 40),
(7, 'Children''s Book', 'Children''s book', 0.50, 1, 2, 3),
(7, 'DVD', 'DVD movie', 1, 2, 3, 5),
(7, 'Blu-ray', 'Blu-ray movie', 2, 3, 5, 8),
(7, 'CD', 'Music CD', 0.50, 1, 2, 3),
(7, 'Video Game', 'Video game', 2, 5, 10, 20),
(7, 'Board Game', 'Board game', 2, 5, 10, 20);

-- Sports & Recreation
INSERT INTO donation_items (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(8, 'Bicycle', 'Adult bicycle', 20, 50, 100, 200),
(8, 'Golf Clubs', 'Set of golf clubs', 25, 60, 125, 250),
(8, 'Tennis Racket', 'Tennis racket', 5, 12, 25, 50),
(8, 'Exercise Equipment', 'Treadmill, weights, etc.', 25, 75, 150, 300),
(8, 'Skis', 'Pair of skis', 15, 40, 80, 150),
(8, 'Skateboard', 'Skateboard', 5, 12, 25, 50),
(8, 'Sports Balls', 'Basketball, football, etc.', 2, 5, 10, 20),
(8, 'Camping Gear', 'Tent, sleeping bag, etc.', 10, 25, 50, 100),
(8, 'Fishing Rod', 'Fishing rod and reel', 5, 15, 30, 60);

-- Toys & Games
INSERT INTO donation_items (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(9, 'Stuffed Animal', 'Plush toy', 1, 2, 4, 8),
(9, 'Doll', 'Doll or action figure', 2, 4, 8, 15),
(9, 'Building Blocks', 'LEGO or building set', 5, 12, 25, 50),
(9, 'Puzzle', 'Jigsaw puzzle', 1, 3, 5, 10),
(9, 'Toy Car/Truck', 'Toy vehicle', 1, 3, 6, 12),
(9, 'Educational Toy', 'Learning toy', 3, 6, 12, 25),
(9, 'Outdoor Toy', 'Bikes, scooters for kids', 10, 20, 40, 80),
(9, 'Electronic Toy', 'Battery-powered toy', 5, 10, 20, 40);

-- Index for faster queries
CREATE INDEX idx_items_category ON donation_items(category_id);
CREATE INDEX idx_items_name ON donation_items(name);