// import { onDocumentWritten } from "firebase-functions/v2/firestore";
// import * as admin from "firebase-admin";
// Legacy AI imports removed.

// // Import all function handlers
// import { transcribeAudio } from "./stt";
// import { synthesizeSpeech } from "./tts";
// import { analyzeFaceEmotion } from "./vision"; // Ensure vision function is imported

// // Initialize Firebase Admin SDK (do this only once)
// admin.initializeApp();
// const db = admin.firestore();

// // --- Legacy journal analysis config ---
// const getGenAI = () => {
//     const apiKey = process.env.GROQ_API_KEY;
//     if (!apiKey) {
//         throw new Error("Groq API Key not set in function environment variables...");
//     }
//     return initialized AI client;
// };

// const getModel = () => {
//     const genAI = getGenAI();
//     return genAI.getGenerativeModel({
//         model: "llama-3.3-70b-versatile",
//         generationConfig: {
//             temperature: 0.1,
//             topP: 0.8,
//             topK: 40,
//             maxOutputTokens: 4096,
//         }
//     });
// };

// // --- Journal Analysis Logic (Keep existing interfaces and functions) ---
// interface AIInsights { /* ... definition ... */ }
// function validateAndCorrectInsights(insights: any, content: string, mood: string): any { /* ... implementation ... */ }

// // --- Cloud Function Trigger for Journal Analysis ---
// export const analyzeJournalEntry = onDocumentWritten("journal_entries/{entryId}", async (event) => {
//     // ... (Your existing robust journal analysis logic remains here) ...
//     // Ensure it calls getModel() and validateAndCorrectInsights() correctly
//     const change = event.data;
//     const entryId = event.params.entryId;

//     if (!change) { /* ... handle no change ... */ return; }
//     const newData = change.after?.exists ? change.after.data() : null;
//     // const previousData = change.before?.exists ? change.before.data() : null;
//     if (!newData) { /* ... handle delete ... */ return null; }

//     const FORCE_REANALYSIS = false;
//     const shouldAnalyze = FORCE_REANALYSIS || /* ... your existing conditions ... */ true; // Simplified for example

//     console.log(`📊 ANALYSIS DECISION for entry ${entryId}:`, { /* ... */ shouldAnalyze });

//     if (!shouldAnalyze) { /* ... handle skip ... */ return null; }

//     const content = newData.content;
//     const mood = newData.mood;
//     if (!content) { /* ... handle no content ... */ return null; }

//     console.log(`Analyzing journal entry ${entryId}...`);

//     try {
//         const prompt = `...`; // Your detailed journal analysis prompt

//         console.log(`📝 PROMPT SENT TO GEMINI for entry ${entryId}: ...`);
//         const model = getModel(); // Get the correct model instance
//         const result = await aiClient.chat.completions.create({ ... });
//         const response = result.response;
//         const text = response.text();
//         console.log(`🤖 RAW GEMINI RESPONSE for entry ${entryId}: ...`);

//         let insights: Partial<AIInsights> = {};
//         try {
//             const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
//             console.log(`🧹 CLEANED TEXT for entry ${entryId}: ...`);
//             const parsedInsights = JSON.parse(cleanedText);
//             console.log(`✅ PARSED INSIGHTS for entry ${entryId}: ...`);

//             const validatedInsights = validateAndCorrectInsights(parsedInsights, content, mood);
//             console.log(`🛡️ VALIDATED INSIGHTS for entry ${entryId}: ...`);

//             insights = {
//                 ...validatedInsights,
//                 modelVersion: "llama-3.3-70b-versatile",
//                 analysisTimestamp: admin.firestore.FieldValue.serverTimestamp()
//             };
//         } catch (parseError) {
//             console.error(`Failed to parse Gemini response for ${entryId}:`, parseError);
//             console.error("Problematic Text:", text);
//             await db.collection("journal_entries").doc(entryId).update({ /* ... save error state ... */ });
//             return null;
//         }

//         await db.collection("journal_entries").doc(entryId).update({
//             aiInsights: insights,
//             updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//         });
//         console.log(`Successfully analyzed and updated entry ${entryId}`);
//         return null;

//     } catch (error) {
//         console.error(`Error analyzing journal entry ${entryId}:`, error);
//         await db.collection("journal_entries").doc(entryId).update({ /* ... save error state ... */ });
//         return null;
//     }
// });

// // --- Export ALL Callable Cloud Functions ---
// export {
//     transcribeAudio, // From ./stt
//     synthesizeSpeech, // From ./tts
//     analyzeFaceEmotion // From ./vision
// };


import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as crypto from "crypto";
import Groq from "groq-sdk";
// import * as functions from "firebase-functions"; // Import functions

// Initialize Firebase Admin SDK (do this only once)
admin.initializeApp();

