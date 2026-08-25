"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Bot,
  Braces,
  FlaskConical,
  ListFilter,
  Loader2,
  Play,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import type {
  BatchSummary,
  ExceptionItem,
  QaMessage,
  RunDetailResponse,
  SettlementRec,
} from "@/lib/clientTypes";
import { inr } from "@/lib/util";
import {
  Wordmark,
  Dial,
  AccuracyCard,
  ThroughputCard,
  PassesViz,
  RuleBreakdown,
  CoverageMatrix,
  Invariants,
  ExceptionsTable,
  MatchesTable,
  RecordsTable,
  CashPanel,
  TraceTerminal,
  AuditFeed,
  StatStrip,
  CatChip,
  SevChip,
} from "./widgets";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `request failed (${res.status})`);
  return data;
}

type Tab = "exceptions" | "matches" | "payments" | "settlements" | "invoices";

const QA_SUGGESTIONS = [
  "what is the match rate?",
  "cash position",
  "list unsettled exceptions",
  "what broke?",
  "how fast was the run?",
  "where is the biggest exposure?",
];

export default function Console() {
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RunDetailResponse | null>(null);
  const [seed, setSeed] = useState("DEMO-42");
  const [size, setSize] = useState(60);
  const [busyBoot, setBusyBoot] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("exceptions");
  const [records, setRecords] = useState<Record<string, unknown[]>>({});
  const [resolving, setResolving] = useState<number | null>(null);
  const [matchModal, setMatchModal] = useState<ExceptionItem | null>(null);
  const [matchCandidates, setMatchCandidates] = useState<SettlementRec[]>([]);
  const [matchPick, setMatchPick] = useState<string>("");
  const [matchNote, setMatchNote] = useState("");
  const [qa, setQa] = useState<QaMessage[]>([]);
  const [qaInput, setQaInput] = useState("");
  const [qaBusy, setQaBusy] = useState(false);
  const qaScroll = useRef<HTMLDivElement>(null);

  const booted = useRef(false);

  const loadRun = useCallback(async (runId: string) => {
    const d = await api<RunDetailResponse>(`/api/runs/${runId}`);
    setDetail(d);
    setQa((prev) =>
      prev.length
        ? prev
        : [
            {
              role: "agent",
              text: `Ledger loaded for ${d.batch.name} — ${d.stats.recordsTotal} records, ${d.stats.exceptionsOpen} exceptions, ${(d.stats.matchRateBank * 100).toFixed(1)}% bank-side match. Ask me anything about this run; numbers are computed deterministically before I speak.`,
              intent: "greeting",
            },
          ]
    );
  }, []);

  const openBatch = useCallback(
    async (id: string) => {
      setBatchId(id);
      setDetail(null);
      setRecords({});
      setQa([]);
      const info = await api<{ latestRunId: string | null }>(`/api/batches/${id}`);
      if (info.latestRunId) await loadRun(info.latestRunId);
    },
    [loadRun]
  );

  const generate = useCallback(
    async (s: string, n: number, autoRun: boolean) => {
      setGenerating(true);
      setError(null);
      try {
        const { batch } = await api<{ batch: BatchSummary }>("/api/batches", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ seed: s || undefined, size: n }),
        });
        const list = await api<{ batches: BatchSummary[] }>("/api/batches");
        setBatches(list.batches);
        setBatchId(batch.id);
        setDetail(null);
        setRecords({});
        setQa([]);
        if (autoRun) {
          setRunning(true);
          const { runId } = await api<{ runId: string }>(`/api/batches/${batch.id}/run`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ useAI: true }),
          });
          await loadRun(runId);
        }
      } catch (e) {
        setError(String(e));
      } finally {
        setGenerating(false);
        setRunning(false);
      }
    },
    [loadRun]
  );

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      try {
        const list = await api<{ batches: BatchSummary[] }>("/api/batches");
        setBatches(list.batches);
        if (list.batches.length) {
          await openBatch(list.batches[0].id);
        } else {
          await generate("DEMO-42", 60, true);
        }
      } catch (e) {
        setError(String(e));
      } finally {
        setBusyBoot(false);
      }
    })();
  }, [openBatch, generate]);

  const runLoop = async () => {
    if (!batchId) return;
    setRunning(true);
    setError(null);
    setNotice(null);
    try {
      const { runId, aiMode } = await api<{ runId: string; aiMode: string }>(`/api/batches/${batchId}/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ useAI: true }),
      });
      setQa([]);
      await loadRun(runId);
      setNotice(`Loop closed — adjudication mode: ${aiMode}.`);
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  };

  // lazy record loading for the three source tabs
  useEffect(() => {
    if (!detail || tab === "exceptions" || tab === "matches") return;
    if (records[tab]) return;
    (async () => {
      try {
        const d = await api<{ records: unknown[] }>(`/api/batches/${detail.batch.id}/records?kind=${tab}`);
        setRecords((r) => ({ ...r, [tab]: d.records }));
      } catch {
        /* table stays empty */
      }
    })();
  }, [tab, detail, records]);

  const resolve = async (ex: ExceptionItem, action: "ack" | "write_off" | "manual_match") => {
    if (action === "manual_match") {
      setMatchModal(ex);
      setMatchNote("");
      setMatchPick("");
      if (!detail) return;
      const d = await api<{ records: SettlementRec[] }>(`/api/batches/${detail.batch.id}/records?kind=settlements`);
      const matchedIds = new Set(detail?.matches.map((m) => m.settlementId));
      setMatchCandidates(d.records.filter((s) => !matchedIds.has(s.id) && s.amountPaise !== null));
      return;
    }
    setResolving(ex.id);
    try {
      const r = await api<{ resolution: string }>(`/api/exceptions/${ex.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setNotice(`Resolved ${ex.ref}: ${r.resolution}`);
      if (detail) await loadRun(detail.run.id);
    } catch (e) {
      setError(String(e));
    } finally {
      setResolving(null);
    }
  };

  const confirmManualMatch = async () => {
    if (!matchModal || !matchPick) return;
    setResolving(matchModal.id);
    try {
      const r = await api<{ resolution: string }>(`/api/exceptions/${matchModal.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "manual_match", settlementId: matchPick, note: matchNote || undefined }),
      });
      setNotice(`Override accepted — ${r.resolution}`);
      setMatchModal(null);
      if (detail) await loadRun(detail.run.id);
    } catch (e) {
      setError(String(e));
    } finally {
      setResolving(null);
    }
  };

  const ask = async (q: string) => {
    if (!detail || !q.trim() || qaBusy) return;
    setQa((m) => [...m, { role: "user", text: q }]);
    setQaInput("");
    setQaBusy(true);
    try {
      const r = await api<{ answer: string; intent: string; aiPhrased: boolean }>("/api/qa", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ runId: detail.run.id, question: q }),
      });
      setQa((m) => [...m, { role: "agent", text: r.answer, intent: r.intent, aiPhrased: r.aiPhrased }]);
    } catch (e) {
      setQa((m) => [...m, { role: "agent", text: `Query failed: ${String(e)}` }]);
    } finally {
      setQaBusy(false);
      qaScroll.current?.scrollTo({ top: qaScroll.current.scrollHeight, behavior: "smooth" });
    }
  };

  const busy = generating || running || busyBoot;
  const stats = detail?.stats;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-[var(--line-soft)] bg-[rgba(6,7,10,0.88)] backdrop-blur-md">
        <div className="mx-auto flex min-h-14 max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
          <Link href="/" className="flex items-center gap-2 text-[var(--faint)] transition-colors hover:text-[var(--text)]">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <Wordmark />
          <div className="mx-1 hidden h-5 w-px bg-[var(--line)] md:block" />
          <select
            className="input font-data !py-1.5 text-[11.5px]"
            value={batchId ?? ""}
            onChange={(e) => openBatch(e.target.value)}
            disabled={!batches.length || busy}
          >
            {!batchId && <option value="">select batch…</option>}
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} · {b.counts?.payments ?? "?"} pays
              </option>
            ))}
          </select>
          <input className="input font-data w-28 !py-1.5 text-[11.5px]" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="seed" />
          <select className="input font-data !py-1.5 text-[11.5px]" value={size} onChange={(e) => setSize(Number(e.target.value))}>
            {[50, 60, 90, 120, 160].map((n) => (
              <option key={n} value={n}>{n} pays</option>
            ))}
          </select>
          <button className="btn !py-2 text-[12px]" disabled={busy} onClick={() => generate(seed, size, false)}>
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
            new batch
          </button>
          <button className="btn btn-primary !py-2 text-[12px]" disabled={busy || !batchId} onClick={runLoop}>
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            run the loop
          </button>
          <div className="ml-auto flex items-center gap-2">
            {detail && (
              <>
                <span className="chip font-data hidden !normal-case md:inline-flex">{detail.run.engineVersion}</span>
                <span className={`chip hidden md:inline-flex ${detail.run.aiMode === "live" ? "chip-lime" : ""}`}>
                  <Bot className="h-3 w-3" /> adjudication: {detail.run.aiMode}
                </span>
                <span className={`chip hidden md:inline-flex ${detail.run.status === "completed" ? "chip-lime" : "chip-red"}`}>
                  <ShieldCheck className="h-3 w-3" /> {detail.run.status}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-4 px-4 py-5">
        {/* banners */}
        <AnimatePresence>
          {(error || notice) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-[12.5px] ${
                error ? "border-[rgba(255,93,93,0.35)] bg-[rgba(255,93,93,0.08)] text-[var(--red)]" : "border-[rgba(184,245,61,0.3)] bg-[rgba(184,245,61,0.07)] text-[var(--lime)]"
              }`}
            >
              {error ? <X className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
              <span className="font-data">{error ?? notice}</span>
              <button className="ml-auto opacity-70 hover:opacity-100" onClick={() => { setError(null); setNotice(null); }}>
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* boot / empty */}
        {!detail && (
          <div className="panel grid min-h-[420px] place-items-center p-10 text-center">
            {busyBoot || generating || running ? (
              <div>
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--blue)]" />
                <div className="font-data mt-4 text-[12px] text-[var(--dim)]">
                  {generating ? "synthesizing batch with hidden ground truth…" : running ? "engine closing the loop…" : "loading console…"}
                </div>
                <div className="shimmer-line mx-auto mt-4 h-1 w-64 rounded-full bg-[rgba(255,255,255,0.06)]" />
              </div>
            ) : (
              <div className="max-w-md">
                <RefreshCcw className="mx-auto h-6 w-6 text-[var(--blue)]" />
                <h2 className="mt-4 text-xl font-bold">Generate a batch, close the loop</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--dim)]">
                  A synthetic 3-source workload — gateway payments, a messy bank settlement file and the books — with
                  injected faults and hidden ground truth. Then watch the engine reconcile it and measure itself.
                </p>
                <button className="btn btn-primary mt-6" disabled={busy} onClick={() => generate(seed || "DEMO-42", size, true)}>
                  <Zap className="h-4 w-4" /> generate + run demo
                </button>
              </div>
            )}
          </div>
        )}

        {detail && stats && (
          <>
            {/* headline row */}
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-5"><Dial rate={stats.matchRateBank} matched={stats.matchedPayments} total={stats.payments} /></div>
              <div className="lg:col-span-4"><AccuracyCard metrics={detail.metrics} /></div>
              <div className="lg:col-span-3"><ThroughputCard stats={stats} /></div>
            </div>

            <StatStrip stats={stats} metrics={detail.metrics} />

            {/* row: passes / coverage / cash */}
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-4"><PassesViz passes={detail.passes} total={detail.matches.filter((m) => m.settlementId).length} /></div>
              <div className="panel space-y-5 p-5 lg:col-span-4">
                <div className="font-data text-[10px] uppercase tracking-[0.28em] text-[var(--faint)]">failure recovery ledger</div>
                <CoverageMatrix coverage={detail.metrics.coverage} />
                <div className="border-t border-[var(--line-soft)] pt-4">
                  <div className="font-data mb-3 text-[10px] uppercase tracking-[0.28em] text-[var(--faint)]">self-check invariants</div>
                  <Invariants items={stats.invariants ?? []} />
                </div>
                <div className="border-t border-[var(--line-soft)] pt-4">
                  <div className="font-data mb-3 text-[10px] uppercase tracking-[0.28em] text-[var(--faint)]">per-rule scorecard</div>
                  <RuleBreakdown rules={detail.metrics.rules} />
                </div>
              </div>
              <div className="lg:col-span-4"><CashPanel cash={detail.cash} /></div>
            </div>

            {/* row: tabs + right rail */}
            <div className="grid items-start gap-4 lg:grid-cols-12">
              <div className="panel overflow-hidden lg:col-span-8">
                <div className="flex flex-wrap items-center gap-1 border-b border-[var(--line-soft)] px-3 py-2">
                  <ListFilter className="mx-2 h-3.5 w-3.5 text-[var(--faint)]" />
                  {(
                    [
                      ["exceptions", `exceptions (${detail.exceptions.filter((e) => e.status === "open").length})`],
                      ["matches", `match audit (${detail.matches.length})`],
                      ["payments", `payments (${stats.payments})`],
                      ["settlements", `bank feed (${stats.settlements})`],
                      ["invoices", `books (${stats.invoices})`],
                    ] as [Tab, string][]
                  ).map(([t, label]) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                        tab === t ? "bg-[var(--blue-soft)] text-[#8aabff]" : "text-[var(--dim)] hover:text-[var(--text)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  {(tab === "payments" || tab === "settlements" || tab === "invoices") && (
                    <span className="font-data ml-auto hidden pr-2 text-[9.5px] text-[var(--faint)] md:block">
                      amber chips = faults injected for measurement (engine ran blind)
                    </span>
                  )}
                </div>
                <div className="max-h-[560px] overflow-y-auto">
                  {tab === "exceptions" && (
                    <ExceptionsTable items={detail.exceptions} onAction={resolve} busy={resolving} />
                  )}
                  {tab === "matches" && <MatchesTable items={detail.matches} />}
                  {(tab === "payments" || tab === "settlements" || tab === "invoices") &&
                    (records[tab] ? (
                      <RecordsTable kind={tab} records={records[tab] as never} />
                    ) : (
                      <div className="grid place-items-center py-10"><Loader2 className="h-5 w-5 animate-spin text-[var(--blue)]" /></div>
                    ))}
                </div>
              </div>

              {/* right rail */}
              <div className="space-y-4 lg:col-span-4">
                {/* Q&A agent */}
                <div className="panel overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-[var(--lime)]" />
                      <span className="font-data text-[10px] uppercase tracking-[0.25em] text-[var(--faint)]">settlement q&a agent</span>
                    </div>
                    <span className="chip !text-[9px]">deterministic core{detail.run.aiMode === "live" ? " + ai phrasing" : ""}</span>
                  </div>
                  <div ref={qaScroll} className="max-h-72 space-y-3 overflow-y-auto px-4 py-3">
                    {qa.map((m, i) => (
                      <div key={i} className={m.role === "user" ? "text-right" : ""}>
                        <div
                          className={`inline-block max-w-[95%] rounded-xl px-3.5 py-2.5 text-left text-[12.5px] leading-relaxed ${
                            m.role === "user"
                              ? "bg-[var(--blue-soft)] text-[#c9d8ff]"
                              : "border border-[var(--line-soft)] bg-[rgba(255,255,255,0.025)] text-[var(--text)]"
                          }`}
                        >
                          {m.text}
                          {m.intent && m.role === "agent" && (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <span className="chip !text-[8px]"><Braces className="h-2.5 w-2.5" /> {m.intent}</span>
                              {m.aiPhrased && <span className="chip chip-lime !text-[8px]"><Sparkles className="h-2.5 w-2.5" /> phrased by ai</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {qaBusy && <div className="font-data text-[11px] text-[var(--faint)]">computing from ledger…</div>}
                  </div>
                  <div className="border-t border-[var(--line-soft)] px-3 py-2.5">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {QA_SUGGESTIONS.map((s) => (
                        <button key={s} onClick={() => ask(s)} className="chip !normal-case !tracking-normal transition-colors hover:border-[rgba(77,124,254,0.5)] hover:text-[#8aabff]">
                          {s}
                        </button>
                      ))}
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        ask(qaInput);
                      }}
                      className="flex gap-2"
                    >
                      <input
                        className="input flex-1 !py-2 text-[12px]"
                        placeholder="ask the ledger… e.g. why was pay_XXXX not matched?"
                        value={qaInput}
                        onChange={(e) => setQaInput(e.target.value)}
                      />
                      <button className="btn btn-primary !px-3 !py-2" disabled={qaBusy}>
                        <Play className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </div>

                <TraceTerminal trace={detail.trace} running={running} />

                <div className="panel p-5">
                  <div className="font-data mb-3 text-[10px] uppercase tracking-[0.28em] text-[var(--faint)]">audit trail · append-only</div>
                  <AuditFeed audit={detail.audit} />
                </div>
              </div>
            </div>

            <div className="pb-10 text-center">
              <span className="font-data text-[10px] uppercase tracking-[0.3em] text-[var(--faint)]">
                ground truth hidden from engine · precision/recall computed post-run · overrides audited
              </span>
            </div>
          </>
        )}
      </main>

      {/* manual match modal */}
      <AnimatePresence>
        {matchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-[rgba(4,5,7,0.78)] p-4 backdrop-blur-sm"
            onClick={() => setMatchModal(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="panel w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <SevChip sev={matchModal.severity} />
                    <CatChip cat={matchModal.category} />
                  </div>
                  <h3 className="mt-2 text-lg font-bold">Manual override — {matchModal.ref}</h3>
                  <p className="font-data mt-1 text-[11.5px] leading-relaxed text-[var(--dim)]">{matchModal.detail}</p>
                </div>
                <button onClick={() => setMatchModal(null)} className="text-[var(--faint)] hover:text-[var(--text)]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5">
                <div className="font-data mb-2 text-[10px] uppercase tracking-[0.24em] text-[var(--faint)]">
                  eligible unmatched bank lines ({matchCandidates.length})
                </div>
                <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
                  {matchCandidates.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setMatchPick(s.id)}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        matchPick === s.id ? "border-[var(--lime)] bg-[var(--lime-soft)]" : "border-[var(--line-soft)] hover:border-[var(--line)]"
                      }`}
                    >
                      <div>
                        <div className="font-data text-[12px] text-[var(--text)]">{s.bankRef}</div>
                        <div className="font-data text-[10px] text-[var(--faint)]">{s.utrRaw ?? "no ref"} · {s.dateRaw}</div>
                      </div>
                      <span className="font-data text-[13px] text-[var(--lime)]">{inr(s.amountPaise)}</span>
                    </button>
                  ))}
                  {!matchCandidates.length && (
                    <div className="py-6 text-center text-[12px] text-[var(--faint)]">No unmatched bank lines left in this batch.</div>
                  )}
                </div>
              </div>
              <input
                className="input mt-4 w-full text-[12px]"
                placeholder="operator note (e.g. verified against statement #4482)"
                value={matchNote}
                onChange={(e) => setMatchNote(e.target.value)}
              />
              <div className="mt-5 flex justify-end gap-2">
                <button className="btn text-[12px]" onClick={() => setMatchModal(null)}>cancel</button>
                <button className="btn btn-lime text-[12px]" disabled={!matchPick || resolving === matchModal.id} onClick={confirmManualMatch}>
                  {resolving === matchModal.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BadgeCheck className="h-3.5 w-3.5" />}
                  commit override to audit trail
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
