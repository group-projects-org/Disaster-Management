from dotenv import load_dotenv
import os, sys

# Root directory in system path
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if root_path not in sys.path:
    sys.path.append(root_path)

# Load environment variables explicitly
dotenv_path = os.path.join(root_path, ".env")
load_dotenv(dotenv_path)

mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise ValueError("MONGO_URI not set in environment variables")

from motor.motor_asyncio import AsyncIOMotorClient
mongo_client = AsyncIOMotorClient(mongo_uri)
db = mongo_client["Disaster-Management-System"]
