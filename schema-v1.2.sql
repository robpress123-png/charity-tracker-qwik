-- Schema updates for v1.2.0
-- Adds support for donation types and mileage tracking

-- Add donation_type column
ALTER TABLE donations ADD COLUMN donation_type TEXT DEFAULT 'cash';

-- Add fields for mileage donations
ALTER TABLE donations ADD COLUMN miles_driven REAL;
ALTER TABLE donations ADD COLUMN mileage_rate REAL;
ALTER TABLE donations ADD COLUMN mileage_purpose TEXT;

-- Add fields for stock/crypto donations
ALTER TABLE donations ADD COLUMN quantity REAL;
ALTER TABLE donations ADD COLUMN cost_basis REAL;
ALTER TABLE donations ADD COLUMN fair_market_value REAL;

-- Add fields for item donations
ALTER TABLE donations ADD COLUMN item_description TEXT;
ALTER TABLE donations ADD COLUMN estimated_value REAL;

-- IRS mileage rates table
CREATE TABLE IF NOT EXISTS mileage_rates (
    year INTEGER PRIMARY KEY,
    rate_per_mile REAL NOT NULL
);

-- Insert recent IRS mileage rates
INSERT OR REPLACE INTO mileage_rates (year, rate_per_mile) VALUES
(2024, 0.14),
(2023, 0.14),
(2022, 0.14),
(2021, 0.14),
(2020, 0.14);