// Global type definitions for Haven

export type Screen = 'onboarding' | 'home' | 'post-quiz-home' | 'quiz' | 'stats' | 'dashboard' | 'calm-down' | 'journal' | 'chatbot' | 'ai-companion';

export interface UserPreferences {
  interests: string[];
  comfortEnvironment: string;
  preferredLanguage: string;
  avatarStyle: string;
}

export interface UserData {
  id?: string; // optional user identifier
  onboardingCompleted: boolean;
  preferences?: UserPreferences;
  quizCompleted: boolean;
  currentQuizQuestion: number;
  quizAnswers: number[];
  overallScore: number;
  metrics: {
    stress: number;
    sleep: number;
    happiness: number;
    productivity: number;
    activity: number;
    phq9: number;
    gad7: number;
  };
  streaks: {
    current: number;
    longest: number;
  };
  milestones: string[];
}

// Advanced types for new features
export interface User {
  id: string;
  name: string;
  email: string;
  onboardingComplete: boolean;
  preferences: {
    language: 'hindi' | 'english' | 'mixed';
    culturalBackground: string;
    communicationStyle: 'formal' | 'casual';
  };
  mentalHealthProfile: {
    primaryConcerns: string[];
    goals: string[];
    riskFactors: string[];
    protectiveFactors: string[];
  };
}

// Enhanced Activity-Based Therapy Types
export type ActivityType = 
  | 'guided_conversation' 
  | 'cbt_exercise' 
  | 'mindfulness_session' 
  | 'assessment_activity' 
  | 'group_therapy' 
  | 'family_integration' 
  | 'crisis_intervention' 
  | 'cultural_therapy'
  | 'breathing_exercise'
  | 'journaling_prompt'
  | 'mood_tracking'
  | 'thought_challenge'
  | 'behavior_experiment'
  | 'grounding_technique';

export interface ActivitySession {
  sessionId: string;
  userId: string;
  activityType: ActivityType;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  startTime: Date;
  currentStep: number;
  totalSteps: number;
  userEngagement: number;
  culturalAdaptations: string[];
  realTimeMetrics: {
    emotionalState: string;
    stressLevel: number;
    responseTime: number;
    comprehension: number;
  };
}

export interface ActivityRecommendation {
  activityType: ActivityType;
  priority: number;
  culturalRelevance: number;
  estimatedDuration: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  personalizedReason: string;
  expectedOutcomes: string[];
}

export interface TherapeuticInsight {
  category: 'emotional' | 'behavioral' | 'cognitive' | 'cultural' | 'social';
  insight: string;
  confidence: number;
  actionable: boolean;
  culturallyRelevant: boolean;
}

export interface VoiceAnalysis {
  transcript: string;
  confidence: number;
  language: string;
  emotionalIndicators: {
    tone: string;
    intensity: number;
    speechRate: string;
    volume: string;
  };
  linguisticFeatures: {
    wordCount: number;
    sentimentScore: number;
    hesitationMarkers: number;
    fillerWords: number;
  };
  mentalHealthIndicators: {
    stressLevel: number;
    anxietyLevel: number;
    depressionIndicators: string[];
  };
}

export interface EmotionAnalysis {
  primaryEmotion: string;
  confidence: number;
  intensity: number;
  valence: number;
  arousal: number;
  culturalContext: {
    respectLevel: number;
    formalityLevel: number;
    culturalReferences: string[];
  };
}

export interface CrisisAssessment {
  level: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  indicators: string[];
  immediateActions: string[];
  resources: {
    helplines: Array<{
      name: string;
      number: string;
      availability: string;
    }>;
    professionals: string[];
    emergencyContacts: string[];
  };
}