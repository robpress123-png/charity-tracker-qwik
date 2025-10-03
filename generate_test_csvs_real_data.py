#!/usr/bin/env python3
"""
Generate properly formatted test CSV files for Charity Tracker v2.3.11
Uses REAL data from exported charity and items databases
Each CSV will have proper columns for all donation types
Minimum 3 of each type in 2025, total ~175 donations per user
"""

import csv
import random
from datetime import datetime, timedelta
import os

print("Starting test CSV generation with REAL data...")

# Load REAL charities from export (or use defaults if not available)
REAL_CHARITIES = []
# Update this path to your current charity export
charity_file = '/home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/charities_export_current.csv'
print(f"Loading charities from: {charity_file}")
try:
    with open(charity_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['name']:  # Only add if name exists
                REAL_CHARITIES.append(row['name'])
    print(f"Loaded {len(REAL_CHARITIES)} real charities")
except Exception as e:
    print(f"Warning: Could not load charity file ({e}). Using default charities.")
    # Use a default set of well-known charities
    REAL_CHARITIES = [
        "American Red Cross", "United Way", "Salvation Army", "Goodwill Industries",
        "Habitat for Humanity", "Boys & Girls Clubs of America", "YMCA", "Make-A-Wish Foundation",
        "St. Jude Children's Research Hospital", "Feeding America", "World Wildlife Fund",
        "American Cancer Society", "Doctors Without Borders", "The Nature Conservancy",
        "Planned Parenthood", "American Heart Association", "National Public Radio",
        "Smithsonian Institution", "Wikimedia Foundation", "American Civil Liberties Union",
        "Amnesty International", "Sierra Club", "National Wildlife Federation",
        "ASPCA", "Humane Society", "Best Friends Animal Society", "PBS Foundation",
        "National Geographic Society", "Special Olympics", "Wounded Warrior Project"
    ]
    print(f"Using {len(REAL_CHARITIES)} default charities")

# Category mapping from ItsDeductible database
CATEGORY_MAP = {
    1: "Automotive Supplies",
    2: "Baby Gear",
    3: "Bedding & Linens",
    4: "Books, Movies & Music",
    5: "Cameras & Equipment",
    6: "Clothing, Footwear & Accessories",
    7: "Computers & Office",
    8: "Furniture & Furnishings",
    9: "Health & Beauty",
    10: "Home Audio & Video",
    11: "Housekeeping",
    12: "Kitchen",
    13: "Lawn & Patio",
    14: "Luggage, Backpacks & Cases",
    15: "Major Appliances",
    16: "Musical Instruments",
    17: "Pet Supplies",
    18: "Phones & Communications",
    19: "Sporting Goods",
    20: "Tools & Hardware",
    21: "Toys, Games & Hobbies",
    22: "Portable Audio & Video",
    99: "Miscellaneous"
}

# Load REAL items from database
items_by_category = {}
# Use the new ItsDeductible items database export
items_file = '/home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/Itsdeductible/items_database_itsdeductible.csv'
print(f"Loading items from: {items_file}")
try:
    with open(items_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Map category_id to category name
            category_id = int(row.get('category_id', 99)) if row.get('category_id') else 99
            category = CATEGORY_MAP.get(category_id, 'Miscellaneous')

            if category not in items_by_category:
                items_by_category[category] = []
            items_by_category[category].append({
                'name': row['name'],
                'value_good': float(row.get('value_good', 0)),
                'value_very_good': float(row.get('value_very_good', 0)),
                'value_excellent': float(row.get('value_excellent', 0))
            })
    print(f"Loaded {sum(len(items) for items in items_by_category.values())} items in {len(items_by_category)} categories")
    print(f"Categories: {list(items_by_category.keys())}")
except Exception as e:
    print(f"Error loading items: {e}")
    exit(1)

# Personal/custom charities (10% of donations)
PERSONAL_CHARITIES = [
    "Local Food Bank", "Community Church", "Neighborhood School PTA",
    "Local Animal Shelter", "Town Library Fund", "Youth Sports League",
    "Community Garden Project", "Local Veterans Group", "City Homeless Shelter",
    "Community Theater", "Local Museum", "Senior Center Fund"
]

# Stock symbols for stock donations
STOCK_SYMBOLS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "BRK.B",
    "JNJ", "WMT", "PG", "JPM", "V", "HD", "MA", "UNH", "DIS", "BAC",
    "PFE", "XOM", "CSCO", "INTC", "VZ", "T", "MRK", "KO", "PEP", "ABT"
]

# Crypto types
CRYPTO_TYPES = [
    ("BTC", "Bitcoin"),
    ("ETH", "Ethereum"),
    ("ADA", "Cardano"),
    ("DOT", "Polkadot"),
    ("LINK", "Chainlink"),
    ("LTC", "Litecoin"),
    ("XRP", "Ripple")
]

# Mileage purposes
MILEAGE_PURPOSES = [
    "Delivering meals to homebound seniors",
    "Transporting donations to charity warehouse",
    "Driving to volunteer at food bank",
    "Travel to charity board meeting",
    "Delivering supplies to homeless shelter",
    "Driving to teach at community center",
    "Transport for charity fundraising event",
    "Travel to volunteer at animal shelter",
    "Driving for Habitat for Humanity build",
    "Transport for church mission trip"
]

# User profiles with characteristics
USER_PROFILES = {
    'user1': {
        'name': 'Healthcare & Education Supporter',
        'preferred_categories': ['Health', 'Education', 'Human Services'],
        'avg_cash': 250,
        'distribution': {'cash': 110, 'items': 35, 'miles': 18, 'stock': 10, 'crypto': 2}
    },
    'user2': {
        'name': 'Arts & Culture Patron',
        'preferred_categories': ['Arts', 'Education', 'Community'],
        'avg_cash': 500,
        'distribution': {'cash': 105, 'items': 32, 'miles': 20, 'stock': 15, 'crypto': 3}
    },
    'user3': {
        'name': 'Environmental & Animal Advocate',
        'preferred_categories': ['Environment', 'Animals', 'Conservation'],
        'avg_cash': 150,
        'distribution': {'cash': 95, 'items': 40, 'miles': 25, 'stock': 12, 'crypto': 3}
    },
    'user4': {
        'name': 'Community & Religious Giver',
        'preferred_categories': ['Religion', 'Community', 'Human Services'],
        'avg_cash': 300,
        'distribution': {'cash': 88, 'items': 50, 'miles': 20, 'stock': 14, 'crypto': 3}
    },
    'user5': {
        'name': 'Diversified Philanthropist',
        'preferred_categories': None,  # Gives to all categories
        'avg_cash': 750,
        'distribution': {'cash': 100, 'items': 30, 'miles': 15, 'stock': 25, 'crypto': 5}
    }
}

def generate_date(year_weights):
    """Generate a random date based on year weights"""
    year = random.choices([2024, 2025, 2026], weights=year_weights)[0]

    if year == 2024:
        start = datetime(2024, 1, 1)
        end = datetime(2024, 12, 31)
    elif year == 2025:
        start = datetime(2025, 1, 1)
        end = datetime(2025, 12, 31)
    else:  # 2026
        start = datetime(2026, 1, 1)
        end = datetime(2026, 6, 30)  # Only first half of 2026

    random_days = random.randint(0, (end - start).days)
    return start + timedelta(days=random_days)

def get_charity(user_profile, is_personal=False):
    """Get a charity name - 90% real, 10% personal"""
    if is_personal or random.random() < 0.1:
        return random.choice(PERSONAL_CHARITIES)

    # Try to match user preferences if available
    if user_profile.get('preferred_categories') and random.random() < 0.7:
        # Try to find charities matching preferences (simplified - just use random for now)
        return random.choice(REAL_CHARITIES)
    return random.choice(REAL_CHARITIES)

def generate_cash_donation(date, charity, amount):
    """Generate a cash donation row"""
    row = {
        'date': date.strftime('%Y-%m-%d'),
        'charity_name': charity,
        'donation_type': 'cash',
        'amount': f'{amount:.2f}',
        'notes': random.choice([
            'Monthly contribution',
            'Annual donation',
            'Year-end giving',
            'Special campaign',
            'Emergency relief fund',
            'Matching gift program',
            ''
        ])
    }
    return row

def generate_item_donation(date, charity):
    """Generate an item donation with 1-5 items"""
    num_items = random.randint(1, 5)
    row = {
        'date': date.strftime('%Y-%m-%d'),
        'charity_name': charity,
        'donation_type': 'items',
        'amount': '0',  # Will be calculated by system
        'notes': ''
    }

    # Add random items
    for i in range(1, num_items + 1):
        category = random.choice(list(items_by_category.keys()))
        item = random.choice(items_by_category[category])

        row[f'item_{i}_category'] = category
        row[f'item_{i}_name'] = item['name']
        row[f'item_{i}_quantity'] = str(random.randint(1, 3))
        # Include fair and poor conditions to test non-deductible handling
        # Weight towards deductible conditions but include some non-deductible
        conditions = ['good', 'good', 'very_good', 'very_good', 'excellent', 'fair', 'poor']
        row[f'item_{i}_condition'] = random.choice(conditions)

    return row

def generate_stock_donation(date, charity):
    """Generate a stock donation"""
    symbol = random.choice(STOCK_SYMBOLS)
    shares = random.randint(10, 100)
    price_per_share = random.uniform(20, 500)
    cost_basis_per_share = price_per_share * random.uniform(0.5, 0.9)

    cost_basis = shares * cost_basis_per_share
    fair_market_value = shares * price_per_share

    row = {
        'date': date.strftime('%Y-%m-%d'),
        'charity_name': charity,
        'donation_type': 'stock',
        'amount': f'{fair_market_value:.2f}',
        'notes': f'Donated {shares} shares of {symbol}',
        'stock_symbol': symbol,
        'stock_quantity': str(shares),
        'cost_basis': f'{cost_basis:.2f}',
        'fair_market_value': f'{fair_market_value:.2f}'
    }
    return row

def generate_crypto_donation(date, charity):
    """Generate a crypto donation"""
    crypto = random.choice(CRYPTO_TYPES)

    if crypto[0] == 'BTC':
        quantity = round(random.uniform(0.001, 0.1), 6)
        price = random.uniform(30000, 70000)
        cost_price = price * random.uniform(0.3, 0.8)
    elif crypto[0] == 'ETH':
        quantity = round(random.uniform(0.01, 2), 4)
        price = random.uniform(2000, 4000)
        cost_price = price * random.uniform(0.4, 0.9)
    else:
        quantity = round(random.uniform(10, 1000), 2)
        price = random.uniform(0.5, 50)
        cost_price = price * random.uniform(0.5, 0.9)

    fair_market_value = quantity * price
    cost_basis = quantity * cost_price

    row = {
        'date': date.strftime('%Y-%m-%d'),
        'charity_name': charity,
        'donation_type': 'crypto',
        'amount': f'{fair_market_value:.2f}',
        'notes': f'Donated {quantity} {crypto[1]}',
        'crypto_symbol': crypto[0],
        'crypto_quantity': str(quantity),
        'crypto_type': crypto[1],
        'cost_basis': f'{cost_basis:.2f}',
        'fair_market_value': f'{fair_market_value:.2f}'
    }
    return row

def generate_mileage_donation(date, charity):
    """Generate a mileage donation"""
    miles = random.randint(10, 150)
    rate = 0.14
    amount = miles * rate

    row = {
        'date': date.strftime('%Y-%m-%d'),
        'charity_name': charity,
        'donation_type': 'miles',
        'amount': f'{amount:.2f}',
        'notes': '',
        'miles_driven': str(miles),
        'mileage_rate': str(rate),
        'mileage_purpose': random.choice(MILEAGE_PURPOSES)
    }
    return row

def generate_user_donations(user_id, profile):
    """Generate all donations for a user"""
    donations = []
    distribution = profile['distribution']

    print(f"\nGenerating donations for {user_id}:")
    print(f"  Profile: {profile['name']}")
    print(f"  Distribution: {distribution}")

    # Ensure minimum 3 of each type in 2025
    min_2025_per_type = 3

    # Generate donations by type
    for donation_type, count in distribution.items():
        type_donations = []

        # Determine how many go in each year
        if donation_type == 'cash':
            # Cash donations spread more evenly
            in_2024 = max(1, int(count * 0.1))
            in_2026 = max(1, int(count * 0.1))
            in_2025 = count - in_2024 - in_2026
        else:
            # Other types concentrate in 2025
            in_2024 = max(0, min(2, int(count * 0.15)))
            in_2026 = max(0, min(2, int(count * 0.10)))
            in_2025 = max(min_2025_per_type, count - in_2024 - in_2026)

        print(f"    {donation_type}: {count} total ({in_2024} in 2024, {in_2025} in 2025, {in_2026} in 2026)")

        # Generate donations for each year
        for year, year_count in [(2024, in_2024), (2025, in_2025), (2026, in_2026)]:
            for _ in range(year_count):
                if year == 2024:
                    date = generate_date([1, 0, 0])
                elif year == 2025:
                    date = generate_date([0, 1, 0])
                else:
                    date = generate_date([0, 0, 1])

                charity = get_charity(profile)

                if donation_type == 'cash':
                    avg = profile.get('avg_cash', 250)
                    amount = random.uniform(avg * 0.2, avg * 2.5)
                    donation = generate_cash_donation(date, charity, amount)
                elif donation_type == 'items':
                    donation = generate_item_donation(date, charity)
                elif donation_type == 'stock':
                    donation = generate_stock_donation(date, charity)
                elif donation_type == 'crypto':
                    donation = generate_crypto_donation(date, charity)
                elif donation_type == 'miles':
                    donation = generate_mileage_donation(date, charity)

                type_donations.append(donation)

        donations.extend(type_donations)

    # Sort by date
    donations.sort(key=lambda x: x['date'])

    print(f"  Total donations generated: {len(donations)}")
    return donations

def write_csv(filename, donations):
    """Write donations to CSV with all required columns"""
    # Define all columns in order
    columns = [
        'date', 'charity_name', 'donation_type', 'amount', 'notes',
        'miles_driven', 'mileage_rate', 'mileage_purpose',
        'stock_symbol', 'stock_quantity', 'cost_basis', 'fair_market_value',
        'crypto_symbol', 'crypto_quantity', 'crypto_type'
    ]

    # Add item columns
    for i in range(1, 6):
        columns.extend([
            f'item_{i}_category',
            f'item_{i}_name',
            f'item_{i}_quantity',
            f'item_{i}_condition'
        ])

    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()

        for donation in donations:
            # Ensure all columns exist (empty if not used)
            row = {col: '' for col in columns}
            row.update(donation)
            writer.writerow(row)

    print(f"Wrote {len(donations)} donations to {filename}")

# Generate for each user
for user_id, profile in USER_PROFILES.items():
    donations = generate_user_donations(user_id, profile)
    filename = f'{user_id}_test_real_data.csv'
    write_csv(filename, donations)

print("\n✅ Test CSV generation complete!")
print(f"Generated files for {len(USER_PROFILES)} users")
print(f"Using {len(REAL_CHARITIES)} real charities")
print(f"Using {sum(len(items) for items in items_by_category.values())} real items")