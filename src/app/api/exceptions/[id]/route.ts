import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLog, exceptions, matches, settlements } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Action = "ack" | "write_off" | "manual_match";

export async function POST(req: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params.id;
    const exId = Number(id);
    if (!Number.isFinite(exId)) return NextResponse.json({ error: "bad id" }, { status: 400 });
    const body = (await req.json().catch(() => ({}))) as {
      action?: Action;
      note?: string;
      settlementId?: string;
    };
    const action = body.action ?? "ack";
    const [ex] = await db.select().from(exceptions).where(eq(exceptions.id, exId)).limit(1);
    if (!ex) return NextResponse.json({ error: "exception not found" }, { status: 404 });

    let resolution = body.note || "acknowledged by operator";

    if (action === "manual_match") {
      if (ex.kind !== "payment" || !body.settlementId)
        return NextResponse.json({ error: "manual_match needs settlementId on a payment exception" }, { status: 400 });
      const [line] = await db
        .select()
        .from(settlements)
        .where(and(eq(settlements.id, body.settlementId), eq(settlements.batchId, ex.batchId)))
        .limit(1);
      if (!line) return NextResponse.json({ error: "settlement not in this batch" }, { status: 404 });
      const already = await db
        .select()
        .from(matches)
        .where(and(eq(matches.runId, ex.runId), eq(matches.settlementId, body.settlementId)))
        .limit(1);
      if (already.length)
        return NextResponse.json({ error: "that bank line is already matched — engine invariant protects double-spend" }, { status: 409 });
      await db.insert(matches).values({
        runId: ex.runId,
        batchId: ex.batchId,
        paymentId: ex.recordId,
        settlementId: body.settlementId,
        invoiceId: null,
        rule: "human_override",
        confidence: 1,
        explanation: `Manual override by operator: ${body.note ?? "verified against bank statement"}`,
        aiUsed: false,
      });
      resolution = `manual match to ${line.bankRef}${body.note ? ` — ${body.note}` : ""}`;
    }
    if (action === "write_off") {
      resolution = `written off to suspense${body.note ? ` — ${body.note}` : ""}`;
    }

    await db
      .update(exceptions)
      .set({ status: "resolved", resolution, resolvedAt: new Date().toISOString() })
      .where(eq(exceptions.id, exId));

    await db.insert(auditLog).values({
      batchId: ex.batchId,
      runId: ex.runId,
      actor: "human",
      action: `exception_${action}`,
      payload: { exceptionId: exId, category: ex.category, recordId: ex.recordId, resolution },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, resolution });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
