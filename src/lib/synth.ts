// ---------------------------------------------------------------------------
// REKON synthetic batch generator.
// Produces a realistic 3-source finance workload (gateway payments, a messy
// bank settlement feed, internal invoices) PLUS hidden ground truth used only
// to score the engine afterwards. A deterministic "corruption deck" guarantees
// every batch contains the same failure modes — so accuracy is measured
// against known chaos, never cherry-picked.
// ---------------------------------------------------------------------------

import { Rng, Rng as RngType, addDays, parseBankDate, toDay, uid, today } from "./util";

export const FEE_BPS: Record<string, number> = {
  upi: 30, // 0.30%
  card: 200, // 2.00%
  netbanking: 190, // 1.90%
  wallet: 150, // 1.50%
};

export const METHODS = Object.keys(FEE_BPS);

export function expectedFee(method: string, amountPaise: number): number {
  const bps = FEE_BPS[method] ?? 0;
  return Math.round((amountPaise * bps) / 10000);
}

const CUSTOMERS = [
  "Aarav Textiles",
  "Meera Foods",
  "Zenith Motors",
  "Kaveri Crafts",
  "Nimbus Retail",
  "Orbit Electronics",
  "Saffron Logistics",
  "PixelWorks Studio",
  "Anaya Jewels",
  "Drift Coffee Co",
  "Bolt Fitness",
  "Crescent Pharma",
  "Indus Paper Mill",
  "Lotus Decor",
  "Vista Travels",
];

export interface GenPayment {
  id: string;
  batchId: string;
  gatewayRef: string;
  utr: string;
  customer: string;
  method: string;
  amountPaise: number;
  feePaise: number;
  status: string;
  day: string;
}

export interface GenSettlement {
  id: string;
  batchId: string;
  bankRef: string;
  utrRaw: string | null;
  amountPaise: number | null;
  dateRaw: string;
  narration: string;
}

export interface GenInvoice {
  id: string;
  batchId: string;
  invoiceNo: string;
  customer: string;
  amountPaise: number;
  dueDay: string;
  status: string;
}

export interface GenTruth {
  bankLinks: Record<string, string[] | null>;
  bookLinks: Record<string, string | null>;
  tags: Record<string, string[]>;
}

export interface GenBatch {
  id: string;
  name: string;
  seed: string;
  counts: { payments: number; settlements: number; invoices: number };
  truth: GenTruth;
}

export interface Generated {
  batch: GenBatch;
  payments: GenPayment[];
  settlements: GenSettlement[];
  invoices: GenInvoice[];
}

type Tag =
  | "clean"
  | "mangled_ref"
  | "amount_typo"
  | "amount_transposed"
  | "delayed_soft"
  | "delayed_hard"
  | "missing"
  | "duplicate"
  | "split"
  | "collision_a"
  | "collision_b";

function mangleUtr(utr: string, rng: RngType, heavy = false): string {
  const variants: Array<() => string> = heavy
    ? [
        () => `IB-${rng.digits(8)}`, // bank internal reference — zero resemblance
        () => utr.slice(-5), // only the tail survives
        () => "XXXX",
      ]
    : [
        () => `NEFT-${utr.toLowerCase()}`, // prefix + case
        () => `UTR: ${utr.slice(0, 6)} ${utr.slice(6)}`, // spacing
        () => `00${utr}`, // zero padding
        () => utr.slice(0, -2), // truncated
        () => {
          // transposed characters
          const i = rng.int(4, utr.length - 2);
          return utr.slice(0, i) + utr[i + 1] + utr[i] + utr.slice(i + 2);
        },
        () => utr.replace(/^UTR/, ""), // prefix stripped
      ];
  return rng.pick(variants)();
}

function dayShort(day: string): string {
  return day.slice(2).replace(/-/g, ""); // YYMMDD
}

function asBankDate(day: string, rng: RngType): string {
  // bank files are inconsistent: ~40% DD/MM/YYYY, rest ISO
  if (rng.chance(0.4)) {
    const [y, m, d] = day.split("-");
    return `${d}/${m}/${y}`;
  }
  return day;
}

