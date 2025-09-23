# Charity Tracker Continuation Prompt - v2.1.17
## Last Updated: 2025-01-23

## CRITICAL VERSIONING POLICY
**EVERY deployment must bump the patch version**
- Use `npm run bump:patch` for every change deployment

## Current Issues Being Fixed
1. Mileage donations showing "0 miles" instead of "mileage" in type column
2. Miles field not being saved properly
3. View Details not showing miles driven
4. Donation amount persisting between donations
5. Tax savings showing $0 for mileage donations

## Recent Fixes (v2.1.15-17)
- Fixed charity ID being cleared when pre-populated from My Charities
- Fixed null reference errors when opening donation forms
- Added safety checks for form field clearing

## Key Code Locations

### Mileage Display Issue
- Line 2905: `typeDisplay = ${typeIcon} ${donation.miles_driven || 0} miles`
- Should just show type, not replace with miles count

### Form Data Submission
- Line 2544-2550: Mileage donation form data
- Sets miles_driven, mileage_rate, mileage_purpose, amount

### Tax Savings Calculation
- Line 3464-3466: Mileage tax calculation
- Should calculate: miles * 0.14 * tax_rate

### View Details Modal
- Line 5829-5831: Shows miles driven in details
- Need to ensure miles_driven is populated

## Database Schema
- donations table has miles_driven, mileage_rate, mileage_purpose fields
- donation_type should be 'miles' for mileage donations

## Test Status
✅ Add Donation modal opens
✅ Donation types switch correctly
✅ Charity search works
✅ Quick Add from My Charities works
❌ Mileage donations need fixes listed above