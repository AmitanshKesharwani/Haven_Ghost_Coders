// Base Activity Service - Abstract class for all therapeutic activities
// Provides common functionality for activity lifecycle management, session handling, and adaptation

import {
  ActivityType,
  ActivitySession,
  ActivityConfiguration,
  ActivityResult,
  UserContext,
  UserInput,
  ActivityResponse,
  ActivityAdaptation,
  AdaptationTrigger,
  EngagementMetrics,
  ActivityError,
  // TherapeuticInsight, - removed unused import
  // ActivityRecommendation, - removed unused import
  ActivityInteraction,
  UserResponse,
  AIResponse
} from './types';

export abstract class BaseActivityService {
  protected sessionId: string;
  protected userId: string;
  protected activityType: ActivityType;
  protected session: ActivitySession | null = null;
  protected userContext: UserContext;

  constructor(
    sessionId: string,
    userId: string,
    activityType: ActivityType,
    userContext: UserContext
  ) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.activityType = activityType;
    this.userContext = userContext;
  }

  // Abstract methods that must be implemented by specific activity services
  abstract initializeActivity(configuration: ActivityConfiguration): Promise<ActivitySession>;
  abstract processUserInput(input: UserInput): Promise<ActivityResponse>;
  abstract generateNextStep(): Promise<ActivityResponse>;
  abstract completeActivity(): Promise<ActivityResult>;

  // Abstract method for activity-specific adaptation logic
  protected abstract handleActivitySpecificAdaptation(
    trigger: AdaptationTrigger,
    context: any
  ): Promise<ActivityAdaptation>;

  // Common lifecycle management methods
  async startActivity(configuration: ActivityConfiguration): Promise<ActivitySession> {
    try {
      // Validate prerequisites
      await this.validatePrerequisites(configuration);

      // Initialize the activity session
      this.session = await this.initializeActivity(configuration);

      // Log activity start
      await this.logInteraction({
        timestamp: new Date(),
        type: 'system_event',
        content: `Activity ${this.activityType} started`,
        metadata: { configuration }
      });

      return this.session;
    } catch (error) {
      throw this.handleError(error as Error, 'activity_initialization');
    }
  }

  async executeStep(input: UserInput): Promise<ActivityResponse> {
    if (!this.session) {
      throw new ActivityError({
        code: 'NO_ACTIVE_SESSION',
        message: 'No active session found',
        type: 'system',
        severity: 'high',
        recoverable: false
      });
    }

    try {
      // Update engagement metrics
      const engagement = await this.assessEngagement(input);
      this.session.userEngagement = engagement.overallEngagement;

      // Log user interaction
      await this.logUserResponse(input, engagement);

      // Process the input
      const response = await this.processUserInput(input);

      // Log AI response
      await this.logAIResponse(response);

      // Check for adaptation needs
      await this.checkAdaptationNeeds(engagement, input);

      // Update session progress
      await this.updateSessionProgress(response);

      return response;
    } catch (error) {
      throw this.handleError(error as Error, 'step_execution');
    }
  }

  async pauseActivity(): Promise<void> {
    if (!this.session) return;

    this.session.status = 'paused';
    await this.logInteraction({
      timestamp: new Date(),
      type: 'system_event',
      content: 'Activity paused',
      metadata: { currentStep: this.session.currentStep }
    });
  }

  async resumeActivity(): Promise<ActivityResponse> {
    if (!this.session) {
      throw new ActivityError({
        code: 'NO_SESSION_TO_RESUME',
        message: 'No session available to resume',
        type: 'system',
        severity: 'medium',
        recoverable: false
      });
    }

    this.session.status = 'active';
    await this.logInteraction({
      timestamp: new Date(),
      type: 'system_event',
      content: 'Activity resumed',
      metadata: { currentStep: this.session.currentStep }
    });

    return this.generateNextStep();
  }

  async abandonActivity(reason?: string): Promise<void> {
    if (!this.session) return;

    this.session.status = 'abandoned';
    this.session.endTime = new Date();

    await this.logInteraction({
      timestamp: new Date(),
      type: 'system_event',
      content: `Activity abandoned: ${reason || 'No reason provided'}`,
      metadata: { completionPercentage: this.session.completionPercentage }
    });

    // Generate partial results
    this.session.sessionResult = await this.generatePartialResult();
  }

  // Common validation methods
  protected async validatePrerequisites(configuration: ActivityConfiguration): Promise<void> {
    if (!configuration.prerequisites) return;

    const completedActivities = this.userContext.therapeuticProgress.completedActivities;
    const missingPrerequisites = configuration.prerequisites.filter(
      prereq => !completedActivities.includes(prereq)
    );

    if (missingPrerequisites.length > 0) {
      throw new ActivityError({
        code: 'MISSING_PREREQUISITES',
        message: `Missing prerequisites: ${missingPrerequisites.join(', ')}`,
        type: 'user_input',
        severity: 'medium',
        recoverable: true,
        fallbackOptions: ['suggest_prerequisite_activities']
      });
    }
  }

  protected validateInput(input: UserInput): boolean {
    if (!input.content || input.content.trim().length === 0) {
      return false;
    }

    // Check for appropriate content length
    if (input.content.length > 5000) {
      return false;
    }

    return true;
  }

  // Common engagement assessment
  protected async assessEngagement(input: UserInput): Promise<EngagementMetrics> {
    const responseTime = input.metadata?.responseTime || 5000;
    const messageLength = input.content.length;
    const emotionalExpression = this.assessEmotionalExpression(input.content);
    const questionAsking = this.countQuestions(input.content);
    const followThrough = this.assessFollowThrough(input);

    const overallEngagement = this.calculateOverallEngagement(
      responseTime,
      messageLength,
      emotionalExpression,
      questionAsking,
      followThrough
    );

    return {
      responseTime,
      messageLength,
      emotionalExpression,
      questionAsking,
      followThrough,
      overallEngagement,
      timestamp: new Date()
    };
  }

  private assessEmotionalExpression(content: string): number {
    const emotionalWords = [
      'feel', 'think', 'believe', 'worried', 'happy', 'sad', 'angry', 'excited',
      'महसूस', 'लगता', 'चिंता', 'खुश', 'उदास', 'गुस्सा'
    ];

    const words = content.toLowerCase().split(/\s+/);
    const emotionalCount = words.filter(word =>
      emotionalWords.some(emoWord => word.includes(emoWord))
    ).length;

    return Math.min(1, emotionalCount / 3);
  }

  private countQuestions(content: string): number {
    const questionMarks = (content.match(/\?/g) || []).length;
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'can', 'should', 'would', 'क्या', 'कैसे', 'क्यों'];
    const words = content.toLowerCase().split(/\s+/);
    const questionWordCount = words.filter(word => questionWords.includes(word)).length;

    return Math.min(1, (questionMarks + questionWordCount) / 5);
  }

  private assessFollowThrough(_input: UserInput): number {
    // Check if user is following previous instructions or suggestions
    // This would be enhanced with session history analysis
    return 0.7; // Default moderate follow-through
  }

  private calculateOverallEngagement(
    responseTime: number,
    messageLength: number,
    emotionalExpression: number,
    questionAsking: number,
    followThrough: number
  ): number {
    // Normalize response time (faster = more engaged, but not too fast)
    const timeScore = responseTime < 1000 ? 0.5 : Math.max(0, 1 - (responseTime - 1000) / 30000);

    // Normalize message length (longer = more engaged, up to a point)
    const lengthScore = Math.min(1, messageLength / 100);

    // Combine all factors with weights
    return (timeScore * 0.25) + (lengthScore * 0.25) + (emotionalExpression * 0.2) +
      (questionAsking * 0.15) + (followThrough * 0.15);
  }

  // Common adaptation methods
  protected async checkAdaptationNeeds(
    engagement: EngagementMetrics,
    input: UserInput
  ): Promise<void> {
    if (!this.session) return;

    const adaptationTriggers: AdaptationTrigger[] = [];

    // Check engagement levels
    if (engagement.overallEngagement < 0.3) {
      adaptationTriggers.push('low_engagement');
    }

    // Check response time
    if (engagement.responseTime > 20000) {
      adaptationTriggers.push('comprehension_issue');
    }

    // Check for emotional distress indicators
    if (this.detectEmotionalDistress(input.content)) {
      adaptationTriggers.push('emotional_distress');
    }

    // Check for crisis indicators
    if (this.detectCrisisIndicators(input.content)) {
      adaptationTriggers.push('crisis_detected');
    }

    // Apply adaptations if needed
    for (const trigger of adaptationTriggers) {
      await this.adaptActivity(trigger, { engagement, input });
    }
  }

  protected async adaptActivity(
    trigger: AdaptationTrigger,
    context: any
  ): Promise<ActivityAdaptation> {
    if (!this.session) {
      throw new Error('No active session for adaptation');
    }

    // Common adaptation logic
    let adaptation: ActivityAdaptation;

    switch (trigger) {
      case 'low_engagement':
        adaptation = await this.handleLowEngagement(context);
        break;
      case 'emotional_distress':
        adaptation = await this.handleEmotionalDistress(context);
        break;
      case 'crisis_detected':
        adaptation = await this.handleCrisisDetection(context);
        break;
      case 'comprehension_issue':
        adaptation = await this.handleComprehensionIssue(context);
        break;
      default:
        adaptation = await this.handleActivitySpecificAdaptation(trigger, context);
    }

    // Log the adaptation
    this.session.adaptations.push(adaptation);
    await this.logInteraction({
      timestamp: new Date(),
      type: 'adaptation',
      content: `Adaptation applied: ${adaptation.adaptationType}`,
      metadata: { trigger, adaptation }
    });

    return adaptation;
  }

  private async handleLowEngagement(_context: any): Promise<ActivityAdaptation> {
    return {
      timestamp: new Date(),
      trigger: 'low_engagement',
      adaptationType: 'intervention_change',
      originalContent: 'Standard activity flow',
      adaptedContent: 'Simplified, more interactive approach with shorter responses',
      reasoning: 'User engagement below threshold, switching to more engaging format'
    };
  }

  private async handleEmotionalDistress(_context: any): Promise<ActivityAdaptation> {
    return {
      timestamp: new Date(),
      trigger: 'emotional_distress',
      adaptationType: 'intervention_change',
      originalContent: 'Current activity focus',
      adaptedContent: 'Emotional regulation and grounding techniques',
      reasoning: 'Detected emotional distress, prioritizing emotional stabilization'
    };
  }

  private async handleCrisisDetection(_context: any): Promise<ActivityAdaptation> {
    return {
      timestamp: new Date(),
      trigger: 'crisis_detected',
      adaptationType: 'emergency_protocol',
      originalContent: 'Regular therapeutic activity',
      adaptedContent: 'Crisis intervention protocol activated',
      reasoning: 'Crisis indicators detected, switching to emergency support'
    };
  }

  private async handleComprehensionIssue(_context: any): Promise<ActivityAdaptation> {
    return {
      timestamp: new Date(),
      trigger: 'comprehension_issue',
      adaptationType: 'difficulty_adjustment',
      originalContent: 'Current difficulty level',
      adaptedContent: 'Simplified language and concepts',
      reasoning: 'Slow response time indicates comprehension difficulty'
    };
  }

  // Utility methods for content analysis
  private detectEmotionalDistress(content: string): boolean {
    const distressIndicators = [
      'overwhelmed', 'can\'t handle', 'too much', 'breaking down', 'falling apart',
      'परेशान', 'बहुत ज्यादा', 'सह नहीं सकता', 'टूट रहा'
    ];

    const lowerContent = content.toLowerCase();
    return distressIndicators.some(indicator => lowerContent.includes(indicator));
  }

  private detectCrisisIndicators(content: string): boolean {
    const crisisIndicators = [
      'suicide', 'kill myself', 'end it all', 'no point', 'give up',
      'आत्महत्या', 'मरना चाहता', 'जिंदगी से तंग', 'हार मान'
    ];

    const lowerContent = content.toLowerCase();
    return crisisIndicators.some(indicator => lowerContent.includes(indicator));
  }

  // Session management methods
  protected async updateSessionProgress(response: ActivityResponse): Promise<void> {
    if (!this.session) return;

    if (response.nextStep !== undefined) {
      this.session.currentStep = response.nextStep;
    }

    this.session.completionPercentage = (this.session.currentStep / this.session.totalSteps) * 100;

    // Update real-time metrics
    this.session.realTimeMetrics.responseTime = Date.now() - this.session.startTime.getTime();
  }

  protected async logInteraction(interaction: ActivityInteraction): Promise<void> {
    if (!this.session) return;
    this.session.interactions.push(interaction);
  }

  protected async logUserResponse(input: UserInput, engagement: EngagementMetrics): Promise<void> {
    if (!this.session) return;

    const userResponse: UserResponse = {
      timestamp: new Date(),
      content: input.content,
      responseTime: engagement.responseTime,
      emotionalIndicators: input.metadata?.emotionalIndicators,
      engagementLevel: engagement.overallEngagement
    };

    this.session.userResponses.push(userResponse);
  }

  protected async logAIResponse(response: ActivityResponse): Promise<void> {
    if (!this.session) return;

    const aiResponse: AIResponse = {
      timestamp: new Date(),
      content: response.content,
      interventionType: response.interventionType || 'guidance',
      culturalAdaptations: response.culturalAdaptations || [],
      therapeuticTechniques: response.therapeuticTechniques || [],
      confidence: 0.8 // Default confidence
    };

    this.session.aiResponses.push(aiResponse);
  }

  // Result generation methods
  protected async generatePartialResult(): Promise<ActivityResult> {
    if (!this.session) {
      throw new Error('No session available for result generation');
    }

    const duration = this.session.endTime
      ? (this.session.endTime.getTime() - this.session.startTime.getTime()) / (1000 * 60)
      : 0;

    return {
      sessionId: this.session.sessionId,
      activityType: this.session.activityType,
      completionStatus: 'partially_completed',
      engagementScore: this.session.userEngagement,
      comprehensionScore: this.calculateComprehensionScore(),
      emotionalProgress: {
        startingState: this.session.realTimeMetrics.emotionalState,
        endingState: this.session.realTimeMetrics.emotionalState,
        progressMade: 0.5 // Partial progress
      },
      skillDemonstration: [],
      therapeuticGoalsAddressed: [],
      insightsGained: [],
      skillsPracticed: [],
      copingStrategiesLearned: [],
      aiAssessment: {
        effectivenessRating: this.session.userEngagement,
        recommendedFollowUp: [],
        riskAssessment: {
          level: 'none',
          indicators: [],
          immediateActions: [],
          confidence: 0.5,
          requiresEscalation: false
        },
        culturalRelevance: 7 // Default
      },
      duration,
      adaptationsCount: this.session.adaptations.length,
      userSatisfaction: 7 // Default satisfaction score
    };
  }

  private calculateComprehensionScore(): number {
    if (!this.session) return 0;

    // Calculate based on response times and engagement
    const avgResponseTime = this.session.userResponses.reduce(
      (sum, response) => sum + response.responseTime, 0
    ) / this.session.userResponses.length;

    // Lower response time (but not too low) indicates better comprehension
    if (avgResponseTime < 2000) return 0.6; // Too fast might indicate not thinking
    if (avgResponseTime < 5000) return 0.9; // Good response time
    if (avgResponseTime < 10000) return 0.7; // Moderate
    return 0.4; // Slow response time
  }

  // Error handling
  protected handleError(error: Error, context: string): ActivityError {
    console.error(`Activity error in ${context}:`, error);

    return {
      name: 'ActivityError',
      code: 'ACTIVITY_ERROR',
      message: error.message,
      type: 'system',
      severity: 'medium',
      recoverable: true,
      fallbackOptions: ['retry', 'simplify_activity', 'switch_activity']
    };
  }

  // Getters for session information
  get currentSession(): ActivitySession | null {
    return this.session;
  }

  get isActive(): boolean {
    return this.session?.status === 'active';
  }

  get completionPercentage(): number {
    return this.session?.completionPercentage || 0;
  }
}