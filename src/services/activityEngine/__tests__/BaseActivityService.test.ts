// Tests for BaseActivityService and ActivitySessionManager
// Verifies core functionality of the activity engine framework

import { BaseActivityService } from '../BaseActivityService';
import { ActivitySessionManager } from '../ActivitySessionManager';
import {
  // ActivityType - removed unused import,
  ActivityConfiguration,
  ActivitySession,
  UserContext,
  UserInput,
  ActivityResponse,
  ActivityResult,
  AdaptationTrigger,
  ActivityAdaptation
} from '../types';

// Mock implementation for testing
class TestActivityService extends BaseActivityService {
  private steps = ['intro', 'main', 'conclusion'];
  private currentStepIndex = 0;

  async initializeActivity(configuration: ActivityConfiguration): Promise<ActivitySession> {
    const session: ActivitySession = {
      sessionId: this.sessionId,
      userId: this.userId,
      activityType: this.activityType,
      configuration,
      status: 'active',
      startTime: new Date(),
      currentStep: 1,
      totalSteps: this.steps.length,
      userEngagement: 0,
      completionPercentage: 0,
      adaptations: [],
      realTimeMetrics: {
        emotionalState: 'neutral',
        stressLevel: 5,
        responseTime: 0,
        comprehension: 0,
        participationLevel: 0
      },
      interactions: [],
      userResponses: [],
      aiResponses: []
    };

    this.session = session;
    return session;
  }

  async processUserInput(_input: UserInput): Promise<ActivityResponse> {
    this.currentStepIndex = Math.min(this.currentStepIndex + 1, this.steps.length - 1);
    
    return {
      content: `Processing step: ${this.steps[this.currentStepIndex]}`,
      type: 'guidance',
      nextStep: this.currentStepIndex + 1
    };
  }

  async generateNextStep(): Promise<ActivityResponse> {
    return {
      content: `Next step: ${this.steps[this.currentStepIndex]}`,
      type: 'guidance',
      nextStep: this.currentStepIndex + 1
    };
  }

  async completeActivity(): Promise<ActivityResult> {
    if (!this.session) {
      throw new Error('No active session');
    }

    return {
      sessionId: this.session.sessionId,
      activityType: this.session.activityType,
      completionStatus: 'completed',
      engagementScore: this.session.userEngagement,
      comprehensionScore: 0.8,
      emotionalProgress: {
        startingState: 'neutral',
        endingState: 'positive',
        progressMade: 0.7
      },
      skillDemonstration: [],
      therapeuticGoalsAddressed: ['test_goal'],
      insightsGained: [],
      skillsPracticed: ['test_skill'],
      copingStrategiesLearned: ['test_strategy'],
      aiAssessment: {
        effectivenessRating: 8,
        recommendedFollowUp: [],
        riskAssessment: {
          level: 'none',
          indicators: [],
          immediateActions: [],
          confidence: 0.9,
          requiresEscalation: false
        },
        culturalRelevance: 7
      },
      duration: 10,
      adaptationsCount: 0
    };
  }

  protected async handleActivitySpecificAdaptation(
    trigger: AdaptationTrigger,
    _context: any
  ): Promise<ActivityAdaptation> {
    return {
      timestamp: new Date(),
      trigger,
      adaptationType: 'intervention_change',
      originalContent: 'original',
      adaptedContent: 'adapted',
      reasoning: 'test adaptation'
    };
  }
}

