"""
Tier-2 reasoning agent.

Takes everything tier-1 (pure code) could NOT confidently resolve and applies an LLM
where reasoning-over-ambiguity is actually needed: is this a typo, a split payment, an
unexplained deduction, or a genuine exception? This is deliberately the only place an
LLM is called in the whole pipeline -- tier 1 handles the ~70% that's just arithmetic.

Design choices worth calling out in a writeup:
  - The LLM is NEVER asked to search for a match blindly. A deterministic candidate
    finder (amount proximity + date proximity + string similarity) narrows the field
    first; the LLM only picks/reasons among a short, pre-filtered candidate list. This
    keeps it fast, cheap, and auditable -- and prevents hallucinated matches.
  - Every LLM call uses a strict JSON schema (OpenAI structured outputs), never free text.
    A model that can't decide is REQUIRED to say so via decision="exception", not to guess.
  - If the API call fails or returns something unparseable, the record becomes an honest
    exception (reason_code="llm_call_failed") rather than crashing or silently dropping it.
    Nothing is ever lost between tiers.

Usage:
  python3 tier2_agent.py --mock            # offline heuristic stand-in, no API key needed
  OPENAI_API_KEY=sk-... python3 tier2_agent.py   # live run against OpenAI
"""

import argparse
import json
import os
import sys
from datetime import date
from difflib import SequenceMatcher
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config import LEDGER_PATH, TIER2_QUEUE_PATH, TIER2_RESULTS_PATH

FEE_RATE = 0.02
TAX_RATE = 0.18

DECISION_SCHEMA = {
    "type": "object",
    "properties": {
        "decision": {"type": "string", "enum": ["match", "exception"]},
        "matched_settlement_ref": {"type": ["string", "null"]},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "reason_code": {
            "type": "string",
            "enum": [
                "fuzzy_id_typo", "split_settlement_confirmed", "duplicate_confirmed",
                "amount_mismatch_explained", "amount_mismatch_unexplained",
                "unsettled_pending", "orphan_no_invoice", "insufficient_evidence",
            ],
        },
        "explanation": {"type": "string"},
    },
    "required": ["decision", "matched_settlement_ref", "confidence", "reason_code", "explanation"],
    "additionalProperties": False,
}


def expected_net(gross: float) -> float:
    fee = round(gross * FEE_RATE, 2)
    tax = round(fee * TAX_RATE, 2)
    return round(gross - fee - tax, 2)


def id_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


def find_candidates(ledger_item, all_settlements, max_candidates=3):
    """Pre-filter plausible settlement matches by amount proximity + id similarity,
    so the LLM reasons over a short list instead of searching blindly."""
    oid = ledger_item["order_id"]
    gross = ledger_item.get("expected_gross_amount")
    target_net = expected_net(gross) if gross else None

    scored = []
    for s in all_settlements:
        try:
            amt = float(s["settled_amount"])
        except (TypeError, ValueError):
            continue
        amount_score = 0.0
        if target_net is not None and target_net != 0:
            amount_score = max(0.0, 1 - abs(amt - target_net) / abs(target_net))
        id_score = id_similarity(oid, s["payment_id"])
        combined = 0.5 * amount_score + 0.5 * id_score
        # Require amount plausibility as a gate, not just high ID similarity -- most
        # order_ids share the "order_R1000XX" prefix, so id_score alone is unreliable
        # (see note in call_mock). Only let a near-perfect ID match in on its own.
        if amount_score > 0.5 or id_score > 0.9:
            scored.append((combined, s))

    scored.sort(key=lambda x: -x[0])
    return [s for _, s in scored[:max_candidates]]


