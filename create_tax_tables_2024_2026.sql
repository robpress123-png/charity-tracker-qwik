-- Tax Tables Database Creation Script
-- For Charity Tracker Application
-- Covers tax years 2024, 2025, and 2026
-- Generated: 2025-09-25

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS tax_brackets;
DROP TABLE IF EXISTS capital_gains_rates;
DROP TABLE IF EXISTS standard_deductions;
DROP TABLE IF EXISTS irs_mileage_rates;
DROP TABLE IF EXISTS contribution_limits;
DROP TABLE IF EXISTS user_tax_settings;

-- 1. Tax brackets table for income tax rates
CREATE TABLE tax_brackets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tax_year INTEGER NOT NULL,
    filing_status TEXT NOT NULL, -- single, married_jointly, married_separately, head_of_household
    min_income DECIMAL(10,2) NOT NULL,
    max_income DECIMAL(10,2), -- NULL for top bracket
    rate DECIMAL(5,4) NOT NULL, -- 0.10, 0.12, 0.22, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, filing_status, min_income)
);

-- 2. Capital gains rates table
CREATE TABLE capital_gains_rates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tax_year INTEGER NOT NULL,
    filing_status TEXT NOT NULL,
    gain_type TEXT NOT NULL, -- short_term, long_term
    min_income DECIMAL(10,2) NOT NULL,
    max_income DECIMAL(10,2), -- NULL for top bracket
    rate DECIMAL(5,4) NOT NULL, -- 0.00, 0.15, 0.20, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, filing_status, gain_type, min_income)
);

-- 3. Standard deductions table
CREATE TABLE standard_deductions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tax_year INTEGER NOT NULL,
    filing_status TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, filing_status)
);

-- 4. IRS mileage rates table
CREATE TABLE irs_mileage_rates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tax_year INTEGER NOT NULL,
    purpose TEXT NOT NULL, -- charitable, medical, business
    rate DECIMAL(5,3) NOT NULL, -- dollars per mile
    effective_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, purpose)
);

-- 5. Contribution limits and special rules table
CREATE TABLE contribution_limits (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tax_year INTEGER NOT NULL,
    rule_type TEXT NOT NULL, -- agi_floor, rate_cap, standard_deduction_addon
    filing_status TEXT, -- NULL for rules that apply to all
    value DECIMAL(10,4) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, rule_type, filing_status)
);

-- 6. User tax settings by year
CREATE TABLE user_tax_settings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    tax_year INTEGER NOT NULL,
    filing_status TEXT,
    tax_bracket DECIMAL(5,4), -- User selected bracket (0.10, 0.12, 0.22, etc.)
    agi_range TEXT, -- Optional: for 2026 floor calculation (e.g., '100000-200000')
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tax_year)
);

-- ============================================================================
-- INSERT 2024 TAX DATA
-- ============================================================================

-- 2024 Tax Brackets - Single
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2024, 'single', 0, 11600, 0.10),
(2024, 'single', 11600, 47150, 0.12),
(2024, 'single', 47150, 100525, 0.22),
(2024, 'single', 100525, 191950, 0.24),
(2024, 'single', 191950, 243725, 0.32),
(2024, 'single', 243725, 609350, 0.35),
(2024, 'single', 609350, NULL, 0.37);

-- 2024 Tax Brackets - Married Filing Jointly
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2024, 'married_jointly', 0, 23200, 0.10),
(2024, 'married_jointly', 23200, 94300, 0.12),
(2024, 'married_jointly', 94300, 201050, 0.22),
(2024, 'married_jointly', 201050, 383900, 0.24),
(2024, 'married_jointly', 383900, 487450, 0.32),
(2024, 'married_jointly', 487450, 731200, 0.35),
(2024, 'married_jointly', 731200, NULL, 0.37);

-- 2024 Tax Brackets - Married Filing Separately
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2024, 'married_separately', 0, 11600, 0.10),
(2024, 'married_separately', 11600, 47150, 0.12),
(2024, 'married_separately', 47150, 100525, 0.22),
(2024, 'married_separately', 100525, 191950, 0.24),
(2024, 'married_separately', 191950, 243725, 0.32),
(2024, 'married_separately', 243725, 365600, 0.35),
(2024, 'married_separately', 365600, NULL, 0.37);

-- 2024 Tax Brackets - Head of Household
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2024, 'head_of_household', 0, 16550, 0.10),
(2024, 'head_of_household', 16550, 63100, 0.12),
(2024, 'head_of_household', 63100, 100500, 0.22),
(2024, 'head_of_household', 100500, 191950, 0.24),
(2024, 'head_of_household', 191950, 243700, 0.32),
(2024, 'head_of_household', 243700, 609350, 0.35),
(2024, 'head_of_household', 609350, NULL, 0.37);

-- ============================================================================
-- INSERT 2025 TAX DATA (Official IRS rates)
-- ============================================================================

