CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY,
	"batch_id" text NOT NULL,
	"run_id" text,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batches" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"seed" text NOT NULL,
	"status" text DEFAULT 'generated' NOT NULL,
	"counts" jsonb,
	"truth" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exceptions" (
	"id" serial PRIMARY KEY,
	"run_id" text NOT NULL,
	"batch_id" text NOT NULL,
	"kind" text NOT NULL,
	"record_id" text NOT NULL,
	"category" text NOT NULL,
	"severity" text NOT NULL,
	"detail" text NOT NULL,
	"ai_note" text,
	"status" text DEFAULT 'open' NOT NULL,
	"resolution" text,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY,
	"batch_id" text NOT NULL,
	"invoice_no" text NOT NULL,
	"customer" text NOT NULL,
	"amount_paise" integer NOT NULL,
	"due_day" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY,
	"run_id" text NOT NULL,
	"batch_id" text NOT NULL,
	"payment_id" text,
	"settlement_id" text,
	"invoice_id" text,
	"rule" text NOT NULL,
	"confidence" real NOT NULL,
	"explanation" text NOT NULL,
	"ai_used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY,
	"batch_id" text NOT NULL,
	"gateway_ref" text NOT NULL,
	"utr" text NOT NULL,
	"customer" text NOT NULL,
	"method" text NOT NULL,
	"amount_paise" integer NOT NULL,
	"fee_paise" integer NOT NULL,
	"status" text DEFAULT 'captured' NOT NULL,
	"day" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" text PRIMARY KEY,
	"batch_id" text NOT NULL,
	"engine_version" text NOT NULL,
	"ai_mode" text NOT NULL,
	"status" text NOT NULL,
	"wall_ms" integer NOT NULL,
	"stats" jsonb NOT NULL,
	"passes" jsonb NOT NULL,
	"metrics" jsonb NOT NULL,
	"cash" jsonb NOT NULL,
	"trace" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settlements" (
	"id" text PRIMARY KEY,
	"batch_id" text NOT NULL,
	"bank_ref" text NOT NULL,
	"utr_raw" text,
	"amount_paise" integer,
	"date_raw" text NOT NULL,
	"narration" text DEFAULT '' NOT NULL
);
