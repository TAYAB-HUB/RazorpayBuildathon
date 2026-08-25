// ---------------------------------------------------------------------------
// REKON AI layer — deliberately optional.
// The matching engine is deterministic because money demands proof. AI is
// used ONLY where ambiguity is genuine: adjudication notes on exceptions and
// natural-language phrasing of answers. If no key is configured (or the call
// fails/times out) the system falls back to deterministic heuristics and
// plainly labels which mode it ran in. Secrets never leave the server.
// ---------------------------------------------------------------------------

export type AiMode = "live" | "heuristic";

export function aiAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.AI_DISABLED !== "1";
}

function config() {
  return {
    key: process.env.OPENAI_API_KEY ?? "",
    baseUrl: (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, ""),
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  };
}

async function chat(system: string, user: string, timeoutMs = 6000): Promise<string | null> {
  if (!aiAvailable()) return null;
  const { key, baseUrl, model } = config();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 220,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export interface ExceptionContext {
  category: string;
  severity: string;
  detail: string;
  kind: string;
  amountInr?: string;
  matchRate?: number;
}

/** Draft an adjudication note for an open exception. Null => caller falls back. */
export async function aiAdjudicateException(ctx: ExceptionContext): Promise<string | null> {
  const system =
    "You are the adjudication module of a finance reconciliation controller at a payments company. " +
    "Write a precise, conservative 2-3 sentence adjudication note: what likely happened, and the single safest next action. " +
    "Never guess a match for money. Use INR amounts if present. No markdown, no bullet points.";
  const user = JSON.stringify(ctx);
  return chat(system, user);
}

/** Phrase a deterministic Q&A result into a natural answer. Null => use template. */
export async function aiPhraseAnswer(question: string, resultJson: string): Promise<string | null> {
  const system =
    "You are the settlement Q&A agent of a finance controller. The user asked a question; you are given the exact computed facts. " +
    "Answer in 1-3 sentences using ONLY those facts — never invent numbers. Be crisp and operational. No markdown.";
  const user = `Question: ${question}\nFacts: ${resultJson}`;
  return chat(system, user);
}
