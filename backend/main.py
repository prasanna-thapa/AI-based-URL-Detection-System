from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
from backend.feature_engineering import extract_features   # <-- FIXED IMPORT
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime

MONGO_URI = os.getenv("MONGO_URI")
logs_collection = None

if MONGO_URI:
    try:
        from pymongo import MongoClient
        mongo_client = MongoClient(MONGO_URI)
        db = mongo_client["phishing_detector"]
        logs_collection = db["url_logs"]
    except Exception:
        logs_collection = None


def load_model():
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    try:
        return joblib.load(model_path)
    except Exception as e:
        raise RuntimeError(f"Model failed to load: {e}")

model = load_model()

app = FastAPI(title="Phishing Detection API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLInput(BaseModel):
    url: str


def predict_url(url: str):
    url = url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Empty URL provided.")

    if not url.startswith("http"):
        url = "https://" + url

    try:
        features = extract_features(url)
        df = pd.DataFrame([features])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feature extraction failed: {e}")

    try:
        proba = float(model.predict_proba(df)[0][1])
        label = "phishing" if proba >= 0.5 else "safe"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction error: {e}")

    return url, label, proba


@app.get("/")
async def home():
    return {"message": "Phishing Detection API (Optimized v2.0)"}


@app.post("/predict")
async def predict_api(data: URLInput):
    url, label, proba = predict_url(data.url)

    if logs_collection:
        try:
            logs_collection.insert_one({
                "url": url,
                "prediction": label,
                "confidence": proba,
                "timestamp": datetime.utcnow()
            })
        except Exception:
            pass

    return {
        "url": url,
        "prediction": label,
        "confidence": proba
    }
