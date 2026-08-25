import { NextResponse } from "next/server";
import { loadRunDetail } from "@/lib/runDetail";
import { answerQuestion, type QaContext } from "@/lib/qa";
import { aiPhraseAnswer, aiAvailable } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { runId?: string; question?: string };
    if (!body.runId || !body.question?.trim())
      return NextResponse.json({ error: "runId and question required" }, { status: 400 });

    const detail = await loadRunDetail(body.runId);
    if (!detail) return NextResponse.json({ error: "run not found" }, { status: 404 });

    const stats = detail.stats as QaContext["stats"] & Record<string, unknown>;
    const metrics = detail.metrics as QaContext["metrics"];
    const cash = detail.cash as QaContext["cash"];

    const ctx: QaContext = {
      batchName: detail.batch.name,
      stats: {
        payments: stats.payments,
        settlements: stats.settlements,
        invoices: stats.invoices,
        matchedPayments: stats.matchedPayments,
        matchRateBank: stats.matchRateBank,
        matchRateBooks: stats.matchRateBooks,
        invoicesMatched: stats.invoicesMatched,
        exceptionsOpen: stats.exceptionsOpen,
        exceptionsByCategory: stats.exceptionsByCategory,
        recordsTotal: stats.recordsTotal,
        wallMs: stats.wallMs,
        throughput: stats.throughput,
      },
      metrics,
      cash,
      aiMode: detail.run.aiMode,
      exceptions: detail.exceptions.map((e) => ({
        id: e.id,
        kind: e.kind,
        recordId: e.recordId,
        category: e.category,
        severity: e.severity,
        detail: e.detail,
        aiNote: e.aiNote,
        status: e.status,
        ref: e.ref,
        amount: e.amount,
      })),
    };

    const result = answerQuestion(ctx, body.question);

    // Deterministic core answered; let AI only re-phrase (never re-compute).
    let answer = result.answer;
    let aiPhrased = false;
    if (aiAvailable()) {
      const phrased = await aiPhraseAnswer(body.question, JSON.stringify({ answer: result.answer, data: result.data ?? null }));
      if (phrased) {
        answer = phrased;
        aiPhrased = true;
      }
    }

    return NextResponse.json({ intent: result.intent, slots: result.slots, answer, aiPhrased, fallback: !!result.fallback });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
