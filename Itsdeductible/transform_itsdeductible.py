#!/usr/bin/env python3
"""
Transform ItsDeductible FMV Guide to Charity Tracker items database format
Handles hierarchical data, cleans redundancies, and generates SQL
"""

import csv
import json
import re
from datetime import datetime
from pathlib import Path

# Category mappings from ItsDeductible to our numeric IDs
CATEGORY_MAPPING = {
    'Automotive Supplies': 1,
    'Baby Gear': 2,
    'Bedding & Linens': 3,
    'Books, Movies & Music': 4,
    'Cameras & Equipment': 5,
    'Clothing, Footwear & Accessories': 6,
    'Computers & Office': 7,
    'Furniture & Furnishings': 8,
    'Health & Beauty': 9,
    'Home Audio & Video': 10,
    'Housekeeping': 11,
    'Kitchen': 12,
    'Lawn & Patio': 13,
    'Luggage, Backpacks & Cases': 14,
    'Major Appliances': 15,
    'Musical Instruments': 16,
    'Pet Supplies': 17,
    'Phones & Communications': 18,
    'Sporting Goods': 19,
    'Tools & Hardware': 20,
    'Toys, Games & Hobbies': 21
}

def clean_price(price_str):
    """Convert price string to float, handling $ and commas"""
    if not price_str or price_str.strip() == '':
        return None
    # Remove $, commas, and spaces
    cleaned = price_str.replace('$', '').replace(',', '').strip()
    try:
        return float(cleaned)
    except ValueError:
        print(f"Warning: Could not parse price '{price_str}'")
        return None

def clean_redundant_prefix(category, description):
    """Remove redundant category prefixes from item descriptions"""

    # Handle Automotive redundancy
    if category == 'Automotive Supplies' and description.startswith('Automotive:'):
        return description[11:].strip()

    # Handle Book/Books redundancy
    if description.startswith('Book:') or description.startswith('Books:'):
        # Change colon to dash for better readability
        return description.replace('Book:', 'Book -').replace('Books:', 'Books -')

    # Handle Backpack redundancy
    if category == 'Luggage, Backpacks & Cases' and description.startswith('Backpack:'):
        return description.replace('Backpack:', 'Backpack -')

    # Return unchanged for valuable hierarchies
    return description

def parse_hierarchy(description):
    """Parse hierarchical item description into name and variant"""

    if ':' not in description:
        return description, None

    parts = [p.strip() for p in description.split(':')]

    # For 2-level hierarchy
    if len(parts) == 2:
        return parts[0], parts[1]

    # For 3+ level hierarchy, first part is name, rest is variant
    # Example: "Television: Rear Projection: LCD: 50 inch or larger"
    # Returns: ("Television", "Rear Projection: LCD: 50 inch or larger")
    return parts[0], ': '.join(parts[1:])

def create_search_keywords(category, name, variant):
    """Generate search keywords for better findability"""

    words = []

    # Add category words
    words.extend(category.lower().replace(',', '').replace('&', '').split())

    # Add name words
    words.extend(name.lower().replace('-', ' ').replace(',', '').split())

    # Add variant words if present
    if variant:
        words.extend(variant.lower().replace(':', ' ').replace('-', ' ').replace(',', '').split())

    # Remove common stop words and duplicates
    stop_words = {'the', 'and', 'for', 'with', 'or', 'a', 'an', '&'}
    unique_words = []
    seen = set()

    for word in words:
        if word not in stop_words and word not in seen and len(word) > 1:
            unique_words.append(word)
            seen.add(word)

    return ' '.join(unique_words)

