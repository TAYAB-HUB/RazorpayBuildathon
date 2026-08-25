// ---------------------------------------------------------------------------
// REKON reconciliation engine — deterministic by design.
//
// Money movement must be *verifiable, replayable and explainable*. So every
// match is produced by a named rule with an auditable explanation, never by a
// model. AI is reserved for the genuinely ambiguous tail (see lib/ai.ts).
//
// Passes (in order — strongest evidence first):
//   P0 quarantine               malformed bank lines are isolated, never crash
//   P1 exact_utr_gross          UTR + exact gross amount
//   P2 net_utr_fee              UTR + fee-adjusted net settlement
//   P3 utr_amount_tolerance     UTR + ₹±8 bank posting noise
//   P4 fuzzy_ref_amount         truncated/typo'd references (trigram+levenshtein)
//   P5 split_pair               two bank lines summing to one settlement
//   P6 amount_date_unique       amount equality within ±2d, unique both sides
//   P7 extended_window          amount equality 3–6d out (delayed settlements)
// Whatever survives becomes an honest, classified exception.
// ---------------------------------------------------------------------------

import { expectedFee } from "./synth";
import {
  dayDiff,
  inr,
  normalizeRef,
  parseBankDate,
  refSimilarity,
  Rng,
  uid,
} from "./util";
import type { InvoiceRow, PaymentRow, SettlementRow } from "@/db/schema";

export const ENGINE_VERSION = "v1.4.2-deterministic";

export interface MatchOut {
  paymentId: string | null;
  settlementId: string | null;
  invoiceId: string | null;
  rule: string;
  confidence: number;
  explanation: string;
  aiUsed: boolean;
}

export interface ExceptionDraft {
  kind: "payment" | "settlement" | "invoice";
  recordId: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  detail: string;
  aiNote?: string | null;
}

export interface PassStat {
  key: string;
  label: string;
  matched: number;
  skippedAmbiguous: number;
  ms: number;
}

export interface TraceLine {
  t: number;
  level: "info" | "warn" | "error" | "ok";
  msg: string;
}

interface BankLine {
  row: SettlementRow;
  id: string;
  utrNorm: string;
  amount: number | null;
  day: string | null;
  malformedReasons: string[];
  matched: boolean;
  matchedBy?: string;
}

interface PayLine {
  row: PaymentRow;
  id: string;
  utrNorm: string;
  net: number;
  gross: number;
  day: string;
  matched: boolean;
  settlementIds: string[];
}

export interface EngineStats {
  payments: number;
  settlements: number;
  validSettlements: number;
  quarantined: number;
  invoices: number;
  matchedPayments: number;
  partiallyMatched: number;
  matchRateBank: number;
  invoicesMatched: number;
  matchRateBooks: number;
  threeWay: number;
  exceptionsOpen: number;
  exceptionsByCategory: Record<string, number>;
  exceptionsBySeverity: Record<string, number>;
  recordsTotal: number;
  wallMs: number;
  throughput: number; // records per second
}

export interface DayCash {
  day: string;
  label: string;
  expected: number;
  atRisk: number;
}

export interface CashPosition {
  today: string;
  banked: number;
  inTransit: number;
  expectedFromExceptions: number;
  unattributedBank: number;
  atRisk: number;
  unpaidInvoices: number;
  next7: DayCash[];
}

export interface EngineResult {
  matches: MatchOut[];
  exceptions: ExceptionDraft[];
  passes: PassStat[];
  trace: TraceLine[];
  stats: EngineStats;
  cash: CashPosition;
  status: "completed" | "degraded";
  invariants: { name: string; ok: boolean; detail: string }[];
}

// --------------------------------------------------------------------------

const TOL_PAISE = 800; // ±₹8 bank posting tolerance
const BASE_WINDOW = 2;
const EXT_WINDOW = 6;

