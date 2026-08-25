// ---------------------------------------------------------------------------
// REKON core utilities: seedable RNG, paise-exact formatting, date math.
// ---------------------------------------------------------------------------

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class Rng {
  private next: () => number;
  constructor(seed: string | number) {
    this.next = mulberry32(typeof seed === "number" ? seed : hashSeed(seed));
  }
  float() {
    return this.next();
  }
  int(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  chance(p: number) {
    return this.next() < p;
  }
  hex(len: number) {
    const c = "0123456789ABCDEF";
    let s = "";
    for (let i = 0; i < len; i++) s += c[Math.floor(this.next() * 16)];
    return s;
  }
  digits(len: number) {
    let s = "";
    for (let i = 0; i < len; i++) s += Math.floor(this.next() * 10);
    return s;
  }
  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

// ------------------------------ dates -------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

export function toDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(day: string, n: number): string {
  const d = new Date(day + "T00:00:00Z");
  return toDay(new Date(d.getTime() + n * DAY_MS));
}

export function dayDiff(a: string, b: string): number {
  return Math.round(
    (new Date(a + "T00:00:00Z").getTime() - new Date(b + "T00:00:00Z").getTime()) / DAY_MS
  );
}

export function today(): string {
  return toDay(new Date());
}

/** Parse a bank-feed date string. Supports ISO and DD/MM/YYYY; null if garbage. */
export function parseBankDate(raw: string): string | null {
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

// --------------------------- formatting -----------------------------------

export function inr(paise: number | null | undefined): string {
  if (paise === null || paise === undefined) return "—";
  const neg = paise < 0;
  const abs = Math.abs(paise) / 100;
  const s = abs.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 0 });
  return `${neg ? "−" : ""}₹${s}`;
}

export function inrShort(paise: number | null | undefined): string {
  if (paise === null || paise === undefined) return "—";
  const v = paise / 100;
  const abs = Math.abs(v);
  const neg = v < 0 ? "−" : "";
  if (abs >= 10000000) return `${neg}₹${(abs / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${neg}₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${neg}₹${(abs / 1000).toFixed(1)}K`;
  return `${neg}₹${abs.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function pct(x: number, digits = 1): string {
  return `${(x * 100).toFixed(digits)}%`;
}

export function compactInt(n: number): string {
  return n.toLocaleString("en-IN");
}

// --------------------------- reference similarity --------------------------

const REF_PREFIXES = /^(UTR|NEFT|IMPS|RTGS|RZP|REF|NO)+/i;

export function normalizeRef(raw: string | null | undefined): string {
  if (!raw) return "";
  let s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  s = s.replace(REF_PREFIXES, "");
  s = s.replace(/^0+/, "");
  return s;
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = new Array<number>(n + 1);
  let cur = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}

export function trigramJaccard(a: string, b: string): number {
  const grams = (s: string) => {
    const set = new Set<string>();
    const padded = `**${s}**`;
    for (let i = 0; i < padded.length - 2; i++) set.add(padded.slice(i, i + 3));
    return set;
  };
  if (!a || !b) return 0;
  const A = grams(a);
  const B = grams(b);
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return inter / (A.size + B.size - inter);
}

export function refSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const lev = levenshtein(a, b);
  const levSim = 1 - lev / Math.max(a.length, b.length);
  return Math.max(levSim, trigramJaccard(a, b));
}

export function uid(prefix: string, rng?: Rng): string {
  const r = rng ? rng.hex(10) : Math.random().toString(16).slice(2, 12).toUpperCase();
  return `${prefix}_${r}`;
}
