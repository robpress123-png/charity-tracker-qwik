#!/usr/bin/env python3
"""
Generate 100 test donations for the test@example.com account
Includes various donation types with realistic data
"""
import csv
import random
from datetime import datetime, timedelta

# Sample charity IDs (you'll need to use actual IDs from your database)
# These are placeholders - we'll need to map to real charity IDs
charity_names = [
    "American Red Cross",
    "Doctors Without Borders",
    "World Wildlife Fund",
    "St. Jude Children's Research Hospital",
    "Habitat for Humanity",
    "United Way",
    "Salvation Army",
    "Make-A-Wish Foundation",
    "Feeding America",
    "American Cancer Society",
    "UNICEF USA",
    "Nature Conservancy",
    "Boys & Girls Clubs of America",
    "Wounded Warrior Project",
    "Special Olympics"
]

# Item types for item donations
item_categories = [
    "Clothing", "Electronics", "Furniture", "Books", "Toys",
    "Kitchen Items", "Sports Equipment", "Office Supplies", "Tools", "Jewelry"
]

specific_items = {
    "Clothing": ["Men's suit", "Women's dress", "Children's clothes", "Winter coat", "Shoes", "Handbag"],
    "Electronics": ["Laptop", "Tablet", "Smartphone", "TV", "Gaming console", "Camera"],
    "Furniture": ["Sofa", "Dining table", "Office chair", "Bookshelf", "Dresser", "Desk"],
    "Books": ["Hardcover novels", "Textbooks", "Children's books", "Cookbooks", "Art books"],
    "Toys": ["Board games", "Lego sets", "Dolls", "Action figures", "Puzzles", "Stuffed animals"],
    "Kitchen Items": ["Pots and pans", "Dinnerware set", "Blender", "Coffee maker", "Utensils"],
    "Sports Equipment": ["Tennis racket", "Golf clubs", "Bicycle", "Exercise weights", "Yoga mat"],
    "Office Supplies": ["Printer", "Filing cabinet", "Office supplies lot", "Desk lamp", "Chair"],
    "Tools": ["Power drill", "Tool set", "Lawn mower", "Garden tools", "Workbench"],
    "Jewelry": ["Watch", "Necklace", "Ring", "Bracelet", "Earrings"]
}

# Stock symbols
stock_symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "JPM", "V", "WMT"]

# Crypto symbols
crypto_symbols = ["BTC", "ETH", "ADA", "DOT", "LINK", "UNI", "MATIC", "AVAX", "SOL", "DOGE"]

def generate_date():
    """Generate a random date in 2024-2025"""
    start = datetime(2024, 1, 1)
    end = datetime(2025, 12, 31)
    random_date = start + timedelta(days=random.randint(0, (end - start).days))
    return random_date.strftime("%Y-%m-%d")

def generate_cash_donation():
    """Generate a cash donation"""
    amount = random.choice([25, 50, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 1500, 2000, 2500, 5000])
    return {
        "donation_type": "cash",
        "amount": amount,
        "notes": random.choice([
            "Monthly donation",
            "Year-end giving",
            "Holiday donation",
            "In memory of loved one",
            "Birthday donation",
            "Matching gift from employer",
            "Annual contribution",
            "Emergency relief fund",
            "General support",
            ""
        ])
    }

def generate_items_donation():
    """Generate an items donation with 1-5 items"""
    num_items = random.randint(1, 5)
    category = random.choice(item_categories)
    items_list = []
    total_value = 0

    for _ in range(num_items):
        item = random.choice(specific_items[category])
        value = random.randint(10, 500)
        total_value += value
        items_list.append(f"{item} (${value})")

    return {
        "donation_type": "items",
        "amount": total_value,
        "notes": f"Donated items: {', '.join(items_list)}",
        "item_description": f"{category} donation - {num_items} item(s)",
        "num_items": num_items
    }

def generate_miles_donation():
    """Generate a mileage donation"""
    miles = random.choice([10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200])
    # IRS 2024 rate is $0.14 per mile for charitable driving
    amount = round(miles * 0.14, 2)
    return {
        "donation_type": "miles",
        "amount": amount,
        "miles_driven": miles,
        "notes": random.choice([
            "Volunteer driving - delivering meals",
            "Transportation for charity event",
            "Moving donated goods",
            "Driving to volunteer location",
            "Charity fundraiser transportation",
            "Medical appointment volunteer driving",
            ""
        ])
    }

