from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from pathlib import Path
import joblib
import re, sys
import numpy as np
from backend.central import db

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

# ------------------------------- ML Model setup -------------------------------
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

class PredictRequest(BaseModel):
    text: str

class DisasterReport(BaseModel):
    reporter: str
    text: str
    latitude: float
    longitude: float
    label: int = 0
    label_name: str = "not disaster"

@app.post("/predict")
def predict(request: PredictRequest):
    if model is None:
        return {"error": "Model not loaded"}
    prediction = model.predict([request.text])[0]
    return {
        "label": int(prediction),
        "label_name": "disaster" if prediction == 1 else "not disaster"
    }

@app.post("/report")
async def create_report(report: DisasterReport):
    if model is None:
        return {"error": "Model not loaded"}
    prediction = model.predict([report.text])[0]
    report.label = int(prediction)
    report.label_name = "disaster" if prediction == 1 else "not disaster"
    result = await reports_collection.insert_one(report.model_dump())
    return {
        "message": "Report submitted",
        "id": str(result.inserted_id),
        "classification": report.label_name
    }

@app.get("/reports")
async def get_reports():
    reports = await reports_collection.find().to_list(100)
    for r in reports:
        r["_id"] = str(r["_id"])
    return reports