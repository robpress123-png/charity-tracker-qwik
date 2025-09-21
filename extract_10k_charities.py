#!/usr/bin/env python3
"""
Extract top 10,000 501(c)(3) charities with full address and revenue information
from IRS Publication 78 data files
"""
import csv
import re

def clean_string(s):
    """Clean string for SQL insertion"""
    if not s:
        return ''
    # Remove special characters and escape quotes for CSV
    s = str(s).replace('"', '""').strip()
    # Remove excessive whitespace
    s = re.sub(r'\s+', ' ', s)
    return s

def parse_revenue(revenue):
    """Parse revenue string to numeric value"""
    if not revenue or revenue == '':
        return 0
    try:
        # Remove any non-numeric characters except decimal point
        cleaned = re.sub(r'[^\d.]', '', str(revenue))
        if cleaned:
            return float(cleaned)
    except:
        pass
    return 0

def get_category(ntee_code):
    """Map NTEE code to category"""
    if not ntee_code:
        return 'Other'

    first_char = str(ntee_code)[0].upper()
    categories = {
        'A': 'Arts & Culture',
        'B': 'Education',
        'C': 'Environment',
        'D': 'Health',
        'E': 'Health',
        'F': 'Health',
        'G': 'Health',
        'H': 'Health',
        'I': 'Human Services',
        'J': 'Human Services',
        'K': 'Human Services',
        'L': 'Human Services',
        'M': 'Human Services',
        'N': 'Human Services',
        'O': 'Human Services',
        'P': 'Human Services',
        'Q': 'International',
        'R': 'Religion',
        'S': 'Community',
        'T': 'Community',
        'U': 'Research',
        'V': 'Research',
        'W': 'Community',
        'X': 'Religion',
        'Y': 'Other',
        'Z': 'Other'
    }
    return categories.get(first_char, 'Other')

# Read all CSV files and collect charity data
all_charities = []
files = [
    "/mnt/c/Users/RobertPressman/charity-tracker/IRS Data/eo1.csv",
    "/mnt/c/Users/RobertPressman/charity-tracker/IRS Data/eo2.csv",
    "/mnt/c/Users/RobertPressman/charity-tracker/IRS Data/eo3.csv",
    "/mnt/c/Users/RobertPressman/charity-tracker/IRS Data/eo4.csv"
]

seen_eins = set()

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Only include 501(c)(3) organizations (deductibility code = 1)
                if row.get('DEDUCTIBILITY') != '1':
                    continue

                # Get revenue amount
                revenue = 0
                if 'REVENUE_AMT' in row:
                    revenue = parse_revenue(row['REVENUE_AMT'])
                elif 'INCOME_AMT' in row:
                    revenue = parse_revenue(row['INCOME_AMT'])

                # For top 10,000, let's include charities with >$100K revenue (lower threshold)
                if revenue < 100000:
                    continue

                ein = row.get('EIN', '')
                if not ein or ein in seen_eins:
                    continue
                seen_eins.add(ein)

                # Get address components
                street = clean_string(row.get('STREET', ''))
                city = clean_string(row.get('CITY', ''))
                state = clean_string(row.get('STATE', ''))
                zip_code = clean_string(row.get('ZIP', ''))

                # Get category from NTEE code
                category = get_category(row.get('NTEE_CD', ''))

                # Clean name
                name = clean_string(row.get('NAME', ''))
                if not name:
                    continue

                all_charities.append({
                    'name': name,
                    'ein': ein.zfill(9),  # Pad EIN to 9 digits
                    'street': street,
                    'city': city,
                    'state': state,
                    'zip_code': zip_code,
                    'category': category,
                    'revenue': revenue
                })

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        continue

# Sort by revenue and take top 10,000
all_charities.sort(key=lambda x: x['revenue'], reverse=True)
top_charities = all_charities[:10000]

print(f"Found {len(all_charities)} 501(c)(3) charities with >$100K revenue")
print(f"Selecting top 10,000 501(c)(3) charities")

# Generate CSV file for import with all fields including address
csv_file = '/home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/charities_10k_full.csv'

# Define fieldnames matching our database schema
fieldnames = ['name', 'ein', 'category', 'address', 'city', 'state', 'zip_code', 'website', 'description', 'phone']

with open(csv_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
    writer.writeheader()

    for charity in top_charities:
        revenue = charity['revenue']
        if revenue >= 1000000000:
            # Billions
            revenue_display = f"${revenue / 1000000000:.1f}B"
        elif revenue >= 1000000:
            # Millions
            revenue_display = f"${int(revenue / 1000000)}M"
        else:
            # Thousands
            revenue_display = f"${int(revenue / 1000)}K"

        # Create description with category, location, and revenue
        description = f"{charity['category']} organization in {charity['city']}, {charity['state']} with annual revenue of approximately {revenue_display}"

        writer.writerow({
            'name': charity['name'],
            'ein': charity['ein'],
            'category': charity['category'],
            'address': charity['street'],
            'city': charity['city'],
            'state': charity['state'],
            'zip_code': charity['zip_code'],
            'website': '',  # No website data in IRS files
            'description': description,
            'phone': ''  # No phone data in IRS files
        })

print(f"CSV file created: charities_10k_full.csv")
print(f"Top charity: {top_charities[0]['name']} - Revenue: ${top_charities[0]['revenue']:,.0f}")
print(f"#10,000 charity: {top_charities[-1]['name']} - Revenue: ${top_charities[-1]['revenue']:,.0f}")
print(f"Total 501(c)(3) charities exported: {len(top_charities)}")

# Show category distribution
from collections import Counter
categories = Counter(c['category'] for c in top_charities)
print("\nCategory distribution:")
for cat, count in categories.most_common():
    print(f"  {cat}: {count}")

# Show state distribution (top 10)
states = Counter(c['state'] for c in top_charities)
print("\nTop 10 states:")
for state, count in list(states.most_common())[:10]:
    print(f"  {state}: {count}")