export function generateBatch(seed: string, size = 60, nonce = ""): Generated {
  // same seed => same chaos (reproducible measurement); the nonce keeps ids
  // unique so a demo seed can be generated any number of times.
  const rng = new Rng(seed);
  const idRng = new Rng(`${seed}#${nonce}`);
  const batchId = uid("batch", idRng);
  const endDay = today();
  const startDay = addDays(endDay, -13);

  // ---- corruption deck: guaranteed coverage, shuffled by the seed ---------
  const scale = Math.max(1, Math.round(size / 60));
  const deck: Tag[] = [
    ...Array<Tag>(5 * scale).fill("mangled_ref"),
    ...Array<Tag>(3 * scale).fill("amount_typo"),
    ...Array<Tag>(2 * scale).fill("amount_transposed"),
    ...Array<Tag>(3 * scale).fill("delayed_soft"),
    ...Array<Tag>(2 * scale).fill("delayed_hard"),
    ...Array<Tag>(6 * scale).fill("missing"),
    ...Array<Tag>(2 * scale).fill("duplicate"),
    ...Array<Tag>(2 * scale).fill("split"),
  ];
  const shuffled = rng.shuffle(deck).slice(0, size);
  while (shuffled.length < size) shuffled.push("clean");
  // deterministically promote two clean slots into one collision twin pair
  const cleanSlots = shuffled
    .map((t, i) => (t === "clean" ? i : -1))
    .filter((i) => i >= 0);
  const posA = cleanSlots.length > 1 ? cleanSlots[rng.int(0, cleanSlots.length - 2)] : -1;
  const posB =
    posA >= 0
      ? cleanSlots.filter((i) => i !== posA)[rng.int(0, cleanSlots.length - 2)]
      : -1;

  const payments: GenPayment[] = [];
  const settlements: GenSettlement[] = [];
  const invoices: GenInvoice[] = [];
  const truth: GenTruth = { bankLinks: {}, bookLinks: {}, tags: {} };

  const tag = (id: string, t: string) => {
    truth.tags[id] = truth.tags[id] ? [...truth.tags[id], t] : [t];
  };

  let collisionAnchor: { day: string; amount: number; method: string } | null = null;

  shuffled.forEach((rawTag, i) => {
    let t: Tag = rawTag;
    if (i === posA) t = "collision_a";
    if (i === posB) t = "collision_b";

    const id = uid("pay", idRng);
    const day = addDays(startDay, rng.int(0, 12));
    let amountPaise = rng.pick([49900, 99900, 149900, 249900, 499900, 999900, 75000, 1250000, 350000, 649900]);
    amountPaise += rng.int(0, 200) * 37 + rng.int(0, 899); // paise-level entropy
    const method = rng.pick(METHODS);
    const customer = rng.pick(CUSTOMERS);
    const utr = `UTR${dayShort(day)}${rng.digits(6)}`;
    const feePaise = expectedFee(method, amountPaise);
    // fee model: 70% settle net of fees, 30% settle gross (fees billed monthly)
    const grossSettle = rng.chance(0.3);
    const settleAmount = grossSettle ? amountPaise : amountPaise - feePaise;

    payments.push({
      id,
      batchId,
      gatewayRef: `pay_${rng.hex(12)}`,
      utr,
      customer,
      method,
      amountPaise,
      feePaise,
      status: "captured",
      day,
    });
    tag(id, t);
    if (grossSettle) tag(id, "gross_settle");

    const bankRef = () => `SETL-${rng.digits(8)}`;
    const narration = (extra = "") =>
      `${rng.pick(["NEFT", "IMPS", "RTGS"])} CR RZPY PG SETTLEMENT ${dayShort(addDays(day, 1))} ${extra}`.trim();

    const pushLine = (s: Omit<GenSettlement, "id" | "batchId">, tags: string[] = []) => {
      const sid = uid("stl", idRng);
      settlements.push({ id: sid, batchId, ...s });
      tags.forEach((x) => tag(sid, x));
      return sid;
    };

    let link: string[] | null = null;

    if (t === "missing") {
      link = null;
    } else if (t === "split") {
      const a = Math.round(settleAmount * 0.6);
      const b = settleAmount - a;
      const lag = rng.int(1, 2);
      const sDay = addDays(day, lag);
      const s1 = pushLine({
        bankRef: bankRef(),
        utrRaw: `${utr}-A`,
        amountPaise: a,
        dateRaw: asBankDate(sDay, rng),
        narration: narration("PART 1"),
      });
      const s2 = pushLine({
        bankRef: bankRef(),
        utrRaw: `${utr}-B`,
        amountPaise: b,
        dateRaw: asBankDate(addDays(day, lag + rng.int(0, 1)), rng),
        narration: narration("PART 2"),
      });
      link = [s1, s2];
    } else if (t === "duplicate") {
      const sDay = addDays(day, rng.int(1, 2));
      const s1 = pushLine({
        bankRef: bankRef(),
        utrRaw: utr,
        amountPaise: settleAmount,
        dateRaw: asBankDate(sDay, rng),
        narration: narration(),
      });
      pushLine(
        {
          bankRef: bankRef(),
          utrRaw: utr,
          amountPaise: settleAmount,
          dateRaw: asBankDate(sDay, rng),
          narration: narration("RETRANSMIT"),
        },
        ["duplicate"]
      );
      link = [s1];
    } else if (t === "collision_a" || t === "collision_b") {
      if (!collisionAnchor) {
        collisionAnchor = { day, amount: amountPaise, method };
        // settlement arrives with a bank-internal reference (no resemblance)
        const s1 = pushLine({
          bankRef: bankRef(),
          utrRaw: mangleUtr(utr, rng, true),
          amountPaise: settleAmount,
          dateRaw: asBankDate(addDays(day, 1), rng),
          narration: narration(),
        });
        link = [s1];
      } else {
        // twin payment: same amount, same day, same method — but its settlement
        // never arrives. Two identical entitlements for one bank line.
        const anchor = collisionAnchor;
        const p = payments[payments.length - 1];
        p.amountPaise = anchor.amount;
        p.method = anchor.method;
        p.day = anchor.day;
        p.feePaise = expectedFee(p.method, p.amountPaise);
        collisionAnchor = null;
        link = null;
      }
    } else {
      const lag = t === "delayed_hard" ? 8 : t === "delayed_soft" ? rng.int(3, 5) : rng.int(1, 2);
      const sDay = addDays(day, lag);
      let lineAmount = settleAmount;
      let utrRaw = utr;
      if (t === "mangled_ref" || t === "delayed_hard") utrRaw = mangleUtr(utr, rng, t === "delayed_hard");
      if (t === "amount_typo") {
        const delta = rng.int(200, 700); // ±₹2–₹7 — bank posting noise
        lineAmount = rng.chance(0.5) ? settleAmount + delta : settleAmount - delta;
      }
      if (t === "amount_transposed") {
        const rs = String(Math.round(settleAmount / 100));
        const i = rng.int(1, rs.length - 1);
        const t2 = rs.slice(0, i) + rs[i + 1] + rs[i] + rs.slice(i + 2);
        lineAmount = parseInt(t2, 10) * 100;
        if (Math.abs(lineAmount - settleAmount) < 2000) lineAmount += 50000; // keep it a real gap
      }
      const s1 = pushLine(
        {
          bankRef: bankRef(),
          utrRaw,
          amountPaise: lineAmount,
          dateRaw: asBankDate(sDay, rng),
          narration: narration(t === "amount_typo" ? "CORR" : ""),
        },
        t === "mangled_ref" ? ["mangled_ref"] : []
      );
      link = [s1];
    }

    truth.bankLinks[id] = link;
  });

  // ---- bank-side junk: orphans and malformed rows (ingest robustness) -----
  const junkDay = () => addDays(startDay, rng.int(2, 13));
  const junk = [
    { kind: "refund", utrRaw: `UTR${dayShort(junkDay())}${rng.digits(6)}`, amount: -rng.int(20000, 90000), nar: "REFUND INITIATED" },
    { kind: "chargeback", utrRaw: `UTR${dayShort(junkDay())}${rng.digits(6)}`, amount: rng.int(15000, 80000), nar: "CHARGEBACK RAISED" },
    { kind: "orphan", utrRaw: `UTR${dayShort(junkDay())}${rng.digits(6)}`, amount: rng.int(10000, 120000), nar: "MISC CREDIT" },
    { kind: "malformed_neg", utrRaw: null, amount: -4499900, nar: "BATCH ADJ" },
    { kind: "malformed_date", utrRaw: `UTR${dayShort(junkDay())}${rng.digits(6)}`, amount: 520000, nar: "NEFT CR" },
    { kind: "malformed_amount", utrRaw: `UTR${dayShort(junkDay())}${rng.digits(6)}`, amount: null, nar: "IMPS CR" },
  ];
  for (const j of junk) {
    const dateRaw = j.kind === "malformed_date" ? "32/13/2026" : asBankDate(junkDay(), rng);
    let amount: number | null;
    if (j.kind === "refund" && j.amount !== null) {
      // refund rows are legitimate money-out lines; posted positive with a hint
      amount = Math.abs(j.amount);
    } else {
      amount = j.amount;
    }
    const sid = uid("stl", idRng);
    settlements.push({
      id: sid,
      batchId,
      bankRef: `SETL-${rng.digits(8)}`,
      utrRaw: j.utrRaw,
      amountPaise: amount,
      dateRaw,
      narration: j.nar,
    });
    tag(sid, j.kind);
  }

  // ---- books: invoices ------------------------------------------------------
  let invSeq = 1040 + rng.int(0, 9);
  const invoiceable = rng.shuffle(payments.filter((p) => truth.bankLinks[p.id] !== null));
  const invoiceCount = Math.round(invoiceable.length * 0.72);
  invoiceable.slice(0, invoiceCount).forEach((p) => {
    const id = uid("inv", idRng);
    invoices.push({
      id,
      batchId,
      invoiceNo: `INV-${invSeq++}`,
      customer: p.customer,
      amountPaise: p.amountPaise,
      dueDay: addDays(p.day, 7),
      status: "open",
    });
    truth.bookLinks[id] = p.id;
  });
  // two invoices that were never paid -> UNPAID_INVOICE exceptions
  for (let k = 0; k < 2; k++) {
    const id = uid("inv", idRng);
    invoices.push({
      id,
      batchId,
      invoiceNo: `INV-${invSeq++}`,
      customer: rng.pick(CUSTOMERS),
      amountPaise: rng.int(400, 9000) * 100,
      dueDay: addDays(endDay, -2),
      status: "open",
    });
    truth.bookLinks[id] = null;
    tag(id, "unpaid");
  }

  return {
    batch: {
      id: batchId,
      name: `BATCH-${endDay.replace(/-/g, "").slice(2)}·${seed.toUpperCase().slice(0, 6)}`,
      seed,
      counts: {
        payments: payments.length,
        settlements: settlements.length,
        invoices: invoices.length,
      },
      truth,
    },
    payments,
    settlements,
    invoices,
  };
}

export { parseBankDate, toDay };
