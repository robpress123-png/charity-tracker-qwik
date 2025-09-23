-- Create item_valuations table with proper structure
CREATE TABLE IF NOT EXISTS item_valuations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  value_poor REAL DEFAULT 0,
  value_fair REAL DEFAULT 0,
  value_good REAL,
  value_excellent REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES item_categories(id)
);

-- Women's Clothing (category_id = 1)
INSERT INTO item_valuations (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(1, 'Blouse', 'Women''s blouse or shirt', 0, 0, 7, 12),
(1, 'Dress', 'Women''s dress', 0, 0, 15, 25),
(1, 'Suit', 'Women''s business suit', 0, 0, 40, 80),
(1, 'Coat', 'Women''s coat or jacket', 0, 0, 30, 60),
(1, 'Shoes', 'Women''s shoes (per pair)', 0, 0, 12, 25),
(1, 'Handbag', 'Purse or handbag', 0, 0, 20, 40),
(1, 'Sweater', 'Women''s sweater', 0, 0, 12, 20),
(1, 'Jeans', 'Women''s jeans or pants', 0, 0, 15, 25),
(1, 'Skirt', 'Women''s skirt', 0, 0, 10, 18);

-- Men's Clothing (category_id = 2)
INSERT INTO item_valuations (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(2, 'Shirt', 'Men''s dress shirt', 0, 0, 12, 20),
(2, 'Suit', 'Men''s business suit', 0, 0, 60, 120),
(2, 'Pants', 'Men''s pants or slacks', 0, 0, 15, 25),
(2, 'Jeans', 'Men''s jeans', 0, 0, 15, 25),
(2, 'Coat', 'Men''s coat or jacket', 0, 0, 35, 75),
(2, 'Shoes', 'Men''s shoes (per pair)', 0, 0, 18, 35),
(2, 'Tie', 'Necktie', 0, 0, 4, 8),
(2, 'Sweater', 'Men''s sweater', 0, 0, 15, 25),
(2, 'Belt', 'Men''s belt', 0, 0, 8, 15);

-- Children's Clothing (category_id = 3)
INSERT INTO item_valuations (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(3, 'Shirt/Blouse', 'Child''s shirt or blouse', 0, 0, 4, 8),
(3, 'Pants/Jeans', 'Child''s pants or jeans', 0, 0, 7, 12),
(3, 'Dress', 'Child''s dress', 0, 0, 8, 15),
(3, 'Coat', 'Child''s coat or jacket', 0, 0, 15, 25),
(3, 'Shoes', 'Child''s shoes (per pair)', 0, 0, 8, 15),
(3, 'Baby Clothes', 'Infant clothing items', 0, 0, 3, 5),
(3, 'Sweater', 'Child''s sweater', 0, 0, 6, 10);

-- Household Items (category_id = 4)
INSERT INTO item_valuations (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(4, 'Pots & Pans', 'Cookware set', 0, 0, 15, 30),
(4, 'Dishes (set)', 'Complete dish set', 0, 0, 30, 60),
(4, 'Glassware (set)', 'Set of glasses', 0, 0, 15, 25),
(4, 'Bedding (set)', 'Sheets and pillowcases', 0, 0, 20, 35),
(4, 'Towels', 'Bath towels (each)', 0, 0, 4, 8),
(4, 'Blanket', 'Blanket or comforter', 0, 0, 15, 30),
(4, 'Curtains', 'Window curtains (per panel)', 0, 0, 10, 20),
(4, 'Kitchen Utensils', 'Set of kitchen utensils', 0, 0, 10, 20),
(4, 'Small Appliances', 'Toaster, blender, etc.', 0, 0, 20, 40);

-- Electronics (category_id = 5)
INSERT INTO item_valuations (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(5, 'Computer - Desktop', 'Desktop computer system', 0, 0, 200, 400),
(5, 'Computer - Laptop', 'Laptop computer', 0, 0, 300, 600),
(5, 'Tablet', 'iPad or tablet device', 0, 0, 100, 200),
(5, 'Smartphone', 'Mobile phone', 0, 0, 100, 250),
(5, 'Television', 'TV (size varies)', 0, 0, 150, 300),
(5, 'Printer', 'Computer printer', 0, 0, 40, 80),
(5, 'Game Console', 'Video game system', 0, 0, 100, 200),
(5, 'Camera', 'Digital camera', 0, 0, 100, 250),
(5, 'Monitor', 'Computer monitor', 0, 0, 60, 120);

-- Furniture (category_id = 6)
INSERT INTO item_valuations (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(6, 'Sofa', 'Couch or sofa', 0, 0, 200, 500),
(6, 'Chair', 'Armchair or recliner', 0, 0, 75, 150),
(6, 'Dining Table', 'Dining room table', 0, 0, 150, 400),
(6, 'Dining Chairs', 'Dining chair (each)', 0, 0, 25, 50),
(6, 'Coffee Table', 'Coffee or end table', 0, 0, 50, 100),
(6, 'Dresser', 'Bedroom dresser', 0, 0, 100, 200),
(6, 'Bed Frame', 'Bed frame (no mattress)', 0, 0, 100, 200),
(6, 'Desk', 'Office or computer desk', 0, 0, 75, 150),
(6, 'Bookcase', 'Bookshelf', 0, 0, 50, 100);

-- Books & Media (category_id = 7)
INSERT INTO item_valuations (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(7, 'Hardback Book', 'Hardcover book', 0, 0, 3, 5),
(7, 'Paperback Book', 'Paperback book', 0, 0, 2, 3),
(7, 'Textbook', 'College textbook', 0, 0, 20, 40),
(7, 'Children''s Book', 'Children''s book', 0, 0, 2, 3),
(7, 'DVD', 'DVD movie', 0, 0, 3, 5),
(7, 'Blu-ray', 'Blu-ray movie', 0, 0, 5, 8),
(7, 'CD', 'Music CD', 0, 0, 2, 3),
(7, 'Video Game', 'Video game', 0, 0, 10, 20),
(7, 'Board Game', 'Board game', 0, 0, 10, 20);

-- Sports & Recreation (category_id = 8)
INSERT INTO item_valuations (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(8, 'Bicycle', 'Adult bicycle', 0, 0, 100, 200),
(8, 'Golf Clubs', 'Set of golf clubs', 0, 0, 125, 250),
(8, 'Tennis Racket', 'Tennis racket', 0, 0, 25, 50),
(8, 'Exercise Equipment', 'Treadmill, weights, etc.', 0, 0, 150, 300),
(8, 'Skis', 'Pair of skis', 0, 0, 80, 150),
(8, 'Skateboard', 'Skateboard', 0, 0, 25, 50),
(8, 'Sports Balls', 'Basketball, football, etc.', 0, 0, 10, 20),
(8, 'Camping Gear', 'Tent, sleeping bag, etc.', 0, 0, 50, 100),
(8, 'Fishing Rod', 'Fishing rod and reel', 0, 0, 30, 60);

-- Toys & Games (category_id = 9)
INSERT INTO item_valuations (category_id, name, description, value_poor, value_fair, value_good, value_excellent) VALUES
(9, 'Stuffed Animal', 'Plush toy', 0, 0, 4, 8),
(9, 'Doll', 'Doll or action figure', 0, 0, 8, 15),
(9, 'Building Blocks', 'LEGO or building set', 0, 0, 25, 50),
(9, 'Puzzle', 'Jigsaw puzzle', 0, 0, 5, 10),
(9, 'Toy Car/Truck', 'Toy vehicle', 0, 0, 6, 12),
(9, 'Educational Toy', 'Learning toy', 0, 0, 12, 25),
(9, 'Outdoor Toy', 'Bikes, scooters for kids', 0, 0, 40, 80),
(9, 'Electronic Toy', 'Battery-powered toy', 0, 0, 20, 40);