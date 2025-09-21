#!/bin/bash

# Script to upload all charity SQL chunks to Cloudflare D1
# Make sure you're logged in to Cloudflare: npx wrangler login

echo "================================================"
echo "Charity Database Upload Script for Cloudflare D1"
echo "================================================"
echo ""
echo "This will upload 10,000 charities to your D1 database."
echo "Make sure you're logged in to Cloudflare first."
echo ""

# Check if wrangler is available
if ! command -v npx &> /dev/null; then
    echo "Error: npx not found. Please install Node.js first."
    exit 1
fi

# Check if SQL chunks exist
if [ ! -d "data/sql-chunks" ]; then
    echo "Error: SQL chunks not found. Please run 'node scripts/split-sql-file.js' first."
    exit 1
fi

# Count files
FILE_COUNT=$(ls -1 data/sql-chunks/*.sql 2>/dev/null | wc -l)

if [ "$FILE_COUNT" -eq 0 ]; then
    echo "Error: No SQL files found in data/sql-chunks/"
    exit 1
fi

echo "Found $FILE_COUNT SQL chunk files to upload."
echo ""

# Ask for confirmation
read -p "Do you want to upload to LOCAL database? (y/n): " -n 1 -r LOCAL_UPLOAD
echo ""

if [[ $LOCAL_UPLOAD =~ ^[Yy]$ ]]; then
    DB_FLAG="--local"
    echo "Uploading to LOCAL database..."
else
    read -p "Do you want to upload to REMOTE (production) database? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Upload cancelled."
        exit 0
    fi
    DB_FLAG="--remote"
    echo "Uploading to REMOTE (production) database..."
fi

echo ""
echo "Starting upload process..."
echo "================================"

# Upload each file
COUNTER=0
for file in data/sql-chunks/*.sql; do
    COUNTER=$((COUNTER + 1))
    FILENAME=$(basename "$file")
    echo ""
    echo "[$COUNTER/$FILE_COUNT] Uploading $FILENAME..."

    # Run the wrangler command
    npx wrangler d1 execute charity-tracker-qwik-db --file="$file" $DB_FLAG

    # Check if command was successful
    if [ $? -eq 0 ]; then
        echo "✅ $FILENAME uploaded successfully"
    else
        echo "❌ Error uploading $FILENAME"
        read -p "Continue with next file? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Upload process stopped."
            exit 1
        fi
    fi

    # Small delay between uploads to avoid rate limiting
    if [ "$COUNTER" -lt "$FILE_COUNT" ]; then
        echo "Waiting 2 seconds before next upload..."
        sleep 2
    fi
done

echo ""
echo "================================"
echo "✅ Upload process complete!"
echo ""
echo "To verify the import, run:"
echo "  npx wrangler d1 execute charity-tracker-qwik-db $DB_FLAG --command \"SELECT COUNT(*) FROM global_charities;\""
echo ""
echo "To see category distribution:"
echo "  npx wrangler d1 execute charity-tracker-qwik-db $DB_FLAG --command \"SELECT category, COUNT(*) as count FROM global_charities GROUP BY category ORDER BY count DESC;\""