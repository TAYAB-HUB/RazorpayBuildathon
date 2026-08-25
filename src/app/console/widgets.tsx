"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  ChevronDown,
  CircleCheck,
  CircleX,
  FileSearch,
  FlaskConical,
  Gauge,
  GitMerge,
  Hand,
  Landmark,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Undo2,
  Zap,
} from "lucide-react";
import { inr, inrShort, pct } from "@/lib/util";
import type {
  CashPosition,
  ExceptionItem,
  Invariant,
  MatchItem,
  Metrics,
  PassStat,
  PaymentRec,
  SettlementRec,
  InvoiceRec,
  CoverageRow,
  Stats,
  TraceLine,
  AuditItem,
} from "@/lib/clientTypes";

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-7 w-7 place-items-center rounded-md border border-[var(--line)] bg-[var(--panel2)]">
        <GitMerge className="h-3.5 w-3.5 text-[var(--lime)]" />
      </div>
      <span className="text-[13px] font-bold tracking-[0.22em]">
        REKON<span className="text-[var(--blue)]">/</span>
        <span className="ml-2 font-normal tracking-normal text-[var(--faint)]">console</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------

const SEV_STYLE: Record<string, string> = {
  critical: "chip-red",
  high: "chip-amber",
  medium: "chip-blue",
  low: "chip",
};

export function SevChip({ sev }: { sev: string }) {
  return <span className={`chip ${SEV_STYLE[sev] ?? "chip"}`}>{sev}</span>;
}

const CAT_STYLE: Record<string, string> = {
  UNSETTLED: "chip-amber",
  AMBIGUOUS: "chip-red",
  AMOUNT_MISMATCH: "chip-red",
  DATE_DRIFT: "chip-blue",
  DUPLICATE: "chip-amber",
  ORPHAN_BANK: "chip-blue",
  ORPHAN_REFUND: "chip",
  ORPHAN_CHARGEBACK: "chip-red",
  MALFORMED: "chip-red",
  UNPAID_INVOICE: "chip-amber",
};

export function CatChip({ cat }: { cat: string }) {
  return <span className={`chip ${CAT_STYLE[cat] ?? "chip"}`}>{cat}</span>;
}

function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const dur = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{format(display)}</span>;
}

// ---------------------------------------------------------------------------

export function Dial({ rate, matched, total }: { rate: number; matched: number; total: number }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const target = C * (1 - rate);
  return (
    <div className="panel relative flex items-center gap-6 p-6">
      <div className="relative h-[132px] w-[132px] shrink-0">
        <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90">
          <circle cx="66" cy="66" r={R} stroke="rgba(255,255,255,0.07)" strokeWidth="10" fill="none" />
          <motion.circle
            cx="66" cy="66" r={R} stroke="var(--lime)" strokeWidth="10" fill="none" strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: target }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="font-data text-[26px] font-semibold leading-none">
              <AnimatedNumber value={rate * 100} format={(n) => n.toFixed(1)} />
              <span className="text-[14px] text-[var(--dim)]">%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="font-data text-[10px] uppercase tracking-[0.28em] text-[var(--faint)]">bank-side match rate</div>
        <div className="mt-2 text-[15px] font-semibold leading-snug">
          <span className="text-[var(--lime)]">{matched}</span>
          <span className="text-[var(--faint)]"> / {total} payments reconciled</span>
        </div>
        <div className="mt-1 text-[12px] leading-relaxed text-[var(--dim)]">
          gateway ↔ bank loop closed. remaining items are the exception list below — honest, classified, actionable.
        </div>
      </div>
    </div>
  );
}

function PrBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] text-[var(--dim)]">{label}</span>
        <span className="font-data text-[13px] font-semibold">{pct(value)}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.07)]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export function AccuracyCard({ metrics }: { metrics: Metrics }) {
  const b = metrics.bank;
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div className="font-data text-[10px] uppercase tracking-[0.28em] text-[var(--faint)]">measured accuracy</div>
        <span className="chip chip-blue"><FlaskConical className="h-3 w-3" /> vs ground truth</span>
      </div>
      <div className="mt-4 space-y-3">
        <PrBar label="Precision — matches that were right" value={b.precision} color="var(--lime)" />
        <PrBar label="Recall — true links recovered" value={b.recall} color="var(--blue)" />
        <PrBar label="F1" value={b.f1} color="var(--teal)" />
        <PrBar label="Payment-exact — entire settlement set correct" value={b.paymentAccuracy} color="var(--amber)" />
      </div>
      <div className="font-data mt-4 border-t border-[var(--line-soft)] pt-3 text-[10.5px] leading-relaxed text-[var(--faint)]">
        {b.correctPairs}/{b.enginePairs} engine pairs correct · {b.truthPairs} true links existed ·{" "}
        {b.paymentExact}/{b.paymentTotal} payments perfect
      </div>
    </div>
  );
}

