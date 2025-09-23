# Charity Tracker Continuation Prompt - v2.1.19
## Last Updated: 2025-01-23

## 🚨 CRITICAL DATA ARCHITECTURE RULES 🚨

### DATABASE FIELD USAGE
**THE `notes` FIELD IS ONLY FOR USER-ENTERED NOTES**
- NEVER store system data, JSON, or structured data in the notes field
- The notes field should ONLY contain text that the user typed in the notes input
- All donation data (miles_driven, stock_symbol, etc.) must be stored in their proper database columns
- The database has dedicated columns for all donation types - USE THEM

### PROPER DATA STORAGE
- miles_driven, mileage_rate, mileage_purpose → Store in their respective columns
- stock_symbol, stock_quantity, fair_market_value → Store in their respective columns
- crypto_symbol, crypto_quantity, crypto_type → Store in their respective columns
- item_description, estimated_value → Store in their respective columns
- notes → ONLY for user's optional text notes about the donation

### LOCAL STORAGE USAGE RULES
**This is a multi-user database-driven application**
- localStorage should ONLY be used for:
  - User authentication tokens
  - User preferences (tax rate, profile)
  - Temporary UI state (not business data)
- NEVER use localStorage as primary data storage
- ALWAYS fetch fresh data from the database for:
  - Viewing donations
  - Editing donations
  - Calculating statistics
- localStorage copies of donations are for offline fallback ONLY

## CRITICAL VERSIONING POLICY
**EVERY deployment must bump the patch version**
- Use `npm run bump:patch` for every change deployment

## Recent Fixes (v2.1.18-19)
- Fixed API to use proper database columns instead of JSON in notes field
- Updated editDonation to fetch from API instead of localStorage
- Fixed field ID mismatches (stockQuantity vs stockShares)
- Added proper mileage_rate storage and retrieval for historical accuracy
- Cleaned up improper use of notes field for data storage

## Database Schema Reminder
The donations table has these dedicated columns:
- **Core**: id, user_id, charity_id, amount, date, donation_type, notes, receipt_url
- **Mileage**: miles_driven, mileage_rate, mileage_purpose
- **Stock**: stock_symbol, stock_quantity, fair_market_value
- **Crypto**: crypto_symbol, crypto_quantity, crypto_type
- **Items**: item_description, estimated_value (+ separate donation_items table)

## API Endpoints
- GET /api/donations - List all donations (includes all columns)
- GET /api/donations/{id} - Get single donation (includes all columns)
- POST /api/donations - Create donation (saves to proper columns)
- PUT /api/donations/{id} - Update donation (updates proper columns)
- DELETE /api/donations/{id} - Delete donation

## Testing Checklist
✅ Mileage type displays as "mileage" not "X miles"
✅ Miles field saves to miles_driven column
✅ Edit donation fetches from database, not localStorage
✅ Mileage rate is stored with each donation
✅ Notes field only contains user-entered text
✅ All donation types save to proper columns

## Known Issues
- Deployment requires manual Cloudflare dashboard updates
- Performance warning on delete (non-critical)

## Development Guidelines
1. ALWAYS use database columns for data storage
2. NEVER pack multiple fields into JSON in notes
3. Fetch fresh data from API for all operations
4. Use localStorage only for auth and preferences
5. Test with multiple users to ensure data isolation
6. Bump version on every deployment

## Deployment Instructions (AUTO-DEPLOY via GitHub)
1. Update version in dashboard.html title and any VERSION constants
2. Run `npm run bump:patch` to update package.json
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "v2.1.19: Fix database column usage and mileage editing"
   git push origin main
   ```
4. **Cloudflare Pages will automatically deploy from GitHub**
   - URL: https://charity-tracker-qwik.pages.dev
   - GitHub repo: https://github.com/robpress123-png/charity-tracker-qwik
5. Test all donation types after deployment

**DO NOT use wrangler deploy directly - always go through GitHub for auto-deployment**

## Files Structure
- `/dist/dashboard.html` - Main application file
- `/functions/api/donations.js` - Main donations API
- `/functions/api/donations/[id].js` - Single donation operations
- `/functions/api/auth/*` - Authentication endpoints
- `/functions/api/charities/*` - Charity management

Remember: This is a production multi-user application. Data integrity and proper database usage are critical!