import * as functions from "firebase-functions";
import Groq from "groq-sdk";
const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// <-- UPDATED: This schema now uses the 'SchemaType' enum
const aiResponseSchema = {
  type: "OBJECT",
  properties: {
    type: {
      type: "STRING",
      enum: ["voice", "choice", "reflection", "breathing", "complete"],
      description: "The type of step this is."
    },
    voiceGuide: {
      type: "STRING",
      description: "What the AI companion should *say* to the user. This is the spoken text. Should be in the user's language (e.g., Hindi, English, or Hinglish)."
    },
    instruction: {
      type: "STRING",
      description: "The instruction text to display on the screen (e.g., 'What's on your mind?' or 'Say: I am strong')."
    },
    choices: {
      type: "ARRAY",
      description: "A list of choices for the user, ONLY if type is 'choice'.",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING", description: "A unique ID for the choice, e.g., 'choice_1'" },
          text: {
            type: "OBJECT",
            description: "Multilingual text for the choice. Provide 'en' and 'hi' keys. You can also add 'mr' (Marathi).",
            properties: {
              en: { type: "STRING" },
              hi: { type: "STRING" },
              mr: { type: "STRING" }
            }
          },
          emoji: { type: "STRING", description: "A single emoji for the button." },
          points: { type: "NUMBER", description: "Points to award for this choice." }
        },
      },
    },
    points: {
      type: "NUMBER",
      description: "Points to award for completing this step (e.g., for a voice challenge)."
    },
  },
  required: ["type", "voiceGuide", "instruction"],
};

/**
 * This function is the new "brain" of your therapy session.
 */
export const advanceTherapySession = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const { exercise, scenario, history, lastUserInput } = data;

  // 1. Construct the System Prompt
  const systemPrompt = `
    You are 'Mann-Mitra', a compassionate, expert mental health guide.
    Your goal is to lead the user through an interactive voice therapy session.
    You must be empathetic, supportive, and culturally aware (Indian context, familiar with academic pressure, family dynamics, etc.).
    You MUST speak in the user's preferred language, which appears to be ${lastUserInput.lang || 'English and Hindi'}. Use a natural, conversational mix (Hinglish) if appropriate, but stick to the primary language.
    The user is doing the "${exercise.title}" exercise, specifically the "${scenario.title}" scenario.
    You MUST follow the user's lead. Your responses must be a direct, logical continuation of their last input.
    You MUST call the 'submitNextStep' function with the JSON for the next step. DO NOT respond with plain text.
  `;

  // 2. Build the conversation history
  const conversation: any[] = [...history];

  // 3. Add the user's *latest* input to the history
  let latestInputText = "";
  if (lastUserInput.type === 'choice') {
    latestInputText = `(The user chose the option: "${lastUserInput.value}")`;
  } else if (lastUserInput.type === 'voice') {
    latestInputText = `(The user said: "${lastUserInput.value}")`;
  } else if (lastUserInput.type === 'start') {
    latestInputText = "The user has just started the session. Please provide the very first step to welcome them and begin the exercise.";
  }
  
  conversation.push({
    role: "user",
    parts: [{ text: latestInputText }],
  });

  // 4. Send to Groq
  try {
    const sessionContext = {
      exercise,
      scenario,
      history: conversation,
      lastUserInput,
      systemPrompt,
      aiResponseSchema
    };

    const result = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: "You are a mental wellness therapy session guide. Help users advance through therapeutic exercises step by step. Be calm, empathetic and supportive. Return your response as valid JSON only. No extra text."
        },
        {
          role: "user",
          content: JSON.stringify(sessionContext)
        }
      ]
    });

    let parsed: any;
    try {
      parsed = JSON.parse(result.choices[0]?.message?.content ?? "{}");
    } catch (_parseError) {
      parsed = {
        type: "reflection",
        voiceGuide: "I am here with you. Let's take one gentle step at a time.",
        instruction: "Take a deep breath and share one feeling you notice right now.",
        choices: [],
        points: 0
      };
    }

    const nextStep = parsed;
    console.log("Received AI-generated step:", JSON.stringify(nextStep, null, 2));

    return { nextStep: nextStep };

  } catch (error: any) {
    console.error("Error generating therapy step:", error.message || error.toString());
    console.error("Details:", error.details || 'No details');
    throw new functions.https.HttpsError("internal", `AI generation failed: ${error.message}`);
  }
});