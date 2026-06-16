import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv() # Load variables from .env

app = Flask(__name__)
# Enable CORS for all routes (crucial for React client communication)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# MongoDB connection configuration
# MongoDB Atlas URIs require dnspython. Fallback to localhost if MONGO_URI is not set.
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/treadflow")

try:
    client = MongoClient(MONGO_URI)
    # Ping database to verify connection
    client.admin.command('ping')
    db = client.get_database()  # Gets the database specified in URI or default
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None

# Helper to access collections safely
def get_coll(name):
    if db is None:
        raise RuntimeError("Database connection not initialized. Please verify your MONGO_URI.")
    return db[name]

# Helper to serialize MongoDB documents to match React client structure (_id -> id)
def serialize_doc(doc):
    if not doc:
        return None
    # Convert MongoDB _id (which could be ObjectId or custom string) to string 'id'
    doc['id'] = str(doc.pop('_id'))
    return doc

def serialize_docs(docs):
    return [serialize_doc(doc) for doc in docs]

# Default data to seed the database if it is empty
DEFAULT_LOCATIONS = [
    { "_id": "loc1", "name": "Main Warehouse" },
    { "_id": "loc2", "name": "Downtown Store" }
]

DEFAULT_TIRE_TYPES = ["Passenger", "SUV/Truck", "Performance", "Winter", "All-Season", "Off-Road"]

DEFAULT_TIRES = [
    { "_id": "t1", "name": "Michelin Pilot Sport 4S", "type": "Performance", "quantity": 24, "locationId": "loc1" },
    { "_id": "t2", "name": "Bridgestone Blizzak WS90", "type": "Winter", "quantity": 18, "locationId": "loc1" },
    { "_id": "t3", "name": "Goodyear Wrangler Duratrac", "type": "Off-Road", "quantity": 12, "locationId": "loc1" },
    { "_id": "t4", "name": "Continental ExtremeContact DWS06", "type": "All-Season", "quantity": 3, "locationId": "loc1" },
    { "_id": "t5", "name": "Pirelli Scorpion Verde", "type": "SUV/Truck", "quantity": 8, "locationId": "loc1" },
    { "_id": "t6", "name": "Michelin Defender LTX", "type": "SUV/Truck", "quantity": 15, "locationId": "loc2" },
    { "_id": "t7", "name": "Nokian Hakkapeliitta R3", "type": "Winter", "quantity": 20, "locationId": "loc2" },
    { "_id": "t8", "name": "Toyo Open Country M/T", "type": "Off-Road", "quantity": 10, "locationId": "loc2" }
]

def seed_db():
    try:
        locations_col = get_coll("locations")
        if locations_col.count_documents({}) == 0:
            locations_col.insert_many(DEFAULT_LOCATIONS)
            get_coll("tires").insert_many(DEFAULT_TIRES)
            
            tire_types_col = get_coll("tire_types")
            for t in DEFAULT_TIRE_TYPES:
                tire_types_col.insert_one({"name": t})
            print("Database successfully seeded with default demo data!")
    except Exception as e:
        print(f"Skipped seeding: {e}")

# Try to seed database on startup
@app.before_request
def initialize():
    # Only run seeding once
    app.before_request_funcs[None].remove(initialize)
    seed_db()

# HEALTH CHECK
@app.route("/api/health", methods=["GET"])
def health_check():
    status = "healthy" if db is not None else "unhealthy"
    return jsonify({"status": status, "database_connected": db is not None}), 200

