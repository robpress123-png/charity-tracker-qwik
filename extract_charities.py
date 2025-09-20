#!/usr/bin/env python3
import csv
import re

def clean_string(s):
    """Clean string for SQL insertion"""
    if not s:
        return ''
    # Remove special characters and escape quotes
    s = str(s).replace("'", "''").strip()
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
        'R': 'Human Services',
        'S': 'Human Services',
        'T': 'Human Services',
        'U': 'Research',
        'V': 'Human Services',
        'W': 'Human Services',
        'X': 'Religion',
        'Y': 'Human Services',
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

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Get revenue amount
                revenue = 0
                if 'REVENUE_AMT' in row:
                    revenue = parse_revenue(row['REVENUE_AMT'])
                elif 'INCOME_AMT' in row:
                    revenue = parse_revenue(row['INCOME_AMT'])

                # Skip if no revenue or very low
                if revenue < 1000000:  # Only get charities with >$1M revenue
                    continue

                # Extract data
                ein = clean_string(row.get('EIN', ''))
                name = clean_string(row.get('NAME', ''))
                street = clean_string(row.get('STREET', ''))
                city = clean_string(row.get('CITY', ''))
                state = clean_string(row.get('STATE', ''))
                zip_code = clean_string(row.get('ZIP', ''))[:10]  # Limit ZIP to 10 chars
                ntee_code = row.get('NTEE_CD', '')
                category = get_category(ntee_code)

                # Skip if missing essential data
                if not ein or not name:
                    continue

                # Format address
                address = f"{street}, {city}, {state} {zip_code}".strip(', ')
                if not address or address == ' ':
                    address = f"{city}, {state}".strip(', ')

                all_charities.append({
                    'ein': ein,
                    'name': name[:200],  # Limit name length
                    'address': address[:300],  # Limit address length
                    'category': category,
                    'revenue': revenue
                })

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        continue

# Sort by revenue and take top 500
all_charities.sort(key=lambda x: x['revenue'], reverse=True)
top_charities = all_charities[:500]

print(f"Found {len(all_charities)} charities with >$1M revenue")
print(f"Selecting top 500 charities")

# Generate SQL inserts
with open('/home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/charity_inserts.sql', 'w') as f:
    f.write("-- Insert top 500 charities from IRS data\n")
    f.write("-- These are public charities available to all users\n\n")

    # Get test user ID
    f.write("-- First, get the test user ID\n")
    f.write("INSERT OR IGNORE INTO users (email, password, name, plan) VALUES ('test@example.com', 'password123', 'Test User', 'free');\n\n")

    # Use a special user_id for public charities (empty string or 'public')
    # For now, associate with test user
    for charity in top_charities:
        name = charity['name']
        ein = charity['ein']
        category = charity['category']
        address = charity['address']

        # Create description based on category and revenue
        revenue_millions = int(charity['revenue'] / 1000000)
        description = f"{category} organization with annual revenue of approximately ${revenue_millions}M"

        sql = f"""INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, '{name}', '{ein}', '{category}', '', '{description}'
FROM users WHERE email = 'test@example.com';
"""
        f.write(sql)

    f.write("\n-- Charities successfully loaded\n")

print("SQL script created: charity_inserts.sql")
print(f"Top charity: {top_charities[0]['name']} - Revenue: ${top_charities[0]['revenue']:,.0f}")