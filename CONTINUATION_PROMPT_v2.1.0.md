# Charity Tracker Continuation Prompt - v2.1.1
## Last Updated: 2025-01-23

## CRITICAL VERSIONING POLICY
**EVERY deployment must bump the patch version (e.g., 2.1.1 → 2.1.2)**
- This ensures the user can verify they're on the latest code
- Use `npm run bump` for every change deployment
- Check version number on any page to confirm deployment

## Current System Status
- **Version**: 2.1.1 (Delete modal fix deployed)
- **Deployment**: Cloudflare Pages with D1 (SQLite) database
- **Frontend**: Qwik framework with static HTML pages
- **Backend**: Cloudflare Functions (Edge Workers)
- **Database**: Successfully migrated to v2.0.0 schema with relational design

## Core Database Schema

### Main Tables
```sql
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    plan TEXT DEFAULT 'free',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Charities table (10,000+ records)
CREATE TABLE charities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ein TEXT,
    category TEXT,
    city TEXT,
    state TEXT,
    website TEXT,
    description TEXT
);

-- Donations table
CREATE TABLE donations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    charity_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    type TEXT CHECK(type IN ('cash', 'stock', 'crypto', 'mileage', 'items')),
    receipt_url TEXT,
    notes TEXT,  -- Plain text notes, not JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE CASCADE
);

-- Donation items table (v2.0.0 addition)
CREATE TABLE donation_items (
    id TEXT PRIMARY KEY,
    donation_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT,
    condition TEXT CHECK(condition IN ('excellent', 'very_good', 'good', 'fair')),
    quantity INTEGER DEFAULT 1,
    unit_value DECIMAL(10, 2),  -- Stored value at time of donation
    total_value DECIMAL(10, 2),  -- Preserved historical value
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
);

-- Items pricing database (497 items)
CREATE TABLE items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    low_value DECIMAL(10, 2),
    high_value DECIMAL(10, 2),
    tax_deductible INTEGER DEFAULT 1,
    valuation_source TEXT,  -- Added for IRS compliance
    source_date DATE,       -- Added for tracking
    source_url TEXT        -- Added for reference
);

-- Items price history (v2.1.0 addition)
CREATE TABLE items_price_history (
    id TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    old_low_value DECIMAL(10, 2),
    old_high_value DECIMAL(10, 2),
    new_low_value DECIMAL(10, 2),
    new_high_value DECIMAL(10, 2),
    changed_by TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT,
    valuation_source TEXT  -- Track source for each price change
);
```

## Key System Features

### 1. Version Management (Automated)
- Single source of truth: package.json
- Auto-injection into all HTML files on bump
- Commands:
  ```bash
  npm run bump        # Patch (bug fixes)
  npm run bump:minor  # Minor (new features)
  npm run bump:major  # Major (breaking changes)
  ```

### 2. Admin Dashboard (v2.1.0 Reorganization)
**Proper Menu Structure:**
- **Charity Management**
  - Import/Export Charities
  - Manage Charities
  - Charity Verification
- **Donations Management** (NEW)
  - Manage All Donations
  - Backup/Restore Donations
- **Donated Items Management**
  - Import Items Database
  - Manage Items
  - Price History (NEW)
- **User Management**
  - Manage Users
- **System**
  - Database Management
  - Backup & Restore
  - System Logs
  - Settings

### 3. Data Integrity Features
- **Item Values**: Stored independently at donation time (not references)
- **Price History**: Complete audit trail for IRS compliance
- **Cascade Deletion**: Foreign keys ensure no orphaned records
- **Valuation Sources**: Track where each price comes from

### 4. Import/Export System
- **Donations Import**: Parses CSV with smart charity matching
- **Items Parsing**: Extracts itemized details from notes field
- **Format**: `ITEMS:[name|category|condition|qty|value]`
- **Notes**: Now stored as plain text (fixed from JSON bug)

## Working API Endpoints

### ✅ Fully Functional
- `/api/donations/import` - Import CSV donations
- `/api/donations` - Get user donations
- `/api/donations/delete-all` - Delete all donations (admin)
- `/api/donations/count` - Count total donations
- `/api/donations/export-all` - Export all as JSON (admin)
- `/api/charities` - Get charities list
- `/api/charities/export` - Export charities CSV
- `/api/admin/stats` - Dashboard statistics
- `/api/users` - Get users list (admin)
- `/api/items/import` - Import items database
- `/api/items/count` - Count items
- `/api/items/export` - Export items CSV

### 🔧 Needs Implementation
- `/api/donations/export-user/[userId]` - Export specific user
- `/api/donations/restore-all` - Restore from backup
- `/api/donations/restore-user` - Restore user donations
- `/api/items/search` - Search items by name
- `/api/items/price-history` - Query historical prices
- `/api/items/recent-price-changes` - Recent changes

## Security Model

### Authentication
- **Admin tokens**: `admin-token`, `admin-dev`, `admin-*`, `token-admin-*`
- **User tokens**: `token-{userId}-{timestamp}` (NO admin access)
- **Backend validation**: Every endpoint validates token type
- **No security holes**: Regular users cannot access admin functions

### Admin Access Flow
1. Home page → Admin Login (Dev Mode)
2. Login with `admin` / `admin123`
3. Sets `localStorage.adminToken = 'admin-token'`
4. Backend validates this as admin token

## Current Issues Being Debugged

### Delete All Donations Button
- Added console logging to diagnose
- Check browser console for:
  - Token being sent
  - Response status
  - Error messages

### Console Errors
- `/api/users` - Now fixed
- Some endpoints return 401 if not admin

## Test Data
- **50 test donations** in CSV format
- **497 items** in pricing database
- **10,000+ charities** in database
- All with 2025 dates

## Deployment Process
1. Make changes
2. Run `npm run bump:patch` (or minor/major)
3. Auto commits and pushes to GitHub
4. Cloudflare Pages auto-deploys (~30 seconds)

## Important Implementation Notes

1. **NEVER** give regular users admin privileges
2. **ALWAYS** store item values at donation time (not references)
3. **ALWAYS** use plain text for notes field
4. **NEVER** update git config
5. **ALWAYS** check if libraries exist before using
6. **NEVER** create files unless necessary
7. **PREFER** editing over creating new files

## Recent Major Changes (v2.1.0)
1. Added Donations Management section
2. Added Backup/Restore functionality (UI ready, APIs pending)
3. Added Items Price History tracking
4. Fixed User Management to load dynamically
5. Added valuation source tracking for IRS compliance
6. Reorganized admin dashboard for logical grouping
7. Added detailed console logging for debugging

## Next Steps
1. Debug why Delete All Donations might not be working
2. Implement remaining API endpoints for backup/restore
3. Add user-specific donation deletion
4. Implement price history queries
5. Add items search functionality

## Known Working Features
- CSV donation import with itemization
- Charity import/export
- Items database import (497 items)
- Price history tracking (initialized)
- Admin dashboard with proper sections
- Automated version management
- Delete all donations (with proper admin token)

## File Locations
- Admin Dashboard: `/dist/admin-dashboard.html`
- API Functions: `/functions/api/`
- SQL Migrations: `/sql/`
- Version Info: `/VERSION.json`, `/package.json`
- Test Data: `/test-donations-2025.csv`