import { NextResponse } from "next/server";
import { loadRunDetail } from "@/lib/runDetail";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params.id;
    const detail = await loadRunDetail(id);
    if (!detail) return NextResponse.json({ error: "run not found" }, { status: 404 });
    return NextResponse.json({
      run: {
        id: detail.run.id,
        batchId: detail.run.batchId,
        engineVersion: detail.run.engineVersion,
        aiMode: detail.run.aiMode,
        status: detail.run.status,
        wallMs: detail.run.wallMs,
        createdAt: detail.run.createdAt,
      },
      batch: {
        id: detail.batch.id,
        name: detail.batch.name,
        seed: detail.batch.seed,
        counts: detail.batch.counts,
      },
      stats: detail.stats,
      passes: detail.passes,
      metrics: detail.metrics,
      cash: detail.cash,
      trace: detail.trace,
      matches: detail.matches,
      exceptions: detail.exceptions,
      audit: detail.audit,
      tags: detail.tags,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
