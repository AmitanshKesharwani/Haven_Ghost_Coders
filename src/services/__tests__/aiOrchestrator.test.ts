// Test file for enhanced AI Orchestrator
import { aiOrchestrator } from '../aiOrchestrator';
import type { UserContext } from '../aiOrchestrator';

describe('Enhanced AI Orchestrator', () => {
  const mockUserContext: UserContext = {
    userId: 'test-user-123',
    demographics: {
      age: 22,
      location: 'Delhi',
      language: 'mixed'
    },
    mentalHealthHistory: {
      previousSessions: 2,
      primaryConcerns: ['anxiety', 'academic_stress'],
      therapeuticGoals: ['stress_management', 'better_coping'],
      riskFactors: ['perfectionism'],
      protectiveFactors: ['family_support']
    },
    currentState: {
      stressLevel: 7,
      recentTriggers: ['exam_pressure']
    },
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
      primaryCulture: 'north_indian',
      languagePreference: 'mixed',
      familyStructure: 'joint',
      communicationStyle: 'direct',
      socioeconomicContext: 'urban',
      generationalFactors: ['digital_native', 'career_pressure'],
      culturalSensitivities: ['family_honor', 'academic_achievement']
    }
  };

  test('should select optimal activity based on user context', async () => {
    const recommendation = await aiOrchestrator.selectOptimalActivity(mockUserContext);
    
    expect(recommendation).toBeDefined();
    expect(recommendation.activityType).toBeDefined();
    expect(recommendation.priority).toBeGreaterThan(0);
    expect(recommendation.culturalRelevance).toBeGreaterThan(0);
    expect(recommendation.estimatedDuration).toBeGreaterThan(0);
    expect(recommendation.personalizedReason).toBeDefined();
    expect(recommendation.expectedOutcomes).toBeInstanceOf(Array);
  });

  test('should initialize activity session', async () => {
    const session = await aiOrchestrator.initializeActivitySession('test-user-123', 'guided_conversation');
    
    expect(session).toBeDefined();
    expect(session.sessionId).toBeDefined();
    expect(session.userId).toBe('test-user-123');
    expect(session.activityType).toBe('guided_conversation');
    expect(session.status).toBe('active');
    expect(session.currentStep).toBe(1);
    expect(session.totalSteps).toBeGreaterThan(0);
  });

  test('should generate therapeutic response with activity recommendations', async () => {
    const response = await aiOrchestrator.generateTherapeuticResponse(
      'I am feeling very stressed about my upcoming exams',
      'test-user-123'
    );
    
    expect(response).toBeDefined();
    expect(response.message).toBeDefined();
    expect(response.interventionType).toBeDefined();
    expect(response.activityRecommendations).toBeInstanceOf(Array);
    expect(response.culturalAdaptation).toBeDefined();
    expect(response.riskAssessment).toBeDefined();
  });

  test('should adapt activity in real-time based on engagement', async () => {
    const session = await aiOrchestrator.initializeActivitySession('test-user-123', 'cbt_exercise');
    
    const mockUserResponse = {
      message: 'I don\'t understand',
      emotionalState: 'confused',
      stressLevel: 8,
      responseTime: 25000
    };

    const mockEngagement = {
      responseTime: 25000,
      messageLength: 20,
      emotionalExpression: 0.2,
      questionAsking: 0.1,
      followThrough: 0.3,
      overallEngagement: 0.25
    };

    const adaptation = await aiOrchestrator.adaptActivityInRealTime(
      session.sessionId,
      mockUserResponse,
      mockEngagement
    );

    expect(adaptation).toBeDefined();
    if (adaptation) {
      expect(adaptation.trigger).toBeDefined();
      expect(adaptation.adaptationType).toBeDefined();
      expect(adaptation.adaptedContent).toBeDefined();
    }
  });

  test('should complete activity session and provide summary', async () => {
    const session = await aiOrchestrator.initializeActivitySession('test-user-123', 'mindfulness_session');
    
    const summary = await aiOrchestrator.completeActivitySession(session.sessionId);
    
    expect(summary).toBeDefined();
    expect(summary.sessionId).toBe(session.sessionId);
    expect(summary.activityType).toBe('mindfulness_session');
    expect(summary.skillsPracticed).toBeInstanceOf(Array);
    expect(summary.nextRecommendations).toBeInstanceOf(Array);
  });

  test('should handle cultural context analysis', async () => {
    const culturalContext = await aiOrchestrator.analyzeCulturalContext(mockUserContext);
    
    expect(culturalContext).toBeDefined();
    expect(culturalContext.primaryCulture).toBe('north_indian');
    expect(culturalContext.languagePreference).toBe('mixed');
    expect(culturalContext.familyStructure).toBe('joint');
    expect(culturalContext.generationalFactors).toBeInstanceOf(Array);
    expect(culturalContext.culturalSensitivities).toBeInstanceOf(Array);
  });
});