// Shared shapes between REKON APIs and the console UI.

export interface BatchSummary {
  id: string;
  name: string;
  seed: string;
  status?: string;
  counts?: { payments: number; settlements: number; invoices: number };
  createdAt?: string;
}

export interface Invariant {
  name: string;
  ok: boolean;
  detail: string;
}

export interface Stats {
  payments: number;
  settlements: number;
  validSettlements: number;
  quarantined: number;
  invoices: number;
  matchedPayments: number;
  partiallyMatched: number;
  matchRateBank: number;
  invoicesMatched: number;
  matchRateBooks: number;
  threeWay: number;
  exceptionsOpen: number;
  exceptionsByCategory: Record<string, number>;
  exceptionsBySeverity: Record<string, number>;
  recordsTotal: number;
  wallMs: number;
  throughput: number;
  aiMode?: string;
  aiNotes?: number;
  invariants?: Invariant[];
}

export interface PassStat {
  key: string;
  label: string;
  matched: number;
  skippedAmbiguous: number;
  ms: number;
}

export interface RuleStat {
  rule: string;
  matched: number;
  correct: number;
  incorrect: number;
}

export interface CoverageRow {
  tag: string;
  injected: number;
  detected: number;
  missed: string[];
}

export interface Metrics {
  bank: {
    truthPairs: number;
    enginePairs: number;
    correctPairs: number;
    precision: number;
    recall: number;
    f1: number;
    paymentExact: number;
    paymentTotal: number;
    paymentAccuracy: number;
  };
  books: {
    truthPairs: number;
    enginePairs: number;
    correctPairs: number;
    precision: number;
    recall: number;
    f1: number;
  };
  rules: RuleStat[];
  coverage: { injected: number; detected: number; rows: CoverageRow[] };
}

export interface DayCash {
  day: string;
  label: string;
  expected: number;
  atRisk: number;
}

export interface CashPosition {
  today: string;
  banked: number;
  inTransit: number;
  expectedFromExceptions: number;
  unattributedBank: number;
  atRisk: number;
  unpaidInvoices: number;
  next7: DayCash[];
}

export interface TraceLine {
  t: number;
  level: "info" | "warn" | "error" | "ok";
  msg: string;
}

export interface MatchItem {
  id: number;
  paymentId: string | null;
  settlementId: string | null;
  invoiceId: string | null;
  paymentRef: string | null;
  paymentAmount: number | null;
  settlementRef: string | null;
  settlementAmount: number | null;
  invoiceRef: string | null;
  rule: string;
  confidence: number;
  explanation: string;
  aiUsed: boolean;
}

export interface ExceptionItem {
  id: number;
  kind: "payment" | "settlement" | "invoice";
  recordId: string;
  ref: string;
  amount: number | null;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  detail: string;
  aiNote: string | null;
  status: string;
  resolution: string | null;
}

export interface AuditItem {
  id: number;
  actor: string;
  action: string;
  payload: unknown;
  createdAt: string;
}

export interface RunInfo {
  id: string;
  batchId: string;
  engineVersion: string;
  aiMode: string;
  status: string;
  wallMs: number;
  createdAt: string;
}

export interface RunDetailResponse {
  run: RunInfo;
  batch: BatchSummary;
  stats: Stats;
  passes: PassStat[];
  metrics: Metrics;
  cash: CashPosition;
  trace: TraceLine[];
  matches: MatchItem[];
  exceptions: ExceptionItem[];
  audit: AuditItem[];
  tags: Record<string, string[]>;
}

export interface PaymentRec {
  id: string;
  gatewayRef: string;
  utr: string;
  customer: string;
  method: string;
  amountPaise: number;
  feePaise: number;
  status: string;
  day: string;
  tags: string[];
}

export interface SettlementRec {
  id: string;
  bankRef: string;
  utrRaw: string | null;
  amountPaise: number | null;
  dateRaw: string;
  narration: string;
  tags: string[];
}

export interface InvoiceRec {
  id: string;
  invoiceNo: string;
  customer: string;
  amountPaise: number;
  dueDay: string;
  status: string;
  tags: string[];
}

export interface QaMessage {
  role: "user" | "agent";
  text: string;
  intent?: string;
  aiPhrased?: boolean;
}
