#!/usr/bin/env python3
"""
Generate properly formatted CSV files for Charity Tracker v2.2.21
- Uses EXACT 496 items from the database export
- NO VALUES in CSV - only name, category, condition, quantity
- Import tool will look up values from database (like manual entry)
- Conditions: good, very_good, excellent (fair=0, not included)
"""

import csv
import random
from datetime import datetime, timedelta

# Exact 496 items from database export
DATABASE_ITEMS = {
    "Appliances": [
        "Air Conditioner - Portable", "Air Conditioner - Window", "Air Fryer", "Air Purifier",
        "Blender - High End", "Blender - Regular", "Bread Maker", "Coffee Grinder",
        "Coffee Maker - Drip", "Coffee Maker - Espresso", "Dehumidifier", "Dishwasher",
        "Dryer", "Electric Kettle", "Fan - Box", "Fan - Ceiling", "Fan - Tower",
        "Food Processor", "Freezer - Chest", "Freezer - Upright", "Heater - Space",
        "Humidifier", "Instant Pot", "Iron", "Ironing Board", "Juicer",
        "Microwave - Countertop", "Microwave - Over Range", "Mixer - Hand", "Mixer - Stand",
        "Range - Electric", "Range - Gas", "Refrigerator - Compact", "Refrigerator - Full",
        "Rice Cooker", "Sewing Machine", "Slow Cooker", "Steam Cleaner", "Steamer",
        "Toaster", "Toaster Oven", "Vacuum - Canister", "Vacuum - Dyson", "Vacuum - Handheld",
        "Vacuum - Robot", "Vacuum - Upright", "Washer", "Washer/Dryer Combo"
    ],
    "Books & Media": [
        "4K Movie", "Atlas", "Blu-ray - Movie", "Blu-ray Box Set", "Board Game - Classic",
        "Board Game - Family", "Board Game - Strategy", "CD Album", "CD Box Set",
        "Card Game", "Cassette Tape", "Children's Books Set", "Comic Book",
        "Cookbook - Hardcover", "Cookbook - Paperback", "DVD - Movie", "DVD Box Set",
        "Dictionary", "Encyclopedia Set", "Graphic Novel", "Magazine Collection",
        "Novel - Hardcover", "Novel - Paperback", "Picture Book", "Puzzle - 1000pc",
        "Puzzle - 500pc", "Textbook - Business", "Textbook - Engineering",
        "Textbook - General", "Textbook - Law", "Textbook - Medical", "VHS Movie",
        "Video Game - New", "Video Game - Recent", "Video Game - Retro",
        "Vinyl Collection", "Vinyl Record - Classic", "Vinyl Record - New", "Young Adult Novel"
    ],
    "Clothing - Children": [
        "Baby Hat", "Baby Mittens", "Bib Set", "Boots - Rain", "Boots - Winter",
        "Dress - Casual", "Dress - Party", "Dress - School", "Jacket - Spring",
        "Jacket - Winter", "Jeans - Kids", "Jeans - Teen", "Jeans - Toddler",
        "Onesies Pack", "Pajamas - Kids", "Pajamas - Toddler", "Pants - School",
        "Raincoat", "Shirt - School", "Shoes - Dress", "Shoes - School",
        "Shoes - Sneakers", "Shorts", "Sleepers Pack", "Snowsuit", "Socks Pack",
        "Sweater - School", "Swimsuit", "T-Shirt Pack", "Underwear Pack"
    ],
    "Clothing - Men": [
        "Belt - Casual", "Belt - Leather", "Blazer", "Bow Tie", "Coat - Overcoat",
        "Coat - Winter", "Cufflinks", "Jacket - Denim", "Jacket - Leather",
        "Jacket - Windbreaker", "Jeans - Designer", "Jeans - Regular", "Pajamas",
        "Pants - Casual", "Pants - Dress", "Pants - Khakis", "Robe", "Shirt - Casual",
        "Shirt - Designer", "Shirt - Dress", "Shirt - Polo", "Shirt - T-Shirt",
        "Shoes - Athletic", "Shoes - Boots", "Shoes - Casual", "Shoes - Dress",
        "Shorts - Athletic", "Shorts - Cargo", "Socks Pack", "Sport Coat",
        "Suit - Business", "Suit - Three Piece", "Suit - Tuxedo", "Suspenders",
        "Sweater - Cardigan", "Sweater - Crew", "Sweater - V-Neck", "Tie - Regular",
        "Tie - Silk", "Underwear Pack", "Wallet", "Watch - Casual", "Watch - Dress"
    ],
    "Clothing - Women": [
        "Belt", "Blazer", "Blouse", "Clutch", "Coat - Rain", "Coat - Winter",
        "Dress - Casual", "Dress - Formal", "Dress - Summer", "Gloves",
        "Handbag - Casual", "Handbag - Designer", "Hat", "Jacket - Denim",
        "Jacket - Leather", "Jacket - Light", "Jeans - Designer", "Jeans - Regular",
        "Leggings", "Pajamas", "Pants - Casual", "Pants - Dress", "Robe",
        "Scarf - Silk", "Scarf - Winter", "Shoes - Boots", "Shoes - Flats",
        "Shoes - Heels", "Shoes - Sandals", "Shoes - Sneakers", "Shorts",
        "Skirt - A-Line", "Skirt - Maxi", "Skirt - Pencil", "Suit - Business",
        "Suit - Pantsuit", "Sweater - Cardigan", "Sweater - Cashmere",
        "Sweater - Pullover", "Wallet"
    ],
    "Electronics": [
        "All-in-One PC", "Camera - DSLR", "Camera - Mirrorless", "Camera - Point Shoot",
        "Camera Lens", "Desktop - Gaming", "Desktop - Office", "Drone", "E-Reader",
        "Earbuds - Wired", "Earbuds - Wireless", "External Hard Drive", "Fitness Tracker",
        "Flash Drive Set", "Headphones - Noise Cancel", "Headphones - Regular",
        "Home Theater System", "Keyboard - Mechanical", "Keyboard - Regular",
        "Laptop - Business", "Laptop - Chromebook", "Laptop - Gaming", "Microphone",
        "Modem", "Monitor - 1080p", "Monitor - 4K", "Mouse - Gaming", "Mouse - Regular",
        "Nintendo Switch", "PlayStation 5", "Printer - All-in-One", "Printer - Inkjet",
        "Printer - Laser", "Router", "SSD Drive", "Scanner", "Smartphone - Android High",
        "Smartphone - Android Mid", "Smartphone - iPhone", "Smartphone - iPhone Pro",
        "Smartwatch", "Soundbar", "Speakers - Bluetooth", "Speakers - Computer",
        "Streaming Device", "TV - 32 inch", "TV - 43 inch", "TV - 55 inch",
        "TV - 65 inch", "Tablet - Android", "Tablet - iPad", "Tablet - iPad Pro",
        "VR Headset", "Webcam", "Xbox Series X"
    ],
    "Furniture": [
        "Armoire", "Bar Stools", "Bed - Full", "Bed - King", "Bed - Queen", "Bed - Twin",
        "Bench", "Bookshelf - Large", "Bookshelf - Small", "Buffet", "Bunk Bed",
        "Chair - Accent", "Chair - Gaming", "Chair - Office", "Chair - Recliner",
        "Chairs - Dining Set", "Chest", "China Cabinet", "Coffee Table - Glass",
        "Coffee Table - Wood", "Console Table", "Desk - Computer", "Desk - Executive",
        "Desk - Writing", "Desk Chair", "Dresser - Large", "Dresser - Small",
        "End Table", "Entertainment Center", "Filing Cabinet", "Headboard - King",
        "Headboard - Queen", "Mattress - Full", "Mattress - King", "Mattress - Queen",
        "Mattress - Twin", "Mirror - Full Length", "Nightstand", "Ottoman",
        "Sofa - Loveseat", "Sofa - Reclining", "Sofa - Sectional", "Sofa - Sleeper",
        "TV Stand", "Table - Dining 4", "Table - Dining 6", "Table - Dining 8"
    ],
    "Household Items": [
        "Baking Set", "Bath Mat", "Blanket - Electric", "Blanket - Throw", "Candles",
        "Clock", "Coffee Mugs", "Comforter - King", "Comforter - Queen", "Cookware Set",
        "Curtains - Bedroom", "Curtains - Living", "Cutting Board", "Dinnerware - Casual",
        "Dinnerware - China", "Flatware - Silver", "Flatware - Steel", "Frying Pan",
        "Glassware - Crystal", "Glassware - Regular", "Knife Set", "Lamp - Floor",
        "Lamp - Table", "Mirror", "Mixing Bowls", "Napkins", "Picture Frames",
        "Pillows", "Placemats", "Rug - Area", "Rug - Runner", "Sauce Pan",
        "Serving Dishes", "Sheets - King", "Sheets - Queen", "Sheets - Twin",
        "Shower Curtain", "Stock Pot", "Storage Containers", "Tablecloth", "Tea Set",
        "Towels - Bath", "Towels - Beach", "Utensil Set", "Vase", "Wall Art"
    ],
    "Jewelry & Accessories": [
        "Anklet", "Bracelet - Bangle", "Bracelet - Charm", "Bracelet - Tennis",
        "Brooch", "Earrings - Diamond Style", "Earrings - Fashion",
        "Earrings - Gold Plated", "Hair Accessories", "Jewelry Box",
        "Necklace - Costume", "Necklace - Gold Plated", "Necklace - Silver",
        "Pendant", "Ring - Fashion", "Scarf - Designer Style",
        "Sunglasses - Designer Style", "Sunglasses - Regular", "Watch - Fashion",
        "Watch - Luxury Style", "Watch - Smart", "Watch - Vintage"
    ],
    "Sports & Recreation": [
        "Backpack - Hiking", "Baseball Bat", "Baseball Glove", "Basketball",
        "Bicycle - Electric", "Bicycle - Hybrid", "Bicycle - Kids", "Bicycle - Mountain",
        "Bicycle - Road", "Camping Stove", "Canoe", "Cooler", "Elliptical",
        "Exercise Bike", "Fishing Rod - Fly", "Fishing Rod - Regular", "Football",
        "Golf Bag", "Golf Cart", "Golf Clubs - Full Set", "Golf Clubs - Iron Set",
        "Hockey Skates", "Hockey Stick", "Kayak", "Kettlebell Set", "Lacrosse Stick",
        "Life Jacket", "Punching Bag", "Resistance Bands", "Roller Blades",
        "Rowing Machine", "Scooter - Electric", "Scooter - Kids", "Skateboard - Pro",
        "Skateboard - Regular", "Ski Boots", "Ski Poles", "Skis - Cross Country",
        "Skis - Downhill", "Sleeping Bag", "Snowboard", "Snowboard Boots",
        "Soccer Ball", "Tackle Box", "Tennis Bag", "Tennis Racket - Pro",
        "Tennis Racket - Regular", "Tent - 2 Person", "Tent - 4 Person", "Treadmill",
        "Volleyball", "Weight Bench", "Weight Set", "Yoga Block Set", "Yoga Mat"
    ],
    "Tools & Equipment": [
        "Air Compressor", "Chainsaw", "Drill - Corded", "Drill - Cordless",
        "Garden Tools Set", "Generator", "Hammer", "Hedge Trimmer", "Hose Reel",
        "Ladder - Extension", "Ladder - Step", "Lawn Mower - Electric",
        "Lawn Mower - Push", "Lawn Mower - Riding", "Leaf Blower", "Level",
        "Nail Gun", "Pliers Set", "Pressure Washer", "Router", "Sander",
        "Saw - Circular", "Saw - Hand", "Saw - Jigsaw", "Saw - Miter",
        "Screwdriver Set", "Shop Vac", "Socket Set", "Tape Measure", "Tool Box",
        "Tool Chest", "Tool Set - Basic", "Tool Set - Mechanics", "Trimmer - Electric",
        "Trimmer - Gas", "Wheelbarrow", "Workbench", "Wrench Set"
    ],
    "Toys & Games": [
        "Action Figures Set", "Art Set", "Balance Bike", "Board Game - Kids",
        "Building Blocks", "Card Game - Kids", "Doctor Kit", "Doll - Baby",
        "Doll - Fashion", "Doll House", "LEGO Set - Large", "LEGO Set - Medium",
        "LEGO Set - Small", "Musical Toy", "Play Kitchen", "Playhouse", "Pool Toys",
        "Puzzle - Kids", "RC Car", "RC Drone", "RC Helicopter", "Race Track",
        "Ride-On Toy", "Sandbox Toys", "Stuffed Animal - Large", "Stuffed Animal - Small",
        "Swing Set", "Tool Set", "Train Set - Electric", "Train Set - Wooden",
        "Trampoline - Small", "Tricycle", "Wagon"
    ]
}

