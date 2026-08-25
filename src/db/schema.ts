import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  serial,
  jsonb,
} from "drizzle-orm/pg-core";

/**
 * REKON — Autonomous Finance Controller
 * A batch is a synthetic finance-ops workload: gateway payments, a raw bank
 * settlement feed and the internal books (invoices). Ground truth is stored
 * on the batch (hidden from the engine) so every run can be *measured*.
 */
export const batches = pgTable("batches", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  seed: text("seed").notNull(),
  status: text("status").notNull().default("generated"), // generated | reconciled
  counts: jsonb("counts").$type<{
    payments: number;
    settlements: number;
    invoices: number;
  }>(),
  // Ground truth — never read by the matching engine, only by the scorer.
  truth: jsonb("truth").$type<{
    bankLinks: Record<string, string[] | null>; // paymentId -> settlementIds
    bookLinks: Record<string, string | null>; // invoiceId -> paymentId
    tags: Record<string, string[]>; // recordId -> corruption tags
  }>(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  gatewayRef: text("gateway_ref").notNull(), // pay_XXXX
  utr: text("utr").notNull(), // bank trace number issued by gateway
  customer: text("customer").notNull(),
  method: text("method").notNull(), // upi | card | netbanking | wallet
  amountPaise: integer("amount_paise").notNull(),
  feePaise: integer("fee_paise").notNull(),
  status: text("status").notNull().default("captured"),
  day: text("day").notNull(), // YYYY-MM-DD (payments are always well-formed)
});

export const settlements = pgTable("settlements", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  bankRef: text("bank_ref").notNull(),
  utrRaw: text("utr_raw"), // may be mangled / null — this is a bank feed
  amountPaise: integer("amount_paise"), // nullable + possibly negative: malformed rows exist
  dateRaw: text("date_raw").notNull(), // raw string from the bank file; may be unparseable
  narration: text("narration").notNull().default(""),
});

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  invoiceNo: text("invoice_no").notNull(),
  customer: text("customer").notNull(),
  amountPaise: integer("amount_paise").notNull(),
  dueDay: text("due_day").notNull(),
  status: text("status").notNull().default("open"),
});

export const runs = pgTable("runs", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  engineVersion: text("engine_version").notNull(),
  aiMode: text("ai_mode").notNull(), // live | heuristic
  status: text("status").notNull(), // completed | degraded
  wallMs: integer("wall_ms").notNull(),
  stats: jsonb("stats").notNull(),
  passes: jsonb("passes").notNull(),
  metrics: jsonb("metrics").notNull(),
  cash: jsonb("cash").notNull(),
  trace: jsonb("trace").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  runId: text("run_id").notNull(),
  batchId: text("batch_id").notNull(),
  paymentId: text("payment_id"),
  settlementId: text("settlement_id"),
  invoiceId: text("invoice_id"),
  rule: text("rule").notNull(),
  confidence: real("confidence").notNull(),
  explanation: text("explanation").notNull(),
  aiUsed: boolean("ai_used").notNull().default(false),
});

export const exceptions = pgTable("exceptions", {
  id: serial("id").primaryKey(),
  runId: text("run_id").notNull(),
  batchId: text("batch_id").notNull(),
  kind: text("kind").notNull(), // payment | settlement | invoice
  recordId: text("record_id").notNull(),
  category: text("category").notNull(),
  severity: text("severity").notNull(), // critical | high | medium | low
  detail: text("detail").notNull(),
  aiNote: text("ai_note"),
  status: text("status").notNull().default("open"), // open | resolved
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at", { mode: "string" }),
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  runId: text("run_id"),
  actor: text("actor").notNull(), // engine | ai | human
  action: text("action").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export type PaymentRow = typeof payments.$inferSelect;
export type SettlementRow = typeof settlements.$inferSelect;
export type InvoiceRow = typeof invoices.$inferSelect;
export type BatchRow = typeof batches.$inferSelect;
export type RunRow = typeof runs.$inferSelect;
export type MatchRow = typeof matches.$inferSelect;
export type ExceptionRow = typeof exceptions.$inferSelect;
