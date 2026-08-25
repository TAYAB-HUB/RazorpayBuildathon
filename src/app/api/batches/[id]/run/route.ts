import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLog, batches, exceptions, invoices, matches, payments, runs, settlements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { runEngine, scoreRun, heuristicNote, newRunId, ENGINE_VERSION } from "@/lib/engine";
import { aiAdjudicateException, aiAvailable, type AiMode } from "@/lib/ai";
import { inr } from "@/lib/util";
import type { ExceptionDraft } from "@/lib/engine";

export const dynamic = "force-dynamic";

const SEV_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export async function POST(req: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params.id;
    const body = (await req.json().catch(() => ({}))) as { useAI?: boolean };

    const [pm, sm, im, batchRows] = await Promise.all([
      db.select().from(payments).where(eq(payments.batchId, id)),
      db.select().from(settlements).where(eq(settlements.batchId, id)),
      db.select().from(invoices).where(eq(invoices.batchId, id)),
      db.select().from(batches).where(eq(batches.id, id)).limit(1),
    ]);
    const batch = batchRows[0];
    if (!batch) return NextResponse.json({ error: "batch not found" }, { status: 404 });
    if (!pm.length) return NextResponse.json({ error: "batch has no payments" }, { status: 400 });

    // ---- 1. deterministic engine closes the loop ---------------------------
    const result = runEngine({ payments: pm, settlements: sm, invoices: im });

    // ---- 2. AI only where ambiguity is genuine: adjudication notes ----------
    const useAI = body.useAI !== false;
    let aiMode: AiMode = "heuristic";
    const payMap = new Map(pm.map((p) => [p.id, p]));
    const sorted = [...result.exceptions].sort(
      (a, b) => (SEV_RANK[a.severity] ?? 4) - (SEV_RANK[b.severity] ?? 4)
    );
    const budget = sorted.slice(0, 8); // cost + latency discipline
    const notes = await Promise.all(
      budget.map(async (e: ExceptionDraft) => {
        const p = payMap.get(e.recordId);
        const live =
          useAI && aiAvailable()
            ? await aiAdjudicateException({
                category: e.category,
                severity: e.severity,
                detail: e.detail,
                kind: e.kind,
                amountInr: p ? inr(p.amountPaise) : undefined,
                matchRate: result.stats.matchRateBank,
              })
            : null;
        return { key: `${e.kind}:${e.recordId}:${e.category}`, live, fallback: heuristicNote(e) };
      })
    );
    const noteMap = new Map(notes.map((n) => [n.key, n]));
    if (notes.some((n) => n.live)) aiMode = "live";
    for (const e of result.exceptions) {
      const n = noteMap.get(`${e.kind}:${e.recordId}:${e.category}`);
      e.aiNote = n ? (n.live ?? n.fallback) : heuristicNote(e);
    }

    // ---- 3. measure honestly against hidden ground truth --------------------
    const truth = batch.truth as Parameters<typeof scoreRun>[1];
    const metrics = scoreRun(result, truth);

    // ---- 4. persist the whole close-out --------------------------------------
    const runId = newRunId();
    await db.insert(runs).values({
      id: runId,
      batchId: id,
      engineVersion: ENGINE_VERSION,
      aiMode,
      status: result.status,
      wallMs: result.stats.wallMs,
      stats: { ...result.stats, aiMode, aiNotes: notes.filter((n) => n.live).length, invariants: result.invariants },
      passes: result.passes,
      metrics,
      cash: result.cash,
      trace: result.trace,
      createdAt: new Date().toISOString(),
    });
    if (result.matches.length) {
      await db.insert(matches).values(
        result.matches.map((m) => ({
          runId,
          batchId: id,
          paymentId: m.paymentId,
          settlementId: m.settlementId,
          invoiceId: m.invoiceId,
          rule: m.rule,
          confidence: m.confidence,
          explanation: m.explanation,
          aiUsed: m.aiUsed,
        }))
      );
    }
    if (result.exceptions.length) {
      await db.insert(exceptions).values(
        result.exceptions.map((e) => ({
          runId,
          batchId: id,
          kind: e.kind,
          recordId: e.recordId,
          category: e.category,
          severity: e.severity,
          detail: e.detail,
          aiNote: e.aiNote ?? null,
          status: "open",
        }))
      );
    }
    await db.insert(auditLog).values({
      batchId: id,
      runId,
      actor: "engine",
      action: "run_completed",
      payload: {
        engineVersion: ENGINE_VERSION,
        aiMode,
        matched: result.stats.matchedPayments,
        of: result.stats.payments,
        exceptions: result.stats.exceptionsOpen,
        precision: metrics.bank.precision,
        recall: metrics.bank.recall,
        status: result.status,
        wallMs: result.stats.wallMs,
      },
      createdAt: new Date().toISOString(),
    });
    await db.update(batches).set({ status: "reconciled" }).where(eq(batches.id, id));

    return NextResponse.json({ runId, aiMode, status: result.status, stats: result.stats });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
