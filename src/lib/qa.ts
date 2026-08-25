// ---------------------------------------------------------------------------
// Settlement Q&A agent — deterministic intent parsing over the run ledger.
// The parsed plan is returned alongside the answer so the operator can see
// exactly which query ran. Optional LLM layer only re-phrases; numbers always
// come from this deterministic core. (AI judgment: generation where it is
// safe, computation where it matters.)
// ---------------------------------------------------------------------------

import { inr, pct } from "./util";

export interface QaException {
  id: number;
  kind: string;
  recordId: string;
  category: string;
  severity: string;
  detail: string;
  aiNote?: string | null;
  status: string;
  ref?: string;
  amount?: number | null;
}

export interface QaContext {
  batchName: string;
  stats: {
    payments: number;
    settlements: number;
    invoices: number;
    matchedPayments: number;
    matchRateBank: number;
    matchRateBooks: number;
    invoicesMatched: number;
    exceptionsOpen: number;
    exceptionsByCategory: Record<string, number>;
    recordsTotal: number;
    wallMs: number;
    throughput: number;
  };
  metrics?: {
    bank: { precision: number; recall: number; f1: number; paymentAccuracy: number };
  } | null;
  cash: {
    banked: number;
    inTransit: number;
    expectedFromExceptions: number;
    unattributedBank: number;
    atRisk: number;
    unpaidInvoices: number;
  };
  aiMode: string;
  exceptions: QaException[];
}

export interface QaAnswer {
  intent: string;
  slots: Record<string, string>;
  answer: string;
  data?: unknown;
  fallback?: boolean;
}

const CATEGORY_HINTS: [RegExp, string][] = [
  [/unsettl/i, "UNSETTLED"],
  [/ambig/i, "AMBIGUOUS"],
  [/mismatch|short.?pay|amount/i, "AMOUNT_MISMATCH"],
  [/drift|delayed|late/i, "DATE_DRIFT"],
  [/duplicate|double/i, "DUPLICATE"],
  [/orphan|unattributed|unknown/i, "ORPHAN_BANK"],
  [/refund/i, "ORPHAN_REFUND"],
  [/chargeback|dispute/i, "ORPHAN_CHARGEBACK"],
  [/malformed|corrupt|garbage/i, "MALFORMED"],
  [/unpaid|invoice/i, "UNPAID_INVOICE"],
];

