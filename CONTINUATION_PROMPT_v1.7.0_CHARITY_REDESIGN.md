# Charity Tracker - Continuation Prompt v1.7.0
## Major Architecture Redesign: Multi-User Charity System
## Date: 2025-01-21

### 🔄 CURRENT TASK: Implementing Separate Tables for System vs User Charities

### PROJECT LOCATION
- **Main directory**: `/home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik`
- **Live site**: https://charity-tracker-qwik.pages.dev
- **GitHub**: https://github.com/robpress123-png/charity-tracker-qwik
- **Backup created**: `../backup-before-charity-redesign-20250921-201532.tar.gz`

### CRITICAL CONTEXT: Why This Redesign

**Previous Problem**: All charities were in one table with user_id field, mixing system and user data. This would create 60,000+ records with 5,000 users.

**New Architecture**: Separate tables for clean data separation:
- `charities` - System-wide IRS-verified charities (10,000 records)
- `user_charities` - Personal user-created charities
- `donations` - Can reference either table

**Key Design Decisions**:
1. User charities are IMMEDIATELY available (no waiting for approval)
2. Review process is transparent to users
3. Approved charities get promoted to system table
4. All donations automatically switch to reference system charity

### DATABASE SCHEMA CHANGES (TO BE IMPLEMENTED)

```sql
-- System charities (no user_id, available to all)
CREATE TABLE charities (
    id, name, ein, category, address, city, state,
    zip_code, website, description, phone, is_verified
);

-- User personal charities
CREATE TABLE user_charities (
    id, user_id, name, ein, category, address, city,
    state, zip_code, status (pending_review/approved/rejected)
);

-- Donations can reference either
CREATE TABLE donations (
    charity_id,        -- References system charity
    user_charity_id,   -- OR references user charity
    CHECK (exactly one is NOT NULL)
);
```

### FILES CREATED FOR REDESIGN
- `/sql/redesign_charity_tables.sql` - Complete table redesign
- `/sql/charity_conversion_logic.sql` - Admin approval process
- `/sql/fix_charity_ownership.sql` - Initial ownership fix attempt

### IMPORT DATA READY
- **File**: `charities_10k_full.csv`
- **Contains**: 10,000 IRS-verified 501(c)(3) charities
- **Fields**: name, ein, category, address, city, state, zip_code, description
- **Revenue**: Ranges from $31M to $75B in descriptions

### AUTHENTICATION STATUS
- Admin login fixed to use `admin-token`
- Import endpoint updated to handle system user
- Test user: test@example.com / password123
- Admin: admin / admin123

### NEXT STEPS IN ORDER

1. **Run database redesign SQL** (in D1 console)
   - Create new table structure
   - Migrate existing data
   - Drop old tables

2. **Update import.js**
   - Remove user_id requirement
   - Import directly to charities table

3. **Import 10,000 charities**
   - Use admin tool with `charities_10k_full.csv`

4. **Update API endpoints**
   - Charities endpoint to return both system and user charities
   - Add endpoint for creating user charities
   - Add admin review queue endpoint

5. **Update UI**
   - Show both charity types in dropdown
   - Add "Add Custom Charity" option
   - Create admin review queue interface

### KEY API FILES TO UPDATE
- `/functions/api/charities/import.js` - Remove user_id dependency
- `/functions/api/charities/index.js` - Return both charity types
- `/functions/api/donations/index.js` - Handle both charity_id types
- NEW: `/functions/api/charities/user.js` - User charity CRUD
- NEW: `/functions/api/admin/review-queue.js` - Admin review

### CRITICAL REMINDERS
- **Multi-user goal**: System must support 5,000+ users
- **User experience**: Custom charities must be immediately available
- **Data integrity**: Keep IRS-verified data separate and clean
- **Admin workflow**: Review queue for promoting user charities
- **No breaking changes**: Existing donations must continue working
- **Be objective**: Always provide honest technical assessment, even if it contradicts suggestions. The user values objective analysis over agreement.

### TEST CREDENTIALS
- Regular user: test@example.com / password123
- Admin: admin / admin123
- Admin dashboard: /admin-dashboard.html

### CURRENT TODOS
1. ✅ Design separate tables for system vs user charities
2. 🔄 Implement charity table redesign in database
3. ⏳ Update import script to use new charities table
4. ⏳ Import the 10,000 501(c)(3) verified charities
5. ⏳ Add admin review queue for user charities
6. ⏳ Test the multi-user functionality

### ERROR HISTORY & FIXES
- ❌ FOREIGN KEY constraint failed → Fixed by using test@example.com user
- ❌ Import only processed 50 → Fixed batch size
- ❌ 401 Unauthorized → Fixed admin token to 'admin-token'

### COMMANDS TO REMEMBER
```bash
# Deploy changes
git add -A && git commit -m "message" && git push origin main

# Check logs
npx wrangler pages deployment tail

# Local development (requires Node 20)
source ~/.nvm/nvm.sh && nvm use 20
npx wrangler pages dev dist --port 8789 --persist-to .wrangler/state
```

---
**Use this prompt to continue development from the charity table redesign point**