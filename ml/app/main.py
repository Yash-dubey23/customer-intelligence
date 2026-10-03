import os, json
from pathlib import Path
import joblib, pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

ART = Path(__file__).resolve().parent.parent / "artifacts"
app = FastAPI(title="Churn ML Service")
bundle = metrics = None
LOW_MAX, MED_MAX = 0.30, 0.60   # risk bands on predicted churn probability

def format_dq(dq: dict, trained_at: str) -> dict:
    if not dq:
        return {}
    res = dict(dq)
    res["featureCount"] = dq.get("feature_count", dq.get("featureCount", 0))
    res["feature_count"] = res["featureCount"]
    res["numericalFeatures"] = dq.get("numerical_features", dq.get("numericalFeatures", []))
    res["numerical_features"] = res["numericalFeatures"]
    res["categoricalFeatures"] = dq.get("categorical_features", dq.get("categoricalFeatures", []))
    res["categorical_features"] = res["categoricalFeatures"]
    res["missingValues"] = dq.get("missing_values", dq.get("missingValues", {}))
    res["missing_values"] = res["missingValues"]
    res["duplicateRows"] = dq.get("duplicate_rows", dq.get("duplicateRows", 0))
    res["duplicate_rows"] = res["duplicateRows"]
    res["churnRate"] = dq.get("churn_rate", dq.get("churnRate", 0.0))
    res["churn_rate"] = res["churnRate"]
    res["lastTrained"] = trained_at
    res["last_trained"] = trained_at
    return res

def format_metrics(m: dict) -> dict:
    if not m:
        return {}
    res = dict(m)
    trained_at = m.get("trained_at", "")
    res["trainedAt"] = trained_at
    res["trained_at"] = trained_at
    best_model = m.get("best_model", "")
    res["bestModel"] = best_model
    res["best_model"] = best_model
    res["testSize"] = m.get("test_size", 0)
    res["test_size"] = res["testSize"]
    res["featureImportance"] = m.get("feature_importance", [])
    res["feature_importance"] = res["featureImportance"]
    res["categoricalOptions"] = m.get("categorical_options", {})
    res["categorical_options"] = res["categoricalOptions"]
    res["dataQuality"] = format_dq(m.get("data_quality", {}), trained_at)
    res["data_quality"] = res["dataQuality"]
    return res

def load():
    global bundle, metrics
    if (ART / "model.joblib").exists():
        bundle = joblib.load(ART / "model.joblib")
        raw_metrics = json.loads((ART / "metrics.json").read_text())
        metrics = format_metrics(raw_metrics)
load()

class PredictRequest(BaseModel):
    features: dict

def band(p: float) -> str:
    return "LOW" if p < LOW_MAX else "MEDIUM" if p < MED_MAX else "HIGH"

@app.get("/health")
def health():
    if bundle is None or metrics is None:
        raise HTTPException(503, "Model not loaded. Run train.py first.")
    t = metrics.get("trained_at", "")
    return {
        "status": "ok",
        "model": bundle["model_name"],
        "trained_at": t,
        "trainedAt": t
    }

@app.post("/predict")
def predict(req: PredictRequest):
    if bundle is None:
        raise HTTPException(503, "Model not loaded")
    missing = [f for f in bundle["features"] if f not in req.features]
    if missing:
        raise HTTPException(422, f"Missing features: {missing}")
    row = pd.DataFrame([{f: req.features[f] for f in bundle["features"]}])
    for c in bundle["numeric"]:
        row[c] = pd.to_numeric(row[c], errors="coerce")
    p = float(bundle["pipeline"].predict_proba(row)[0, 1])
    return {
        "churn_probability": round(p, 4),
        "churnProbability": round(p, 4),
        "risk_level": band(p),
        "riskLevel": band(p),
        "model": bundle["model_name"],
        "thresholds": {"low_max": LOW_MAX, "medium_max": MED_MAX}
    }

@app.get("/metrics")
def get_metrics():
    if metrics is None:
        raise HTTPException(503, "No metrics. Run train.py first.")
    return metrics

@app.get("/data-quality")
def data_quality():
    if metrics is None:
        raise HTTPException(503, "No metrics. Run train.py first.")
    return metrics["dataQuality"]

@app.post("/reload")
def reload_model():
    load()
    return {"loaded": bundle is not None}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
