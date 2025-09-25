-- Tax Tables Structure Only - For Initial Database Setup
-- Run this once to create the table structure
-- Then use the admin tool to import CSV data

-- 1. Tax brackets table for income tax rates
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

-- 2. Capital gains rates table
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

-- 3. Standard deductions table
CREATE TABLE IF NOT EXISTS standard_deductions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tax_year INTEGER NOT NULL,
    filing_status TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, filing_status)
);

-- 4. IRS mileage rates table
CREATE TABLE IF NOT EXISTS irs_mileage_rates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tax_year INTEGER NOT NULL,
    purpose TEXT NOT NULL,
    rate DECIMAL(5,3) NOT NULL,
    effective_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, purpose)
);

-- 5. Contribution limits and special rules table
CREATE TABLE IF NOT EXISTS contribution_limits (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tax_year INTEGER NOT NULL,
    rule_type TEXT NOT NULL,
    filing_status TEXT,
    value DECIMAL(10,4) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, rule_type, filing_status)
);

-- 6. User tax settings by year
CREATE TABLE IF NOT EXISTS user_tax_settings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    tax_year INTEGER NOT NULL,
    filing_status TEXT,
    tax_bracket DECIMAL(5,4),
    agi_range TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tax_year)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tax_brackets_lookup ON tax_brackets(tax_year, filing_status);
CREATE INDEX IF NOT EXISTS idx_capital_gains_lookup ON capital_gains_rates(tax_year, filing_status, gain_type);
CREATE INDEX IF NOT EXISTS idx_user_settings_lookup ON user_tax_settings(user_id, tax_year);