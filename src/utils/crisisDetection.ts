// Crisis detection and escalation utilities for Indian context

export interface CrisisHelpline {
  name: string;
  nameHindi: string;
  number: string;
  availability: string;
  availabilityHindi: string;
  specialization?: string;
}

export const CRISIS_HELPLINES: CrisisHelpline[] = [
  {
    name: 'KIRAN Mental Health Helpline',
    nameHindi: 'किरण मानसिक स्वास्थ्य हेल्पलाइन',
    number: '1800-599-0019',
    availability: '24/7 (Toll-Free)',
    availabilityHindi: '24 घंटे (टोल-फ्री)',
    specialization: 'Government of India - Ministry of Social Justice & Empowerment'
  },
  {
    name: 'National Helpline for Mental Health',
    nameHindi: 'राष्ट्रीय मानसिक स्वास्थ्य हेल्पलाइन',
    number: '08046110007',
    availability: '24/7',
    availabilityHindi: '24 घंटे',
    specialization: 'NIMHANS - Government of India'
  },
  {
    name: 'Tele MANAS',
    nameHindi: 'टेली मानस',
    number: '14416',
    availability: '24/7 (Toll-Free)',
    availabilityHindi: '24 घंटे (टोल-फ्री)',
    specialization: 'Ministry of Health & Family Welfare - Government of India'
  }
];

// Crisis keywords in multiple languages
const CRISIS_KEYWORDS = {
  english: [
    'suicide', 'kill myself', 'end it all', 'no point living', 'want to die',
    'hurt myself', 'self harm', 'cut myself', 'overdose', 'jump off',
    'hang myself', 'not worth living', 'better off dead', 'end my life',
    'kill me', 'want to disappear', 'can\'t go on', 'give up on life'
  ],
  hindi: [
    'आत्महत्या', 'मरना चाहता', 'जीना नहीं चाहता', 'खुद को नुकसान', 
    'मौत चाहिए', 'जीने का मतलब नहीं', 'खुद को मारना', 'छोड़ देना चाहता',
    'जीवन समाप्त', 'मरने का मन', 'जीने की इच्छा नहीं', 'आत्महत्या करना'
  ],
  mixed: [
    'suicide करना', 'मरना want', 'life end करना', 'खुद को hurt',
    'death चाहिए', 'जीना नहीं want', 'kill myself करना'
  ]
};

// High-risk emotional indicators
const HIGH_RISK_INDICATORS = {
  english: [
    'hopeless', 'worthless', 'trapped', 'burden', 'alone forever',
    'no escape', 'can\'t cope', 'unbearable pain', 'nothing matters',
    'empty inside', 'lost everything', 'no future', 'pointless'
  ],
  hindi: [
    'निराश', 'बेकार', 'फंसा हुआ', 'बोझ', 'हमेशा अकेला',
    'कोई रास्ता नहीं', 'सह नहीं सकता', 'असहनीय दर्द', 'कुछ मतलब नहीं',
    'अंदर से खाली', 'सब कुछ खो दिया', 'कोई भविष्य नहीं', 'व्यर्थ'
  ]
};

export type CrisisLevel = 'none' | 'low' | 'moderate' | 'high' | 'severe';

export interface CrisisAssessment {
  level: CrisisLevel;
  confidence: number;
  triggeredKeywords: string[];
  recommendedAction: string;
  immediateResponse: string;
}

export function assessCrisisLevel(text: string): CrisisAssessment {
  const lowerText = text.toLowerCase();
  let score = 0;
  const triggeredKeywords: string[] = [];

  // Check for direct crisis keywords
  Object.values(CRISIS_KEYWORDS).flat().forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      score += 10;
      triggeredKeywords.push(keyword);
    }
  });

  // Check for high-risk indicators
  Object.values(HIGH_RISK_INDICATORS).flat().forEach(indicator => {
    if (lowerText.includes(indicator.toLowerCase())) {
      score += 5;
      triggeredKeywords.push(indicator);
    }
  });

  // Additional context scoring
  if (lowerText.includes('plan') && (lowerText.includes('hurt') || lowerText.includes('end'))) {
    score += 8;
  }

  if (lowerText.includes('tonight') || lowerText.includes('today') || lowerText.includes('now')) {
    score += 3;
  }

  // Determine crisis level
  let level: CrisisLevel = 'none';
  let confidence = 0;
  let recommendedAction = '';
  let immediateResponse = '';

  if (score >= 15) {
    level = 'severe';
    confidence = 0.9;
    recommendedAction = 'immediate_intervention';
    immediateResponse = 'मुझे आपकी बहुत चिंता है। कृपया तुरंत किसी professional से बात करें। / I\'m very concerned about you. Please talk to a professional immediately.';
  } else if (score >= 10) {
    level = 'high';
    confidence = 0.8;
    recommendedAction = 'crisis_resources';
    immediateResponse = 'आप अकेले नहीं हैं। मदद उपलब्ध है। / You are not alone. Help is available.';
  } else if (score >= 5) {
    level = 'moderate';
    confidence = 0.6;
    recommendedAction = 'supportive_resources';
    immediateResponse = 'मैं समझ सकता हूं यह कठिन समय है। आइए कुछ सहायक तकनीकें try करते हैं। / I understand this is a difficult time. Let\'s try some supportive techniques.';
  } else if (score >= 2) {
    level = 'low';
    confidence = 0.4;
    recommendedAction = 'monitoring';
    immediateResponse = 'आपकी भावनाएं समझ में आती हैं। मैं यहां आपको सुनने के लिए हूं। / Your feelings are understandable. I\'m here to listen.';
  }

  return {
    level,
    confidence,
    triggeredKeywords,
    recommendedAction,
    immediateResponse
  };
}

