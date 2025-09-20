# Charity Tracker Implementation Plan

## Overview
This plan prioritizes features based on user value, technical dependencies, and progressive enhancement of functionality. The system implements a **freemium model** with basic features free and advanced features requiring a paid subscription.

## 🔐 Phase 0: User Profile & Freemium Setup (Immediate)
**Goal:** Establish user profiles with tax information and subscription tiers

### 0.1 Enhanced User Profile
- [ ] User registration with complete profile
  - Name, address, email (existing)
  - **Filing status** (Single, Married Filing Jointly, Married Filing Separately, Head of Household, Qualifying Widow(er))
  - **Income bracket** (with IRS tax bracket lookup)
  - State of residence for state tax calculations
- [ ] Profile settings page
- [ ] Tax profile wizard on first login

### 0.2 Freemium Model Implementation
- [ ] **Free Tier Features:**
  - Track up to 10 donations per year
  - Basic charities list
  - Simple donation entry
  - Annual summary (view only)
- [ ] **Premium Tier Features ($29.99/year):**
  - Unlimited donations
  - Full charity database access
  - Receipt photo uploads
  - PDF/CSV exports
  - Tax savings calculator
  - Mileage tracking
  - Recurring donations
  - Bank import tools
  - Priority support

### 0.3 Subscription Management
- [ ] Payment integration (Stripe)
- [ ] Trial period (30 days full access)
- [ ] Upgrade/downgrade flow
- [ ] Renewal reminders
- [ ] License key system for offline validation

**Database Changes:**
```sql
-- Update users table
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN city TEXT;
ALTER TABLE users ADD COLUMN state TEXT;
ALTER TABLE users ADD COLUMN zip_code TEXT;
ALTER TABLE users ADD COLUMN filing_status TEXT DEFAULT 'single';
ALTER TABLE users ADD COLUMN income_bracket INTEGER;
ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_expires DATE;
ALTER TABLE users ADD COLUMN trial_ends DATE;

-- IRS tax brackets table
CREATE TABLE tax_brackets (
    year INTEGER NOT NULL,
    filing_status TEXT NOT NULL,
    min_income INTEGER NOT NULL,
    max_income INTEGER,
    tax_rate REAL NOT NULL,
    PRIMARY KEY (year, filing_status, min_income)
);

-- State tax rates
CREATE TABLE state_tax_rates (
    state TEXT PRIMARY KEY,
    tax_rate REAL,
    standard_deduction REAL
);
```

## 🎯 Phase 1: Core Donation Management (Week 1-2)
**Goal:** Enable users to track donations with full CRUD operations

### 1.1 Donation API Endpoints
- [ ] `POST /api/donations` - Create donation
- [ ] `GET /api/donations` - List donations (with filters)
- [ ] `PUT /api/donations/:id` - Update donation
- [ ] `DELETE /api/donations/:id` - Delete donation
- [ ] `GET /api/donations/stats` - Dashboard statistics

### 1.2 Donation UI Features
- [ ] Functional "Add Donation" form
- [ ] Donation list with edit/delete
- [ ] Real-time dashboard statistics
- [ ] Date range filtering
- [ ] Donation categories (Cash, Goods, Stocks, Crypto, Mileage)

### 1.3 Mileage Tracking Special Feature
- [ ] Mileage input fields in donation form
- [ ] IRS rate lookup table (by year)
- [ ] Automatic deduction calculation
- [ ] Purpose/destination tracking

**Database Changes:**
```sql
ALTER TABLE donations ADD COLUMN category TEXT DEFAULT 'cash';
ALTER TABLE donations ADD COLUMN miles_driven REAL;
ALTER TABLE donations ADD COLUMN mileage_rate REAL;
ALTER TABLE donations ADD COLUMN mileage_purpose TEXT;

CREATE TABLE mileage_rates (
    year INTEGER PRIMARY KEY,
    rate_per_mile REAL NOT NULL
);
```

## 🏛️ Phase 2: Enhanced Charity Management (Week 3-4)
**Goal:** Implement two-tier charity system with user additions and admin approval

