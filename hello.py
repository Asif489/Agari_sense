# ============================================================
# AGRISENSE AI
# FastAPI Backend
# Optuna + XGBoost Crop Recommendation
# ============================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np
import os


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "agrisense_xgboost_optuna_model.pkl"
)

FEATURE_PATH = os.path.join(
    MODEL_DIR,
    "agrisense_features_optuna.pkl"
)

CROP_ENCODER_PATH = os.path.join(
    MODEL_DIR,
    "agrisense_crop_label_encoder_optuna.pkl"
)

SOIL_ENCODER_PATH = os.path.join(
    MODEL_DIR,
    "agrisense_soil_encoder_optuna.pkl"
)


# ============================================================
# LOAD TRAINED MODEL
# ============================================================

print("=" * 60)
print("LOADING AGRISENSE AI MODEL")
print("=" * 60)

model = joblib.load(MODEL_PATH)

features = joblib.load(FEATURE_PATH)

crop_encoder = joblib.load(
    CROP_ENCODER_PATH
)

soil_encoder = joblib.load(
    SOIL_ENCODER_PATH
)


print("Model loaded:", type(model))
print("Features:", features)
print("Crop classes:", crop_encoder.classes_)
print("Soil classes:", soil_encoder.classes_)

print("=" * 60)
print("MODEL READY")
print("=" * 60)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="AgriSense AI API",
    description="AI-powered crop recommendation system",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# INPUT SCHEMA
# ============================================================

class CropInput(BaseModel):

    N: float = Field(
        ...,
        description="Nitrogen level"
    )

    P: float = Field(
        ...,
        description="Phosphorus level"
    )

    K: float = Field(
        ...,
        description="Potassium level"
    )

    ph: float = Field(
        ...,
        description="Soil pH"
    )

    temperature: float = Field(
        ...,
        description="Temperature in Celsius"
    )

    humidity: float = Field(
        ...,
        description="Humidity percentage"
    )

    rainfall: float = Field(
        ...,
        description="Rainfall"
    )

    soil: str = Field(
        ...,
        description="Soil type"
    )


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def home():

    return {
        "status": "online",
        "name": "AgriSense AI",
        "model": "Optuna + XGBoost",
        "message": "AgriSense AI prediction API is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": True,
        "model": "Optuna XGBoost"
    }


# ============================================================
# SOIL OPTIONS
# ============================================================

@app.get("/soil-options")
def soil_options():

    soils = [
        str(x)
        for x in soil_encoder.classes_
    ]

    return {
        "soils": soils
    }


# ============================================================
# CROP OPTIONS
# ============================================================

@app.get("/crop-options")
def crop_options():

    crops = [
        str(x)
        for x in crop_encoder.classes_
    ]

    return {
        "crops": crops
    }


# ============================================================
# PREDICT
# ============================================================

@app.post("/predict")
def predict(data: CropInput):

    try:

        # ----------------------------------------------------
        # SOIL ENCODING
        # ----------------------------------------------------

        soil_value = data.soil.strip()

        valid_soils = [
            str(x)
            for x in soil_encoder.classes_
        ]

        # Case-insensitive matching
        soil_lookup = {
            x.lower(): x
            for x in valid_soils
        }

        if soil_value.lower() not in soil_lookup:

            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Invalid soil type",
                    "available_soils": valid_soils
                }
            )

        actual_soil = soil_lookup[
            soil_value.lower()
        ]

        soil_encoded = soil_encoder.transform(
            [actual_soil]
        )[0]


        # ----------------------------------------------------
        # CREATE INPUT DATAFRAME
        # ----------------------------------------------------

        input_data = {

            "N": data.N,

            "P": data.P,

            "K": data.K,

            "ph": data.ph,

            "temperature": data.temperature,

            "humidity": data.humidity,

            "rainfall": data.rainfall,

            "soil": soil_encoded
        }


        # ----------------------------------------------------
        # IMPORTANT:
        # USE EXACT TRAINING FEATURE ORDER
        # ----------------------------------------------------

        X = pd.DataFrame(
            [input_data],
            columns=features
        )


        print("\nINPUT:")
        print(X)


        # ----------------------------------------------------
        # PREDICTION
        # ----------------------------------------------------

        probabilities = model.predict_proba(X)[0]

        predicted_index = np.argmax(
            probabilities
        )

        predicted_crop = crop_encoder.inverse_transform(
            [predicted_index]
        )[0]

        confidence = float(
            probabilities[predicted_index]
        )


        # ----------------------------------------------------
        # TOP 3 CROPS
        # ----------------------------------------------------

        top_indices = np.argsort(
            probabilities
        )[::-1][:3]


        top_3 = []

        for index in top_indices:

            crop = crop_encoder.inverse_transform(
                [index]
            )[0]

            probability = float(
                probabilities[index]
            )

            top_3.append({
                "crop": str(crop),
                "confidence": round(
                    probability * 100,
                    2
                )
            })


        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        response = {

            "success": True,

            "crop": str(
                predicted_crop
            ),

            "confidence": round(
                confidence * 100,
                2
            ),

            "top_3": top_3,

            "input": {

                "N": data.N,

                "P": data.P,

                "K": data.K,

                "ph": data.ph,

                "temperature": data.temperature,

                "humidity": data.humidity,

                "rainfall": data.rainfall,

                "soil": actual_soil
            },

            "model": "Optuna + XGBoost"
        }


        print("\nPREDICTION:")
        print(response)


        return response


    except HTTPException:

        raise


    except Exception as e:

        print(
            "Prediction error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )