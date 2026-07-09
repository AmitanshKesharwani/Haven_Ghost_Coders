// supabase/functions/analyze-face-emotion/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FALLBACK = {
  faceDetected: false,
  emotions: { joy: 0, sorrow: 0, anger: 0, surprise: 0, fear: 0, disgust: 0, neutral: 1 },
  primaryEmotion: "neutral",
  confidence: 0,
  reasoning: "Unable to analyze image right now.",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { imageBytes } = await req.json();
    if (!imageBytes || typeof imageBytes !== "string") {
      return new Response(JSON.stringify(FALLBACK), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fireworksKey = Deno.env.get("FIREWORKS_API_KEY");
    if (!fireworksKey) throw new Error("Missing FIREWORKS_API_KEY in Edge Function secrets.");

    const fwResponse = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${fireworksKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "accounts/fireworks/models/llama-v3p2-11b-vision-instruct",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze the facial emotion in this image. Return ONLY valid JSON with these exact keys:
faceDetected (boolean), emotions (object with joy, sorrow, anger, surprise, fear, disgust, neutral — each 0 to 1), primaryEmotion (string, the highest-scoring emotion), confidence (number 0 to 1), reasoning (one short sentence).
If no face is visible, set faceDetected to false and neutral to 1.`,
              },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBytes}` } },
            ],
          },
        ],
      }),
    });

    if (!fwResponse.ok) {
      console.error("Fireworks vision API error:", await fwResponse.text());
      return new Response(JSON.stringify(FALLBACK), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await fwResponse.json();
    const outputText = result?.choices?.[0]?.message?.content ?? "{}";
    const cleaned = String(outputText).replace(/^```json\s*|```\s*$/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify({ ...FALLBACK, ...parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-face-emotion error:", error);
    return new Response(JSON.stringify(FALLBACK), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});