import boto3
import decimal

# Define the 10 Harry Potter themed products (2 per category)
products = [
    # 1. General Category
    {
        "id": "hp-general-1",
        "name": "Gryffindor House Scarf",
        "price": decimal.Decimal("1200.00"),
        "category": "General",
        "stock": decimal.Decimal("50"),
        "userId": "admin@gmail.com",
        "description": "Keep warm in style with this wool-knit Gryffindor house scarf in scarlet and gold."
    },
    {
        "id": "hp-general-2",
        "name": "Marauder's Map",
        "price": decimal.Decimal("2500.00"),
        "category": "General",
        "stock": decimal.Decimal("20"),
        "userId": "admin@gmail.com",
        "description": "A magical document that reveals all of Hogwarts School of Witchcraft and Wizardry."
    },
    # 2. Electronics Category
    {
        "id": "hp-electronics-1",
        "name": "Omnioculars",
        "price": decimal.Decimal("4500.00"),
        "category": "Electronics",
        "stock": decimal.Decimal("15"),
        "userId": "admin@gmail.com",
        "description": "Enchanted brass binoculars featuring slow-motion playbacks and play-by-play overlays."
    },
    {
        "id": "hp-electronics-2",
        "name": "WWN Wizarding Radio",
        "price": decimal.Decimal("6000.00"),
        "category": "Electronics",
        "stock": decimal.Decimal("10"),
        "userId": "admin@gmail.com",
        "description": "Magical wireless receiver to tune in to the Wizarding Wireless Network."
    },
    # 3. Accessories Category
    {
        "id": "hp-accessories-1",
        "name": "Golden Snitch Necklace",
        "price": decimal.Decimal("1800.00"),
        "category": "Accessories",
        "stock": decimal.Decimal("35"),
        "userId": "admin@gmail.com",
        "description": "Elegant gold-plated chain featuring a detailed mini Golden Snitch with silver wings."
    },
    {
        "id": "hp-accessories-2",
        "name": "Time-Turner Pendant",
        "price": decimal.Decimal("3200.00"),
        "category": "Accessories",
        "stock": decimal.Decimal("25"),
        "userId": "admin@gmail.com",
        "description": "Replica of Hermione Granger's Time-Turner with rotating hourglass rings."
    },
    # 4. Home Category
    {
        "id": "hp-home-1",
        "name": "Floating Candle Set (6-Pack)",
        "price": decimal.Decimal("1500.00"),
        "category": "Home",
        "stock": decimal.Decimal("40"),
        "userId": "admin@gmail.com",
        "description": "Enchanted LED floating taper candles with a magic wand remote control."
    },
    {
        "id": "hp-home-2",
        "name": "Hogwarts Crest Tapestry",
        "price": decimal.Decimal("5000.00"),
        "category": "Home",
        "stock": decimal.Decimal("8"),
        "userId": "admin@gmail.com",
        "description": "Woven wall hanging depicting the Hogwarts school crest and motto."
    },
    # 5. Office Category
    {
        "id": "hp-office-1",
        "name": "Pensieve Memory Journal",
        "price": decimal.Decimal("2200.00"),
        "category": "Office",
        "stock": decimal.Decimal("30"),
        "userId": "admin@gmail.com",
        "description": "Leather-bound diary with parchment pages and metallic detailing resembling Dumbledore's Pensieve."
    },
    {
        "id": "hp-office-2",
        "name": "Deluxe Quill and Inkwell Set",
        "price": decimal.Decimal("1400.00"),
        "category": "Office",
        "stock": decimal.Decimal("60"),
        "userId": "admin@gmail.com",
        "description": "Beautiful feather writing quill with brass stand and premium black ink."
    }
]

def seed():
    session = boto3.Session(profile_name='AWS-Academy-Developer-726101441380')
    dynamodb = session.resource('dynamodb', region_name='ap-southeast-1')
    table = dynamodb.Table('tf-darshan-product-table')
    
    print("Starting product seeding into tf-darshan-product-table...")
    for prod in products:
        try:
            table.put_item(Item=prod)
            print(f"Successfully seeded: {prod['name']} ({prod['category']})")
        except Exception as e:
            print(f"Error seeding {prod['name']}: {str(e)}")

if __name__ == '__main__':
    seed()