# RESET DATABASE TO DEMO DEFAULTS
@app.route("/api/reset", methods=["POST"])
def reset_db():
    try:
        get_coll("locations").delete_many({})
        get_coll("tires").delete_many({})
        get_coll("sales").delete_many({})
        get_coll("tire_types").delete_many({})
        
        get_coll("locations").insert_many(DEFAULT_LOCATIONS)
        get_coll("tires").insert_many(DEFAULT_TIRES)
        for t in DEFAULT_TIRE_TYPES:
            get_coll("tire_types").insert_one({"name": t})
            
        return jsonify({"message": "Database successfully reset to demo values."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# LOCATIONS CRUD
@app.route("/api/locations", methods=["GET"])
def get_locations():
    try:
        locs = list(get_coll("locations").find())
        return jsonify(serialize_docs(locs)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/locations", methods=["POST"])
def add_location():
    try:
        data = request.json
        if not data or 'name' not in data:
            return jsonify({"error": "Missing location name."}), 400
        
        # Check if exists
        exists = get_coll("locations").find_one({"name": {"$regex": f"^{data['name']}$", "$options": "i"}})
        if exists:
            return jsonify({"error": "Location already exists."}), 400
        
        # Map frontend id to backend _id
        loc_id = data.get('id')
        doc = {"_id": loc_id, "name": data['name']}
        get_coll("locations").insert_one(doc)
        return jsonify(serialize_doc(doc)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/locations/<loc_id>", methods=["DELETE"])
def delete_location(loc_id):
    try:
        # Check if location contains tires or sales
        has_tires = get_coll("tires").count_documents({"locationId": loc_id}) > 0
        has_sales = get_coll("sales").count_documents({"locationId": loc_id}) > 0
        
        if has_tires or has_sales:
            return jsonify({"error": "Cannot delete location with active inventory or sales records."}), 400
            
        result = get_coll("locations").delete_one({"_id": loc_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Location not found."}), 404
        return jsonify({"message": "Location deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# TIRE TYPES CRUD
@app.route("/api/tire-types", methods=["GET"])
def get_tire_types():
    try:
        types = [t['name'] for t in get_coll("tire_types").find()]
        return jsonify(types), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/tire-types", methods=["POST"])
def add_tire_type():
    try:
        data = request.json
        if not data or 'name' not in data:
            return jsonify({"error": "Missing tire type name."}), 400
        
        name = data['name'].strip()
        # Check if exists
        exists = get_coll("tire_types").find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
        if exists:
            return jsonify({"error": "Tire type already exists."}), 400
            
        get_coll("tire_types").insert_one({"name": name})
        return jsonify({"name": name}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/tire-types/<old_name>", methods=["PUT"])
def update_tire_type(old_name):
    try:
        data = request.json
        if not data or 'name' not in data:
            return jsonify({"error": "Missing new tire type name."}), 400
            
        new_name = data['name'].strip()
        # Check if new name exists already (excluding current old_name)
        if new_name.lower() != old_name.lower():
            exists = get_coll("tire_types").find_one({"name": {"$regex": f"^{new_name}$", "$options": "i"}})
            if exists:
                return jsonify({"error": "Tire type already exists."}), 400
        
        # Update type
        get_coll("tire_types").update_one({"name": old_name}, {"$set": {"name": new_name}})
        # Update associated tires
        get_coll("tires").update_many({"type": old_name}, {"$set": {"type": new_name}})
        # Update associated historical sales
        get_coll("sales").update_many({"tireType": old_name}, {"$set": {"tireType": new_name}})
        
        return jsonify({"old_name": old_name, "new_name": new_name}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/tire-types/<name>", methods=["DELETE"])
def delete_tire_type(name):
    try:
        # Check if tire type is in use
        in_use = get_coll("tires").count_documents({"type": name}) > 0
        if in_use:
            return jsonify({"error": "Cannot delete tire type while it is assigned to tires."}), 400
            
        result = get_coll("tire_types").delete_one({"name": name})
        if result.deleted_count == 0:
            return jsonify({"error": "Tire type not found."}), 404
        return jsonify({"message": "Tire type deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# TIRES CRUD
@app.route("/api/tires", methods=["GET"])
def get_tires():
    try:
        tires = list(get_coll("tires").find())
        return jsonify(serialize_docs(tires)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/tires", methods=["POST"])
def add_tire():
    try:
        data = request.json
        if not data or 'name' not in data or 'type' not in data or 'locationId' not in data:
            return jsonify({"error": "Missing required tire fields."}), 400
            
        qty = int(data.get('quantity', 0))
        tire_id = data.get('id')
        
        doc = {
            "_id": tire_id,
            "name": data['name'].strip(),
            "type": data['type'],
            "quantity": qty,
            "locationId": data['locationId']
        }
        
        get_coll("tires").insert_one(doc)
        return jsonify(serialize_doc(doc)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/tires/<tire_id>", methods=["PUT"])
def update_tire(tire_id):
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No update fields provided."}), 400
            
        update_fields = {}
        if 'name' in data:
            update_fields['name'] = data['name'].strip()
        if 'type' in data:
            update_fields['type'] = data['type']
        if 'quantity' in data:
            update_fields['quantity'] = int(data['quantity'])
            
        if not update_fields:
            return jsonify({"error": "No valid fields to update."}), 400
            
        get_coll("tires").update_one({"_id": tire_id}, {"$set": update_fields})
        # If tire name or type changes, sync it in the sales logs too
        sync_fields = {}
        if 'name' in data:
            sync_fields['tireName'] = data['name'].strip()
        if 'type' in data:
            sync_fields['tireType'] = data['type']
            
        if sync_fields:
            get_coll("sales").update_many({"tireId": tire_id}, {"$set": sync_fields})
            
        updated_tire = get_coll("tires").find_one({"_id": tire_id})
        return jsonify(serialize_doc(updated_tire)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/tires/<tire_id>", methods=["DELETE"])
def delete_tire(tire_id):
    try:
        result = get_coll("tires").delete_one({"_id": tire_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Tire not found."}), 404
        return jsonify({"message": "Tire deleted successfully from active inventory."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# SALES CRUD
@app.route("/api/sales", methods=["GET"])
def get_sales():
    try:
        sales = list(get_coll("sales").find())
        return jsonify(serialize_docs(sales)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/sales", methods=["POST"])
def log_sale():
    try:
        data = request.json
        if not data or 'tireId' not in data or 'quantity' not in data or 'locationId' not in data:
            return jsonify({"error": "Missing required sale fields."}), 400
            
        tire_id = data['tireId']
        qty = int(data['quantity'])
        
        # Verify tire exists and has sufficient quantity
        tire = get_coll("tires").find_one({"_id": tire_id})
        if not tire:
            return jsonify({"error": "Tire not found in active inventory."}), 404
            
        if tire['quantity'] < qty:
            return jsonify({"error": f"Insufficient stock. Only {tire['quantity']} remaining."}), 400
            
        # Deduct quantity from tire stock (Atomic update)
        get_coll("tires").update_one({"_id": tire_id}, {"$inc": {"quantity": -qty}})
        
        # Insert sale
        sale_id = data.get('id')
        doc = {
            "_id": sale_id,
            "tireId": tire_id,
            "tireName": tire['name'],
            "tireType": tire['type'],
            "quantity": qty,
            "saleDate": data.get('saleDate'),
            "locationId": data['locationId']
        }
        get_coll("sales").insert_one(doc)
        return jsonify(serialize_doc(doc)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/sales/<sale_id>", methods=["DELETE"])
def delete_sale(sale_id):
    try:
        # Find sale to restore stock
        sale = get_coll("sales").find_one({"_id": sale_id})
        if not sale:
            return jsonify({"error": "Sale record not found."}), 404
            
        # Restore stock if tire still exists in inventory
        tire_exists = get_coll("tires").count_documents({"_id": sale['tireId']}) > 0
        if tire_exists:
            get_coll("tires").update_one({"_id": sale['tireId']}, {"$inc": {"quantity": sale['quantity']}})
            
        get_coll("sales").delete_one({"_id": sale_id})
        return jsonify({
            "message": "Sale cancelled successfully.",
            "stock_restored": tire_exists
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Get port from environment (Render sets this dynamically)
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
