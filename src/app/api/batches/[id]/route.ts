import { NextResponse } from "next/server";
import { db } from "@/db";
import { batches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { latestRunForBatch, countRunsForBatch } from "@/lib/runDetail";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params.id;
    const [batch] = await db.select().from(batches).where(eq(batches.id, id)).limit(1);
    if (!batch) return NextResponse.json({ error: "batch not found" }, { status: 404 });
    const latest = await latestRunForBatch(id);
    const runsCount = await countRunsForBatch(id);
    return NextResponse.json({
      batch: { id: batch.id, name: batch.name, seed: batch.seed, status: batch.status, counts: batch.counts, createdAt: batch.createdAt },
      latestRunId: latest?.id ?? null,
      runsCount,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
