# CSV Import Data Requirements - Charity Tracker

## CSV Format for Donation Import

### Required Columns
```csv
date,charity_name,donation_type,amount,description,notes,stock_symbol,stock_quantity,fair_market_value,crypto_symbol,crypto_quantity,crypto_type,miles_driven,mileage_rate,mileage_purpose,items
```

### Column Details

1. **date**: Format YYYY-MM-DD (e.g., 2025-01-15)

2. **charity_name**: Common name that will be matched against IRS database
   - Examples: "American Red Cross", "Goodwill", "United Way"

3. **donation_type**: One of: cash, stock, crypto, miles, items

4. **amount**: Numeric value (total donation value)
   - For items: Can be 0 (values calculated from individual items)

5. **description**: Brief description of donation

6. **notes**: Additional notes from user

7. **Stock columns** (only for stock donations):
   - stock_symbol: e.g., "AAPL", "MSFT"
   - stock_quantity: Number of shares
   - fair_market_value: Price per share

8. **Crypto columns** (only for crypto donations):
   - crypto_symbol: e.g., "BTC", "ETH"
   - crypto_quantity: Amount of crypto
   - crypto_type: e.g., "Bitcoin", "Ethereum"

9. **Miles columns** (only for miles donations):
   - miles_driven: Number of miles
   - mileage_rate: Rate per mile (e.g., 0.14)
   - mileage_purpose: e.g., "Volunteer transport"

10. **items**: Pipe-separated list of items for items donations
    - Format: `ItemName:condition` or `ItemName:condition:quantity`
    - Multiple items: `Item1:condition|Item2:condition|Item3:condition`
    - Conditions: fair, good, very_good, excellent
    - Examples:
      - Single: `Coat:good`
      - Multiple: `Coat:good|Sweater:excellent|Jeans:fair`
      - With quantity: `Towels:good:3|Shoes:excellent:2`

### Important Notes

#### Item Donations
- Items must match names in the 497 IRS-based valuations database
- Common items: Coat, Sweater, Jeans, Dress, Shirt, Pants, Shoes, etc.
- Fair condition = $0 (tracked but not tax deductible)
- Good, very_good, excellent = tax deductible values from database

#### Charity Matching
- Uses fuzzy matching and alias system
- Common aliases handled automatically (e.g., "Red Cross" → "AMERICAN NATIONAL RED CROSS")
- Unmatched charities can be created as personal charities

### Sample Data Requirements for Multiple Users

When creating test data:

1. **Date Range**: Include multiple years (2024, 2025, 2026)
2. **Donation Types**: Mix of all types (cash, stock, crypto, miles, items)
3. **Items**:
   - Use actual item names from the 497 items database
   - Include all conditions (fair, good, very_good, excellent)
   - Multiple items per donation (realistic scenarios)
   - Some with quantities > 1

4. **Charities**:
   - Mix of common names that will match
   - Some that won't match (to test personal charity creation)

5. **Realistic Scenarios**:
   - Spring cleaning (multiple household items)
   - Clothing donations (seasonal cleanout)
   - Year-end giving (stocks/crypto)
   - Volunteer driving (miles)
   - Regular monthly cash donations

### Example CSV Row
```csv
2025-01-15,"Habitat for Humanity",items,0,"Clothing donation","Winter closet cleanout",,,,,,,,,"Coat:good|Sweater:excellent|Jeans:good|Dress:fair|Shoes:good:2|Handbag:very_good"
```

### Files Created
- `test_donations_final_50.csv` - 50 donations across 2024-2025 with all types
- Additional files can be created with same format for different users/scenarios