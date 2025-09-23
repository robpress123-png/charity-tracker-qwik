-- Add stock donation columns
ALTER TABLE donations ADD COLUMN stock_symbol TEXT;
ALTER TABLE donations ADD COLUMN stock_quantity REAL;
ALTER TABLE donations ADD COLUMN fair_market_value REAL;

-- Add crypto donation columns  
ALTER TABLE donations ADD COLUMN crypto_symbol TEXT;
ALTER TABLE donations ADD COLUMN crypto_quantity REAL;
ALTER TABLE donations ADD COLUMN crypto_type TEXT;

-- Add miles donation columns
ALTER TABLE donations ADD COLUMN miles_driven REAL;
ALTER TABLE donations ADD COLUMN mileage_rate REAL;
ALTER TABLE donations ADD COLUMN mileage_purpose TEXT;

-- Add items donation columns
ALTER TABLE donations ADD COLUMN item_description TEXT;
ALTER TABLE donations ADD COLUMN estimated_value REAL;

-- Add receipt column
ALTER TABLE donations ADD COLUMN receipt_url TEXT;

-- Add user_charity_id column
ALTER TABLE donations ADD COLUMN user_charity_id TEXT;

-- Create donation_items table if not exists
CREATE TABLE IF NOT EXISTS donation_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  donation_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT,
  condition TEXT,
  quantity INTEGER DEFAULT 1,
  unit_value REAL,
  total_value REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
);

-- Create user_charities table if not exists
CREATE TABLE IF NOT EXISTS user_charities (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  ein TEXT,
  category TEXT,
  website TEXT,
  description TEXT,
  is_approved BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);