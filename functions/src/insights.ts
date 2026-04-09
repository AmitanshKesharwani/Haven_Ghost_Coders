// functions/src/insights.ts
import * as functions from "firebase-functions";
import Groq from "groq-sdk";

// --- Groq Client Initialization ---
const API_KEY = process.env.GROQ_API_KEY;
let groqClient: Groq | null = null;

if (!API_KEY) {
  console.error("FATAL ERROR: GROQ_API_KEY not set in function configuration.");
} else {
  groqClient = new Groq({ apiKey: API_KEY });
}
// --- End Groq Client Initialization ---

// Interface for the data we expect from the client
interface DashboardData {
  wellnessScore: number;
  emotionalTrend: string; // 'improving', 'stable', 'declining'
  latestPhq9: number | null;
  latestGad7: number | null;
  phq9Trend: string;
  gad7Trend: string;
  recentSessionTopics: string[]; // e.g., ["family", "work stress"]
  recentJournalMoods: string[]; // e.g., ["happy", "sad", "neutral"]
  userLanguage: string; // e.g., "hi-IN", "en-IN", "mr-IN"
  userName: string;
}

export const getDashboardInsights = functions.https.onCall(async (data: DashboardData, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  if (!groqClient) {
    throw new functions.https.HttpsError("internal", "AI model is not initialized. Check API key.");
  }

  const { userLanguage } = data;

  // Determine the language for the response
  const langKey = userLanguage.split('-')[0] || 'en';
  let languageName = "English";
  switch (langKey) {
    case 'hi': languageName = "Hindi"; break;
    case 'mr': languageName = "Marathi"; break;
    case 'bn': languageName = "Bengali"; break;
    case 'ta': languageName = "Tamil"; break;
    // Add other languages as needed
    default: languageName = "English";
  }

  try {
    console.log(`Generating dashboard insight for user ${context.auth.uid} in ${languageName}`);
    const userData = data;

    const result = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: `You are a mental wellness insights 
analyst. Generate personalized dashboard insights 
based on the user data provided. Return a JSON object 
with keys: summary, highlights, recommendations, 
weeklyTrend. Return ONLY valid JSON. No extra text.`
        },
        {
          role: "user",
          content: JSON.stringify(userData)
        }
      ]
    });
    const insightsText = result.choices[0]?.message?.content ?? "{}";
    let insights: any = {};
    try {
      insights = JSON.parse(insightsText);
    } catch {
      insights = {
        summary: "Keep going, you are doing great.",
        highlights: [],
        recommendations: [],
        weeklyTrend: "stable"
      };
    }

    // Clean up the response, removing potential markdown or "Insight:" prefixes
    const cleanedInsight = String(insights.summary ?? "")
      .replace(/\"/g, '') // Remove quotes
      .replace(/\*/g, '') // Remove asterisks
      .replace(/Insight:/i, '') // Remove "Insight:" prefix
      .trim();

    return { insight: cleanedInsight };

  } catch (error: any) {
    console.error(`Error generating dashboard insight for user ${context.auth.uid}:`, error);
    
    // Handle potential safety blocks
    if (error.response && error.response.promptFeedback && error.response.promptFeedback.blockReason) {
      throw new functions.https.HttpsError("internal", "AI response blocked due to safety settings.", { reason: error.response.promptFeedback.blockReason });
    }
    
    throw new functions.https.HttpsError("internal", "Failed to generate AI insight.", { message: error.message });
  }
});