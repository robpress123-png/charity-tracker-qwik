-- Tax Tables Database Migration Script
-- Run this in Cloudflare D1 Console to set up tax tables

-- 1. Create tax_brackets table
CREATE TABLE IF NOT EXISTS tax_brackets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tax_year INTEGER NOT NULL,
    filing_status TEXT NOT NULL,
    min_income DECIMAL(10,2) NOT NULL,
    max_income DECIMAL(10,2),
    rate DECIMAL(5,4) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, filing_status, min_income)
);

-- 2. Create capital_gains_rates table
CREATE TABLE IF NOT EXISTS capital_gains_rates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tax_year INTEGER NOT NULL,
    filing_status TEXT NOT NULL,
    gain_type TEXT NOT NULL,
    min_income DECIMAL(10,2) NOT NULL,
    max_income DECIMAL(10,2),
    rate DECIMAL(5,4) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, filing_status, gain_type, min_income)
);

-- 3. Create standard_deductions table
CREATE TABLE IF NOT EXISTS standard_deductions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tax_year INTEGER NOT NULL,
    filing_status TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, filing_status)
);

-- 4. Create irs_mileage_rates table
CREATE TABLE IF NOT EXISTS irs_mileage_rates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tax_year INTEGER NOT NULL,
    purpose TEXT NOT NULL,
    rate DECIMAL(5,3) NOT NULL,
    effective_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, purpose)
);

-- 5. Create contribution_limits table
CREATE TABLE IF NOT EXISTS contribution_limits (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tax_year INTEGER NOT NULL,
    donation_type TEXT NOT NULL,
    agi_percentage DECIMAL(5,2) NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, donation_type)
);

-- Insert 2024 Tax Brackets
-- Single
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2024, 'single', 0, 11600, 0.10),
(2024, 'single', 11600, 47150, 0.12),
(2024, 'single', 47150, 100525, 0.22),
(2024, 'single', 100525, 191950, 0.24),
(2024, 'single', 191950, 243725, 0.32),
(2024, 'single', 243725, 609350, 0.35),
(2024, 'single', 609350, NULL, 0.37);

-- Married Filing Jointly
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2024, 'married_jointly', 0, 23200, 0.10),
(2024, 'married_jointly', 23200, 94300, 0.12),
(2024, 'married_jointly', 94300, 201050, 0.22),
(2024, 'married_jointly', 201050, 383900, 0.24),
(2024, 'married_jointly', 383900, 487450, 0.32),
(2024, 'married_jointly', 487450, 731200, 0.35),
(2024, 'married_jointly', 731200, NULL, 0.37);

-- Married Filing Separately
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2024, 'married_separately', 0, 11600, 0.10),
(2024, 'married_separately', 11600, 47150, 0.12),
(2024, 'married_separately', 47150, 100525, 0.22),
(2024, 'married_separately', 100525, 191950, 0.24),
(2024, 'married_separately', 191950, 243725, 0.32),
(2024, 'married_separately', 243725, 365600, 0.35),
(2024, 'married_separately', 365600, NULL, 0.37);

-- Head of Household
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2024, 'head_of_household', 0, 16550, 0.10),
(2024, 'head_of_household', 16550, 63100, 0.12),
(2024, 'head_of_household', 63100, 100500, 0.22),
(2024, 'head_of_household', 100500, 191950, 0.24),
(2024, 'head_of_household', 191950, 243700, 0.32),
(2024, 'head_of_household', 243700, 609350, 0.35),
(2024, 'head_of_household', 609350, NULL, 0.37);

-- Insert 2025 Tax Brackets (estimated with 3% inflation adjustment)
-- Single
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2025, 'single', 0, 11950, 0.10),
(2025, 'single', 11950, 48575, 0.12),
(2025, 'single', 48575, 103550, 0.22),
(2025, 'single', 103550, 197700, 0.24),
(2025, 'single', 197700, 251050, 0.32),
(2025, 'single', 251050, 627650, 0.35),
(2025, 'single', 627650, NULL, 0.37);

-- Married Filing Jointly
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2025, 'married_jointly', 0, 23900, 0.10),
(2025, 'married_jointly', 23900, 97150, 0.12),
(2025, 'married_jointly', 97150, 207100, 0.22),
(2025, 'married_jointly', 207100, 395400, 0.24),
(2025, 'married_jointly', 395400, 502100, 0.32),
(2025, 'married_jointly', 502100, 753150, 0.35),
(2025, 'married_jointly', 753150, NULL, 0.37);

-- Insert 2026 Tax Brackets (estimated with additional 3% adjustment)
-- Single
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2026, 'single', 0, 12300, 0.10),
(2026, 'single', 12300, 50000, 0.12),
(2026, 'single', 50000, 106650, 0.22),
(2026, 'single', 106650, 203600, 0.24),
(2026, 'single', 203600, 258600, 0.32),
(2026, 'single', 258600, 646500, 0.35),
(2026, 'single', 646500, NULL, 0.37);

