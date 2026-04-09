import * as functions from "firebase-functions";

/**
 * Transcribes audio data sent from the client using Google Cloud Speech-to-Text (v2)
 * and the Chirp 3 model.
 * Expects audio data as a base64 encoded string.
 */
export const transcribeAudio = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    return {
        transcript: "",
        useBrowserSTT: true,
        message: "Use browser Web Speech API"
    };
});