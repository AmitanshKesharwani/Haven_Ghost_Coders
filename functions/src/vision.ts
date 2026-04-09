// import * as functions from "firebase-functions";
// import { ImageAnnotatorClient, protos } from "@google-cloud/vision"; // Import protos

// const visionClient = new ImageAnnotatorClient();

// // Interface for the expected return structure (similar to EmotionDetectionResult)
// interface VisionAnalysisResult {
//     faceDetected: boolean;
//     emotions: {
//         joy: number;
//         sorrow: number;
//         anger: number;
//         surprise: number;
//         // Vision API also provides underExposed, blurred, headwear likelihoods
//     };
//     primaryEmotion: string;
//     confidence: number; // Confidence in the primary emotion
//     // Add other potentially useful features if needed
//     // boundingBox?: any;
//     // landmarks?: any;
// }

// // Helper to map Vision API likelihood strings/enums to numerical scores
// const likelihoodToScore = (likelihood: protos.google.cloud.vision.v1.Likelihood | "UNKNOWN" | null | undefined | string): number => {
//     const likelihoodString = typeof likelihood === 'string' ? likelihood : null;

//     switch (likelihoodString) {
//         case 'VERY_LIKELY': return 0.9;
//         case 'LIKELY': return 0.7;
//         case 'POSSIBLE': return 0.5;
//         case 'UNLIKELY': return 0.3;
//         case 'VERY_UNLIKELY': return 0.1;
//         case 'UNKNOWN':
//         default: return 0;
//     }
// };

// /**
//  * Analyzes a single image for face detection and emotion likelihood using Cloud Vision AI.
//  * Expects image data as a base64 encoded string.
//  */
// export const analyzeFaceEmotion = functions.https.onCall(async (data: any, context: functions.https.CallableContext): Promise<VisionAnalysisResult> => {
//     // 1. Ensure user is authenticated
//     if (!context.auth) {
//         throw new functions.https.HttpsError("unauthenticated", "User must be logged in to analyze images.");
//     }

//     // 2. Get image data from the client request
//     const imageBytes = data.imageBytes; // Expecting base64 encoded image string (without data:image/... prefix)

//     // Validate required input
//     if (!imageBytes) {
//         throw new functions.https.HttpsError("invalid-argument", "Missing image data (expected base64 string).");
//     }

//     // --- Prepare the Vision API request FOR annotateImage ---
//     const request = {
//         image: {
//             content: imageBytes,
//         },
//         // Specify ONLY the features needed within the features array
//         features: [{ type: 'FACE_DETECTION' as const }],
//     };
//     // --- End Request Prep ---

//     try {
//         console.log(`Vision AI: Analyzing face emotion for user ${context.auth.uid}...`);

//         // *** USE annotateImage INSTEAD of faceDetection ***
//         const [result] = await visionClient.annotateImage(request);
//         // *** END CHANGE ***

//         // AnnotateImage returns faceAnnotations in the same way
//         const faces = result.faceAnnotations;

//         // Default result if no face is detected
//         const defaultResult: VisionAnalysisResult = {
//             faceDetected: false,
//             emotions: { joy: 0, sorrow: 0, anger: 0, surprise: 0 },
//             primaryEmotion: 'neutral',
//             confidence: 0,
//         };

//         if (!faces || faces.length === 0) {
//             console.log(`Vision AI: No faces detected for user ${context.auth.uid}.`);
//             return defaultResult;
//         }

//         // Process the first detected face (usually the most prominent)
//         const face = faces[0];

//         // 5. Map likelihoods to scores
//         const emotions = {
//             joy: likelihoodToScore(face.joyLikelihood),
//             sorrow: likelihoodToScore(face.sorrowLikelihood),
//             anger: likelihoodToScore(face.angerLikelihood),
//             surprise: likelihoodToScore(face.surpriseLikelihood),
//             // Note: Vision API doesn't explicitly return Fear or Disgust likelihoods via faceDetection
//         };

//         // Determine primary emotion and its confidence
//         let primaryEmotion = 'neutral';
//         let maxScore = 0.1; // Set a small threshold to overcome default 0s

//         Object.entries(emotions).forEach(([emotion, score]) => {
//             if (score > maxScore) {
//                 maxScore = score;
//                 primaryEmotion = emotion;
//             }
//         });

//         console.log(`Vision AI: Analysis successful for user ${context.auth.uid}. Primary: ${primaryEmotion}, Confidence: ${maxScore.toFixed(2)}`);

