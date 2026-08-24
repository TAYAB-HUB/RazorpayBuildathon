"""
Synthetic data generator for the AI Finance Controller reconciliation agent.

Produces three files:
  ledger.csv        - internal book of expected customer payments (the "truth" you'd invoice against)
  settlements.csv   - Razorpay-style settlement report (what actually got paid out, net of fees/tax)
  answer_key.csv    - hidden ground-truth labels, used ONLY to score the matcher's honesty afterwards.
                       The matcher never sees this file.

Design goal: bake in the real-world messiness that makes reconciliation hard, in known
proportions, so match rate / exception handling can be scored objectively instead of
cherry-picked.

Case taxonomy (target ~60 records total):
  CLEAN_MATCH          - order_id matches exactly, net amount matches within paise tolerance
  FUZZY_ID_MATCH        - payment_id has a single-character typo/transposition vs ledger order_id
  SPLIT_SETTLEMENT      - one ledger invoice paid out across two settlement rows
  DUPLICATE_SETTLEMENT  - the same settlement appears twice (webhook retry / duplicate export)
  UNSETTLED_PENDING     - ledger invoice exists, no settlement has landed yet
  ORPHAN_SETTLEMENT     - settlement exists with no corresponding ledger invoice (e.g. refund, or unrecorded sale)
  AMOUNT_MISMATCH       - net amount is off by more than the fee/tax model explains (e.g. wrong tax slab, manual adjustment)
  STALE_TIMING          - settled_at is far later than expected, but otherwise a clean match
"""

import csv
import random
import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config import LEDGER_PATH, SETTLEMENTS_PATH, ANSWER_KEY_PATH

random.seed(42)  # reproducible batch

FEE_RATE = 0.02       # Razorpay-style ~2% transaction fee
TAX_RATE = 0.18       # GST on the fee (standard in India)
TOLERANCE_PAISE = 1.0  # acceptable rounding drift in rupees

NAMES = [
    "Aarav Sharma", "Priya Nair", "Rohit Verma", "Sneha Iyer", "Karan Mehta",
    "Ananya Rao", "Vikram Singh", "Isha Kapoor", "Arjun Reddy", "Neha Gupta",
    "Siddharth Joshi", "Divya Menon", "Manish Agarwal", "Pooja Chawla", "Rahul Desai",
]

BASE_DATE = datetime(2026, 8, 1)


def make_order_id(i: int) -> str:
    return f"order_R{100000 + i}"


def make_utr(i: int) -> str:
    return f"UTR{900000000 + i}"


def net_amount(gross: float) -> float:
    fee = round(gross * FEE_RATE, 2)
    tax_on_fee = round(fee * TAX_RATE, 2)
    return round(gross - fee - tax_on_fee, 2), fee, tax_on_fee


def typo(order_id: str, existing_ids: set) -> str:
    """Introduce a single-character transposition, simulating a manual entry error.

    Two collision hazards discovered while stress-testing this generator, both fixed here:
      1. Swapping two identical adjacent digits (e.g. "44") is a no-op -- would silently
         turn a fuzzy-match case into an accidental clean match.
      2. Because order IDs are small sequential numbers (order_R100001, R100002, ...), a
         digit transposition can land EXACTLY on another real order_id already in the batch
         (e.g. a typo of "R100041" produced "R100014", which collided with a genuinely
         different clean-match record). That silently merges two distinct ground-truth
         records into one ambiguous ID. We reject any typo that collides with a real ID.
    """
    for _ in range(10):
        candidates = [
            idx for idx in range(len(order_id) - 6, len(order_id) - 1)
            if order_id[idx] != order_id[idx + 1]
        ]
        idx = random.choice(candidates) if candidates else len(order_id) - 6
        chars = list(order_id)
        chars[idx], chars[idx + 1] = chars[idx + 1], chars[idx]
        result = "".join(chars)
        if result != order_id and result not in existing_ids:
            return result
    raise RuntimeError(f"Could not produce a non-colliding typo for {order_id} after 10 attempts")


