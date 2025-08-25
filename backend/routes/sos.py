from fastapi import APIRouter, Form
from datetime import datetime
from backend.models import SOSAlert
from backend.database import reports_collection
from bson import ObjectId

router = APIRouter()

@router.post("/sos")
async def sos_alert(
    reporter: str | None = Form(None),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    description: str | None = Form(None),
    severity: str | None = Form("critical"),
    timestamp: str | None = Form(None),
    payload: SOSAlert | None = None
):
    # Overwrite form data if payload is sent as JSON
    if payload:
        reporter = payload.reporter
        latitude = payload.latitude
        longitude = payload.longitude
        description = payload.description
        severity = payload.severity
        timestamp = payload.timestamp

    if not all([reporter, latitude, longitude]):
        return {"error": "Missing required fields: reporter, latitude, longitude"}

    if timestamp is None:
        timestamp = datetime.utcnow().isoformat()

    data = {
        "reporter": reporter,
        "latitude": latitude,
        "longitude": longitude,
        "description": description,
        "severity": severity,
        "isSOSAlert": True,
        "timestamp": timestamp
    }

    result = await reports_collection.insert_one(data)

    return {
        "message": "SOS alert received",
        "id": str(result.inserted_id),
        "data": {**data, "_id": str(result.inserted_id)}
    }


@router.get("/sos")
async def get_sos_alerts():
    alerts_cursor = reports_collection.find({})
    alerts = await alerts_cursor.to_list(length=None)

    # Convert ObjectId to string for JSON serialization
    for alert in alerts:
        alert["_id"] = str(alert["_id"])

    return {"count": len(alerts), "data": alerts}
