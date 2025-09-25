#!/usr/bin/env python3
"""
Generate properly formatted CSV files for Charity Tracker v2.2.20
- Uses EXACT items from the database (497 items)
- Proper conditions: fair, good, very_good, excellent
- Items in separate columns, NOT in notes field
- Notes field contains only user notes
"""

import csv
import random
from datetime import datetime, timedelta
import json

# Load the exact items from the database CSV
def load_database_items():
    items_by_category = {}
    category_names = {
        1: "Clothing - Women",
        2: "Clothing - Men",
        3: "Clothing - Children",
        4: "Household Items",
        5: "Electronics",
        6: "Furniture",
        7: "Books & Media",
        8: "Sports & Recreation",
        9: "Toys & Games",
        10: "Appliances",
        11: "Jewelry & Accessories",
        12: "Tools & Equipment"
    }

    with open('/home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/data/items_database_497.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cat_id = int(row['category_id'])
            cat_name = category_names[cat_id]

            if cat_name not in items_by_category:
                items_by_category[cat_name] = []

            items_by_category[cat_name].append({
                'name': row['name'],
                'value_good': float(row['value_good']),
                'value_very_good': float(row['value_very_good']),
                'value_excellent': float(row['value_excellent'])
            })

    return items_by_category

# Actual charities from the database
CHARITIES = {
    "health": [
        "ST JUDE CHILDRENS RESEARCH HOSPITAL",
        "AMERICAN CANCER SOCIETY",
        "MAYO CLINIC",
        "RONALD MCDONALD HOUSE CHARITIES",
        "SHRINERS HOSPITALS FOR CHILDREN",
        "AMERICAN HEART ASSOCIATION",
        "ALZHEIMERS ASSOCIATION",
        "AMERICAN DIABETES ASSOCIATION"
    ],
    "education": [
        "UNITED NEGRO COLLEGE FUND",
        "SCHOLARSHIP AMERICA",
        "KHAN ACADEMY",
        "TEACH FOR AMERICA",
        "ROOM TO READ",
        "PENCILS OF PROMISE"
    ],
    "arts": [
        "NATIONAL PUBLIC RADIO",
        "SMITHSONIAN INSTITUTION",
        "METROPOLITAN MUSEUM OF ART",
        "PUBLIC BROADCASTING SERVICE",
        "NATIONAL GALLERY OF ART",
        "LINCOLN CENTER FOR THE PERFORMING ARTS"
    ],
    "environment": [
        "WORLD WILDLIFE FUND",
        "NATURE CONSERVANCY",
        "SIERRA CLUB FOUNDATION",
        "ENVIRONMENTAL DEFENSE FUND",
        "NATIONAL AUDUBON SOCIETY",
        "OCEAN CONSERVANCY"
    ],
    "social": [
        "UNITED WAY",
        "SALVATION ARMY",
        "FEEDING AMERICA",
        "HABITAT FOR HUMANITY",
        "GOODWILL INDUSTRIES",
        "AMERICAN RED CROSS",
        "YMCA",
        "BOYS & GIRLS CLUBS OF AMERICA"
    ],
    "animals": [
        "ASPCA",
        "HUMANE SOCIETY OF THE UNITED STATES",
        "BEST FRIENDS ANIMAL SOCIETY",
        "WORLD ANIMAL PROTECTION",
        "WILDLIFE CONSERVATION SOCIETY"
    ]
}

# Stock symbols for stock donations
STOCK_SYMBOLS = [
    ("AAPL", "Apple Inc.", 150, 180),
    ("MSFT", "Microsoft", 350, 420),
    ("GOOGL", "Alphabet", 135, 165),
    ("AMZN", "Amazon", 140, 170),
    ("TSLA", "Tesla", 200, 280),
    ("JNJ", "Johnson & Johnson", 150, 170),
    ("WMT", "Walmart", 160, 180)
]

# Crypto types
CRYPTO_TYPES = [
    ("Bitcoin", 30000, 45000),
    ("Ethereum", 2000, 3000),
    ("Cardano", 0.30, 0.60)
]

def generate_donations_for_user(user_num, num_donations, database_items):
    """Generate donations for a specific user"""
    donations = []
    start_date = datetime(2024, 1, 1)

    # User-specific preferences
    user_configs = {
        1: {"focus": "social", "item_categories": ["Household Items", "Furniture", "Clothing - Women"]},
        2: {"focus": "health", "item_categories": ["Electronics", "Books & Media", "Appliances"]},
        3: {"focus": "arts", "item_categories": ["Books & Media", "Jewelry & Accessories", "Electronics"]},
        4: {"focus": "education", "item_categories": ["Toys & Games", "Clothing - Children", "Sports & Recreation"]},
        5: {"focus": "environment", "item_categories": ["Tools & Equipment", "Sports & Recreation", "Appliances"]}
    }

    config = user_configs.get(user_num, user_configs[1])
    primary_charities = CHARITIES.get(config["focus"], CHARITIES["social"])

    # Add variety with other charities
    all_charities = primary_charities.copy()
    for cat, chars in CHARITIES.items():
        if cat != config["focus"]:
            all_charities.extend(random.sample(chars, min(2, len(chars))))

    # Add some personal charities
    personal_charities = [
        f"Local {config['focus'].title()} Foundation",
        f"Community {config['focus'].title()} Center"
    ]

    for i in range(num_donations):
        # Date - distributed through the year
        days_offset = int(i * (365 / num_donations)) + random.randint(-5, 5)
        donation_date = start_date + timedelta(days=days_offset)

        # Charity selection
        if random.random() < 0.1:  # 10% personal charities
            charity = random.choice(personal_charities)
        else:
            charity = random.choice(all_charities[:10])

        # Initialize donation record
        donation = {
            "charity_name": charity,
            "donation_date": donation_date.strftime("%Y-%m-%d")
        }

        # Donation type distribution
        rand = random.random()
        if rand < 0.40:  # 40% cash
            donation["donation_type"] = "cash"
            donation["amount"] = random.choice([50, 75, 100, 150, 200, 250, 300, 400, 500])
            donation["notes"] = random.choice([
                "Monthly donation",
                "Annual contribution",
                "Year-end giving",
                "General support",
                "Special appeal"
            ])

        elif rand < 0.65:  # 25% items
            donation["donation_type"] = "items"

            # Select category and items from database
            category = random.choice(config["item_categories"])
            if category in database_items:
                available_items = database_items[category].copy()
                num_items = random.randint(1, min(3, len(available_items)))

                total_value = 0
                for item_num in range(1, num_items + 1):
                    if available_items:
                        item = random.choice(available_items)
                        available_items.remove(item)  # Don't duplicate

                        condition = random.choice(["good", "very_good", "excellent"])
                        quantity = 1 if random.random() > 0.3 else random.randint(2, 4)

                        # Get value based on condition
                        if condition == "good":
                            value = item['value_good']
                        elif condition == "very_good":
                            value = item['value_very_good']
                        else:
                            value = item['value_excellent']

                        item_total = value * quantity
                        total_value += item_total

                        # Add item columns
                        donation[f"item_{item_num}_name"] = item['name']
                        donation[f"item_{item_num}_category"] = category
                        donation[f"item_{item_num}_condition"] = condition
                        donation[f"item_{item_num}_quantity"] = quantity
                        donation[f"item_{item_num}_value"] = round(item_total, 2)

                donation["amount"] = round(total_value, 2)
                donation["notes"] = random.choice([
                    "Spring cleaning donation",
                    "Year-end donation",
                    "Decluttering donation",
                    "Seasonal donation",
                    "Estate donation"
                ])

        elif rand < 0.80:  # 15% miles
            donation["donation_type"] = "miles"
            miles = random.randint(20, 200)
            donation["amount"] = round(miles * 0.67, 2)  # 2024 IRS rate
            donation["notes"] = f"{miles} miles at $0.67/mile - " + random.choice([
                "Volunteer driving",
                "Supply delivery",
                "Event transportation"
            ])

        elif rand < 0.92:  # 12% stock
            donation["donation_type"] = "stock"
            stock = random.choice(STOCK_SYMBOLS)
            shares = random.randint(5, 50)
            price = random.uniform(stock[2], stock[3])
            donation["amount"] = round(shares * price, 2)
            donation["notes"] = f"{stock[1]} - {shares} shares at ${price:.2f}/share"

        else:  # 8% crypto
            donation["donation_type"] = "crypto"
            crypto = random.choice(CRYPTO_TYPES)
            if crypto[0] in ["Bitcoin", "Ethereum"]:
                units = round(random.uniform(0.001, 0.05), 4)
            else:
                units = round(random.uniform(10, 500), 2)
            price = random.uniform(crypto[1], crypto[2])
            donation["amount"] = round(units * price, 2)
            donation["notes"] = f"{crypto[0]} donation - {units} units"

        donations.append(donation)

    return donations

def write_csv(filename, donations):
    """Write donations to CSV with proper columns"""
    # Determine max items in any donation
    max_items = 3  # We limit to 3 items per donation

    # Build fieldnames
    fieldnames = ['charity_name', 'donation_date', 'donation_type', 'amount', 'notes']
    for i in range(1, max_items + 1):
        fieldnames.extend([
            f'item_{i}_name',
            f'item_{i}_category',
            f'item_{i}_condition',
            f'item_{i}_quantity',
            f'item_{i}_value'
        ])

    with open(filename, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for donation in donations:
            # Ensure all fields exist (fill missing item fields with empty strings)
            row = {}
            for field in fieldnames:
                row[field] = donation.get(field, '')
            writer.writerow(row)

    print(f"Generated {filename} with {len(donations)} donations")

def main():
    """Generate CSV files for 5 test users"""
    print("Loading database items...")
    database_items = load_database_items()
    print(f"Loaded {sum(len(items) for items in database_items.values())} items from database")

    for user_num in range(1, 6):
        print(f"\nGenerating data for User {user_num}...")

        # Generate 150-200 donations
        num_donations = random.randint(150, 200)
        donations = generate_donations_for_user(user_num, num_donations, database_items)

        # Calculate totals
        total_amount = sum(float(d['amount']) for d in donations)
        by_type = {}
        for d in donations:
            dt = d['donation_type']
            by_type[dt] = by_type.get(dt, 0) + float(d['amount'])

        print(f"  Total donations: {num_donations}")
        print(f"  Total amount: ${total_amount:,.2f}")
        print("  By type:")
        for dt, amt in sorted(by_type.items()):
            count = sum(1 for d in donations if d['donation_type'] == dt)
            print(f"    {dt}: {count} donations, ${amt:,.2f}")

        # Write to file
        filename = f"user{user_num}_proper_import.csv"
        filepath = f"/home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/{filename}"
        write_csv(filepath, donations)

if __name__ == "__main__":
    print("Charity Tracker v2.2.20 - Proper CSV Generator")
    print("=" * 50)
    print("This script generates CSVs with:")
    print("  - Items from the actual database (497 items)")
    print("  - Proper conditions (good, very_good, excellent)")
    print("  - Items in separate columns (item_1_name, etc.)")
    print("  - Notes field contains ONLY user notes")
    print("=" * 50)
    main()
    print("\n✅ All CSV files generated successfully!")
    print("Files are ready for import into Charity Tracker")