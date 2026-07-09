// supabase/functions/analyze-emotional-context/index.ts
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
  const key = await deriveAesKey(keyMaterial);
  const iv = fromBase64(payload.iv);
  const ciphertext = fromBase64(payload.data);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, ciphertext.buffer as ArrayBuffer);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

const FALLBACK = { topEmotion: "neutral", confidence: 0, allEmotions: [], contextString: "Respond with general empathy and care." };

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const decrypted = await decryptPayload(body?.payload);
    const text = typeof decrypted?.text === "string" ? decrypted.text : "";
    if (!text) {
      return new Response(JSON.stringify(FALLBACK), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const hfResponse = await fetch("https://router.huggingface.co/hf-inference/models/mental/mental-roberta-base", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("HUGGINGFACE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: text }),
    });

    if (!hfResponse.ok) {
      return new Response(JSON.stringify(FALLBACK), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await hfResponse.json();
    const allEmotions = Array.isArray(result?.[0]) ? result[0] : [];
    const top = allEmotions.sort((a: any, b: any) => b.score - a.score)[0] ?? { label: "neutral", score: 0 };

    return new Response(JSON.stringify({
      topEmotion: top.label,
      confidence: top.score,
      allEmotions,
      contextString: `User's detected emotional state: ${top.label} (confidence: ${Math.round(top.score * 100)}%)`,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("analyze-emotional-context error:", error);
    return new Response(JSON.stringify(FALLBACK), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});