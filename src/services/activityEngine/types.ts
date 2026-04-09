// Core types for the Activity Engine Framework
// Defines interfaces for therapeutic activity management, session handling, and adaptation

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

export type ActivityStatus = 'not_started' | 'active' | 'paused' | 'completed' | 'abandoned';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type AdaptationTrigger = 
  | 'low_engagement' 
  | 'emotional_distress' 
  | 'comprehension_issue' 
  | 'cultural_mismatch' 
  | 'crisis_detected'
  | 'time_constraint'
  | 'user_request';

export interface UserContext {
  userId: string;
  demographics: {
    age?: number;
    gender?: string;
    location?: string;
    language?: string;
    culturalBackground?: string;
  };
  mentalHealthHistory: {
    previousSessions: number;
    primaryConcerns: string[];
    therapeuticGoals: string[];
    riskFactors: string[];
    protectiveFactors: string[];
  };
  currentState: {
    emotionalState?: string;
    stressLevel?: number;
    recentTriggers?: string[];
    copingStrategies?: string[];
  };
  activityPreferences: {
    preferredTypes: ActivityType[];
    sessionDuration: number; // minutes
    difficultyLevel: DifficultyLevel;
    interactionStyle: 'conversational' | 'structured' | 'guided';
    culturalAdaptationLevel: number; // 1-10 scale
  };
  therapeuticProgress: {
    completedActivities: string[];
    skillsLearned: string[];
    currentPhase: 'assessment' | 'skill_building' | 'practice' | 'maintenance';
    engagementHistory: EngagementMetrics[];
  };
}

export interface ActivityConfiguration {
  activityType: ActivityType;
  subtype?: string;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number; // minutes
  culturalAdaptations: string[];
  personalizations: string[];
  prerequisites?: string[];
  learningObjectives: string[];
}

export interface ActivitySession {
  sessionId: string;
  userId: string;
  activityType: ActivityType;
  configuration: ActivityConfiguration;
  
  // Session State
  status: ActivityStatus;
  startTime: Date;
  endTime?: Date;
  currentStep: number;
  totalSteps: number;
  
  // Progress Tracking
  userEngagement: number; // 1-10 scale
  completionPercentage: number;
  adaptations: ActivityAdaptation[];
  
  // Real-time Metrics
  realTimeMetrics: {
    emotionalState: string;
    stressLevel: number;
    responseTime: number;
    comprehension: number;
    participationLevel: number;
  };
  
  // Interaction Data
  interactions: ActivityInteraction[];
  userResponses: UserResponse[];
  aiResponses: AIResponse[];
  
  // Session Results
  sessionResult?: ActivityResult;
  insights?: TherapeuticInsight[];
  followUpRecommendations?: ActivityRecommendation[];
}

export interface ActivityInteraction {
  timestamp: Date;
  type: 'user_input' | 'ai_response' | 'system_event' | 'adaptation';
  content: string;
  metadata?: Record<string, any>;
}

export interface UserResponse {
  timestamp: Date;
  content: string;
  responseTime: number; // milliseconds
  emotionalIndicators?: {
    tone: string;
    intensity: number;
    confidence: number;
  };
  engagementLevel: number; // 1-10 scale
}

export interface AIResponse {
  timestamp: Date;
  content: string;
  interventionType: string;
  culturalAdaptations: string[];
  therapeuticTechniques: string[];
  confidence: number;
}

export interface ActivityAdaptation {
  timestamp: Date;
  trigger: AdaptationTrigger;
  adaptationType: 'difficulty_adjustment' | 'cultural_modification' | 'intervention_change' | 'emergency_protocol' | 'pacing_change' | 'language_switch';
  originalContent: string;
  adaptedContent: string;
  reasoning: string;
  effectiveness?: number; // measured post-adaptation
}

export interface EngagementMetrics {
  responseTime: number; // milliseconds
  messageLength: number;
  emotionalExpression: number; // 1-10 scale
  questionAsking: number;
  followThrough: number;
  overallEngagement: number; // calculated composite score
  timestamp: Date;
}

export interface ActivityResult {
  sessionId: string;
  activityType: ActivityType;
  completionStatus: 'completed' | 'partially_completed' | 'abandoned';
  
  // Performance Metrics
  engagementScore: number; // 1-10
  comprehensionScore: number; // 1-10
  emotionalProgress: {
    startingState: string;
    endingState: string;
    progressMade: number; // 1-10 scale
  };
  skillDemonstration: SkillAssessment[];
  
  // Therapeutic Outcomes
  therapeuticGoalsAddressed: string[];
  insightsGained: TherapeuticInsight[];
  skillsPracticed: string[];
  copingStrategiesLearned: string[];
  
  // AI Analysis
  aiAssessment: {
    effectivenessRating: number; // 1-10
    recommendedFollowUp: ActivityRecommendation[];
    riskAssessment: RiskAssessment;
    culturalRelevance: number; // 1-10
  };
  
  // Session Statistics
  duration: number; // minutes
  adaptationsCount: number;
  userSatisfaction?: number; // 1-10 scale
}

export interface SkillAssessment {
  skillName: string;
  demonstrationLevel: 'none' | 'basic' | 'intermediate' | 'advanced';
  confidence: number; // 1-10 scale
  practiceNeeded: boolean;
}

export interface TherapeuticInsight {
  category: 'emotional' | 'behavioral' | 'cognitive' | 'cultural' | 'social';
  insight: string;
  confidence: number;
  actionable: boolean;
  culturallyRelevant: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface ActivityRecommendation {
  activityType: ActivityType;
  priority: number; // 1-10 scale
  culturalRelevance: number; // 1-10 scale
  estimatedDuration: number; // minutes
  difficultyLevel: DifficultyLevel;
  personalizedReason: string;
  prerequisites?: string[];
  expectedOutcomes: string[];
  urgency: 'low' | 'medium' | 'high' | 'immediate';
}

export interface RiskAssessment {
  level: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  indicators: string[];
  immediateActions: string[];
  confidence: number;
  requiresEscalation: boolean;
}

// Input/Output interfaces for activity services
export interface UserInput {
  content: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'gesture' | 'selection';
  metadata?: {
    responseTime?: number;
    emotionalIndicators?: any;
    culturalContext?: any;
  };
}

export interface ActivityResponse {
  content: string;
  type: 'guidance' | 'question' | 'feedback' | 'intervention' | 'completion';
  nextStep?: number;
  adaptationTriggered?: boolean;
  interventionType?: string;
  culturalAdaptations?: string[];
  therapeuticTechniques?: string[];
  followUpRequired?: boolean;
}

// Error handling types
export interface ActivityErrorData {
  code: string;
  message: string;
  type: 'user_input' | 'ai_service' | 'cultural_adaptation' | 'system' | 'crisis';
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  fallbackOptions?: string[];
}

export class ActivityError extends Error {
  public readonly code: string;
  public readonly type: ActivityErrorData['type'];
  public readonly severity: ActivityErrorData['severity'];
  public readonly recoverable: boolean;
  public readonly fallbackOptions?: string[];

  constructor(data: ActivityErrorData) {
    super(data.message);
    this.name = 'ActivityError';
    this.code = data.code;
    this.type = data.type;
    this.severity = data.severity;
    this.recoverable = data.recoverable;
    this.fallbackOptions = data.fallbackOptions ?? [];

  }
}