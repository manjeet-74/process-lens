const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS ?? 18_000);
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export interface GeminiResult {
  text: string;
  model: string;
}

export async function generateText(prompt: string, maxOutputTokens = 2048): Promise<GeminiResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set.");

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    // thinkingBudget 0 keeps the brief fast and cheap; it's a reporting task, not reasoning-heavy.
    generationConfig: { maxOutputTokens, temperature: 0.4, thinkingConfig: { thinkingBudget: 0 } },
  };

  let lastErr = "";
  // Two attempts, each bounded by a timeout so a slow upstream never hangs the UI.
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${ENDPOINT(MODEL)}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
        if (text.trim()) return { text: text.trim(), model: MODEL };
        lastErr = "Empty completion from model.";
      } else {
        lastErr = `${res.status} ${await res.text().catch(() => res.statusText)}`;
        if (res.status !== 429 && res.status !== 503) break;
      }
    } catch (e) {
      lastErr = e instanceof Error && e.name === "AbortError" ? `timeout after ${TIMEOUT_MS}ms` : String(e);
    } finally {
      clearTimeout(timer);
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Gemini request failed: ${lastErr}`);
}
