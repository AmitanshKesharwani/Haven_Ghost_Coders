// Difficulty Adjustment System - Dynamic difficulty scaling for therapeutic activities
// Automatically adjusts activity difficulty based on user performance and engagement

import {
  ActivitySession,
  ActivityConfiguration,
  UserContext,
  EngagementMetrics,
  DifficultyLevel,
  ActivityAdaptation
} from './types';

export interface DifficultyMetrics {
  currentDifficulty: DifficultyLevel;
  performanceScore: number; // 0-1 scale
  engagementScore: number; // 0-1 scale
  comprehensionScore: number; // 0-1 scale
  stressLevel: number; // 1-10 scale
  completionRate: number; // 0-1 scale
  adaptationCount: number;
}

export interface DifficultyAdjustment {
  fromLevel: DifficultyLevel;
  toLevel: DifficultyLevel;
  adjustmentType: 'increase' | 'decrease' | 'maintain';
  confidence: number;
  reasoning: string;
  parameters: DifficultyParameters;
}

export interface DifficultyParameters {
  complexityLevel: number; // 1-10 scale
  stepCount: number;
  interactionDepth: 'shallow' | 'moderate' | 'deep';
  conceptualDemand: 'low' | 'medium' | 'high';
  emotionalIntensity: 'gentle' | 'moderate' | 'intense';
  culturalSensitivity: number; // 1-10 scale
  languageComplexity: 'simple' | 'standard' | 'advanced';
}

export class DifficultyAdjustmentSystem {
  private adjustmentHistory: Map<string, DifficultyAdjustment[]> = new Map();
  private performanceThresholds = {
    increase: {
      performance: 0.8,
      engagement: 0.7,
      comprehension: 0.8,
      maxStress: 6
    },
    decrease: {
      performance: 0.4,
      engagement: 0.4,
      comprehension: 0.5,
      maxStress: 8
    }
  };

  // Main difficulty assessment method
  public assessDifficultyAdjustment(
    session: ActivitySession,
    userContext: UserContext,
    recentMetrics: EngagementMetrics[]
  ): DifficultyAdjustment | null {
    // Calculate current difficulty metrics
    const metrics = this.calculateDifficultyMetrics(session, recentMetrics);
    
    // Determine if adjustment is needed
    const adjustmentType = this.determineAdjustmentType(metrics, userContext);
    
    if (adjustmentType === 'maintain') {
      return null; // No adjustment needed
    }

    // Calculate target difficulty level
    const targetLevel = this.calculateTargetDifficulty(
      metrics.currentDifficulty,
      adjustmentType,
      metrics,
      userContext
    );

    // Generate adjustment parameters
    const parameters = this.generateDifficultyParameters(targetLevel, metrics, userContext);

    // Calculate confidence in adjustment
    const confidence = this.calculateAdjustmentConfidence(metrics, adjustmentType);

    // Generate reasoning
    const reasoning = this.generateAdjustmentReasoning(metrics, adjustmentType, targetLevel);

    const adjustment: DifficultyAdjustment = {
      fromLevel: metrics.currentDifficulty,
      toLevel: targetLevel,
      adjustmentType,
      confidence,
      reasoning,
      parameters
    };

    // Store adjustment history
    this.storeAdjustmentHistory(session.sessionId, adjustment);

    return adjustment;
  }

  // Apply difficulty adjustment to session
  public applyDifficultyAdjustment(
    session: ActivitySession,
    adjustment: DifficultyAdjustment
  ): Partial<ActivitySession> {
    const updates: Partial<ActivitySession> = {};

    // Update configuration
    const newConfiguration: ActivityConfiguration = {
      ...session.configuration,
      difficultyLevel: adjustment.toLevel
    };

    // Adjust session parameters based on difficulty
    const adjustedSteps = this.adjustStepCount(
      session.totalSteps,
      adjustment.adjustmentType as "increase" | "decrease",
      adjustment.parameters
    );

    updates.configuration = newConfiguration;
    updates.totalSteps = adjustedSteps;

    // Adjust current step if necessary
    if (adjustment.adjustmentType === 'decrease' && session.currentStep > adjustedSteps) {
      updates.currentStep = Math.max(1, adjustedSteps - 1);
    }

    // Update completion percentage
    updates.completionPercentage = (session.currentStep / adjustedSteps) * 100;

    return updates;
  }