### 2.1 Two-Tier Charity System
- [ ] Mark master charities vs user-added
- [ ] User charity submission endpoint
- [ ] Admin approval queue API
- [ ] Charity merge/duplicate detection

### 2.2 Charity Search & Discovery
- [ ] Advanced search with filters
- [ ] Autocomplete/typeahead
- [ ] Category browsing
- [ ] Favorite charities

### 2.3 Admin Features
- [ ] Admin approval dashboard
- [ ] EIN verification tools
- [ ] Bulk operations
- [ ] Charity data enrichment

**Database Changes:**
```sql
ALTER TABLE charities ADD COLUMN is_master BOOLEAN DEFAULT false;
ALTER TABLE charities ADD COLUMN status TEXT DEFAULT 'approved';
ALTER TABLE charities ADD COLUMN submitted_by TEXT;
ALTER TABLE charities ADD COLUMN approved_by TEXT;
ALTER TABLE charities ADD COLUMN approved_at DATETIME;

CREATE TABLE user_favorite_charities (
    user_id TEXT NOT NULL,
    charity_id TEXT NOT NULL,
    PRIMARY KEY (user_id, charity_id)
);
```

## 📊 Phase 3: Reports & Tax Features (Week 5-6)
**Goal:** Provide comprehensive tax reporting and documentation

### 3.1 Report Generation
- [ ] Annual tax summary
- [ ] Donation receipt generator
- [ ] Category breakdown reports
- [ ] Charity-wise summaries

### 3.2 Export Capabilities
- [ ] PDF generation with receipt images
- [ ] CSV export for tax software
- [ ] IRS Form 8283 helper
- [ ] Email reports

### 3.3 Tax Intelligence & Savings Calculator
- [ ] **Automatic tax savings calculation** based on:
  - User's filing status (from profile)
  - Income bracket (from profile)
  - Current year IRS tax rates
  - Total charitable deductions
- [ ] Real-time savings display on dashboard
- [ ] Deduction optimizer (standard vs itemized)
- [ ] State tax savings calculations
- [ ] Marginal vs effective rate calculations
- [ ] AMT (Alternative Minimum Tax) warnings
- [ ] Quarterly estimated tax impact

### 3.4 IRS Data Integration
- [ ] Import current year tax brackets
- [ ] Standard deduction amounts by filing status
- [ ] State tax rate tables
- [ ] Annual inflation adjustments
- [ ] Charitable deduction limits (60% AGI for cash, 30% for property)

**Database Changes:**
```sql
-- Tax calculations table
CREATE TABLE tax_calculations (
    user_id TEXT NOT NULL,
    tax_year INTEGER NOT NULL,
    filing_status TEXT NOT NULL,
    adjusted_gross_income REAL,
    total_donations REAL,
    standard_deduction REAL,
    itemized_deductions REAL,
    federal_tax_saved REAL,
    state_tax_saved REAL,
    effective_rate REAL,
    marginal_rate REAL,
    PRIMARY KEY (user_id, tax_year)
);

CREATE TABLE receipt_images (
    id TEXT PRIMARY KEY,
    donation_id TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Phase 4: Advanced Features (Week 7-8)
**Goal:** Add premium features for power users

### 4.1 Recurring Donations
- [ ] Recurring donation setup
- [ ] Automatic entry creation
- [ ] Reminder system
- [ ] Subscription management

### 4.2 Import/Export Tools
- [ ] Bank statement CSV parser
- [ ] Credit card import
- [ ] QuickBooks integration
- [ ] Batch entry tools

### 4.3 Cryptocurrency Support
- [ ] Crypto donation tracking
- [ ] Price lookup integration
- [ ] Basis tracking
- [ ] Gain/loss calculations

### 4.4 Goals & Budgets
- [ ] Annual giving goals
- [ ] Category budgets
- [ ] Progress tracking
- [ ] Insights & recommendations

**Database Changes:**
```sql
CREATE TABLE recurring_donations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    charity_id TEXT NOT NULL,
    amount REAL NOT NULL,
    frequency TEXT NOT NULL,
    next_date DATE,
    active BOOLEAN DEFAULT true
);

