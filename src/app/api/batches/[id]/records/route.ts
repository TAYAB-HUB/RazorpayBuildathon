import { NextResponse } from "next/server";
import { db } from "@/db";
import { batches, payments, settlements, invoices } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params.id;
    const kind = new URL(req.url).searchParams.get("kind") ?? "payments";
    const [batch] = await db.select().from(batches).where(eq(batches.id, id)).limit(1);
    if (!batch) return NextResponse.json({ error: "batch not found" }, { status: 404 });
    const tags = (batch.truth as { tags?: Record<string, string[]> } | null)?.tags ?? {};

    if (kind === "settlements") {
      const rows = await db.select().from(settlements).where(eq(settlements.batchId, id));
      return NextResponse.json({ records: rows.map((r) => ({ ...r, tags: tags[r.id] ?? [] })) });
    }
    if (kind === "invoices") {
      const rows = await db.select().from(invoices).where(eq(invoices.batchId, id));
      return NextResponse.json({ records: rows.map((r) => ({ ...r, tags: tags[r.id] ?? [] })) });
    }
    const rows = await db.select().from(payments).where(eq(payments.batchId, id));
    return NextResponse.json({ records: rows.map((r) => ({ ...r, tags: tags[r.id] ?? [] })) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
