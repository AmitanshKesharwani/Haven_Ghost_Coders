import { supabase } from "./supabaseClient";
import { encryptTransportPayload } from "./transportEncryption";

export async function analyzeEmotionalContext(text: string): Promise<{
  topEmotion: string;
  confidence: number;
  allEmotions: any[];
  contextString: string;
}> {
  const fallback = {
    topEmotion: "unknown",
    confidence: 0,
    allEmotions: [],
    contextString: "Respond with general empathy and care.",
  };

  try {
    const payload = await encryptTransportPayload({ text });
    const { data, error } = await supabase.functions.invoke("analyze-emotional-context", {
      body: { payload },
    });
    if (error || !data) return fallback;
    return data;
  } catch {
    return fallback;
  }
}