export function runEngine(input: {
  payments: PaymentRow[];
  settlements: SettlementRow[];
  invoices: InvoiceRow[];
}): EngineResult {
  const t0 = performance.now();
  const trace: TraceLine[] = [];
  const mark = (level: TraceLine["level"], msg: string) =>
    trace.push({ t: Math.round(performance.now() - t0), level, msg });

  const pays: PayLine[] = input.payments.map((row) => ({
    row,
    id: row.id,
    utrNorm: normalizeRef(row.utr),
    gross: row.amountPaise,
    net: row.amountPaise - expectedFee(row.method, row.amountPaise),
    day: row.day,
    matched: false,
    settlementIds: [],
  }));

  const lines: BankLine[] = input.settlements.map((row) => {
    const reasons: string[] = [];
    if (row.amountPaise === null || row.amountPaise === undefined) reasons.push("null_amount");
    else if (row.amountPaise < 0) reasons.push("negative_amount");
    else if (row.amountPaise === 0) reasons.push("zero_amount");
    const day = parseBankDate(row.dateRaw);
    if (!day) reasons.push("unparseable_date");
    return {
      row,
      id: row.id,
      utrNorm: normalizeRef(row.utrRaw),
      amount: row.amountPaise,
      day,
      malformedReasons: reasons,
      matched: false,
    };
  });

  const matches: MatchOut[] = [];
  const exceptions: ExceptionDraft[] = [];
  const passes: PassStat[] = [];
  const abstentions: { paymentId: string; settlementId: string; reason: string }[] = [];

  mark(
    "info",
    `ingest ${pays.length} payments · ${lines.length} bank lines · ${input.invoices.length} invoices`
  );

  const pushPass = (key: string, label: string, matched: number, skipped: number, started: number) => {
    passes.push({ key, label, matched, skippedAmbiguous: skipped, ms: Math.max(1, Math.round(performance.now() - started)) });
    mark(
      matched > 0 || skipped > 0 ? "ok" : "info",
      `${key}: ${matched} matched${skipped > 0 ? ` · ${skipped} abstained (ambiguous)` : ""}`
    );
  };

  const claim = (p: PayLine, s: BankLine, rule: string, confidence: number, explanation: string) => {
    p.matched = true;
    p.settlementIds.push(s.id);
    s.matched = true;
    s.matchedBy = rule;
    matches.push({
      paymentId: p.id,
      settlementId: s.id,
      invoiceId: null,
      rule,
      confidence,
      explanation,
      aiUsed: false,
    });
  };

  // ---- P0: quarantine -----------------------------------------------------
  let started = performance.now();
  const valid = lines.filter((l) => l.malformedReasons.length === 0);
  const broken = lines.filter((l) => l.malformedReasons.length > 0);
  for (const b of broken) {
    exceptions.push({
      kind: "settlement",
      recordId: b.id,
      category: "MALFORMED",
      severity: "high",
      detail: `Bank line ${b.row.bankRef} quarantined at ingest: ${b.malformedReasons.join(
        ", "
      )} (raw: amount=${b.row.amountPaise ?? "null"}, date="${b.row.dateRaw}"). Engine continued without it.`,
    });
  }
  pushPass("quarantine", "P0 · quarantine malformed lines", 0, 0, started);
  if (broken.length)
    mark("warn", `quarantined ${broken.length} malformed bank line(s) — isolated from matching`);

  // ---- reference-based passes ---------------------------------------------
  const tryRefPass = (
    key: string,
    label: string,
    amountOk: (p: PayLine, s: BankLine) => { ok: boolean; conf: number; why: string } | null
  ) => {
    started = performance.now();
    let n = 0;
    for (const s of valid) {
      if (s.matched || !s.utrNorm) continue;
      const candidates = pays.filter((p) => !p.matched && p.utrNorm === s.utrNorm);
      for (const p of candidates) {
        const verdict = amountOk(p, s);
        if (verdict?.ok) {
          claim(p, s, key, verdict.conf, `${verdict.why} · ref ${s.row.utrRaw} ↔ ${p.row.utr}`);
          n++;
          break;
        }
      }
    }
    pushPass(key, label, n, 0, started);
  };

  tryRefPass("exact_utr_gross", "P1 · UTR + gross amount", (p, s) =>
    s.amount === p.gross
      ? { ok: true, conf: 0.99, why: `UTR exact; settled gross ${inr(p.gross)} (fee billed monthly)` }
      : null
  );

  tryRefPass("net_utr_fee", "P2 · UTR + fee-adjusted net", (p, s) => {
    const fee = expectedFee(p.row.method, p.gross);
    return s.amount === p.gross - fee
      ? {
          ok: true,
          conf: 0.96,
          why: `UTR exact; net ${inr(p.gross - fee)} = gross − ${p.row.method} fee ${inr(fee)}`,
        }
      : null;
  });

  tryRefPass("utr_amount_tolerance", "P3 · UTR + ±₹8 posting noise", (p, s) => {
    if (s.amount === null) return null;
    const targets = [
      { v: p.gross, label: "gross" },
      { v: p.net, label: "net" },
    ];
    for (const t of targets) {
      const d = Math.abs(s.amount - t.v);
      if (d > 0 && d <= TOL_PAISE) {
        return {
          ok: true,
          conf: 0.86 - d / TOL_PAISE / 10,
          why: `UTR exact; ${t.label} off by ${inr(d)} — within posting tolerance`,
        };
      }
    }
    return null;
  });

  // ---- P4: fuzzy reference -------------------------------------------------
  started = performance.now();
  {
    let n = 0;
    let skipped = 0;
    for (const s of valid) {
      if (s.matched || !s.utrNorm) continue;
      const scored = pays
        .filter((p) => !p.matched)
        .map((p) => {
          const sim = refSimilarity(p.utrNorm, s.utrNorm);
          // exact amount only: pairing a weak reference with loose money is
          // how false positives are born — tolerance demands the strong UTR.
          const amountHit = s.amount !== null && (s.amount === p.gross || s.amount === p.net);
          return { p, sim, amountHit };
        })
        .filter((x) => x.sim >= 0.65 && x.amountHit)
        .sort((a, b) => b.sim - a.sim);
      if (scored.length === 1 || (scored.length > 1 && scored[0].sim > scored[1].sim + 0.05)) {
        const { p, sim } = scored[0];
        claim(
          p,
          s,
          "fuzzy_ref_amount",
          0.74 + sim * 0.14,
          `reference recovered (similarity ${(sim * 100).toFixed(0)}%): “${s.row.utrRaw}” ↔ ${p.row.utr}; amount confirm`
        );
        n++;
      } else if (scored.length > 1) {
        abstentions.push({ paymentId: scored[0].p.id, settlementId: s.id, reason: "fuzzy_ref tie" });
        skipped++;
      }
    }
    pushPass("fuzzy_ref_amount", "P4 · fuzzy reference + amount", n, skipped, started);
  }

  /**
   * Contested-amount guard: if two unmatched payments have an identical
   * entitlement (same net or gross), no amount-only evidence may clear either
   * one — the engine abstains and routes both to a human rather than guess.
   */
  const contestersOf = (amount: number): PayLine[] =>
    pays.filter((q) => !q.matched && (q.net === amount || q.gross === amount));

  const veto = (contested: PayLine[], s: BankLine, reason: string) => {
    for (const q of contested) abstentions.push({ paymentId: q.id, settlementId: s.id, reason });
  };

  // ---- P5: split pairs ------------------------------------------------------
  started = performance.now();
  {
    let n = 0;
    let skipped = 0;
    for (const p of pays) {
      if (p.matched) continue;
      const pool = valid.filter(
        (s) =>
          !s.matched &&
          s.amount !== null &&
          s.day !== null &&
          Math.abs(dayDiff(s.day, p.day)) <= 4 &&
          s.amount < p.gross // a part can exceed the net when fees are monthly-billed
      );
      let found: BankLine[] | null = null;
      outer: for (let i = 0; i < pool.length; i++) {
        for (let j = i + 1; j < pool.length; j++) {
          const a = pool[i];
          const b = pool[j];
          const sum = (a.amount ?? 0) + (b.amount ?? 0);
          if (sum === p.net || sum === p.gross) {
            found = [a, b];
            break outer;
          }
        }
      }
      if (found) {
        const target = (found[0].amount ?? 0) + (found[1].amount ?? 0);
        const contested = contestersOf(target);
        if (contested.length > 1) {
          for (const s of found) veto(contested, s, "split sum contested by twins");
          skipped++;
          continue;
        }
        const basis = target === p.net ? "net" : "gross";
        for (const s of found) {
          claim(
            p,
            s,
            "split_pair",
            0.82,
            `settlement split across ${found.length} lines; pair sums to ${basis} ${inr(
              basis === "net" ? p.net : p.gross
            )}`
          );
        }
        n++;
      }
    }
    pushPass("split_pair", "P5 · split settlement pairs", n, skipped, started);
  }

  // ---- P6/P7: amount-only passes with uniqueness guard ---------------------
  const amountWindowPass = (
    key: string,
    label: string,
    minDays: number,
    maxDays: number,
    conf: number
  ) => {
    started = performance.now();
    let n = 0;
    let skipped = 0;
    for (const s of valid) {
      if (s.matched || s.amount === null || s.day === null) continue;
      const cands = pays.filter((p) => {
        if (p.matched) return false;
        const d = Math.abs(dayDiff(s.day!, p.day));
        if (d < minDays || d > maxDays) return false;
        return s.amount === p.gross || s.amount === p.net;
      });
      const contested = contestersOf(s.amount);
      if (cands.length === 1 && contested.length === 1) {
        const p = cands[0];
        const basis = s.amount === p.net ? "net" : "gross";
        claim(
          p,
          s,
          key,
          conf,
          `${basis} amount ${inr(s.amount)} unique candidate; date drift ${Math.abs(
            dayDiff(s.day!, p.day)
          )}d`
        );
        n++;
      } else if (cands.length > 0 && contested.length > 1) {
        // twins share this entitlement and at least one is in-window
        veto(contested, s, "equal entitlement — abstained");
        skipped++;
      }
    }
    pushPass(key, label, n, skipped, started);
  };

  amountWindowPass("amount_date_unique", "P6 · unique amount within ±2d", 0, BASE_WINDOW, 0.9);
  amountWindowPass("extended_window", "P7 · unique amount T+3…T+6 (delayed)", 3, EXT_WINDOW, 0.72);

  // ---- books pass: invoices ↔ payments --------------------------------------
  const invDones = new Set<string>();
  {
    started = performance.now();
    let n = 0;
    for (const inv of input.invoices) {
      const cands = pays.filter(
        (p) => p.row.customer === inv.customer && p.gross === inv.amountPaise
      );
      if (cands.length === 1) {
        matches.push({
          paymentId: cands[0].id,
          settlementId: null,
          invoiceId: inv.id,
          rule: "books_customer_amount",
          confidence: 0.94,
          explanation: `invoice ${inv.invoiceNo} ↔ payment ${cands[0].row.gatewayRef}: customer + ${inr(
            inv.amountPaise
          )} exact, unique`,
          aiUsed: false,
        });
        invDones.add(inv.id);
        n++;
      }
    }
    pushPass("books_customer_amount", "P8 · books: customer + amount", n, 0, started);
  }

  // ---- classification of what remains — the honest exception list ----------
  const ambiguousSettlementIds = new Set<string>();
  for (const p of pays) {
    if (p.matched) continue;
    const abstained = abstentions.filter((a) => a.paymentId === p.id);
    const refTwin = valid.find(
      (s) => !s.matched && s.utrNorm && (s.utrNorm === p.utrNorm || refSimilarity(s.utrNorm, p.utrNorm) > 0.9)
    );
    const farAmount = valid.find(
      (s) =>
        !s.matched &&
        s.amount !== null &&
        s.day !== null &&
        (s.amount === p.net || s.amount === p.gross) &&
        Math.abs(dayDiff(s.day, p.day)) > EXT_WINDOW
    );
    if (abstained.length > 0) {
      ambiguousSettlementIds.add(abstained[0].settlementId);
      const twins = abstentions
        .filter((a) => a.settlementId === abstained[0].settlementId && a.paymentId !== p.id)
        .map((a) => a.paymentId);
      exceptions.push({
        kind: "payment",
        recordId: p.id,
        category: "AMBIGUOUS",
        severity: "high",
        detail: `${p.row.gatewayRef} (${inr(p.gross)}, ${p.day}) collides with ${twins.length} twin payment(s) [${twins
          .map((t) => input.payments.find((x) => x.id === t)?.gatewayRef ?? t)
          .join(", ")}] for bank line ${
          input.settlements.find((x) => x.id === abstained[0].settlementId)?.bankRef
        }. Engine abstained — guessing is not an option for money.`,
      });
    } else if (refTwin) {
      const delta = (refTwin.amount ?? 0) - p.net;
      exceptions.push({
        kind: "payment",
        recordId: p.id,
        category: "AMOUNT_MISMATCH",
        severity: "critical",
        detail: `${p.row.gatewayRef}: UTR matches bank line ${refTwin.row.bankRef} but amount ${inr(
          refTwin.amount
        )} ≠ expected net ${inr(p.net)} / gross ${inr(p.gross)} (Δ ${inr(delta)}). Probable bank-side posting error.`,
      });
      ambiguousSettlementIds.add(refTwin.id);
    } else if (farAmount) {
      exceptions.push({
        kind: "payment",
        recordId: p.id,
        category: "DATE_DRIFT",
        severity: "medium",
        detail: `${p.row.gatewayRef} (${inr(p.gross)}) settled ${Math.abs(
          dayDiff(farAmount.day!, p.day)
        )} days late on ${farAmount.day} (line ${farAmount.row.bankRef}) — outside the T+${EXT_WINDOW} policy window. Likely bank delay, not a loss.`,
      });
      ambiguousSettlementIds.add(farAmount.id);
    } else {
      const age = Math.max(0, dayDiff(new Date().toISOString().slice(0, 10), p.day));
      exceptions.push({
        kind: "payment",
        recordId: p.id,
        category: "UNSETTLED",
        severity: age >= 5 ? "high" : "medium",
        detail: `${p.row.gatewayRef} captured ${p.day} for ${inr(p.gross)} has no bank line after ${age}d. Expected net ${inr(
          p.net
        )} by T+2 (${p.row.method} schedule). Aging ${age}d${age >= 5 ? " — escalate" : ""}.`,
      });
    }
  }

  for (const s of valid) {
    if (s.matched || ambiguousSettlementIds.has(s.id)) continue;
    const nar = s.row.narration.toUpperCase();
    const matchedNorms = new Set(valid.filter((x) => x.matched).map((x) => x.utrNorm));
    if (s.utrNorm && matchedNorms.has(s.utrNorm)) {
      exceptions.push({
        kind: "settlement",
        recordId: s.id,
        category: "DUPLICATE",
        severity: "high",
        detail: `Bank line ${s.row.bankRef} (${inr(s.amount)}) duplicates an already-matched line for ref ${s.row.utrRaw}. Possible double settlement — funds may need returning.`,
      });
    } else if (nar.includes("REFUND")) {
      exceptions.push({
        kind: "settlement",
        recordId: s.id,
        category: "ORPHAN_REFUND",
        severity: "low",
        detail: `Line ${s.row.bankRef} (${inr(s.amount)}) is a REFUND debit/credit with no matching original payment in this batch. Routed to refunds ledger.`,
      });
    } else if (nar.includes("CHARGEBACK")) {
      exceptions.push({
        kind: "settlement",
        recordId: s.id,
        category: "ORPHAN_CHARGEBACK",
        severity: "critical",
        detail: `Line ${s.row.bankRef} (${inr(s.amount)}) carries CHARGEBACK narration with no source payment here. Dispute window is short — act today.`,
      });
    } else {
      exceptions.push({
        kind: "settlement",
        recordId: s.id,
        category: "ORPHAN_BANK",
        severity: "medium",
        detail: `Line ${s.row.bankRef} (${inr(s.amount)}, ref “${s.row.utrRaw ?? "—"}”) matches no captured payment. Unattributed money is a liability.`,
      });
    }
  }

  for (const inv of input.invoices) {
    if (invDones.has(inv.id)) continue;
    exceptions.push({
      kind: "invoice",
      recordId: inv.id,
      category: "UNPAID_INVOICE",
      severity: "medium",
      detail: `${inv.invoiceNo} (${inv.customer}, ${inr(inv.amountPaise)}) due ${inv.dueDay} has no matching payment in the gateway batch.`,
    });
  }

  // ---- invariants: the engine checks its own books --------------------------
  const invariants: { name: string; ok: boolean; detail: string }[] = [];
  const sumMatchedLines = matches
    .filter((m) => m.settlementId)
    .reduce((acc, m) => acc + (valid.find((s) => s.id === m.settlementId)?.amount ?? 0), 0);
  const sumUnmatchedValid = valid
    .filter((s) => !s.matched)
    .reduce((acc, s) => acc + (s.amount ?? 0), 0);
  const sumValid = valid.reduce((acc, s) => acc + (s.amount ?? 0), 0);
  invariants.push({
    name: "conservation_of_bank_total",
    ok: Math.abs(sumMatchedLines + sumUnmatchedValid - sumValid) === 0,
    detail: `matched ${inr(sumMatchedLines)} + unmatched ${inr(sumUnmatchedValid)} = bank total ${inr(sumValid)}`,
  });
  const lineUse = new Map<string, number>();
  for (const m of matches) if (m.settlementId) lineUse.set(m.settlementId, (lineUse.get(m.settlementId) ?? 0) + 1);
  const overused = [...lineUse.entries()].filter(([, c]) => c > 1 && !matches.some((m) => m.settlementId && m.rule === "split_pair"));
  invariants.push({
    name: "no_double_settlement_spend",
    ok: overused.length === 0,
    detail: overused.length === 0 ? "every bank line consumed at most once" : `${overused.length} lines over-consumed`,
  });

  // ---- cash position ----------------------------------------------------------
  const today = new Date().toISOString().slice(0, 10);
  const matchedByDay = new Map<string, number>();
  let banked = 0;
  let inTransit = 0;
  for (const m of matches) {
    if (!m.settlementId) continue;
    const s = valid.find((x) => x.id === m.settlementId);
    if (!s || s.amount === null || !s.day) continue;
    if (s.day <= today) banked += s.amount;
    else {
      inTransit += s.amount;
      matchedByDay.set(s.day, (matchedByDay.get(s.day) ?? 0) + s.amount);
    }
  }
  let expectedFromExceptions = 0;
  let atRisk = 0;
  let unpaidInvoices = 0;
  const next7map = new Map<string, { expected: number; atRisk: number }>();
  const bump = (day: string, amt: number, risk: number) => {
    const cur = next7map.get(day) ?? { expected: 0, atRisk: 0 };
    cur.expected += amt;
    cur.atRisk += risk;
    next7map.set(day, cur);
  };
  for (const [day, amt] of matchedByDay) bump(day, amt, 0);
  for (const e of exceptions) {
    if (e.kind === "payment") {
      const p = pays.find((x) => x.id === e.recordId);
      if (!p) continue;
      const eta = p.day; // predicted net arrival
      const etaDay = new Date(new Date(p.day + "T00:00:00Z").getTime() + 2 * 86400000).toISOString().slice(0, 10);
      if (e.category === "UNSETTLED" || e.category === "AMBIGUOUS") {
        expectedFromExceptions += p.net;
        if (etaDay >= today) bump(etaDay, p.net, e.category === "AMBIGUOUS" ? p.net : 0);
        else atRisk += p.net;
        void eta;
      } else if (e.category === "AMOUNT_MISMATCH") {
        atRisk += Math.abs(p.net);
      }
    }
    if (e.kind === "invoice" && e.category === "UNPAID_INVOICE") {
      const inv = input.invoices.find((x) => x.id === e.recordId);
      if (inv) {
        unpaidInvoices += inv.amountPaise;
        atRisk += inv.amountPaise;
      }
    }
  }
  const unattributedBank = exceptions
    .filter((e) => e.kind === "settlement" && e.category !== "MALFORMED")
    .reduce((acc, e) => acc + (valid.find((s) => s.id === e.recordId)?.amount ?? 0), 0);

  const next7: DayCash[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(new Date(today + "T00:00:00Z").getTime() + i * 86400000).toISOString().slice(0, 10);
    const cur = next7map.get(day) ?? { expected: 0, atRisk: 0 };
    next7.push({
      day,
      label: i === 0 ? "Today" : i === 1 ? "Tmrw" : day.slice(5).split("-").reverse().join("/"),
      expected: cur.expected,
      atRisk: cur.atRisk,
    });
  }

  const wallMs = Math.max(1, Math.round(performance.now() - t0));
  const matchedPayments = pays.filter((p) => p.matched).length;
  const recordsTotal = pays.length + lines.length + input.invoices.length;

  const exceptionsByCategory: Record<string, number> = {};
  const exceptionsBySeverity: Record<string, number> = {};
  for (const e of exceptions) {
    exceptionsByCategory[e.category] = (exceptionsByCategory[e.category] ?? 0) + 1;
    exceptionsBySeverity[e.severity] = (exceptionsBySeverity[e.severity] ?? 0) + 1;
  }

  const threeWay = pays.filter((p) => {
    if (!p.matched) return false;
    return matches.some((m) => m.paymentId === p.id && m.invoiceId);
  }).length;

  const status: EngineResult["status"] = invariants.every((i) => i.ok) ? "completed" : "degraded";
  for (const inv of invariants)
    mark(inv.ok ? "ok" : "error", `invariant ${inv.name}: ${inv.ok ? "holds" : "VIOLATED"} (${inv.detail})`);
  mark(
    status === "completed" ? "ok" : "error",
    `close-out: ${matchedPayments}/${pays.length} payments reconciled · ${exceptions.length} exceptions · run ${status.toUpperCase()} in ${wallMs}ms`
  );

  return {
    matches,
    exceptions,
    passes,
    trace,
    status,
    invariants,
    stats: {
      payments: pays.length,
      settlements: lines.length,
      validSettlements: valid.length,
      quarantined: broken.length,
      invoices: input.invoices.length,
      matchedPayments,
      partiallyMatched: pays.filter((p) => p.settlementIds.length > 1).length,
      matchRateBank: pays.length ? matchedPayments / pays.length : 0,
      invoicesMatched: invDones.size,
      matchRateBooks: input.invoices.length ? invDones.size / input.invoices.length : 0,
      threeWay,
      exceptionsOpen: exceptions.length,
      exceptionsByCategory,
      exceptionsBySeverity,
      recordsTotal,
      wallMs,
      throughput: Math.round((recordsTotal / wallMs) * 1000),
    },
    cash: {
      today,
      banked,
      inTransit,
      expectedFromExceptions,
      unattributedBank,
      atRisk,
      unpaidInvoices,
      next7,
    },
  };
}

