from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import motor.motor_asyncio
from bson import ObjectId
import json
import bcrypt
import jwt

router = APIRouter()

# MongoDB connection
client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
db = client.disaster_management
agencies_collection = db.rescue_agencies

class AgencyLogin(BaseModel):
    email: str
    password: str

class AgencyRegistration(BaseModel):
    name: str
    type: str
    location: str
    contactPerson: str
    contactNumber: str
    email: str
    password: str
    emergencyContact: Optional[str] = None
    city: str
    district: str
    state: str
    licenseNumber: Optional[str] = None
    specialization: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AgencyUpdate(BaseModel):
    name: str
    type: str
    location: str
    contactPerson: str
    contactNumber: str
    emergencyContact: Optional[str] = None
    city: str
    district: str
    state: str
    licenseNumber: Optional[str] = None
    specialization: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ResourceUpdate(BaseModel):
    vehicles: dict
    equipment: dict
    personnel: dict
    availability: str
    current_mission: Optional[str] = None
    estimated_response_time: int

class LiveLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    timestamp: Optional[datetime] = None
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None

class AgencyData(BaseModel):
    id: str
    name: str
    type: str
    location: str
    contactPerson: str
    contactNumber: str
    email: str
    emergencyContact: Optional[str] = None
    city: str
    district: str
    state: str
    licenseNumber: Optional[str] = None
    specialization: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    resources: ResourceUpdate
    status: str
    last_updated: datetime
    response_time: int