# Actual charities from the database
CHARITIES = {
    "health": [
        "ST JUDE CHILDRENS RESEARCH HOSPITAL", "AMERICAN CANCER SOCIETY", "MAYO CLINIC",
        "RONALD MCDONALD HOUSE CHARITIES", "SHRINERS HOSPITALS FOR CHILDREN",
        "AMERICAN HEART ASSOCIATION", "ALZHEIMERS ASSOCIATION", "AMERICAN DIABETES ASSOCIATION"
    ],
    "education": [
        "UNITED NEGRO COLLEGE FUND", "SCHOLARSHIP AMERICA", "KHAN ACADEMY",
        "TEACH FOR AMERICA", "ROOM TO READ", "PENCILS OF PROMISE"
    ],
    "arts": [
        "NATIONAL PUBLIC RADIO", "SMITHSONIAN INSTITUTION", "METROPOLITAN MUSEUM OF ART",
        "PUBLIC BROADCASTING SERVICE", "NATIONAL GALLERY OF ART",
        "LINCOLN CENTER FOR THE PERFORMING ARTS"
    ],
    "environment": [
        "WORLD WILDLIFE FUND", "NATURE CONSERVANCY", "SIERRA CLUB FOUNDATION",
        "ENVIRONMENTAL DEFENSE FUND", "NATIONAL AUDUBON SOCIETY", "OCEAN CONSERVANCY"
    ],
    "social": [
        "UNITED WAY", "SALVATION ARMY", "FEEDING AMERICA", "HABITAT FOR HUMANITY",
        "GOODWILL INDUSTRIES", "AMERICAN RED CROSS", "YMCA", "BOYS & GIRLS CLUBS OF AMERICA"
    ]
}

