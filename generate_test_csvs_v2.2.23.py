#!/usr/bin/env python3
"""
Generate test CSV files for Charity Tracker v2.2.23
- Uses REAL charities from database export (10,000 charities)
- Uses EXACT 496 items from the database
- Proper format: items in separate columns, NO values in CSV
- 90% real charities (will match), 10% personal/local (won't match)
"""
import csv
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Load real charities from database export
def load_charities():
    charities = []
    with open('charities_export_2025-09-25.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            charities.append({
                'name': row['name'],
                'ein': row['ein'],
                'category': row['category']
            })
    return charities

# Load items from database export
def load_items():
    items_by_category = {}
    with open('/mnt/c/Users/RobertPressman/charity-tracker/items_database_2025-09-25 (1).csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            category = row['category']
            if category not in items_by_category:
                items_by_category[category] = []
            items_by_category[category].append(row['name'])
    return items_by_category

# Some personal/local charities that won't match (10% of donations)
PERSONAL_CHARITIES = [
    "Local Community Church",
    "Neighborhood Food Pantry",
    "Town Youth Sports League",
    "Local Animal Shelter",
    "Community Garden Project",
    "City Homeless Shelter",
    "School PTA Fundraiser",
    "Local Veterans Group",
    "Community Theater Group",
    "Town Library Foundation"
]

# User personas with different giving patterns
USER_PROFILES = {
    'user1': {
        'name': 'Healthcare & Education Supporter',
        'focus_categories': ['Health', 'Education', 'Human Services'],
        'avg_donation': 250,
        'item_donation_rate': 0.15,
        'miles_rate': 0.10,
        'stock_rate': 0.08,
        'crypto_rate': 0.02
    },
    'user2': {
        'name': 'Arts & Culture Patron',
        'focus_categories': ['Arts', 'Education', 'Community'],
        'avg_donation': 500,
        'item_donation_rate': 0.20,
        'miles_rate': 0.05,
        'stock_rate': 0.12,
        'crypto_rate': 0.03
    },
    'user3': {
        'name': 'Environmental & Animal Advocate',
        'focus_categories': ['Environment', 'Animals', 'Health'],
        'avg_donation': 150,
        'item_donation_rate': 0.25,
        'miles_rate': 0.15,
        'stock_rate': 0.05,
        'crypto_rate': 0.01
    },
    'user4': {
        'name': 'Community & Religious Giver',
        'focus_categories': ['Religion', 'Community', 'Human Services'],
        'avg_donation': 300,
        'item_donation_rate': 0.30,
        'miles_rate': 0.12,
        'stock_rate': 0.06,
        'crypto_rate': 0.02
    }
}

# Realistic notes for different donation types
CASH_NOTES = [
    "Annual donation",
    "Monthly recurring donation",
    "Year-end giving",
    "Special appeal",
    "Emergency relief fund",
    "Matching gift program",
    "Memorial donation",
    "Holiday donation",
    "Campaign contribution",
    "General support",
    "Building fund",
    "Scholarship fund"
]

ITEM_NOTES = [
    "Spring cleaning donation",
    "Year-end donation",
    "Moving donation",
    "Estate donation",
    "Closet cleanout",
    "Office supplies donation",
    "Downsizing donation",
    "Annual donation drive",
    "Community collection",
    "Garage sale leftovers"
]

MILES_NOTES = [
    "Medical appointment transport",
    "Disaster relief travel",
    "Volunteer teaching",
    "Board meeting attendance",
    "Event transportation",
    "Supply delivery",
    "Fundraising event",
    "Community outreach",
    "Training session",
    "Site visit"
]

STOCK_NOTES = [
    "Year-end tax planning",
    "Appreciated stock donation",
    "Estate planning gift",
    "Annual stock gift",
    "Portfolio rebalancing",
    "Long-term holdings donation"
]

CRYPTO_NOTES = [
    "Bitcoin donation",
    "Ethereum contribution",
    "Crypto portfolio gift",
    "Digital asset donation"
]

def generate_donations_for_user(user_id, profile, charities, items_by_category, num_donations=175):
    """Generate donations for a specific user profile"""
    donations = []

    # Filter charities by user's focus categories
    focused_charities = [c for c in charities if c['category'] in profile['focus_categories']]
    other_charities = [c for c in charities if c['category'] not in profile['focus_categories']]

    # If not enough focused charities, use all
    if len(focused_charities) < 50:
        focused_charities = charities.copy()

    # Generate donations over the past 2 years
    end_date = datetime(2025, 9, 24)
    start_date = end_date - timedelta(days=730)

    conditions = ['good', 'very_good', 'excellent']  # No 'fair' - not deductible

    for i in range(num_donations):
        # Random date in the range
        days_ago = random.randint(0, 730)
        donation_date = end_date - timedelta(days=days_ago)

        # Determine donation type based on profile rates
        rand = random.random()
        if rand < profile['item_donation_rate']:
            donation_type = 'items'
        elif rand < profile['item_donation_rate'] + profile['miles_rate']:
            donation_type = 'miles'
        elif rand < profile['item_donation_rate'] + profile['miles_rate'] + profile['stock_rate']:
            donation_type = 'stock'
        elif rand < profile['item_donation_rate'] + profile['miles_rate'] + profile['stock_rate'] + profile['crypto_rate']:
            donation_type = 'crypto'
        else:
            donation_type = 'cash'

        # 90% real charities, 10% personal
        if random.random() < 0.9:
            # Use focused charities 70% of the time
            if random.random() < 0.7 and focused_charities:
                charity = random.choice(focused_charities)
            else:
                charity = random.choice(other_charities if other_charities else charities)
            charity_name = charity['name']
        else:
            charity_name = random.choice(PERSONAL_CHARITIES)

        # Create donation record
        donation = {
            'charity_name': charity_name,
            'donation_date': donation_date.strftime('%Y-%m-%d'),
            'donation_type': donation_type,
            'amount': '',
            'notes': ''
        }

        # Add type-specific fields
        if donation_type == 'cash':
            amount = round(random.gauss(profile['avg_donation'], profile['avg_donation'] * 0.3), 2)
            amount = max(10, min(amount, 5000))  # Clamp between 10 and 5000
            donation['amount'] = f"{amount:.2f}"
            donation['notes'] = random.choice(CASH_NOTES)

        elif donation_type == 'items':
            # Don't set amount for items - let system calculate
            donation['notes'] = random.choice(ITEM_NOTES)

            # Add 1-3 items
            num_items = random.choices([1, 2, 3], weights=[0.5, 0.35, 0.15])[0]
            categories = list(items_by_category.keys())

            for j in range(1, num_items + 1):
                category = random.choice(categories)
                item_name = random.choice(items_by_category[category])
                condition = random.choice(conditions)
                quantity = random.choices([1, 2, 3, 4, 5], weights=[0.4, 0.3, 0.15, 0.1, 0.05])[0]

                donation[f'item_{j}_name'] = item_name
                donation[f'item_{j}_category'] = category
                donation[f'item_{j}_condition'] = condition
                donation[f'item_{j}_quantity'] = quantity

        elif donation_type == 'miles':
            miles = random.choice([25, 50, 75, 100, 125, 150, 200, 250, 300])
            rate = 0.67  # 2024 IRS rate
            amount = miles * rate
            donation['amount'] = f"{amount:.2f}"
            donation['notes'] = f"{miles} miles at ${rate}/mile - {random.choice(MILES_NOTES)}"

        elif donation_type == 'stock':
            symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'SPY', 'QQQ', 'VTI', 'BRK.B', 'JNJ']
            shares = random.choice([5, 10, 15, 20, 25, 50, 100])
            price = round(random.uniform(50, 500), 2)
            amount = shares * price
            donation['amount'] = f"{amount:.2f}"
            donation['notes'] = f"{shares} shares of {random.choice(symbols)} - {random.choice(STOCK_NOTES)}"

        elif donation_type == 'crypto':
            cryptos = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT']
            crypto = random.choice(cryptos)
            if crypto == 'BTC':
                quantity = round(random.uniform(0.001, 0.1), 6)
                price = 45000
            elif crypto == 'ETH':
                quantity = round(random.uniform(0.01, 1), 4)
                price = 3000
            else:
                quantity = round(random.uniform(1, 100), 2)
                price = random.uniform(20, 200)
            amount = quantity * price
            donation['amount'] = f"{amount:.2f}"
            donation['notes'] = f"{quantity} {crypto} - {random.choice(CRYPTO_NOTES)}"

        donations.append(donation)

    # Sort by date
    donations.sort(key=lambda x: x['donation_date'])
    return donations

