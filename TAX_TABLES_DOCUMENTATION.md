# Tax Tables Documentation

## Overview
This document describes the tax table structure and CSV format for the Charity Tracker application's tax calculation system, covering years 2024-2026.

## Database Tables Structure

### 1. tax_brackets
Stores federal income tax brackets for each year and filing status.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (auto-generated) |
| tax_year | INTEGER | Tax year (2024, 2025, 2026) |
| filing_status | TEXT | single, married_jointly, married_separately, head_of_household |
| min_income | DECIMAL(10,2) | Lower bound of income bracket |
| max_income | DECIMAL(10,2) | Upper bound (NULL for top bracket) |
| rate | DECIMAL(5,4) | Tax rate (0.10, 0.12, 0.22, etc.) |

**Example**: Single filer in 2024 with income $50,000 falls in the 22% bracket (range: $47,150-$100,525)

### 2. capital_gains_rates
Stores long-term capital gains tax rates.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (auto-generated) |
| tax_year | INTEGER | Tax year |
| filing_status | TEXT | Filing status |
| gain_type | TEXT | "long_term" (short_term uses regular brackets) |
| min_income | DECIMAL(10,2) | Lower bound of income |
| max_income | DECIMAL(10,2) | Upper bound (NULL for top) |
| rate | DECIMAL(5,4) | Capital gains rate (0.00, 0.15, 0.20) |

**Key Rates**: 0% (low income), 15% (middle), 20% (high income)

### 3. standard_deductions
Stores standard deduction amounts by year and filing status.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| tax_year | INTEGER | Tax year |
| filing_status | TEXT | Filing status |
| amount | DECIMAL(10,2) | Standard deduction amount |

**2025 Values**: Single: $15,000, Married Filing Jointly: $30,000

### 4. irs_mileage_rates
Stores IRS mileage rates for different purposes.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| tax_year | INTEGER | Tax year |
| purpose | TEXT | charitable, medical, business |
| rate | DECIMAL(5,3) | Rate per mile |
| effective_date | DATE | When rate takes effect |

**Charitable Rate**: $0.14/mile (unchanged 2024-2026)

### 5. contribution_limits
Stores special rules and limits, especially 2026 OBBBA changes.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| tax_year | INTEGER | Tax year |
| rule_type | TEXT | agi_floor, rate_cap, standard_deduction_addon |
| filing_status | TEXT | Filing status (NULL if applies to all) |
| value | DECIMAL(10,4) | Numeric value of the rule |
| description | TEXT | Human-readable description |

**2026 OBBBA Rules**:
- `agi_floor`: 0.005 (0.5% of AGI must be exceeded)
- `rate_cap`: 0.35 (maximum benefit even if in 37% bracket)
- `standard_deduction_addon`: $1,000 single, $2,000 married (cash donations for non-itemizers)

### 6. user_tax_settings
Stores user's tax bracket selection by year (privacy-friendly - no income stored).

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| user_id | TEXT | User identifier |
| tax_year | INTEGER | Tax year |
| filing_status | TEXT | User's filing status |
| tax_bracket | DECIMAL(5,4) | Selected tax rate (0.22, 0.24, etc.) |
| agi_range | TEXT | Optional AGI range for 2026 floor calc |

## CSV File Format

The unified CSV file (`all_tax_data_2024_2026.csv`) uses a single format with the first column identifying which table the row belongs to.

### CSV Column Structure
```csv
table_type,tax_year,filing_status,gain_type,purpose,rule_type,min_income,max_income,rate,amount,value,description,effective_date
```

### Column Usage by Table Type

| table_type | Uses These Columns |
|------------|-------------------|
| tax_brackets | tax_year, filing_status, min_income, max_income, rate |
| capital_gains | tax_year, filing_status, gain_type, min_income, max_income, rate |
| standard_deductions | tax_year, filing_status, amount |
| mileage_rates | tax_year, purpose, rate, effective_date |
| contribution_limits | tax_year, filing_status, rule_type, value, description |

### Sample CSV Rows

```csv
# Tax bracket example
tax_brackets,2024,single,,,,0,11600,0.10,,,,

# Capital gains example
capital_gains,2024,single,long_term,,,0,47025,0.00,,,,

# Standard deduction example
standard_deductions,2024,single,,,,,,,14600,,,

# Mileage rate example
mileage_rates,2024,,charitable,,,,0.14,,,,,2024-01-01

# Contribution limit example (2026 OBBBA)
contribution_limits,2026,,,agi_floor,,,,,0.005,0.5% of AGI floor for itemized charitable deductions (OBBBA),
```

## Tax Rate Progression Examples

### 2024 → 2025 → 2026 Changes

**Single Filer Brackets**:
- 10% bracket top: $11,600 → $11,925 → $12,225
- 12% bracket top: $47,150 → $48,475 → $49,700
- 22% bracket top: $100,525 → $103,350 → $105,950

**Standard Deductions**:
- Single: $14,600 → $15,000 → $15,375
- MFJ: $29,200 → $30,000 → $30,750

## 2026 OBBBA Special Rules

### AGI Floor (0.5%)
For someone with $100,000 AGI:
- First $500 in donations provides NO tax benefit
- Only donations above $500 are deductible

### Rate Cap (35%)
For someone in the 37% bracket:
- Normal income deduction: 37% benefit
- Charitable deduction: Capped at 35% benefit
- Loses 2% of benefit on charitable gifts

### Non-Itemizer Deduction
New in 2026 for those taking standard deduction:
- Single: Can deduct up to $1,000 in cash donations
- Married Filing Jointly: Can deduct up to $2,000
- Not available for donations to DAFs or private foundations

## Import Process

1. **Create Tables**: Run the SQL CREATE statements in D1 console
2. **Import Data**: Upload `all_tax_data_2024_2026.csv` via admin panel
3. **Verify Import**: Check row counts match expected values

### Expected Row Counts After Import
- tax_brackets: 84 rows
- capital_gains_rates: 36 rows
- standard_deductions: 12 rows
- irs_mileage_rates: 9 rows
- contribution_limits: 10 rows

## Privacy Design

The system is designed to protect user privacy:
- Users select their **tax bracket** (10%, 12%, 22%, etc.), not income amount
- Optional AGI range only for 2026 floor calculation
- No actual income amounts are stored
- All calculations done locally

## Maintenance

### Adding Future Years
1. Add new rows to the CSV with the new tax_year
2. Re-import via admin panel (uses INSERT OR REPLACE)
3. No code changes needed

### Updating Rates
1. Edit the CSV file with new rates
2. Re-import to update existing data
3. Changes take effect immediately

## API Integration Points

Future endpoints to implement:
- `/api/tax/get-settings` - Get user's tax settings for a year
- `/api/tax/save-settings` - Save user's bracket selection
- `/api/tax/calculate-savings` - Calculate tax savings for a donation

## Key Calculations

### Basic Tax Savings
```
Tax Savings = Donation Amount × User's Tax Bracket
```

### Stock/Crypto Donation Benefit
```
Tax Savings = (Donation Amount × Tax Bracket) + (Capital Gain × Capital Gains Rate)
```
This is why donating appreciated assets is more tax-efficient!

### 2026 Calculation with Floor
```
If (Total Donations <= AGI × 0.005):
    Tax Savings = 0
Else:
    Deductible = Total Donations - (AGI × 0.005)
    Tax Savings = Deductible × MIN(Tax Bracket, 0.35)
```