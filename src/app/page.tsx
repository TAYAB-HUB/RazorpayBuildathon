"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BookOpen,
  Braces,
  Gauge,
  GitMerge,
  Landmark,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Workflow,
  XCircle,
  Zap,
  CircleCheck,
} from "lucide-react";
import type { ReactNode } from "react";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const TICKER = [
  "SETL-88213412 · ₹24,499 · UTR exact · net of card fee 2.0% · MATCHED 0.96",
  "pay_7F3A91C04E · ₹1,09,900 · fuzzy ref 91% · MATCHED 0.87",
  "SETL-88213490 · quarantined · unparseable_date 32/13/2026",
  "INV-1042 · Aarav Textiles · ₹49,900 · books closed",
  "UTR260902… · split pair sums to net · MATCHED 0.82",
  "pay_0B22E9AA11 · ₹9,999 · no bank line T+6 · EXCEPTION → UNSETTLED",
  "SETL-88213500 · twins collide on amount · engine abstained → AMBIGUOUS",
  "invariant conservation_of_bank_total · HOLDS",
];

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] bg-[var(--panel2)]">
        <GitMerge className="h-4 w-4 text-[var(--lime)]" />
      </div>
      <span className="text-[15px] font-bold tracking-[0.22em]">
        REKON<span className="text-[var(--blue)]">/</span>
      </span>
    </div>
  );
}