def create_user_description(name, variant, category):
    """Create a user-friendly description"""

    if not variant:
        # Simple items without hierarchy
        return name

    # Special formatting for certain categories
    if 'Television' in name:
        # "Television - Rear Projection (LCD, 50"+)"
        if ':' in variant:
            parts = variant.split(':')
            main_type = parts[0].strip()
            details = ', '.join(p.strip() for p in parts[1:])
            return f"{name} - {main_type} ({details})"
        else:
            return f"{name} - {variant}"

    if 'Battery' in name and variant:
        # "Laptop Battery - Compaq (Li-Ion)"
        if ':' in variant:
            parts = variant.split(':')
            if len(parts) == 2:
                return f"{name} - {parts[1].strip()} ({parts[0].strip()})"
        return f"{name} - {variant}"

    # Default: use colon notation for clarity
    return f"{name}: {variant}"

def transform_items(input_csv, output_csv, output_sql):
    """Main transformation function"""

    items_transformed = []
    items_by_category = {}

    print("Reading ItsDeductible CSV...")
    with open(input_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row_num, row in enumerate(reader, start=1):
            category = row['Item Category'].strip()
            original_desc = row['Item Description'].strip()

            # Clean redundant prefixes
            cleaned_desc = clean_redundant_prefix(category, original_desc)

            # Parse hierarchy
            name, variant = parse_hierarchy(cleaned_desc)

            # Get category ID
            category_id = CATEGORY_MAPPING.get(category)
            if not category_id:
                print(f"Warning: Unknown category '{category}' at row {row_num}")
                category_id = 99  # Miscellaneous category

            # Parse prices
            value_good = clean_price(row.get('Good', ''))
            value_very_good = clean_price(row.get('Very Good', ''))
            value_excellent = clean_price(row.get(' Excellent', ''))  # Note the space

            # Skip items with no valid prices
            if not any([value_good, value_very_good, value_excellent]):
                print(f"Warning: No valid prices for '{original_desc}' at row {row_num}")
                continue

            # Create transformed item
            item = {
                'id': row_num,
                'category_id': category_id,
                'name': name,
                'item_variant': variant,
                'description': create_user_description(name, variant, category),
                'value_good': value_good,
                'value_very_good': value_very_good,
                'value_excellent': value_excellent,
                'source_reference': 'ItsDeductible 2024',
                'date_of_valuation': '2024-01-01',
                'search_keywords': create_search_keywords(category, name, variant),
                'original_description': original_desc,
                'original_category': category
            }

            items_transformed.append(item)

            # Track by category for statistics
            if category not in items_by_category:
                items_by_category[category] = []
            items_by_category[category].append(item)

    print(f"\nTransformed {len(items_transformed)} items")

    # Write CSV output
    print(f"Writing CSV to {output_csv}...")
    csv_fields = [
        'id', 'category_id', 'name', 'item_variant', 'description',
        'value_good', 'value_very_good', 'value_excellent',
        'source_reference', 'date_of_valuation', 'search_keywords',
        'original_description'
    ]

    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=csv_fields)
        writer.writeheader()
        for item in items_transformed:
            # Create row with only CSV fields
            csv_row = {k: item[k] for k in csv_fields}
            writer.writerow(csv_row)

    # Generate SQL
    print(f"Generating SQL file {output_sql}...")
    with open(output_sql, 'w', encoding='utf-8') as f:
        # Write header
        f.write("-- ItsDeductible Items Database Import\n")
        f.write(f"-- Generated: {datetime.now().isoformat()}\n")
        f.write(f"-- Total Items: {len(items_transformed)}\n\n")

        # Create table
        f.write("-- Create items table if not exists\n")
        f.write("CREATE TABLE IF NOT EXISTS items (\n")
        f.write("    id INTEGER PRIMARY KEY,\n")
        f.write("    category_id INTEGER,\n")
        f.write("    name TEXT NOT NULL,\n")
        f.write("    item_variant TEXT,\n")
        f.write("    description TEXT,\n")
        f.write("    value_good DECIMAL(10,2),\n")
        f.write("    value_very_good DECIMAL(10,2),\n")
        f.write("    value_excellent DECIMAL(10,2),\n")
        f.write("    source_reference TEXT DEFAULT 'ItsDeductible 2024',\n")
        f.write("    date_of_valuation DATE DEFAULT '2024-01-01',\n")
        f.write("    search_keywords TEXT,\n")
        f.write("    original_description TEXT\n")
        f.write(");\n\n")

        # Clear existing data
        f.write("-- Clear existing items (backup first!)\n")
        f.write("DELETE FROM items;\n\n")

        # Insert statements
        f.write("-- Insert transformed items\n")
        for item in items_transformed:
            # Escape single quotes in text fields
            def escape_sql(text):
                if text is None:
                    return 'NULL'
                return "'" + str(text).replace("'", "''") + "'"

            f.write("INSERT INTO items VALUES (")
            f.write(f"{item['id']}, ")
            f.write(f"{item['category_id']}, ")
            f.write(f"{escape_sql(item['name'])}, ")
            f.write(f"{escape_sql(item['item_variant'])}, ")
            f.write(f"{escape_sql(item['description'])}, ")
            f.write(f"{item['value_good'] if item['value_good'] else 'NULL'}, ")
            f.write(f"{item['value_very_good'] if item['value_very_good'] else 'NULL'}, ")
            f.write(f"{item['value_excellent'] if item['value_excellent'] else 'NULL'}, ")
            f.write(f"{escape_sql(item['source_reference'])}, ")
            f.write(f"{escape_sql(item['date_of_valuation'])}, ")
            f.write(f"{escape_sql(item['search_keywords'])}, ")
            f.write(f"{escape_sql(item['original_description'])}")
            f.write(");\n")

    # Print statistics
    print("\n=== TRANSFORMATION STATISTICS ===")
    print(f"Total items processed: {len(items_transformed)}")
    print(f"\nItems by category:")
    for category in sorted(items_by_category.keys()):
        count = len(items_by_category[category])
        print(f"  {category}: {count} items")

    # Check for items with variants
    with_variants = sum(1 for item in items_transformed if item['item_variant'])
    print(f"\nHierarchy analysis:")
    print(f"  Items with variants: {with_variants} ({with_variants*100/len(items_transformed):.1f}%)")
    print(f"  Simple items: {len(items_transformed) - with_variants} ({(len(items_transformed) - with_variants)*100/len(items_transformed):.1f}%)")

    # Sample output
    print("\n=== SAMPLE TRANSFORMED ITEMS ===")
    samples = [
        next((i for i in items_transformed if 'Television' in i['name'] and i['item_variant']), None),
        next((i for i in items_transformed if 'Battery' in i['name'] and i['item_variant']), None),
        next((i for i in items_transformed if 'Baby Monitor' in i['name']), None),
        next((i for i in items_transformed if i['original_category'] == 'Automotive Supplies'), None),
        next((i for i in items_transformed if not i['item_variant']), None)
    ]

    for item in samples:
        if item:
            print(f"\nOriginal: {item['original_category']}: {item['original_description']}")
            print(f"  Name: {item['name']}")
            print(f"  Variant: {item['item_variant'] or 'None'}")
            print(f"  Description: {item['description']}")
            print(f"  Values: G=${item['value_good']}, VG=${item['value_very_good']}, E=${item['value_excellent']}")

if __name__ == "__main__":
    # File paths
    input_csv = "csvfmv_guide.csv"
    output_csv = "items_database_itsdeductible.csv"
    output_sql = "items_database_itsdeductible.sql"

    # Check if input file exists
    if not Path(input_csv).exists():
        print(f"Error: Input file '{input_csv}' not found!")
        print("Please ensure the ItsDeductible CSV is in the current directory")
        exit(1)

    # Run transformation
    transform_items(input_csv, output_csv, output_sql)

    print(f"\n✅ Transformation complete!")
    print(f"  CSV output: {output_csv}")
    print(f"  SQL output: {output_sql}")
    print("\nNext steps:")
    print("1. Review the generated files")
    print("2. Backup current items table")
    print("3. Run the SQL file to import the data")