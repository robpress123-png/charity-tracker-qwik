# Charity Tracker Test Plan v2.2.9
**Date:** September 24, 2025
**Purpose:** Comprehensive testing after demo data upload

---

## 🎯 Test Objectives
1. Verify all demo data imports correctly
2. Test auto-logout functionality
3. Validate password reset features
4. Confirm all donation types work
5. Test year filtering and statistics
6. Verify admin functions

---

## 📊 Pre-Test Setup

### Users to Test
- **User 1:** test@example.com / password123 (existing data)
- **User 2-5:** To be imported with new diverse CSV files
- **Admin:** admin / admin123

### Data Files Prepared
- `test_user2_diverse_60.csv` - Medical/Health focus
- `test_user3_diverse_60.csv` - Arts/Culture focus
- `test_user4_diverse_60.csv` - Youth/Food Security focus
- `test_user5_diverse_60.csv` - Animals/Environment focus

---

## ✅ Test Cases

### 1. USER AUTHENTICATION & AUTO-LOGOUT

#### Test 1.1: Login Timeout Message
- [ ] Navigate to login.html?timeout=true
- [ ] Verify "logged out due to inactivity" message appears
- [ ] Login successfully redirects to dashboard

#### Test 1.2: Lost Password Link
- [ ] Click "Lost Password?" on login page
- [ ] Verify modal appears with "Coming Soon" message
- [ ] Confirm admin contact info shown
- [ ] Close modal works properly

#### Test 1.3: Auto-Logout Timer (User Dashboard)
- [ ] Login as test@example.com
- [ ] Leave idle for configured time (check admin setting)
- [ ] Verify 1-minute warning appears
- [ ] Click "Stay Logged In" - timer resets
- [ ] Let timeout expire - redirects to login with timeout=true

#### Test 1.4: Auto-Logout Timer (Admin Dashboard)
- [ ] Login as admin
- [ ] Check auto-logout configuration in User Management
- [ ] Change timeout setting (try 5 minutes)
- [ ] Verify setting saves and applies
- [ ] Test timeout with new setting

---

### 2. DATA IMPORT & VALIDATION

#### Test 2.1: Import User 2 Data
- [ ] Login as admin
- [ ] Go to Data Tools > Import Donations
- [ ] Select User 2 from dropdown
- [ ] Upload test_user2_diverse_60.csv
- [ ] Verify progress bar shows accurate progress
- [ ] Check import results:
  - [ ] 60 donations imported
  - [ ] ~75% charities matched
  - [ ] Personal charities created for unmatched
  - [ ] No errors reported

#### Test 2.2: Import User 3 Data
- [ ] Repeat for User 3 with arts/culture focused file
- [ ] Verify minimal charity overlap with User 2
- [ ] Confirm different charity categories imported

#### Test 2.3: Import User 4 Data
- [ ] Import youth/food security focused file
- [ ] Verify youth organizations imported correctly
- [ ] Check food bank entries

#### Test 2.4: Import User 5 Data
- [ ] Import animal/environment focused file
- [ ] Verify environmental charities imported
- [ ] Check wildlife organizations

#### Test 2.5: Verify Import Counts
- [ ] Check admin dashboard statistics
- [ ] Confirm total donations increased by 240
- [ ] Verify user donation counts show 60 each

---

### 3. DONATION TYPE VERIFICATION

#### Test 3.1: Cash Donations
- [ ] View each user's cash donations
- [ ] Verify amounts display correctly
- [ ] Check notes field populated

#### Test 3.2: Stock Donations
- [ ] Find stock donations (Dec 2025)
- [ ] Verify higher amounts (e.g., $2000-3000)
- [ ] Confirm marked as "stock" type

#### Test 3.3: Cryptocurrency Donations
- [ ] Locate crypto donations (May 2026)
- [ ] Verify crypto type displays
- [ ] Check amount formatting

#### Test 3.4: Mileage Donations
- [ ] Find miles donations (April 2026)
- [ ] Verify mileage amount
- [ ] Check calculation if displayed

#### Test 3.5: Items Donations
- [ ] Locate items donations
- [ ] Click to view item details
- [ ] Verify item breakdown shows:
  - [ ] Individual items listed
  - [ ] Quantities correct
  - [ ] Unit prices display
  - [ ] Total matches sum

---

### 4. YEAR FILTERING & STATISTICS

#### Test 4.1: Year Filter - 2024
- [ ] Select 2024 from year dropdown
- [ ] Verify only 2024 donations show
- [ ] Count should be ~15 per user
- [ ] Statistics update for 2024 only

#### Test 4.2: Year Filter - 2025
- [ ] Select 2025 (current year)
- [ ] Verify 2025 donations display
- [ ] Should be majority of donations
- [ ] Tax savings calculate correctly

#### Test 4.3: Year Filter - 2026
- [ ] Select 2026
- [ ] Verify only 2026 donations show
- [ ] Count should be ~5 per user
- [ ] Future year handled properly

#### Test 4.4: All Years View
- [ ] Select "All Years" option
- [ ] Verify all 60 donations visible
- [ ] Total amounts correct
- [ ] Charts show multi-year data

---

### 5. CHARITY MATCHING & PERSONAL CHARITIES

