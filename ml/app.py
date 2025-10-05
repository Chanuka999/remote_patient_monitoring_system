from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import joblib
import os

app = FastAPI()

# Allow CORS from any origin for development (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Try to load models from the same directory as this file
BASE_DIR = os.path.dirname(__file__)
HEART_MODEL_PATH = os.path.join(BASE_DIR, "h.pickle")
CANCER_MODEL_PATH = os.path.join(BASE_DIR, "brest_cancer.pickle")

# --- Normalization parameters for the heart model (z-score) ---
# Replace these placeholder values with the real mean/std used at training time.
# Order must match the features array built below.
HEART_MEAN = [120.0, 80.0, 70.0, 100.0, 36.6, 98.0]
HEART_STD = [15.0, 10.0, 10.0, 30.0, 0.7, 2.0]


def _safe_load(path):
    try:
        return joblib.load(path)
    except Exception as e:
        # Keep failing lazy so server still starts; raise on predict if needed
        return None

heart_model = _safe_load(HEART_MODEL_PATH)
cancer_model = _safe_load(CANCER_MODEL_PATH)


class PredictRequest(BaseModel):
    model: str  # 'heart' or 'cancer'
    input: List[float]


class HeartFormRequest(BaseModel):
    systolic: float
    diastolic: float
    heartRate: float
    glucoseLevel: float
    temperature: float
    oxygenSaturation: float


@app.get("/")
def read_root():
    return {"status": "ok", "models": {"heart": bool(heart_model), "cancer": bool(cancer_model)}}


@app.post("/predict")
def predict(req: PredictRequest):
    model_name = req.model.lower()
    features = req.input

    if not isinstance(features, list) or len(features) == 0:
        raise HTTPException(status_code=400, detail="`input` must be a non-empty list of numbers")

    if model_name == "heart":
        if heart_model is None:
            raise HTTPException(status_code=500, detail="Heart model not available on server")
        try:
            pred = heart_model.predict([features])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Model prediction failed: {e}")
        return {"model": "heart", "prediction": int(pred[0])}

    elif model_name == "cancer" or model_name == "breast":
        if cancer_model is None:
            raise HTTPException(status_code=500, detail="Cancer model not available on server")
        try:
            pred = cancer_model.predict([features])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Model prediction failed: {e}")
        return {"model": "cancer", "prediction": int(pred[0])}

    else:
        raise HTTPException(status_code=400, detail="Unknown model. Use 'heart' or 'cancer'")


@app.post("/predict/heart_from_form")
def predict_heart_from_form(req: HeartFormRequest):
    """
    Accepts the patient form fields and maps them to the heart model input.

    IMPORTANT: adjust the mapping below to match your trained model's expected feature order.
    Currently this maps the six fields into a 6-element vector in the same order they arrive.
    """
    if heart_model is None:
        raise HTTPException(status_code=500, detail="Heart model not available on server")

    features = [
        req.systolic,
        req.diastolic,
        req.heartRate,
        req.glucoseLevel,
        req.temperature,
        req.oxygenSaturation,
    ]

    # Apply z-score normalization using provided MEAN and STD
    try:
        normalized = [
            (f - m) / s if s != 0 else 0.0
            for f, m, s in zip(features, HEART_MEAN, HEART_STD)
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Normalization failed: {e}")

    try:
        pred = heart_model.predict([normalized])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction failed: {e}")

    return {"model": "heart", "prediction": int(pred[0]), "features": features, "normalized": normalized}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("ml.app:app", host="0.0.0.0", port=8000, reload=True)
