const MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
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
    generationConfig: { maxOutputTokens, temperature: 0.4 },
  };

  let lastErr = "";
  // Retry on transient 429/503 (the free tier spikes).
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${ENDPOINT(MODEL)}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
    await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
  }
  throw new Error(`Gemini request failed: ${lastErr}`);
}
