"""
FastAPI backend for the AI Finance Controller reconciliation agent.

Endpoints:
  GET  /health                 - liveness check
  POST /reconcile               - runs the FULL pipeline (generate -> tier1 -> tier2 -> report)
                                   and returns the final report as JSON
  GET  /report                  - returns the most recently generated final_report.json
                                   without re-running anything (fast, for page refreshes)
  GET  /raw-data                - returns the current ledger + settlements as JSON
                                   (useful for a frontend table view)

Deploy this separately from the Netlify frontend (Netlify only hosts static sites) --
Render, Railway, or Fly.io free tiers all work well for a small FastAPI app like this.

Local run:
  pip install -r requirements.txt
  uvicorn backend.app:app --reload --port 8000

Set OPENAI_API_KEY in the environment to use live tier-2 reasoning; without it, the
pipeline automatically falls back to the offline mock resolver (see matcher/tier2_agent.py).
"""

import csv
import json
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config import LEDGER_PATH, SETTLEMENTS_PATH, FINAL_REPORT_PATH
from data import generate_data
from matcher import tier1_matcher, tier2_agent, build_final_report

app = FastAPI(title="AI Finance Controller", version="1.0.0")

# Allow the Netlify-hosted frontend to call this API. Tighten allow_origins to your
# actual Netlify domain before submitting -- "*" is fine for local dev only.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ReconcileRequest(BaseModel):
    regenerate_data: bool = True   # False = reuse the existing ledger/settlements files
    use_mock: bool | None = None   # None = auto (mock if no OPENAI_API_KEY set)


@app.get("/")
def root():
    return {
        "service": "AI Finance Controller",
        "docs": "/docs",
        "endpoints": ["/health", "/reconcile (POST)", "/report", "/raw-data"],
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/reconcile")
def reconcile(req: ReconcileRequest):
    """Runs the full pipeline end to end and returns the final report."""
    try:
        gen_summary = generate_data.generate() if req.regenerate_data else None
        tier1_summary = tier1_matcher.run()
        tier2_summary = tier2_agent.run(use_mock=req.use_mock)
        report = build_final_report.run()
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=f"Missing input data -- run with regenerate_data=true first. ({e})")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {e}")

    return {
        "generation": gen_summary,
        "tier1": tier1_summary,
        "tier2": tier2_summary,
        "report": report,
    }


@app.get("/report")
def get_report():
    """Returns the last computed report without re-running the pipeline."""
    if not FINAL_REPORT_PATH.exists():
        raise HTTPException(status_code=404, detail="No report yet -- POST /reconcile first.")
    return json.load(open(FINAL_REPORT_PATH))


@app.get("/raw-data")
def raw_data():
    """Returns the current ledger + settlements batch, for a frontend table view."""
    if not LEDGER_PATH.exists() or not SETTLEMENTS_PATH.exists():
        raise HTTPException(status_code=404, detail="No data yet -- POST /reconcile first.")
    with open(LEDGER_PATH, newline="") as f:
        ledger = list(csv.DictReader(f))
    with open(SETTLEMENTS_PATH, newline="") as f:
        settlements = list(csv.DictReader(f))
    return {"ledger": ledger, "settlements": settlements}
