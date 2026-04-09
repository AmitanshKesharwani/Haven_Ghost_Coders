// Browser-Compatible AI Integration (secure function proxy)
import { analyzeEmotionalContext } from "./emotionAnalysis";
import { getFunctions, httpsCallable } from "firebase/functions";
import { encryptTransportPayload } from "./transportEncryption";

// Configuration
const GROQ_API_KEY = (import.meta as any).env.VITE_GROQ_API_KEY as string;

if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
  console.error('❌ GROQ API KEY NOT CONFIGURED!');
}

async function callGroqDirect(userMessage: string, emotionContextString: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 800,
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
If below 0.7 respond with general warmth.

Response style requirements:
- Sound like a real, caring person (not clinical, not robotic)
- Use 2-4 short paragraphs, usually 120-220 words
- Reflect what the user said before giving suggestions
- Offer one gentle practical next step when appropriate
- End with one warm, specific follow-up question
- Avoid generic filler like "I'm here to help" unless contextually needed`
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Groq fallback failed with status ${response.status}`);
  }

  const json = await response.json();
  return (
    json?.choices?.[0]?.message?.content ??
    "I am here for you. Can you tell me more about how you are feeling?"
  );
}

export interface MentalHealthContext {
  userId: string;
  sessionId: string;
  userProfile: {
    age?: number;
    gender?: string;
    location?: string;
    preferredLanguage?: string;
    culturalBackground?: string;
    interests?: string[];
    comfortEnvironment?: string;
    previousSessions?: number;
  };
  currentState: {
    mood?: string;
    stressLevel?: 'low' | 'moderate' | 'high' | 'severe';
    energyLevel?: 'low' | 'moderate' | 'high';
    crisisRisk?: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    emotionalTone?: string;
  };
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
    metadata?: any;
  }>;
  therapeuticGoals?: string[];
  assessmentScores?: {
    phq9?: number;
    gad7?: number;
    overallWellness?: number;
  };
}

export interface AIResponse {
  message: string;
  originalLanguage: string;
  detectedLanguage?: string;
  translatedMessage?: string;
  emotionalTone: 'supportive' | 'empathetic' | 'encouraging' | 'calming' | 'urgent';
  suggestedActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    category: 'immediate' | 'short_term' | 'long_term';
  }>;
  copingStrategies: string[];
  followUpQuestions: string[];
  riskAssessment: {
    level: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    indicators: string[];
    recommendedIntervention: string;
  };
  culturalReferences: string[];
  audioResponse?: string;
  confidence: number;
}

export class GoogleCloudMentalHealthAI {
  private model: any;
  private isInitialized = false;

  constructor() {
    this.initializeServices();
  }