describe('BaseActivityService', () => {
  let service: TestActivityService;
  let userContext: UserContext;
  let configuration: ActivityConfiguration;

  beforeEach(() => {
    userContext = {
      userId: 'test-user',
      demographics: {
        age: 25,
        language: 'english'
      },
      mentalHealthHistory: {
        previousSessions: 0,
        primaryConcerns: ['stress'],
        therapeuticGoals: ['relaxation'],
        riskFactors: [],
        protectiveFactors: []
      },
      currentState: {
        emotionalState: 'neutral',
        stressLevel: 5
      },
      activityPreferences: {
        preferredTypes: ['mindfulness_session'],
        sessionDuration: 15,
        difficultyLevel: 'beginner',
        interactionStyle: 'guided',
        culturalAdaptationLevel: 7
      },
      therapeuticProgress: {
        completedActivities: [],
        skillsLearned: [],
        currentPhase: 'assessment',
        engagementHistory: []
      }
    };

    configuration = {
      activityType: 'mindfulness_session',
      difficultyLevel: 'beginner',
      estimatedDuration: 15,
      culturalAdaptations: [],
      personalizations: [],
      learningObjectives: ['relaxation']
    };

    service = new TestActivityService(
      'test-session',
      'test-user',
      'mindfulness_session',
      userContext
    );
  });

  test('should initialize activity successfully', async () => {
    const session = await service.startActivity(configuration);
    
    expect(session).toBeDefined();
    expect(session.sessionId).toBe('test-session');
    expect(session.userId).toBe('test-user');
    expect(session.activityType).toBe('mindfulness_session');
    expect(session.status).toBe('active');
    expect(session.totalSteps).toBe(3);
  });

  test('should process user input and update session', async () => {
    await service.startActivity(configuration);
    
    const input: UserInput = {
      content: 'I am ready to start',
      timestamp: new Date(),
      type: 'text'
    };

    const response = await service.executeStep(input);
    
    expect(response).toBeDefined();
    expect(response.content).toContain('Processing step');
    expect(response.type).toBe('guidance');
  });

  test('should assess engagement correctly', async () => {
    await service.startActivity(configuration);
    
    const input: UserInput = {
      content: 'I feel really excited about this mindfulness practice! How does it work?',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        responseTime: 3000
      }
    };

    await service.executeStep(input);
    
    expect(service.currentSession?.userEngagement).toBeGreaterThan(0);
  });

  test('should handle activity pause and resume', async () => {
    await service.startActivity(configuration);
    
    await service.pauseActivity();
    expect(service.currentSession?.status).toBe('paused');
    
    const response = await service.resumeActivity();
    expect(service.currentSession?.status).toBe('active');
    expect(response).toBeDefined();
  });

  test('should complete activity and generate results', async () => {
    await service.startActivity(configuration);
    
    const result = await service.completeActivity();
    
    expect(result).toBeDefined();
    expect(result.completionStatus).toBe('completed');
    expect(result.therapeuticGoalsAddressed).toContain('test_goal');
    expect(result.skillsPracticed).toContain('test_skill');
  });

  test('should detect and handle low engagement', async () => {
    await service.startActivity(configuration);
    
    // Simulate low engagement input
    const lowEngagementInput: UserInput = {
      content: 'ok',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        responseTime: 25000 // Very slow response
      }
    };

    await service.executeStep(lowEngagementInput);
    
    // Check if adaptation was triggered
    const adaptations = service.currentSession?.adaptations || [];
    expect(adaptations.length).toBeGreaterThan(0);
  });

  test('should validate input correctly', async () => {
    await service.startActivity(configuration);
    
    const emptyInput: UserInput = {
      content: '',
      timestamp: new Date(),
      type: 'text'
    };

    const response = await service.executeStep(emptyInput);
    expect(response.content).toContain("didn't quite catch that");
  });
});

