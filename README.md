# Customer Intelligence

Done so far: ML pipeline, FastAPI service, MySQL schema.
Next: Spring Boot, React, 3D landing.

## Run
1. Put the Telco Customer Churn CSV at `ml/data/Telco-Customer-Churn.csv`
2. `cd ml && python -m venv .venv && source .venv/bin/activate`
3. `pip install -r requirements.txt && python train.py`
4. `uvicorn app.main:app --port 8000 --reload`
5. Check: `curl localhost:8000/health` and `curl localhost:8000/metrics`
6. MySQL: `mysql -u root -p < db/schema.sql`

Endpoints: GET /health, POST /predict {"features": {...}}, GET /metrics, GET /data-quality, POST /reload