  private async initializeServices() {
    if (this.isInitialized) return;
    
    try {
      if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
        throw new Error('Groq API key not configured');
      }

      this.model = true;

      this.isInitialized = true;
      console.log('✅ Groq AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Groq AI:', error);
      throw error;
    }
  }

  // Compatibility method for aiOrchestrator
  async generateEmpathicResponse(
    userMessage: string,
    context: {
      userMood: string;
      preferredLanguage: string;
      culturalBackground: string;
      previousMessages: string[];
      userPreferences: {
        interests: string[];
        comfortEnvironment: string;
        avatarStyle: string;
      };
      crisisLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    }
  ): Promise<{
    message: string;
    suggestedActions: string[];
    moodAssessment: string;
    followUpQuestions: string[];
  }> {
    // Build conversation history with proper roles
    const conversationHistory: Array<{
      role: 'user' | 'assistant';
      content: string;
      timestamp: Date;
    }> = [];
    
    for (let i = 0; i < context.previousMessages.length; i++) {
      conversationHistory.push({
        role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
        content: context.previousMessages[i],
        timestamp: new Date()
      });
    }

    const richContext: MentalHealthContext = {
      userId: 'current-user',
      sessionId: 'current-session',
      userProfile: {
        preferredLanguage: context.preferredLanguage || 'mixed',
        culturalBackground: context.culturalBackground,
        interests: context.userPreferences.interests,
        comfortEnvironment: context.userPreferences.comfortEnvironment,
      },
      currentState: {
        mood: context.userMood,
        crisisRisk: context.crisisLevel,
      },
      conversationHistory: conversationHistory,
    };

    const response = await this.generateEmpathicResponse_Full(userMessage, richContext);

    return {
      message: response.message,
      suggestedActions: response.suggestedActions.map(action =>
        typeof action === 'string' ? action : action.action
      ),
      moodAssessment: response.riskAssessment.level,
      followUpQuestions: response.followUpQuestions
    };
  }

  async generateEmpathicResponse_Full(
    userMessage: string,
    context: MentalHealthContext
  ): Promise<AIResponse> {
    if (!this.isInitialized || !this.model) {
      await this.initializeServices();
    }

    if (!this.model) {
      throw new Error('Groq AI model not initialized. Please check your API key.');
    }

    try {
      const prompt = this.buildTherapeuticPrompt(userMessage, context);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 SENDING TO GROQ API');
      console.log('User Message:', userMessage);
      console.log('Prompt Length:', prompt.length, 'characters');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const emotionContext = await analyzeEmotionalContext(userMessage);
      const functions = getFunctions();
      const callCompanion = httpsCallable<
        { payload: { iv: string; data: string } },
        { message?: string }
      >(functions, "generateCompanionResponseSecure");
      const payload = await encryptTransportPayload({
        userMessage,
        emotionContextString: emotionContext.contextString
      });
      let generatedText = "";
      try {
        const response = await callCompanion({ payload });
        generatedText =
          response.data?.message ??
          "I am here for you. Can you tell me more about how you are feeling?";
      } catch (callableError) {
        console.warn("⚠️ Secure callable failed, using direct Groq fallback:", callableError);
        generatedText = await callGroqDirect(userMessage, emotionContext.contextString);
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📥 RECEIVED FROM GROQ');
      console.log('Response Length:', generatedText?.length || 0, 'characters');
      console.log('First 200 chars:', generatedText?.substring(0, 200));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (!generatedText || generatedText.trim() === '') {
        throw new Error('Received empty response from Gemini');
      }

      const parsed = this.parseResponse(generatedText, context);
      console.log('✅ Final message to user:', parsed.message.substring(0, 100) + '...');
      
      return parsed;

    } catch (error: any) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ GROQ API ERROR');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack?.substring(0, 200));
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      throw new Error(`AI Service Error: ${error.message}. Please check your API key and internet connection.`);
    }
  }

  private buildTherapeuticPrompt(userMessage: string, context: MentalHealthContext): string {
    const language = context.userProfile?.preferredLanguage || 'mixed';
    const conversationHistory = context.conversationHistory?.slice(-3).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n') || 'No previous conversation';
    
    return `You are Haven, a warm and empathetic AI mental health companion for Indian students.

🚨 CRITICAL RULE: You MUST respond SPECIFICALLY to what the user said. 
🚫 NEVER use these generic phrases:
- "I understand you're reaching out"
- "Can you tell me a bit more about what's on your mind"
- "I'm here to listen"
- Any other generic opening

✅ INSTEAD: Reference the EXACT words the user used in your response.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER'S EXACT MESSAGE: "${userMessage}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECENT CONVERSATION:
${conversationHistory}

🎯 QUICK REFERENCE - How to respond to THIS specific message:

IF user said "hi" or "hello" or "hey":
→ Respond: "Hey! How are you doing today?" or "Hi there! What's on your mind?"

IF user said "How are you today?":
→ Respond: "I'm here and ready to listen! How are YOU doing today? What's been on your mind?"

IF user mentions feeling (sad, depressed, anxious, stressed):
→ Respond: "I hear that you're feeling [exact emotion]. That takes courage to share. What's been making you feel [emotion]?"

IF user mentions situation (exam, family, friends):
→ Respond: "I can hear that [situation] is affecting you. What's been happening with [situation]?"

NOW ANALYZE THE USER'S MESSAGE ABOVE AND RESPOND ACCORDINGLY:

CONTEXT:
- Preferred Language: ${language}
- Current Mood: ${context.currentState?.mood || 'unknown'}
- Crisis Level: ${context.currentState?.crisisRisk || 'none'}

📋 RESPONSE RULES:

1. **ANALYZE THE MESSAGE FIRST:**
   - Is it a greeting? (hi, hello, hey) → Respond warmly and ask how they're doing
   - Is it about emotions? (sad, stressed, anxious) → Acknowledge the specific emotion and ask what's causing it
   - Is it about a situation? (exam, family, friends) → Address that specific situation
   - Is it a question? → Answer it directly
   - Is it sharing something? → Validate and explore deeper

2. **BE SPECIFIC, NOT GENERIC:**
   ❌ BAD: "I understand you're reaching out"
   ✅ GOOD: "I hear that you're feeling depressed. That takes courage to share."
   
   ❌ BAD: "Can you tell me more about what's on your mind?"
   ✅ GOOD: "What's been making you feel depressed? I'm here to listen."

3. **MATCH THEIR LANGUAGE:**
   - If they write in English → Respond in English
   - If they write in Hindi → Respond in Hindi
   - If they mix (Hinglish) → Mix naturally

4. **LENGTH:**
   - Greetings: 1-2 sentences
   - Emotional sharing: 2-3 short paragraphs (60-100 words)
   - Questions: Direct answer + follow-up

5. **CRISIS HANDLING:**
   - If they mention suicide, self-harm, or severe distress:
     * Acknowledge their pain immediately
     * Provide helpline: KIRAN 1800-599-0019 (Toll-Free), Tele MANAS 14416 (Toll-Free)
     * Ask if they're safe right now

6. **TONE:**
   - Warm and conversational (like texting a caring friend)
   - Use contractions (I'm, you're, it's)
   - Vary your responses - don't repeat phrases
   - Show you're listening by referencing what they said

EXAMPLES:

User: "hi"
Response: "Hey! How are you doing today? 😊"

User: "I am feeling depressed today"
Response: "I hear that you're feeling depressed today. That takes courage to share. Depression can feel so heavy. What's been weighing on you? I'm here to listen."

User: "exam tomorrow and I'm stressed"
Response: "Exam stress is so real, especially the night before. It's completely understandable to feel this way. What subject is it, and what's worrying you the most about it?"

User: "मैं बहुत परेशान हूँ"
Response: "मैं समझ सकता हूँ कि आप परेशान हैं। आपकी feelings बिल्कुल valid हैं। क्या हुआ है जो आपको परेशान कर रहा है? मैं यहाँ हूँ सुनने के लिए।"

NOW RESPOND TO THE USER'S MESSAGE ABOVE.

🚨 CRITICAL: You MUST respond with ONLY valid JSON. No extra text before or after.

Return ONLY this JSON structure (no markdown, no explanations):
{
  "message": "Your specific, contextual response (NOT generic)",
  "detectedLanguage": "English",
  "emotionalTone": "supportive",
  "suggestedActions": [{"action": "specific action", "priority": "medium", "category": "immediate"}],
  "copingStrategies": ["strategy 1", "strategy 2"],
  "followUpQuestions": ["follow-up question"],
  "riskAssessment": {"level": "none", "indicators": [], "recommendedIntervention": "Continue conversation"},
  "culturalReferences": [],
  "confidence": 0.9
}`;
  }

  private parseResponse(generatedText: string, context: MentalHealthContext): AIResponse {
    try {
      // Try multiple cleaning strategies
      let cleanedResponse = generatedText.trim();
      
      // Remove markdown code blocks
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/\n?```/g, '');
      
      // Try to extract JSON if it's embedded in text
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      // Remove any leading/trailing text before/after JSON
      cleanedResponse = cleanedResponse.trim();
      
      const parsed = JSON.parse(cleanedResponse);

      return {
        message: parsed.message || generatedText,
        originalLanguage: context.userProfile?.preferredLanguage || 'mixed',
        detectedLanguage: parsed.detectedLanguage || 'Unknown',
        emotionalTone: parsed.emotionalTone || 'supportive',
        suggestedActions: parsed.suggestedActions || [],
        copingStrategies: parsed.copingStrategies || [],
        followUpQuestions: parsed.followUpQuestions || [],
        riskAssessment: parsed.riskAssessment || {
          level: 'none',
          indicators: [],
          recommendedIntervention: 'Continue conversation'
        },
        culturalReferences: parsed.culturalReferences || [],
        confidence: parsed.confidence || 0.8
      };
    } catch (error) {
      console.warn('⚠️ Could not parse JSON, using raw text');
      console.warn('Raw response:', generatedText.substring(0, 200));
      return {
        message: generatedText,
        originalLanguage: context.userProfile?.preferredLanguage || 'mixed',
        detectedLanguage: 'Unknown',
        emotionalTone: 'supportive',
        suggestedActions: [],
        copingStrategies: [],
        followUpQuestions: [],
        riskAssessment: {
          level: 'none',
          indicators: [],
          recommendedIntervention: 'Continue conversation'
        },
        culturalReferences: [],
        confidence: 0.7
      };
    }
  }
}

// Export singleton instance
export const googleCloudAI = new GoogleCloudMentalHealthAI();
