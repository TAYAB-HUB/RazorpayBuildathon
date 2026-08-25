import { NextResponse } from "next/server";
import { db } from "@/db";
import { batches, payments, settlements, invoices } from "@/db/schema";
import { generateBatch } from "@/lib/synth";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(batches).orderBy(desc(batches.createdAt)).limit(20);
    return NextResponse.json({ batches: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { seed?: string; size?: number };
    const seed = (body.seed ?? `OPS-${Math.floor(Math.random() * 900 + 100)}`).toString().slice(0, 24);
    const size = Math.min(Math.max(body.size ?? 60, 30), 200);
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const gen = generateBatch(seed, size, nonce);
    await db.insert(batches).values({
      id: gen.batch.id,
      name: gen.batch.name,
      seed: gen.batch.seed,
      status: "generated",
      counts: gen.batch.counts,
      truth: gen.batch.truth,
    });
    await db.insert(payments).values(gen.payments);
    await db.insert(settlements).values(gen.settlements);
    await db.insert(invoices).values(gen.invoices);

    return NextResponse.json({
      batch: {
        id: gen.batch.id,
        name: gen.batch.name,
        seed: gen.batch.seed,
        counts: gen.batch.counts,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
