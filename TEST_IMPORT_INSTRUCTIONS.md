# Testing Import Feature v2.1.24

## Test File Location
`test_donations_comprehensive_50.csv`

## Test URL
https://charity-tracker-qwik.pages.dev

## Testing Steps

### 1. Login
- Go to https://charity-tracker-qwik.pages.dev
- Use test credentials or create account

### 2. Navigate to Import
- Click "Tools" in navigation
- Click "Import Donations" card

### 3. Upload Test File
- Drag and drop `test_donations_comprehensive_50.csv`
- OR click to browse and select file

### 4. Verify Preview
Should show:
- 50 total donations
- Mix of cash, stock, crypto, miles, items
- Total amount calculated
- All rows displayed in preview table

### 5. Click "Validate & Match Charities"
Should trigger validation and show:
- Charity matching screen for unmatched names
- Multiple match options with confidence scores
- Option to create as personal charity

### 6. Confirm Charity Matches
- Review suggested matches
- Select preferred charity for each
- OR choose to create as personal charity

### 7. Click "Confirm Import"
Should show:
- Import progress
- Success message with count
- Any failed imports
- Done button

## Expected Results

### Items Donations Format
Items should parse correctly from format:
```
"item_name|category|condition|quantity|value,item_name|category|condition|quantity|value"
```

Example from test file:
```
"Clothing|Clothing - Children|excellent|25|250.00,Coats|Clothing - Outerwear|very_good|10|300.00,Shoes|Footwear|good|15|200.00"
```

### Charity Matching
Common names will need matching:
- "American Red Cross" → IRS registered charity
- "Habitat for Humanity" → IRS registered charity
- etc.

## Known Test Scenarios

1. **All charity names match** → Direct import
2. **Some charities don't match** → Confirmation dialog
3. **Create personal charities** → New personal charities added
4. **Mixed donation types** → All types handled correctly
5. **Items with multiple entries** → Proper donation_items table entries

## Database Verification

After import, check:
1. Dashboard shows 50 new donations
2. Reports show all donation types
3. Items donations have entries in donation_items table
4. Personal charities created if selected