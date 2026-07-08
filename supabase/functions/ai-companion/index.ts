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
        model: "accounts/fireworks/models/llama-v3p1-70b-instruct",
        max_tokens: 800,
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

Response style requirements:
- Sound like a real, caring person (not clinical, not robotic)
- Use 2-4 short paragraphs, usually 120-220 words
- Reflect what the user said before giving suggestions
- Offer one gentle practical next step when appropriate
- End with one warm, specific follow-up question
- Avoid generic filler like "I'm here to help" unless contextually needed`,
          },
          { role: "user", content: userMessage },
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
    const message = result?.choices?.[0]?.message?.content ?? DEFAULT_MESSAGE;

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