def generate_stock_donation():
    """Generate a stock donation"""
    symbol = random.choice(stock_symbols)
    shares = random.choice([1, 5, 10, 15, 20, 25, 50, 100])
    price_per_share = random.randint(50, 500)
    amount = shares * price_per_share

    return {
        "donation_type": "stock",
        "amount": amount,
        "stock_symbol": symbol,
        "shares": shares,
        "notes": f"Donated {shares} shares of {symbol} at ${price_per_share}/share"
    }

def generate_crypto_donation():
    """Generate a crypto donation"""
    symbol = random.choice(crypto_symbols)
    amount = random.choice([100, 250, 500, 1000, 2000, 5000, 10000])

    # Approximate amounts for different cryptos
    if symbol == "BTC":
        quantity = round(amount / 40000, 6)  # Assuming ~$40k per BTC
    elif symbol == "ETH":
        quantity = round(amount / 2500, 4)   # Assuming ~$2.5k per ETH
    else:
        quantity = round(random.uniform(10, 1000), 2)

    return {
        "donation_type": "crypto",
        "amount": amount,
        "crypto_symbol": symbol,
        "crypto_amount": quantity,
        "notes": f"Donated {quantity} {symbol}"
    }

# Generate 100 donations
donations = []

# Distribution of donation types (roughly matching real-world patterns)
# 50 cash, 20 items, 15 miles, 10 stock, 5 crypto
type_distribution = (
    ["cash"] * 50 +
    ["items"] * 20 +
    ["miles"] * 15 +
    ["stock"] * 10 +
    ["crypto"] * 5
)
random.shuffle(type_distribution)

for i, donation_type in enumerate(type_distribution):
    charity = random.choice(charity_names)
    date = generate_date()

    if donation_type == "cash":
        donation_data = generate_cash_donation()
    elif donation_type == "items":
        donation_data = generate_items_donation()
    elif donation_type == "miles":
        donation_data = generate_miles_donation()
    elif donation_type == "stock":
        donation_data = generate_stock_donation()
    elif donation_type == "crypto":
        donation_data = generate_crypto_donation()

    # Base donation record
    donation = {
        "charity_name": charity,
        "donation_date": date,
        "donation_type": donation_data["donation_type"],
        "amount": donation_data["amount"],
        "notes": donation_data.get("notes", "")
    }

    # Add type-specific fields
    if donation_type == "items":
        donation["item_description"] = donation_data.get("item_description", "")
        donation["estimated_value"] = donation_data["amount"]
    elif donation_type == "miles":
        donation["miles_driven"] = donation_data.get("miles_driven", "")
    elif donation_type == "stock":
        donation["stock_symbol"] = donation_data.get("stock_symbol", "")
        donation["shares"] = donation_data.get("shares", "")
    elif donation_type == "crypto":
        donation["crypto_symbol"] = donation_data.get("crypto_symbol", "")
        donation["crypto_amount"] = donation_data.get("crypto_amount", "")

    donations.append(donation)

# Sort by date
donations.sort(key=lambda x: x["donation_date"])

# Write to CSV
with open('test_donations_100.csv', 'w', newline='', encoding='utf-8') as f:
    # Define all possible fields
    fieldnames = [
        'charity_name', 'donation_date', 'donation_type', 'amount',
        'item_description', 'estimated_value', 'miles_driven',
        'stock_symbol', 'shares', 'crypto_symbol', 'crypto_amount', 'notes'
    ]

    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(donations)

# Calculate totals for summary
total_amount = sum(d["amount"] for d in donations)
by_type = {}
for d in donations:
    dtype = d["donation_type"]
    if dtype not in by_type:
        by_type[dtype] = {"count": 0, "total": 0}
    by_type[dtype]["count"] += 1
    by_type[dtype]["total"] += d["amount"]

print(f"Generated {len(donations)} test donations")
print(f"Total donation value: ${total_amount:,.2f}")
print("\nBreakdown by type:")
for dtype, stats in by_type.items():
    print(f"  {dtype}: {stats['count']} donations, ${stats['total']:,.2f} total")
print(f"\nSaved to test_donations_100.csv")
print("\nNote: You'll need to map charity_name to actual charity IDs from your database")