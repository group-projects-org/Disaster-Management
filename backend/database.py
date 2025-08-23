from motor.motor_asyncio import AsyncIOMotorClient
from .config import MONGO_URI, MONGO_DB_NAME
import asyncio
from datetime import datetime

# MongoDB connection
client = None
db = None
reports_collection = None
sos_alerts_collection = None
users_collection = None

# Fallback in-memory storage
in_memory_reports = []
in_memory_sos_alerts = []
in_memory_users = []

async def connect_mongodb():
    """Connect to MongoDB"""
    global client, db, reports_collection, sos_alerts_collection, users_collection
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[MONGO_DB_NAME]
        reports_collection = db["reports"]
        sos_alerts_collection = db["sos_alerts"]
        users_collection = db["users"]
        
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connected successfully")
        return True
    except Exception as e:
        print(f"⚠️ MongoDB connection failed: {e}")
        print("📝 Using in-memory storage as fallback")
        return False

async def disconnect_mongodb():
    """Disconnect from MongoDB"""
    global client
    if client:
        client.close()
        print("🔌 MongoDB disconnected")

# Initialize indexes
async def init_db():
    """Initialize database indexes"""
    if not await connect_mongodb():
        return False
    
    try:
        # Create indexes for better query performance
        await reports_collection.create_index([("timestamp", -1)])
        await reports_collection.create_index([("latitude", 1), ("longitude", 1)])
        await sos_alerts_collection.create_index([("timestamp", -1)])
        await sos_alerts_collection.create_index([("severity", 1)])
        print("✅ Database indexes created successfully")
        return True
    except Exception as e:
        print(f"⚠️ Warning: Could not create indexes: {e}")
        return False

# Test database connection
async def test_connection():
    """Test database connection"""
    return await connect_mongodb()

# Fallback functions for in-memory storage
async def insert_report(report_data):
    """Insert report into database or in-memory storage"""
    if reports_collection is not None:
        try:
            result = await reports_collection.insert_one(report_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error inserting report to MongoDB: {e}")
            return None
    
    # Fallback to in-memory storage
    report_id = f"mem_{len(in_memory_reports) + 1}_{datetime.now().timestamp()}"
    report_data["_id"] = report_id
    in_memory_reports.append(report_data)
    print(f"📝 Report stored in memory with ID: {report_id}")
    return report_id

async def get_reports():
    """Get reports from database or in-memory storage"""
    if reports_collection is not None:
        try:
            reports = await reports_collection.find().to_list(100)
            for r in reports:
                r["_id"] = str(r["_id"])
            return reports
        except Exception as e:
            print(f"Error getting reports from MongoDB: {e}")
            return []
    
    # Fallback to in-memory storage
    return in_memory_reports.copy()

async def insert_sos_alert(alert_data):
    """Insert SOS alert into database or in-memory storage"""
    if sos_alerts_collection is not None:
        try:
            result = await sos_alerts_collection.insert_one(alert_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error inserting SOS alert to MongoDB: {e}")
            return None
    
    # Fallback to in-memory storage
    alert_id = f"sos_{len(in_memory_sos_alerts) + 1}_{datetime.now().timestamp()}"
    alert_data["_id"] = alert_id
    in_memory_sos_alerts.append(alert_data)
    print(f"🚨 SOS alert stored in memory with ID: {alert_id}")
    return alert_id