def write_csv(filename, donations):
    """Write donations to CSV file"""
    # Determine all columns needed
    all_columns = set()
    for donation in donations:
        all_columns.update(donation.keys())

    # Order columns properly
    base_columns = ['charity_name', 'donation_date', 'donation_type', 'amount', 'notes']
    item_columns = []
    for i in range(1, 4):  # Support up to 3 items
        for suffix in ['name', 'category', 'condition', 'quantity']:
            col = f'item_{i}_{suffix}'
            if col in all_columns:
                item_columns.append(col)

    columns = base_columns + item_columns

    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(donations)

    print(f"  ✓ Written {len(donations)} donations to {filename}")

def main():
    print("Charity Tracker v2.2.23 - Test CSV Generator")
    print("=" * 50)
    print("Loading data...")

    # Load real data
    charities = load_charities()
    items_by_category = load_items()

    print(f"  ✓ Loaded {len(charities)} real charities from database")
    print(f"  ✓ Loaded {sum(len(items) for items in items_by_category.values())} items in {len(items_by_category)} categories")
    print()

    # Generate CSVs for each user
    for user_id, profile in USER_PROFILES.items():
        print(f"Generating donations for {user_id} - {profile['name']}:")
        donations = generate_donations_for_user(
            user_id, profile, charities, items_by_category
        )

        # Count donation types
        types = {}
        for d in donations:
            types[d['donation_type']] = types.get(d['donation_type'], 0) + 1

        print(f"  Donation mix: {types}")

        # Write CSV
        filename = f"{user_id}_test_v2.2.23.csv"
        write_csv(filename, donations)
        print()

    print("✨ Test CSV generation complete!")
    print()
    print("Key features of these CSVs:")
    print("  • 90% real charities from database (will match)")
    print("  • 10% personal/local charities (will create user_charities)")
    print("  • Items use exact names from 496-item database")
    print("  • NO values in item columns (system calculates)")
    print("  • Proper conditions: good, very_good, excellent")
    print("  • Notes field contains ONLY user comments")

if __name__ == "__main__":
    main()