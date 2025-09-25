#!/usr/bin/env python3
"""
Generate fully compliant CSV files for Charity Tracker v2.2.20
- All item donations use items from the database (except Other category)
- Proper formatting for all donation types
- Realistic data for 2024-2025 tax year
"""

import csv
import random
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP

# Database items organized by category (497 items from the actual database)
DATABASE_ITEMS = {
    "Clothing & Accessories": [
        ("Shirt - Dress", 15, 40),
        ("Shirt - Casual", 8, 25),
        ("Pants - Dress", 20, 60),
        ("Pants - Jeans", 15, 45),
        ("Dress - Formal", 25, 80),
        ("Dress - Casual", 15, 50),
        ("Suit - Men's", 50, 200),
        ("Suit - Women's", 40, 180),
        ("Jacket - Winter", 30, 120),
        ("Jacket - Light", 20, 80),
        ("Coat - Winter", 40, 150),
        ("Sweater", 12, 40),
        ("Shoes - Dress", 20, 80),
        ("Shoes - Athletic", 25, 100),
        ("Boots", 30, 120),
        ("Belt", 10, 30),
        ("Tie", 8, 25),
        ("Scarf", 10, 35),
        ("Hat", 8, 30),
        ("Gloves", 10, 40),
    ],
    "Electronics": [
        ("Computer - Desktop", 150, 600),
        ("Computer - Laptop", 200, 800),
        ("Tablet", 100, 400),
        ("Phone - Smartphone", 150, 600),
        ("Phone - Basic", 30, 100),
        ("Television - Small", 50, 200),
        ("Television - Large", 150, 500),
        ("Monitor", 50, 200),
        ("Printer", 40, 150),
        ("Scanner", 30, 120),
        ("Camera - Digital", 100, 400),
        ("Game Console", 100, 300),
        ("Headphones", 20, 100),
        ("Speaker - Bluetooth", 30, 120),
        ("Router", 30, 100),
        ("Keyboard", 15, 60),
        ("Mouse", 10, 40),
        ("Webcam", 25, 80),
        ("Microphone", 30, 100),
        ("DVD Player", 20, 60),
    ],
    "Furniture": [
        ("Sofa", 150, 600),
        ("Chair - Dining", 30, 120),
        ("Chair - Office", 50, 200),
        ("Table - Dining", 100, 400),
        ("Table - Coffee", 50, 200),
        ("Table - End", 30, 120),
        ("Desk", 60, 250),
        ("Bed - Twin", 100, 400),
        ("Bed - Queen", 150, 600),
        ("Dresser", 80, 300),
        ("Bookshelf", 40, 150),
        ("Cabinet - Storage", 60, 200),
        ("Lamp - Table", 20, 80),
        ("Lamp - Floor", 30, 120),
        ("Mirror", 25, 100),
        ("Rug", 40, 150),
        ("Ottoman", 40, 150),
        ("Nightstand", 40, 150),
        ("TV Stand", 50, 200),
        ("File Cabinet", 40, 160),
    ],
    "Books & Media": [
        ("Book - Hardcover", 5, 20),
        ("Book - Paperback", 3, 12),
        ("Textbook", 20, 80),
        ("Magazine", 1, 5),
        ("DVD", 2, 10),
        ("Blu-ray", 3, 15),
        ("CD - Music", 1, 5),
        ("Vinyl Record", 5, 25),
        ("Video Game", 10, 40),
        ("Board Game", 10, 40),
        ("Puzzle", 8, 30),
        ("Art Print", 15, 60),
        ("Poster", 5, 20),
        ("Sheet Music", 3, 15),
        ("Comic Book", 2, 10),
        ("Cookbook", 8, 30),
        ("Children's Book", 4, 15),
        ("Reference Book", 10, 40),
        ("Journal", 5, 20),
        ("Calendar", 3, 15),
    ],
    "Household Items": [
        ("Dishes - Set", 20, 80),
        ("Pots and Pans", 30, 120),
        ("Silverware - Set", 15, 60),
        ("Glassware - Set", 15, 60),
        ("Towels - Bath", 5, 20),
        ("Towels - Kitchen", 3, 12),
        ("Bedding - Sheets", 20, 80),
        ("Bedding - Comforter", 30, 120),
        ("Pillow", 10, 40),
        ("Blanket", 15, 60),
        ("Curtains", 20, 80),
        ("Clock", 15, 60),
        ("Vase", 10, 40),
        ("Picture Frame", 8, 30),
        ("Candle", 5, 20),
        ("Basket", 10, 40),
        ("Storage Box", 8, 30),
        ("Hangers - Set", 5, 20),
        ("Iron", 15, 50),
        ("Vacuum Cleaner", 40, 150),
    ],
    "Sports & Recreation": [
        ("Bicycle - Adult", 75, 300),
        ("Bicycle - Child", 40, 150),
        ("Golf Clubs - Set", 100, 400),
        ("Tennis Racket", 30, 120),
        ("Basketball", 15, 50),
        ("Football", 15, 50),
        ("Soccer Ball", 15, 50),
        ("Baseball Glove", 20, 80),
        ("Skateboard", 30, 120),
        ("Helmet - Bike", 20, 60),
        ("Skis", 80, 300),
        ("Snowboard", 100, 400),
        ("Ice Skates", 30, 120),
        ("Roller Blades", 30, 120),
        ("Camping Tent", 50, 200),
        ("Sleeping Bag", 30, 120),
        ("Backpack - Hiking", 40, 150),
        ("Fishing Rod", 30, 120),
        ("Exercise Equipment", 50, 200),
        ("Yoga Mat", 15, 50),
    ],
    "Toys & Games": [
        ("Action Figure", 5, 20),
        ("Doll", 10, 40),
        ("LEGO Set", 20, 100),
        ("Toy Car", 5, 20),
        ("Stuffed Animal", 8, 30),
        ("Building Blocks", 15, 60),
        ("Play Kitchen", 40, 150),
        ("Train Set", 30, 120),
        ("Remote Control Car", 25, 100),
        ("Art Supplies", 15, 60),
        ("Musical Toy", 15, 60),
        ("Educational Toy", 15, 60),
        ("Outdoor Toy", 20, 80),
        ("Craft Kit", 10, 40),
        ("Science Kit", 20, 80),
        ("Dress-up Clothes", 15, 60),
        ("Play Tent", 25, 100),
        ("Ride-on Toy", 30, 120),
        ("Water Toy", 10, 40),
        ("Sand Toy", 8, 30),
    ],
    "Tools & Equipment": [
        ("Drill - Cordless", 40, 150),
        ("Saw - Circular", 50, 200),
        ("Hammer", 10, 40),
        ("Screwdriver Set", 15, 60),
        ("Wrench Set", 20, 80),
        ("Tool Box", 25, 100),
        ("Ladder", 40, 150),
        ("Level", 15, 60),
        ("Tape Measure", 8, 30),
        ("Pliers", 10, 40),
        ("Socket Set", 30, 120),
        ("Air Compressor", 80, 300),
        ("Power Sander", 30, 120),
        ("Lawn Mower", 100, 400),
        ("Trimmer", 40, 150),
        ("Rake", 10, 40),
        ("Shovel", 15, 60),
        ("Garden Hose", 20, 80),
        ("Wheelbarrow", 40, 150),
        ("Extension Cord", 15, 60),
    ],
    "Appliances": [
        ("Refrigerator", 200, 800),
        ("Stove", 150, 600),
        ("Microwave", 40, 150),
        ("Dishwasher", 150, 600),
        ("Washer", 150, 600),
        ("Dryer", 150, 600),
        ("Toaster", 15, 60),
        ("Coffee Maker", 20, 80),
        ("Blender", 25, 100),
        ("Food Processor", 30, 120),
        ("Mixer - Stand", 50, 200),
        ("Air Fryer", 40, 150),
        ("Slow Cooker", 25, 100),
        ("Rice Cooker", 20, 80),
        ("Electric Kettle", 15, 60),
        ("Space Heater", 30, 120),
        ("Fan", 20, 80),
        ("Air Conditioner", 100, 400),
        ("Dehumidifier", 50, 200),
        ("Humidifier", 30, 120),
    ],
    "Art & Collectibles": [
        ("Painting - Original", 50, 500),
        ("Print - Limited Edition", 30, 200),
        ("Sculpture", 40, 300),
        ("Pottery", 20, 100),
        ("Antique - Furniture", 100, 1000),
        ("Vintage Clothing", 30, 150),
        ("Coin Collection", 50, 500),
        ("Stamp Collection", 30, 300),
        ("Trading Cards", 20, 200),
        ("Comic Book - Vintage", 20, 200),
        ("Vinyl Records - Rare", 30, 300),
        ("Jewelry - Costume", 15, 100),
        ("Watch - Vintage", 50, 400),
        ("Camera - Vintage", 40, 300),
        ("Musical Instrument", 100, 800),
        ("Memorabilia - Sports", 30, 300),
        ("Figurine", 15, 100),
        ("Crystal", 20, 150),
        ("China Set", 50, 400),
        ("Silver - Decorative", 40, 300),
    ],
    "Baby & Children": [
        ("Crib", 100, 400),
        ("Car Seat", 50, 200),
        ("Stroller", 50, 200),
        ("High Chair", 40, 150),
        ("Baby Clothes", 5, 25),
        ("Baby Toys", 8, 30),
        ("Baby Monitor", 30, 120),
        ("Diaper Bag", 20, 80),
        ("Bouncer", 30, 120),
        ("Swing", 40, 150),
        ("Playpen", 50, 200),
        ("Changing Table", 40, 150),
        ("Baby Bathtub", 15, 60),
        ("Bottle Set", 10, 40),
        ("Breast Pump", 50, 200),
        ("Baby Carrier", 30, 120),
        ("Children's Books", 5, 20),
        ("Educational Toys", 15, 60),
        ("Kids Furniture", 50, 200),
        ("School Supplies", 10, 50),
    ],
    "Other": [
        # Other category items can be custom/unique
        ("Miscellaneous Item", 5, 50),
        ("Craft Supplies", 10, 40),
        ("Holiday Decorations", 15, 60),
        ("Office Supplies", 10, 40),
        ("Pet Supplies", 15, 60),
        ("Medical Supplies", 20, 100),
        ("Safety Equipment", 25, 100),
        ("Camping Gear", 30, 150),
        ("Musical Equipment", 50, 300),
        ("Photography Equipment", 40, 200),
    ]
}

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
        "AMERICAN DIABETES ASSOCIATION",
        "MARCH OF DIMES",
        "LEUKEMIA & LYMPHOMA SOCIETY"
    ],
    "education": [
        "UNITED NEGRO COLLEGE FUND",
        "SCHOLARSHIP AMERICA",
        "KHAN ACADEMY",
        "TEACH FOR AMERICA",
        "ROOM TO READ",
        "PENCILS OF PROMISE",
        "DONORSCHOOSE ORG",
        "COLLEGE BOARD",
        "NATIONAL MERIT SCHOLARSHIP CORPORATION",
        "BIG BROTHERS BIG SISTERS OF AMERICA"
    ],
    "arts": [
        "NATIONAL PUBLIC RADIO",
        "SMITHSONIAN INSTITUTION",
        "METROPOLITAN MUSEUM OF ART",
        "PUBLIC BROADCASTING SERVICE",
        "NATIONAL GALLERY OF ART",
        "LINCOLN CENTER FOR THE PERFORMING ARTS",
        "KENNEDY CENTER",
        "MUSEUM OF MODERN ART",
        "AMERICAN MUSEUM OF NATURAL HISTORY",
        "NATIONAL ENDOWMENT FOR THE ARTS"
    ],
    "environment": [
        "WORLD WILDLIFE FUND",
        "NATURE CONSERVANCY",
        "SIERRA CLUB FOUNDATION",
        "ENVIRONMENTAL DEFENSE FUND",
        "NATIONAL AUDUBON SOCIETY",
        "OCEAN CONSERVANCY",
        "RAINFOREST ALLIANCE",
        "GREENPEACE FUND",
        "EARTHJUSTICE",
        "NATIONAL PARKS CONSERVATION ASSOCIATION"
    ],
    "social": [
        "UNITED WAY",
        "SALVATION ARMY",
        "FEEDING AMERICA",
        "HABITAT FOR HUMANITY",
        "GOODWILL INDUSTRIES",
        "AMERICAN RED CROSS",
        "YMCA",
        "BOYS & GIRLS CLUBS OF AMERICA",
        "MEALS ON WHEELS AMERICA",
        "FOOD FOR THE POOR"
    ],
    "animals": [
        "ASPCA",
        "HUMANE SOCIETY OF THE UNITED STATES",
        "BEST FRIENDS ANIMAL SOCIETY",
        "PETA",
        "WORLD ANIMAL PROTECTION",
        "ANIMAL WELFARE INSTITUTE",
        "WILDLIFE CONSERVATION SOCIETY",
        "DEFENDERS OF WILDLIFE",
        "FARM SANCTUARY",
        "ALLEY CAT ALLIES"
    ],
    "international": [
        "DOCTORS WITHOUT BORDERS",
        "CARE",
        "OXFAM AMERICA",
        "SAVE THE CHILDREN",
        "WORLD VISION",
        "UNICEF USA",
        "INTERNATIONAL RESCUE COMMITTEE",
        "MERCY CORPS",
        "DIRECT RELIEF",
        "PARTNERS IN HEALTH"
    ],
    "veterans": [
        "DISABLED AMERICAN VETERANS",
        "WOUNDED WARRIOR PROJECT",
        "FISHER HOUSE FOUNDATION",
        "PARALYZED VETERANS OF AMERICA",
        "HOMES FOR OUR TROOPS",
        "HOPE FOR THE WARRIORS",
        "GARY SINISE FOUNDATION",
        "OPERATION HOMEFRONT",
        "SEMPER FI & AMERICAS FUND",
        "TUNNEL TO TOWERS FOUNDATION"
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
    ("WMT", "Walmart", 160, 180),
    ("PG", "Procter & Gamble", 145, 165),
    ("UNH", "UnitedHealth", 520, 580),
    ("HD", "Home Depot", 340, 380)
]

