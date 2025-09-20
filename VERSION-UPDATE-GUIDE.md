# Version Update Guide for Charity Tracker

## ⚡ Quick Version Update

To update the version number (displayed on login screen):

1. **Update version in TWO places:**
   ```bash
   # 1. Update src/lib/version.ts
   export const APP_VERSION = '1.0.1';  # Change this number

   # 2. Update package.json
   "version": "1.0.1",  # Must match above
   ```

2. **Add to version history (optional):**
   ```typescript
   // In src/lib/version.ts
   export const VERSION_HISTORY = [
     { version: '1.0.1', date: '2025-01-20', changes: 'Added version tracking' },
     { version: '1.0.0', date: '2025-01-20', changes: 'Initial release' }
   ];
   ```

## 🎯 Version Display Locations

The version is currently displayed:
- **Login page header**: "Charity Tracker v1.0.0"
- **Register page header**: Same as login
- **Package.json**: For npm/build tracking

## 📋 Version Numbering Guide

Use semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR** (1.x.x): Breaking changes, major rewrites
- **MINOR** (x.1.x): New features, non-breaking changes
- **PATCH** (x.x.1): Bug fixes, small updates

## 🚀 Deployment Checklist

Before deploying, ALWAYS:
1. ✅ Update version in `src/lib/version.ts`
2. ✅ Update version in `package.json`
3. ✅ Add entry to VERSION_HISTORY
4. ✅ Test locally: `npm run dev`
5. ✅ Build: `npm run build`
6. ✅ Deploy: `npx wrangler pages deploy dist/`

## 💡 Example Version Update

```bash
# Step 1: Edit version file
nano src/lib/version.ts
# Change: export const APP_VERSION = '1.0.1';

# Step 2: Edit package.json
nano package.json
# Change: "version": "1.0.1",

# Step 3: Test
npm run dev
# Visit http://localhost:5173/login
# Verify "Charity Tracker v1.0.1" appears

# Step 4: Deploy
npm run build
npx wrangler pages deploy dist/
```

## 🔄 Auto-Update Script (Future Enhancement)

Create a script to update both files:
```bash
#!/bin/bash
# update-version.sh
VERSION=$1
sed -i "s/APP_VERSION = .*/APP_VERSION = '$VERSION';/" src/lib/version.ts
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
echo "Updated to version $VERSION"
```

Usage: `./update-version.sh 1.0.2`