-- 2025 Tax Brackets - Single
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2025, 'single', 0, 11925, 0.10),
(2025, 'single', 11925, 48475, 0.12),
(2025, 'single', 48475, 103350, 0.22),
(2025, 'single', 103350, 197300, 0.24),
(2025, 'single', 197300, 250525, 0.32),
(2025, 'single', 250525, 626350, 0.35),
(2025, 'single', 626350, NULL, 0.37);

-- 2025 Tax Brackets - Married Filing Jointly
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2025, 'married_jointly', 0, 23850, 0.10),
(2025, 'married_jointly', 23850, 96950, 0.12),
(2025, 'married_jointly', 96950, 206700, 0.22),
(2025, 'married_jointly', 206700, 394600, 0.24),
(2025, 'married_jointly', 394600, 501050, 0.32),
(2025, 'married_jointly', 501050, 751600, 0.35),
(2025, 'married_jointly', 751600, NULL, 0.37);

-- 2025 Tax Brackets - Married Filing Separately
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2025, 'married_separately', 0, 11925, 0.10),
(2025, 'married_separately', 11925, 48475, 0.12),
(2025, 'married_separately', 48475, 103350, 0.22),
(2025, 'married_separately', 103350, 197300, 0.24),
(2025, 'married_separately', 197300, 250525, 0.32),
(2025, 'married_separately', 250525, 375800, 0.35),
(2025, 'married_separately', 375800, NULL, 0.37);

-- 2025 Tax Brackets - Head of Household
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2025, 'head_of_household', 0, 17000, 0.10),
(2025, 'head_of_household', 17000, 64850, 0.12),
(2025, 'head_of_household', 64850, 103350, 0.22),
(2025, 'head_of_household', 103350, 197300, 0.24),
(2025, 'head_of_household', 197300, 250500, 0.32),
(2025, 'head_of_household', 250500, 626350, 0.35),
(2025, 'head_of_household', 626350, NULL, 0.37);

-- ============================================================================
-- INSERT 2026 TAX DATA (OBBBA rates with inflation adjustment)
-- ============================================================================

-- 2026 Tax Brackets - Single (estimated with ~2.5% inflation adjustment)
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2026, 'single', 0, 12225, 0.10),
(2026, 'single', 12225, 49700, 0.12),
(2026, 'single', 49700, 105950, 0.22),
(2026, 'single', 105950, 202250, 0.24),
(2026, 'single', 202250, 257050, 0.32),
(2026, 'single', 257050, 642000, 0.35),
(2026, 'single', 642000, NULL, 0.37);

-- 2026 Tax Brackets - Married Filing Jointly
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2026, 'married_jointly', 0, 24450, 0.10),
(2026, 'married_jointly', 24450, 99400, 0.12),
(2026, 'married_jointly', 99400, 211900, 0.22),
(2026, 'married_jointly', 211900, 404500, 0.24),
(2026, 'married_jointly', 404500, 514100, 0.32),
(2026, 'married_jointly', 514100, 770400, 0.35),
(2026, 'married_jointly', 770400, NULL, 0.37);

-- 2026 Tax Brackets - Married Filing Separately
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2026, 'married_separately', 0, 12225, 0.10),
(2026, 'married_separately', 12225, 49700, 0.12),
(2026, 'married_separately', 49700, 105950, 0.22),
(2026, 'married_separately', 105950, 202250, 0.24),
(2026, 'married_separately', 202250, 257050, 0.32),
(2026, 'married_separately', 257050, 385200, 0.35),
(2026, 'married_separately', 385200, NULL, 0.37);

-- 2026 Tax Brackets - Head of Household
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2026, 'head_of_household', 0, 17425, 0.10),
(2026, 'head_of_household', 17425, 66475, 0.12),
(2026, 'head_of_household', 66475, 105950, 0.22),
(2026, 'head_of_household', 105950, 202250, 0.24),
(2026, 'head_of_household', 202250, 257000, 0.32),
(2026, 'head_of_household', 257000, 642000, 0.35),
(2026, 'head_of_household', 642000, NULL, 0.37);

-- ============================================================================
-- CAPITAL GAINS RATES (2024-2026)
-- ============================================================================

-- 2024 Long-term Capital Gains - Single
INSERT INTO capital_gains_rates (tax_year, filing_status, gain_type, min_income, max_income, rate) VALUES
(2024, 'single', 'long_term', 0, 47025, 0.00),
(2024, 'single', 'long_term', 47025, 518900, 0.15),
(2024, 'single', 'long_term', 518900, NULL, 0.20);

-- 2024 Long-term Capital Gains - Married Filing Jointly
INSERT INTO capital_gains_rates (tax_year, filing_status, gain_type, min_income, max_income, rate) VALUES
(2024, 'married_jointly', 'long_term', 0, 94050, 0.00),
(2024, 'married_jointly', 'long_term', 94050, 583750, 0.15),
(2024, 'married_jointly', 'long_term', 583750, NULL, 0.20);

-- 2025 Long-term Capital Gains - Single
INSERT INTO capital_gains_rates (tax_year, filing_status, gain_type, min_income, max_income, rate) VALUES
(2025, 'single', 'long_term', 0, 48350, 0.00),
(2025, 'single', 'long_term', 48350, 533400, 0.15),
(2025, 'single', 'long_term', 533400, NULL, 0.20);