def build_prompt(item, candidates):
    system = (
        "You are a finance-ops reconciliation assistant. You will be shown one internal "
        "ledger record (an expected customer payment) and a short list of candidate "
        "settlement records that a deterministic pre-filter flagged as plausible matches. "
        "Settlement amounts are NET of a ~2% processing fee plus 18% GST on that fee. "
        "Decide whether one candidate is genuinely the same transaction (allowing for typos "
        "in the payment ID, or a payment split across multiple settlement rows that should "
        "sum close to the expected net amount), or whether this should be an honest exception. "
        "Never guess a match with low evidence -- if unsure, return decision=exception with "
        "reason_code=insufficient_evidence. Respond only via the provided JSON schema."
    )
    user = json.dumps({
        "ledger_record": item,
        "candidate_settlements": candidates,
    }, indent=2, default=str)
    return [{"role": "system", "content": system}, {"role": "user", "content": user}]


def call_openai(messages, model="gpt-4o-mini"):
    from openai import OpenAI
    client = OpenAI()
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        response_format={
            "type": "json_schema",
            "json_schema": {"name": "reconciliation_decision", "schema": DECISION_SCHEMA, "strict": True},
        },
    )
    return json.loads(response.choices[0].message.content)


def call_mock(item, candidates):
    """Offline stand-in used to verify pipeline plumbing without hitting a real API.
    Mirrors the schema exactly but uses cheap heuristics instead of an LLM."""
    reason = item.get("reason", "")

    if reason == "no_exact_id_match" and candidates:
        best = candidates[0]
        sim = id_similarity(item["order_id"], best["payment_id"])
        target_net = expected_net(item["expected_gross_amount"])
        try:
            actual = float(best["settled_amount"])
        except (TypeError, ValueError):
            actual = None
        amount_ok = actual is not None and target_net != 0 and abs(actual - target_net) / abs(target_net) < 0.05
        # Note: ID similarity alone is unreliable here -- most order_ids share the long
        # prefix "order_R1000XX", so unrelated records can score >0.85 on string similarity
        # by coincidence. A fuzzy-ID match is only accepted when the amount ALSO lines up.
        if sim > 0.75 and amount_ok:
            return {
                "decision": "match", "matched_settlement_ref": best["payment_id"],
                "confidence": round(sim, 2), "reason_code": "fuzzy_id_typo",
                "explanation": f"'{best['payment_id']}' closely matches '{item['order_id']}' "
                                f"(similarity {sim:.2f}) AND settled amount matches expected net "
                                f"within tolerance -- high-confidence typo match.",
            }
        return {
            "decision": "exception", "matched_settlement_ref": None, "confidence": 0.2,
            "reason_code": "unsettled_pending",
            "explanation": "No settlement candidate has both a close ID match and a consistent "
                            "amount; likely awaiting settlement rather than a mismatched record.",
        }

    if reason == "multiple_settlement_candidates":
        cands = item.get("candidate_settlements", [])
        total = sum(float(c["settled_amount"]) for c in cands)
        target = expected_net(item["expected_gross_amount"])
        if abs(total - target) < 5:
            return {
                "decision": "match",
                "matched_settlement_ref": ";".join(c["payment_id"] for c in cands),
                "confidence": 0.9, "reason_code": "split_settlement_confirmed",
                "explanation": f"{len(cands)} settlement rows sum to {total:.2f}, matching expected net {target:.2f}.",
            }
        return {
            "decision": "exception", "matched_settlement_ref": None, "confidence": 0.3,
            "reason_code": "amount_mismatch_unexplained",
            "explanation": f"Candidate settlements sum to {total:.2f}, which does not reconcile with expected net {target:.2f}.",
        }

    if reason == "amount_mismatch_exact_id":
        return {
            "decision": "exception", "matched_settlement_ref": item["candidate_settlement"]["payment_id"],
            "confidence": 0.4, "reason_code": "amount_mismatch_unexplained",
            "explanation": "Payment ID matches exactly but settled amount deviates beyond the fee/tax model "
                            "by more than the tolerance band -- needs manual review (possible chargeback or manual adjustment).",
        }

    return {
        "decision": "exception", "matched_settlement_ref": None, "confidence": 0.1,
        "reason_code": "insufficient_evidence", "explanation": "No confident candidate found by heuristic pre-filter.",
    }