//         // 6. Return the processed result
//         return {
//             faceDetected: true,
//             emotions: emotions,
//             primaryEmotion: primaryEmotion,
//             confidence: maxScore,
//             // boundingBox: face.boundingPoly, // Optionally return bounding box
//             // landmarks: face.landmarks,   // Optionally return landmarks
//         };

//     } catch (error: any) {
//         // 7. Handle errors
//         console.error(`Vision AI Error for user ${context.auth.uid}:`, error);
//         const errorMessage = error.message || "Unknown error during face analysis.";
//         // Propagate error appropriately
//         throw new functions.https.HttpsError("internal", `Face analysis failed: ${errorMessage}`, { details: error.details });
//     }
// });


import * as functions from "firebase-functions";
import Groq from "groq-sdk";
const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Define the expected output structure (can be the same as before or adapted)
interface VisionAnalysisResult {
    faceDetected: boolean;
    emotions: {
        joy: number;     // Likelihood 0-1
        sorrow: number;  // Likelihood 0-1
        anger: number;   // Likelihood 0-1
        surprise: number;// Likelihood 0-1
        fear?: number;    // Optional: Gemini might provide these
        disgust?: number; // Optional: Gemini might provide these
        neutral?: number; // Optional: Gemini might provide these
    };
    primaryEmotion: string; // The emotion with the highest score
    confidence: number;     // The score of the primary emotion
    // Optional: Add other fields Gemini might provide or you want to infer
    reasoning?: string;     // Gemini might explain its reasoning
}

/**
 * Analyzes a single image for face detection and emotion likelihood using Gemini.
 * Expects image data as a base64 encoded string.
 */
export const analyzeFaceEmotion = functions.https.onCall(async (data: any, context: functions.https.CallableContext): Promise<VisionAnalysisResult> => {
    // 1. Ensure user is authenticated (keep this check)
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in to analyze images.");
    }

    // 2. Get image data from the client request
    const imageBase64 = data.imageBytes; // Expecting base64 encoded image string

    // Validate required input
    if (!imageBase64) {
        throw new functions.https.HttpsError("invalid-argument", "Missing image data (expected base64 string).");
    }

    try {
        console.log(`Groq: Analyzing face emotion for user ${context.auth.uid}...`);
        const result = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            max_tokens: 500,
            messages: [
                {
                    role: "system",
                    content: "You are an emotion analysis assistant. Given emotional context or facial expression description, identify the primary emotion and intensity. Return JSON only with these exact keys: emotion, intensity, confidence, suggestions. No extra text."
                },
                {
                    role: "user",
                    content: `Analyze this emotional context: ${JSON.stringify(data)}`
                }
            ]
        });

        let parsed: any;
        try {
            parsed = JSON.parse(result.choices[0]?.message?.content ?? "{}");
        } catch (_parseError) {
            return {
                faceDetected: false,
                emotions: { joy: 0, sorrow: 0, anger: 0, surprise: 0, fear: 0, disgust: 0, neutral: 1 },
                primaryEmotion: "neutral",
                confidence: 0,
                reasoning: "Unable to parse model output."
            };
        }

        const primaryEmotion = typeof parsed.emotion === "string" ? parsed.emotion : "neutral";
        const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0;
        const intensity = typeof parsed.intensity === "number" ? parsed.intensity : 0;
        const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.join(" ") : undefined;

        const emotions = {
            joy: primaryEmotion === "joy" ? intensity : 0,
            sorrow: primaryEmotion === "sorrow" ? intensity : 0,
            anger: primaryEmotion === "anger" ? intensity : 0,
            surprise: primaryEmotion === "surprise" ? intensity : 0,
            fear: primaryEmotion === "fear" ? intensity : 0,
            disgust: primaryEmotion === "disgust" ? intensity : 0,
            neutral: primaryEmotion === "neutral" ? intensity : 0
        };

        return {
            faceDetected: true,
            emotions,
            primaryEmotion,
            confidence,
            reasoning: suggestions
        };

    } catch (error: any) {
        console.error(`Groq API Error for user ${context.auth.uid}:`, error);
        let errorMessage = "Unknown error during Groq face analysis.";
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        throw new functions.https.HttpsError("internal", `Groq face analysis failed: ${errorMessage}`, { details: error });
    }
});

// Important: Ensure you also update 'functions/src/index.ts'
// to correctly export this modified 'analyzeFaceEmotion' function.