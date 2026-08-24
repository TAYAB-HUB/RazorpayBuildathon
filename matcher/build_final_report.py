"""
Final report: merges tier-1 (deterministic) + tier-2 (agent) decisions into one
reconciliation outcome per ledger record, then scores the WHOLE pipeline against the
hidden synthetic ground truth (answer_key.csv).

This ground-truth scoring is the honest version of "measured accuracy": because the
dataset is synthetic and we know the true case for every record, we can report real
precision on matches (did it only call something a match when it actually was?) rather
than just asserting a match rate. This file is never shown to the matcher -- only used
here, after the fact, to grade it.
"""

import csv
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config import LEDGER_PATH, ANSWER_KEY_PATH, TIER1_RESULTS_PATH, TIER2_RESULTS_PATH, FINAL_REPORT_PATH

# case types where the "correct" outcome is actually a match (vs. a genuine exception)
TRUE_MATCH_CASES = {"CLEAN_MATCH", "STALE_TIMING", "DUPLICATE_SETTLEMENT", "FUZZY_ID_MATCH", "SPLIT_SETTLEMENT"}
TRUE_EXCEPTION_CASES = {"UNSETTLED_PENDING", "AMOUNT_MISMATCH", "ORPHAN_SETTLEMENT"}


def load_csv(path):
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def build_final_ledger_status():
    tier1 = load_csv(TIER1_RESULTS_PATH)
    tier2 = json.load(open(TIER2_RESULTS_PATH))
    ledger = load_csv(LEDGER_PATH)

    status = {}

    for row in tier1:
        status[row["order_id"]] = {
            "final_decision": "match",
            "resolution_tier": "tier1_deterministic",
            "reason_code": "stale_timing" if row["flag"] == "stale_timing" else "clean_match",
            "settlement_ref": row["settlement_ref"],
            "confidence": 1.0,
            "explanation": f"Exact ID match, net amount within tolerance (diff Rs.{row['diff']}).",
        }

    for row in tier2["ledger_decisions"]:
        status[row["order_id"]] = {
            "final_decision": row["decision"],
            "resolution_tier": "tier2_agent",
            "reason_code": row["reason_code"],
            "settlement_ref": row.get("matched_settlement_ref"),
            "confidence": row.get("confidence"),
            "explanation": row.get("explanation"),
        }

    all_ids = {row["order_id"] for row in ledger}
    for oid in all_ids - status.keys():
        status[oid] = {
            "final_decision": "exception", "resolution_tier": "unclassified",
            "reason_code": "not_processed", "settlement_ref": None,
            "confidence": 0.0, "explanation": "Record was not reached by either tier -- pipeline bug.",
        }

    return status


def score_against_ground_truth(status):
    answer_key = {row["order_id"]: row["true_case"] for row in load_csv(ANSWER_KEY_PATH) if row["order_id"]}

    tp = fp = tn = fn = 0
    mismatched_reason = []

    for oid, result in status.items():
        true_case = answer_key.get(oid)
        if true_case is None:
            continue  # orphan-only records aren't keyed by ledger order_id
        true_is_match = true_case in TRUE_MATCH_CASES
        predicted_is_match = result["final_decision"] == "match"

        if true_is_match and predicted_is_match:
            tp += 1
        elif not true_is_match and not predicted_is_match:
            tn += 1
        elif not true_is_match and predicted_is_match:
            fp += 1
            mismatched_reason.append((oid, true_case, "false_positive_match"))
        else:
            fn += 1
            mismatched_reason.append((oid, true_case, "false_negative_exception"))

    total = tp + fp + tn + fn
    precision = tp / (tp + fp) if (tp + fp) else None
    recall = tp / (tp + fn) if (tp + fn) else None
    accuracy = (tp + tn) / total if total else None

    return {
        "true_positives_correct_match": tp,
        "true_negatives_correct_exception": tn,
        "false_positives_wrong_match": fp,
        "false_negatives_missed_match": fn,
        "precision_of_matches": round(precision, 3) if precision is not None else None,
        "recall_of_matches": round(recall, 3) if recall is not None else None,
        "overall_accuracy": round(accuracy, 3) if accuracy is not None else None,
        "misclassified_records": mismatched_reason,
    }


def run():
    """Callable entry point for the API/other scripts. Returns the report dict."""
    status = build_final_ledger_status()
    total = len(status)
    matches = sum(1 for r in status.values() if r["final_decision"] == "match")
    exceptions = [{"order_id": oid, **r} for oid, r in status.items() if r["final_decision"] == "exception"]
    resolved_records = [{"order_id": oid, **r} for oid, r in status.items() if r["final_decision"] == "match"]

    tier_breakdown = {}
    for r in status.values():
        tier_breakdown[r["resolution_tier"]] = tier_breakdown.get(r["resolution_tier"], 0) + 1

    scoring = score_against_ground_truth(status)

    report = {
        "total_ledger_records": total,
        "matched": matches,
        "match_rate": round(matches / total, 4),
        "resolution_breakdown_by_tier": tier_breakdown,
        "resolved_records": sorted(resolved_records, key=lambda x: x["order_id"]),
        "exception_count": len(exceptions),
        "exceptions": sorted(exceptions, key=lambda x: x["order_id"]),
        "ground_truth_scoring": scoring,
    }

    json.dump(report, open(FINAL_REPORT_PATH, "w"), indent=2)
    return report


def main():
    report = run()
    total = report["total_ledger_records"]
    matches = report["matched"]
    exceptions = report["exceptions"]
    tier_breakdown = report["resolution_breakdown_by_tier"]
    scoring = report["ground_truth_scoring"]

    print("=" * 60)
    print("FINAL RECONCILIATION REPORT")
    print("=" * 60)
    print(f"Total ledger records:     {total}")
    print(f"Matched:                  {matches}  ({report['match_rate']:.1%})")
    print(f"Exceptions:               {len(exceptions)}")
    print(f"Resolution breakdown:     {tier_breakdown}")
    print("-" * 60)
    print("MEASURED ACCURACY (vs. hidden synthetic ground truth):")
    print(f"  Precision of matches:   {scoring['precision_of_matches']}")
    print(f"  Recall of matches:      {scoring['recall_of_matches']}")
    print(f"  Overall accuracy:       {scoring['overall_accuracy']}")
    if scoring["misclassified_records"]:
        print(f"  Misclassified:          {scoring['misclassified_records']}")
    else:
        print("  Misclassified:          none")
    print("=" * 60)
    print(f"Full report written to {FINAL_REPORT_PATH}")


if __name__ == "__main__":
    main()
