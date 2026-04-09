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

// // --- Configuration for Gemini (Journal Analysis) ---
// const getGenAI = () => {
//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//         throw new Error("Gemini API Key not set in function environment variables...");
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