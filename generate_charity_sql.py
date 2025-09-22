#!/usr/bin/env python3
"""
Generate SQL INSERT statements for remaining charities
Run these directly in D1 console - bypasses API limits!
"""
import csv
import re

def clean_sql(s):
    """Escape single quotes for SQL"""
    if not s:
        return ''
    return s.replace("'", "''")

def generate_id():
    """Generate a random ID similar to SQLite's randomblob"""
    import random
    import string
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=32))

# Read the full CSV
with open('charities_10k_full.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    all_rows = list(reader)

# Skip first 500 (already imported)
remaining = all_rows[500:]

print(f"Generating SQL for {len(remaining)} remaining charities...")

# Create SQL file with batches of 100 INSERTs each
batch_size = 100
file_num = 1

for i in range(0, len(remaining), batch_size):
    batch = remaining[i:i+batch_size]

    with open(f'charity_insert_batch_{file_num}.sql', 'w') as f:
        f.write("-- Charity import batch " + str(file_num) + "\n")
        f.write("-- Run this block in D1 console\n\n")

        for row in batch:
            # Clean each field
            name = clean_sql(row['name'])
            ein = clean_sql(row['ein'])
            category = clean_sql(row.get('category', 'Other'))
            address = clean_sql(row.get('address', ''))
            city = clean_sql(row.get('city', ''))
            state = clean_sql(row.get('state', ''))
            zip_code = clean_sql(row.get('zip_code', ''))
            description = clean_sql(row.get('description', ''))

            # Generate INSERT statement
            f.write(f"""INSERT INTO charities (name, ein, category, address, city, state, zip_code, description, is_verified)
VALUES ('{name}', '{ein}', '{category}', '{address}', '{city}', '{state}', '{zip_code}', '{description}', 1);
""")

        f.write(f"\n-- End of batch {file_num}\n")

    print(f"Created charity_insert_batch_{file_num}.sql with {len(batch)} inserts")
    file_num += 1

print(f"\nCreated {file_num-1} SQL files")
print("Copy and paste each file's contents into D1 console")
print("D1 can handle 100+ INSERT statements at once!")