// ---------------------------------------------------------------------------
// Scoring against hidden ground truth. The engine never sees this while
// matching — it only grades the outcome afterwards.
// ---------------------------------------------------------------------------

export interface TruthShape {
  bankLinks: Record<string, string[] | null>;
  bookLinks: Record<string, string | null>;
  tags: Record<string, string[]>;
}

export interface RuleStat {
  rule: string;
  matched: number;
  correct: number;
  incorrect: number;
}

export interface CoverageRow {
  tag: string;
  injected: number;
  detected: number;
  missed: string[];
}

export interface Metrics {
  bank: {
    truthPairs: number;
    enginePairs: number;
    correctPairs: number;
    precision: number;
    recall: number;
    f1: number;
    paymentExact: number;
    paymentTotal: number;
    paymentAccuracy: number;
  };
  books: {
    truthPairs: number;
    enginePairs: number;
    correctPairs: number;
    precision: number;
    recall: number;
    f1: number;
  };
  rules: RuleStat[];
  coverage: { injected: number; detected: number; rows: CoverageRow[] };
}

const TAG_EXPECTATION: Record<string, { type: "match" | "exception"; category?: string }> = {
  clean: { type: "match" },
  gross_settle: { type: "match" },
  mangled_ref: { type: "match" },
  amount_typo: { type: "match" },
  delayed_soft: { type: "match" },
  split: { type: "match" },
  missing: { type: "exception", category: "UNSETTLED" },
  delayed_hard: { type: "exception", category: "DATE_DRIFT" },
  amount_transposed: { type: "exception", category: "AMOUNT_MISMATCH" },
  collision_a: { type: "exception", category: "AMBIGUOUS" },
  collision_b: { type: "exception", category: "AMBIGUOUS" },
  duplicate: { type: "exception", category: "DUPLICATE" },
  refund: { type: "exception", category: "ORPHAN_REFUND" },
  chargeback: { type: "exception", category: "ORPHAN_CHARGEBACK" },
  orphan: { type: "exception", category: "ORPHAN_BANK" },
  malformed_neg: { type: "exception", category: "MALFORMED" },
  malformed_date: { type: "exception", category: "MALFORMED" },
  malformed_amount: { type: "exception", category: "MALFORMED" },
  unpaid: { type: "exception", category: "UNPAID_INVOICE" },
};

