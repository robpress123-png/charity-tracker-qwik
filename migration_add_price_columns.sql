-- Migration to add price per share/unit columns for stock and crypto donations
-- These are critical fields for accurate record-keeping and verification

-- Add stock price per share column
ALTER TABLE donations ADD COLUMN stock_price_per_share REAL;

-- Add crypto price per unit column
ALTER TABLE donations ADD COLUMN crypto_price_per_unit REAL;

-- Update existing records to calculate price from total/quantity where possible
UPDATE donations
SET stock_price_per_share = CASE
    WHEN stock_quantity > 0 THEN fair_market_value / stock_quantity
    ELSE NULL
END
WHERE donation_type = 'stock' AND stock_price_per_share IS NULL;

UPDATE donations
SET crypto_price_per_unit = CASE
    WHEN crypto_quantity > 0 THEN fair_market_value / crypto_quantity
    ELSE NULL
END
WHERE donation_type = 'crypto' AND crypto_price_per_unit IS NULL;