# Stock symbols for stock donations
STOCK_SYMBOLS = [
    ("AAPL", "Apple Inc.", 150, 180),
    ("MSFT", "Microsoft", 350, 420),
    ("GOOGL", "Alphabet", 135, 165),
    ("AMZN", "Amazon", 140, 170),
    ("TSLA", "Tesla", 200, 280)
]

# Crypto types
CRYPTO_TYPES = [
    ("Bitcoin", 30000, 45000),
    ("Ethereum", 2000, 3000),
    ("Cardano", 0.30, 0.60)
]

def generate_donations_for_user(user_num, num_donations):
    """Generate donations for a specific user"""
    donations = []
    start_date = datetime(2024, 1, 1)

    # User-specific preferences
    user_configs = {
        1: {"focus": "social", "item_categories": ["Household Items", "Furniture", "Appliances"]},
        2: {"focus": "health", "item_categories": ["Electronics", "Books & Media", "Appliances"]},
        3: {"focus": "arts", "item_categories": ["Books & Media", "Jewelry & Accessories", "Electronics"]},
        4: {"focus": "education", "item_categories": ["Toys & Games", "Clothing - Children", "Sports & Recreation"]},
        5: {"focus": "environment", "item_categories": ["Tools & Equipment", "Sports & Recreation", "Appliances"]}
    }

    config = user_configs.get(user_num, user_configs[1])
    primary_charities = CHARITIES.get(config["focus"], CHARITIES["social"])

    # Add variety
    all_charities = primary_charities.copy()
    for cat, chars in CHARITIES.items():
        if cat != config["focus"]:
            all_charities.extend(random.sample(chars, min(2, len(chars))))

    # Personal charities
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
                "Monthly donation", "Annual contribution", "Year-end giving",
                "General support", "Special appeal", "Emergency fund"
            ])

        elif rand < 0.65:  # 25% items - NO VALUES, just name/category/condition/quantity
            donation["donation_type"] = "items"

            # Select category and items
            category = random.choice(config["item_categories"])
            if category in DATABASE_ITEMS:
                available_items = DATABASE_ITEMS[category].copy()
                num_items = random.randint(1, min(3, len(available_items)))

                for item_num in range(1, num_items + 1):
                    if available_items:
                        item_name = random.choice(available_items)
                        available_items.remove(item_name)  # Don't duplicate

                        # Only good, very_good, excellent (fair=0, not deductible)
                        condition = random.choice(["good", "very_good", "excellent"])
                        quantity = 1 if random.random() > 0.3 else random.randint(2, 4)

                        # Add item columns - NO VALUE!
                        donation[f"item_{item_num}_name"] = item_name
                        donation[f"item_{item_num}_category"] = category
                        donation[f"item_{item_num}_condition"] = condition
                        donation[f"item_{item_num}_quantity"] = quantity
                        # NO item_{item_num}_value - let import calculate it!

                donation["amount"] = ""  # Leave amount empty for items
                donation["notes"] = random.choice([
                    "Spring cleaning donation", "Year-end donation",
                    "Decluttering donation", "Seasonal donation",
                    "Estate donation", "Moving donation"
                ])

        elif rand < 0.80:  # 15% miles
            donation["donation_type"] = "miles"
            miles = random.randint(20, 200)
            donation["amount"] = round(miles * 0.67, 2)  # 2024 IRS rate
            donation["notes"] = f"{miles} miles at $0.67/mile - " + random.choice([
                "Volunteer driving", "Supply delivery", "Event transportation"
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
    # Max 3 items per donation
    max_items = 3

    # Build fieldnames - NO value columns for items!
    fieldnames = ['charity_name', 'donation_date', 'donation_type', 'amount', 'notes']
    for i in range(1, max_items + 1):
        fieldnames.extend([
            f'item_{i}_name',
            f'item_{i}_category',
            f'item_{i}_condition',
            f'item_{i}_quantity'
            # NO item_{i}_value!
        ])

    with open(filename, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for donation in donations:
            # Ensure all fields exist (fill missing with empty strings)
            row = {}
            for field in fieldnames:
                row[field] = donation.get(field, '')
            writer.writerow(row)

    print(f"Generated {filename} with {len(donations)} donations")

def main():
    """Generate CSV files for 5 test users"""
    for user_num in range(1, 6):
        print(f"\nGenerating data for User {user_num}...")

        # Generate 150-200 donations
        num_donations = random.randint(150, 200)
        donations = generate_donations_for_user(user_num, num_donations)

        # Count by type
        by_type = {}
        items_count = 0
        for d in donations:
            dt = d['donation_type']
            by_type[dt] = by_type.get(dt, 0) + 1
            if dt == 'items':
                items_count += 1

        print(f"  Total donations: {num_donations}")
        print("  By type:")
        for dt, count in sorted(by_type.items()):
            print(f"    {dt}: {count} donations")

        # Write to file
        filename = f"user{user_num}_final.csv"
        filepath = f"/home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik/{filename}"
        write_csv(filepath, donations)

if __name__ == "__main__":
    print("Charity Tracker v2.2.21 - Final CSV Generator")
    print("=" * 50)
    print("This script generates CSVs with:")
    print("  - Exact 496 items from database")
    print("  - Conditions: good, very_good, excellent")
    print("  - NO VALUES for items (import will calculate)")
    print("  - Simulates manual user entry")
    print("=" * 50)
    main()
    print("\n✅ All CSV files generated successfully!")
    print("Ready for import - values will be calculated from database")