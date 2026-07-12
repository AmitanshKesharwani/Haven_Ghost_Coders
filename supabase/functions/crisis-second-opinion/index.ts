// Supabase Edge Function: crisis-second-opinion
// Purpose: gives a second, narrow-focus AI judgment on messages the risk
// classifier scored as "ambiguous" — not clearly safe, not clearly a crisis.
// This is a brand-new, standalone function. It does not modify or depend on
// ai-companion, analyze-journal-entry, or analyze-face-emotion in any way —
// safe to deploy and test in isolation before touching any frontend code.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Same AES-256-GCM decrypt pattern as ai-companion / analyze-journal-entry ──

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

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv as BufferSource },
        key,
        ciphertext.buffer as ArrayBuffer
    );
    return JSON.parse(new TextDecoder().decode(decrypted));
}

// ── Fail-safe default: ALWAYS escalate on any error or uncertainty.        ──
// ── Better to over-escalate a false positive than silently miss a real one.──

const FAIL_SAFE_DEFAULT = {
    is_genuine_concern: true,
    reasoning: "Unable to complete analysis — defaulting to caution.",
    confidence: 0.5,
};

// ── Robust extraction: handles reasoning-model "thinking" leaks the SAME  ──
// ── way ai-companion/analyze-journal-entry had to be fixed for earlier.   ──

function extractJson(raw: string): any {
    // Strip explicit <think>...</think> blocks some models emit
    let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // Strip a "Thinking Process:" style preamble up to the first { character
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
        throw new Error("No JSON object found in model output.");
    }
    const jsonSlice = cleaned.slice(firstBrace, lastBrace + 1);
    return JSON.parse(jsonSlice);
}

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const decrypted = await decryptPayload(body?.payload);
        const text = typeof decrypted?.text === "string" ? decrypted.text.trim() : "";

        if (!text) {
            return new Response(JSON.stringify(FAIL_SAFE_DEFAULT), {
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
                max_tokens: 300,
                messages: [
                    {
                        role: "system",
                        content: `You are a crisis-triage classifier reviewing a single message from a mental wellness app user. The message was flagged as AMBIGUOUS by an automated risk classifier — not clearly safe, not clearly a crisis. Your only job is to make a judgment call.

Return ONLY valid JSON, nothing else — no explanation, no reasoning, no preamble, no markdown formatting. Wrap your ENTIRE response between <final_response> and </final_response> tags with nothing before or after those tags. Inside the tags, output ONLY this exact JSON shape:
{"is_genuine_concern": true or false, "reasoning": "one short sentence", "confidence": a number from 0 to 1}

Guidance:
- Song lyrics, dark humor, hyperbole, and casual venting are usually NOT genuine concern
- Direct or indirect expressions of hopelessness, self-harm ideation, or giving up ARE genuine concern, even if phrased casually, briefly, or as a joke
- When uncertain, lean toward is_genuine_concern: true — this is a safety-first system`,
                    },
                    { role: "user", content: text },
                ],
            }),
        });

        if (!fwResponse.ok) {
            console.error("Fireworks API error:", await fwResponse.text());
            return new Response(JSON.stringify(FAIL_SAFE_DEFAULT), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const result = await fwResponse.json();
        const rawOutput = result?.choices?.[0]?.message?.content ?? "";

        // First try the clean path: content between <final_response> tags
        const tagMatch = rawOutput.match(/<final_response>([\s\S]*?)<\/final_response>/i);
        const candidateText = tagMatch ? tagMatch[1] : rawOutput;

        let parsed: any;
        try {
            parsed = extractJson(candidateText);
        } catch (parseError) {
            console.error("Failed to parse model output as JSON. Raw output:", rawOutput);
            return new Response(JSON.stringify(FAIL_SAFE_DEFAULT), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const isGenuineConcern = typeof parsed?.is_genuine_concern === "boolean"
            ? parsed.is_genuine_concern
            : true; // fail-safe if the field is missing or malformed

        const confidence = typeof parsed?.confidence === "number"
            ? Math.max(0, Math.min(1, parsed.confidence))
            : 0.5;

        const reasoning = typeof parsed?.reasoning === "string" && parsed.reasoning.trim().length > 0
            ? parsed.reasoning.trim()
            : "No reasoning provided.";

        return new Response(JSON.stringify({
            is_genuine_concern: isGenuineConcern,
            reasoning,
            confidence,
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("crisis-second-opinion error:", error);
        return new Response(JSON.stringify(FAIL_SAFE_DEFAULT), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});