export function ThroughputCard({ stats }: { stats: Stats }) {
  return (
    <div className="panel p-5">
      <div className="font-data text-[10px] uppercase tracking-[0.28em] text-[var(--faint)]">throughput · deterministic</div>
      <div className="font-data mt-3 text-[30px] font-semibold leading-none text-[var(--text)]">
        <AnimatedNumber value={stats.throughput} format={(n) => Math.round(n).toLocaleString("en-IN")} />
        <span className="ml-1 text-[13px] text-[var(--dim)]">rec/s</span>
      </div>
      <div className="mt-3 space-y-1.5 text-[12px] text-[var(--dim)]">
        <div className="flex justify-between"><span>records closed</span><span className="font-data text-[var(--text)]">{stats.recordsTotal}</span></div>
        <div className="flex justify-between"><span>wall time</span><span className="font-data text-[var(--text)]">{stats.wallMs}ms</span></div>
        <div className="flex justify-between"><span>quarantined @ ingest</span><span className="font-data text-[var(--amber)]">{stats.quarantined}</span></div>
        <div className="flex justify-between"><span>books closed</span><span className="font-data text-[var(--text)]">{stats.invoicesMatched}/{stats.invoices}</span></div>
        <div className="flex justify-between"><span>three-way clean</span><span className="font-data text-[var(--lime)]">{stats.threeWay}</span></div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function PassesViz({ passes, total }: { passes: PassStat[]; total: number }) {
  const max = Math.max(1, ...passes.map((p) => p.matched));
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div className="font-data text-[10px] uppercase tracking-[0.28em] text-[var(--faint)]">pass cascade · strongest evidence first</div>
        <span className="chip font-data">{total} matches</span>
      </div>
      <div className="mt-4 space-y-2.5">
        {passes.map((p, i) => (
          <div key={p.key} className="group">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[12px] text-[var(--dim)] group-hover:text-[var(--text)]">{p.label}</span>
              <span className="font-data flex shrink-0 items-center gap-3 text-[11px]">
                {p.skippedAmbiguous > 0 && <span className="text-[var(--amber)]">{p.skippedAmbiguous} abstained</span>}
                <span className="text-[var(--faint)]">{p.ms}ms</span>
                <span className={p.matched > 0 ? "text-[var(--lime)]" : "text-[var(--faint)]"}>+{p.matched}</span>
              </span>
            </div>
            <div className="mt-1 h-[7px] overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    p.key === "quarantine"
                      ? "var(--red)"
                      : p.skippedAmbiguous > 0
                      ? "var(--amber)"
                      : "var(--blue)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(p.matched / max) * 100}%` }}
                transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RuleBreakdown({ rules }: { rules: Metrics["rules"] }) {
  return (
    <div className="space-y-1.5">
      {rules.map((r) => (
        <div key={r.rule} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line-soft)] px-3 py-2">
          <span className="font-data text-[11px] text-[var(--dim)]">{r.rule}</span>
          <span className="font-data text-[11px]">
            <span className="text-[var(--lime)]">{r.correct} ✓</span>
            {r.incorrect > 0 && <span className="ml-2 text-[var(--red)]">{r.incorrect} ✗</span>}
            <span className="ml-2 text-[var(--faint)]">/ {r.matched}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function CoverageMatrix({ coverage }: { coverage: { injected: number; detected: number; rows: CoverageRow[] } }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-[12px] text-[var(--dim)]">chaos-deck coverage — every injected fault, accounted for</div>
        <div className="font-data text-[13px] font-semibold">
          <span className={coverage.detected === coverage.injected ? "text-[var(--lime)]" : "text-[var(--amber)]"}>
            {coverage.detected}
          </span>
          <span className="text-[var(--faint)]">/{coverage.injected}</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {coverage.rows.map((r) => {
          const ok = r.detected === r.injected;
          return (
            <div
              key={r.tag}
              title={r.missed.length ? `missed: ${r.missed.join(", ")}` : "all handled"}
              className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 ${
                ok ? "border-[rgba(184,245,61,0.18)] bg-[rgba(184,245,61,0.05)]" : "border-[rgba(255,178,36,0.25)] bg-[rgba(255,178,36,0.07)]"
              }`}
            >
              <span className="font-data flex items-center gap-1.5 text-[10.5px] text-[var(--dim)]">
                {ok ? <Check className="h-3 w-3 text-[var(--lime)]" /> : <AlertTriangle className="h-3 w-3 text-[var(--amber)]" />}
                {r.tag}
              </span>
              <span className="font-data text-[10.5px] text-[var(--text)]">
                {r.detected}/{r.injected}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Invariants({ items }: { items: Invariant[] }) {
  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div key={i.name} className="flex items-start gap-2.5">
          {i.ok ? (
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lime)]" />
          ) : (
            <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-[var(--red)]" />
          )}
          <div>
            <div className="font-data text-[11px] font-semibold">{i.name}</div>
            <div className="text-[11px] text-[var(--faint)]">{i.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function ExceptionsTable({
  items,
  onAction,
  busy,
}: {
  items: ExceptionItem[];
  onAction: (ex: ExceptionItem, action: "ack" | "write_off" | "manual_match") => void;
  busy: number | null;
}) {
  const [open, setOpen] = useState<number | null>(null);
  if (!items.length)
    return <div className="px-5 py-12 text-center text-[13px] text-[var(--dim)]">Zero exceptions. The loop closed completely.</div>;
  return (
    <div>
      {items.map((e) => {
        const expanded = open === e.id;
        const resolved = e.status === "resolved";
        return (
          <div key={e.id} className="table-row">
            <button
              onClick={() => setOpen(expanded ? null : e.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[var(--faint)] transition-transform ${expanded ? "rotate-180" : ""}`} />
              <SevChip sev={e.severity} />
              <CatChip cat={e.category} />
              <span className="font-data min-w-0 flex-1 truncate text-[12px] text-[var(--text)]">{e.ref}</span>
              <span className="font-data hidden shrink-0 text-[12px] text-[var(--dim)] sm:block">{inr(e.amount)}</span>
              {resolved ? (
                <span className="chip chip-lime shrink-0"><Check className="h-3 w-3" /> resolved</span>
              ) : (
                <span className="chip shrink-0"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> open</span>
              )}
            </button>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 px-4 pb-4 pl-11">
                    <p className="font-data text-[12px] leading-relaxed text-[var(--text)]">{e.detail}</p>
                    {e.aiNote && (
                      <div className="flex items-start gap-2 rounded-lg border border-[rgba(77,124,254,0.25)] bg-[rgba(77,124,254,0.06)] p-3">
                        <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--blue)]" />
                        <p className="text-[12px] leading-relaxed text-[var(--dim)]">
                          <span className="font-data mr-2 text-[10px] uppercase tracking-[0.2em] text-[var(--blue)]">adjudication</span>
                          {e.aiNote}
                        </p>
                      </div>
                    )}
                    {resolved && e.resolution && (
                      <div className="font-data text-[11px] text-[var(--lime)]">↳ {e.resolution}</div>
                    )}
                    {!resolved && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button disabled={busy === e.id} onClick={() => onAction(e, "ack")} className="btn !py-1.5 !px-3 text-[11px]">
                          <Hand className="h-3 w-3" /> acknowledge
                        </button>
                        <button disabled={busy === e.id} onClick={() => onAction(e, "write_off")} className="btn !py-1.5 !px-3 text-[11px]">
                          <Undo2 className="h-3 w-3" /> write off to suspense
                        </button>
                        {e.kind === "payment" && (
                          <button disabled={busy === e.id} onClick={() => onAction(e, "manual_match")} className="btn !py-1.5 !px-3 text-[11px] !border-[rgba(184,245,61,0.4)] !text-[var(--lime)]">
                            <BadgeCheck className="h-3 w-3" /> manual match…
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------

const RULE_STYLE: Record<string, string> = {
  exact_utr_gross: "chip-lime",
  net_utr_fee: "chip-lime",
  utr_amount_tolerance: "chip-blue",
  fuzzy_ref_amount: "chip-blue",
  split_pair: "chip-blue",
  amount_date_unique: "chip-amber",
  extended_window: "chip-amber",
  books_customer_amount: "chip-teal",
  human_override: "chip-red",
};

export function MatchesTable({ items }: { items: MatchItem[] }) {
  return (
    <div>
      {items.map((m) => (
        <div key={m.id} className="table-row px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`chip ${RULE_STYLE[m.rule] ?? "chip"}`}>{m.rule}</span>
            {m.aiUsed && <span className="chip chip-blue"><Sparkles className="h-3 w-3" /> ai</span>}
            <span className="font-data text-[12px] text-[var(--text)]">{m.paymentRef ?? "—"}</span>
            <ArrowRight className="h-3 w-3 text-[var(--faint)]" />
            <span className="font-data text-[12px] text-[var(--text)]">{m.settlementRef ?? m.invoiceRef ?? "—"}</span>
            <span className="font-data ml-auto text-[11.5px] text-[var(--dim)]">
              conf <span className={m.confidence >= 0.9 ? "text-[var(--lime)]" : m.confidence >= 0.75 ? "text-[var(--blue)]" : "text-[var(--amber)]"}>{m.confidence.toFixed(2)}</span>
            </span>
          </div>
          <div className="font-data mt-1 pl-0.5 text-[11px] leading-relaxed text-[var(--faint)]">{m.explanation}</div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function RecordsTable({ kind, records }: { kind: string; records: (PaymentRec | SettlementRec | InvoiceRec)[] }) {
  return (
    <div>
      {records.map((r) => {
        if (kind === "payments") {
          const p = r as PaymentRec;
          return (
            <div key={p.id} className="table-row flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5">
              <span className="font-data w-36 text-[12px] text-[var(--text)]">{p.gatewayRef}</span>
              <span className="font-data w-40 truncate text-[11px] text-[var(--faint)]">{p.utr}</span>
              <span className="w-32 truncate text-[11.5px] text-[var(--dim)]">{p.customer}</span>
              <span className="chip !text-[9px]">{p.method}</span>
              <span className="font-data ml-auto text-[12px]">{inr(p.amountPaise)}</span>
              <span className="font-data text-[10.5px] text-[var(--faint)]">{p.day}</span>
              {p.tags.filter((t) => t !== "clean").map((t) => (
                <span key={t} className="chip chip-amber !text-[8.5px]">{t}</span>
              ))}
            </div>
          );
        }
        if (kind === "settlements") {
          const s = r as SettlementRec;
          return (
            <div key={s.id} className="table-row flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5">
              <span className="font-data w-32 text-[12px] text-[var(--text)]">{s.bankRef}</span>
              <span className="font-data w-44 truncate text-[11px] text-[var(--faint)]">{s.utrRaw ?? "—"}</span>
              <span className="font-data text-[12px]">{inr(s.amountPaise)}</span>
              <span className="font-data text-[10.5px] text-[var(--faint)]">{s.dateRaw}</span>
              <span className="font-data w-56 truncate text-[10.5px] text-[var(--faint)]">{s.narration}</span>
              <span className="ml-auto flex gap-1">
                {s.tags.map((t) => (
                  <span key={t} className="chip chip-amber !text-[8.5px]">{t}</span>
                ))}
              </span>
            </div>
          );
        }
        const v = r as InvoiceRec;
        return (
          <div key={v.id} className="table-row flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5">
            <span className="font-data w-28 text-[12px] text-[var(--text)]">{v.invoiceNo}</span>
            <span className="w-36 truncate text-[11.5px] text-[var(--dim)]">{v.customer}</span>
            <span className="font-data ml-auto text-[12px]">{inr(v.amountPaise)}</span>
            <span className="font-data text-[10.5px] text-[var(--faint)]">due {v.dueDay}</span>
            {v.tags.map((t) => (
              <span key={t} className="chip chip-amber !text-[8.5px]">{t}</span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function CashPanel({ cash }: { cash: CashPosition }) {
  const max = Math.max(1, ...cash.next7.map((d) => d.expected + d.atRisk));
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div className="font-data text-[10px] uppercase tracking-[0.28em] text-[var(--faint)]">cash position · run the cash</div>
        <Landmark className="h-4 w-4 text-[var(--blue)]" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="panel-flat p-3">
          <div className="font-data text-[9.5px] uppercase tracking-[0.2em] text-[var(--faint)]">banked</div>
          <div className="font-data mt-1 text-[19px] font-semibold text-[var(--lime)]">{inrShort(cash.banked)}</div>
        </div>
        <div className="panel-flat p-3">
          <div className="font-data text-[9.5px] uppercase tracking-[0.2em] text-[var(--faint)]">in transit</div>
          <div className="font-data mt-1 text-[19px] font-semibold text-[var(--blue)]">{inrShort(cash.inTransit)}</div>
        </div>
        <div className="panel-flat p-3">
          <div className="font-data text-[9.5px] uppercase tracking-[0.2em] text-[var(--faint)]">expected (exceptions)</div>
          <div className="font-data mt-1 text-[19px] font-semibold text-[var(--amber)]">{inrShort(cash.expectedFromExceptions)}</div>
        </div>
        <div className="panel-flat p-3">
          <div className="font-data text-[9.5px] uppercase tracking-[0.2em] text-[var(--faint)]">at risk</div>
          <div className="font-data mt-1 text-[19px] font-semibold text-[var(--red)]">{inrShort(cash.atRisk)}</div>
        </div>
      </div>
      <div className="mt-5">
        <div className="font-data text-[9.5px] uppercase tracking-[0.2em] text-[var(--faint)]">next 7 days · expected inflow</div>
        <div className="mt-3 flex h-24 items-end gap-1.5">
          {cash.next7.map((d, i) => (
            <div key={d.day} className="group flex flex-1 flex-col items-center gap-1">
              <div className="relative w-full" style={{ height: 76 }}>
                <motion.div
                  className="absolute bottom-0 w-full rounded-t-[3px]"
                  style={{ background: "rgba(77,124,254,0.55)" }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.expected / max) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05 }}
                />
                {d.atRisk > 0 && (
                  <motion.div
                    className="absolute bottom-0 w-full rounded-t-[3px]"
                    style={{ background: "rgba(255,93,93,0.65)" }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.atRisk / max) * 100}%` }}
                    transition={{ duration: 0.7, delay: i * 0.05 }}
                  />
                )}
                <div className="font-data pointer-events-none absolute -top-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-[var(--panel2)] px-1.5 py-0.5 text-[9px] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {inrShort(d.expected)}{d.atRisk > 0 ? ` · ${inrShort(d.atRisk)} risk` : ""}
                </div>
              </div>
              <span className="font-data text-[8.5px] text-[var(--faint)]">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-1 border-t border-[var(--line-soft)] pt-3 text-[11px] text-[var(--dim)]">
        <div className="flex justify-between"><span>unattributed bank money</span><span className="font-data text-[var(--amber)]">{inrShort(cash.unattributedBank)}</span></div>
        <div className="flex justify-between"><span>unpaid invoices</span><span className="font-data text-[var(--red)]">{inrShort(cash.unpaidInvoices)}</span></div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function TraceTerminal({ trace, running }: { trace: TraceLine[]; running: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [trace, running]);
  const color = (l: TraceLine["level"]) =>
    l === "ok" ? "text-[var(--lime)]" : l === "warn" ? "text-[var(--amber)]" : l === "error" ? "text-[var(--red)]" : "text-[var(--dim)]";
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-3.5 w-3.5 text-[var(--blue)]" />
          <span className="font-data text-[10px] uppercase tracking-[0.25em] text-[var(--faint)]">engine trace</span>
        </div>
        {running && <span className="chip chip-blue"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--blue)]" /> running</span>}
      </div>
      <div ref={ref} className="max-h-64 overflow-y-auto px-4 py-3">
        {trace.length === 0 && !running && <div className="font-data py-6 text-center text-[11px] text-[var(--faint)]">trace appears here after a run</div>}
        {trace.map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="font-data flex gap-3 py-[3px] text-[11px] leading-relaxed">
            <span className="shrink-0 text-[var(--faint)]">+{String(l.t).padStart(4, "0")}ms</span>
            <span className={color(l.level)}>{l.msg}</span>
          </motion.div>
        ))}
        {running && <div className="font-data mt-1 h-4 text-[11px] text-[var(--blue)]">▌</div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function AuditFeed({ audit }: { audit: AuditItem[] }) {
  return (
    <div className="space-y-2">
      {audit.map((a) => (
        <div key={a.id} className="flex items-start gap-2.5">
          <div className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full ${a.actor === "human" ? "bg-[rgba(255,178,36,0.15)]" : "bg-[rgba(77,124,254,0.15)]"}`}>
            {a.actor === "human" ? <Hand className="h-2.5 w-2.5 text-[var(--amber)]" /> : <Zap className="h-2.5 w-2.5 text-[var(--blue)]" />}
          </div>
          <div className="min-w-0">
            <div className="font-data text-[11px] text-[var(--text)]">{a.action}</div>
            <div className="font-data text-[9.5px] text-[var(--faint)]">{a.actor} · {String(a.createdAt).replace("T", " ").slice(0, 19)}</div>
          </div>
        </div>
      ))}
      {!audit.length && <div className="py-4 text-center text-[11px] text-[var(--faint)]">audit trail empty</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function StatStrip({ stats, metrics }: { stats: Stats; metrics: Metrics | null }) {
  const cards = [
    { icon: Activity, label: "exceptions open", value: `${stats.exceptionsOpen}`, sub: Object.entries(stats.exceptionsByCategory).map(([k, v]) => `${v}× ${k.toLowerCase().replace(/_/g, " ")}`).slice(0, 3).join(" · "), accent: stats.exceptionsOpen > 8 ? "var(--amber)" : "var(--lime)" },
    { icon: Gauge, label: "engine precision", value: metrics ? pct(metrics.bank.precision) : "—", sub: "every claimed match verified", accent: "var(--lime)" },
    { icon: FileSearch, label: "recall", value: metrics ? pct(metrics.bank.recall) : "—", sub: "true settlement links found", accent: "var(--blue)" },
    { icon: ShieldCheck, label: "run integrity", value: stats.invariants?.every((i) => i.ok) ? "HELD" : "DEGRADED", sub: "invariants self-checked", accent: stats.invariants?.every((i) => i.ok) ? "var(--lime)" : "var(--red)" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="panel p-4">
          <div className="flex items-center justify-between">
            <span className="font-data text-[9.5px] uppercase tracking-[0.22em] text-[var(--faint)]">{c.label}</span>
            <c.icon className="h-3.5 w-3.5" style={{ color: c.accent }} />
          </div>
          <div className="font-data mt-2 text-[22px] font-semibold leading-none" style={{ color: c.accent }}>{c.value}</div>
          <div className="mt-1.5 truncate text-[10.5px] text-[var(--faint)]">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