-- 2025 Long-term Capital Gains - Married Filing Jointly
INSERT INTO capital_gains_rates (tax_year, filing_status, gain_type, min_income, max_income, rate) VALUES
(2025, 'married_jointly', 'long_term', 0, 96700, 0.00),
(2025, 'married_jointly', 'long_term', 96700, 600050, 0.15),
(2025, 'married_jointly', 'long_term', 600050, NULL, 0.20);

-- 2026 Long-term Capital Gains - Single (estimated)
INSERT INTO capital_gains_rates (tax_year, filing_status, gain_type, min_income, max_income, rate) VALUES
(2026, 'single', 'long_term', 0, 49550, 0.00),
(2026, 'single', 'long_term', 49550, 546700, 0.15),
(2026, 'single', 'long_term', 546700, NULL, 0.20);

-- 2026 Long-term Capital Gains - Married Filing Jointly (estimated)
INSERT INTO capital_gains_rates (tax_year, filing_status, gain_type, min_income, max_income, rate) VALUES
(2026, 'married_jointly', 'long_term', 0, 99100, 0.00),
(2026, 'married_jointly', 'long_term', 99100, 615050, 0.15),
(2026, 'married_jointly', 'long_term', 615050, NULL, 0.20);

-- Note: Short-term capital gains are taxed as ordinary income (use tax_brackets table)

-- ============================================================================
-- STANDARD DEDUCTIONS
-- ============================================================================

INSERT INTO standard_deductions (tax_year, filing_status, amount) VALUES
-- 2024
(2024, 'single', 14600),
(2024, 'married_jointly', 29200),
(2024, 'married_separately', 14600),
(2024, 'head_of_household', 21900),
-- 2025
(2025, 'single', 15000),
(2025, 'married_jointly', 30000),
(2025, 'married_separately', 15000),
(2025, 'head_of_household', 22500),
-- 2026 (estimated with inflation adjustment)
(2026, 'single', 15375),
(2026, 'married_jointly', 30750),
(2026, 'married_separately', 15375),
(2026, 'head_of_household', 23050);

-- ============================================================================
-- IRS MILEAGE RATES
-- ============================================================================

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

-- ============================================================================
-- CONTRIBUTION LIMITS AND SPECIAL RULES
-- ============================================================================

-- 2024-2025: No AGI floor for charitable deductions
INSERT INTO contribution_limits (tax_year, rule_type, filing_status, value, description) VALUES
(2024, 'agi_floor', NULL, 0.0, 'No AGI floor for charitable deductions'),
(2024, 'rate_cap', NULL, 0.37, 'Maximum tax benefit at highest marginal rate'),
(2025, 'agi_floor', NULL, 0.0, 'No AGI floor for charitable deductions'),
(2025, 'rate_cap', NULL, 0.37, 'Maximum tax benefit at highest marginal rate');

-- 2026: OBBBA introduces 0.5% AGI floor and 35% rate cap
INSERT INTO contribution_limits (tax_year, rule_type, filing_status, value, description) VALUES
(2026, 'agi_floor', NULL, 0.005, '0.5% of AGI floor for itemized charitable deductions'),
(2026, 'rate_cap', NULL, 0.35, 'Maximum 35% tax benefit even if in 37% bracket'),
(2026, 'standard_deduction_addon', 'single', 1000, 'Non-itemizers can deduct up to $1000 in cash donations'),
(2026, 'standard_deduction_addon', 'married_jointly', 2000, 'Non-itemizers can deduct up to $2000 in cash donations'),
(2026, 'standard_deduction_addon', 'married_separately', 1000, 'Non-itemizers can deduct up to $1000 in cash donations'),
(2026, 'standard_deduction_addon', 'head_of_household', 1000, 'Non-itemizers can deduct up to $1000 in cash donations');

-- Create indexes for better query performance
CREATE INDEX idx_tax_brackets_lookup ON tax_brackets(tax_year, filing_status);
CREATE INDEX idx_capital_gains_lookup ON capital_gains_rates(tax_year, filing_status, gain_type);
CREATE INDEX idx_user_settings_lookup ON user_tax_settings(user_id, tax_year);

-- Add comment explaining the tables
/*
This database schema supports tax calculations for charitable donations from 2024-2026.

Key features:
1. Tax brackets for all filing statuses and years
2. Capital gains rates for appreciated asset donations
3. Standard deductions by year
4. IRS mileage rates for charitable driving
5. Special rules including 2026 OBBBA changes (0.5% AGI floor, 35% rate cap)
6. User tax settings allow bracket selection without revealing income

The 2026 OBBBA changes significantly impact high-income donors:
- 0.5% AGI floor means first 0.5% of AGI in donations provides no tax benefit
- 35% rate cap limits tax benefit for those in 37% bracket
- Non-itemizers can deduct limited cash donations ($1000/$2000)
*/