  // Calculate difficulty metrics
  private calculateDifficultyMetrics(
    session: ActivitySession,
    recentMetrics: EngagementMetrics[]
  ): DifficultyMetrics {
    const avgEngagement = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.overallEngagement, 0) / recentMetrics.length
      : session.userEngagement;

    const avgResponseTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
      : 5000;

    // Calculate performance score based on multiple factors
    const performanceScore = this.calculatePerformanceScore(session, recentMetrics);
    
    // Calculate comprehension score based on response times and engagement
    const comprehensionScore = this.calculateComprehensionScore(avgResponseTime, avgEngagement);

    return {
      currentDifficulty: session.configuration.difficultyLevel,
      performanceScore,
      engagementScore: avgEngagement,
      comprehensionScore,
      stressLevel: session.realTimeMetrics.stressLevel,
      completionRate: session.completionPercentage / 100,
      adaptationCount: session.adaptations.length
    };
  }

  // Calculate performance score
  private calculatePerformanceScore(
    session: ActivitySession,
    recentMetrics: EngagementMetrics[]
  ): number {
    let score = 0;

    // Base score from completion rate
    score += session.completionPercentage / 100 * 0.4;

    // Score from engagement
    score += session.userEngagement * 0.3;

    // Score from adaptation count (fewer adaptations = better performance)
    const adaptationPenalty = Math.min(0.2, session.adaptations.length * 0.05);
    score += (0.2 - adaptationPenalty);

    // Score from consistency (less variation in engagement = better)
    if (recentMetrics.length > 1) {
      const engagementVariation = this.calculateVariation(
        recentMetrics.map(m => m.overallEngagement)
      );
      score += (1 - engagementVariation) * 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  // Calculate comprehension score
  private calculateComprehensionScore(avgResponseTime: number, avgEngagement: number): number {
    // Optimal response time is between 3-10 seconds
    let timeScore = 1;
    if (avgResponseTime < 2000) {
      timeScore = 0.6; // Too fast might indicate not thinking
    } else if (avgResponseTime > 15000) {
      timeScore = Math.max(0.2, 1 - (avgResponseTime - 15000) / 30000);
    }

    // Combine with engagement for comprehension estimate
    return (timeScore * 0.6) + (avgEngagement * 0.4);
  }

  // Determine adjustment type
  private determineAdjustmentType(
    _metrics: DifficultyMetrics,
    _userContext: UserContext
  ): 'increase' | 'decrease' | 'maintain' {
    const { increase, decrease } = this.performanceThresholds;

    // Check for decrease conditions (priority)
    if (
      _metrics.performanceScore < decrease.performance ||
      _metrics.engagementScore < decrease.engagement ||
      _metrics.comprehensionScore < decrease.comprehension ||
      _metrics.stressLevel > decrease.maxStress
    ) {
      return 'decrease';
    }

    // Check for increase conditions
    if (
      _metrics.performanceScore > increase.performance &&
      _metrics.engagementScore > increase.engagement &&
      _metrics.comprehensionScore > increase.comprehension &&
      _metrics.stressLevel <= increase.maxStress &&
      _metrics.currentDifficulty !== 'advanced'
    ) {
      return 'increase';
    }

    return 'maintain';
  }

  // Calculate target difficulty level
  private calculateTargetDifficulty(
    currentLevel: DifficultyLevel,
    adjustmentType: 'increase' | 'decrease',
    _metrics: DifficultyMetrics,
    _userContext: UserContext
  ): DifficultyLevel {
    if (adjustmentType === 'increase') {
      switch (currentLevel) {
        case 'beginner':
          return 'intermediate';
        case 'intermediate':
          return 'advanced';
        case 'advanced':
          return 'advanced'; // Already at max
      }
    } else if (adjustmentType === 'decrease') {
      switch (currentLevel) {
        case 'advanced':
          return 'intermediate';
        case 'intermediate':
          return 'beginner';
        case 'beginner':
          return 'beginner'; // Already at min
      }
    }

    return currentLevel;
  }

  // Generate difficulty parameters
  private generateDifficultyParameters(
    targetLevel: DifficultyLevel,
    _metrics: DifficultyMetrics,
    userContext: UserContext
  ): DifficultyParameters {
    const baseParameters = this.getBaseDifficultyParameters(targetLevel);
    
    // Adjust based on user context
    if (userContext.currentState.stressLevel && userContext.currentState.stressLevel > 7) {
      baseParameters.emotionalIntensity = 'gentle';
      baseParameters.complexityLevel = Math.max(1, baseParameters.complexityLevel - 1);
    }

    // Adjust based on cultural background
    if (userContext.demographics.culturalBackground?.includes('indian')) {
      baseParameters.culturalSensitivity = Math.max(8, baseParameters.culturalSensitivity);
    }

    // Adjust language complexity based on user preference
    if (userContext.demographics.language === 'hindi') {
      baseParameters.languageComplexity = 'simple';
    } else if (userContext.demographics.language === 'mixed') {
      baseParameters.languageComplexity = baseParameters.languageComplexity === 'advanced' 
        ? 'standard' 
        : baseParameters.languageComplexity;
    }

    return baseParameters;
  }

  // Get base parameters for difficulty level
  private getBaseDifficultyParameters(level: DifficultyLevel): DifficultyParameters {
    switch (level) {
      case 'beginner':
        return {
          complexityLevel: 3,
          stepCount: 4,
          interactionDepth: 'shallow',
          conceptualDemand: 'low',
          emotionalIntensity: 'gentle',
          culturalSensitivity: 8,
          languageComplexity: 'simple'
        };

      case 'intermediate':
        return {
          complexityLevel: 6,
          stepCount: 6,
          interactionDepth: 'moderate',
          conceptualDemand: 'medium',
          emotionalIntensity: 'moderate',
          culturalSensitivity: 7,
          languageComplexity: 'standard'
        };

      case 'advanced':
        return {
          complexityLevel: 9,
          stepCount: 8,
          interactionDepth: 'deep',
          conceptualDemand: 'high',
          emotionalIntensity: 'intense',
          culturalSensitivity: 6,
          languageComplexity: 'advanced'
        };
    }
  }

  // Removed duplicate adjustStepCount method

  // Calculate adjustment confidence
  private calculateAdjustmentConfidence(
    metrics: DifficultyMetrics,
    adjustmentType: 'increase' | 'decrease'
  ): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence with clear performance indicators
    if (adjustmentType === 'decrease') {
      if (metrics.stressLevel > 8) confidence += 0.3;
      if (metrics.engagementScore < 0.3) confidence += 0.2;
      if (metrics.comprehensionScore < 0.4) confidence += 0.2;
    } else if (adjustmentType === 'increase') {
      if (metrics.performanceScore > 0.8) confidence += 0.2;
      if (metrics.engagementScore > 0.8) confidence += 0.2;
      if (metrics.adaptationCount === 0) confidence += 0.1;
    }

    // Lower confidence with mixed signals
    if (Math.abs(metrics.performanceScore - metrics.engagementScore) > 0.3) {
      confidence -= 0.1;
    }

    return Math.max(0.3, Math.min(1, confidence));
  }

  // Generate adjustment reasoning
  private generateAdjustmentReasoning(
    metrics: DifficultyMetrics,
    adjustmentType: 'increase' | 'decrease',
    targetLevel: DifficultyLevel
  ): string {
    const reasons: string[] = [];

    if (adjustmentType === 'decrease') {
      if (metrics.stressLevel > 8) {
        reasons.push('high stress level detected');
      }
      if (metrics.engagementScore < 0.4) {
        reasons.push('low engagement observed');
      }
      if (metrics.comprehensionScore < 0.5) {
        reasons.push('comprehension difficulties noted');
      }
      if (metrics.performanceScore < 0.4) {
        reasons.push('performance below expectations');
      }
    } else if (adjustmentType === 'increase') {
      if (metrics.performanceScore > 0.8) {
        reasons.push('excellent performance demonstrated');
      }
      if (metrics.engagementScore > 0.7) {
        reasons.push('high engagement maintained');
      }
      if (metrics.adaptationCount === 0) {
        reasons.push('no adaptations needed');
      }
    }

    const action = adjustmentType === 'increase' ? 'Increasing' : 'Decreasing';
    const reasonText = reasons.length > 0 ? reasons.join(', ') : 'overall performance metrics';
    
    return `${action} difficulty to ${targetLevel} level due to: ${reasonText}`;
  }

  // Utility methods
  private calculateVariation(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private storeAdjustmentHistory(sessionId: string, adjustment: DifficultyAdjustment): void {
    if (!this.adjustmentHistory.has(sessionId)) {
      this.adjustmentHistory.set(sessionId, []);
    }
    
    const history = this.adjustmentHistory.get(sessionId)!;
    history.push(adjustment);
    
    // Keep only last 10 adjustments per session
    if (history.length > 10) {
      history.shift();
    }
  }

  // Public methods for external access
  public getAdjustmentHistory(sessionId: string): DifficultyAdjustment[] {
    return this.adjustmentHistory.get(sessionId) || [];
  }

  public updatePerformanceThresholds(
    thresholds: Partial<typeof this.performanceThresholds>
  ): void {
    if (thresholds.increase) {
      this.performanceThresholds.increase = { ...this.performanceThresholds.increase, ...thresholds.increase };
    }
    if (thresholds.decrease) {
      this.performanceThresholds.decrease = { ...this.performanceThresholds.decrease, ...thresholds.decrease };
    }
  }

  public getDifficultyRecommendation(
    userContext: UserContext,
    _activityType: string
  ): DifficultyLevel {
    // Recommend difficulty based on user context
    const userPreference = userContext.activityPreferences.difficultyLevel;
    const stressLevel = userContext.currentState.stressLevel || 5;
    const experience = userContext.therapeuticProgress.completedActivities.length;

    // Adjust based on stress level
    if (stressLevel > 8) {
      return 'beginner';
    }

    // Adjust based on experience
    if (experience < 3) {
      return 'beginner';
    } else if (experience > 10 && userPreference === 'advanced') {
      return 'advanced';
    }

    return userPreference;
  }

  public createAdaptationFromAdjustment(
    adjustment: DifficultyAdjustment,
    _sessionId: string
  ): ActivityAdaptation {
    return {
      timestamp: new Date(),
      trigger: 'low_engagement', // This would be determined by the calling context
      adaptationType: 'difficulty_adjustment',
      originalContent: `Difficulty level: ${adjustment.fromLevel}`,
      adaptedContent: `Difficulty level: ${adjustment.toLevel}`,
      reasoning: adjustment.reasoning,
      effectiveness: adjustment.confidence
    };
  }

  // Add missing adjustStepCount method
  private adjustStepCount(
    currentSteps: number,
    adjustmentType: 'decrease' | 'increase',
    _parameters: DifficultyParameters
  ): number {
    switch (adjustmentType) {
      case 'decrease':
        return Math.max(1, Math.floor(currentSteps * 0.8));
      case 'increase':
        return Math.ceil(currentSteps * 1.2);
      default:
        return currentSteps;
    }
  }
}