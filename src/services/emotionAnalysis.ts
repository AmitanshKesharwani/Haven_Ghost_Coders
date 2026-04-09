import { getFunctions, httpsCallable } from "firebase/functions";
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
    contextString: "Respond with general empathy and care."
  };

  try {
    const functions = getFunctions();
    const callAnalyze = httpsCallable<
      { payload: { iv: string; data: string } },
      {
        topEmotion: string;
        confidence: number;
        allEmotions: any[];
        contextString: string;
      }
    >(functions, "analyzeEmotionalContext");

    const payload = await encryptTransportPayload({ text });
    const result = await callAnalyze({ payload });
    if (!result?.data) return fallback;
    return result.data;
  } catch {
    return fallback;
  }
}