describe('ActivitySessionManager', () => {
  let sessionManager: ActivitySessionManager;
  let userContext: UserContext;
  let configuration: ActivityConfiguration;

  beforeEach(() => {
    sessionManager = new ActivitySessionManager();
    
    userContext = {
      userId: 'test-user',
      demographics: { age: 25 },
      mentalHealthHistory: {
        previousSessions: 0,
        primaryConcerns: [],
        therapeuticGoals: [],
        riskFactors: [],
        protectiveFactors: []
      },
      currentState: {},
      activityPreferences: {
        preferredTypes: ['mindfulness_session'],
        sessionDuration: 15,
        difficultyLevel: 'beginner',
        interactionStyle: 'guided',
        culturalAdaptationLevel: 7
      },
      therapeuticProgress: {
        completedActivities: [],
        skillsLearned: [],
        currentPhase: 'assessment',
        engagementHistory: []
      }
    };

    configuration = {
      activityType: 'mindfulness_session',
      difficultyLevel: 'beginner',
      estimatedDuration: 15,
      culturalAdaptations: [],
      personalizations: [],
      learningObjectives: []
    };
  });

  test('should create and manage sessions', async () => {
    const session = await sessionManager.createSession(
      'test-user',
      'mindfulness_session',
      configuration,
      userContext
    );

    expect(session).toBeDefined();
    expect(session.userId).toBe('test-user');
    expect(session.activityType).toBe('mindfulness_session');
    expect(session.status).toBe('not_started');

    // Start the session
    const startedSession = await sessionManager.startSession(session.sessionId);
    expect(startedSession.status).toBe('active');

    // Get the session
    const retrievedSession = await sessionManager.getSession(session.sessionId);
    expect(retrievedSession?.status).toBe('active');
  });

  test('should handle session state transitions', async () => {
    const session = await sessionManager.createSession(
      'test-user',
      'mindfulness_session',
      configuration,
      userContext
    );

    // Start -> Pause -> Resume -> Complete
    await sessionManager.startSession(session.sessionId);
    await sessionManager.pauseSession(session.sessionId);
    
    const pausedSession = await sessionManager.getSession(session.sessionId);
    expect(pausedSession?.status).toBe('paused');

    await sessionManager.resumeSession(session.sessionId);
    const resumedSession = await sessionManager.getSession(session.sessionId);
    expect(resumedSession?.status).toBe('active');
  });

  test('should get user sessions with filters', async () => {
    // Create multiple sessions
    await sessionManager.createSession('test-user', 'mindfulness_session', configuration, userContext);
    await sessionManager.createSession('test-user', 'cbt_exercise', configuration, userContext);
    
    const allSessions = await sessionManager.getUserSessions('test-user');
    expect(allSessions.length).toBe(2);

    const mindfulnessSessions = await sessionManager.getUserSessions(
      'test-user', 
      undefined, 
      'mindfulness_session'
    );
    expect(mindfulnessSessions.length).toBe(1);
    expect(mindfulnessSessions[0]?.activityType).toBe('mindfulness_session');
  });

  test('should enforce session limits', async () => {
    // Create maximum allowed sessions
    const session1 = await sessionManager.createSession('test-user', 'mindfulness_session', configuration, userContext);
    const session2 = await sessionManager.createSession('test-user', 'cbt_exercise', configuration, userContext);
    const session3 = await sessionManager.createSession('test-user', 'breathing_exercise', configuration, userContext);
    
    await sessionManager.startSession(session1.sessionId);
    await sessionManager.startSession(session2.sessionId);
    await sessionManager.startSession(session3.sessionId);

    // Creating a 4th session should abandon the oldest
    const session4 = await sessionManager.createSession('test-user', 'journaling_prompt', configuration, userContext);
    await sessionManager.startSession(session4.sessionId);

    const activeSessions = await sessionManager.getActiveUserSessions('test-user');
    expect(activeSessions.length).toBeLessThanOrEqual(3);
  });

  test('should generate session statistics', async () => {
    const session = await sessionManager.createSession('test-user', 'mindfulness_session', configuration, userContext);
    await sessionManager.startSession(session.sessionId);
    
    // Mock completion
    const mockResult: ActivityResult = {
      sessionId: session.sessionId,
      activityType: 'mindfulness_session',
      completionStatus: 'completed',
      engagementScore: 8,
      comprehensionScore: 7,
      emotionalProgress: { startingState: 'neutral', endingState: 'positive', progressMade: 0.8 },
      skillDemonstration: [],
      therapeuticGoalsAddressed: [],
      insightsGained: [],
      skillsPracticed: [],
      copingStrategiesLearned: [],
      aiAssessment: {
        effectivenessRating: 8,
        recommendedFollowUp: [],
        riskAssessment: { level: 'none', indicators: [], immediateActions: [], confidence: 0.9, requiresEscalation: false },
        culturalRelevance: 8
      },
      duration: 15,
      adaptationsCount: 0
    };

    await sessionManager.completeSession(session.sessionId, mockResult);

    const stats = await sessionManager.getSessionStatistics('test-user');
    expect(stats.totalSessions).toBe(1);
    expect(stats.completedSessions).toBe(1);
    expect(stats.averageEngagement).toBe(8);
  });
});