@router.post("/login")
async def login_agency(agency: AgencyLogin):
    try:
        # Find agency by email
        agency_doc = await agencies_collection.find_one({"email": agency.email})
        if not agency_doc:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Check password (for now, simple comparison - in production use bcrypt)
        if agency.password != agency_doc.get("password", ""):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Check if agency is approved
        if agency_doc.get("status") != "Approved":
            raise HTTPException(status_code=403, detail="Agency not yet approved by admin")
        
        # Create access token (simple implementation)
        access_token = f"token_{agency_doc['_id']}_{datetime.utcnow().timestamp()}"
        
        # Return agency data and token
        agency_data = {
            "id": str(agency_doc["_id"]),
            "name": agency_doc["name"],
            "type": agency_doc["type"],
            "location": agency_doc["location"],
            "contactPerson": agency_doc.get("contactPerson", ""),
            "contactNumber": agency_doc.get("contactNumber", ""),
            "email": agency_doc["email"],
            "emergencyContact": agency_doc.get("emergencyContact"),
            "city": agency_doc.get("city", ""),
            "district": agency_doc.get("district", ""),
            "state": agency_doc.get("state", ""),
            "licenseNumber": agency_doc.get("licenseNumber"),
            "specialization": agency_doc.get("specialization"),
            "latitude": agency_doc.get("latitude"),
            "longitude": agency_doc.get("longitude"),
            "resources": agency_doc.get("resources", {}),
            "status": agency_doc["status"],
            "last_updated": agency_doc["last_updated"],
            "response_time": agency_doc.get("response_time", 30)
        }
        
        return {
            "access_token": access_token,
            "agency": agency_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/register")
async def register_agency(agency: AgencyRegistration):
    try:
        # Check if agency already exists
        existing_agency = await agencies_collection.find_one({"email": agency.email})
        if existing_agency:
            raise HTTPException(status_code=400, detail="Agency already registered with this email")
        
        # Create new agency document (pending approval)
        agency_doc = {
            "name": agency.name,
            "type": agency.type,
            "location": agency.location,
            "contactPerson": agency.contactPerson,
            "contactNumber": agency.contactNumber,
            "email": agency.email,
            "password": agency.password,  # In production, hash this password
            "emergencyContact": agency.emergencyContact,
            "city": agency.city,
            "district": agency.district,
            "state": agency.state,
            "licenseNumber": agency.licenseNumber,
            "specialization": agency.specialization,
            "latitude": agency.latitude,
            "longitude": agency.longitude,
            "resources": {
                "vehicles": {},
                "equipment": {},
                "personnel": {},
                "availability": "Pending",
                "current_mission": None,
                "estimated_response_time": 30
            },
            "status": "Pending",  # Pending admin approval
            "last_updated": datetime.utcnow(),
            "response_time": 30
        }
        
        result = await agencies_collection.insert_one(agency_doc)
        
        return {
            "success": True,
            "message": "Agency registered successfully! Please wait for admin approval.",
            "agency_id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{agency_id}/resources")
async def update_resources(agency_id: str, resources: ResourceUpdate):
    try:
        # Validate agency_id format
        if not ObjectId.is_valid(agency_id):
            raise HTTPException(status_code=400, detail="Invalid agency ID")
        
        # Update agency resources
        update_data = {
            "resources": resources.dict(),
            "last_updated": datetime.utcnow(),
            "response_time": resources.estimated_response_time
        }
        
        result = await agencies_collection.update_one(
            {"_id": ObjectId(agency_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Agency not found")
        
        return {
            "success": True,
            "message": "Resources updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/")
async def get_all_agencies():
    try:
        agencies = []
        cursor = agencies_collection.find({})
        
        async for agency in cursor:
            agency["id"] = str(agency["_id"])
            del agency["_id"]
            agencies.append(agency)
        
        return {
            "success": True,
            "agencies": agencies
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{agency_id}")
async def get_agency(agency_id: str):
    try:
        # Validate agency_id format
        if not ObjectId.is_valid(agency_id):
            raise HTTPException(status_code=400, detail="Invalid agency ID")
        
        agency = await agencies_collection.find_one({"_id": ObjectId(agency_id)})
        if not agency:
            raise HTTPException(status_code=404, detail="Agency not found")
        
        agency["id"] = str(agency["_id"])
        del agency["_id"]
        
        return {
            "success": True,
            "agency": agency
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{agency_id}/status")
async def update_agency_status(agency_id: str, status: str):
    try:
        # Validate agency_id format
        if not ObjectId.is_valid(agency_id):
            raise HTTPException(status_code=400, detail="Invalid agency ID")
        
        # Update agency status
        result = await agencies_collection.update_one(
            {"_id": ObjectId(agency_id)},
            {"$set": {"status": status, "last_updated": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Agency not found")
        
        return {
            "success": True,
            "message": "Status updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{agency_id}")
async def delete_agency(agency_id: str):
    try:
        # Validate agency_id format
        if not ObjectId.is_valid(agency_id):
            raise HTTPException(status_code=400, detail="Invalid agency ID")
        
        result = await agencies_collection.delete_one({"_id": ObjectId(agency_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Agency not found")
        
        return {
            "success": True,
            "message": "Agency deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{agency_id}/approve")
async def approve_agency(agency_id: str):
    try:
        # Validate agency_id format
        if not ObjectId.is_valid(agency_id):
            raise HTTPException(status_code=400, detail="Invalid agency ID")
        
        # Update agency status to approved
        update_data = {
            "status": "Approved",
            "resources.availability": "Available",
            "last_updated": datetime.utcnow()
        }
        
        result = await agencies_collection.update_one(
            {"_id": ObjectId(agency_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Agency not found")
        
        return {
            "success": True,
            "message": "Agency approved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{agency_id}")
async def update_agency_details(agency_id: str, agency_update: AgencyUpdate):
    try:
        print(f"Received update request for agency {agency_id}")
        print(f"Update data: {agency_update.dict()}")
        
        # Validate agency_id format
        if not ObjectId.is_valid(agency_id):
            raise HTTPException(status_code=400, detail="Invalid agency ID")
        
        # Check if agency exists
        existing_agency = await agencies_collection.find_one({"_id": ObjectId(agency_id)})
        if not existing_agency:
            raise HTTPException(status_code=404, detail="Agency not found")
        
        # Update agency details (excluding password and email for security)
        update_data = {
            "name": agency_update.name,
            "type": agency_update.type,
            "location": agency_update.location,
            "contactPerson": agency_update.contactPerson,
            "contactNumber": agency_update.contactNumber,
            "emergencyContact": agency_update.emergencyContact,
            "city": agency_update.city,
            "district": agency_update.district,
            "state": agency_update.state,
            "licenseNumber": agency_update.licenseNumber,
            "specialization": agency_update.specialization,
            "latitude": agency_update.latitude,
            "longitude": agency_update.longitude,
            "last_updated": datetime.utcnow()
        }
        
        print(f"Processed update data: {update_data}")
        
        result = await agencies_collection.update_one(
            {"_id": ObjectId(agency_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Agency not found")
        
        return {
            "success": True,
            "message": "Agency details updated successfully"
        }
    except Exception as e:
        print(f"Error updating agency: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{agency_id}/live-location")
async def update_live_location(agency_id: str, location_update: LiveLocationUpdate):
    """Update agency's live location in real-time"""
    try:
        # Validate agency_id format
        if not ObjectId.is_valid(agency_id):
            raise HTTPException(status_code=400, detail="Invalid agency ID")

        # Check if agency exists
        existing_agency = await agencies_collection.find_one({"_id": ObjectId(agency_id)})
        if not existing_agency:
            raise HTTPException(status_code=404, detail="Invalid agency ID")

        # Prepare location update data
        update_data = {
            "latitude": location_update.latitude,
            "longitude": location_update.longitude,
            "last_updated": location_update.timestamp or datetime.utcnow(),
            "location_accuracy": location_update.accuracy,
            "location_speed": location_update.speed,
            "location_heading": location_update.heading
        }

        # Update agency location
        result = await agencies_collection.update_one(
            {"_id": ObjectId(agency_id)},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Agency not found")

        # Return updated location data
        return {
            "success": True,
            "message": "Live location updated successfully",
            "location": {
                "latitude": location_update.latitude,
                "longitude": location_update.longitude,
                "timestamp": update_data["last_updated"],
                "accuracy": location_update.accuracy,
                "speed": location_update.speed,
                "heading": location_update.heading
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
