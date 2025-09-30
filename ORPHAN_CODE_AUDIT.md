# Orphan Code Audit - Charity Tracker v2.12.1

## Summary
You're absolutely right - there is significant orphan code in the application that should be cleaned up.

## Identified Orphan Files

### JavaScript Files
1. **reports-module.js** (28KB)
   - Status: ORPHAN - Not referenced anywhere
   - Original incomplete version, replaced by reports-module-v2.js
   - Can be safely deleted

### HTML Backup Files
1. **dashboard-backup-20250121.html**
2. **dashboard_v2.11.29_backup.html**
3. **dashboard_v2.11.40_backup.html**
4. **register_backup_v2.11.33.html**
   - Status: ALL ORPHAN - Old backup files
   - Can be safely deleted unless needed for rollback

## Files That Should Be Kept
1. **reports-module-v2.js** - Currently in use by dashboard.html
2. **storage-helper.js** - Used by 5+ HTML files for auth
3. All main HTML files (index, dashboard, register, login, admin-dashboard)

## Recommended Cleanup Actions

### Immediate Cleanup (Safe to Delete)
```bash
# Remove orphan JS file
rm dist/js/reports-module.js

# Remove old backup HTML files
rm dist/dashboard-backup-20250121.html
rm dist/dashboard_v2.11.29_backup.html
rm dist/dashboard_v2.11.40_backup.html
rm dist/register_backup_v2.11.33.html
```

### Consider Consolidating
1. **Reports Module Naming**
   - Current: reports-module-v2.js
   - Consider renaming to just: reports-module.js (after deleting old one)
   - This would be cleaner and avoid version numbers in filenames

## Impact Analysis
- Removing these orphan files would:
  - Save ~150KB of unnecessary code
  - Reduce confusion about which files are active
  - Clean up the deployment package
  - Make the codebase easier to maintain

## Version Control Consideration
Since all changes are in git history, these backup files can be safely removed. They can always be recovered from git if needed.

## Recommendation
Clean up all identified orphan files before the next deployment to maintain a cleaner codebase.