export function answerQuestion(ctx: QaContext, question: string): QaAnswer {
  const q = question.toLowerCase().trim();

  const refMatch = /(pay_[a-z0-9]+|setl-\d+|inv-\d+)/i.exec(question);
  if (refMatch) {
    const ref = refMatch[1];
    const ex = ctx.exceptions.find(
      (e) => e.ref?.toLowerCase() === ref.toLowerCase() || e.detail.toLowerCase().includes(ref.toLowerCase())
    );
    if (ex) {
      return {
        intent: "explain_record",
        slots: { ref },
        answer: `${ref} → ${ex.category} (${ex.severity}). ${ex.detail}${
          ex.aiNote ? ` Adjudication note: ${ex.aiNote}` : ""
        } Status: ${ex.status}.`,
        data: ex,
      };
    }
    return {
      intent: "explain_record",
      slots: { ref },
      answer: `${ref} is not on the exception list — it reconciled cleanly. Every clean match carries its rule and confidence in the Matches audit tab.`,
    };
  }

  if (/match rate|accuracy|precision|recall|f1|how (well|accurate)/.test(q)) {
    const m = ctx.metrics?.bank;
    return {
      intent: "match_rate",
      slots: {},
      answer:
        `Bank-side match rate is ${pct(ctx.stats.matchRateBank)} (${ctx.stats.matchedPayments}/${ctx.stats.payments} payments). ` +
        (m
          ? `Measured against hidden ground truth: precision ${pct(m.precision)}, recall ${pct(m.recall)}, F1 ${pct(
              m.f1
            )}, payment-exact ${pct(m.paymentAccuracy)}. `
          : "") +
        `Books-side ${ctx.stats.invoicesMatched}/${ctx.stats.invoices} invoices closed (${pct(ctx.stats.matchRateBooks)}).`,
      data: { stats: ctx.stats, metrics: ctx.metrics },
    };
  }

  if (/cash|position|inflow|bank balance|how much|runway|expect/.test(q)) {
    return {
      intent: "cash_position",
      slots: {},
      answer:
        `Banked so far: ${inr(ctx.cash.banked)}. In transit from matched settlements: ${inr(ctx.cash.inTransit)}. ` +
        `Still expected from open exceptions: ${inr(ctx.cash.expectedFromExceptions)}, with ${inr(ctx.cash.atRisk)} at risk ` +
        `(incl. ${inr(ctx.cash.unpaidInvoices)} unpaid invoices). Unattributed bank money: ${inr(ctx.cash.unattributedBank)}.`,
      data: ctx.cash,
    };
  }

  if (/throughput|fast|speed|performance|latency|how long/.test(q)) {
    return {
      intent: "throughput",
      slots: {},
      answer: `The engine processed ${ctx.stats.recordsTotal} records in ${ctx.stats.wallMs}ms — ${ctx.stats.throughput.toLocaleString(
        "en-IN"
      )} records/sec, deterministic and replayable.`,
      data: { wallMs: ctx.stats.wallMs, throughput: ctx.stats.throughput },
    };
  }

  if (/\bai\b|llm|model|gpt|machine learning|ml/.test(q)) {
    return {
      intent: "ai_usage",
      slots: { mode: ctx.aiMode },
      answer:
        `Mode: ${ctx.aiMode}. The engine itself is 100% deterministic — every match cites a rule and confidence. ` +
        `AI is used only for adjudication notes on ambiguous exceptions and for phrasing these answers. ` +
        `It never moves money and never matches records.`,
    };
  }

  for (const [re, category] of CATEGORY_HINTS) {
    if (re.test(q)) {
      const list = ctx.exceptions.filter((e) => e.category === category);
      const open = list.filter((e) => e.status === "open");
      if (!list.length) {
        return {
          intent: "list_exceptions",
          slots: { category },
          answer: `No ${category} exceptions in this run — the engine either matched those records or none existed.`,
          data: [],
        };
      }
      const top = open.slice(0, 3).map((e) => `${e.ref ?? e.recordId} (${inr(e.amount ?? null)})`);
      return {
        intent: "list_exceptions",
        slots: { category },
        answer: `${open.length} open ${category} exception${open.length === 1 ? "" : "s"}${
          top.length ? ` — largest: ${top.join("; ")}` : ""
        }. First detail: ${open[0]?.detail ?? list[0]?.detail}`,
        data: open,
      };
    }
  }

  if (/exception|stuck|failed|problem|issue|wrong|attention/.test(q)) {
    const byCat = Object.entries(ctx.stats.exceptionsByCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${v}× ${k}`)
      .join(", ");
    return {
      intent: "exceptions_summary",
      slots: {},
      answer: `${ctx.stats.exceptionsOpen} open exceptions: ${byCat}. Every one carries a deterministic detail line plus an adjudication note.`,
      data: ctx.stats.exceptionsByCategory,
    };
  }

  if (/largest|biggest|top/.test(q)) {
    const open = ctx.exceptions
      .filter((e) => e.status === "open" && typeof e.amount === "number")
      .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
      .slice(0, 5);
    if (open.length)
      return {
        intent: "largest_exceptions",
        slots: {},
        answer: `Largest open exposures: ${open
          .map((e) => `${e.ref ?? e.recordId} ${inr(e.amount ?? 0)} [${e.category}]`)
          .join("; ")}.`,
        data: open,
      };
  }

  return {
    intent: "help",
    slots: {},
    fallback: true,
    answer:
      "I can answer over this run's ledger: try “what is the match rate?”, “cash position”, “list unsettled exceptions”, “why was pay_XXXX not matched?”, “what broke?”, or “how fast was the run?”.",
  };
}
