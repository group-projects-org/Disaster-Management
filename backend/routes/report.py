import os
from bson import ObjectId
from backend.models import DisasterReport
from backend.ml_model import predict_text
from backend.database import reports_collection
from fastapi import APIRouter, Form, UploadFile, File

router = APIRouter()

@router.post("/report")
async def create_report(reporter: str = Form(...), text: str = Form(...), latitude: float = Form(...), longitude: float = Form(...), severity: str = Form(...), disaster_type: str = Form(...), photo: UploadFile | None = File(None), voice_note: UploadFile | None = File(None) ):
    if not all([reporter, text, latitude, longitude]):
        return {"error": "Missing required fields: reporter, text, latitude, longitude"}
    photo_path = None
    voice_path = None
    if photo:
        photo_path = f"uploads/photos/{photo.filename}"
        os.makedirs("uploads/photos", exist_ok=True)
        with open(photo_path, "wb") as buffer:
            buffer.write(await photo.read())
    if voice_note:
        voice_path = f"uploads/voices/{voice_note.filename}"
        os.makedirs("uploads/voices", exist_ok=True)
        with open(voice_path, "wb") as buffer:
            buffer.write(await voice_note.read())
    prediction = predict_text(text)
    label_name = "disaster" if prediction == 1 else "not disaster"
    data = { "reporter": reporter, "text": text, "latitude": latitude, "longitude": longitude, "severity": severity, "disaster_type": disaster_type, "photo_path": photo_path, "voice_note_path": voice_path, "label": int(prediction), "label_name": label_name }
    result = await reports_collection.insert_one(data)
    return {
        "message": "Report submitted",
        "id": str(result.inserted_id),
        "classification": label_name
    }

@router.get("/reports")
async def get_reports():
    reports = await reports_collection.find().to_list(100)
    for r in reports:
        r["_id"] = str(r["_id"])
    return reports