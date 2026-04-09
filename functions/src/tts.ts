import * as functions from "firebase-functions";

export const synthesizeSpeech = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    return {
        audioContent: null,
        useBrowserTTS: true,
        message: "Use browser speechSynthesis API"
    };
});