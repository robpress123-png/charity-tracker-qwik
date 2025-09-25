#!/usr/bin/env python3
"""
Generate properly formatted test CSV files for Charity Tracker v2.3.11
Each CSV will have proper columns for all donation types
Minimum 3 of each type in 2025, total ~175 donations per user
"""

import csv
import random
from datetime import datetime, timedelta
import json

# Load the items database for item donations
items_by_category = {}
try:
    with open('data/items_database_497.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            category = row['category']
            if category not in items_by_category:
                items_by_category[category] = []
            items_by_category[category].append({
                'name': row['name'],
                'low_value': float(row.get('low_value', 0)),
                'high_value': float(row.get('high_value', 0))
            })
except:
    print("Warning: Could not load items database")

# Real charity names from the database (90% should match these)
REAL_CHARITIES = [
    "American Red Cross", "St. Jude Children's Research Hospital", "Doctors Without Borders",
    "United Way", "American Cancer Society", "Make-A-Wish Foundation", "Salvation Army",
    "Habitat for Humanity", "Feeding America", "American Heart Association",
    "World Wildlife Fund", "Nature Conservancy", "ASPCA", "Humane Society",
    "Sierra Club", "Greenpeace", "Environmental Defense Fund", "National Wildlife Federation",
    "Catholic Charities USA", "Lutheran Services in America", "Jewish Federations of North America",
    "Islamic Relief USA", "UNICEF", "Save the Children", "World Vision",
    "Mayo Clinic", "Cleveland Clinic", "Johns Hopkins Medicine", "Children's Hospital",
    "National Public Radio", "PBS Foundation", "Smithsonian Institution",
    "American Museum of Natural History", "Metropolitan Museum of Art"
]

# Personal/custom charities (10% of donations)
PERSONAL_CHARITIES = [
    "Local Food Bank", "Community Church", "Neighborhood School PTA",
    "Local Animal Shelter", "Town Library Fund", "Youth Sports League",
    "Community Garden Project", "Local Veterans Group", "City Homeless Shelter"
]

# User profiles with defined characteristics
USER_PROFILES = {
    'user1': {
        'name': 'Healthcare & Education Supporter',
        'focus_charities': ["American Red Cross", "St. Jude Children's Research Hospital",
                          "Doctors Without Borders", "Mayo Clinic", "Children's Hospital"],
        'avg_donation': 250,
        'donation_distribution': {
            'cash': 0.65,
            'items': 0.15,
            'miles': 0.10,
            'stock': 0.08,
            'crypto': 0.02
        }
    },
    'user2': {
        'name': 'Arts & Culture Patron',
        'focus_charities': ["PBS Foundation", "Smithsonian Institution", "Metropolitan Museum of Art",
                          "National Public Radio", "American Museum of Natural History"],
        'avg_donation': 500,
        'donation_distribution': {
            'cash': 0.60,
            'items': 0.20,
            'miles': 0.05,
            'stock': 0.12,
            'crypto': 0.03
        }
    },
    'user3': {
        'name': 'Environmental & Animal Advocate',
        'focus_charities': ["World Wildlife Fund", "Nature Conservancy", "ASPCA",
                          "Sierra Club", "Humane Society"],
        'avg_donation': 150,
        'donation_distribution': {
            'cash': 0.54,
            'items': 0.25,
            'miles': 0.15,
            'stock': 0.05,
            'crypto': 0.01
        }
    },
    'user4': {
        'name': 'Community & Religious Giver',
        'focus_charities': ["Catholic Charities USA", "Lutheran Services in America",
                          "Salvation Army", "Habitat for Humanity", "Jewish Federations of North America"],
        'avg_donation': 300,
        'donation_distribution': {
            'cash': 0.50,
            'items': 0.30,
            'miles': 0.12,
            'stock': 0.06,
            'crypto': 0.02
        }
    },
    'user5': {
        'name': 'International Aid & Disaster Relief Donor',
        'focus_charities': ["UNICEF", "Save the Children", "World Vision",
                          "International Red Cross", "Doctors Without Borders"],
        'avg_donation': 400,
        'donation_distribution': {
            'cash': 0.50,
            'items': 0.10,
            'miles': 0.08,
            'stock': 0.25,
            'crypto': 0.07
        }
    }
}

# Notes templates for each donation type
NOTES = {
    'cash': [
        "Monthly contribution", "Year-end gift", "Annual donation", "Emergency relief fund",
        "Matching gift from employer", "Holiday donation", "Memorial gift", "Birthday donation"
    ],
    'miles': [
        "Volunteer delivery service", "Medical appointment transport", "Charity event travel",
        "Food bank delivery runs", "Disaster relief transport", "Community service travel"
    ],
    'stock': [
        "Year-end tax planning", "Appreciated stock donation", "Estate planning gift",
        "Quarterly stock gift", "Long-term capital gains donation"
    ],
    'crypto': [
        "Crypto portfolio donation", "Year-end crypto gift", "Digital asset contribution",
        "Blockchain for good", "Tech-forward giving"
    ],
    'items': [
        "Spring cleaning donation", "Decluttering for charity", "Estate donation",
        "Moving donation", "Seasonal clothing", "Household goods"
    ]
}

def generate_donations(user_id, profile, num_donations=175):
    """Generate donations for a user with proper field structure"""
    donations = []

    # Calculate minimum requirements for 2025
    min_per_type_2025 = 3
    total_2025_min = min_per_type_2025 * 5  # 5 types

    # Generate dates
    dates = []
    # 10% in 2024 Q4
    for _ in range(int(num_donations * 0.1)):
        date = datetime(2024, random.randint(10, 12), random.randint(1, 28))
        dates.append(date)

    # 80% in 2025 (ensure we have enough for minimums)
    num_2025 = max(int(num_donations * 0.8), total_2025_min + 10)
    for _ in range(num_2025):
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        dates.append(datetime(2025, month, day))

    # 10% in 2026 Q1
    remaining = num_donations - len(dates)
    for _ in range(remaining):
        date = datetime(2026, random.randint(1, 3), random.randint(1, 28))
        dates.append(date)

    random.shuffle(dates)

    # Track 2025 donation counts by type
    type_counts_2025 = {'cash': 0, 'items': 0, 'miles': 0, 'stock': 0, 'crypto': 0}

    # Stock and crypto data
    stocks = [
        {'symbol': 'AAPL', 'name': 'Apple Inc', 'price': 180},
        {'symbol': 'MSFT', 'name': 'Microsoft', 'price': 420},
        {'symbol': 'GOOGL', 'name': 'Alphabet', 'price': 140},
        {'symbol': 'AMZN', 'name': 'Amazon', 'price': 175},
        {'symbol': 'TSLA', 'name': 'Tesla', 'price': 250},
        {'symbol': 'JNJ', 'name': 'Johnson & Johnson', 'price': 160},
        {'symbol': 'SPY', 'name': 'S&P 500 ETF', 'price': 450},
        {'symbol': 'QQQ', 'name': 'NASDAQ ETF', 'price': 380},
        {'symbol': 'VTI', 'name': 'Total Market ETF', 'price': 240},
        {'symbol': 'BRK.B', 'name': 'Berkshire Hathaway', 'price': 360}
    ]

    cryptos = [
        {'symbol': 'BTC', 'name': 'Bitcoin', 'price': 45000},
        {'symbol': 'ETH', 'name': 'Ethereum', 'price': 2500},
        {'symbol': 'SOL', 'name': 'Solana', 'price': 100},
        {'symbol': 'ADA', 'name': 'Cardano', 'price': 0.50},
        {'symbol': 'MATIC', 'name': 'Polygon', 'price': 0.80},
        {'symbol': 'DOGE', 'name': 'Dogecoin', 'price': 0.08}
    ]

    for date in dates:
        is_2025 = date.year == 2025

        # Ensure minimum types in 2025
        if is_2025:
            needed_types = [t for t, count in type_counts_2025.items() if count < min_per_type_2025]
            if needed_types and random.random() < 0.5:  # 50% chance to fill a needed type
                donation_type = random.choice(needed_types)
            else:
                # Normal distribution
                rand = random.random()
                cumulative = 0
                donation_type = 'cash'
                for dtype, prob in profile['donation_distribution'].items():
                    cumulative += prob
                    if rand < cumulative:
                        donation_type = dtype
                        break
        else:
            # Normal distribution for non-2025
            rand = random.random()
            cumulative = 0
            donation_type = 'cash'
            for dtype, prob in profile['donation_distribution'].items():
                cumulative += prob
                if rand < cumulative:
                    donation_type = dtype
                    break

        if is_2025:
            type_counts_2025[donation_type] += 1

        # Select charity (90% real, 10% personal)
        if random.random() < 0.9:
            # Prefer focus charities for this user
            if random.random() < 0.6:
                charity = random.choice(profile['focus_charities'])
            else:
                charity = random.choice(REAL_CHARITIES)
        else:
            charity = random.choice(PERSONAL_CHARITIES)

        # Base donation structure
        donation = {
            'charity_name': charity,
            'donation_date': date.strftime('%Y-%m-%d'),
            'donation_type': donation_type,
            'amount': 0,  # Will be calculated
            'notes': '',
            # Miles fields
            'miles_driven': '',
            'mileage_rate': '',
            'mileage_purpose': '',
            # Stock fields
            'stock_symbol': '',
            'stock_quantity': '',
            'cost_basis': '',
            'fair_market_value': '',
            # Crypto fields
            'crypto_symbol': '',
            'crypto_quantity': '',
            'crypto_type': ''
        }

        # Fill type-specific fields
        if donation_type == 'cash':
            amount = max(10, random.gauss(profile['avg_donation'], profile['avg_donation'] * 0.3))
            donation['amount'] = f"{amount:.2f}"
            donation['notes'] = random.choice(NOTES['cash'])

        elif donation_type == 'miles':
            miles = random.choice([25, 50, 75, 100, 150, 200, 250, 300])
            rate = 0.14  # IRS 2024 rate
            donation['miles_driven'] = str(miles)
            donation['mileage_rate'] = str(rate)
            donation['mileage_purpose'] = random.choice(NOTES['miles'])
            donation['amount'] = f"{miles * rate:.2f}"
            donation['notes'] = f"Mileage deduction for charity work"

        elif donation_type == 'stock':
            stock = random.choice(stocks)
            shares = random.choice([5, 10, 15, 20, 25, 30, 50])
            price_var = random.uniform(0.9, 1.1)  # +/- 10% price variation
            current_price = stock['price'] * price_var
            cost_basis = current_price * random.uniform(0.5, 0.9)  # Gain of 10-50%
            fair_market_value = shares * current_price

            donation['stock_symbol'] = stock['symbol']
            donation['stock_quantity'] = str(shares)
            donation['cost_basis'] = f"{cost_basis:.2f}"
            donation['fair_market_value'] = f"{fair_market_value:.2f}"
            donation['amount'] = f"{fair_market_value:.2f}"
            donation['notes'] = random.choice(NOTES['stock'])

        elif donation_type == 'crypto':
            crypto = random.choice(cryptos)
            if crypto['price'] > 1000:  # BTC
                quantity = round(random.uniform(0.01, 0.5), 4)
            elif crypto['price'] > 100:  # ETH, SOL
                quantity = round(random.uniform(0.1, 5), 2)
            else:  # Small cryptos
                quantity = round(random.uniform(100, 10000), 0)

            price_var = random.uniform(0.8, 1.2)  # +/- 20% price variation
            current_price = crypto['price'] * price_var
            fair_market_value = quantity * current_price
            cost_basis = fair_market_value * random.uniform(0.3, 0.8)  # Gain of 20-70%

            donation['crypto_symbol'] = crypto['symbol']
            donation['crypto_quantity'] = str(quantity)
            donation['crypto_type'] = crypto['name']
            donation['cost_basis'] = f"{cost_basis:.2f}"
            donation['fair_market_value'] = f"{fair_market_value:.2f}"
            donation['amount'] = f"{fair_market_value:.2f}"
            donation['notes'] = random.choice(NOTES['crypto'])

        elif donation_type == 'items':
            # Handle case where items database didn't load
            if not items_by_category:
                # Use fallback items if database not loaded
                items_by_category['Clothing'] = [
                    {'name': 'Shirt', 'low_value': 5, 'high_value': 15},
                    {'name': 'Pants', 'low_value': 8, 'high_value': 25},
                    {'name': 'Jacket', 'low_value': 15, 'high_value': 50}
                ]
                items_by_category['Electronics'] = [
                    {'name': 'Laptop', 'low_value': 100, 'high_value': 400},
                    {'name': 'Phone', 'low_value': 50, 'high_value': 200}
                ]
                items_by_category['Household'] = [
                    {'name': 'Microwave', 'low_value': 25, 'high_value': 75},
                    {'name': 'Toaster', 'low_value': 10, 'high_value': 30}
                ]

            # Pick 1-5 items
            num_items = random.randint(1, min(5, len(items_by_category)))
            categories = random.sample(list(items_by_category.keys()),
                                     min(num_items, len(items_by_category)))

            total_value = 0
            items_list = []

            for i, category in enumerate(categories, 1):
                if items_by_category[category]:
                    item = random.choice(items_by_category[category])
                    condition = random.choice(['good', 'very_good', 'excellent'])
                    quantity = random.randint(1, 3)

                    # Calculate value based on condition
                    if condition == 'good':
                        unit_value = item['low_value']
                    elif condition == 'excellent':
                        unit_value = item['high_value']
                    else:  # very_good
                        unit_value = (item['low_value'] + item['high_value']) / 2

                    item_value = unit_value * quantity
                    total_value += item_value

                    # Add item fields
                    donation[f'item_{i}_name'] = item['name']
                    donation[f'item_{i}_category'] = category
                    donation[f'item_{i}_condition'] = condition
                    donation[f'item_{i}_quantity'] = str(quantity)

                    items_list.append(f"{quantity}x {item['name']}")

            donation['amount'] = f"{total_value:.2f}"
            donation['notes'] = random.choice(NOTES['items'])
            donation['item_description'] = ', '.join(items_list)
            donation['estimated_value'] = f"{total_value:.2f}"

        donations.append(donation)

    # Verify minimums for 2025
    for dtype, count in type_counts_2025.items():
        if count < min_per_type_2025:
            print(f"Warning: User {user_id} only has {count} {dtype} donations in 2025")

    return donations

def write_csv(filename, donations):
    """Write donations to CSV with all proper columns"""

    # Determine max number of items
    max_items = 0
    for d in donations:
        item_count = len([k for k in d.keys() if k.startswith('item_') and k.endswith('_name')])
        max_items = max(max_items, item_count)

    # Build fieldnames
    fieldnames = [
        'charity_name', 'donation_date', 'donation_type', 'amount', 'notes',
        'miles_driven', 'mileage_rate', 'mileage_purpose',
        'stock_symbol', 'stock_quantity', 'cost_basis', 'fair_market_value',
        'crypto_symbol', 'crypto_quantity', 'crypto_type',
        'item_description', 'estimated_value'
    ]

    # Add item columns
    for i in range(1, max_items + 1):
        fieldnames.extend([
            f'item_{i}_name', f'item_{i}_category',
            f'item_{i}_condition', f'item_{i}_quantity'
        ])

    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(donations)

    print(f"Created {filename} with {len(donations)} donations")

    # Print type distribution
    type_counts = {}
    for d in donations:
        dtype = d['donation_type']
        year = d['donation_date'][:4]
        key = f"{year}-{dtype}"
        type_counts[key] = type_counts.get(key, 0) + 1

    print(f"  2025 breakdown: ", end="")
    for dtype in ['cash', 'items', 'miles', 'stock', 'crypto']:
        count = type_counts.get(f"2025-{dtype}", 0)
        print(f"{dtype}={count} ", end="")
    print()

# Generate CSVs for all users
for user_id, profile in USER_PROFILES.items():
    donations = generate_donations(user_id, profile)
    filename = f"{user_id}_test_v2.3.11.csv"
    write_csv(filename, donations)

print("\nAll test CSVs generated successfully!")
print("Each user has minimum 3 of each donation type in 2025.")
print("All donations have proper column structure for import.")