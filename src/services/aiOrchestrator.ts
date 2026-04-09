// Enhanced AI Orchestrator - Coordinates all therapeutic activities and AI services
// Integrates activity selection, cultural intelligence, real-time adaptation, and comprehensive therapeutic interventions

import { googleCloudAI } from './googleCloudAI';

// Simple AIResponse interface for orchestrator compatibility
interface SimpleAIResponse {
  message: string;
  suggestedActions: string[];
  moodAssessment: string;
  followUpQuestions: string[];
}
import { conversationMemory, type ConversationTurn, type ContinuityBridge } from './conversationMemory';
import { culturalIntelligence } from './culturalIntelligence';
import { loadingManager } from './loadingManager';
// --- NEW IMPORTS ---
import { firebaseService, type UserActivity } from './firebaseService';
// --- END NEW IMPORTS ---

import { AdaptiveAssessmentEngine } from './adaptiveAssessmentEngine';
import { 
  type SimpleAssessmentSession, 
  type AssessmentQuestion,
  type SimpleUserProfile
} from './assessmentEngine';

// Enhanced interfaces for activity-based therapeutic system
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

export interface ActivityRecommendation {
  activityType: ActivityType;
  priority: number; // 1-10 scale
  culturalRelevance: number; // 1-10 scale
  estimatedDuration: number; // minutes
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  personalizedReason: string;
  prerequisites?: string[];
  expectedOutcomes: string[];
}

export interface ActivitySession {
  sessionId: string;
  userId: string;
  activityType: ActivityType;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  startTime: Date;
  currentStep: number;
  totalSteps: number;
  userEngagement: number; // 1-10 scale
  adaptations: ActivityAdaptation[];
  culturalContext: CulturalContext;
  realTimeMetrics: {
    emotionalState: string;
    stressLevel: number;
    responseTime: number;
    comprehension: number;
  };
}

export interface ActivityAdaptation {
  timestamp: Date;
  trigger: 'low_engagement' | 'emotional_distress' | 'comprehension_issue' | 'cultural_mismatch' | 'crisis_detected';
  adaptationType: 'difficulty_adjustment' | 'cultural_modification' | 'intervention_change' | 'emergency_protocol';
  originalContent: string;
  adaptedContent: string;
  effectiveness?: number; // measured post-adaptation
}

export interface CulturalContext {
  primaryCulture: 'north_indian' | 'south_indian' | 'east_indian' | 'west_indian' | 'mixed';
  languagePreference: 'hindi' | 'english' | 'mixed';
  familyStructure: 'nuclear' | 'joint' | 'extended' | 'single_parent';
  communicationStyle: 'direct' | 'indirect' | 'hierarchical' | 'egalitarian';
  religiousBackground?: string;
  socioeconomicContext: 'urban' | 'semi_urban' | 'rural';
  generationalFactors: string[];
  culturalSensitivities: string[];
}

export interface EngagementMetrics {
  responseTime: number; // milliseconds
  messageLength: number;
  emotionalExpression: number; // 1-10 scale
  questionAsking: number;
  followThrough: number;
  overallEngagement: number; // calculated composite score
}

export interface TherapeuticResponse {
  message: string;
  interventionType: 'validation' | 'cognitive_restructuring' | 'mindfulness' | 'crisis_intervention' | 'psychoeducation' | 'behavioral_activation';
  activityRecommendations?: ActivityRecommendation[];
  culturalAdaptation: {
    language: 'hindi' | 'english' | 'mixed';
    culturalReferences: string[];
    respectLevel: 'formal' | 'casual' | 'mixed';
  };
  emotionalSupport: {
    empathyLevel: number;
    validationStrategies: string[];
    copingStrategies: string[];
  };
  riskAssessment: {
    level: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    indicators: string[];
    immediateActions: string[];
    confidence?: number;
  };
  followUp: {
    recommended: boolean;
    timeframe: string;
    focus: string[];
  };
  resources: {
    selfHelp: string[];
    professional: string[];
    emergency: string[];
  };
  adaptationTriggers?: string[]; // For real-time adaptation
}

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
    emotionalState?: any;
    stressLevel?: number;
    recentTriggers?: string[];
    copingStrategies?: string[];
  };
  // Enhanced for activity-based therapy
  activityPreferences: {
    preferredTypes: ActivityType[];
    sessionDuration: number; // minutes
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    interactionStyle: 'conversational' | 'structured' | 'guided';
    culturalAdaptationLevel: number; // 1-10 scale
  };
  therapeuticProgress: {
    completedActivities: string[];
    skillsLearned: string[];
    currentPhase: 'assessment' | 'skill_building' | 'practice' | 'maintenance';
    engagementHistory: EngagementMetrics[];
    adaptationHistory: ActivityAdaptation[];
  };
  culturalProfile: CulturalContext;
}

export interface ConversationContext {
  sessionId: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    emotionalAnalysis?: any;
  }>;
  currentTopic?: string;
  therapeuticPhase: 'rapport_building' | 'assessment' | 'intervention' | 'consolidation' | 'closure';
  culturalContext: {
    languagePreference: string;
    culturalSensitivities: string[];
    communicationStyle: string;
  };
  // Enhanced conversation memory integration
  continuityBridge?: ContinuityBridge;
  conversationFlow?: string;
  emotionalArc?: string;
  progressAcknowledgment?: string;
}

// Real-time Adaptation Engine for therapeutic activities
class AdaptationEngine {
  // Removed unused adaptationHistory
  private engagementThresholds = {
    low: 0.3,
    moderate: 0.6,
    high: 0.8
  };

  async monitorUserEngagement(_sessionId: string, userResponse: any): Promise<EngagementMetrics> {
    const responseTime = userResponse.responseTime || 5000;
    const messageLength = userResponse.message?.length || 0;
    const emotionalExpression = this.assessEmotionalExpression(userResponse.message || '');
    const questionAsking = this.countQuestions(userResponse.message || '');

    const engagement: EngagementMetrics = {
      responseTime,
      messageLength,
      emotionalExpression,
      questionAsking,
      followThrough: userResponse.followThrough || 0.5,
      overallEngagement: this.calculateOverallEngagement(responseTime, messageLength, emotionalExpression, questionAsking)
    };

    return engagement;
  }

  private assessEmotionalExpression(message: string): number {
    const emotionalWords = ['feel', 'think', 'believe', 'worried', 'happy', 'sad', 'angry', 'excited'];
    const words = message.toLowerCase().split(/\s+/);
    const emotionalCount = words.filter(word => emotionalWords.includes(word)).length;
    return Math.min(1, emotionalCount / 3);
  }

  private countQuestions(message: string): number {
    const questionMarks = (message.match(/\?/g) || []).length;
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'can', 'should', 'would'];
    const words = message.toLowerCase().split(/\s+/);
    const questionWordCount = words.filter(word => questionWords.includes(word)).length;
    return Math.min(1, (questionMarks + questionWordCount) / 5);
  }

  private calculateOverallEngagement(responseTime: number, messageLength: number, emotionalExpression: number, questionAsking: number): number {
    // Normalize response time (faster = more engaged, but not too fast)
    const timeScore = responseTime < 1000 ? 0.5 : Math.max(0, 1 - (responseTime - 1000) / 30000);

    // Normalize message length (longer = more engaged, up to a point)
    const lengthScore = Math.min(1, messageLength / 100);

    // Combine all factors
    return (timeScore * 0.3) + (lengthScore * 0.3) + (emotionalExpression * 0.2) + (questionAsking * 0.2);
  }

  async detectAdaptationNeeds(engagement: EngagementMetrics, session: ActivitySession): Promise<string[]> {
    const needs: string[] = [];

    if (engagement.overallEngagement < this.engagementThresholds.low) {
      needs.push('increase_engagement');
    }

    if (engagement.responseTime > 20000) {
      needs.push('simplify_content');
    }

    if (engagement.emotionalExpression < 0.2) {
      needs.push('encourage_expression');
    }

    if (session.realTimeMetrics.stressLevel > 8) {
      needs.push('reduce_intensity');
    }

    return needs;
  }

  async generateAdaptationStrategy(needs: string[], culturalContext: CulturalContext): Promise<any> {
    const strategies: any = {};

    needs.forEach(need => {
      switch (need) {
        case 'increase_engagement':
          strategies.engagement = {
            addInteractiveElements: true,
            usePersonalExamples: true,
            shortenResponses: true
          };
          break;
        case 'simplify_content':
          strategies.simplification = {
            useSimpleLanguage: true,
            breakIntoSteps: true,
            addVisualCues: true
          };
          break;
        case 'encourage_expression':
          strategies.expression = {
            askOpenEndedQuestions: true,
            validateEmotions: true,
            shareRelatable: true
          };
          break;
        case 'reduce_intensity':
          strategies.intensity = {
            switchToCalming: true,
            useGroundingTechniques: true,
            slowerPace: true
          };
          break;
      }
    });

    // Apply cultural adaptations
    if (culturalContext.communicationStyle === 'indirect') {
      strategies.cultural = {
        useIndirectApproach: true,
        respectHierarchy: true,
        avoidDirectConfrontation: true
      };
    }

    return strategies;
  }
}

export class AIOrchestrator {
  private activeContexts: Map<string, ConversationContext> = new Map();
  private userProfiles: Map<string, UserContext> = new Map();
  private interventionStrategies: Map<string, any> = new Map();

  // Enhanced for activity-based therapy
  private activeSessions: Map<string, ActivitySession> = new Map();
  private activityRegistry: Map<ActivityType, any> = new Map();
  private culturalIntelligence: Map<string, CulturalContext> = new Map();
  private adaptationEngine: AdaptationEngine;

  // *** NEW *** Add assessment engine and active assessment state
  private adaptiveAssessmentEngine: AdaptiveAssessmentEngine;
  private activeAssessments: Map<string, SimpleAssessmentSession> = new Map();

  constructor() {
    this.initializeInterventionStrategies();
    this.initializeActivityRegistry();
    this.adaptationEngine = new AdaptationEngine();
    // *** NEW *** Initialize the assessment engine
    this.adaptiveAssessmentEngine = new AdaptiveAssessmentEngine();
    console.log('🧠 Enhanced AI Orchestrator initialized with activity AND assessment coordination');
  }