function SectionHead({ kicker, title, sub }: { kicker: string; title: ReactNode; sub?: string }) {
  return (
    <motion.div {...fade()} className="max-w-3xl">
      <div className="font-data text-[11px] uppercase tracking-[0.3em] text-[var(--blue)]">{kicker}</div>
      <h2 className="mt-3 text-4xl font-bold leading-[1.04] tracking-tight md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-[15px] leading-relaxed text-[var(--dim)]">{sub}</p>}
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div className="grid-bg min-h-screen">
      {/* nav */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--line-soft)] bg-[rgba(6,7,10,0.82)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Wordmark />
          <div className="hidden items-center gap-2 md:flex">
            <span className="chip">Razorpay Buildathon · 2026</span>
            <span className="chip chip-blue">AI Finance Controller</span>
          </div>
          <Link href="/console" className="btn btn-primary !py-2 text-[12.5px]">
            Open console <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="relative mx-auto max-w-6xl px-5 pt-36 pb-20 md:pt-44">
        <motion.div {...fade(0)}>
          <div className="mb-6 inline-flex items-center gap-2">
            <span className="chip chip-lime"><span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--lime)]" /> system live</span>
            <span className="chip font-data normal-case tracking-normal">engine v1.4.2-deterministic</span>
          </div>
        </motion.div>
        <div className="relative">
          <div className="pointer-events-none absolute -top-16 left-0 select-none text-[19vw] font-bold leading-none tracking-tighter hero-ghost md:-top-24 md:text-[13rem]">
            CLOSE
          </div>
          <motion.h1 {...fade(0.05)} className="relative max-w-4xl text-[52px] font-bold leading-[0.98] tracking-tight md:text-[88px]">
            Every rupee,
            <br />
            <span className="text-[var(--blue)]">accounted for.</span>
          </motion.h1>
        </div>
        <motion.p {...fade(0.12)} className="mt-7 max-w-2xl text-[16px] leading-relaxed text-[var(--dim)]">
          REKON is an autonomous finance controller that closes the reconciliation loop across
          <span className="text-[var(--text)]"> gateway, bank and books </span>
          on a full batch of messy synthetic records — then
          <span className="text-[var(--text)]"> proves its own accuracy </span>
          against hidden ground truth, and hands you the exceptions it honestly could not resolve.
        </motion.p>
        <motion.div {...fade(0.2)} className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/console" className="btn btn-primary px-6 py-3 text-sm">
            Run a reconciliation <Zap className="h-4 w-4" />
          </Link>
          <a href="#method" className="btn px-6 py-3 text-sm">
            Where AI sits — and doesn&apos;t <ScanLine className="h-4 w-4 text-[var(--dim)]" />
          </a>
        </motion.div>
        <motion.div {...fade(0.28)} className="mt-10 flex flex-wrap gap-2">
          {["8 deterministic passes", "P / R / F1 measured per run", "0 silent failures", "human-in-the-loop overrides"].map((s) => (
            <span key={s} className="chip !normal-case !tracking-normal !text-[11px]">
              <CircleCheck className="h-3 w-3 text-[var(--lime)]" /> {s}
            </span>
          ))}
        </motion.div>

        {/* ticker */}
        <motion.div {...fade(0.34)} className="panel mt-14 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--line-soft)] px-4 py-2">
            <TerminalSquare className="h-3.5 w-3.5 text-[var(--blue)]" />
            <span className="font-data text-[10.5px] uppercase tracking-[0.25em] text-[var(--faint)]">live engine trace — batch feed</span>
          </div>
          <div className="relative overflow-hidden py-3">
            <div className="animate-marquee flex w-max gap-10 whitespace-nowrap px-4">
              {[...TICKER, ...TICKER].map((t, i) => (
                <span key={i} className="font-data text-[12px] text-[var(--dim)]">
                  <span className="text-[var(--faint)]">[{String(i % 24).padStart(2, "0")}:04:11]</span> {t}
                </span>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg)] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg)] to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* problem */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHead
          kicker="The problem taste"
          title={<>The loop nobody<br />actually closed.</>}
          sub="Reconciliation, settlement and forecasting are still done by hand. Not because teams are slow — because verification capacity, not generation speed, is the 2026 bottleneck. REKON picks the least glamorous, most load-bearing loop in fintech: does the money the gateway captured equal the money the bank moved and the books recorded?"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: Zap, c: "chip-blue", title: "Gateway says captured", body: "62 payments, UTRs issued, fees scheduled. Clean, well-typed, optimistic. It believes everything will settle." },
            { icon: Landmark, c: "chip-amber", title: "Bank says… maybe", body: "A raw settlement file: mangled refs, DD/MM dates, T+8 delays, typos, duplicate credits, chargebacks, outright corrupt lines." },
            { icon: BookOpen, c: "chip-lime", title: "Books say closed", body: "Invoices marked paid in Excel, the night before the audit. The human in the middle is the integration layer." },
          ].map((x, i) => (
            <motion.div key={x.title} {...fade(0.06 * i)} className="panel p-6">
              <span className={`chip ${x.c}`}><x.icon className="h-3.5 w-3.5" /></span>
              <h3 className="mt-4 text-lg font-bold">{x.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--dim)]">{x.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* engine */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHead
          kicker="The engine"
          title={<>Eight passes.<br />Strongest evidence first.</>}
          sub="Each record flows through a cascade of deterministic rules. Every match cites its rule, its confidence and a human-readable explanation. What survives the cascade is not swept under a rug — it becomes a classified exception with a next action."
        />
        <motion.div {...fade(0.1)} className="panel mt-10 divide-y divide-[var(--line-soft)]">
          {[
            ["P0", "quarantine", "Malformed bank lines are isolated at ingest and reported — the run never crashes on corrupt data.", "chip-red"],
            ["P1", "exact_utr_gross", "UTR + exact gross. Fee billed monthly cases close instantly at 0.99.", "chip-lime"],
            ["P2", "net_utr_fee", "UTR + fee-adjusted net settlement using the published per-method fee schedule.", "chip-lime"],
            ["P3", "utr_amount_tolerance", "UTR exact, amount off by ≤ ₹8 — bank posting noise, absorbed with proof.", "chip-blue"],
            ["P4", "fuzzy_ref_amount", "Truncated or mangled references recovered by trigram + levenshtein similarity, gated on amount.", "chip-blue"],
            ["P5", "split_pair", "One settlement arriving as two bank lines — paired by exact sum within the value window.", "chip-blue"],
            ["P6", "amount_date_unique", "Amount equality within ±2d, only when the candidate is unique. Ties abstain — never guess.", "chip-amber"],
            ["P7", "extended_window", "Delayed settlements out to T+6, matched harder, flagged softer.", "chip-amber"],
            ["P8", "books", "Customer + amount, unique, joins invoices to payments for the third leg of the loop.", "chip-lime"],
          ].map(([n, name, body, chip]) => (
            <div key={n} className="group flex items-start gap-5 px-5 py-4 transition-colors hover:bg-[rgba(255,255,255,0.02)]">
              <span className="font-data pt-0.5 text-[12px] font-semibold text-[var(--faint)]">{n}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-data text-[13px] font-semibold tracking-wide text-[var(--text)]">{name}</span>
                  <span className={`chip ${chip} !text-[9px]`}>rule</span>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--dim)]">{body}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* the bar */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHead
          kicker="The bar"
          title={<>Throughput. Measured accuracy.<br />An honest exception list.</>}
          sub="One cherry-picked match proves nothing. So the batch itself is generated with hidden ground truth — injected corruptions the engine never sees — and every run reports how it actually did. Not vibes: numbers."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: Gauge, title: "Throughput, timed", body: "Full 3-source close in single-digit milliseconds at 60–200 records, wall-clock timed per pass. Trace shows where every millisecond went." },
            { icon: BadgeCheck, title: "Accuracy, measured", body: "Precision / recall / F1 against hidden ground truth, per rule, per run — plus a chaos-deck coverage matrix: every injected fault either matched or excepted. Nothing unaccounted for." },
            { icon: ShieldCheck, title: "Exceptions, honest", body: "Twins that collide, refs that don't resolve, money with no owner. Each item classified, severity-ranked, given a next action — and resolvable by a human whose override is itself audited." },
          ].map((x, i) => (
            <motion.div key={x.title} {...fade(0.06 * i)} className="panel group p-6">
              <x.icon className="h-5 w-5 text-[var(--blue)] transition-transform group-hover:scale-110" />
              <h3 className="mt-4 text-lg font-bold">{x.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--dim)]">{x.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI judgment */}
      <section id="method" className="mx-auto max-w-6xl px-5 py-20">
        <SectionHead
          kicker="AI judgment"
          title={<>Where the model sits —<br />and where it refuses to.</>}
          sub="The right tool in the right place is an architectural decision, not a prompt. Money movement is verified by rules you can replay in a courtroom. Ambiguity is where language models earn their keep."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <motion.div {...fade()} className="panel p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--lime)]" />
              <span className="chip chip-lime">uses AI</span>
            </div>
            <ul className="mt-5 space-y-4">
              {[
                ["Adjudication notes", "For the genuinely ambiguous tail — colliding twins, chargebacks without parents — the model drafts the 'what likely happened + safest next action' note an analyst would write."],
                ["Settlement Q&A phrasing", "Operators ask in plain language. A deterministic planner computes the numbers; the model only phrases them — it can never invent one."],
                ["Cost-aware fallback", "No key, timeout or error → deterministic heuristics take over and the UI says so. The loop closes either way."],
              ].map(([t, b]) => (
                <li key={t} className="flex gap-3">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lime)]" />
                  <div>
                    <div className="text-[13.5px] font-semibold">{t}</div>
                    <div className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--dim)]">{b}</div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fade(0.08)} className="panel p-6">
            <div className="flex items-center gap-2">
              <Braces className="h-4 w-4 text-[var(--red)]" />
              <span className="chip chip-red">refuses AI</span>
            </div>
            <ul className="mt-5 space-y-4">
              {[
                ["Amount equality", "₹24,499 == ₹24,499 is arithmetic. A model that is right 99.9% of the time is wrong on 60 of 60,000 records."],
                ["Reference matching", "Deterministic normalization + edit distance with an explicit threshold beats a confident hallucination — and you can unit-test it."],
                ["Pairing settlements", "Split-pair sums are a knapsack, not a vibe. Solved exactly, in microseconds, for free."],
                ["Invariant checks", "Conservation of bank totals is verified by the engine itself after every run. A run that breaks its invariants is marked DEGRADED."],
              ].map(([t, b]) => (
                <li key={t} className="flex gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--red)]" />
                  <div>
                    <div className="text-[13.5px] font-semibold">{t}</div>
                    <div className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--dim)]">{b}</div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* cta */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-28">
        <motion.div {...fade()} className="panel relative overflow-hidden p-10 text-center md:p-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_220px_at_50%_-40px,rgba(77,124,254,0.22),transparent)]" />
          <Workflow className="mx-auto h-6 w-6 text-[var(--blue)]" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            Don&apos;t take the demo&apos;s word for it.
            <br />
            <span className="text-[var(--dim)]">Look at every record.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-[var(--dim)]">
            Generate a batch, run the loop, interrogate the exceptions, ask the ledger questions,
            break the engine with a bad override and watch the invariant push back.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/console" className="btn btn-lime px-8 py-3.5 text-sm">
              Open the console <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="font-data mt-8 text-[10px] uppercase tracking-[0.3em] text-[var(--faint)]">
            banked · booked · proven
          </div>
        </motion.div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line-soft)] pt-6">
          <div className="flex items-center gap-2 text-[11px] text-[var(--faint)]">
            <Banknote className="h-3.5 w-3.5" /> REKON — built for the Razorpay Buildathon · AI Finance Controller track
          </div>
          <div className="font-data text-[10.5px] text-[var(--faint)]">deterministic core · measured honesty · human overrides</div>
        </div>
      </section>
    </div>
  );
}
