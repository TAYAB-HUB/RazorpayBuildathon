module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/src/app/api/qa/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$runDetail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/runDetail.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qa$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/qa.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$runDetail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$runDetail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const dynamic = "force-dynamic";
async function POST(req) {
    try {
        const body = await req.json().catch(()=>({}));
        if (!body.runId || !body.question?.trim()) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "runId and question required"
        }, {
            status: 400
        });
        const detail = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$runDetail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadRunDetail"])(body.runId);
        if (!detail) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "run not found"
        }, {
            status: 404
        });
        const stats = detail.stats;
        const metrics = detail.metrics;
        const cash = detail.cash;
        const ctx = {
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
                throughput: stats.throughput
            },
            metrics,
            cash,
            aiMode: detail.run.aiMode,
            exceptions: detail.exceptions.map((e)=>({
                    id: e.id,
                    kind: e.kind,
                    recordId: e.recordId,
                    category: e.category,
                    severity: e.severity,
                    detail: e.detail,
                    aiNote: e.aiNote,
                    status: e.status,
                    ref: e.ref,
                    amount: e.amount
                }))
        };
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qa$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["answerQuestion"])(ctx, body.question);
        // Deterministic core answered; let AI only re-phrase (never re-compute).
        let answer = result.answer;
        let aiPhrased = false;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aiAvailable"])()) {
            const phrased = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aiPhraseAnswer"])(body.question, JSON.stringify({
                answer: result.answer,
                data: result.data ?? null
            }));
            if (phrased) {
                answer = phrased;
                aiPhrased = true;
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            intent: result.intent,
            slots: result.slots,
            answer,
            aiPhrased,
            fallback: !!result.fallback
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: String(e)
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/db/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "db",
    ()=>db,
    "pool",
    ()=>pool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/node-postgres/driver.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
}
const globalForDb = globalThis;
const pool = globalForDb.__arenaNextJsPostgresqlPool ?? new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Pool"]({
    connectionString: databaseUrl
});
if ("TURBOPACK compile-time truthy", 1) {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
}
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["drizzle"])(pool);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/db/schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auditLog",
    ()=>auditLog,
    "batches",
    ()=>batches,
    "exceptions",
    ()=>exceptions,
    "invoices",
    ()=>invoices,
    "matches",
    ()=>matches,
    "payments",
    ()=>payments,
    "runs",
    ()=>runs,
    "settlements",
    ()=>settlements
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/table.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/text.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/integer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/real.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/boolean.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/timestamp.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/serial.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/jsonb.js [app-route] (ecmascript)");
;
const batches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("batches", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("name").notNull(),
    seed: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("seed").notNull(),
    status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("status").notNull().default("generated"),
    counts: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("counts").$type(),
    // Ground truth — never read by the matching engine, only by the scorer.
    truth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("truth").$type(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at", {
        mode: "string"
    }).notNull().defaultNow()
});
const payments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("payments", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    batchId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("batch_id").notNull(),
    gatewayRef: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("gateway_ref").notNull(),
    utr: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("utr").notNull(),
    customer: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("customer").notNull(),
    method: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("method").notNull(),
    amountPaise: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("amount_paise").notNull(),
    feePaise: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("fee_paise").notNull(),
    status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("status").notNull().default("captured"),
    day: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("day").notNull()
});
const settlements = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("settlements", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    batchId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("batch_id").notNull(),
    bankRef: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("bank_ref").notNull(),
    utrRaw: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("utr_raw"),
    amountPaise: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("amount_paise"),
    dateRaw: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("date_raw").notNull(),
    narration: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("narration").notNull().default("")
});
const invoices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("invoices", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    batchId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("batch_id").notNull(),
    invoiceNo: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("invoice_no").notNull(),
    customer: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("customer").notNull(),
    amountPaise: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("amount_paise").notNull(),
    dueDay: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("due_day").notNull(),
    status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("status").notNull().default("open")
});
const runs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("runs", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    batchId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("batch_id").notNull(),
    engineVersion: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("engine_version").notNull(),
    aiMode: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("ai_mode").notNull(),
    status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("status").notNull(),
    wallMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("wall_ms").notNull(),
    stats: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("stats").notNull(),
    passes: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("passes").notNull(),
    metrics: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("metrics").notNull(),
    cash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("cash").notNull(),
    trace: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("trace").notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at", {
        mode: "string"
    }).notNull().defaultNow()
});
const matches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("matches", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    runId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("run_id").notNull(),
    batchId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("batch_id").notNull(),
    paymentId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("payment_id"),
    settlementId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("settlement_id"),
    invoiceId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("invoice_id"),
    rule: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("rule").notNull(),
    confidence: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("confidence").notNull(),
    explanation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("explanation").notNull(),
    aiUsed: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("ai_used").notNull().default(false)
});
const exceptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("exceptions", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    runId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("run_id").notNull(),
    batchId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("batch_id").notNull(),
    kind: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("kind").notNull(),
    recordId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("record_id").notNull(),
    category: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("category").notNull(),
    severity: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("severity").notNull(),
    detail: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("detail").notNull(),
    aiNote: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("ai_note"),
    status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("status").notNull().default("open"),
    resolution: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("resolution"),
    resolvedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("resolved_at", {
        mode: "string"
    })
});
const auditLog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("audit_log", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    batchId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("batch_id").notNull(),
    runId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("run_id"),
    actor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("actor").notNull(),
    action: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("action").notNull(),
    payload: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("payload"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at", {
        mode: "string"
    }).notNull().defaultNow()
});
}),
"[project]/src/lib/ai.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ---------------------------------------------------------------------------
// REKON AI layer — deliberately optional.
// The matching engine is deterministic because money demands proof. AI is
// used ONLY where ambiguity is genuine: adjudication notes on exceptions and
// natural-language phrasing of answers. If no key is configured (or the call
// fails/times out) the system falls back to deterministic heuristics and
// plainly labels which mode it ran in. Secrets never leave the server.
// ---------------------------------------------------------------------------
__turbopack_context__.s([
    "aiAdjudicateException",
    ()=>aiAdjudicateException,
    "aiAvailable",
    ()=>aiAvailable,
    "aiPhraseAnswer",
    ()=>aiPhraseAnswer
]);
function aiAvailable() {
    return !!process.env.OPENAI_API_KEY && process.env.AI_DISABLED !== "1";
}
function config() {
    return {
        key: process.env.OPENAI_API_KEY ?? "",
        baseUrl: (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, ""),
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini"
    };
}
async function chat(system, user, timeoutMs = 6000) {
    if (!aiAvailable()) return null;
    const { key, baseUrl, model } = config();
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${key}`
            },
            body: JSON.stringify({
                model,
                temperature: 0.2,
                max_tokens: 220,
                messages: [
                    {
                        role: "system",
                        content: system
                    },
                    {
                        role: "user",
                        content: user
                    }
                ]
            }),
            signal: ctrl.signal
        });
        if (!res.ok) return null;
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        return text && text.length > 0 ? text : null;
    } catch  {
        return null;
    } finally{
        clearTimeout(timer);
    }
}
async function aiAdjudicateException(ctx) {
    const system = "You are the adjudication module of a finance reconciliation controller at a payments company. " + "Write a precise, conservative 2-3 sentence adjudication note: what likely happened, and the single safest next action. " + "Never guess a match for money. Use INR amounts if present. No markdown, no bullet points.";
    const user = JSON.stringify(ctx);
    return chat(system, user);
}
async function aiPhraseAnswer(question, resultJson) {
    const system = "You are the settlement Q&A agent of a finance controller. The user asked a question; you are given the exact computed facts. " + "Answer in 1-3 sentences using ONLY those facts — never invent numbers. Be crisp and operational. No markdown.";
    const user = `Question: ${question}\nFacts: ${resultJson}`;
    return chat(system, user);
}
}),
"[project]/src/lib/qa.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "answerQuestion",
    ()=>answerQuestion
]);
// ---------------------------------------------------------------------------
// Settlement Q&A agent — deterministic intent parsing over the run ledger.
// The parsed plan is returned alongside the answer so the operator can see
// exactly which query ran. Optional LLM layer only re-phrases; numbers always
// come from this deterministic core. (AI judgment: generation where it is
// safe, computation where it matters.)
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/util.ts [app-route] (ecmascript)");
;
const CATEGORY_HINTS = [
    [
        /unsettl/i,
        "UNSETTLED"
    ],
    [
        /ambig/i,
        "AMBIGUOUS"
    ],
    [
        /mismatch|short.?pay|amount/i,
        "AMOUNT_MISMATCH"
    ],
    [
        /drift|delayed|late/i,
        "DATE_DRIFT"
    ],
    [
        /duplicate|double/i,
        "DUPLICATE"
    ],
    [
        /orphan|unattributed|unknown/i,
        "ORPHAN_BANK"
    ],
    [
        /refund/i,
        "ORPHAN_REFUND"
    ],
    [
        /chargeback|dispute/i,
        "ORPHAN_CHARGEBACK"
    ],
    [
        /malformed|corrupt|garbage/i,
        "MALFORMED"
    ],
    [
        /unpaid|invoice/i,
        "UNPAID_INVOICE"
    ]
];
function answerQuestion(ctx, question) {
    const q = question.toLowerCase().trim();
    const refMatch = /(pay_[a-z0-9]+|setl-\d+|inv-\d+)/i.exec(question);
    if (refMatch) {
        const ref = refMatch[1];
        const ex = ctx.exceptions.find((e)=>e.ref?.toLowerCase() === ref.toLowerCase() || e.detail.toLowerCase().includes(ref.toLowerCase()));
        if (ex) {
            return {
                intent: "explain_record",
                slots: {
                    ref
                },
                answer: `${ref} → ${ex.category} (${ex.severity}). ${ex.detail}${ex.aiNote ? ` Adjudication note: ${ex.aiNote}` : ""} Status: ${ex.status}.`,
                data: ex
            };
        }
        return {
            intent: "explain_record",
            slots: {
                ref
            },
            answer: `${ref} is not on the exception list — it reconciled cleanly. Every clean match carries its rule and confidence in the Matches audit tab.`
        };
    }
    if (/match rate|accuracy|precision|recall|f1|how (well|accurate)/.test(q)) {
        const m = ctx.metrics?.bank;
        return {
            intent: "match_rate",
            slots: {},
            answer: `Bank-side match rate is ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pct"])(ctx.stats.matchRateBank)} (${ctx.stats.matchedPayments}/${ctx.stats.payments} payments). ` + (m ? `Measured against hidden ground truth: precision ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pct"])(m.precision)}, recall ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pct"])(m.recall)}, F1 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pct"])(m.f1)}, payment-exact ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pct"])(m.paymentAccuracy)}. ` : "") + `Books-side ${ctx.stats.invoicesMatched}/${ctx.stats.invoices} invoices closed (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pct"])(ctx.stats.matchRateBooks)}).`,
            data: {
                stats: ctx.stats,
                metrics: ctx.metrics
            }
        };
    }
    if (/cash|position|inflow|bank balance|how much|runway|expect/.test(q)) {
        return {
            intent: "cash_position",
            slots: {},
            answer: `Banked so far: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inr"])(ctx.cash.banked)}. In transit from matched settlements: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inr"])(ctx.cash.inTransit)}. ` + `Still expected from open exceptions: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inr"])(ctx.cash.expectedFromExceptions)}, with ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inr"])(ctx.cash.atRisk)} at risk ` + `(incl. ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inr"])(ctx.cash.unpaidInvoices)} unpaid invoices). Unattributed bank money: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inr"])(ctx.cash.unattributedBank)}.`,
            data: ctx.cash
        };
    }
    if (/throughput|fast|speed|performance|latency|how long/.test(q)) {
        return {
            intent: "throughput",
            slots: {},
            answer: `The engine processed ${ctx.stats.recordsTotal} records in ${ctx.stats.wallMs}ms — ${ctx.stats.throughput.toLocaleString("en-IN")} records/sec, deterministic and replayable.`,
            data: {
                wallMs: ctx.stats.wallMs,
                throughput: ctx.stats.throughput
            }
        };
    }
    if (/\bai\b|llm|model|gpt|machine learning|ml/.test(q)) {
        return {
            intent: "ai_usage",
            slots: {
                mode: ctx.aiMode
            },
            answer: `Mode: ${ctx.aiMode}. The engine itself is 100% deterministic — every match cites a rule and confidence. ` + `AI is used only for adjudication notes on ambiguous exceptions and for phrasing these answers. ` + `It never moves money and never matches records.`
        };
    }
    for (const [re, category] of CATEGORY_HINTS){
        if (re.test(q)) {
            const list = ctx.exceptions.filter((e)=>e.category === category);
            const open = list.filter((e)=>e.status === "open");
            if (!list.length) {
                return {
                    intent: "list_exceptions",
                    slots: {
                        category
                    },
                    answer: `No ${category} exceptions in this run — the engine either matched those records or none existed.`,
                    data: []
                };
            }
            const top = open.slice(0, 3).map((e)=>`${e.ref ?? e.recordId} (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inr"])(e.amount ?? null)})`);
            return {
                intent: "list_exceptions",
                slots: {
                    category
                },
                answer: `${open.length} open ${category} exception${open.length === 1 ? "" : "s"}${top.length ? ` — largest: ${top.join("; ")}` : ""}. First detail: ${open[0]?.detail ?? list[0]?.detail}`,
                data: open
            };
        }
    }
    if (/exception|stuck|failed|problem|issue|wrong|attention/.test(q)) {
        const byCat = Object.entries(ctx.stats.exceptionsByCategory).sort((a, b)=>b[1] - a[1]).map(([k, v])=>`${v}× ${k}`).join(", ");
        return {
            intent: "exceptions_summary",
            slots: {},
            answer: `${ctx.stats.exceptionsOpen} open exceptions: ${byCat}. Every one carries a deterministic detail line plus an adjudication note.`,
            data: ctx.stats.exceptionsByCategory
        };
    }
    if (/largest|biggest|top/.test(q)) {
        const open = ctx.exceptions.filter((e)=>e.status === "open" && typeof e.amount === "number").sort((a, b)=>(b.amount ?? 0) - (a.amount ?? 0)).slice(0, 5);
        if (open.length) return {
            intent: "largest_exceptions",
            slots: {},
            answer: `Largest open exposures: ${open.map((e)=>`${e.ref ?? e.recordId} ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$util$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inr"])(e.amount ?? 0)} [${e.category}]`).join("; ")}.`,
            data: open
        };
    }
    return {
        intent: "help",
        slots: {},
        fallback: true,
        answer: "I can answer over this run's ledger: try “what is the match rate?”, “cash position”, “list unsettled exceptions”, “why was pay_XXXX not matched?”, “what broke?”, or “how fast was the run?”."
    };
}
}),
"[project]/src/lib/runDetail.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "countRunsForBatch",
    ()=>countRunsForBatch,
    "latestRunForBatch",
    ()=>latestRunForBatch,
    "loadRunDetail",
    ()=>loadRunDetail
]);
// Server-side loader that assembles the full picture of a reconciliation run:
// run row + batch + joined matches and exceptions with human-readable refs.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/expressions/conditions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/expressions/select.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function loadRunDetail(runId) {
    const [run] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runs"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runs"].id, runId)).limit(1);
    if (!run) return null;
    const [batch] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["batches"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["batches"].id, run.batchId)).limit(1);
    if (!batch) return null;
    const [pm, sm, im, ms, ex, au] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["payments"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["payments"].batchId, run.batchId)),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["settlements"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["settlements"].batchId, run.batchId)),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invoices"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invoices"].batchId, run.batchId)),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].runId, runId)),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["exceptions"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["exceptions"].runId, runId)),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auditLog"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auditLog"].batchId, run.batchId)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auditLog"].id)).limit(25)
    ]);
    const payMap = new Map(pm.map((p)=>[
            p.id,
            p
        ]));
    const stlMap = new Map(sm.map((s)=>[
            s.id,
            s
        ]));
    const invMap = new Map(im.map((i)=>[
            i.id,
            i
        ]));
    const matchItems = ms.map((m)=>({
            ...m,
            paymentRef: m.paymentId ? payMap.get(m.paymentId)?.gatewayRef ?? null : null,
            paymentAmount: m.paymentId ? payMap.get(m.paymentId)?.amountPaise ?? null : null,
            settlementRef: m.settlementId ? stlMap.get(m.settlementId)?.bankRef ?? null : null,
            settlementAmount: m.settlementId ? stlMap.get(m.settlementId)?.amountPaise ?? null : null,
            invoiceRef: m.invoiceId ? invMap.get(m.invoiceId)?.invoiceNo ?? null : null
        }));
    const exceptionItems = ex.map((e)=>{
        if (e.kind === "payment") {
            const p = payMap.get(e.recordId);
            return {
                ...e,
                ref: p?.gatewayRef ?? e.recordId,
                amount: p?.amountPaise ?? null
            };
        }
        if (e.kind === "settlement") {
            const s = stlMap.get(e.recordId);
            return {
                ...e,
                ref: s?.bankRef ?? e.recordId,
                amount: s?.amountPaise ?? null
            };
        }
        const inv = invMap.get(e.recordId);
        return {
            ...e,
            ref: inv?.invoiceNo ?? e.recordId,
            amount: inv?.amountPaise ?? null
        };
    });
    exceptionItems.sort((a, b)=>{
        const rank = (s)=>({
                critical: 0,
                high: 1,
                medium: 2,
                low: 3
            })[s] ?? 4;
        const openBias = (s)=>s === "open" ? 0 : 1;
        return openBias(a.status) - openBias(b.status) || rank(a.severity) - rank(b.severity) || (b.amount ?? 0) - (a.amount ?? 0);
    });
    const truth = batch.truth ?? {
        bankLinks: {},
        bookLinks: {},
        tags: {}
    };
    return {
        run,
        batch,
        stats: run.stats,
        passes: run.passes ?? [],
        metrics: run.metrics,
        cash: run.cash,
        trace: run.trace ?? [],
        matches: matchItems,
        exceptions: exceptionItems,
        audit: au,
        tags: truth.tags ?? {}
    };
}
async function latestRunForBatch(batchId) {
    const [r] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runs"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runs"].batchId, batchId)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runs"].createdAt)).limit(1);
    return r ?? null;
}
async function countRunsForBatch(batchId) {
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runs"].id
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runs"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runs"].batchId, batchId)));
    return rows.length;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/util.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ---------------------------------------------------------------------------