# Crypto types for crypto donations
CRYPTO_TYPES = [
    ("Bitcoin", 30000, 45000),
    ("Ethereum", 2000, 3000),
    ("Cardano", 0.30, 0.60),
    ("Solana", 60, 120),
    ("Polygon", 0.80, 1.20)
]

def get_item_value(item_name, low, high, condition):
    """Calculate item value based on condition"""
    base_value = random.uniform(low, high)
    condition_multipliers = {
        "excellent": 1.0,
        "very_good": 0.8,
        "good": 0.6,
        "fair": 0.4
    }
    value = base_value * condition_multipliers.get(condition, 0.6)
    return round(value, 2)

def generate_item_donation(category_preference=None):
    """Generate a realistic item donation entry"""
    conditions = ["excellent", "very_good", "good", "fair"]

    # Choose category
    if category_preference and random.random() < 0.7:  # 70% chance to use preferred category
        if category_preference in DATABASE_ITEMS:
            category = category_preference
        else:
            category = random.choice(list(DATABASE_ITEMS.keys()))
    else:
        category = random.choice(list(DATABASE_ITEMS.keys()))

    # Generate 1-4 different items
    num_items = random.randint(1, 4)
    items = []
    total_value = 0

    available_items = DATABASE_ITEMS[category].copy()

    for _ in range(min(num_items, len(available_items))):
        if not available_items:
            break

        item_data = random.choice(available_items)
        available_items.remove(item_data)  # Don't duplicate items in same donation

        item_name, low, high = item_data
        condition = random.choice(conditions)
        quantity = random.randint(1, 5) if random.random() < 0.3 else 1
        unit_value = get_item_value(item_name, low, high, condition)
        item_total = unit_value * quantity
        total_value += item_total

        items.append(f"[{item_name}|{category}|{condition}|{quantity}|{unit_value:.2f}]")

    items_str = "".join(items)
    return f"ITEMS:{items_str}", round(total_value, 2)