CREATE TABLE crypto_donations (
    donation_id TEXT PRIMARY KEY,
    crypto_type TEXT,
    crypto_amount REAL,
    usd_value_at_donation REAL,
    cost_basis REAL
);
```

## 📱 Phase 5: Mobile & Polish (Week 9-10)
**Goal:** Optimize for mobile and enhance UX

### 5.1 Mobile Optimization
- [ ] Responsive design improvements
- [ ] Touch-friendly interfaces
- [ ] Camera receipt capture
- [ ] Offline capability

### 5.2 User Experience
- [ ] Onboarding wizard
- [ ] Help documentation
- [ ] Keyboard shortcuts
- [ ] Dark mode

### 5.3 Performance
- [ ] Database indexing
- [ ] API caching
- [ ] Image optimization
- [ ] Lazy loading

## 🔧 Technical Implementation Notes

### API Structure
```
/api/
├── donations/
│   ├── GET    /           (list)
│   ├── POST   /           (create)
│   ├── GET    /:id        (read)
│   ├── PUT    /:id        (update)
│   ├── DELETE /:id        (delete)
│   ├── GET    /stats      (statistics)
│   └── GET    /export     (export)
├── charities/
│   ├── GET    /           (list/search)
│   ├── POST   /           (user submit)
│   ├── GET    /:id        (details)
│   ├── POST   /favorite   (add favorite)
│   └── GET    /pending    (admin queue)
├── reports/
│   ├── GET    /annual     (tax summary)
│   ├── GET    /receipt    (receipt PDF)
│   └── POST   /email      (email report)
└── admin/
    ├── POST   /approve    (approve charity)
    ├── POST   /merge      (merge duplicates)
    └── GET    /analytics  (system stats)
```

### Security Considerations
- JWT token validation on all protected endpoints
- Rate limiting on API calls
- Input sanitization
- File upload validation
- Admin role verification

### Testing Strategy
- Unit tests for API endpoints
- Integration tests for workflows
- E2E tests for critical paths
- Performance testing for reports

## 📈 Success Metrics

### Phase 1
- Users can add/edit/delete donations
- Dashboard shows accurate statistics
- Mileage calculations work correctly

### Phase 2
- Users can search all charities
- Users can add custom charities
- Admin can approve/reject submissions

### Phase 3
- Generate accurate tax reports
- Export data in multiple formats
- Calculate tax savings

### Phase 4
- Import transactions from banks
- Track recurring donations
- Support crypto donations

### Phase 5
- Mobile usage > 40%
- Page load < 2 seconds
- User satisfaction > 4.5/5

## 💰 Freemium Feature Matrix

| Feature | Free | Premium |
|---------|------|---------|
| **User Profile & Tax Info** | ✅ | ✅ |
| **Donation Tracking** | 10/year | Unlimited |
| **Basic Charity List** | ✅ | ✅ |
| **Full Charity Database** | ❌ | ✅ |
| **Add Custom Charities** | 1 | Unlimited |
| **View Annual Summary** | ✅ | ✅ |
| **Tax Savings Calculator** | Preview only | ✅ Full |
| **PDF/CSV Export** | ❌ | ✅ |
| **Receipt Photo Upload** | ❌ | ✅ |
| **Mileage Tracking** | ❌ | ✅ |
| **Bank Import** | ❌ | ✅ |
| **Recurring Donations** | ❌ | ✅ |
| **Cryptocurrency Tracking** | ❌ | ✅ |
| **Email Reports** | ❌ | ✅ |
| **Priority Support** | ❌ | ✅ |

## 🚦 Next Immediate Steps

1. **Today:** Start Phase 0 - User profile enhancements & freemium setup
2. **Tomorrow:** Add filing status and income bracket to registration
3. **This Week:** Implement subscription tiers and limits
4. **Next Week:** Begin Phase 1 donation tracking with free/premium checks

Ready to begin implementation when you're done testing!