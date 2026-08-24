"""Shared path configuration. All scripts import from here so paths work identically
whether run locally, in this sandbox, or on a deployed server (Render/Railway/etc)."""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
ANSWER_KEY_DIR = BASE_DIR / "answer_key"
MATCHER_DIR = BASE_DIR / "matcher"

DATA_DIR.mkdir(exist_ok=True)
ANSWER_KEY_DIR.mkdir(exist_ok=True)
MATCHER_DIR.mkdir(exist_ok=True)

LEDGER_PATH = DATA_DIR / "ledger.csv"
SETTLEMENTS_PATH = DATA_DIR / "settlements.csv"
ANSWER_KEY_PATH = ANSWER_KEY_DIR / "answer_key.csv"
TIER1_RESULTS_PATH = MATCHER_DIR / "tier1_results.csv"
TIER2_QUEUE_PATH = MATCHER_DIR / "tier2_queue.json"
TIER2_RESULTS_PATH = MATCHER_DIR / "tier2_results.json"
FINAL_REPORT_PATH = MATCHER_DIR / "final_report.json"
