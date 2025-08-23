# app.py
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from pathlib import Path
import joblib
import re, sys
import numpy as np
from backend.central import db
from datetime import datetime

# -------------------- Utilities --------------------
def clean_text(s: str) -> str:
    if not isinstance(s, str):
        return ""
    s = s.lower()
    s = re.sub(r"http\S+|www\.\S+", " ", s)
    s = re.sub(r"@\w+", " ", s)
    s = re.sub(r"#", " ", s)
    s = re.sub(r"[^a-z\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def clean_series(texts):
    return np.array([clean_text(t) for t in texts])

sys.modules['__main__'].clean_series = clean_series
reports_collection = db["reports"]

# -------------------- ML Model setup --------------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "backend" / "AI-ML" / "models" / "disaster_tweet_model.joblib"
model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Train it first.")
    model = joblib.load(MODEL_PATH)
    print("✅ Model loaded successfully")
    yield
    print("🛑 Application shutting down")

# -------------------- App Initialization --------------------
app = FastAPI(
    title="Disaster Tweet Classifier API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Pydantic Models --------------------
class PredictRequest(BaseModel):
    text: str

class DisasterReport(BaseModel):
    reporter: str
    text: str
    latitude: float
    longitude: float

class SOSAlert(BaseModel):
    reporter: str
    latitude: float
    longitude: float
    description: str | None = None
    severity: str = "critical"
    isSOSAlert: bool = True
    timestamp: str | None = None

# -------------------- Endpoints --------------------
@app.post("/predict")
def predict(request: PredictRequest):
    if model is None:
        return {"error": "Model not loaded"}
    prediction = model.predict([request.text])[0]
    return {
        "label": int(prediction),
        "label_name": "disaster" if prediction == 1 else "not disaster"
    }

# -------------------- /report endpoint --------------------
@app.post("/report")
async def create_report(
    reporter: str | None = Form(None),
    text: str | None = Form(None),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    payload: DisasterReport | None = None
):
    # Use JSON body if provided
    if payload:
        reporter = payload.reporter
        text = payload.text
        latitude = payload.latitude
        longitude = payload.longitude

    # Validate required fields
    if not all([reporter, text, latitude, longitude]):
        return {"error": "Missing required fields: reporter, text, latitude, longitude"}

    prediction = model.predict([text])[0]
    label_name = "disaster" if prediction == 1 else "not disaster"

    data = {
        "reporter": reporter,
        "text": text,
        "latitude": latitude,
        "longitude": longitude,
        "label": int(prediction),
        "label_name": label_name
    }

    result = await reports_collection.insert_one(data)
    return {
        "message": "Report submitted",
        "id": str(result.inserted_id),
        "classification": label_name
    }

# -------------------- /reports endpoint --------------------
@app.get("/reports")
async def get_reports():
    reports = await reports_collection.find().to_list(100)
    for r in reports:
        r["_id"] = str(r["_id"])
    return reports

# -------------------- /sos endpoint --------------------
@app.post("/sos")
async def sos_alert(
    reporter: str | None = Form(None),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    description: str | None = Form(None),
    severity: str | None = Form("critical"),
    timestamp: str | None = Form(None),
    payload: SOSAlert | None = None
):
    # Use JSON body if provided
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
        "message": " SOS alert received",
        "id": str(result.inserted_id),
        "data": data
    }