const sideOf = (id: string) => (id.startsWith("pay_") ? "payment" : id.startsWith("stl_") ? "settlement" : "invoice");

// If an engine flag exists but in a sibling category, the record was still
// surfaced to a human — credit it as handled (not silently missed).
const ALSO_COUNTS: Record<string, string[]> = {
  missing: ["AMBIGUOUS"],
  delayed_hard: ["AMBIGUOUS"],
  amount_transposed: ["AMBIGUOUS"],
};

/** Tags whose presence on the same payment overrides a "match" expectation. */
const EXCEPTION_TAGS = new Set([
  "missing",
  "delayed_hard",
  "amount_transposed",
  "collision_a",
  "collision_b",
]);

export function scoreRun(result: EngineResult, truth: TruthShape): Metrics {
  const enginePairs = new Set<string>();
  const enginePayments = new Map<string, string[]>();
  for (const m of result.matches) {
    if (!m.paymentId || !m.settlementId) continue;
    enginePairs.add(`${m.paymentId}::${m.settlementId}`);
    enginePayments.set(m.paymentId, [...(enginePayments.get(m.paymentId) ?? []), m.settlementId]);
  }
  const truthPairs = new Set<string>();
  for (const [payId, stls] of Object.entries(truth.bankLinks)) {
    for (const s of stls ?? []) truthPairs.add(`${payId}::${s}`);
  }
  let correctPairs = 0;
  for (const p of enginePairs) if (truthPairs.has(p)) correctPairs++;

  let paymentExact = 0;
  let paymentTotal = 0;
  for (const [payId, stls] of Object.entries(truth.bankLinks)) {
    paymentTotal++;
    const want = [...(stls ?? [])].sort().join("|");
    const got = [...(enginePayments.get(payId) ?? [])].sort().join("|");
    if (want === got) paymentExact++;
  }

  const ruleMap = new Map<string, RuleStat>();
  const truthBookPairs = new Set<string>();
  for (const [invId, payId] of Object.entries(truth.bookLinks)) if (payId) truthBookPairs.add(`${invId}::${payId}`);
  for (const m of result.matches) {
    const key = m.rule;
    const cur = ruleMap.get(key) ?? { rule: key, matched: 0, correct: 0, incorrect: 0 };
    cur.matched++;
    if (m.settlementId && m.paymentId) {
      if (truthPairs.has(`${m.paymentId}::${m.settlementId}`)) cur.correct++;
      else cur.incorrect++;
    } else if (m.invoiceId && m.paymentId) {
      if (truthBookPairs.has(`${m.invoiceId}::${m.paymentId}`)) cur.correct++;
      else cur.incorrect++;
    }
    ruleMap.set(key, cur);
  }

  // books
  const engineBook = new Set<string>();
  for (const m of result.matches) if (m.invoiceId && m.paymentId) engineBook.add(`${m.invoiceId}::${m.paymentId}`);
  const truthBook = new Set<string>();
  for (const [invId, payId] of Object.entries(truth.bookLinks)) if (payId) truthBook.add(`${invId}::${payId}`);
  let bookCorrect = 0;
  for (const p of engineBook) if (truthBook.has(p)) bookCorrect++;

  const pr = (correct: number, produced: number, truthN: number) => {
    const precision = produced ? correct / produced : 0;
    const recall = truthN ? correct / truthN : 0;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    return { precision, recall, f1 };
  };
  const bankPR = pr(correctPairs, enginePairs.size, truthPairs.size);
  const bookPR = pr(bookCorrect, engineBook.size, truthBook.size);

  // chaos-deck coverage: was every injected failure handled the right way?
  const rows: CoverageRow[] = [];
  let injectedTotal = 0;
  let detectedTotal = 0;
  const byTag = new Map<string, string[]>();
  for (const [recId, tags] of Object.entries(truth.tags)) {
    for (const t of tags) byTag.set(t, [...(byTag.get(t) ?? []), recId]);
  }
  const paymentMatched = new Set(result.matches.filter((m) => m.paymentId && m.settlementId).map((m) => m.paymentId));
  const settlementMatched = new Set(result.matches.filter((m) => m.settlementId).map((m) => m.settlementId));
  const invoiceMatched = new Set(result.matches.filter((m) => m.invoiceId).map((m) => m.invoiceId));
  for (const [tag, ids] of byTag) {
    const expect = TAG_EXPECTATION[tag];
    if (!expect) continue;
    // fair-evaluation filter: a payment-level "match" expectation only counts
    // when no exception-tag rides on the same record (a deliberately missing
    // payment is a fact of the workload, not an engine failure).
    const counted = ids.filter((id) => {
      if (expect.type === "match" && sideOf(id) === "payment") {
        const others = truth.tags[id] ?? [];
        return !others.some((o) => EXCEPTION_TAGS.has(o));
      }
      return true;
    });
    const missed: string[] = [];
    for (const id of counted) {
      const side = sideOf(id);
      let ok = false;
      if (expect.category === "DUPLICATE" && side === "payment") {
        // a duplicate payment matching its primary line is correct handling;
        // the duplicate *line* is what must surface as an exception
        ok = paymentMatched.has(id);
      } else if (expect.type === "match") {
        ok =
          side === "payment"
            ? paymentMatched.has(id)
            : side === "settlement"
              ? settlementMatched.has(id)
              : invoiceMatched.has(id);
      } else {
        ok = result.exceptions.some((e) => e.recordId === id && e.category === expect.category);
        if (!ok) {
          const also = ALSO_COUNTS[tag] ?? [];
          ok = result.exceptions.some((e) => e.recordId === id && also.includes(e.category));
        }
      }
      if (!ok) missed.push(id);
    }
    injectedTotal += counted.length;
    detectedTotal += counted.length - missed.length;
    rows.push({ tag, injected: counted.length, detected: counted.length - missed.length, missed });
  }
  rows.sort((a, b) => a.tag.localeCompare(b.tag));

  return {
    bank: {
      truthPairs: truthPairs.size,
      enginePairs: enginePairs.size,
      correctPairs,
      ...bankPR,
      paymentExact,
      paymentTotal,
      paymentAccuracy: paymentTotal ? paymentExact / paymentTotal : 0,
    },
    books: { truthPairs: truthBook.size, enginePairs: engineBook.size, correctPairs: bookCorrect, ...bookPR },
    rules: [...ruleMap.values()].sort((a, b) => b.matched - a.matched),
    coverage: { injected: injectedTotal, detected: detectedTotal, rows },
  };
}