// Import all function handlers (after Firebase initialization)
import { transcribeAudio } from "./stt";
import { synthesizeSpeech } from "./tts";
import { analyzeFaceEmotion } from "./vision"; // Ensure vision function (now using Gemini) is imported
import { getDashboardInsights } from "./insights";
import { aggregateUserChartData } from "./chartDataAggregator";
import { advanceTherapySession } from "./therapyEngine";
const db = admin.firestore();
const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

function decryptPayload(payload: any): any {
    const keyMaterial = process.env.NETWORK_ENCRYPTION_KEY || process.env.VITE_ENCRYPTION_KEY;
    if (!keyMaterial) {
        throw new Error("Missing NETWORK_ENCRYPTION_KEY (or VITE_ENCRYPTION_KEY) in functions environment.");
    }

    if (!payload?.iv || !payload?.data) {
        throw new Error("Invalid encrypted payload.");
    }

    const key = crypto.createHash("sha256").update(keyMaterial).digest();
    const iv = Buffer.from(payload.iv, "base64");
    const encrypted = Buffer.from(payload.data, "base64");
    const authTag = encrypted.subarray(encrypted.length - 16);
    const ciphertext = encrypted.subarray(0, encrypted.length - 16);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
    return JSON.parse(decrypted);
}

export const analyzeEmotionalContext = functions.https.onCall(async (data: any) => {
    const fallback = {
        topEmotion: "unknown",
        confidence: 0,
        allEmotions: [],
        contextString: "Respond with general empathy and care."
    };

    try {
        const decrypted = decryptPayload(data?.payload);
        const text = typeof decrypted?.text === "string" ? decrypted.text : "";
        if (!text) return fallback;

        const hfToken = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN;
        if (!hfToken) return fallback;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const response = await fetch("https://api-inference.huggingface.co/models/mental/mental-roberta-base", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${hfToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: text }),
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!response.ok) return fallback;

        const parsed = await response.json();
        const emotions = Array.isArray(parsed?.[0]) ? parsed[0] : parsed;
        if (!Array.isArray(emotions) || emotions.length === 0) return fallback;

        const top = emotions.reduce((a: any, b: any) => (a.score > b.score ? a : b));
        return {
            topEmotion: top?.label ?? "unknown",
            confidence: typeof top?.score === "number" ? top.score : 0,
            allEmotions: emotions,
            contextString: `User appears to be experiencing ${top?.label ?? "unknown"} (${Math.round((top?.score ?? 0) * 100)}% confidence). Respond with extra care and warmth.`
        };
    } catch (error) {
        console.error("analyzeEmotionalContext callable error:", error);
        return fallback;
    }
});