-- Married Filing Jointly
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2026, 'married_jointly', 0, 24600, 0.10),
(2026, 'married_jointly', 24600, 100050, 0.12),
(2026, 'married_jointly', 100050, 213300, 0.22),
(2026, 'married_jointly', 213300, 407250, 0.24),
(2026, 'married_jointly', 407250, 517150, 0.32),
(2026, 'married_jointly', 517150, 775750, 0.35),
(2026, 'married_jointly', 775750, NULL, 0.37);

-- Insert Capital Gains Rates for 2024
-- Long-term capital gains - Single
INSERT INTO capital_gains_rates (tax_year, filing_status, gain_type, min_income, max_income, rate) VALUES
(2024, 'single', 'long_term', 0, 47025, 0.00),
(2024, 'single', 'long_term', 47025, 518900, 0.15),
(2024, 'single', 'long_term', 518900, NULL, 0.20);

-- Long-term capital gains - Married Filing Jointly
INSERT INTO capital_gains_rates (tax_year, filing_status, gain_type, min_income, max_income, rate) VALUES
(2024, 'married_jointly', 'long_term', 0, 94050, 0.00),
(2024, 'married_jointly', 'long_term', 94050, 583750, 0.15),
(2024, 'married_jointly', 'long_term', 583750, NULL, 0.20);

-- Long-term capital gains - Married Filing Separately
INSERT INTO capital_gains_rates (tax_year, filing_status, gain_type, min_income, max_income, rate) VALUES
(2024, 'married_separately', 'long_term', 0, 47025, 0.00),
(2024, 'married_separately', 'long_term', 47025, 291875, 0.15),
(2024, 'married_separately', 'long_term', 291875, NULL, 0.20);

-- Long-term capital gains - Head of Household
INSERT INTO capital_gains_rates (tax_year, filing_status, gain_type, min_income, max_income, rate) VALUES
(2024, 'head_of_household', 'long_term', 0, 63000, 0.00),
(2024, 'head_of_household', 'long_term', 63000, 551350, 0.15),
(2024, 'head_of_household', 'long_term', 551350, NULL, 0.20);

-- Insert Capital Gains Rates for 2025 (estimated)
-- Long-term capital gains - Single
INSERT INTO capital_gains_rates (tax_year, filing_status, gain_type, min_income, max_income, rate) VALUES
(2025, 'single', 'long_term', 0, 48450, 0.00),
(2025, 'single', 'long_term', 48450, 534450, 0.15),
(2025, 'single', 'long_term', 534450, NULL, 0.20);

-- Long-term capital gains - Married Filing Jointly
INSERT INTO capital_gains_rates (tax_year, filing_status, gain_type, min_income, max_income, rate) VALUES
(2025, 'married_jointly', 'long_term', 0, 96900, 0.00),
(2025, 'married_jointly', 'long_term', 96900, 601250, 0.15),
(2025, 'married_jointly', 'long_term', 601250, NULL, 0.20);

-- Insert Standard Deductions
INSERT INTO standard_deductions (tax_year, filing_status, amount) VALUES
(2024, 'single', 14600),
(2024, 'married_jointly', 29200),
(2024, 'married_separately', 14600),
(2024, 'head_of_household', 21900),
(2025, 'single', 15000),
(2025, 'married_jointly', 30000),
(2025, 'married_separately', 15000),
(2025, 'head_of_household', 22500),
(2026, 'single', 15400),
(2026, 'married_jointly', 30800),
(2026, 'married_separately', 15400),
(2026, 'head_of_household', 23100);

-- Insert IRS Mileage Rates
INSERT INTO irs_mileage_rates (tax_year, purpose, rate, effective_date) VALUES
(2024, 'charitable', 0.14, '2024-01-01'),
(2024, 'medical', 0.21, '2024-01-01'),
(2024, 'business', 0.67, '2024-01-01'),
(2025, 'charitable', 0.14, '2025-01-01'),
(2025, 'medical', 0.21, '2025-01-01'),
(2025, 'business', 0.70, '2025-01-01'),
(2026, 'charitable', 0.14, '2026-01-01'),
(2026, 'medical', 0.22, '2026-01-01'),
(2026, 'business', 0.72, '2026-01-01');

-- Insert Contribution Limits (% of AGI)
INSERT INTO contribution_limits (tax_year, donation_type, agi_percentage, notes) VALUES
(2024, 'cash', 60, 'Cash donations to public charities'),
(2024, 'property', 30, 'Appreciated property to public charities'),
(2024, 'capital_gain_property', 20, 'Capital gain property to private foundations'),
(2025, 'cash', 60, 'Cash donations to public charities'),
(2025, 'property', 30, 'Appreciated property to public charities'),
(2025, 'capital_gain_property', 20, 'Capital gain property to private foundations'),
(2026, 'cash', 60, 'Cash donations to public charities'),
(2026, 'property', 30, 'Appreciated property to public charities'),
(2026, 'capital_gain_property', 20, 'Capital gain property to private foundations');