def generate_donations_for_user(user_num, num_donations=60, focus_category=None):
    """Generate donations for a specific user with focus"""
    donations = []
    start_date = datetime(2024, 1, 1)

    # Get appropriate charities for this user's focus
    if focus_category:
        primary_charities = CHARITIES.get(focus_category, CHARITIES["social"])
        # Add some variety with other categories
        other_charities = []
        for cat, chars in CHARITIES.items():
            if cat != focus_category:
                other_charities.extend(random.sample(chars, 2))
        all_charities = primary_charities + random.sample(other_charities, min(10, len(other_charities)))
    else:
        all_charities = []
        for chars in CHARITIES.values():
            all_charities.extend(chars)

    # Add some personal charities
    personal_charities = [
        f"Local {focus_category.title()} Foundation",
        f"Community {focus_category.title()} Center",
        f"{focus_category.title()} Support Network"
    ]

    # Determine category preference for items based on user
    item_category_prefs = {
        1: ["Electronics", "Household Items", "Furniture"],
        2: ["Clothing & Accessories", "Books & Media", "Toys & Games"],
        3: ["Art & Collectibles", "Books & Media", "Electronics"],
        4: ["Sports & Recreation", "Baby & Children", "Toys & Games"],
        5: ["Tools & Equipment", "Appliances", "Furniture"]
    }

    for i in range(num_donations):
        # Date - roughly evenly distributed through the year
        days_offset = int(i * (365 / num_donations)) + random.randint(-5, 5)
        donation_date = start_date + timedelta(days=days_offset)

        # Charity selection
        if random.random() < 0.1:  # 10% personal charities
            charity = random.choice(personal_charities)
        else:
            charity = random.choice(all_charities[:15])  # Focus on top charities

        # Donation type distribution
        rand = random.random()
        if rand < 0.40:  # 40% cash
            amount = random.choice([50, 75, 100, 150, 200, 250, 300, 400, 500])
            donation_type = "cash"
            notes = random.choice([
                "Monthly donation",
                "Annual contribution",
                "Special appeal",
                "Year-end giving",
                "Recurring donation",
                "Emergency fund",
                "General support"
            ])
        elif rand < 0.65:  # 25% items
            donation_type = "items"
            pref_categories = item_category_prefs.get(user_num, ["Household Items"])
            pref_category = random.choice(pref_categories)
            notes, amount = generate_item_donation(pref_category)
        elif rand < 0.80:  # 15% miles
            donation_type = "miles"
            miles = random.randint(20, 200)
            amount = round(miles * 0.67, 2)  # 2024 IRS rate
            notes = f"{miles} miles at $0.67/mile - " + random.choice([
                "Volunteer driving",
                "Supply delivery",
                "Event transportation",
                "Medical transport",
                "Food delivery"
            ])
        elif rand < 0.92:  # 12% stock
            donation_type = "stock"
            stock = random.choice(STOCK_SYMBOLS)
            shares = random.randint(5, 50)
            price = random.uniform(stock[2], stock[3])
            amount = round(shares * price, 2)
            notes = f"{stock[1]} - {shares} shares at ${price:.2f}/share"
        else:  # 8% crypto
            donation_type = "crypto"
            crypto = random.choice(CRYPTO_TYPES)
            if crypto[0] in ["Bitcoin", "Ethereum"]:
                units = round(random.uniform(0.001, 0.1), 4)
            else:
                units = round(random.uniform(10, 1000), 2)
            price = random.uniform(crypto[1], crypto[2])
            amount = round(units * price, 2)
            notes = f"{crypto[0]} donation - {units} units"

        donations.append({
            "charity_name": charity,
            "donation_date": donation_date.strftime("%Y-%m-%d"),
            "donation_type": donation_type,
            "amount": f"{amount:.2f}",
            "notes": notes
        })

    return donations

def write_csv(filename, donations):
    """Write donations to CSV file"""
    with open(filename, 'w', newline='') as csvfile:
        fieldnames = ['charity_name', 'donation_date', 'donation_type', 'amount', 'notes']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(donations)
    print(f"Generated {filename} with {len(donations)} donations")

def main():
    """Generate CSV files for 5 test users"""
    user_configs = [
        (1, "social", "General/Social causes"),
        (2, "health", "Medical/Health organizations"),
        (3, "arts", "Arts & Culture"),
        (4, "education", "Youth & Education"),
        (5, "environment", "Environment & Animals")
    ]

    for user_num, focus, description in user_configs:
        print(f"\nGenerating data for User {user_num} - Focus: {description}")

        # Generate between 150-200 donations for each user
        num_donations = random.randint(150, 200)
        donations = generate_donations_for_user(user_num, num_donations, focus)

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
        filename = f"user{user_num}_compliant_2024.csv"
        filepath = f"/home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/{filename}"
        write_csv(filepath, donations)

if __name__ == "__main__":
    print("Charity Tracker v2.2.20 - Compliant CSV Generator")
    print("=" * 50)
    main()
    print("\n✅ All CSV files generated successfully!")
    print("Files are ready for import into Charity Tracker")