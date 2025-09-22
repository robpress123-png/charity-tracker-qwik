#!/usr/bin/env python3
"""
Split the 10,000 charity CSV into smaller chunks to work around
Cloudflare D1's 500 operation limit per worker invocation
"""
import csv
import os

# Read the full CSV
input_file = 'charities_10k_full.csv'
output_prefix = 'charities_batch_'

# Read all rows
with open(input_file, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)  # Save headers
    all_rows = list(reader)

print(f"Total charities: {len(all_rows)}")

# Skip first 500 (already imported)
remaining_rows = all_rows[500:]
print(f"Remaining to import: {len(remaining_rows)}")

# Create batch files of 400 rows each (leaving buffer for D1 limit)
batch_size = 400
batch_num = 2  # Start at 2 since batch 1 is already imported

for i in range(0, len(remaining_rows), batch_size):
    batch = remaining_rows[i:i+batch_size]
    output_file = f'{output_prefix}{batch_num}.csv'

    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)  # Write headers
        writer.writerows(batch)   # Write batch rows

    print(f"Created {output_file} with {len(batch)} charities")
    batch_num += 1

print(f"\nCreated {batch_num - 2} batch files")
print("Import each file one at a time through the admin dashboard")