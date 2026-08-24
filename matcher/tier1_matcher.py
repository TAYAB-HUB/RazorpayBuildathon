"""
Tier-1 deterministic reconciliation matcher.

Philosophy: no LLM call happens here. This tier exists because most reconciliation
is arithmetic, not reasoning -- an LLM is the wrong (slow, expensive, non-deterministic)
tool for "does this ID match and is this amount within tolerance". This tier should
resolve the large majority of records; only genuinely ambiguous ones fall through to
the tier-2 agent.

Matching logic:
  1. Group settlement rows by payment_id, deduplicating exact repeats (same payment_id +
     same amount + same UTR) -> resolves DUPLICATE_SETTLEMENT deterministically.
  2. For each ledger row, look for a settlement with an exact payment_id match.
     If found, recompute expected net (gross - 2% fee - 18% GST on fee) and compare
     to the actual settled amount within a small rupee tolerance.
       - within tolerance -> CLEAN_MATCH (also catches STALE_TIMING, since amount lines up
         even though timing is unusual -- timing anomalies are flagged as a soft warning,
         not sent to tier 2, because they don't need reasoning, just a flag)
       - outside tolerance -> too ambiguous to auto-resolve -> hand to tier 2
  3. Ledger rows with no exact payment_id match at all -> hand to tier 2 (could be a typo,
     a split, or genuinely unsettled -- needs reasoning to tell apart).
  4. Settlement rows that match no ledger row at all -> hand to tier 2 as possible orphans.

Output: match_results.csv (resolved) + tier2_queue.json (everything tier 1 couldn't close).
"""

import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config import LEDGER_PATH, SETTLEMENTS_PATH, TIER1_RESULTS_PATH, TIER2_QUEUE_PATH

FEE_RATE = 0.02
TAX_RATE = 0.18
TOLERANCE_RUPEES = 1.0
STALE_DAYS_THRESHOLD = 15


def expected_net(gross: float) -> float:
    fee = round(gross * FEE_RATE, 2)
    tax = round(fee * TAX_RATE, 2)
    return round(gross - fee - tax, 2)


def load_csv(path):
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def dedupe_settlements(settlements):
    """Collapse exact duplicate rows (same payment_id, amount, utr) into one, logging the dupes."""
    seen = {}
    deduped = []
    dup_log = []
    for row in settlements:
        key = (row["payment_id"], row["settled_amount"], row["utr"])
        if key in seen:
            dup_log.append(row["payment_id"])
            continue
        seen[key] = True
        deduped.append(row)
    return deduped, dup_log


def run_tier1(ledger_path, settlements_path):
    ledger = load_csv(ledger_path)
    settlements_raw = load_csv(settlements_path)
    settlements, dup_log = dedupe_settlements(settlements_raw)

    settlements_by_id = defaultdict(list)
    for s in settlements:
        settlements_by_id[s["payment_id"]].append(s)

    results = []
    matched_settlement_ids = set()
    tier2_queue = {"unresolved_ledger": [], "unresolved_settlements": []}

    for l in ledger:
        oid = l["order_id"]
        candidates = settlements_by_id.get(oid, [])

        if len(candidates) == 1:
            s = candidates[0]
            gross = float(l["expected_gross_amount"])
            target = expected_net(gross)
            actual = float(s["settled_amount"])
            diff = round(abs(target - actual), 2)

            if diff <= TOLERANCE_RUPEES:
                from datetime import date
                inv_date = date.fromisoformat(l["invoice_date"])
                settle_date = date.fromisoformat(s["settled_at"])
                gap_days = (settle_date - inv_date).days
                flag = "stale_timing" if gap_days > STALE_DAYS_THRESHOLD else None
                results.append({
                    "order_id": oid, "settlement_ref": s["payment_id"],
                    "resolution": "tier1_clean_match", "expected_net": target,
                    "actual_net": actual, "diff": diff, "flag": flag,
                })
                matched_settlement_ids.add(id(s))
            else:
                # amount doesn't line up -- needs reasoning about why (TDS? chargeback? error?)
                tier2_queue["unresolved_ledger"].append({
                    "order_id": oid, "expected_gross_amount": gross,
                    "expected_net": target, "reason": "amount_mismatch_exact_id",
                    "candidate_settlement": s,
                })
                matched_settlement_ids.add(id(s))

        elif len(candidates) > 1:
            # exact id has multiple non-identical settlement rows -- could be a genuine
            # split payment; needs reasoning to confirm they sum correctly and aren't
            # something else (e.g. accidental re-issue).
            tier2_queue["unresolved_ledger"].append({
                "order_id": oid, "expected_gross_amount": float(l["expected_gross_amount"]),
                "reason": "multiple_settlement_candidates",
                "candidate_settlements": candidates,
            })
            for s in candidates:
                matched_settlement_ids.add(id(s))

        else:
            # no exact payment_id match at all -- could be a typo, unsettled, or a split
            # under a different key. Needs fuzzy reasoning, not a hardcoded rule.
            tier2_queue["unresolved_ledger"].append({
                "order_id": oid, "expected_gross_amount": float(l["expected_gross_amount"]),
                "invoice_date": l["invoice_date"], "reason": "no_exact_id_match",
            })

    # any settlement row never claimed by a ledger row is a possible orphan
    for s in settlements:
        if id(s) not in matched_settlement_ids:
            tier2_queue["unresolved_settlements"].append(s)

    return results, tier2_queue, dup_log, len(ledger)


def write_report(results, tier2_queue, dup_log, total_ledger):
    total_ledger_records = total_ledger
    tier1_resolved = len(results)
    tier2_count = len(tier2_queue["unresolved_ledger"]) + len(tier2_queue["unresolved_settlements"])
    stale = sum(1 for r in results if r["flag"] == "stale_timing")

    summary = {
        "total_ledger_records": total_ledger_records,
        "duplicate_settlements_caught": len(dup_log),
        "tier1_clean_matches": tier1_resolved,
        "tier1_match_rate": round(tier1_resolved / total_ledger_records, 4),
        "stale_timing_flagged": stale,
        "sent_to_tier2_ledger": len(tier2_queue["unresolved_ledger"]),
        "sent_to_tier2_orphan_settlements": len(tier2_queue["unresolved_settlements"]),
    }

    print("=" * 60)
    print("TIER-1 DETERMINISTIC MATCH REPORT")
    print("=" * 60)
    print(f"Ledger records processed:        {summary['total_ledger_records']}")
    print(f"Duplicate settlement rows caught: {summary['duplicate_settlements_caught']}")
    print(f"Tier-1 clean matches:             {summary['tier1_clean_matches']}  "
          f"({summary['tier1_match_rate']:.1%} of ledger)")
    print(f"  (of which flagged stale-timing): {summary['stale_timing_flagged']}")
    print(f"Sent to tier-2 (ledger side):      {summary['sent_to_tier2_ledger']}")
    print(f"Sent to tier-2 (orphan settlements): {summary['sent_to_tier2_orphan_settlements']}")
    print("=" * 60)

    with open(TIER1_RESULTS_PATH, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["order_id", "settlement_ref", "resolution", "expected_net", "actual_net", "diff", "flag"])
        writer.writeheader()
        writer.writerows(results)

    with open(TIER2_QUEUE_PATH, "w") as f:
        json.dump(tier2_queue, f, indent=2, default=str)

    return summary


def run():
    """Callable entry point for the API/other scripts."""
    results, tier2_queue, dup_log, total_ledger = run_tier1(LEDGER_PATH, SETTLEMENTS_PATH)
    return write_report(results, tier2_queue, dup_log, total_ledger)


if __name__ == "__main__":
    run()
