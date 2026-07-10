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

  const key = await deriveAesKey(keyMaterial);
  const iv = fromBase64(payload.iv);
  const ciphertext = fromBase64(payload.data);

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

const DEFAULT_MESSAGE = "I am here for you. Can you tell me more about how you are feeling?";

/**
 * Cleans the model response:
 * 1. Removes <think>...</think> blocks (Qwen3 thinking mode)
 * 2. Strips "Para N (Label):" prefixes the model adds to paragraphs
 * 3. Removes any trailing meta-commentary lines
 */
function cleanResponse(text: string): string {
  if (!text) return DEFAULT_MESSAGE;

  let out = text;

  // Step 1: Remove <think>...</think> blocks entirely
  out = out.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Step 2: Strip paragraph label prefixes like:
  // "Para 1 (Reflect):" / "Para 1:" / "Paragraph 1 (Normalize/Validate):"
  // "P1." / "1. Reflect:" etc.
  out = out.replace(/^Para(?:graph)?\s*\d+\s*(?:\([^)]*\))?\s*[:\-–]\s*/gim, "");
  out = out.replace(/^\d+[\.\)]\s*(?:Reflect|Normalize|Validate|Suggestion|Question|Practical|Follow.?up)\s*(?:\([^)]*\))?\s*[:\-–]\s*/gim, "");

  // Step 3: Remove trailing meta-commentary that leaks after the actual reply.
  // These are lines containing analysis notes the model adds at the end.
  const metaPatterns = [
    /\n.*?so I should acknowledge.*$/gim,
    /\n.*?Constraints:.*$/gim,
    /\n.*?Para \d.*$/gim,
    /\n.*?ONLY discuss.*$/gim,
    /\n.*?NOT a therapist.*$/gim,
    /\n.*?Crisis helplines.*$/gim,
    /\n.*?just Para\d.*$/gim,
    /\n.*?Word count.*$/gim,
    /\n.*?Tone check.*$/gim,
    /\n.*?Structure check.*$/gim,
    /\n.*?Cultural.*check.*$/gim,
  ];
  for (const pattern of metaPatterns) {
    out = out.replace(pattern, "");
  }

  // Step 4: Clean up any remaining lines that are purely meta (not conversational)
  const lines = out.split("\n");
  const cleaned = lines.filter(line => {
    const t = line.trim();
    if (!t) return true; // keep empty lines for paragraph spacing
    // Drop lines that are clearly structural labels or analysis notes
    if (/^(Para|Paragraph)\s*\d/i.test(t)) return false;
    if (/\bso I should\b|\bConstraints:\b|\bNOT a therapist\b|\bCrisis helplines\b/i.test(t)) return false;
    if (/^(Word count|Tone check|Structure check|Cultural check|Review)/i.test(t)) return false;
    return true;
  });

  out = cleaned.join("\n").trim();

  // Collapse 3+ consecutive newlines to double
  out = out.replace(/\n{3,}/g, "\n\n").trim();

  return out.length > 10 ? out : DEFAULT_MESSAGE;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const decrypted = await decryptPayload(body?.payload);
    const userMessage = typeof decrypted?.userMessage === "string" ? decrypted.userMessage : "";
    const emotionContextString =
      typeof decrypted?.emotionContextString === "string"
        ? decrypted.emotionContextString
        : "Respond with general empathy and care.";

    if (!userMessage) {
      return new Response(JSON.stringify({ message: DEFAULT_MESSAGE }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fireworksKey = Deno.env.get("FIREWORKS_API_KEY");
    if (!fireworksKey) throw new Error("Missing FIREWORKS_API_KEY in Edge Function secrets.");

    const fwResponse = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fireworksKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/qwen3p7-plus",
        max_tokens: 800,
        temperature: 0.7,
        // Disable thinking mode at API level (Qwen3 supports this)
        thinking: { type: "disabled" },
        messages: [
          {
            role: "system",
            content: `You are Haven, a calm and empathetic mental wellness companion for Indian students.
You ONLY discuss stress, emotions, and mental wellness.
You are NOT a therapist and never diagnose.
If the user seems in crisis, gently suggest these Government of India helplines:
KIRAN: 1800-599-0019 (Toll-Free, 24/7),
Tele MANAS: 14416 (Toll-Free, 24/7),
NIMHANS: 08046110007 (24/7).
Respond in the same language the user writes in.

CURRENT USER EMOTIONAL STATE:
${emotionContextString}

If confidence is above 0.7 gently acknowledge the detected emotion in your response.
If below 0.7 respond with general warmth.

STRICT OUTPUT RULES — these are non-negotiable:
- Output ONLY the final reply text. Nothing else.
- Do NOT label paragraphs. No "Para 1:", "Paragraph 2 (Normalize):", "P1.", or any similar prefix.
- Do NOT output your thinking, drafting steps, word counts, tone checks, structure checks, or review notes.
- Do NOT add any meta-commentary, constraints reminders, or analysis after your reply.
- Write naturally as a caring person would speak — plain paragraphs, no labels, no structure markers.

Response style:
- Sound like a real, caring person (not clinical, not robotic)
- Use 2-4 short paragraphs, 120-220 words total
- Reflect what the user said, normalize their feeling, offer one gentle suggestion, end with a warm question
- Avoid generic filler like "I'm here to help"`,
          },
          // Add /no_think prefix to user message — Qwen3 respects this
          { role: "user", content: `/no_think ${userMessage}` },
        ],
      }),
    });

    if (!fwResponse.ok) {
      console.error("Fireworks API error:", await fwResponse.text());
      return new Response(JSON.stringify({ message: DEFAULT_MESSAGE }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await fwResponse.json();
    const raw: string = result?.choices?.[0]?.message?.content ?? DEFAULT_MESSAGE;

    const message = cleanResponse(raw);

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-companion error:", error);
    return new Response(JSON.stringify({ message: DEFAULT_MESSAGE }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