// REKON core utilities: seedable RNG, paise-exact formatting, date math.
// ---------------------------------------------------------------------------
__turbopack_context__.s([
    "Rng",
    ()=>Rng,
    "addDays",
    ()=>addDays,
    "compactInt",
    ()=>compactInt,
    "dayDiff",
    ()=>dayDiff,
    "hashSeed",
    ()=>hashSeed,
    "inr",
    ()=>inr,
    "inrShort",
    ()=>inrShort,
    "levenshtein",
    ()=>levenshtein,
    "mulberry32",
    ()=>mulberry32,
    "normalizeRef",
    ()=>normalizeRef,
    "parseBankDate",
    ()=>parseBankDate,
    "pct",
    ()=>pct,
    "refSimilarity",
    ()=>refSimilarity,
    "toDay",
    ()=>toDay,
    "today",
    ()=>today,
    "trigramJaccard",
    ()=>trigramJaccard,
    "uid",
    ()=>uid
]);
function mulberry32(seed) {
    let a = seed >>> 0;
    return function() {
        a |= 0;
        a = a + 0x6d2b79f5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
function hashSeed(seed) {
    let h = 2166136261;
    for(let i = 0; i < seed.length; i++){
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
class Rng {
    next;
    constructor(seed){
        this.next = mulberry32(typeof seed === "number" ? seed : hashSeed(seed));
    }
    float() {
        return this.next();
    }
    int(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    pick(arr) {
        return arr[Math.floor(this.next() * arr.length)];
    }
    chance(p) {
        return this.next() < p;
    }
    hex(len) {
        const c = "0123456789ABCDEF";
        let s = "";
        for(let i = 0; i < len; i++)s += c[Math.floor(this.next() * 16)];
        return s;
    }
    digits(len) {
        let s = "";
        for(let i = 0; i < len; i++)s += Math.floor(this.next() * 10);
        return s;
    }
    shuffle(arr) {
        const a = [
            ...arr
        ];
        for(let i = a.length - 1; i > 0; i--){
            const j = Math.floor(this.next() * (i + 1));
            [a[i], a[j]] = [
                a[j],
                a[i]
            ];
        }
        return a;
    }
}
// ------------------------------ dates -------------------------------------
const DAY_MS = 24 * 60 * 60 * 1000;
function toDay(d) {
    return d.toISOString().slice(0, 10);
}
function addDays(day, n) {
    const d = new Date(day + "T00:00:00Z");
    return toDay(new Date(d.getTime() + n * DAY_MS));
}
function dayDiff(a, b) {
    return Math.round((new Date(a + "T00:00:00Z").getTime() - new Date(b + "T00:00:00Z").getTime()) / DAY_MS);
}
function today() {
    return toDay(new Date());
}
function parseBankDate(raw) {
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    if (iso.test(raw)) {
        const d = new Date(raw + "T00:00:00Z");
        return Number.isNaN(d.getTime()) ? null : raw;
    }
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
    if (m) {
        const [, dd, mm, yyyy] = m;
        const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
        if (Number.isNaN(d.getTime())) return null;
        const back = toDay(d);
        // reject impossible dates like 32/13/2026 that Date silently rolls over
        if (back !== `${yyyy}-${mm}-${dd}`) return null;
        return back;
    }
    return null;
}
function inr(paise) {
    if (paise === null || paise === undefined) return "—";
    const neg = paise < 0;
    const abs = Math.abs(paise) / 100;
    const s = abs.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
    });
    return `${neg ? "−" : ""}₹${s}`;
}
function inrShort(paise) {
    if (paise === null || paise === undefined) return "—";
    const v = paise / 100;
    const abs = Math.abs(v);
    const neg = v < 0 ? "−" : "";
    if (abs >= 10000000) return `${neg}₹${(abs / 10000000).toFixed(2)}Cr`;
    if (abs >= 100000) return `${neg}₹${(abs / 100000).toFixed(1)}L`;
    if (abs >= 1000) return `${neg}₹${(abs / 1000).toFixed(1)}K`;
    return `${neg}₹${abs.toLocaleString("en-IN", {
        maximumFractionDigits: 0
    })}`;
}
function pct(x, digits = 1) {
    return `${(x * 100).toFixed(digits)}%`;
}
function compactInt(n) {
    return n.toLocaleString("en-IN");
}
// --------------------------- reference similarity --------------------------
const REF_PREFIXES = /^(UTR|NEFT|IMPS|RTGS|RZP|REF|NO)+/i;
function normalizeRef(raw) {
    if (!raw) return "";
    let s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
    s = s.replace(REF_PREFIXES, "");
    s = s.replace(/^0+/, "");
    return s;
}
function levenshtein(a, b) {
    if (a === b) return 0;
    const m = a.length;
    const n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = new Array(n + 1);
    let cur = new Array(n + 1);
    for(let j = 0; j <= n; j++)prev[j] = j;
    for(let i = 1; i <= m; i++){
        cur[0] = i;
        for(let j = 1; j <= n; j++){
            cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
        [prev, cur] = [
            cur,
            prev
        ];
    }
    return prev[n];
}
function trigramJaccard(a, b) {
    const grams = (s)=>{
        const set = new Set();
        const padded = `**${s}**`;
        for(let i = 0; i < padded.length - 2; i++)set.add(padded.slice(i, i + 3));
        return set;
    };
    if (!a || !b) return 0;
    const A = grams(a);
    const B = grams(b);
    let inter = 0;
    for (const g of A)if (B.has(g)) inter++;
    return inter / (A.size + B.size - inter);
}
function refSimilarity(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    const lev = levenshtein(a, b);
    const levSim = 1 - lev / Math.max(a.length, b.length);
    return Math.max(levSim, trigramJaccard(a, b));
}
function uid(prefix, rng) {
    const r = rng ? rng.hex(10) : Math.random().toString(16).slice(2, 12).toUpperCase();
    return `${prefix}_${r}`;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1ojqgq9._.js.map