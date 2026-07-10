import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveAesKey(secret: string): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["decrypt"]);
}

async function decryptPayload(payload: { iv: string; data: string }): Promise<any> {
  const keyMaterial = Deno.env.get("ENCRYPTION_KEY");
  if (!keyMaterial) throw new Error("Missing ENCRYPTION_KEY in Edge Function secrets.");
  if (!payload?.iv || !payload?.data) throw new Error("Invalid encrypted payload.");

  try {
    const key = await deriveAesKey(keyMaterial);
    const iv = fromBase64(payload.iv);
    const ciphertext = fromBase64(payload.data);

    console.log("Attempting AES-GCM decryption with iv length:", iv.length, "and ciphertext length:", ciphertext.length);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    const decoded = new TextDecoder().decode(decrypted);
    console.log("Decrypted payload raw string:", decoded);
    return JSON.parse(decoded);
  } catch (err) {
    console.error("Decryption or JSON parsing failed:", err);
    throw err;
  }
}

const FALLBACK = {
  sentimentScore: 0,
  sentimentMagnitude: 0.4,
  keyThemes: [],
  positiveMentions: [],
  negativeMentions: [],
  potentialTriggers: [],
  copingMentioned: [],
  riskFlags: [],
  summary: "Unable to analyze entry right now.",
  modelVersion: "accounts/fireworks/models/qwen3p7-plus",
  analysisTimestamp: new Date().toISOString(),
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Edge function received body:", JSON.stringify(body));
    const decrypted = await decryptPayload(body?.payload);
    const content = typeof decrypted?.content === "string" ? decrypted.content : "";
    const mood = typeof decrypted?.mood === "string" ? decrypted.mood : "neutral";

    if (!content) {
      return new Response(JSON.stringify(FALLBACK), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fireworksKey = Deno.env.get("FIREWORKS_API_KEY");
    if (!fireworksKey) throw new Error("Missing FIREWORKS_API_KEY in Edge Function secrets.");

    const prompt = `Mood: ${mood}\nJournal content:\n${content}`;

    const fwResponse = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fireworksKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/qwen3p7-plus",
        max_tokens: 700,
        temperature: 0.1,
        thinking: { type: "disabled" },
        messages: [
          {
            role: "system",
            content: `You are a mental wellness journal analysis assistant.
Return ONLY valid JSON with these exact keys:
sentimentScore, sentimentMagnitude, keyThemes, positiveMentions, negativeMentions, potentialTriggers, copingMentioned, riskFlags, summary.

Rules:
- Output ONLY the final JSON object. Do not include any "Thinking Process:" headers or meta-commentary.
- sentimentScore must be a number from -1 to 1
- sentimentMagnitude must be a number from 0 to 1
- keyThemes and other list fields must be arrays of short strings
- summary must be one concise supportive sentence
- If uncertain, keep arrays empty and score near neutral`,
          },
          { role: "user", content: `/no_think Analyze this journal entry: ${prompt}` },
        ],
      }),
    });

    if (!fwResponse.ok) {
      console.error("Fireworks API error:", await fwResponse.text());
      return new Response(JSON.stringify(FALLBACK), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await fwResponse.json();
    const outputText = result?.choices?.[0]?.message?.content ?? "{}";
    let cleanedText = String(outputText).trim();

    // Clean up DeepSeek/Qwen thinking tokens if present
    cleanedText = cleanedText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // If "Thinking Process:" is in the text, strip everything up to the first open bracket '{'
    if (cleanedText.includes("Thinking Process:") || cleanedText.includes("Thinking:")) {
      const braceIndex = cleanedText.indexOf("{");
      if (braceIndex !== -1) {
        cleanedText = cleanedText.substring(braceIndex);
      }
    }

    // Extract JSON block using regex to filter out reasoning tokens/thinking process
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    console.log("Cleaned JSON text to parse:", cleanedText);
    const parsed = JSON.parse(cleanedText);

    const toStringArray = (value: any): string[] =>
      Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
    const safeScoreRaw = typeof parsed?.sentimentScore === "number" ? parsed.sentimentScore : 0;
    const safeMagRaw = typeof parsed?.sentimentMagnitude === "number" ? parsed.sentimentMagnitude : 0.4;

    const insights = {
      sentimentScore: Math.max(-1, Math.min(1, safeScoreRaw)),
      sentimentMagnitude: Math.max(0, Math.min(1, safeMagRaw)),
      keyThemes: toStringArray(parsed?.keyThemes),
      positiveMentions: toStringArray(parsed?.positiveMentions),
      negativeMentions: toStringArray(parsed?.negativeMentions),
      potentialTriggers: toStringArray(parsed?.potentialTriggers),
      copingMentioned: toStringArray(parsed?.copingMentioned),
      riskFlags: toStringArray(parsed?.riskFlags),
      summary:
        typeof parsed?.summary === "string" && parsed.summary.trim().length > 0
          ? parsed.summary.trim()
          : FALLBACK.summary,
      modelVersion: "llama-v3p1-70b-instruct",
      analysisTimestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-journal-entry error:", error);
    return new Response(JSON.stringify(FALLBACK), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});