#### Test 5.1: Matched Charities
- [ ] Check charities like "AMERICAN RED CROSS"
- [ ] Verify EIN populated
- [ ] Category assigned correctly
- [ ] Show as verified (not personal)

#### Test 5.2: Personal Charities
- [ ] Find "Personal Charity" entries
- [ ] Verify marked as personal/unverified
- [ ] Can edit personal charity details
- [ ] Can match to database charity

#### Test 5.3: Charity Search
- [ ] Search for "Red Cross"
- [ ] Verify autocomplete works
- [ ] Results show from database
- [ ] Can select and use in donation

---

### 6. ADMIN FUNCTIONS

#### Test 6.1: User Management
- [ ] View all users in admin panel
- [ ] See donation counts (60 each for users 2-5)
- [ ] Total donation amounts display
- [ ] Edit user opens modal

#### Test 6.2: Password Reset
- [ ] Click Edit on any user
- [ ] Click "Reset Password"
- [ ] Verify temporary password generated
- [ ] Note shows to share securely
- [ ] Close modal works

#### Test 6.3: Auto-Logout Settings
- [ ] Find timeout setting in User Management
- [ ] Current value shows (30 min default)
- [ ] Change to different value
- [ ] Save and verify "Updated" message
- [ ] New timeout applies to sessions

#### Test 6.4: Export Functions
- [ ] Export all donations
- [ ] Verify includes all users' data
- [ ] Check CSV format correct
- [ ] Try user-specific export

#### Test 6.5: Database Statistics
- [ ] Check total donations count
- [ ] Verify total users (5+)
- [ ] Total charities in database
- [ ] Items table count

---

### 7. EXPORT & REPORTING

#### Test 7.1: CSV Export (User)
- [ ] Login as regular user
- [ ] Export donations as CSV
- [ ] Verify all donations included
- [ ] Check proper CSV formatting
- [ ] Items details included

#### Test 7.2: Tax Report Generation
- [ ] Generate 2024 tax report
- [ ] Verify summary calculations
- [ ] Check categorization
- [ ] Validate deduction amounts

#### Test 7.3: Donation Receipt
- [ ] View individual donation
- [ ] Generate receipt
- [ ] Verify all details present
- [ ] Print preview works

---

### 8. PERFORMANCE TESTING

#### Test 8.1: Large Data Load
- [ ] View user with 60 donations
- [ ] Page loads within 3 seconds
- [ ] Scrolling smooth
- [ ] Filtering responsive

#### Test 8.2: Search Performance
- [ ] Search charities with many results
- [ ] Autocomplete responds quickly
- [ ] No lag in suggestions

#### Test 8.3: Import Performance
- [ ] Import 60-donation file
- [ ] Completes within 30 seconds
- [ ] Progress bar updates smoothly
- [ ] No timeouts

---

### 9. ERROR HANDLING

#### Test 9.1: Duplicate Import
- [ ] Try importing same file twice
- [ ] Verify duplicate detection
- [ ] Appropriate error message
- [ ] No data corruption

#### Test 9.2: Invalid Data
- [ ] Modify CSV with bad data
- [ ] Try import
- [ ] Error handling graceful
- [ ] Valid rows still import

#### Test 9.3: Session Timeout
- [ ] Trigger auto-logout
- [ ] Try action after logout
- [ ] Redirects to login properly
- [ ] No data loss

---

### 10. CROSS-USER VALIDATION

#### Test 10.1: Data Isolation
- [ ] Login as User 2
- [ ] Verify only sees own 60 donations
- [ ] Cannot see User 3's data
- [ ] Personal charities are private

#### Test 10.2: Charity Diversity
- [ ] Compare charities across users
- [ ] Verify minimal overlap
- [ ] Each user has unique focus area
- [ ] Shared charities handled correctly

---

## 📈 Expected Results Summary

### After Full Import:
- **Total Donations:** ~300+ (60 per user x 4 users + existing)
- **Charity Matches:** ~75% matched to database
- **Personal Charities:** ~25% created as personal
- **Year Distribution:**
  - 2024: ~60-75 donations
  - 2025: ~150-170 donations
  - 2026: ~60-75 donations
- **Donation Types:**
  - Cash: ~85%
  - Items: ~8%
  - Stock: ~3%
  - Crypto: ~2%
  - Miles: ~2%

---

## 🐛 Known Issues to Verify Fixed

1. **Auto-logout with warning** - Should show 1-min warning
2. **Password reset in admin** - Should generate temp password
3. **Import progress accuracy** - Bar should match actual progress
4. **Year selector default** - Should default to 2025
5. **Tax savings calculation** - Updates when items added/removed

---

## 📝 Test Sign-off

**Tester:** _____________________
**Date:** _____________________
**Version:** 2.2.9
**Environment:** Production (charity-tracker-qwik.pages.dev)

### Overall Results:
- [ ] All tests passed
- [ ] Issues found (document below)
- [ ] Retesting required

### Notes/Issues Found:
```
[Document any issues here]




```

---

## 🚀 Post-Test Actions

1. Document any bugs found
2. Update CONTINUATION_PROMPT with test results
3. Plan fixes for any issues
4. Prepare for freemium implementation
5. Consider user training materials

---

**End of Test Plan v2.2.9**