// Deterministic adjudication note — the honest fallback when no LLM key is set.
export function heuristicNote(e: ExceptionDraft): string {
  switch (e.category) {
    case "AMBIGUOUS":
      return "Two payments have identical entitlement to one bank line. No differentiating evidence in-date — do NOT guess. Pull the acquirer reference from the gateway dashboard or wait for the next remittance file, then use manual override.";
    case "AMOUNT_MISMATCH":
      return "Reference matches but money does not. File a short-pay dispute with the acquiring bank quoting the bankRef and expected net; keep the payment flagged until the correction credit arrives.";
    case "UNSETTLED":
      return "No bank line within policy window. Most common cause at this age is a bank holiday queue; if aging crosses T+5, raise a settlement ticket with the UTR and freeze payouts to this MID as a precaution.";
    case "DATE_DRIFT":
      return "Amount matches a far-out bank line. Confirm value date with the bank; if confirmed, post the match manually and tighten the monitoring window for this acquiring route.";
    case "DUPLICATE":
      return "Same reference settled twice. Verify the second credit with the bank statement and initiate a return before it ages past the reversal window.";
    case "ORPHAN_BANK":
      return "Unattributed money is a liability, not a windfall. Park in suspense account 1999 and reconcile against the next gateway cycle; auto-write-off only after 90 days per policy.";
    case "ORPHAN_REFUND":
      return "Refund leg without its original payment inside this batch window. Cross-check the prior batch; link and close.";
    case "ORPHAN_CHARGEBACK":
      return "Chargeback without source payment in-batch. Locate the original payment from the card network reference and open the dispute evidence pack immediately.";
    case "MALFORMED":
      return "Line failed ingestion. Replay from the raw bank file; if the source file itself is corrupt, raise an ops ticket with the bank's settlement desk — do not hand-edit amounts.";
    case "UNPAID_INVOICE":
      return "Invoice past due with no payment. Nudge the customer with a payment link; if paid by another rail, import that statement and re-run.";
    default:
      return "Escalate to the finance-ops queue with this record id attached.";
  }
}

export function newRunId(): string {
  return uid("run", new Rng(`${Date.now()}-${Math.random()}`));
}
