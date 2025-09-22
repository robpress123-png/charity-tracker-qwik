#!/bin/bash

# Update all version references to v2.0.0

echo "Updating version numbers to v2.0.0..."

# Update HTML files
for file in dist/*.html; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        sed -i 's/v1\.[0-9]\+\.[0-9]\+/v2.0.0/g' "$file"
        sed -i 's/Version 1\.[0-9]\+\.[0-9]\+/Version 2.0.0/g' "$file"
    fi
done

# Update markdown files (only version references, not file names)
for file in *.md; do
    if [ -f "$file" ] && [[ ! "$file" =~ v[0-9]+\.[0-9]+\.[0-9]+ ]]; then
        echo "Updating $file..."
        sed -i 's/current version: v1\.[0-9]\+\.[0-9]\+/current version: v2.0.0/g' "$file"
        sed -i 's/Version: 1\.[0-9]\+\.[0-9]\+/Version: 2.0.0/g' "$file"
    fi
done

echo "Version update complete!"
echo ""
echo "Files updated:"
grep -l "v2.0.0" dist/*.html 2>/dev/null | head -10
echo ""
echo "Current package.json version:"
grep '"version"' package.json