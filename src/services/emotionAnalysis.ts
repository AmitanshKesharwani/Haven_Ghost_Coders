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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const httpResponse = await fetch(
      "https://api-inference.huggingface.co/models/mental/mental-roberta-base",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text }),
        signal: controller.signal
      }
    );
    clearTimeout(timeout);

    if (!httpResponse.ok) {
      return fallback;
    }

    const parsed = await httpResponse.json();
    const response = Array.isArray(parsed?.[0]) ? parsed[0] : parsed;

    if (!Array.isArray(response) || response.length === 0) {
      return fallback;
    }

    const top = response.reduce((a, b) => (a.score > b.score ? a : b));

    return {
      topEmotion: top.label,
      confidence: top.score,
      allEmotions: response,
      contextString: `User appears to be experiencing ${top.label} (${Math.round(top.score * 100)}% confidence). Respond with extra care and warmth.`
    };
  } catch {
    return fallback;
  }
}
