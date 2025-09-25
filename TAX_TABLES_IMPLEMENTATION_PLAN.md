# Tax Tables Database Implementation Plan

## Overview
Move hardcoded tax rates to database to support multiple years, easier updates, and capital gains calculations.

## Database Schema Design

### 1. tax_brackets table
```sql
CREATE TABLE tax_brackets (
    id TEXT PRIMARY KEY DEFAULT lower(hex(randomblob(16))),
    tax_year INTEGER NOT NULL,
    filing_status TEXT NOT NULL, -- single, married_jointly, married_separately, head_of_household
    min_income DECIMAL(10,2) NOT NULL,
    max_income DECIMAL(10,2), -- NULL for top bracket
    rate DECIMAL(5,4) NOT NULL, -- 0.10, 0.12, 0.22, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, filing_status, min_income)
);
```

### 2. capital_gains_rates table
```sql
CREATE TABLE capital_gains_rates (
    id TEXT PRIMARY KEY DEFAULT lower(hex(randomblob(16))),
    tax_year INTEGER NOT NULL,
    filing_status TEXT NOT NULL,
    gain_type TEXT NOT NULL, -- short_term, long_term
    min_income DECIMAL(10,2) NOT NULL,
    max_income DECIMAL(10,2), -- NULL for top bracket
    rate DECIMAL(5,4) NOT NULL, -- 0.00, 0.15, 0.20, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, filing_status, gain_type, min_income)
);
```

### 3. standard_deductions table
```sql
CREATE TABLE standard_deductions (
    id TEXT PRIMARY KEY DEFAULT lower(hex(randomblob(16))),
    tax_year INTEGER NOT NULL,
    filing_status TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, filing_status)
);
```

### 4. irs_mileage_rates table
```sql
CREATE TABLE irs_mileage_rates (
    id TEXT PRIMARY KEY DEFAULT lower(hex(randomblob(16))),
    tax_year INTEGER NOT NULL,
    purpose TEXT NOT NULL, -- charitable, medical, business
    rate DECIMAL(5,3) NOT NULL, -- dollars per mile
    effective_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, purpose)
);
```

### 5. contribution_limits table (for future use)
```sql
CREATE TABLE contribution_limits (
    id TEXT PRIMARY KEY DEFAULT lower(hex(randomblob(16))),
    tax_year INTEGER NOT NULL,
    donation_type TEXT NOT NULL, -- cash, property, etc.
    agi_percentage DECIMAL(5,2) NOT NULL, -- % of AGI limit
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tax_year, donation_type)
);
```

## Tax Data for 2024-2026

### Income Tax Brackets (2024)
**Single:**
- $0 - $11,600: 10%
- $11,600 - $47,150: 12%
- $47,150 - $100,525: 22%
- $100,525 - $191,950: 24%
- $191,950 - $243,725: 32%
- $243,725 - $609,350: 35%
- $609,350+: 37%

**Married Filing Jointly:**
- $0 - $23,200: 10%
- $23,200 - $94,300: 12%
- $94,300 - $201,050: 22%
- $201,050 - $383,900: 24%
- $383,900 - $487,450: 32%
- $487,450 - $731,200: 35%
- $731,200+: 37%

### Capital Gains Tax Rates (2024)
**Long-term (held > 1 year):**
- Single:
  - $0 - $47,025: 0%
  - $47,025 - $518,900: 15%
  - $518,900+: 20%

- Married Filing Jointly:
  - $0 - $94,050: 0%
  - $94,050 - $583,750: 15%
  - $583,750+: 20%

**Short-term:** Same as ordinary income tax rates

### Standard Deductions
- 2024: Single $14,600, MFJ $29,200, MFS $14,600, HOH $21,900
- 2025: Single $15,000, MFJ $30,000, MFS $15,000, HOH $22,500 (estimated)
- 2026: Single $15,400, MFJ $30,800, MFS $15,400, HOH $23,100 (estimated)

### IRS Mileage Rates
- 2024: Charitable $0.14/mile
- 2025: Charitable $0.14/mile (unchanged)
- 2026: Charitable $0.14/mile (estimated unchanged)

## API Endpoints

### GET /api/tax/rates
```javascript
// Query params: year, filing_status, income
// Returns: marginal rate, effective rate, standard deduction
{
  "year": 2024,
  "filing_status": "single",
  "income": 75000,
  "marginal_rate": 0.22,
  "effective_rate": 0.1347,
  "standard_deduction": 14600,
  "brackets": [...],
  "capital_gains": {
    "long_term_rate": 0.15,
    "short_term_rate": 0.22
  }
}
```

### GET /api/tax/calculate-savings
```javascript
// Query params: year, filing_status, income, donation_amount, donation_type
// Returns: estimated tax savings
{
  "donation_amount": 1000,
  "marginal_rate": 0.22,
  "tax_savings": 220,
  "capital_gains_savings": 150, // if appreciated asset
  "total_benefit": 370
}
```

## Implementation Steps

### Phase 1: Database Setup
1. Create tables in D1
2. Populate with 2024 tax data
3. Add 2025 and 2026 estimated rates

### Phase 2: API Development
1. Create `/api/tax/rates` endpoint
2. Create `/api/tax/calculate-savings` endpoint
3. Add caching for performance

### Phase 3: Dashboard Integration
1. Replace hardcoded tax brackets with API calls
2. Update tax savings calculations
3. Add year selector for tax calculations

### Phase 4: Capital Gains Features
1. Add UI for cost basis entry (stock/crypto donations)
2. Calculate and display capital gains tax savings
3. Show total tax benefit (deduction + avoided gains)

## Benefits of This Approach

1. **Multi-year support:** Easy to handle different tax years
2. **Maintainability:** Update rates without code changes
3. **Accuracy:** Use correct rates for donation year
4. **Capital gains:** Properly calculate benefits of donating appreciated assets
5. **Future-proof:** Can add new tax rules/limits as needed

## Example Calculations

### Cash Donation
- Donation: $1,000
- Income: $75,000 (single)
- Marginal rate: 22%
- **Tax savings: $220**

### Appreciated Stock Donation
- Stock value: $1,000
- Cost basis: $400
- Held: 2 years (long-term)
- Income: $75,000 (single)
- Benefits:
  - Deduction at marginal rate: $1,000 × 22% = $220
  - Avoided capital gains: $600 × 15% = $90
  - **Total tax savings: $310**

This shows why donating appreciated assets is more tax-efficient!

## Migration Script
```sql
-- Run in Cloudflare D1 Console

-- Create tables
CREATE TABLE tax_brackets (...);
CREATE TABLE capital_gains_rates (...);
CREATE TABLE standard_deductions (...);
CREATE TABLE irs_mileage_rates (...);

-- Insert 2024 data
INSERT INTO tax_brackets (tax_year, filing_status, min_income, max_income, rate) VALUES
(2024, 'single', 0, 11600, 0.10),
(2024, 'single', 11600, 47150, 0.12),
-- ... etc

INSERT INTO standard_deductions (tax_year, filing_status, amount) VALUES
(2024, 'single', 14600),
(2024, 'married_jointly', 29200),
-- ... etc

INSERT INTO irs_mileage_rates (tax_year, purpose, rate) VALUES
(2024, 'charitable', 0.14),
(2025, 'charitable', 0.14),
(2026, 'charitable', 0.14);
```

## Notes
- Tax rates for 2025-2026 are estimates based on inflation adjustments
- Need to update annually when IRS releases official rates
- Consider adding AMT (Alternative Minimum Tax) calculations in future
- May want to add state tax tables for complete tax planning