def build_dataset():
    ledger_rows = []
    settlement_rows = []
    answer_key = []
    # Reserve the whole ID number-space up front (generous upper bound) so a typo can
    # never collide with any real order_id, regardless of generation order.
    assigned_ids = {make_order_id(k) for k in range(1, 100)}

    i = 0

    def add_clean(n):
        nonlocal i
        for _ in range(n):
            i += 1
            oid = make_order_id(i)
            assigned_ids.add(oid)
            gross = round(random.uniform(500, 25000), 2)
            invoice_date = BASE_DATE + timedelta(days=random.randint(0, 20))
            net, fee, tax = net_amount(gross)
            settled_at = invoice_date + timedelta(days=random.randint(1, 3))
            ledger_rows.append([oid, random.choice(NAMES), gross, invoice_date.date().isoformat(), "INR"])
            settlement_rows.append([oid, make_utr(i), net, fee, tax, settled_at.date().isoformat(), "settled"])
            answer_key.append([oid, "CLEAN_MATCH", oid])

    def add_fuzzy_id(n):
        nonlocal i
        for _ in range(n):
            i += 1
            oid = make_order_id(i)
            assigned_ids.add(oid)
            gross = round(random.uniform(500, 25000), 2)
            invoice_date = BASE_DATE + timedelta(days=random.randint(0, 20))
            net, fee, tax = net_amount(gross)
            settled_at = invoice_date + timedelta(days=random.randint(1, 3))
            bad_id = typo(oid, assigned_ids)
            ledger_rows.append([oid, random.choice(NAMES), gross, invoice_date.date().isoformat(), "INR"])
            settlement_rows.append([bad_id, make_utr(i), net, fee, tax, settled_at.date().isoformat(), "settled"])
            answer_key.append([oid, "FUZZY_ID_MATCH", bad_id])

    def add_split(n):
        nonlocal i
        for _ in range(n):
            i += 1
            oid = make_order_id(i)
            assigned_ids.add(oid)
            gross = round(random.uniform(2000, 30000), 2)
            invoice_date = BASE_DATE + timedelta(days=random.randint(0, 20))
            split_ratio = random.uniform(0.3, 0.6)
            gross_a, gross_b = round(gross * split_ratio, 2), round(gross * (1 - split_ratio), 2)
            net_a, fee_a, tax_a = net_amount(gross_a)
            net_b, fee_b, tax_b = net_amount(gross_b)
            settled_at = invoice_date + timedelta(days=random.randint(1, 4))
            ledger_rows.append([oid, random.choice(NAMES), gross, invoice_date.date().isoformat(), "INR"])
            # Both legs keep the SAME payment_id as the ledger order_id (this is what a real
            # split settlement looks like -- one order, multiple payout rows) -- that's the
            # exact-match key tier1_matcher's "multiple candidates" branch is built to catch.
            settlement_rows.append([oid, make_utr(i), net_a, fee_a, tax_a, settled_at.date().isoformat(), "settled"])
            i += 1
            settlement_rows.append([oid, make_utr(i), net_b, fee_b, tax_b, settled_at.date().isoformat(), "settled"])
            answer_key.append([oid, "SPLIT_SETTLEMENT", oid])

    def add_duplicate(n):
        nonlocal i
        for _ in range(n):
            i += 1
            oid = make_order_id(i)
            gross = round(random.uniform(500, 15000), 2)
            invoice_date = BASE_DATE + timedelta(days=random.randint(0, 20))
            net, fee, tax = net_amount(gross)
            settled_at = invoice_date + timedelta(days=random.randint(1, 3))
            ledger_rows.append([oid, random.choice(NAMES), gross, invoice_date.date().isoformat(), "INR"])
            settlement_rows.append([oid, make_utr(i), net, fee, tax, settled_at.date().isoformat(), "settled"])
            settlement_rows.append([oid, make_utr(i), net, fee, tax, settled_at.date().isoformat(), "settled"])  # duplicate row, same UTR
            answer_key.append([oid, "DUPLICATE_SETTLEMENT", oid])

    def add_unsettled(n):
        nonlocal i
        for _ in range(n):
            i += 1
            oid = make_order_id(i)
            gross = round(random.uniform(500, 15000), 2)
            invoice_date = BASE_DATE + timedelta(days=random.randint(15, 22))
            ledger_rows.append([oid, random.choice(NAMES), gross, invoice_date.date().isoformat(), "INR"])
            answer_key.append([oid, "UNSETTLED_PENDING", None])

    def add_orphan(n):
        nonlocal i
        for _ in range(n):
            i += 1
            oid = make_order_id(i) + "_refund"
            gross = round(random.uniform(500, 10000), 2)
            invoice_date = BASE_DATE + timedelta(days=random.randint(0, 20))
            net, fee, tax = net_amount(gross)
            settled_at = invoice_date + timedelta(days=random.randint(1, 3))
            settlement_rows.append([oid, make_utr(i), -net, fee, tax, settled_at.date().isoformat(), "settled"])
            answer_key.append([None, "ORPHAN_SETTLEMENT", oid])

    def add_amount_mismatch(n):
        nonlocal i
        for _ in range(n):
            i += 1
            oid = make_order_id(i)
            gross = round(random.uniform(500, 20000), 2)
            invoice_date = BASE_DATE + timedelta(days=random.randint(0, 20))
            net, fee, tax = net_amount(gross)
            # apply an extra unexplained deduction, e.g. manual chargeback adjustment
            net = round(net - random.uniform(50, 500), 2)
            settled_at = invoice_date + timedelta(days=random.randint(1, 3))
            ledger_rows.append([oid, random.choice(NAMES), gross, invoice_date.date().isoformat(), "INR"])
            settlement_rows.append([oid, make_utr(i), net, fee, tax, settled_at.date().isoformat(), "settled"])
            answer_key.append([oid, "AMOUNT_MISMATCH", oid])

    def add_stale_timing(n):
        nonlocal i
        for _ in range(n):
            i += 1
            oid = make_order_id(i)
            gross = round(random.uniform(500, 20000), 2)
            invoice_date = BASE_DATE + timedelta(days=random.randint(0, 10))
            net, fee, tax = net_amount(gross)
            settled_at = invoice_date + timedelta(days=random.randint(20, 30))  # unusually delayed
            ledger_rows.append([oid, random.choice(NAMES), gross, invoice_date.date().isoformat(), "INR"])
            settlement_rows.append([oid, make_utr(i), net, fee, tax, settled_at.date().isoformat(), "settled"])
            answer_key.append([oid, "STALE_TIMING", oid])

    # Target distribution: 60 records total, ~18% messy
    add_clean(40)
    add_fuzzy_id(6)
    add_split(4)
    add_duplicate(3)
    add_unsettled(4)
    add_orphan(3)
    add_amount_mismatch(4)
    add_stale_timing(4)

    random.shuffle(ledger_rows)
    random.shuffle(settlement_rows)

    return ledger_rows, settlement_rows, answer_key


def write_csv(path, header, rows):
    with open(path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)


def generate():
    """Generate the synthetic batch and write ledger/settlements/answer_key files.
    Returns counts for logging/API responses."""
    ledger_rows, settlement_rows, answer_key = build_dataset()

    write_csv(
        LEDGER_PATH,
        ["order_id", "customer_name", "expected_gross_amount", "invoice_date", "currency"],
        ledger_rows,
    )
    write_csv(
        SETTLEMENTS_PATH,
        ["payment_id", "utr", "settled_amount", "fee", "tax", "settled_at", "status"],
        settlement_rows,
    )
    write_csv(
        ANSWER_KEY_PATH,
        ["order_id", "true_case", "settlement_ref"],
        answer_key,
    )

    return {"ledger_records": len(ledger_rows), "settlement_records": len(settlement_rows), "answer_key_entries": len(answer_key)}


if __name__ == "__main__":
    counts = generate()
    print(f"Ledger records:      {counts['ledger_records']}")
    print(f"Settlement records:  {counts['settlement_records']}")
    print(f"Answer key entries:  {counts['answer_key_entries']}")