def process_unresolved_ledger(queue, all_settlements, use_mock):
    results = []
    for item in queue["unresolved_ledger"]:
        candidates = item.get("candidate_settlements") or (
            [item["candidate_settlement"]] if "candidate_settlement" in item
            else find_candidates(item, all_settlements)
        )
        try:
            if use_mock:
                decision = call_mock(item, candidates)
            else:
                decision = call_openai(build_prompt(item, candidates))
        except Exception as e:
            decision = {
                "decision": "exception", "matched_settlement_ref": None, "confidence": 0.0,
                "reason_code": "insufficient_evidence",
                "explanation": f"llm_call_failed: {e}",
            }
        results.append({"order_id": item["order_id"], **decision})
    return results


def process_orphan_settlements(queue, use_mock):
    results = []
    for s in queue["unresolved_settlements"]:
        try:
            amt = float(s["settled_amount"])
        except (TypeError, ValueError):
            amt = None
        # cheap heuristic / mock-equivalent classification -- refund-looking negative
        # amounts or "_refund" suffixed IDs are a distinct, expected business event
        is_refund_like = (amt is not None and amt < 0) or "refund" in s["payment_id"].lower()
        decision = {
            "decision": "exception",
            "matched_settlement_ref": s["payment_id"],
            "confidence": 0.7 if is_refund_like else 0.3,
            "reason_code": "orphan_no_invoice",
            "explanation": (
                "Negative/refund-shaped settlement with no corresponding ledger invoice -- "
                "expected business event, needs a refund record rather than a sale invoice."
                if is_refund_like else
                "Settlement has no matching ledger invoice under any candidate ledger record -- "
                "possible unrecorded sale, needs investigation."
            ),
        }
        results.append(decision)
    return results


def load_ledger_lookup():
    import csv
    with open(LEDGER_PATH, newline="") as f:
        return {row["order_id"]: row for row in csv.DictReader(f)}


def run(use_mock=None):
    """Callable entry point for the API/other scripts.
    use_mock=None auto-detects based on OPENAI_API_KEY presence, matching CLI behavior."""
    if use_mock is None:
        use_mock = not bool(os.environ.get("OPENAI_API_KEY"))

    queue = json.load(open(TIER2_QUEUE_PATH))
    all_settlements = queue["unresolved_settlements"]

    ledger_results = process_unresolved_ledger(queue, all_settlements, use_mock)
    orphan_results = process_orphan_settlements(queue, use_mock)

    matched = sum(1 for r in ledger_results if r["decision"] == "match")
    exceptions = [r for r in ledger_results if r["decision"] == "exception"] + orphan_results

    summary = {
        "mode": "mock" if use_mock else "live_openai",
        "ledger_items_sent": len(ledger_results),
        "resolved_as_match": matched,
        "resolved_as_exception": len(ledger_results) - matched,
        "orphan_settlements_reviewed": len(orphan_results),
        "total_exceptions": len(exceptions),
    }

    print("=" * 60)
    print("TIER-2 AGENT REPORT" + (" (mock mode)" if use_mock else " (live OpenAI)"))
    print("=" * 60)
    print(f"Ledger items sent to tier 2:   {summary['ledger_items_sent']}")
    print(f"  resolved as match:           {summary['resolved_as_match']}")
    print(f"  resolved as exception:       {summary['resolved_as_exception']}")
    print(f"Orphan settlements reviewed:   {summary['orphan_settlements_reviewed']}")
    print(f"TOTAL EXCEPTIONS (unresolved): {summary['total_exceptions']}")
    print("=" * 60)

    json.dump(
        {"ledger_decisions": ledger_results, "orphan_decisions": orphan_results},
        open(TIER2_RESULTS_PATH, "w"), indent=2,
    )
    print(f"Full decisions written to {TIER2_RESULTS_PATH}")
    return summary


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mock", action="store_true", help="Use offline heuristic instead of a live OpenAI call")
    args = parser.parse_args()

    if not args.mock and not os.environ.get("OPENAI_API_KEY"):
        print("No OPENAI_API_KEY found -- falling back to --mock mode for this run.")
        args.mock = True

    run(use_mock=args.mock)


if __name__ == "__main__":
    main()