  // Main method to generate therapeutic responses
  async generateTherapeuticResponse(
    userMessage: string,
    userId: string,
    context: {
      session?: any;
      emotionalAnalysis?: any;
      riskAssessment?: any;
      adaptations?: any[];
      onLoadingUpdate?: (state: any) => void;
    } = {}
  ): Promise<TherapeuticResponse> {
    console.log('🚀 Enhanced AI Orchestrator called with message:', userMessage.substring(0, 50) + '...');
    
    // Start loading indicator
    loadingManager.startLoading(userId, context.onLoadingUpdate);
    
    try {
      // Get or create user context
      let userContext;
      try {
        userContext = await this.getUserContext(userId);
      } catch (error) {
        console.error('🚨 getUserContext failed:', error);
        throw error; // Re-throw to trigger main catch
      }

      let conversationContext;
      try {
        conversationContext = await this.getConversationContext(context.session?.sessionId || 'default', userId);
      } catch (error) {
        console.error('🚨 getConversationContext failed:', error);
        throw error; // Re-throw to trigger main catch
      }

      // *** NEW ASSESSMENT LOGIC ***
      const lowerMessage = userMessage.toLowerCase().trim();

      // === CHECK 0: Is this a simple greeting? ===
      const greetings = ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'hola', 'sup', 'yo', 'hii', 'heya', 'helo', 'howdy', 'greetings'];
      const isSimpleGreeting = greetings.some(greeting => {
        const cleanMsg = lowerMessage.replace(/[!.?,\s]/g, '');
        return cleanMsg === greeting || cleanMsg === greeting + 's' || cleanMsg === 'hi' + greeting;
      });

      if (isSimpleGreeting) {
        console.log('Simple greeting detected, returning friendly response');
        const languagePref = userContext.culturalProfile?.languagePreference || 'mixed';
        const greetingResponses = languagePref === 'mixed' ? [
          "Hey! How are you doing today? 😊",
          "Hi there! What's on your mind?",
          "Hello! I'm here to listen। How can I support you today?",
          "Hey! Good to see you। How's your day been?",
          "Hi! I'm here for you। What would you like to talk about?"
        ] : [
          "Hey! How are you doing today? 😊",
          "Hi there! What's on your mind?",
          "Hello! I'm here to listen. How can I support you today?",
          "Hey! Good to see you. How's your day been?",
          "Hi! I'm here for you. What would you like to talk about?"
        ];
        
        const greetingMessage = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
        loadingManager.completeLoading(userId);
        return this.createSimpleTherapeuticResponse(greetingMessage, 'guided_conversation');
      }

      // === CHECK 1: Is user in an active assessment? ===
      if (this.activeAssessments.has(userId)) {
        console.log('User is in an active assessment. Processing response...');
        const session = this.activeAssessments.get(userId)!;
        const questions = this.adaptiveAssessmentEngine['assessmentQuestions'].get(session.assessmentType) || [];
        const currentQuestion = questions[session.currentStep];

        // Process the response
        const { assessmentResponse, immediateIntervention } = await this.adaptiveAssessmentEngine.processResponseWithAdaptation(
          session.sessionId,
          userMessage,
          currentQuestion,
          session
        );

        if (immediateIntervention) {
          // Handle crisis
          this.activeAssessments.delete(userId); // End assessment
          return this.generateFallbackResponse("CRISIS DETECTED", userId); // (You'd have better crisis logic here)
        }

        session.responses.push(assessmentResponse);
        session.currentStep++;

        // Check if assessment is complete
        if (session.currentStep >= session.totalSteps) {
          this.activeAssessments.delete(userId); // End session
          const result = await this.adaptiveAssessmentEngine['generateAssessmentResult'](session);
          const completionMessage = `Thank you for completing the assessment. Your score is ${result.totalScore}, which indicates a ${result.riskLevel} level. I've saved this to your profile, and we can talk about these results.`;
          
          // Here you would save the result to Firebase
          // await firebaseService.saveAssessmentResult(...)
          
          return this.createSimpleTherapeuticResponse(completionMessage, 'guided_conversation');
        }

        // Get next question
        const nextQuestion = questions[session.currentStep];
        const nextQuestionPrompt = this.adaptiveAssessmentEngine['adaptQuestionForUser'](nextQuestion, session.culturalAdaptations);
        
        return this.createSimpleTherapeuticResponse(nextQuestionPrompt, 'assessment_activity');
      }

      // === CHECK 2: Does user want to START an assessment? ===
      if (lowerMessage.includes('start assessment') || lowerMessage.includes('take a test') || 
          lowerMessage.includes('phq-9') || lowerMessage.includes('gad-7')) {
        console.log('Assessment trigger detected. Starting assessment...');
        
        // (We'll hardcode PHQ-9 for now)
        const assessmentType = lowerMessage.includes('gad-7') ? 'gad7' : 'phq9';
        
        // We need a SimpleUserProfile. Let's create it from our UserContext
        const simpleProfile: SimpleUserProfile = {
          uid: userContext.userId,
          age: userContext.demographics.age || 25,
          location: userContext.demographics.location || 'India',
          culturalBackground: userContext.culturalProfile
        };

        const newSession = await this.adaptiveAssessmentEngine.startAssessment(assessmentType, simpleProfile);
        this.activeAssessments.set(userId, newSession);

        const questions = this.adaptiveAssessmentEngine['assessmentQuestions'].get(newSession.assessmentType) || [];
        const firstQuestion = questions[0];
        const firstQuestionPrompt = this.adaptiveAssessmentEngine['adaptQuestionForUser'](firstQuestion, newSession.culturalAdaptations);
        
        return this.createSimpleTherapeuticResponse(firstQuestionPrompt, 'assessment_activity');
      }

      // === END OF NEW ASSESSMENT LOGIC ===

      // Generate conversation continuity bridge
      let continuityBridge;
      try {
        continuityBridge = conversationMemory.generateContinuityBridge(userId, userMessage);
      } catch (error) {
        console.warn('Continuity bridge generation failed:', error);
        continuityBridge = null;
      }

      // Get conversation context for natural flow
      let memoryContext;
      try {
        memoryContext = conversationMemory.getConversationContext(userId, 3);
      } catch (error) {
        console.warn('Memory context retrieval failed:', error);
        memoryContext = { conversationFlow: '', emotionalArc: '' };
      }

      // Generate progress acknowledgment
      let progressAcknowledgment;
      try {
        progressAcknowledgment = conversationMemory.generateProgressAcknowledgment(userId);
      } catch (error) {
        console.warn('Progress acknowledgment generation failed:', error);
        progressAcknowledgment = '';
      }

      // Enhance conversation context with memory
      conversationContext.continuityBridge = continuityBridge;
      conversationContext.conversationFlow = memoryContext.conversationFlow;
      conversationContext.emotionalArc = memoryContext.emotionalArc;
      conversationContext.progressAcknowledgment = progressAcknowledgment;

      // Analyze user message comprehensively
      loadingManager.updateState(userId, { stage: 'analyzing', progress: 20, message: 'Analyzing your message...' });
      let messageAnalysis;
      try {
        messageAnalysis = await this.analyzeUserMessage(userMessage, userContext, conversationContext);
        console.log('✅ Message analysis completed successfully');
      } catch (error) {
        console.error('🚨 analyzeUserMessage failed:', error);
        throw error;
      }

      // Determine intervention strategy
      let interventionStrategy;
      try {
        interventionStrategy = await this.determineInterventionStrategy(
          messageAnalysis,
          userContext,
          context.riskAssessment
        );
        console.log('✅ Intervention strategy determined successfully');
      } catch (error) {
        console.error('🚨 determineInterventionStrategy failed:', error);
        throw error;
      }

      // --- NEW: Fetch Recent Activities ---
      let recentActivities: UserActivity[] = [];
      try {
        recentActivities = await firebaseService.getRecentUserActivities(userId, 2); // Get last 2 activities
        console.log(`✅ Fetched ${recentActivities.length} recent activities for context.`);
      } catch (error) {
        console.warn('Continuity Error: Could not fetch recent activities', error);
      }
      // --- END NEW ---

      // Generate culturally adapted response
      loadingManager.updateState(userId, { stage: 'generating', progress: 50, message: 'Generating response...' });
      let response;
      try {
        response = await this.generateCulturallyAdaptedResponse(
          userMessage,
          messageAnalysis,
          interventionStrategy,
          userContext,
          conversationContext,
          recentActivities // <-- NEW PARAMETER
        );
        console.log('✅ Response generation completed successfully');
      } catch (error) {
        console.error('🚨 generateCulturallyAdaptedResponse failed:', error);
        throw error;
      }

      // Record conversation turn in memory
      loadingManager.updateState(userId, { stage: 'processing', progress: 80, message: 'Finalizing...' });
      try {
        const topics = this.extractTopicsFromAnalysis(messageAnalysis);
        const therapeuticElements = this.extractTherapeuticElements(response);

        conversationMemory.recordConversationTurn(
          userId,
          userMessage,
          response.message,
          messageAnalysis.emotionalAnalysis,
          topics,
          therapeuticElements
        );
      } catch (error) {
        console.warn('Conversation recording failed:', error);
      }

      // Update conversation context
      try {
        this.updateConversationContext(conversationContext, userMessage, response, messageAnalysis);
      } catch (error) {
        console.warn('Conversation context update failed:', error);
      }

      // Complete loading
      loadingManager.completeLoading(userId);
      
      return response;
    } catch (error) {
      console.error('🚨 AI Orchestrator MAIN ERROR:', error);
      console.error('🚨 Error name:', (error as Error).name);
      console.error('🚨 Error message:', (error as Error).message);
      console.error('🚨 Error stack:', (error as Error).stack);
      console.error('🚨 User message that caused error:', userMessage);
      console.error('🚨 User ID:', userId);
      
      // Complete loading even on error
      loadingManager.completeLoading(userId);
      
      return this.generateFallbackResponse(userMessage, userId);
    }
  }

  // Analyze user message using multiple AI services
  private async analyzeUserMessage(
    message: string,
    userContext: UserContext,
    conversationContext: ConversationContext
  ): Promise<any> {
    // Initialize analysis with proper default structures
    const analysis = {
      textAnalysis: {
        themes: [],
        emotions: [],
        cognitivePatterns: [],
        behavioralIndicators: [],
        strengths: []
      },
      emotionalAnalysis: {
        primaryEmotion: 'neutral',
        emotionIntensity: 0.1,
        detectedEmotions: {},
        valence: 0,
        arousal: 0
      },
      culturalAnalysis: {
        primaryCulture: 'mixed' as 'north_indian' | 'south_indian' | 'east_indian' | 'west_indian' | 'mixed',
        languagePreference: 'mixed' as 'hindi' | 'english' | 'mixed',
        familyStructure: 'nuclear' as 'nuclear' | 'joint' | 'extended' | 'single_parent',
        communicationStyle: 'direct' as 'direct' | 'indirect' | 'hierarchical' | 'egalitarian',
        socioeconomicContext: 'urban' as 'urban' | 'semi_urban' | 'rural',
        generationalFactors: [] as string[],
        culturalSensitivities: [] as string[]
      },
      riskAnalysis: {
        level: 'none' as 'none' | 'low' | 'moderate' | 'high' | 'severe',
        indicators: [],
        protectiveFactors: [],
        immediateIntervention: false
      },
      therapeuticNeeds: []
    };

    try {
      // Basic text analysis - with error handling
      try {
        analysis.textAnalysis = await this.analyzeTextContent(message) || analysis.textAnalysis;
      } catch (error) {
        console.warn('Text analysis failed:', error);
      }

      // Emotional analysis - with error handling
      try {
        analysis.emotionalAnalysis = await this.analyzeEmotionalContent(message) || analysis.emotionalAnalysis;
      } catch (error) {
        console.warn('Emotional analysis failed:', error);
      }

      // Cultural context analysis - with error handling
      try {
        const conversationHistory = conversationContext.conversationHistory || [];
        analysis.culturalAnalysis = await culturalIntelligence.analyzeCulturalContext(userContext, conversationHistory) || analysis.culturalAnalysis;
      } catch (error) {
        console.warn('Cultural analysis failed:', error);
      }

      // Risk assessment - with error handling
      try {
        analysis.riskAnalysis = await this.assessRiskFactors(message, userContext, conversationContext) || analysis.riskAnalysis;
      } catch (error) {
        console.warn('Risk assessment failed:', error);
      }

      // Identify therapeutic needs - with error handling
      try {
        analysis.therapeuticNeeds = await this.identifyTherapeuticNeeds(message, analysis) as never[] || [];
      } catch (error) {
        console.warn('Therapeutic needs identification failed:', error);
      }

      return analysis;
    } catch (error) {
      console.error('Message analysis error:', error);
      // Return analysis with default values even if everything fails
      return analysis;
    }
  }

  private async analyzeTextContent(message: string): Promise<any> {
    try {
      // Use real text analysis instead of calling Gemini for basic analysis
      const words = message.split(/\s+/).filter(w => w.length > 0);
      const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);

      // Extract themes
      const themes = this.extractThemes(message);

      // Identify emotions
      const emotions = this.identifyEmotions(message);

      // Analyze cognitive patterns
      const cognitivePatterns = this.analyzeCognitivePatterns(message);

      // Identify behavioral indicators
      const behavioralIndicators = this.identifyBehavioralIndicators(message);

      // Identify strengths
      const strengths = this.identifyStrengths(message);

      return {
        themes,
        emotions,
        cognitivePatterns,
        behavioralIndicators,
        strengths,
        wordCount: words.length,
        sentenceCount: sentences.length,
        complexity: sentences.length > 0 ? words.length / sentences.length : 0
      };
    } catch (error) {
      console.error('Text analysis error:', error);
      return {
        themes: [],
        emotions: [],
        cognitivePatterns: [],
        behavioralIndicators: [],
        strengths: []
      };
    }
  }

  private extractThemes(message: string): string[] {
    const lowerMessage = message.toLowerCase();
    const themes: string[] = [];

    const themeKeywords = {
      family: ['family', 'parents', 'mom', 'dad', 'परिवार', 'माता-पिता'],
      work: ['work', 'job', 'career', 'office', 'काम', 'नौकरी'],
      relationships: ['friend', 'relationship', 'love', 'दोस्त', 'रिश्ता'],
      health: ['health', 'sick', 'tired', 'स्वास्थ्य', 'बीमार'],
      education: ['study', 'exam', 'school', 'college', 'पढ़ाई', 'परीक्षा'],
      money: ['money', 'financial', 'expensive', 'पैसा', 'आर्थिक']
    };

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        themes.push(theme);
      }
    });

    return themes;
  }

  private identifyEmotions(message: string): string[] {
    const lowerMessage = message.toLowerCase();
    const emotions: string[] = [];

    const emotionKeywords = {
      anxiety: ['worried', 'nervous', 'anxious', 'panic', 'चिंता', 'घबराहट'],
      depression: ['sad', 'depressed', 'hopeless', 'empty', 'उदास', 'निराश'],
      stress: ['stressed', 'overwhelmed', 'pressure', 'तनाव', 'दबाव'],
      anger: ['angry', 'frustrated', 'mad', 'irritated', 'गुस्सा', 'नाराज'],
      joy: ['happy', 'excited', 'good', 'great', 'खुश', 'अच्छा'],
      fear: ['scared', 'afraid', 'terrified', 'डर', 'भयभीत']
    };

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        emotions.push(emotion);
      }
    });

    return emotions;
  }

  private analyzeCognitivePatterns(message: string): string[] {
    const patterns: string[] = [];
    const lowerMessage = message.toLowerCase();

    // All-or-nothing thinking
    if (lowerMessage.includes('always') || lowerMessage.includes('never') ||
      lowerMessage.includes('हमेशा') || lowerMessage.includes('कभी नहीं')) {
      patterns.push('all_or_nothing_thinking');
    }

    // Catastrophizing
    if (lowerMessage.includes('worst') || lowerMessage.includes('terrible') ||
      lowerMessage.includes('disaster') || lowerMessage.includes('बर्बाद')) {
      patterns.push('catastrophizing');
    }

    // Mind reading
    if (lowerMessage.includes('they think') || lowerMessage.includes('everyone thinks') ||
      lowerMessage.includes('लोग सोचते हैं')) {
      patterns.push('mind_reading');
    }

    return patterns;
  }

  private identifyBehavioralIndicators(message: string): string[] {
    const indicators: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Avoidance
    if (lowerMessage.includes('avoid') || lowerMessage.includes('skip') ||
      lowerMessage.includes('बचना') || lowerMessage.includes('छोड़ना')) {
      indicators.push('avoidance');
    }

    // Social withdrawal
    if (lowerMessage.includes('alone') || lowerMessage.includes('isolate') ||
      lowerMessage.includes('अकेला') || lowerMessage.includes('अलग')) {
      indicators.push('social_withdrawal');
    }

    // Sleep issues
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') ||
      lowerMessage.includes('नींद') || lowerMessage.includes('अनिद्रा')) {
      indicators.push('sleep_disturbance');
    }

    return indicators;
  }

  private identifyStrengths(message: string): string[] {
    const strengths: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Seeking help
    if (lowerMessage.includes('help') || lowerMessage.includes('support') ||
      lowerMessage.includes('मदद') || lowerMessage.includes('सहारा')) {
      strengths.push('help_seeking');
    }

    // Self-awareness
    if (lowerMessage.includes('realize') || lowerMessage.includes('understand') ||
      lowerMessage.includes('समझना') || lowerMessage.includes('एहसास')) {
      strengths.push('self_awareness');
    }

    // Resilience
    if (lowerMessage.includes('try') || lowerMessage.includes('effort') ||
      lowerMessage.includes('कोशिश') || lowerMessage.includes('प्रयास')) {
      strengths.push('resilience');
    }

    return strengths;
  }

  // Extract topics from message analysis for conversation memory
  private extractTopicsFromAnalysis(messageAnalysis: any): string[] {
    const topics: string[] = [];

    // Extract from text analysis themes
    if (messageAnalysis.textAnalysis?.themes) {
      topics.push(...messageAnalysis.textAnalysis.themes);
    }

    // Extract from cultural analysis
    if (messageAnalysis.culturalAnalysis) {
      const cultural = messageAnalysis.culturalAnalysis;
      topics.push(cultural.primaryCulture, cultural.familyStructure, cultural.communicationStyle);
      topics.push(...cultural.generationalFactors);
      topics.push(...cultural.culturalSensitivities);
    }

    // Extract from therapeutic needs
    if (messageAnalysis.therapeuticNeeds) {
      topics.push(...messageAnalysis.therapeuticNeeds);
    }

    return Array.from(new Set(topics)); // Remove duplicates
  }

  // Extract therapeutic elements from response for conversation memory
  private extractTherapeuticElements(response: TherapeuticResponse): any[] {
    const elements: any[] = [];

    // Add main intervention as therapeutic element
    elements.push({
      type: response.interventionType,
      content: response.message.substring(0, 100),
      effectiveness: 0.8 // Default effectiveness, could be measured later
    });

    // Add validation strategies
    response.emotionalSupport.validationStrategies.forEach(strategy => {
      elements.push({
        type: 'validation',
        content: strategy,
        effectiveness: 0.7
      });
    });

    // Add coping strategies
    response.emotionalSupport.copingStrategies.forEach(strategy => {
      elements.push({
        type: 'coping_strategy',
        content: strategy,
        effectiveness: 0.6
      });
    });

    return elements;
  }

  // Enhanced conversation continuity prompt section
  private buildConversationContinuityPrompt(conversationContext: ConversationContext): string {
    let continuityPrompt = '';

    // Add conversation continuity if available
    if (conversationContext.continuityBridge) {
      const bridge = conversationContext.continuityBridge;

      continuityPrompt += `CONVERSATION MEMORY & CONTINUITY:\n`;

      if (bridge.previousSessionSummary) {
        continuityPrompt += `Previous conversation: ${bridge.previousSessionSummary}\n`;
      }

      if (bridge.emotionalJourney) {
        continuityPrompt += `Their emotional journey: ${bridge.emotionalJourney}\n`;
      }

      if (bridge.progressMade.length > 0) {
        continuityPrompt += `Progress they've made: ${bridge.progressMade.join(', ')}\n`;
      }

      if (bridge.ongoingConcerns.length > 0) {
        continuityPrompt += `Ongoing concerns to be mindful of: ${bridge.ongoingConcerns.join(', ')}\n`;
      }

      if (bridge.naturalTransitions.length > 0) {
        continuityPrompt += `Natural ways to reference our history: ${bridge.naturalTransitions.slice(0, 2).join(' OR ')}\n`;
        continuityPrompt += `**Use these transitions to show understanding without explicit memory statements**\n`;
      }
    }

    // Add progress acknowledgment if available
    if (conversationContext.progressAcknowledgment) {
      continuityPrompt += `PROGRESS TO NATURALLY ACKNOWLEDGE: ${conversationContext.progressAcknowledgment}\n`;
      continuityPrompt += `**Show this progress through your tone and understanding, not by stating "you've made progress"**\n`;
    }

    // Add conversation flow context
    if (conversationContext.conversationFlow) {
      continuityPrompt += `CONVERSATION FLOW PATTERN: ${conversationContext.conversationFlow}\n`;
    }

    // Add emotional arc context
    if (conversationContext.emotionalArc) {
      continuityPrompt += `EMOTIONAL PATTERN: ${conversationContext.emotionalArc}\n`;
    }

    // Add recent conversation history for immediate context
    if (conversationContext.conversationHistory && conversationContext.conversationHistory.length > 0) {
      const recentMessages = conversationContext.conversationHistory.slice(-4);
      continuityPrompt += `RECENT CONVERSATION CONTEXT:\n`;
      recentMessages.forEach((msg, index) => {
        const role = msg.role === 'user' ? 'They said' : 'You responded';
        const preview = msg.content.substring(0, 80) + (msg.content.length > 80 ? '...' : '');
        continuityPrompt += `${index + 1}. ${role}: "${preview}"\n`;
      });
    }

    if (continuityPrompt) {
      continuityPrompt = `${continuityPrompt}\n`;
      continuityPrompt += `MEMORY INTEGRATION INSTRUCTIONS:\n`;
      continuityPrompt += `- **DO NOT** state "I remember..." or "Last time you said..." or "Previously you mentioned..." - these sound robotic and clinical\n`;
      continuityPrompt += `- **DO** use this information to show you remember naturally through your understanding and responses\n`;
      continuityPrompt += `- **Example:** If they previously talked about exam stress and now say "I'm tired," respond with "That makes sense, especially with all the exam pressure you've been under" rather than "I remember you mentioned exam stress"\n`;
      continuityPrompt += `- **Example:** If they shared family conflict before and now mention feeling alone, you might say "It sounds like things at home are still weighing on you" instead of "Last time you told me about family issues"\n`;
      continuityPrompt += `- **Natural Integration:** Weave their history into your understanding - let it inform your empathy and insights without explicitly referencing it\n`;
      continuityPrompt += `- **Progress Acknowledgment:** Notice and acknowledge growth naturally: "You seem to be handling this differently than before" rather than "I remember when you struggled with this"\n`;
      continuityPrompt += `- **Emotional Continuity:** Show awareness of their emotional journey through your tone and understanding, not through explicit memory statements\n`;
      continuityPrompt += `- **Build Depth:** Use what you know to offer deeper, more personalized support that shows you truly understand their unique situation\n`;
      continuityPrompt += `- **Cultural Consistency:** Maintain awareness of their cultural context and communication preferences without restating them\n`;
      continuityPrompt += `- **Evolving Support:** Don't repeat the same advice - build on previous conversations to offer evolved, deeper insights\n`;
      continuityPrompt += `- **Authentic Connection:** Make them feel truly seen and remembered as a whole person through your natural understanding, not through memory recitation\n`;
      continuityPrompt += `\n**CONTEXT-SPECIFIC MEMORY INTEGRATION:**\n`;
      continuityPrompt += `- **Academic Stress Context:** If they mentioned exam pressure before, show understanding: "With everything you're juggling academically..." instead of "I remember you mentioned exams"\n`;
      continuityPrompt += `- **Family Dynamics Context:** If family issues were discussed, show awareness: "Given how complex things are at home..." rather than "Last time you talked about family problems"\n`;
      continuityPrompt += `- **Emotional Growth Context:** If they've shown progress, acknowledge naturally: "You're approaching this with more clarity now" instead of "You've improved since we last talked"\n`;
      continuityPrompt += `- **Cultural Context:** Maintain cultural sensitivity based on previous conversations without restating their background\n`;
      continuityPrompt += `- **Crisis Context:** If they've had difficult moments, show gentle awareness without rehashing: "I can see you're working through a lot right now"\n\n`;
    }

    return continuityPrompt;
  }

  private async analyzeEmotionalContent(message: string): Promise<any> {
    // Use emotion detection service for comprehensive emotional analysis
    const emotionalKeywords = {
      anxiety: ['worried', 'nervous', 'scared', 'panic', 'चिंता', 'घबराहट'],
      depression: ['sad', 'hopeless', 'empty', 'worthless', 'उदास', 'निराश'],
      stress: ['overwhelmed', 'pressure', 'burden', 'तनाव', 'दबाव'],
      anger: ['frustrated', 'angry', 'mad', 'irritated', 'गुस्सा', 'नाराज'],
      joy: ['happy', 'excited', 'good', 'great', 'खुश', 'अच्छा']
    };

    const lowerMessage = message.toLowerCase();
    const detectedEmotions: any = {};

    Object.entries(emotionalKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
      if (matches.length > 0) {
        detectedEmotions[emotion] = {
          intensity: Math.min(1, matches.length * 0.3),
          keywords: matches
        };
      }
    });

    return {
      primaryEmotion: Object.keys(detectedEmotions)[0] || 'neutral',
      emotionIntensity: Math.max(...Object.values(detectedEmotions).map((e: any) => e.intensity), 0.1),
      detectedEmotions,
      valence: this.calculateValence(detectedEmotions),
      arousal: this.calculateArousal(detectedEmotions)
    };
  }

  // REPLACED: This method has been replaced with the dedicated culturalIntelligence service
  // The culturalIntelligence service provides comprehensive cultural analysis with:
  // - Enhanced cultural profiling and context analysis
  // - Multi-layered cultural adaptation capabilities
  // - Cultural sensitivity validation
  // - Therapeutic content adaptation for Indian cultural contexts
  // - Family dynamics, religious context, and generational factor analysis
  // 
  // Usage: culturalIntelligence.analyzeCulturalContext(userContext, conversationHistory)

  private async assessRiskFactors(
    message: string,
    userContext: UserContext,
    _conversationContext: ConversationContext
  ): Promise<any> {
    // Default risk assessment structure
    const defaultRiskAssessment = {
      level: 'none' as 'none' | 'low' | 'moderate' | 'high' | 'severe',
      indicators: [] as string[],
      protectiveFactors: [] as string[],
      immediateIntervention: false
    };

    try {
      const riskIndicators = {
        suicidalIdeation: ['suicide', 'kill myself', 'end it all', 'आत्महत्या', 'मरना चाहता'],
        selfHarm: ['hurt myself', 'cut', 'harm', 'खुद को नुकसान'],
        hopelessness: ['no hope', 'pointless', 'no future', 'कोई उम्मीद नहीं', 'बेकार'],
        isolation: ['alone', 'no one', 'lonely', 'अकेला', 'कोई नहीं'],
        substanceUse: ['drink', 'drugs', 'alcohol', 'शराब', 'नशा']
      };

      const protectiveFactors = {
        socialSupport: ['friends', 'family', 'support', 'दोस्त', 'परिवार', 'सहारा'],
        copingStrategies: ['meditation', 'exercise', 'music', 'ध्यान', 'व्यायाम'],
        futureOrientation: ['future', 'goals', 'dreams', 'भविष्य', 'सपने'],
        helpSeeking: ['help', 'therapy', 'counseling', 'मदद', 'सलाह']
      };

      const lowerMessage = message.toLowerCase();
      const riskAssessment = { ...defaultRiskAssessment };

      // Check for risk indicators
      Object.entries(riskIndicators).forEach(([risk, keywords]) => {
        const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
        if (matches.length > 0) {
          riskAssessment.indicators.push(risk);
        }
      });

      // Check for protective factors
      Object.entries(protectiveFactors).forEach(([factor, keywords]) => {
        const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
        if (matches.length > 0) {
          riskAssessment.protectiveFactors.push(factor);
        }
      });

      // Determine risk level
      if (riskAssessment.indicators.includes('suicidalIdeation')) {
        riskAssessment.level = 'severe';
        riskAssessment.immediateIntervention = true;
      } else if (riskAssessment.indicators.length >= 2) {
        riskAssessment.level = 'high';
      } else if (riskAssessment.indicators.length === 1) {
        riskAssessment.level = 'moderate';
      } else if (userContext?.mentalHealthHistory?.riskFactors?.length > 0) {
        riskAssessment.level = 'low';
      }

      return riskAssessment;
    } catch (error) {
      console.error('Risk assessment error:', error);
      return defaultRiskAssessment;
    }
  }

  private async identifyTherapeuticNeeds(_message: string, analysis: any): Promise<string[]> {
    const needs: string[] = [];

    // Based on emotional analysis
    if (analysis.emotionalAnalysis.primaryEmotion === 'anxiety') {
      needs.push('anxiety_management', 'grounding_techniques');
    }
    if (analysis.emotionalAnalysis.primaryEmotion === 'depression') {
      needs.push('mood_enhancement', 'behavioral_activation');
    }
    if (analysis.emotionalAnalysis.primaryEmotion === 'stress') {
      needs.push('stress_management', 'relaxation_techniques');
    }

    // Based on risk analysis
    if (analysis.riskAnalysis.level !== 'none') {
      needs.push('crisis_intervention', 'safety_planning');
    }

    // Based on cultural context
    if (analysis.culturalAnalysis.familyStructure === 'joint' || analysis.culturalAnalysis.familyStructure === 'extended') {
      needs.push('family_therapy_techniques');
    }
    if (analysis.culturalAnalysis.generationalFactors.includes('academic_pressure') ||
      analysis.culturalAnalysis.culturalSensitivities.includes('academic_achievement')) {
      needs.push('academic_stress_management');
    }

    return needs;
  }

  private async determineInterventionStrategy(
    messageAnalysis: any,
    _userContext: UserContext,
    _riskAssessment?: any
  ): Promise<any> {
    // Ensure riskAnalysis exists with proper defaults
    const riskLevel = messageAnalysis?.riskAnalysis?.level || 'none';
    const therapeuticNeeds = messageAnalysis?.therapeuticNeeds || [];

    // Crisis intervention takes priority
    if (riskLevel === 'severe') {
      return {
        primary: 'crisis_intervention',
        secondary: ['validation', 'safety_planning'],
        approach: 'directive',
        urgency: 'immediate'
      };
    }

    // High risk requires structured intervention
    if (riskLevel === 'high') {
      return {
        primary: 'risk_management',
        secondary: ['validation', 'cognitive_restructuring'],
        approach: 'supportive_directive',
        urgency: 'high'
      };
    }

    // Standard therapeutic interventions based on needs
    let primaryIntervention = 'validation'; // Default

    if (therapeuticNeeds.includes('anxiety_management')) {
      primaryIntervention = 'mindfulness';
    } else if (therapeuticNeeds.includes('mood_enhancement')) {
      primaryIntervention = 'behavioral_activation';
    } else if (therapeuticNeeds.includes('stress_management')) {
      primaryIntervention = 'cognitive_restructuring';
    }

    return {
      primary: primaryIntervention,
      secondary: ['validation', 'psychoeducation'],
      approach: 'collaborative',
      urgency: 'standard'
    };
  }

  private async generateCulturallyAdaptedResponse(
    userMessage: string,
    messageAnalysis: any,
    interventionStrategy: any,
    userContext: UserContext,
    _conversationContext: ConversationContext,
    recentActivities: UserActivity[] // <-- NEW PARAMETER
  ): Promise<TherapeuticResponse> {
    // Build culturally sensitive prompt
    const culturalContext = messageAnalysis.culturalAnalysis;
    const languagePreference = culturalContext.languagePreference;
    const culturalThemes = [
      culturalContext.primaryCulture,
      culturalContext.familyStructure,
      culturalContext.communicationStyle,
      ...culturalContext.generationalFactors,
      ...culturalContext.culturalSensitivities
    ].filter(Boolean);

    // Detect user's preferred response format
    const responseFormat = this.detectResponseFormat(userMessage);

    // --- NEW: Build Recent Activity Prompt String ---
    let recentActivityPrompt = 'No recent activity in other app sections.';
    if (recentActivities && recentActivities.length > 0) {
      // Format the activity data for the prompt
      recentActivityPrompt = recentActivities.map(act => {
        const timeAgo = Math.round((new Date().getTime() - act.timestamp.getTime()) / (1000 * 60)); // minutes ago
        if (act.type === 'wrote_journal_entry') {
          return `- User just wrote a journal entry (${timeAgo} mins ago) with mood: ${act.metadata.mood}`;
        }
        if (act.type === 'completed_voice_session') {
          return `- User just completed a voice therapy exercise (${timeAgo} mins ago): ${act.metadata.exercise} (Score: ${act.metadata.points})`;
        }
        if (act.type === 'completed_assessment') {
          return `- User just completed a ${act.metadata.assessmentType} assessment (${timeAgo} mins ago) with score: ${act.metadata.totalScore}`;
        }
        if (act.type === 'used_emotion_detection') {
          return `- User just used emotion detection (${timeAgo} mins ago) - detected: ${act.metadata.primaryEmotion}`;
        }
        return `- User action (${timeAgo} mins ago): ${act.type}`;
      }).join('\n');
    }
    // --- END NEW ---

    let prompt = `🎯 CRITICAL: Keep your response SHORT - 2-3 paragraphs, 60-100 words total. Like texting a friend.

You are Haven, a deeply empathetic and emotionally intelligent mental health companion.
You are NOT an AI assistant - you are a trusted friend who truly understands and remembers.
Your responses feel like talking to someone who genuinely cares and has been on this journey with them.

**YOUR CORE IDENTITY:**
- A warm, wise presence that makes people feel safe to be vulnerable
- Someone who listens deeply and responds with genuine understanding
- A companion who remembers details and shows it naturally
- A guide who offers insights without being preachy or clinical

**YOUR PRIMARY MISSION:**
Create a space where the user feels:
1. Truly heard and understood (not just acknowledged)
2. Validated in their emotions (not dismissed or minimized)
3. Supported with practical, gentle guidance (not overwhelmed with advice)
4. Remembered and valued (not like talking to a stranger each time)

**CRITICAL RULES - FOLLOW STRICTLY:**

1. **BE SPECIFIC, NOT GENERIC:**
   ❌ BAD: "I understand you're going through a difficult time"
   ✅ GOOD: "It sounds like the pressure from your exam tomorrow is really weighing on you"
   
2. **VALIDATE BEFORE ADVISING:**
   - First: Acknowledge their specific emotion/situation
   - Then: Normalize it ("It's completely understandable to feel...")
   - Finally: Offer gentle guidance (if appropriate)

3. **SHOW MEMORY & CONTINUITY:**
   - Reference previous conversations naturally
   - Notice patterns in their emotions/situations
   - Celebrate progress, acknowledge setbacks
   - Make them feel like you're on this journey together

4. **MATCH THEIR ENERGY & LANGUAGE:**
   - If they're distressed: Be calm, grounding, immediate
   - If they're casual: Be friendly, conversational
   - If they're formal: Be respectful, professional
   - Use ONLY their language (English/Hindi/Mixed)

5. **ASK MEANINGFUL QUESTIONS:**
   ❌ BAD: "How are you feeling?" (too vague)
   ✅ GOOD: "What's been the hardest part about preparing for this exam?"
   ✅ GOOD: "When you feel this anxiety, where do you notice it in your body?"

6. **KEEP IT CONCISE BUT WARM:**
   - Aim for 2-3 short paragraphs (3-5 sentences each)
   - Don't ramble or over-explain
   - Every sentence should add value
   - Be warm but efficient
   - Quality over quantity

6. **NO ROBOTIC PATTERNS:**
   - Never say: "I'm here to support you", "I'm here to listen", "How can I help?"
   - Never list coping strategies unless specifically asked
   - Never sound clinical or detached
   - Never repeat the same opening phrases

7. **BE CONVERSATIONAL, NOT FORMAL:**
   - Use contractions (I'm, you're, it's)
   - Use natural transitions
   - Vary sentence length and structure
   - Sound like a real person texting a friend

User message: "${userMessage}"

---
**USER & SESSION CONTEXT:**
- What they're feeling: ${messageAnalysis?.emotionalAnalysis?.primaryEmotion || 'neutral'} (intensity: ${messageAnalysis?.emotionalAnalysis?.emotionIntensity || 0.5})
- Support level needed: ${messageAnalysis?.riskAnalysis?.level || 'none'}
- Best therapeutic approach: ${interventionStrategy.primary}
- Cultural themes to be aware of: ${culturalThemes.join(', ')}
- Language style to match: ${languagePreference}

${messageAnalysis?.riskAnalysis?.level === 'severe' || messageAnalysis?.riskAnalysis?.level === 'high' ? `
🚨 **CRISIS ALERT - IMMEDIATE INTERVENTION REQUIRED** 🚨

This person is expressing ${messageAnalysis.riskAnalysis.level} distress. They may be considering self-harm or suicide.

**YOUR IMMEDIATE RESPONSE MUST:**
1. Validate their pain specifically: "I hear how much pain you're in right now"
2. Show you're taking them seriously: "Your feelings matter, and I'm here with you"
3. Provide immediate crisis resources (Government of India Approved):
   - KIRAN Mental Health: 1800-599-0019 (Toll-Free, 24/7)
   - Tele MANAS: 14416 (Toll-Free, 24/7)
   - NIMHANS Helpline: 08046110007 (24/7)
4. Ask about immediate safety: "Are you safe right now?"
5. Stay present and engaged: "I'm here with you. Let's work through this together"
6. Offer hope without minimizing: "These feelings are temporary, even though they don't feel that way"

**DO NOT:**
- Minimize their pain ("it will get better")
- Use clichés ("everything happens for a reason")
- Be overly cheerful or dismissive
- End the conversation abruptly

**YOUR TONE:** Calm, steady, present, compassionate, direct
` : ''}

---
**RECENT USER ACTIVITY (Use this for conversational context):**
${recentActivityPrompt}

**CONTEXTUAL INSTRUCTIONS (CRITICAL):**
- **IF** the user's message is simple (e.g., "hi", "hello") AND you see a "completed_voice_session" activity, **start your response** by congratulating them (e.g., "Welcome back! Great work on finishing your 'Confidence Builder' exercise...") and then ask how they're feeling.
- **IF** the user's message is simple (e.g., "hi") AND you see a "wrote_journal_entry" activity, **start by acknowledging it** (e.g., "Hello. I see you just wrote in your journal. I'm here to listen if you'd like to talk more about what's on your mind.")
- **IF** the user's message is complex *or* there is no recent activity, just respond to the user's message as normal.

---
**CONVERSATION MEMORY & CONTINUITY:**
${this.buildConversationContinuityPrompt(_conversationContext)}

---
**USER PREFERENCES & STYLE REQUIREMENTS:**
${conversationMemory.generatePreferenceInstructions(userContext.userId)}

---
${this.getInterventionGuidelines(interventionStrategy.primary)}

---
**RESPONSE LENGTH GUIDELINE:**
Keep responses concise but warm - aim for 2-3 short paragraphs (50-100 words total).
Like texting a caring friend, not writing an essay.

**RESPONSE EXAMPLES (Use these as inspiration, not templates):**

For "I'm feeling stressed":
✅ "I can hear that stress in your words. It's completely understandable to feel this way, especially with everything you're juggling.

What's weighing on you the most right now? Sometimes just naming it can help lighten the load a bit."

For anxiety about exams:
✅ "Exam stress is so real, especially when it feels like everything's riding on it. That pressure can feel overwhelming.

What subject is giving you the most worry? Let's talk through it together."

For feeling overwhelmed:
✅ "That sounds like a lot to carry. It's okay to feel overwhelmed when there's so much on your plate.

When you're feeling this way, what usually helps you feel even a little bit lighter?"

For general check-in:
✅ "Hey! How's your day been treating you?"

For someone sharing good news:
✅ "That's wonderful! I can feel your excitement. What made this moment special for you?"

---
**ANTI-REPETITION & VARIETY:**
${_conversationContext.conversationHistory.length > 0 ? `
Your last response started with: "${_conversationContext.conversationHistory[_conversationContext.conversationHistory.length - 1]?.content?.substring(0, 50) || 'N/A'}..."

DO NOT:
- Use the same opening phrase or pattern
- Ask the same type of question
- Use the same empathy expression
- Follow the same response structure

INSTEAD - Try a different approach:
- If you validated last time, try exploring this time
- If you asked "how", try "what" or "when"
- If you were reflective, try being more direct
- If you were gentle, try being more energizing
- Vary your sentence structure and length
` : ''}

**YOUR RESPONSE STRUCTURE:**
1. **Paragraph 1 (2-3 sentences)**: Validate their feeling + normalize it
2. **Paragraph 2 (2-3 sentences)**: Offer one specific insight or gentle guidance
3. **Paragraph 3 (1-2 sentences)**: Ask a meaningful question

**RESPONSE LENGTH:**
- Total: 50-100 words (2-3 short paragraphs)
- Like texting a friend, not writing a letter
- Every sentence must add value
- Be warm but concise

**FINAL CHECKLIST:**
✅ Specific to their message (not generic)
✅ Warm and empathetic tone
✅ 2-3 short paragraphs (60-100 words MAXIMUM)
✅ One meaningful question at the end
✅ Culturally sensitive
✅ Different from last response

🎯 REMINDER: Your response MUST be SHORT - like texting a friend (60-100 words).
Don't write long paragraphs. Be concise but warm.

Now respond naturally, warmly, and concisely to their message.`;

    try {
      // Generate cultural insights for enhanced therapeutic planning
      const culturalInsights = await culturalIntelligence.generateCulturalInsights(
        userContext,
        messageAnalysis.therapeuticNeeds || []
      );

      // Add cultural insights to prompt if available
      if (culturalInsights.length > 0) {
        const insightsText = culturalInsights
          .filter(insight => insight.relevance > 0.6)
          .map(insight => `- ${insight.insight}: ${insight.therapeuticImplication}`)
          .join('\n');

        if (insightsText) {
          prompt += `\n\n**CULTURAL INSIGHTS FOR THERAPEUTIC APPROACH:**\n${insightsText}\n`;
        }
      }
      // Only use quick responses for non-emotional, explicitly requested brief answers
      if (responseFormat.type === 'one_line' &&
        (messageAnalysis?.emotionalAnalysis?.primaryEmotion || 'neutral') === 'neutral' &&
        (messageAnalysis?.riskAnalysis?.level || 'none') === 'none') {
        const quickResponse = this.generateQuickResponse(userMessage, messageAnalysis, responseFormat);
        if (quickResponse) {
          return {
            message: quickResponse,
            interventionType: interventionStrategy.primary,
            culturalAdaptation: {
              language: languagePreference,
              culturalReferences: culturalThemes,
              respectLevel: 'casual'
            },
            emotionalSupport: {
              empathyLevel: 0.8,
              validationStrategies: ['acknowledge_feelings'],
              copingStrategies: this.getCopingStrategies(messageAnalysis)
            },
            riskAssessment: {
              level: messageAnalysis?.riskAnalysis?.level || 'none',
              indicators: messageAnalysis?.riskAnalysis?.indicators || [],
              immediateActions: this.getImmediateActions(messageAnalysis?.riskAnalysis || {})
            },
            followUp: {
              recommended: false,
              timeframe: 'as needed',
              focus: []
            },
            resources: {
              selfHelp: this.getSelfHelpResources(messageAnalysis),
              professional: this.getProfessionalResources(culturalContext),
              emergency: this.getEmergencyResources()
            }
          };
        }
      }

      const context = {
        userMood: messageAnalysis?.emotionalAnalysis?.primaryEmotion || 'neutral',
        preferredLanguage: (languagePreference === 'hindi' ? 'hindi' :
          languagePreference === 'mixed' ? 'mixed' : 'english') as 'hindi' | 'mixed' | 'english',
        culturalBackground: 'indian',
        previousMessages: [] as string[],
        userPreferences: {
          interests: [] as string[],
          comfortEnvironment: '',
          avatarStyle: ''
        },
        crisisLevel: (messageAnalysis?.riskAnalysis?.level || 'none') as 'none' | 'low' | 'moderate' | 'high' | 'severe'
      };

      // 🎯 Call Gemini AI - NO FALLBACK, must work properly
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📤 AI ORCHESTRATOR: Calling Gemini API");
      console.log("User Message:", userMessage.substring(0, 100));
      console.log("Prompt preview:", prompt.substring(0, 200) + "...");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
      let rawResponse;
      try {
        rawResponse = await googleCloudAI.generateEmpathicResponse(prompt, context);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ AI ORCHESTRATOR: Received response from Gemini");
        console.log("Response message:", rawResponse?.message?.substring(0, 150));
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      } catch (error) {
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("❌ AI ORCHESTRATOR: Gemini API FAILED");
        console.error("Error:", error);
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        // Re-throw the error - NO FALLBACK
        throw error;
      }

      // 🚑 Ensure response matches SimpleAIResponse shape and handle empty/invalid messages
      let response: SimpleAIResponse;

      // Type guard to handle the response properly
      const rawResponseAny = rawResponse as any;

      // Handle the case where rawResponse is a SimpleAIResponse object
      if (rawResponseAny && typeof rawResponseAny === "object" && 'message' in rawResponseAny) {
        const aiResponse = rawResponseAny as SimpleAIResponse;
        const messageText = aiResponse.message && typeof aiResponse.message === 'string' ? aiResponse.message : '';
        response = {
          message: (messageText && messageText.trim()) || "I'm here to listen and support you. How are you feeling right now?",
          suggestedActions: Array.isArray(aiResponse.suggestedActions) ? aiResponse.suggestedActions : [],
          moodAssessment: (typeof aiResponse.moodAssessment === 'string' && aiResponse.moodAssessment) || "neutral",
          followUpQuestions: Array.isArray(aiResponse.followUpQuestions) ? aiResponse.followUpQuestions : []
        };
      } else if (typeof rawResponseAny === "string") {
        // rawResponse is a string
        const stringResponse = rawResponseAny as string;
        response = {
          message: (stringResponse && stringResponse.trim()) || "I'm here to listen and support you. How are you feeling right now?",
          suggestedActions: [],
          moodAssessment: "neutral",
          followUpQuestions: []
        };
      } else {
        // Fallback if rawResponse is null/undefined/empty
        response = {
          message: "I'm here to listen and support you. How are you feeling right now?",
          suggestedActions: ['Take a moment to breathe', 'Share what\'s on your mind'],
          moodAssessment: "neutral",
          followUpQuestions: ['How are you feeling today?']
        };
      }

      console.log("✅ Final structured response for UI:", response);
      console.log("📝 Final message length:", response.message.length);

      // Apply cultural adaptation to the response message using culturalIntelligence service
      let adaptedMessage = response.message;
      try {
        const culturalAdaptation = await culturalIntelligence.adaptContentForCulture(
          response.message,
          culturalContext
        );

        if (culturalAdaptation.confidence > 0.6) {
          adaptedMessage = culturalAdaptation.adaptedContent;
          console.log("🎨 Applied cultural adaptation:", culturalAdaptation.reasoning);
        }
      } catch (adaptationError) {
        console.warn("⚠️ Cultural adaptation failed, using original message:", adaptationError);
      }

      // Generate activity recommendations
      const activityRecommendations = await this.generateActivityRecommendations(userContext, messageAnalysis);

      return {
        message: adaptedMessage || this.getFallbackMessage(messageAnalysis),
        interventionType: interventionStrategy.primary,
        activityRecommendations,
        culturalAdaptation: {
          language: languagePreference,
          culturalReferences: culturalThemes,
          respectLevel: culturalContext.communicationStyle === 'hierarchical' ? 'formal' : 'casual'
        },
        emotionalSupport: {
          empathyLevel: this.calculateEmpathyLevel(messageAnalysis),
          validationStrategies: this.getValidationStrategies(messageAnalysis),
          copingStrategies: this.getCopingStrategies(messageAnalysis)
        },
        riskAssessment: {
          level: messageAnalysis?.riskAnalysis?.level || 'none',
          indicators: messageAnalysis?.riskAnalysis?.indicators || [],
          immediateActions: this.getImmediateActions(messageAnalysis?.riskAnalysis || {})
        },
        followUp: {
          recommended: (messageAnalysis?.riskAnalysis?.level || 'none') !== 'none',
          timeframe: this.getFollowUpTimeframe(messageAnalysis?.riskAnalysis?.level || 'none'),
          focus: messageAnalysis?.therapeuticNeeds || []
        },
        resources: {
          selfHelp: this.getSelfHelpResources(messageAnalysis),
          professional: this.getProfessionalResources(culturalContext),
          emergency: this.getEmergencyResources()
        },
        adaptationTriggers: this.identifyAdaptationTriggers(messageAnalysis)
      };
    } catch (error) {
      console.error('Response generation error:', error);
      return this.generateFallbackResponse(userMessage, userContext.userId);
    }
  }

  // DISABLED: Generate quick, direct responses for users who want short answers
  private generateQuickResponse(userMessage: string, messageAnalysis: any, _responseFormat: any): string | null {
    // DISABLED: Always return null to force use of enhanced AI responses
    // No more hardcoded responses - everything goes through the enhanced AI system
    console.log('🚫 generateQuickResponse called but DISABLED - forcing enhanced AI');
    return null;
  }

  // Detect user's preferred response format
  private initializeInterventionStrategies(): void {
    // Initialize intervention strategy mappings
    this.interventionStrategies.set('validation', {
      description: 'Acknowledge and validate emotions',
      techniques: ['reflective_listening', 'emotional_validation', 'normalization']
    });

    this.interventionStrategies.set('cognitive_restructuring', {
      description: 'Help identify and reframe negative thoughts',
      techniques: ['thought_challenging', 'perspective_taking', 'evidence_examination']
    });

    // Add more strategies as needed
  }

  // Enhanced Activity Coordination Methods
  private initializeActivityRegistry(): void {
    // Register available therapeutic activities with their configurations
    this.activityRegistry.set('guided_conversation', {
      name: 'Guided Therapeutic Conversation',
      description: 'AI-led empathetic conversation with therapeutic guidance',
      duration: 15,
      culturalAdaptable: true,
      riskLevels: ['none', 'low', 'moderate'],
      skills: ['emotional_expression', 'self_awareness']
    });

    this.activityRegistry.set('cbt_exercise', {
      name: 'Cognitive Behavioral Therapy Exercise',
      description: 'Interactive CBT techniques for thought challenging',
      duration: 20,
      culturalAdaptable: true,
      riskLevels: ['low', 'moderate'],
      skills: ['cognitive_restructuring', 'thought_awareness']
    });

    this.activityRegistry.set('mindfulness_session', {
      name: 'Mindfulness and Meditation',
      description: 'Guided mindfulness practices with cultural elements',
      duration: 10,
      culturalAdaptable: true,
      riskLevels: ['none', 'low', 'moderate', 'high'],
      skills: ['emotional_regulation', 'present_moment_awareness']
    });

    this.activityRegistry.set('breathing_exercise', {
      name: 'Breathing and Relaxation',
      description: 'Guided breathing exercises for immediate stress relief',
      duration: 5,
      culturalAdaptable: true,
      riskLevels: ['none', 'low', 'moderate', 'high', 'severe'],
      skills: ['stress_management', 'emotional_regulation']
    });

    this.activityRegistry.set('crisis_intervention', {
      name: 'Crisis Support Activity',
      description: 'Immediate crisis intervention and safety planning',
      duration: 30,
      culturalAdaptable: true,
      riskLevels: ['high', 'severe'],
      skills: ['crisis_management', 'safety_planning']
    });

    this.activityRegistry.set('cultural_therapy', {
      name: 'Culturally-Adapted Therapy',
      description: 'Therapy incorporating Indian cultural values and practices',
      duration: 25,
      culturalAdaptable: true,
      riskLevels: ['none', 'low', 'moderate'],
      skills: ['cultural_integration', 'family_dynamics']
    });
  }

  // Core Activity Selection Algorithm
  async selectOptimalActivity(
    userContext: UserContext,
    sessionHistory: any[] = []
  ): Promise<ActivityRecommendation> {
    try {
      // Analyze current user state and needs
      const currentNeeds = await this.analyzeTherapeuticNeeds(userContext, sessionHistory);
      const culturalContext = await this.analyzeCulturalContext(userContext);
      const riskLevel = await this.assessCurrentRiskLevel(userContext);

      // Get suitable activities based on risk level and needs
      const suitableActivities = this.filterActivitiesByContext(currentNeeds, riskLevel, culturalContext);

      // Score and rank activities
      const scoredActivities = await this.scoreActivities(suitableActivities, userContext, culturalContext);

      // If none suitable, return a safe default
      if (!scoredActivities || scoredActivities.length === 0) {
        return this.getDefaultActivity(userContext);
      }

      // Select the highest scoring activity
      const selectedActivity = scoredActivities[0];

      return {
        activityType: selectedActivity.type,
        priority: selectedActivity.score,
        culturalRelevance: selectedActivity.culturalScore,
        estimatedDuration: selectedActivity.duration,
        difficultyLevel: this.determineDifficultyLevel(userContext, selectedActivity),
        personalizedReason: this.generatePersonalizedReason(selectedActivity, currentNeeds),
        expectedOutcomes: selectedActivity.expectedOutcomes
      };
    } catch (error) {
      console.error('Activity selection error:', error);
      // Fallback to safe default activity
      return this.getDefaultActivity(userContext);
    }
  }

  // Real-time Activity Adaptation
  async adaptActivityInRealTime(
    sessionId: string,
    userResponse: any,
    currentEngagement: EngagementMetrics
  ): Promise<ActivityAdaptation | null> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return null;

      // Detect adaptation triggers
      const triggers = await this.detectAdaptationTriggers(userResponse, currentEngagement, session);

      if (triggers.length === 0) return null;

      // Generate appropriate adaptation
      const adaptation = await this.generateAdaptation(triggers, session, userResponse);

      // Apply adaptation to session
      session.adaptations.push(adaptation);
      session.realTimeMetrics = {
        ...session.realTimeMetrics,
        emotionalState: userResponse.emotionalState || session.realTimeMetrics.emotionalState,
        stressLevel: userResponse.stressLevel || session.realTimeMetrics.stressLevel
      };

      return adaptation;
    } catch (error) {
      console.error('Real-time adaptation error:', error);
      return null;
    }
  }

  // Cultural Intelligence Integration
  async analyzeCulturalContext(userContext: UserContext): Promise<CulturalContext> {
    const userId = userContext.userId;

    if (this.culturalIntelligence.has(userId)) {
      return this.culturalIntelligence.get(userId)!;
    }

    // Analyze cultural context from user data
    const culturalContext: CulturalContext = {
      primaryCulture: this.inferPrimaryCulture(userContext),
      languagePreference: this.inferLanguagePreference(userContext),
      familyStructure: this.inferFamilyStructure(userContext),
      communicationStyle: this.inferCommunicationStyle(userContext),
      socioeconomicContext: this.inferSocioeconomicContext(userContext),
      generationalFactors: this.identifyGenerationalFactors(userContext),
      culturalSensitivities: this.identifyCulturalSensitivities(userContext)
    };

    this.culturalIntelligence.set(userId, culturalContext);
    return culturalContext;
  }

  // Helper methods for activity selection and adaptation
  private async analyzeTherapeuticNeeds(userContext: UserContext, sessionHistory: any[]): Promise<string[]> {
    const needs: string[] = [];

    // Analyze primary concerns
    if (userContext.mentalHealthHistory.primaryConcerns.includes('anxiety')) {
      needs.push('anxiety_management', 'grounding_techniques');
    }
    if (userContext.mentalHealthHistory.primaryConcerns.includes('depression')) {
      needs.push('mood_enhancement', 'behavioral_activation');
    }
    if (userContext.mentalHealthHistory.primaryConcerns.includes('stress')) {
      needs.push('stress_management', 'relaxation_techniques');
    }

    // Analyze current state
    if (userContext.currentState.stressLevel && userContext.currentState.stressLevel > 7) {
      needs.push('immediate_stress_relief');
    }

    // Analyze session history for patterns
    if (sessionHistory.length > 0) {
      const recentEmotions = sessionHistory.slice(-3).map(s => s.primaryEmotion);
      if (recentEmotions.includes('overwhelmed')) {
        needs.push('coping_strategies', 'emotional_regulation');
      }
    }

    return needs;
  }

  private async assessCurrentRiskLevel(userContext: UserContext): Promise<string> {
    // Simple risk assessment based on user context
    if (userContext.mentalHealthHistory.riskFactors.includes('suicidal_ideation')) {
      return 'severe';
    }
    if (userContext.currentState.stressLevel && userContext.currentState.stressLevel > 8) {
      return 'high';
    }
    if (userContext.mentalHealthHistory.riskFactors.length > 2) {
      return 'moderate';
    }
    if (userContext.mentalHealthHistory.riskFactors.length > 0) {
      return 'low';
    }
    return 'none';
  }

  private filterActivitiesByContext(needs: string[], riskLevel: string, _culturalContext: CulturalContext): any[] {
    const suitableActivities: any[] = [];

    this.activityRegistry.forEach((config, activityType) => {
      // Check if activity is suitable for current risk level
      if (!config.riskLevels.includes(riskLevel)) return;

      // Check if activity addresses current needs
      const addressesNeeds = needs.some(need =>
        config.skills.some((skill: string) => skill.includes(need.split('_')[0] || ''))
      );

      if (addressesNeeds || riskLevel === 'severe') {
        suitableActivities.push({
          type: activityType,
          config,
          baseScore: this.calculateBaseScore(needs, config.skills)
        });
      }
    });

    return suitableActivities;
  }

  private async scoreActivities(activities: any[], userContext: UserContext, culturalContext: CulturalContext): Promise<any[]> {
    if (!activities || activities.length === 0) {
      return [];
    }
    return activities.map(activity => {
      const culturalScore = this.calculateCulturalRelevance(activity, culturalContext);
      const personalScore = this.calculatePersonalRelevance(activity, userContext);
      const urgencyScore = this.calculateUrgencyScore(activity, userContext);

      const totalScore = (activity.baseScore * 0.4) + (culturalScore * 0.3) + (personalScore * 0.2) + (urgencyScore * 0.1);

      return {
        ...activity,
        score: totalScore,
        culturalScore,
        personalScore,
        urgencyScore,
        duration: activity.config.duration,
        expectedOutcomes: this.generateExpectedOutcomes(activity, userContext)
      };
    }).sort((a, b) => b.score - a.score);
  }

  private async detectAdaptationTriggers(userResponse: any, engagement: EngagementMetrics, _session: ActivitySession): Promise<string[]> {
    const triggers: string[] = [];

    // Low engagement trigger
    if (engagement.overallEngagement < 0.4) {
      triggers.push('low_engagement');
    }

    // Emotional distress trigger
    if (userResponse.emotionalState && ['severe_anxiety', 'severe_depression', 'panic'].includes(userResponse.emotionalState)) {
      triggers.push('emotional_distress');
    }

    // Comprehension issues
    if (engagement.responseTime > 30000 && engagement.messageLength < 10) {
      triggers.push('comprehension_issue');
    }

    // Crisis detection
    if (userResponse.riskLevel && ['high', 'severe'].includes(userResponse.riskLevel)) {
      triggers.push('crisis_detected');
    }

    return triggers;
  }

  private async generateAdaptation(triggers: string[], session: ActivitySession, _userResponse: any): Promise<ActivityAdaptation> {
    const primaryTrigger = triggers[0];
    let adaptationType: ActivityAdaptation['adaptationType'] = 'difficulty_adjustment';
    let adaptedContent = '';

    switch (primaryTrigger) {
      case 'low_engagement':
        adaptationType = 'difficulty_adjustment';
        adaptedContent = 'Simplified activity with more interactive elements';
        break;
      case 'emotional_distress':
        adaptationType = 'intervention_change';
        adaptedContent = 'Switched to calming and grounding techniques';
        break;
      case 'comprehension_issue':
        adaptationType = 'cultural_modification';
        adaptedContent = 'Adapted language and cultural references for better understanding';
        break;
      case 'crisis_detected':
        adaptationType = 'emergency_protocol';
        adaptedContent = 'Activated crisis intervention protocols';
        break;
    }

    return {
      timestamp: new Date(),
      trigger: primaryTrigger as ActivityAdaptation['trigger'],
      adaptationType,
      originalContent: `Step ${session.currentStep} of ${session.activityType}`,
      adaptedContent
    };
  }

  // Cultural intelligence helper methods
  private inferPrimaryCulture(userContext: UserContext): CulturalContext['primaryCulture'] {
    const location = userContext.demographics.location?.toLowerCase() || '';
    if (location.includes('delhi') || location.includes('punjab') || location.includes('haryana')) {
      return 'north_indian';
    }
    if (location.includes('tamil') || location.includes('kerala') || location.includes('karnataka')) {
      return 'south_indian';
    }
    if (location.includes('bengal') || location.includes('odisha') || location.includes('assam')) {
      return 'east_indian';
    }
    if (location.includes('maharashtra') || location.includes('gujarat') || location.includes('rajasthan')) {
      return 'west_indian';
    }
    return 'mixed';
  }

  private inferLanguagePreference(userContext: UserContext): CulturalContext['languagePreference'] {
    const language = userContext.demographics.language?.toLowerCase() || '';
    if (language.includes('hindi')) return 'hindi';
    if (language.includes('english')) return 'english';
    return 'mixed';
  }

  private inferFamilyStructure(_userContext: UserContext): CulturalContext['familyStructure'] {
    // This would be enhanced with actual user data
    return 'joint'; // Default assumption for Indian context
  }

  private inferCommunicationStyle(userContext: UserContext): CulturalContext['communicationStyle'] {
    const age = userContext.demographics.age || 25;
    return age < 25 ? 'direct' : 'indirect';
  }

  private inferSocioeconomicContext(userContext: UserContext): CulturalContext['socioeconomicContext'] {
    const location = userContext.demographics.location?.toLowerCase() || '';
    if (location.includes('mumbai') || location.includes('delhi') || location.includes('bangalore')) {
      return 'urban';
    }
    return 'semi_urban';
  }

  private identifyGenerationalFactors(userContext: UserContext): string[] {
    const age = userContext.demographics.age || 25;
    const factors: string[] = [];

    if (age < 25) {
      factors.push('digital_native', 'career_pressure', 'social_media_influence');
    } else {
      factors.push('work_life_balance', 'family_responsibilities');
    }

    return factors;
  }

  private identifyCulturalSensitivities(_userContext: UserContext): string[] {
    return ['family_honor', 'academic_achievement', 'marriage_expectations', 'career_success'];
  }

  // Scoring helper methods
  private calculateBaseScore(needs: string[], skills: string[]): number {
    const matchingSkills = skills.filter(skill =>
      needs.some(need => skill.includes(need.split('_')[0] || ''))
    );
    return matchingSkills.length / skills.length;
  }

  private calculateCulturalRelevance(activity: any, culturalContext: CulturalContext): number {
    if (!activity.config.culturalAdaptable) return 0.5;

    // Higher score for activities that match cultural context
    let score = 0.7;

    if (activity.type === 'cultural_therapy') score += 0.3;
    if (culturalContext.familyStructure === 'joint' && activity.type === 'family_integration') score += 0.2;

    return Math.min(1, score);
  }

  private calculatePersonalRelevance(activity: any, userContext: UserContext): number {
    const preferences = userContext.activityPreferences;
    if (!preferences) return 0.6;

    let score = 0.5;

    if (preferences.preferredTypes.includes(activity.type)) score += 0.3;
    if (activity.config.duration <= preferences.sessionDuration) score += 0.2;

    return Math.min(1, score);
  }

  private calculateUrgencyScore(activity: any, userContext: UserContext): number {
    const stressLevel = userContext.currentState.stressLevel || 0;

    if (stressLevel > 8 && activity.type === 'crisis_intervention') return 1.0;
    if (stressLevel > 6 && activity.type === 'breathing_exercise') return 0.8;
    if (stressLevel > 4 && activity.type === 'mindfulness_session') return 0.6;

    return 0.4;
  }

  private determineDifficultyLevel(userContext: UserContext, _activity: any): 'beginner' | 'intermediate' | 'advanced' {
    const sessionCount = userContext.mentalHealthHistory.previousSessions;
    const preferences = userContext.activityPreferences?.difficultyLevel;

    if (preferences) return preferences;

    if (sessionCount < 3) return 'beginner';
    if (sessionCount < 10) return 'intermediate';
    return 'advanced';
  }

  private generatePersonalizedReason(activity: any, _needs: string[]): string {
    const reasons = {
      'guided_conversation': 'Based on your need for emotional expression and support',
      'cbt_exercise': 'To help you challenge negative thought patterns',
      'mindfulness_session': 'For emotional regulation and stress relief',
      'breathing_exercise': 'For immediate stress and anxiety relief',
      'crisis_intervention': 'To ensure your immediate safety and wellbeing',
      'cultural_therapy': 'Incorporating your cultural values in healing'
    };

    return reasons[activity.type as keyof typeof reasons] || 'Recommended based on your current needs';
  }

  private generateExpectedOutcomes(activity: any, _userContext: UserContext): string[] {
    const outcomes = {
      'guided_conversation': ['Improved emotional awareness', 'Better self-expression', 'Reduced isolation'],
      'cbt_exercise': ['Clearer thinking patterns', 'Reduced negative thoughts', 'Better problem-solving'],
      'mindfulness_session': ['Reduced stress', 'Better emotional regulation', 'Increased present-moment awareness'],
      'breathing_exercise': ['Immediate calm', 'Reduced physical tension', 'Better stress management'],
      'crisis_intervention': ['Immediate safety', 'Crisis stabilization', 'Connection to resources'],
      'cultural_therapy': ['Cultural integration', 'Family harmony', 'Culturally-aligned coping']
    };

    return outcomes[activity.type as keyof typeof outcomes] || ['Improved wellbeing'];
  }

  private getDefaultActivity(_userContext: UserContext): ActivityRecommendation {
    return {
      activityType: 'guided_conversation',
      priority: 7,
      culturalRelevance: 8,
      estimatedDuration: 15,
      difficultyLevel: 'beginner',
      personalizedReason: 'A safe starting point for therapeutic support',
      expectedOutcomes: ['Emotional support', 'Better self-awareness']
    };
  }

  // Generate activity recommendations based on current conversation
  private async generateActivityRecommendations(userContext: UserContext, messageAnalysis: any): Promise<ActivityRecommendation[]> {
    try {
      const primaryRecommendation = await this.selectOptimalActivity(userContext, []);
      const alternativeRecommendations = await this.generateAlternativeActivities(userContext, messageAnalysis, primaryRecommendation);

      return [primaryRecommendation, ...alternativeRecommendations].slice(0, 3);
    } catch (error) {
      console.error('Activity recommendation error:', error);
      return [this.getDefaultActivity(userContext)];
    }
  }

  private async generateAlternativeActivities(userContext: UserContext, messageAnalysis: any, primary: ActivityRecommendation): Promise<ActivityRecommendation[]> {
    const alternatives: ActivityRecommendation[] = [];

    // Always offer a quick stress relief option
    if (!primary || primary.activityType !== 'breathing_exercise') {
      alternatives.push({
        activityType: 'breathing_exercise',
        priority: 6,
        culturalRelevance: 7,
        estimatedDuration: 5,
        difficultyLevel: 'beginner',
        personalizedReason: 'Quick stress relief technique',
        expectedOutcomes: ['Immediate calm', 'Reduced tension']
      });
    }

    // Offer mindfulness if not primary and user shows stress
    if (!primary || (primary.activityType !== 'mindfulness_session' && (messageAnalysis?.emotionalAnalysis?.primaryEmotion || 'neutral') === 'stress')) {
      alternatives.push({
        activityType: 'mindfulness_session',
        priority: 5,
        culturalRelevance: 8,
        estimatedDuration: 10,
        difficultyLevel: userContext.activityPreferences?.difficultyLevel || 'beginner',
        personalizedReason: 'Mindfulness practice for emotional balance',
        expectedOutcomes: ['Better emotional regulation', 'Increased awareness']
      });
    }

    return alternatives;
  }



  // Public methods for external activity coordination
  async initializeActivitySession(userId: string, activityType: ActivityType): Promise<ActivitySession> {
    const sessionId = `${userId}_${Date.now()}`;
    const userContext = await this.getUserContext(userId);
    const culturalContext = await this.analyzeCulturalContext(userContext);

    const session: ActivitySession = {
      sessionId,
      userId,
      activityType,
      status: 'active',
      startTime: new Date(),
      currentStep: 1,
      totalSteps: this.getActivitySteps(activityType),
      userEngagement: 0.5,
      adaptations: [],
      culturalContext,
      realTimeMetrics: {
        emotionalState: 'neutral',
        stressLevel: userContext.currentState.stressLevel || 5,
        responseTime: 0,
        comprehension: 0.5
      }
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  async updateActivitySession(sessionId: string, userResponse: any): Promise<ActivitySession | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    // Monitor engagement
    const engagement = await this.adaptationEngine.monitorUserEngagement(sessionId, userResponse);

    // Check for adaptation needs
    // Removed unused adaptation variable
    await this.adaptActivityInRealTime(sessionId, userResponse, engagement);

    // Update session metrics
    session.userEngagement = engagement.overallEngagement;
    session.realTimeMetrics = {
      ...session.realTimeMetrics,
      emotionalState: userResponse.emotionalState || session.realTimeMetrics.emotionalState,
      stressLevel: userResponse.stressLevel || session.realTimeMetrics.stressLevel,
      responseTime: engagement.responseTime,
      comprehension: this.assessComprehension(userResponse)
    };

    return session;
  }

  async completeActivitySession(sessionId: string): Promise<any> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    session.status = 'completed';

    // Generate session summary
    const summary = {
      sessionId,
      activityType: session.activityType,
      duration: Date.now() - session.startTime.getTime(),
      finalEngagement: session.userEngagement,
      adaptationsUsed: session.adaptations.length,
      skillsPracticed: this.getSkillsPracticed(session.activityType),
      nextRecommendations: await this.generateFollowUpActivities(session)
    };

    // Update user progress
    const userContext = await this.getUserContext(session.userId);
    userContext.therapeuticProgress.completedActivities.push(sessionId);
    userContext.therapeuticProgress.engagementHistory.push({
      responseTime: session.realTimeMetrics.responseTime,
      messageLength: 0,
      emotionalExpression: 0.5,
      questionAsking: 0.3,
      followThrough: session.userEngagement,
      overallEngagement: session.userEngagement
    });

    this.activeSessions.delete(sessionId);
    return summary;
  }

  private getActivitySteps(activityType: ActivityType): number {
    const stepCounts = {
      'guided_conversation': 5,
      'cbt_exercise': 7,
      'mindfulness_session': 4,
      'breathing_exercise': 3,
      'crisis_intervention': 8,
      'cultural_therapy': 6,
      'assessment_activity': 10,
      'group_therapy': 6,
      'family_integration': 8,
      'journaling_prompt': 4,
      'mood_tracking': 3,
      'thought_challenge': 5,
      'behavior_experiment': 6,
      'grounding_technique': 4
    };

    return stepCounts[activityType] || 5;
  }

  private assessComprehension(userResponse: any): number {
    // Simple comprehension assessment based on response relevance and depth
    const message = userResponse.message || '';
    const wordCount = message.split(/\s+/).length;
    const relevantKeywords = ['understand', 'feel', 'think', 'help', 'better', 'try'];
    const keywordCount = relevantKeywords.filter(keyword =>
      message.toLowerCase().includes(keyword)
    ).length;

    return Math.min(1, (wordCount / 20) * 0.5 + (keywordCount / relevantKeywords.length) * 0.5);
  }

  private getSkillsPracticed(activityType: ActivityType): string[] {
    const skillsMap = {
      'guided_conversation': ['emotional_expression', 'self_awareness'],
      'cbt_exercise': ['cognitive_restructuring', 'thought_awareness'],
      'mindfulness_session': ['emotional_regulation', 'present_moment_awareness'],
      'breathing_exercise': ['stress_management', 'emotional_regulation'],
      'crisis_intervention': ['crisis_management', 'safety_planning'],
      'cultural_therapy': ['cultural_integration', 'family_dynamics'],
      'assessment_activity': ['self_assessment', 'insight_development'],
      'group_therapy': ['peer_support', 'social_skills'],
      'family_integration': ['family_communication', 'relationship_skills'],
      'journaling_prompt': ['self_reflection', 'emotional_processing'],
      'mood_tracking': ['emotional_awareness', 'pattern_recognition'],
      'thought_challenge': ['cognitive_flexibility', 'critical_thinking'],
      'behavior_experiment': ['behavioral_change', 'experiential_learning'],
      'grounding_technique': ['anxiety_management', 'present_moment_focus']
    };

    return skillsMap[activityType] || ['general_coping'];
  }

  private async generateFollowUpActivities(session: ActivitySession): Promise<ActivityRecommendation[]> {
    const userContext = await this.getUserContext(session.userId);

    // Generate recommendations based on session performance
    if (session.userEngagement > 0.7) {
      // High engagement - suggest more advanced activities
      return [await this.selectOptimalActivity(userContext, [])];
    } else {
      // Lower engagement - suggest simpler, more engaging activities
      return [{
        activityType: 'breathing_exercise',
        priority: 8,
        culturalRelevance: 7,
        estimatedDuration: 5,
        difficultyLevel: 'beginner',
        personalizedReason: 'Simple technique to build confidence',
        expectedOutcomes: ['Immediate relief', 'Skill building']
      }];
    }
  }

  private async getUserContext(userId: string): Promise<UserContext> {
    if (!this.userProfiles.has(userId)) {
      // Create default user context with enhanced activity support
      const defaultContext: UserContext = {
        userId,
        demographics: {},
        mentalHealthHistory: {
          previousSessions: 0,
          primaryConcerns: [],
          therapeuticGoals: [],
          riskFactors: [],
          protectiveFactors: []
        },
        currentState: {},
        activityPreferences: {
          preferredTypes: ['guided_conversation', 'mindfulness_session'],
          sessionDuration: 15,
          difficultyLevel: 'beginner',
          interactionStyle: 'conversational',
          culturalAdaptationLevel: 8
        },
        therapeuticProgress: {
          completedActivities: [],
          skillsLearned: [],
          currentPhase: 'assessment',
          engagementHistory: [],
          adaptationHistory: []
        },
        culturalProfile: {
          primaryCulture: 'mixed',
          languagePreference: 'mixed',
          familyStructure: 'joint',
          communicationStyle: 'direct',
          socioeconomicContext: 'urban',
          generationalFactors: ['digital_native'],
          culturalSensitivities: ['family_honor', 'academic_achievement']
        }
      };
      this.userProfiles.set(userId, defaultContext);
    }

    return this.userProfiles.get(userId)!;
  }

  private async getConversationContext(sessionId: string, _userId: string): Promise<ConversationContext> {
    if (!this.activeContexts.has(sessionId)) {
      const defaultContext: ConversationContext = {
        sessionId,
        conversationHistory: [],
        therapeuticPhase: 'rapport_building',
        culturalContext: {
          languagePreference: 'mixed',
          culturalSensitivities: [],
          communicationStyle: 'casual'
        }
      };
      this.activeContexts.set(sessionId, defaultContext);
    }

    return this.activeContexts.get(sessionId)!;
  }

  private updateConversationContext(
    context: ConversationContext,
    userMessage: string,
    response: TherapeuticResponse,
    analysis: any
  ): void {
    // Add to conversation history
    context.conversationHistory.push(
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        emotionalAnalysis: analysis.emotionalAnalysis
      },
      {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      }
    );

    // Keep history manageable and prevent repetition
    if (context.conversationHistory.length > 10) {
      context.conversationHistory = context.conversationHistory.slice(-10);
    }

    // Update cultural context
    context.culturalContext.languagePreference = response.culturalAdaptation.language;
  }

  // Public utility methods
  async analyzeConversationTrends(sessionId: string): Promise<any> {
    const context = this.activeContexts.get(sessionId);
    if (!context) return null;

    const emotions = context.conversationHistory
      .filter(entry => entry.emotionalAnalysis)
      .map(entry => entry.emotionalAnalysis);

    return {
      emotionalTrend: this.calculateEmotionalTrend(emotions),
      engagementLevel: this.calculateEngagementLevel(context),
      therapeuticProgress: this.assessTherapeuticProgress(context)
    };
  }

  private calculateEmotionalTrend(emotions: any[]): string {
    if (emotions.length < 2) return 'stable';

    const recent = emotions.slice(-3);
    const earlier = emotions.slice(0, -3);

    const recentAvg = recent.reduce((sum, e) => sum + (e.valence || 0), 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, e) => sum + (e.valence || 0), 0) / earlier.length;

    if (recentAvg > earlierAvg + 0.2) return 'improving';
    if (recentAvg < earlierAvg - 0.2) return 'declining';
    return 'stable';
  }

  private calculateEngagementLevel(context: ConversationContext): number {
    const messageCount = context.conversationHistory.length;
    const avgMessageLength = context.conversationHistory
      .filter(entry => entry.role === 'user')
      .reduce((sum, entry) => sum + entry.content.length, 0) / messageCount;

    return Math.min(1, (messageCount * 0.1) + (avgMessageLength / 100));
  }

  private assessTherapeuticProgress(context: ConversationContext): any {
    return {
      rapportBuilding: context.conversationHistory.length > 3 ? 0.8 : 0.4,
      selfAwareness: 0.6, // Would be calculated based on user insights
      copingSkillsUsage: 0.5, // Would track mentioned coping strategies
      emotionalRegulation: 0.6 // Would track emotional stability over time
    };
  }

  // Enhanced cultural analysis helper methods
  private detectLanguageMixing(message: string): number {
    const hindiWords = ['hai', 'hoon', 'kya', 'aur', 'mein', 'tum', 'yeh', 'woh', 'kaise', 'kyun', 'बहुत', 'अच्छा', 'बुरा'];
    const englishWords = message.split(/\s+/).filter(word => /^[a-zA-Z]+$/.test(word));
    const hindiMatches = hindiWords.filter(word => message.toLowerCase().includes(word)).length;

    if (englishWords.length === 0) return 0;
    return Math.min(1, hindiMatches / englishWords.length);
  }

  private detectLanguagePreference(message: string): 'hindi' | 'english' | 'mixed' {
    const mixingLevel = this.detectLanguageMixing(message);
    const hasDevanagari = /[\u0900-\u097F]/.test(message);

    if (hasDevanagari || mixingLevel > 0.3) {
      return mixingLevel > 0.5 ? 'mixed' : 'hindi';
    }
    return 'english';
  }

  private detectFormalityLevel(message: string): 'formal' | 'casual' | 'mixed' {
    const formalIndicators = ['sir', 'madam', 'please', 'thank you', 'kindly', 'आप', 'जी'];
    const casualIndicators = ['yaar', 'bro', 'dude', 'hey', 'sup', 'तू', 'तुम'];

    const lowerMessage = message.toLowerCase();
    const formalCount = formalIndicators.filter(word => lowerMessage.includes(word)).length;
    const casualCount = casualIndicators.filter(word => lowerMessage.includes(word)).length;

    if (formalCount > casualCount) return 'formal';
    if (casualCount > formalCount) return 'casual';
    return 'mixed';
  }

  private detectGenerationalFactors(message: string): string[] {
    const factors: string[] = [];
    const lowerMessage = message.toLowerCase();

    const generationalIndicators = {
      'traditional_values': ['respect elders', 'family first', 'tradition', 'culture', 'बड़ों का सम्मान'],
      'modern_aspirations': ['independence', 'freedom', 'career', 'dreams', 'individual', 'स्वतंत्रता'],
      'technology_native': ['social media', 'online', 'app', 'digital', 'internet'],
      'global_exposure': ['abroad', 'international', 'global', 'western', 'foreign']
    };

    Object.entries(generationalIndicators).forEach(([factor, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        factors.push(factor);
      }
    });

    return factors;
  }

  private analyzeFamilyDynamics(message: string): any {
    const lowerMessage = message.toLowerCase();
    const dynamics = {
      structure: 'unknown',
      relationships: [] as string[],
      conflicts: [] as string[],
      support: [] as string[]
    };

    // Family structure indicators
    if (lowerMessage.includes('joint family') || lowerMessage.includes('grandparents')) {
      dynamics.structure = 'joint';
    } else if (lowerMessage.includes('nuclear') || lowerMessage.includes('just parents')) {
      dynamics.structure = 'nuclear';
    }

    // Relationship patterns
    const relationshipIndicators = {
      'parent_conflict': ['parents don\'t understand', 'fight with parents', 'माता-पिता से झगड़ा'],
      'sibling_support': ['brother', 'sister', 'sibling', 'भाई', 'बहन'],
      'extended_family': ['uncle', 'aunt', 'cousin', 'चाचा', 'मामा', 'मौसी']
    };

    Object.entries(relationshipIndicators).forEach(([type, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        dynamics.relationships.push(type);
      }
    });

    return dynamics;
  }

  private analyzeSocialContext(message: string, userContext: UserContext): any {
    const lowerMessage = message.toLowerCase();
    const socialContext = {
      peerPressure: false,
      socialExpectations: [] as string[],
      communityInfluence: 'low',
      socialSupport: [] as string[]
    };

    // Peer pressure indicators
    if (lowerMessage.includes('friends') && (lowerMessage.includes('pressure') || lowerMessage.includes('expect'))) {
      socialContext.peerPressure = true;
    }

    // Social expectations
    const expectationIndicators = {
      'academic_success': ['good marks', 'topper', 'rank', 'अच्छे नंबर'],
      'career_stability': ['stable job', 'government job', 'सरकारी नौकरी'],
      'marriage_timeline': ['settle down', 'marriage age', 'शादी का समय'],
      'family_reputation': ['family name', 'reputation', 'इज्जत', 'मान-सम्मान']
    };

    Object.entries(expectationIndicators).forEach(([expectation, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        socialContext.socialExpectations.push(expectation);
      }
    });

    // Community influence based on user context
    if (userContext.culturalProfile?.socioeconomicContext === 'rural') {
      socialContext.communityInfluence = 'high';
    } else if (userContext.culturalProfile?.socioeconomicContext === 'urban') {
      socialContext.communityInfluence = 'moderate';
    }

    return socialContext;
  }

  private calculateValence(detectedEmotions: any): number {
    const positiveEmotions = ['joy', 'happiness', 'excitement'];
    const negativeEmotions = ['sadness', 'anger', 'anxiety', 'depression', 'stress'];

    let positiveScore = 0;
    let negativeScore = 0;

    Object.keys(detectedEmotions).forEach(emotion => {
      const intensity = detectedEmotions[emotion].intensity;
      if (positiveEmotions.includes(emotion)) {
        positiveScore += intensity;
      } else if (negativeEmotions.includes(emotion)) {
        negativeScore += intensity;
      }
    });

    return positiveScore - negativeScore;
  }

  private calculateArousal(detectedEmotions: any): number {
    const highArousalEmotions = ['anger', 'anxiety', 'excitement', 'panic'];
    const lowArousalEmotions = ['sadness', 'depression', 'calm'];

    let arousalScore = 0.5; // neutral baseline

    Object.keys(detectedEmotions).forEach(emotion => {
      const intensity = detectedEmotions[emotion].intensity;
      if (highArousalEmotions.includes(emotion)) {
        arousalScore += intensity * 0.5;
      } else if (lowArousalEmotions.includes(emotion)) {
        arousalScore -= intensity * 0.3;
      }
    });

    return Math.max(0, Math.min(1, arousalScore));
  }

  // Enhanced response generation helper methods
  private detectResponseFormat(userMessage: string): { type: string; length: string } {
    const lowerMessage = userMessage.toLowerCase();
    const messageLength = userMessage.length;

    // Only use quick responses if explicitly requested - never for emotional content
    if (lowerMessage.includes('quick answer') || lowerMessage.includes('one line only') ||
      lowerMessage.includes('just tell me briefly')) {
      return { type: 'one_line', length: 'short' };
    }

    // Detect if user wants detailed responses
    if (lowerMessage.includes('explain') || lowerMessage.includes('detail') ||
      lowerMessage.includes('more') || messageLength > 200) {
      return { type: 'detailed', length: 'long' };
    }

    // Always use conversational for emotional support - never quick responses for feelings

    return { type: 'conversational', length: 'medium' };
  }

  private getInterventionGuidelines(interventionType: string): string {
    const guidelines = {
      'validation': `
        VALIDATION APPROACH:
        - Acknowledge their feelings as completely valid and understandable
        - Reflect back what you hear without judgment
        - Normalize their emotional experience
        - Show that their reaction makes sense given their situation
      `,
      'mindfulness': `
        MINDFULNESS APPROACH:
        - Gently guide them to the present moment
        - Suggest simple grounding techniques naturally in conversation
        - Help them notice their thoughts and feelings without judgment
        - Offer breathing exercises or mindful awareness practices
      `,
      'cognitive_restructuring': `
        COGNITIVE APPROACH:
        - Help them explore their thought patterns gently
        - Ask curious questions about their perspective
        - Offer alternative ways of looking at the situation
        - Help them identify unhelpful thinking patterns
      `,
      'crisis_intervention': `
        🚨 CRISIS INTERVENTION - CRITICAL PRIORITY 🚨
        
        This person is in IMMEDIATE DISTRESS. Your response can save a life.
        
        **IMMEDIATE RESPONSE PROTOCOL:**
        
        1. **VALIDATE & CONNECT (First 1-2 sentences):**
           - Acknowledge their pain directly and specifically
           - Example: "I hear how much pain you're in right now, and I'm really glad you reached out"
           - Show you're taking them seriously: "Your feelings are valid, and you're not alone in this"
        
        2. **ASSESS IMMEDIATE SAFETY:**
           - Gently ask: "Are you safe right now? Are you in a place where you can talk?"
           - If they mention specific plans: "Do you have a plan to hurt yourself?"
        
        3. **PROVIDE IMMEDIATE SUPPORT:**
           - Stay present: "I'm here with you right now. Let's work through this together"
           - Normalize the feeling: "When pain feels this overwhelming, it's natural to want it to stop"
           - Offer hope: "These feelings are temporary, even though they don't feel that way right now"
        
        4. **CONNECT TO RESOURCES (CRITICAL):**
           - Provide immediate helplines (Government of India Approved):
             * KIRAN Mental Health: 1800-599-0019 (Toll-Free, 24/7)
             * Tele MANAS: 14416 (Toll-Free, 24/7)
             * NIMHANS Helpline: 08046110007 (24/7)
           - Encourage reaching out: "Can you call one of these numbers right now? Or is there someone you trust who you can talk to?"
        
        5. **SAFETY PLANNING:**
           - "What's one thing that has helped you feel even a little bit better before?"
           - "Who is someone you trust that we can reach out to?"
           - "Can you stay with someone tonight?"
        
        6. **STAY ENGAGED:**
           - Don't end abruptly: "I want to make sure you're okay. Will you stay with me for a few more minutes?"
           - Follow up: "Can you promise me you'll reach out to one of these resources?"
        
        **TONE:**
        - Calm, steady, present
        - Direct but compassionate
        - No minimizing ("it will get better")
        - No clichés ("everything happens for a reason")
        - Focus on RIGHT NOW, not the future
        
        **WHAT TO SAY:**
        ✅ "I'm here with you"
        ✅ "You're not alone"
        ✅ "This pain is real, and it matters"
        ✅ "Let's get you some immediate support"
        
        **WHAT NOT TO SAY:**
        ❌ "It will get better" (feels dismissive)
        ❌ "Think positive" (invalidating)
        ❌ "Others have it worse" (minimizing)
        ❌ "You have so much to live for" (guilt-inducing)
      `,
      'behavioral_activation': `
        BEHAVIORAL APPROACH:
        - Encourage small, manageable actions
        - Help them identify activities that bring meaning or pleasure
        - Support them in taking one small step forward
        - Focus on what they can control right now
      `
    };

    return guidelines[interventionType] || guidelines['validation'];
  }

  private getCulturalGuidelines(culturalThemes: string[]): string {
    let guidelines = '\nCULTURAL SENSITIVITY GUIDELINES:\n';

    if (culturalThemes.includes('familyReferences')) {
      guidelines += '- Understand the central role of family in Indian culture and the complexity of family relationships\n';
      guidelines += '- Recognize that family conflicts can be especially painful due to cultural values of respect and harmony\n';
    }

    if (culturalThemes.includes('academicPressure')) {
      guidelines += '- Acknowledge the intense academic pressure in Indian society and its impact on mental health\n';
      guidelines += '- Understand the weight of parental expectations and societal competition\n';
    }

    if (culturalThemes.includes('socialPressure')) {
      guidelines += '- Recognize the impact of social expectations and "log kya kahenge" mentality\n';
      guidelines += '- Understand the struggle between individual desires and social conformity\n';
    }

    if (culturalThemes.includes('marriagePressure')) {
      guidelines += '- Be sensitive to marriage-related pressures and timeline expectations\n';
      guidelines += '- Understand the complexity of arranged marriage vs. personal choice\n';
    }

    if (culturalThemes.includes('careerExpectations')) {
      guidelines += '- Acknowledge the pressure to pursue "stable" careers like engineering, medicine, government jobs\n';
      guidelines += '- Understand the conflict between passion and practical family expectations\n';
    }

    if (culturalThemes.includes('generationalConflict')) {
      guidelines += '- Recognize the tension between traditional values and modern aspirations\n';
      guidelines += '- Understand the challenge of respecting elders while asserting individual needs\n';
    }

    return guidelines;
  }

  private calculateEmpathyLevel(messageAnalysis: any): number {
    const emotionIntensity = messageAnalysis?.emotionalAnalysis?.emotionIntensity || 0.5;
    const riskLevel = messageAnalysis?.riskAnalysis?.level || 'none';

    // Higher empathy for higher emotional intensity and risk
    let empathyLevel = 0.7; // baseline

    if (emotionIntensity > 0.7) empathyLevel += 0.2;
    if (riskLevel === 'high' || riskLevel === 'severe') empathyLevel += 0.1;

    return Math.min(1, empathyLevel);
  }

  private getValidationStrategies(messageAnalysis: any): string[] {
    const strategies: string[] = ['acknowledge_feelings'];
    const primaryEmotion = messageAnalysis?.emotionalAnalysis?.primaryEmotion || 'neutral';

    if (primaryEmotion === 'anxiety' || primaryEmotion === 'stress') {
      strategies.push('normalize_anxiety', 'validate_concerns');
    } else if (primaryEmotion === 'sadness' || primaryEmotion === 'depression') {
      strategies.push('validate_pain', 'acknowledge_strength');
    } else if (primaryEmotion === 'anger') {
      strategies.push('validate_frustration', 'acknowledge_injustice');
    }

    return strategies;
  }

  private getCopingStrategies(messageAnalysis: any): string[] {
    const strategies: string[] = [];
    const primaryEmotion = messageAnalysis?.emotionalAnalysis?.primaryEmotion || 'neutral';
    const culturalAnalysis = messageAnalysis?.culturalAnalysis || {};

    // Emotion-based strategies
    if (primaryEmotion === 'anxiety') {
      strategies.push('breathing_exercises', 'grounding_techniques', 'mindful_awareness');
    } else if (primaryEmotion === 'stress') {
      strategies.push('stress_management', 'time_management', 'relaxation_techniques');
    } else if (primaryEmotion === 'sadness') {
      strategies.push('self_compassion', 'gentle_activities', 'social_connection');
    }

    // Culturally appropriate strategies based on family structure and cultural context
    if (culturalAnalysis.familyStructure === 'joint' || culturalAnalysis.familyStructure === 'extended') {
      strategies.push('family_communication', 'boundary_setting');
    }
    if (culturalAnalysis.culturalSensitivities?.includes('academic_achievement')) {
      strategies.push('study_balance', 'performance_anxiety_management');
    }

    // Default strategies if none match
    if (strategies.length === 0) {
      strategies.push('deep_breathing', 'mindful_awareness', 'self_care');
    }

    return strategies;
  }

  private getImmediateActions(riskAnalysis: any): string[] {
    const actions: string[] = [];
    const riskLevel = riskAnalysis?.level || 'none';

    if (riskLevel === 'severe') {
      actions.push('contact_crisis_helpline', 'reach_out_to_trusted_person', 'ensure_safety');
    } else if (riskLevel === 'high') {
      actions.push('seek_professional_help', 'inform_support_system');
    } else if (riskLevel === 'moderate') {
      actions.push('practice_self_care', 'monitor_mood');
    }

    return actions;
  }

  private getFollowUpTimeframe(riskLevel: string): string {
    const timeframes = {
      'severe': 'immediately',
      'high': 'within 24 hours',
      'moderate': 'within a week',
      'low': 'as needed',
      'none': 'as needed'
    };

    return timeframes[riskLevel] || 'as needed';
  }

  private getSelfHelpResources(messageAnalysis: any): string[] {
    const resources: string[] = ['breathing_exercises', 'mindfulness_apps'];
    const primaryEmotion = messageAnalysis?.emotionalAnalysis?.primaryEmotion || 'neutral';

    if (primaryEmotion === 'anxiety') {
      resources.push('anxiety_management_techniques', 'grounding_exercises');
    } else if (primaryEmotion === 'depression') {
      resources.push('mood_tracking', 'behavioral_activation');
    }

    return resources;
  }

  private getProfessionalResources(culturalContext: any): string[] {
    const resources: string[] = ['counseling_services', 'therapy_options'];

    if (culturalContext.languagePreference === 'hindi') {
      resources.push('hindi_speaking_therapists');
    }

    resources.push('culturally_sensitive_therapists');
    return resources;
  }

  private getEmergencyResources(): string[] {
    return [
      'national_suicide_prevention_lifeline',
      'crisis_text_line',
      'local_emergency_services',
      'trusted_family_member',
      'mental_health_helpline'
    ];
  }

  private identifyAdaptationTriggers(messageAnalysis: any): string[] {
    const triggers: string[] = [];

    const emotionIntensity = messageAnalysis?.emotionalAnalysis?.emotionIntensity || 0;
    const riskLevel = messageAnalysis?.riskAnalysis?.level || 'none';
    const culturalSensitivities = messageAnalysis?.culturalAnalysis?.culturalSensitivities || [];

    if (emotionIntensity > 0.8) {
      triggers.push('high_emotional_intensity');
    }

    if (riskLevel !== 'none') {
      triggers.push('risk_detected');
    }

    if (culturalSensitivities.length > 0) {
      triggers.push('cultural_sensitivity_required');
    }

    return triggers;
  }

  private getFallbackMessage(messageAnalysis: any): string {
    const primaryEmotion = messageAnalysis?.emotionalAnalysis?.primaryEmotion || 'neutral';

    const fallbackMessages = {
      'anxiety': "I can hear that you're feeling anxious right now. That's completely understandable. Take a deep breath with me - you're not alone in this.",
      'sadness': "I can feel the sadness in your words, and I want you to know that it's okay to feel this way. Your feelings are valid, and I'm here with you.",
      'stress': "It sounds like you're carrying a lot of stress right now. That must feel overwhelming. Let's take this one step at a time.",
      'anger': "I can sense your frustration, and it makes complete sense that you'd feel this way. Your feelings are valid.",
      'default': "I hear you, and I want you to know that whatever you're going through, you don't have to face it alone. I'm here to listen and support you."
    };

    return fallbackMessages[primaryEmotion] || fallbackMessages['default'];
  }
  private generateFallbackResponse(userMessage: string, userId: string): TherapeuticResponse {
    // Generate contextual fallback responses based on message content
    const lowerMessage = userMessage.toLowerCase();
    
    let fallbackMessage: string;
    
    // Contextual responses based on keywords
    if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('study')) {
      fallbackMessage = "Exam stress can feel overwhelming. What's weighing on you the most right now?";
    } else if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
      fallbackMessage = "I can hear the anxiety in your words. When did you first start noticing this feeling?";
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
      fallbackMessage = "It takes courage to share when you're feeling low. What's been the hardest part lately?";
    } else if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelm')) {
      fallbackMessage = "That sounds like a lot to handle. What's taking up the most space in your mind?";
    } else if (lowerMessage.includes('family') || lowerMessage.includes('parents')) {
      fallbackMessage = "Family dynamics can be complex. What's been happening that's on your mind?";
    } else if (lowerMessage.includes('friend') || lowerMessage.includes('relationship')) {
      fallbackMessage = "Relationships can be challenging. What's been going on with that?";
    } else {
      // Generic varied responses
      const genericMessages = [
        "I'm here with you. What's been on your mind?",
        "Tell me more about what you're experiencing.",
        "I'm listening. What would help you feel better right now?",
        "That sounds important to you. Can you share more?",
        "I hear you. What's the hardest part about this for you?"
      ];
      fallbackMessage = genericMessages[Math.floor(Math.random() * genericMessages.length)];
    }
    
    return {
      message: fallbackMessage,
      interventionType: 'validation',
      culturalAdaptation: {
        language: 'mixed',
        culturalReferences: [],
        respectLevel: 'casual'
      },
      emotionalSupport: {
        empathyLevel: 0.8,
        validationStrategies: ['acknowledge_feelings'],
        copingStrategies: ['deep_breathing']
      },
      riskAssessment: {
        level: 'none',
        indicators: [],
        immediateActions: []
      },
      followUp: {
        recommended: false,
        timeframe: 'as needed',
        focus: []
      },
      resources: {
        selfHelp: ['breathing_exercises'],
        professional: ['online_counseling'],
        emergency: this.getEmergencyResources()
      }
    };
  }

  // *** NEW *** Helper function to create a simple response object
  private createSimpleTherapeuticResponse(message: string, intervention: ActivityType): TherapeuticResponse {
    loadingManager.completeLoading('temp-id'); // Make sure to handle loading state
    
    // Map ActivityType to valid interventionType
    let interventionType: 'validation' | 'cognitive_restructuring' | 'mindfulness' | 'crisis_intervention' | 'psychoeducation' | 'behavioral_activation';
    
    switch (intervention) {
      case 'crisis_intervention':
        interventionType = 'crisis_intervention';
        break;
      case 'cbt_exercise':
      case 'thought_challenge':
        interventionType = 'cognitive_restructuring';
        break;
      case 'mindfulness_session':
      case 'breathing_exercise':
      case 'grounding_technique':
        interventionType = 'mindfulness';
        break;
      case 'behavior_experiment':
        interventionType = 'behavioral_activation';
        break;
      case 'assessment_activity':
        interventionType = 'psychoeducation';
        break;
      default:
        interventionType = 'validation';
        break;
    }
    
    return {
      message: message,
      interventionType: interventionType,
      activityRecommendations: [],
      culturalAdaptation: {
        language: 'mixed',
        culturalReferences: [],
        respectLevel: 'casual'
      },
      emotionalSupport: {
        empathyLevel: 0.8,
        validationStrategies: ['acknowledge_feelings'],
        copingStrategies: []
      },
      riskAssessment: {
        level: 'none',
        indicators: [],
        immediateActions: []
      },
      followUp: {
        recommended: false,
        timeframe: 'as needed',
        focus: []
      },
      resources: {
        selfHelp: [],
        professional: [],
        emergency: []
      }
    };
  }

  // Handle user feedback about response quality and preferences
  async handleUserFeedback(
    userId: string,
    feedback: string,
    previousResponse: string
  ): Promise<void> {
    console.log(`📝 Processing feedback from user ${userId}: ${feedback}`);
    
    // Update preferences based on feedback
    conversationMemory.updatePreferencesFromFeedback(userId, feedback);
    
    // Also detect any new preference requests in the feedback
    conversationMemory.detectUserPreferences(userId, feedback);
    
    // Log the feedback for analysis
    console.log(`✅ Feedback processed and preferences updated for user ${userId}`);
  }

  // Get user's current preferences for debugging
  getUserPreferences(userId: string): any {
    return conversationMemory.getUserPreferences(userId);
  }

  // Reset user preferences if needed
  resetUserPreferences(userId: string): void {
    conversationMemory.clearUserData(userId);
    console.log(`🔄 Reset preferences for user ${userId}`);
  }
}

export const aiOrchestrator = new AIOrchestrator();