// Parallel crisis detection function
export async function evaluateCrisis(text: string): Promise<{ assessment: CrisisAssessment; triggeredBy: string }> {
  // Run keyword scan and classifier in parallel
  const keywordPromise = Promise.resolve(assessCrisisLevel(text));
  const classifierPromise = (async () => {
    try {
      const backendUrl = (import.meta && import.meta.env && import.meta.env.VITE_AI_BACKEND_URL) || process.env.VITE_AI_BACKEND_URL;
      if (!backendUrl) throw new Error('VITE_AI_BACKEND_URL not configured');
      const response = await fetch(`${backendUrl}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Classifier error ${response.status}: ${txt}`);
      }
      const data = await response.json();
      return data; // expected { risk_level: string }
    } catch (err) {
      console.error('[crisis] classifier request failed:', err);
      return null;
    }
  })();

  const [keywordAssessment, classifierResult] = await Promise.all([keywordPromise, classifierPromise]);

  const keywordTriggered = ['moderate', 'high', 'severe'].includes(keywordAssessment.level);
  const classifierTriggered = classifierResult && classifierResult.risk_level === 'high';
  let triggeredBy = 'none';
  if (keywordTriggered && classifierTriggered) triggeredBy = 'both';
  else if (keywordTriggered) triggeredBy = 'keyword';
  else if (classifierTriggered) triggeredBy = 'classifier';

  // Merge classifier result into assessment if classifier indicates high risk
  let finalAssessment = { ...keywordAssessment };
  if (classifierTriggered) {
    // Upgrade severity to at least 'high'
    const levelPriority: Record<CrisisLevel, number> = { none: 0, low: 1, moderate: 2, high: 3, severe: 4 };
    if (levelPriority[keywordAssessment.level] < levelPriority['high']) {
      finalAssessment = {
        ...keywordAssessment,
        level: 'high',
        confidence: Math.max(keywordAssessment.confidence, 0.8),
        recommendedAction: 'crisis_resources',
        // keep original immediateResponse (or could customize)
        immediateResponse: keywordAssessment.immediateResponse,
      };
    }
  }

  return { assessment: finalAssessment, triggeredBy };
}





export function getCrisisResponse(assessment: CrisisAssessment, language: 'english' | 'hindi' | 'mixed' = 'mixed'): string {
  const responses = {
    severe: {
      english: "I'm extremely concerned about you right now. Your life has value and meaning. Please reach out to a crisis helpline immediately - they have trained professionals who can help you through this moment.",
      hindi: "मुझे आपकी बहुत चिंता है। आपका जीवन मूल्यवान है। कृपया तुरंत crisis helpline पर call करें - वहां trained professionals हैं जो आपकी मदद कर सकते हैं।",
      mixed: "I'm very worried about you। आपकी life valuable है। Please तुरंत crisis helpline को call करें - trained professionals आपकी help करेंगे।"
    },
    high: {
      english: "I can hear that you're in a lot of pain right now. These feelings are temporary, even though they feel overwhelming. You don't have to face this alone - there are people trained to help.",
      hindi: "मैं समझ सकता हूं कि आप बहुत दर्द में हैं। ये भावनाएं temporary हैं, भले ही अभी overwhelming लग रही हों। आप अकेले नहीं हैं - trained लोग आपकी मदद के लिए हैं।",
      mixed: "I can see आप बहुत pain में हैं। ये feelings temporary हैं। आप alone नहीं हैं - help available है।"
    },
    moderate: {
      english: "It sounds like you're going through a really tough time. Your feelings are valid, and it's okay to not be okay. Would you like to try some coping techniques together?",
      hindi: "लगता है आप कठिन समय से गुज़र रहे हैं। आपकी भावनाएं सही हैं। क्या आप कुछ coping techniques try करना चाहेंगे?",
      mixed: "Sounds like आप tough time से गुज़र रहे हैं। आपकी feelings valid हैं। Shall we try कुछ coping techniques?"
    }
  };

  return responses[assessment.level as keyof typeof responses]?.[language] || assessment.immediateResponse;
}

export function shouldShowCrisisResources(assessment: CrisisAssessment): boolean {
  return assessment.level === 'severe' || assessment.level === 'high';
}

export function getRecommendedHelplines(assessment: CrisisAssessment): CrisisHelpline[] {
  if (assessment.level === 'severe' || assessment.level === 'high') {
    return CRISIS_HELPLINES.slice(0, 3); // Top 3 most reliable
  }
  return CRISIS_HELPLINES.slice(0, 2); // Top 2 for moderate cases
}