"""Train churn models on the Telco Customer Churn CSV and save artifacts.
Usage: python train.py [path/to/csv]
Outputs: artifacts/model.joblib, artifacts/metrics.json
"""
import json, sys, datetime as dt
from pathlib import Path
import joblib, numpy as np, pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, roc_auc_score, confusion_matrix, roc_curve)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
try:
    from xgboost import XGBClassifier
except ImportError:
    XGBClassifier = None

DATA = Path(sys.argv[1] if len(sys.argv) > 1 else "data/Telco-Customer-Churn.csv")
OUT = Path("artifacts"); OUT.mkdir(exist_ok=True)
if not DATA.exists():
    sys.exit(f"Dataset not found: {DATA}. Download the Telco Customer Churn CSV into ml/data/.")

df = pd.read_csv(DATA)
df["TotalCharges"] = pd.to_numeric(df["TotalCharges"].astype(str).str.strip(), errors="coerce")

# ---- data quality (computed from the real file) ----
missing = {c: int(n) for c, n in df.isna().sum().items() if n > 0}
dup = int(df.duplicated().sum())
y = (df["Churn"].str.strip() == "Yes").astype(int)
X = df.drop(columns=["Churn", "customerID"])
num_cols = X.select_dtypes(include="number").columns.tolist()
cat_cols = [c for c in X.columns if c not in num_cols]
quality = {
    "rows": int(len(df)), "columns": int(df.shape[1]),
    "feature_count": int(X.shape[1]),
    "numerical_features": num_cols, "categorical_features": cat_cols,
    "missing_values": missing, "duplicate_rows": dup,
    "churn_rate": round(float(y.mean()), 4),
    "status": "Healthy" if not missing and dup == 0 else "Needs Attention",
}

pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
])
candidates = {
    "Logistic Regression": LogisticRegression(max_iter=1000, class_weight="balanced"),
    "Random Forest": RandomForestClassifier(n_estimators=300, class_weight="balanced",
                                            min_samples_leaf=3, random_state=42, n_jobs=-1),
}
if XGBClassifier:
    spw = float((y == 0).sum() / (y == 1).sum())
    candidates["XGBoost"] = XGBClassifier(n_estimators=300, max_depth=4, learning_rate=0.05,
                                          subsample=0.9, scale_pos_weight=spw,
                                          eval_metric="logloss", random_state=42)

Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
results, fitted = {}, {}
for name, clf in candidates.items():
    pipe = Pipeline([("pre", pre), ("clf", clf)]).fit(Xtr, ytr)
    p = pipe.predict_proba(Xte)[:, 1]; pred = (p >= 0.5).astype(int)
    fpr, tpr, _ = roc_curve(yte, p)
    idx = np.linspace(0, len(fpr) - 1, min(100, len(fpr))).astype(int)
    results[name] = {
        "accuracy": accuracy_score(yte, pred), "precision": precision_score(yte, pred),
        "recall": recall_score(yte, pred), "f1": f1_score(yte, pred),
        "roc_auc": roc_auc_score(yte, p),
        "confusion_matrix": confusion_matrix(yte, pred).tolist(),  # [[TN, FP],[FN, TP]]
        "roc_curve": {"fpr": fpr[idx].round(4).tolist(), "tpr": tpr[idx].round(4).tolist()},
    }
    fitted[name] = pipe
    print(f"{name:20s} AUC={results[name]['roc_auc']:.4f} F1={results[name]['f1']:.4f}")

best = max(results, key=lambda k: results[k]["roc_auc"])
pipe = fitted[best]
names = pipe.named_steps["pre"].get_feature_names_out()
clf = pipe.named_steps["clf"]
imp = clf.feature_importances_ if hasattr(clf, "feature_importances_") else np.abs(clf.coef_[0])
top = sorted(zip(names, imp), key=lambda t: -t[1])[:15]

options = {c: sorted(X[c].dropna().unique().tolist()) for c in cat_cols}
joblib.dump({"pipeline": pipe, "model_name": best, "features": X.columns.tolist(),
             "numeric": num_cols, "categorical": cat_cols}, OUT / "model.joblib")
json.dump({
    "trained_at": dt.datetime.now(dt.timezone.utc).isoformat(),
    "best_model": best, "test_size": int(len(yte)), "models": results,
    "feature_importance": [{"feature": f, "importance": float(v)} for f, v in top],
    "data_quality": quality, "categorical_options": options,
}, open(OUT / "metrics.json", "w"), indent=2, default=float)
print("Best model:", best, "-> artifacts/")
