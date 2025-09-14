from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import json
from datetime import datetime

app = FastAPI(title="Test Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for rescue agencies
mock_rescue_agencies = [
    {
        "id": 1,
        "name": "Uttarakhand Police",
        "type": "Police",
        "status": "active",
        "location": "Dehradun",
        "contact": "+91-135-1234567",
        "resources": ["vehicles", "personnel", "equipment"],
        "approved": True
    },
    {
        "id": 2,
        "name": "NDRF Team Alpha",
        "type": "Rescue",
        "status": "active", 
        "location": "Haridwar",
        "contact": "+91-1334-123456",
        "resources": ["boats", "diving_gear", "medical_supplies"],
        "approved": True
    }
]

# Mock SOS alerts
mock_sos_alerts = []

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Test server is running"}

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/sos")
async def sos_endpoint():
    return {
        "status": "SOS received",
        "message": "Emergency response team has been notified",
        "timestamp": "2025-01-27T21:14:01Z",
        "priority": "HIGH"
    }

@app.post("/sos")
async def sos_post(
    latitude: Optional[str] = Form(None),
    longitude: Optional[str] = Form(None),
    severity: Optional[str] = Form(None),
    isSOSAlert: Optional[str] = Form(None),
    timestamp: Optional[str] = Form(None)
):
    # Store the SOS alert for government dashboard
    sos_alert = {
        "id": len(mock_sos_alerts) + 1,
        "latitude": latitude,
        "longitude": longitude,
        "severity": severity,
        "timestamp": timestamp or datetime.now().isoformat(),
        "status": "active",
        "location": f"Lat: {latitude}, Long: {longitude}",
        "emergency_type": "SOS_ALERT"
    }
    mock_sos_alerts.append(sos_alert)
    
    return {
        "status": "SOS Alert received",
        "message": "Emergency response team has been notified",
        "location": {
            "latitude": latitude,
            "longitude": longitude
        },
        "severity": severity,
        "timestamp": timestamp,
        "priority": "CRITICAL"
    }

@app.post("/report")
async def report_post(
    latitude: Optional[str] = Form(None),
    longitude: Optional[str] = Form(None),
    message: Optional[str] = Form(None),
    severity: Optional[str] = Form(None),
    timestamp: Optional[str] = Form(None)
):
    return {
        "status": "Report received",
        "message": "Disaster report has been recorded",
        "location": {
            "latitude": latitude,
            "longitude": longitude
        },
        "severity": severity,
        "timestamp": timestamp,
        "id": "REP_" + str(hash(timestamp or "default"))
    }

# Government Dashboard Endpoints
@app.get("/rescue-agencies/")
async def get_rescue_agencies():
    return mock_rescue_agencies

@app.get("/rescue-agencies/{agency_id}")
async def get_rescue_agency(agency_id: int):
    agency = next((a for a in mock_rescue_agencies if a["id"] == agency_id), None)
    if not agency:
        return {"error": "Agency not found"}
    return agency

@app.put("/rescue-agencies/{agency_id}/resources")
async def update_rescue_agency_resources(agency_id: str):
    # Handle the resource update request
    return {
        "status": "success",
        "message": f"Resources updated for agency {agency_id}",
        "agency_id": agency_id,
        "updated_at": datetime.now().isoformat()
    }

@app.get("/sos-dashboard")
async def get_sos_dashboard():
    return {
        "total_alerts": len(mock_sos_alerts),
        "active_alerts": len([a for a in mock_sos_alerts if a["status"] == "active"]),
        "recent_alerts": mock_sos_alerts[-5:] if mock_sos_alerts else [],
        "alerts_by_severity": {
            "critical": len([a for a in mock_sos_alerts if a["severity"] == "critical"]),
            "high": len([a for a in mock_sos_alerts if a["severity"] == "high"]),
            "medium": len([a for a in mock_sos_alerts if a["severity"] == "medium"])
        }
    }

@app.get("/sos-map")
async def get_sos_map():
    return {
        "alerts": mock_sos_alerts,
        "map_center": {"lat": 30.0668, "lng": 79.0193},  # Uttarakhand center
        "zoom": 8
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting test server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