export const generateCompanionResponseSecure = functions.https.onCall(async (data: any) => {
    try {
        const decrypted = decryptPayload(data?.payload);
        const userMessage = typeof decrypted?.userMessage === "string" ? decrypted.userMessage : "";
        const emotionContextString =
            typeof decrypted?.emotionContextString === "string"
                ? decrypted.emotionContextString
                : "Respond with general empathy and care.";

        if (!userMessage) {
            return { message: "I am here for you. Can you tell me more about how you are feeling?" };
        }

        const result = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            max_tokens: 500,
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
If below 0.7 respond with general warmth.`
                },
                {
                    role: "user",
                    content: userMessage
                }
            ]
        });

        return {
            message:
                result.choices[0]?.message?.content ??
                "I am here for you. Can you tell me more about how you are feeling?"
        };
    } catch (error: any) {
        console.error("generateCompanionResponseSecure error:", error);
        return { message: "I am here for you. Can you tell me more about how you are feeling?" };
    }
});

export const analyzeJournalEntrySecure = functions.https.onCall(async (data: any) => {
    const fallback = {
        sentimentScore: 0,
        sentimentMagnitude: 0.4,
        keyThemes: [],
        positiveMentions: [],
        negativeMentions: [],
        potentialTriggers: [],
        copingMentioned: [],
        riskFlags: [],
        summary: "Unable to analyze entry right now.",
        modelVersion: "llama-3.3-70b-versatile",
        analysisTimestamp: new Date().toISOString()
    };

    try {
        const decrypted = decryptPayload(data?.payload);
        const content = typeof decrypted?.content === "string" ? decrypted.content : "";
        const mood = typeof decrypted?.mood === "string" ? decrypted.mood : "neutral";
        if (!content) return fallback;

        const prompt = `Mood: ${mood}
Journal content:
${content}`;

        const result = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            max_tokens: 700,
            messages: [
                {
                    role: "system",
                    content: `You are a mental wellness journal analysis assistant.
Return ONLY valid JSON with these exact keys:
sentimentScore, sentimentMagnitude, keyThemes, positiveMentions, negativeMentions, potentialTriggers, copingMentioned, riskFlags, summary.

Rules:
- sentimentScore must be a number from -1 to 1
- sentimentMagnitude must be a number from 0 to 1
- keyThemes and other list fields must be arrays of short strings
- summary must be one concise supportive sentence
- If uncertain, keep arrays empty and score near neutral`
                },
                { role: "user", content: prompt }
            ]
        });

        const outputText = result.choices[0]?.message?.content ?? "{}";
        const cleanedText = String(outputText).replace(/^```json\s*|```\s*$/g, "").trim();
        const parsed = JSON.parse(cleanedText);

        const toStringArray = (value: any): string[] =>
            Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
        const safeScoreRaw = typeof parsed?.sentimentScore === "number" ? parsed.sentimentScore : 0;
        const safeMagRaw = typeof parsed?.sentimentMagnitude === "number" ? parsed.sentimentMagnitude : 0.4;

        return {
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
                    : fallback.summary,
            modelVersion: "llama-3.3-70b-versatile",
            analysisTimestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("analyzeJournalEntrySecure error:", error);
        return fallback;
    }
});

// --- Journal Analysis Logic ---
interface AIInsights {
    sentiment?: string;
    keyThemes?: string[];
    potentialTriggers?: string[];
    actionableSuggestions?: string[];
    moodConsistency?: boolean;
    modelVersion?: string;
    analysisTimestamp?: admin.firestore.FieldValue;
    error?: string;
}

// Placeholder - replace with your actual validation logic
function validateAndCorrectInsights(insights: any, content: string, mood: string): Partial<AIInsights> {
    console.log("Validating insights (placeholder)...", { insights, content, mood });
    const validated: Partial<AIInsights> = {};
    if (insights?.sentiment && typeof insights.sentiment === 'string') validated.sentiment = insights.sentiment;
    if (insights?.keyThemes && Array.isArray(insights.keyThemes)) validated.keyThemes = insights.keyThemes.filter((t: any) => typeof t === 'string');
    if (insights?.potentialTriggers && Array.isArray(insights.potentialTriggers)) validated.potentialTriggers = insights.potentialTriggers.filter((t: any) => typeof t === 'string');
    if (insights?.actionableSuggestions && Array.isArray(insights.actionableSuggestions)) validated.actionableSuggestions = insights.actionableSuggestions.filter((t: any) => typeof t === 'string');
    if (typeof insights?.moodConsistency === 'boolean') validated.moodConsistency = insights.moodConsistency;
    return validated;
}
// --- End Placeholder ---

// --- Cloud Function Trigger for Journal Analysis ---
export const analyzeJournalEntry = onDocumentWritten("journal_entries/{entryId}", async (event) => {
    const change = event.data;
    const entryId = event.params.entryId;

    if (!change) {
        console.log(`No data change for entry ${entryId}.`);
        return;
    }

    // Don't run on delete
    if (!change.after?.exists) {
        console.log(`Entry ${entryId} deleted.`);
        return null;
    }

    // --- FIX: Define newData only ONCE here ---
    const newData = change.after.data();
    // --- END FIX ---

    // Check if newData is unexpectedly undefined (highly unlikely here, but good practice)
    if (!newData) {
        console.error(`Error: newData is undefined even though change.after.exists is true for entry ${entryId}.`);
        return null;
    }

    // Check if analysis should be skipped
    const previousData = change.before?.exists ? change.before.data() : null;
    const FORCE_REANALYSIS = false;
    const contentChanged = !previousData || previousData.content !== newData.content;
    // Analyze if no insights exist OR if there was a previous error AND content changed
    const needsAnalysis = !newData.aiInsights || (newData.aiInsights.error && contentChanged);

    const shouldAnalyze = FORCE_REANALYSIS || needsAnalysis;

    console.log(`📊 ANALYSIS DECISION for entry ${entryId}:`, { contentChanged, needsAnalysis, shouldAnalyze });

    if (!shouldAnalyze) {
        console.log(`Skipping analysis for entry ${entryId}.`);
        return null;
    }

    const content = newData.content;
    const mood = newData.mood;

    if (!content) {
        console.warn(`No content found for entry ${entryId}. Skipping analysis.`);
        await db.collection("journal_entries").doc(entryId).set({
            aiInsights: { error: "No content provided", analysisTimestamp: admin.firestore.FieldValue.serverTimestamp() },
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return null;
    }

    console.log(`Analyzing journal entry ${entryId}...`);

    if (!process.env.GROQ_API_KEY) {
        console.error(`Failed to initialize Groq for entry ${entryId}. Aborting analysis.`);
        await db.collection("journal_entries").doc(entryId).set({
            aiInsights: { error: "Failed to initialize AI model.", analysisTimestamp: admin.firestore.FieldValue.serverTimestamp() },
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return null;
    }

    try {
        const prompt = `
        Analyze the following journal entry written by someone tracking their mental wellness.
        The user self-reported their mood as "${mood}".

        Journal Entry:
        """
        ${content}
        """

        Based on the content and the reported mood, provide insights in JSON format.
        Respond ONLY with a valid JSON object containing the following keys:
        - "sentiment": string (e.g., "positive", "negative", "neutral", "mixed") - Analyze the overall sentiment expressed.
        - "keyThemes": string[] (Identify 2-4 main themes or topics discussed, e.g., "work stress", "relationship issues", "self-reflection").
        - "potentialTriggers": string[] (List any potential triggers mentioned or implied that might affect mood, e.g., "deadline pressure", "argument with friend"). Keep empty if none obvious.
        - "actionableSuggestions": string[] (Offer 1-2 brief, constructive suggestions based *only* on the entry's content, e.g., "Consider breaking down large tasks", "Journaling about the argument might help clarify feelings"). Avoid generic advice.
        - "moodConsistency": boolean (Does the content generally align with the self-reported mood of "${mood}"? true/false).

        Example response format:
        {"sentiment": "mixed", "keyThemes": ["work stress", "feeling overwhelmed"], "potentialTriggers": ["upcoming project deadline"], "actionableSuggestions": ["Try prioritizing tasks for the project", "Consider a short break when feeling overwhelmed"], "moodConsistency": true}
        `;

        console.log(`📝 PROMPT SENT TO GROQ for entry ${entryId}: ${prompt.substring(0, 100)}...`);
        const journalContent = content;
        const result = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            max_tokens: 1000,
            messages: [
                {
                    role: "system",
                    content: `You are a mental wellness AI analyst. 
Analyze this journal entry and return a JSON object 
with these exact keys: 
sentiment, themes, insights, suggestions. 
Return ONLY valid JSON. No extra text. No markdown.`
                },
                {
                    role: "user",
                    content: journalContent
                }
            ]
        });

        const analysisText = result.choices[0]?.message?.content ?? "{}";
        let analysis = {};
        try {
            analysis = JSON.parse(analysisText);
        } catch {
            analysis = {
                sentiment: "neutral",
                themes: [],
                insights: "Unable to analyze at this time.",
                suggestions: []
            };
        }
        const text = JSON.stringify(analysis);
        console.log(`🤖 RAW GROQ RESPONSE for entry ${entryId}: ${text.substring(0, 100)}...`);

        let insights: Partial<AIInsights> = {};
        try {
            const cleanedText = text.replace(/^```json\s*|```\s*$/g, "").trim();
            console.log(`🧹 CLEANED TEXT for entry ${entryId}: ${cleanedText.substring(0, 100)}...`);
            const parsedInsights = JSON.parse(cleanedText);
            console.log(`✅ PARSED INSIGHTS for entry ${entryId}:`, parsedInsights);

            if (!parsedInsights || typeof parsedInsights !== 'object') {
                throw new Error("Parsed response is not a valid object.");
            }

            const validatedInsights = validateAndCorrectInsights(parsedInsights, content, mood);
            console.log(`🛡️ VALIDATED INSIGHTS for entry ${entryId}:`, validatedInsights);

            insights = {
                ...validatedInsights,
                modelVersion: "llama-3.3-70b-versatile",
                analysisTimestamp: admin.firestore.FieldValue.serverTimestamp()
            };

        } catch (parseError: any) {
            console.error(`Failed to parse Gemini response for ${entryId}:`, parseError);
            console.error("Problematic Raw Text:", text);
            insights = {
                error: `Failed to parse AI response: ${parseError.message}`,
                analysisTimestamp: admin.firestore.FieldValue.serverTimestamp()
            };
        }

        await db.collection("journal_entries").doc(entryId).set({
            aiInsights: insights,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        if (insights.error) {
            console.warn(`Finished analysis for entry ${entryId} with parsing error.`);
        } else {
            console.log(`Successfully analyzed and updated entry ${entryId}`);
        }
        return null;

    } catch (error: any) {
        console.error(`Error during Gemini API call or Firestore update for entry ${entryId}:`, error);
        await db.collection("journal_entries").doc(entryId).set({
            aiInsights: {
                 error: `AI analysis failed: ${error.message}`,
                 analysisTimestamp: admin.firestore.FieldValue.serverTimestamp()
            },
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return null;
    }
});

// --- Export ALL Callable Cloud Functions ---
export {
    transcribeAudio,    // Exported from ./stt.ts
    synthesizeSpeech,   // Exported from ./tts.ts
    analyzeFaceEmotion, // Exported from ./vision.ts (now using Gemini)
    getDashboardInsights, // Exported from ./insights.ts
    aggregateUserChartData, // Exported from ./chartDataAggregator.ts
    advanceTherapySession // Exported from ./therapyEngine.ts
};

// analyzeJournalEntry is a Firestore trigger function and is automatically managed.