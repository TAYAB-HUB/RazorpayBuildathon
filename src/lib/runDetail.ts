// Server-side loader that assembles the full picture of a reconciliation run:
// run row + batch + joined matches and exceptions with human-readable refs.
import { db } from "@/db";
import { auditLog, batches, exceptions, invoices, matches, payments, runs, settlements } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import type {
  MatchRow,
  ExceptionRow,
  PaymentRow,
  SettlementRow,
  InvoiceRow,
  RunRow,
  BatchRow,
} from "@/db/schema";

export interface MatchItem extends MatchRow {
  paymentRef: string | null;
  paymentAmount: number | null;
  settlementRef: string | null;
  settlementAmount: number | null;
  invoiceRef: string | null;
}

export interface ExceptionItem extends ExceptionRow {
  ref: string;
  amount: number | null;
}

export interface RunDetail {
  run: RunRow;
  batch: BatchRow;
  stats: RunRow["stats"];
  passes: unknown[];
  metrics: unknown;
  cash: unknown;
  trace: unknown[];
  matches: MatchItem[];
  exceptions: ExceptionItem[];
  audit: (typeof auditLog.$inferSelect)[];
  tags: Record<string, string[]>;
}

export async function loadRunDetail(runId: string): Promise<RunDetail | null> {
  const [run] = await db.select().from(runs).where(eq(runs.id, runId)).limit(1);
  if (!run) return null;
  const [batch] = await db.select().from(batches).where(eq(batches.id, run.batchId)).limit(1);
  if (!batch) return null;

  const [pm, sm, im, ms, ex, au] = await Promise.all([
    db.select().from(payments).where(eq(payments.batchId, run.batchId)),
    db.select().from(settlements).where(eq(settlements.batchId, run.batchId)),
    db.select().from(invoices).where(eq(invoices.batchId, run.batchId)),
    db.select().from(matches).where(eq(matches.runId, runId)),
    db.select().from(exceptions).where(eq(exceptions.runId, runId)),
    db.select().from(auditLog).where(eq(auditLog.batchId, run.batchId)).orderBy(desc(auditLog.id)).limit(25),
  ]);

  const payMap = new Map<string, PaymentRow>(pm.map((p) => [p.id, p]));
  const stlMap = new Map<string, SettlementRow>(sm.map((s) => [s.id, s]));
  const invMap = new Map<string, InvoiceRow>(im.map((i) => [i.id, i]));

  const matchItems: MatchItem[] = ms.map((m) => ({
    ...m,
    paymentRef: m.paymentId ? payMap.get(m.paymentId)?.gatewayRef ?? null : null,
    paymentAmount: m.paymentId ? payMap.get(m.paymentId)?.amountPaise ?? null : null,
    settlementRef: m.settlementId ? stlMap.get(m.settlementId)?.bankRef ?? null : null,
    settlementAmount: m.settlementId ? stlMap.get(m.settlementId)?.amountPaise ?? null : null,
    invoiceRef: m.invoiceId ? invMap.get(m.invoiceId)?.invoiceNo ?? null : null,
  }));

  const exceptionItems: ExceptionItem[] = ex.map((e) => {
    if (e.kind === "payment") {
      const p = payMap.get(e.recordId);
      return { ...e, ref: p?.gatewayRef ?? e.recordId, amount: p?.amountPaise ?? null };
    }
    if (e.kind === "settlement") {
      const s = stlMap.get(e.recordId);
      return { ...e, ref: s?.bankRef ?? e.recordId, amount: s?.amountPaise ?? null };
    }
    const inv = invMap.get(e.recordId);
    return { ...e, ref: inv?.invoiceNo ?? e.recordId, amount: inv?.amountPaise ?? null };
  });

  exceptionItems.sort((a, b) => {
    const rank = (s: string) => ({ critical: 0, high: 1, medium: 2, low: 3 }[s] ?? 4);
    const openBias = (s: string) => (s === "open" ? 0 : 1);
    return openBias(a.status) - openBias(b.status) || rank(a.severity) - rank(b.severity) || (b.amount ?? 0) - (a.amount ?? 0);
  });

  const truth = (batch.truth ?? { bankLinks: {}, bookLinks: {}, tags: {} }) as {
    tags: Record<string, string[]>;
  };

  return {
    run,
    batch,
    stats: run.stats,
    passes: (run.passes as unknown[]) ?? [],
    metrics: run.metrics,
    cash: run.cash,
    trace: (run.trace as unknown[]) ?? [],
    matches: matchItems,
    exceptions: exceptionItems,
    audit: au,
    tags: truth.tags ?? {},
  };
}

export async function latestRunForBatch(batchId: string) {
  const [r] = await db.select().from(runs).where(eq(runs.batchId, batchId)).orderBy(desc(runs.createdAt)).limit(1);
  return r ?? null;
}

export async function countRunsForBatch(batchId: string): Promise<number> {
  const rows = await db.select({ id: runs.id }).from(runs).where(and(eq(runs.batchId, batchId)));
  return rows.length;
}
