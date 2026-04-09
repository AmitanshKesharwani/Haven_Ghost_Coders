// Activity Registry - Manages available activities and their configurations
// Provides activity discovery, recommendation, and configuration management

import { ActivityFactory, ActivityMetadata } from './ActivityFactory';
import {
  ActivityType,
  ActivityConfiguration,
  ActivityRecommendation,
  UserContext,
  DifficultyLevel,
  // TherapeuticInsight - removed unused import
} from './types';

export interface ActivityFilter {
  category?: ActivityMetadata['category'];
  difficultyLevel?: DifficultyLevel;
  maxDuration?: number;
  minDuration?: number;
  culturalRelevance?: number;
  therapeuticGoals?: string[];
  excludeTypes?: ActivityType[];
  includeOnlyTypes?: ActivityType[];
}

export interface RecommendationCriteria {
  userContext: UserContext;
  currentEmotionalState?: string;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'immediate';
  sessionTimeAvailable?: number;
  previousSessionOutcomes?: ActivityRecommendation[];
  specificNeeds?: string[];
}

export class ActivityRegistry {
  private static instance: ActivityRegistry;
  private factory: ActivityFactory;
  private recommendationEngine: ActivityRecommendationEngine;

  private constructor() {
    this.factory = ActivityFactory.getInstance();
    this.recommendationEngine = new ActivityRecommendationEngine(this.factory);
  }

  public static getInstance(): ActivityRegistry {
    if (!ActivityRegistry.instance) {
      ActivityRegistry.instance = new ActivityRegistry();
    }
    return ActivityRegistry.instance;
  }

  // Get all available activities
  public getAvailableActivities(filter?: ActivityFilter): ActivityMetadata[] {
    let activities = this.factory.getAllActivities();

    if (!filter) return activities;

    // Apply filters
    if (filter.category) {
      activities = activities.filter(activity => activity.category === filter.category);
    }

    if (filter.difficultyLevel) {
      activities = activities.filter(activity =>
        activity.difficultyLevels.includes(filter.difficultyLevel!)
      );
    }

    if (filter.maxDuration) {
      activities = activities.filter(activity =>
        activity.estimatedDurations.some(duration => duration <= filter.maxDuration!)
      );
    }

    if (filter.minDuration) {
      activities = activities.filter(activity =>
        activity.estimatedDurations.some(duration => duration >= filter.minDuration!)
      );
    }

    if (filter.culturalRelevance) {
      activities = activities.filter(activity =>
        activity.culturalRelevance >= filter.culturalRelevance!
      );
    }

    if (filter.therapeuticGoals) {
      activities = activities.filter(activity =>
        filter.therapeuticGoals!.some(goal =>
          activity.therapeuticGoals.includes(goal)
        )
      );
    }

    if (filter.excludeTypes) {
      activities = activities.filter(activity =>
        !filter.excludeTypes!.includes(activity.type)
      );
    }

    if (filter.includeOnlyTypes) {
      activities = activities.filter(activity =>
        filter.includeOnlyTypes!.includes(activity.type)
      );
    }

    return activities;
  }

  // Get activities by category
  public getActivitiesByCategory(category: ActivityMetadata['category']): ActivityMetadata[] {
    return this.factory.getActivitiesByCategory(category);
  }

  // Get activity metadata
  public getActivityInfo(activityType: ActivityType): ActivityMetadata | undefined {
    return this.factory.getActivityMetadata(activityType);
  }

  // Get suitable activities for user
  public getSuitableActivities(
    userContext: UserContext,
    filter?: ActivityFilter
  ): ActivityMetadata[] {
    // Get activities suitable for user from factory
    const suitableActivities = this.factory.getSuitableActivities(userContext, {
      ...(filter?.category && { category: filter.category }),
      ...(filter?.maxDuration && { maxDuration: filter.maxDuration }),
      ...(filter?.culturalRelevance && { minCulturalRelevance: filter.culturalRelevance }),
      ...(filter?.difficultyLevel && { difficultyLevel: filter.difficultyLevel })
    });

    // Apply additional filters
    if (filter) {
      return this.applyAdditionalFilters(suitableActivities, filter);
    }

    return suitableActivities;
  }

  private applyAdditionalFilters(
    activities: ActivityMetadata[],
    filter: ActivityFilter
  ): ActivityMetadata[] {
    let filtered = activities;

    if (filter.minDuration) {
      filtered = filtered.filter(activity =>
        activity.estimatedDurations.some(duration => duration >= filter.minDuration!)
      );
    }

    if (filter.therapeuticGoals) {
      filtered = filtered.filter(activity =>
        filter.therapeuticGoals!.some(goal =>
          activity.therapeuticGoals.includes(goal)
        )
      );
    }

    if (filter.excludeTypes) {
      filtered = filtered.filter(activity =>
        !filter.excludeTypes!.includes(activity.type)
      );
    }

    if (filter.includeOnlyTypes) {
      filtered = filtered.filter(activity =>
        filter.includeOnlyTypes!.includes(activity.type)
      );
    }

    return filtered;
  }

  // Get activity recommendations
  public getRecommendations(criteria: RecommendationCriteria): ActivityRecommendation[] {
    return this.recommendationEngine.generateRecommendations(criteria);
  }

  // Get emergency/crisis activities
  public getCrisisActivities(userContext: UserContext): ActivityRecommendation[] {
    const crisisFilter: ActivityFilter = {
      category: 'crisis',
      maxDuration: 20,
      difficultyLevel: 'beginner'
    };

    const crisisActivities = this.getSuitableActivities(userContext, crisisFilter);

    return crisisActivities.map(activity => ({
      activityType: activity.type,
      priority: 10,
      culturalRelevance: activity.culturalRelevance,
      estimatedDuration: Math.min(...activity.estimatedDurations),
      difficultyLevel: 'beginner',
      personalizedReason: 'Immediate crisis support needed',
      expectedOutcomes: activity.therapeuticGoals,
      urgency: 'immediate' as const
    }));
  }

  // Get quick relief activities (5-10 minutes)
  public getQuickReliefActivities(userContext: UserContext): ActivityRecommendation[] {
    const quickFilter: ActivityFilter = {
      maxDuration: 10,
      minDuration: 3,
      culturalRelevance: 7
    };

    const quickActivities = this.getSuitableActivities(userContext, quickFilter);

    return quickActivities.map(activity => ({
      activityType: activity.type,
      priority: 8,
      culturalRelevance: activity.culturalRelevance,
      estimatedDuration: Math.min(...activity.estimatedDurations.filter(d => d <= 10)),
      difficultyLevel: 'beginner',
      personalizedReason: 'Quick stress relief and emotional regulation',
      expectedOutcomes: activity.therapeuticGoals.slice(0, 2),
      urgency: 'high' as const
    }));
  }

  // Create activity configuration
  public createConfiguration(
    activityType: ActivityType,
    userContext: UserContext,
    customizations?: {
      difficultyLevel?: DifficultyLevel;
      duration?: number;
      culturalAdaptations?: string[];
      personalizations?: string[];
    }
  ): ActivityConfiguration {
    return this.factory.createDefaultConfiguration(activityType, userContext, customizations);
  }

  // Validate configuration
  public validateConfiguration(
    activityType: ActivityType,
    configuration: ActivityConfiguration
  ): { valid: boolean; errors: string[] } {
    return this.factory.validateConfiguration(activityType, configuration);
  }

  // Get activity statistics
  public getActivityStatistics(): {
    totalActivities: number;
    categoryCounts: Record<ActivityMetadata['category'], number>;
    difficultyDistribution: Record<DifficultyLevel, number>;
    averageCulturalRelevance: number;
  } {
    const activities = this.factory.getAllActivities();

    const categoryCounts: Record<ActivityMetadata['category'], number> = {
      mindfulness: 0,
      cbt: 0,
      assessment: 0,
      crisis: 0,
      cultural: 0,
      behavioral: 0
    };

    const difficultyDistribution: Record<DifficultyLevel, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    };

    let totalCulturalRelevance = 0;

    activities.forEach(activity => {
      categoryCounts[activity.category]++;
      totalCulturalRelevance += activity.culturalRelevance;

      activity.difficultyLevels.forEach(level => {
        difficultyDistribution[level]++;
      });
    });

    return {
      totalActivities: activities.length,
      categoryCounts,
      difficultyDistribution,
      averageCulturalRelevance: totalCulturalRelevance / activities.length
    };
  }
}

// Activity Recommendation Engine
class ActivityRecommendationEngine {
  private factory: ActivityFactory;

  constructor(factory: ActivityFactory) {
    this.factory = factory;
  }

  public generateRecommendations(criteria: RecommendationCriteria): ActivityRecommendation[] {
    const { userContext, urgencyLevel, sessionTimeAvailable } = criteria;

    // Get suitable activities
    const suitableActivities = this.factory.getSuitableActivities(userContext);

    // Score and rank activities
    const scoredActivities = suitableActivities.map(activity => ({
      activity,
      score: this.calculateActivityScore(activity, criteria)
    }));

    // Sort by score (highest first)
    scoredActivities.sort((a, b) => b.score - a.score);

    // Convert to recommendations
    const recommendations: ActivityRecommendation[] = scoredActivities
      .slice(0, 5) // Top 5 recommendations
      .map(({ activity, score }) => ({
        activityType: activity.type,
        priority: Math.ceil(score),
        culturalRelevance: activity.culturalRelevance,
        estimatedDuration: this.selectOptimalDuration(activity, sessionTimeAvailable),
        difficultyLevel: this.selectOptimalDifficulty(activity, userContext),
        personalizedReason: this.generatePersonalizedReason(activity, criteria),
        expectedOutcomes: activity.therapeuticGoals.slice(0, 3),
        urgency: urgencyLevel || 'medium'
      }));

    return recommendations;
  }

  private calculateActivityScore(
    activity: ActivityMetadata,
    criteria: RecommendationCriteria
  ): number {
    let score = 0;
    const { userContext, currentEmotionalState, urgencyLevel, sessionTimeAvailable, specificNeeds } = criteria;

    // Base score from cultural relevance
    score += activity.culturalRelevance * 0.2;

    // Score based on user preferences
    if (userContext.activityPreferences.preferredTypes.includes(activity.type)) {
      score += 3;
    }

    // Score based on therapeutic goals alignment
    const userGoals = userContext.mentalHealthHistory.therapeuticGoals;
    const goalAlignment = activity.therapeuticGoals.filter(goal =>
      userGoals.some(userGoal => userGoal.includes(goal) || goal.includes(userGoal))
    ).length;
    score += goalAlignment * 1.5;

    // Score based on current concerns
    const userConcerns = userContext.mentalHealthHistory.primaryConcerns;
    const concernAlignment = activity.therapeuticGoals.filter(goal =>
      userConcerns.some(concern => goal.includes(concern))
    ).length;
    score += concernAlignment * 2;

    // Score based on current emotional state
    if (currentEmotionalState) {
      score += this.getEmotionalStateAlignment(activity, currentEmotionalState);
    }

    // Score based on urgency level
    if (urgencyLevel === 'immediate' && activity.category === 'crisis') {
      score += 5;
    } else if (urgencyLevel === 'high' && activity.estimatedDurations.some(d => d <= 10)) {
      score += 3;
    }

    // Score based on time availability
    if (sessionTimeAvailable) {
      const hasMatchingDuration = activity.estimatedDurations.some(
        duration => Math.abs(duration - sessionTimeAvailable) <= 5
      );
      if (hasMatchingDuration) {
        score += 2;
      }
    }

    // Score based on specific needs
    if (specificNeeds) {
      const needsAlignment = activity.skillsTargeted.filter(skill =>
        specificNeeds.some(need => skill.includes(need) || need.includes(skill))
      ).length;
      score += needsAlignment * 1.5;
    }

    // Score based on user's current phase
    const currentPhase = userContext.therapeuticProgress.currentPhase;
    if (currentPhase === 'assessment' && activity.category === 'assessment') {
      score += 2;
    } else if (currentPhase === 'skill_building' &&
      (activity.category === 'mindfulness' || activity.category === 'cbt')) {
      score += 2;
    }

    // Penalty for recently completed similar activities
    const recentActivities = userContext.therapeuticProgress.completedActivities.slice(-3);
    if (recentActivities.includes(activity.type)) {
      score -= 1;
    }

    return Math.max(0, Math.min(10, score)); // Clamp between 0-10
  }

  private getEmotionalStateAlignment(activity: ActivityMetadata, emotionalState: string): number {
    const alignmentMap: Record<string, Record<ActivityMetadata['category'], number>> = {
      'stressed': { mindfulness: 3, cbt: 2, crisis: 1, assessment: 1, cultural: 2, behavioral: 2 },
      'anxious': { mindfulness: 3, cbt: 3, crisis: 2, assessment: 1, cultural: 1, behavioral: 2 },
      'depressed': { cbt: 3, behavioral: 3, mindfulness: 2, assessment: 2, cultural: 2, crisis: 1 },
      'angry': { mindfulness: 2, cbt: 3, behavioral: 2, crisis: 1, assessment: 1, cultural: 2 },
      'overwhelmed': { mindfulness: 3, crisis: 2, cbt: 2, assessment: 1, cultural: 1, behavioral: 1 },
      'calm': { mindfulness: 1, cbt: 2, assessment: 3, behavioral: 2, cultural: 2, crisis: 0 }
    };

    return alignmentMap[emotionalState]?.[activity.category] || 1;
  }

  private selectOptimalDuration(
    activity: ActivityMetadata,
    timeAvailable?: number
  ): number {
    if (!timeAvailable) {
      // Return middle duration option
      const durations = activity.estimatedDurations;
      return durations[Math.floor(durations.length / 2)] || 15;
    }

    // Find closest duration to available time
    const durations = activity.estimatedDurations;
    return durations.reduce((closest, current) =>
      Math.abs(current - timeAvailable) < Math.abs(closest - timeAvailable)
        ? current
        : closest
    );
  }

  private selectOptimalDifficulty(
    activity: ActivityMetadata,
    userContext: UserContext
  ): DifficultyLevel {
    const userPreference = userContext.activityPreferences.difficultyLevel;

    if (activity.difficultyLevels.includes(userPreference)) {
      return userPreference;
    }

    // Default to beginner if user preference not available
    return activity.difficultyLevels.includes('beginner') ? 'beginner' : (activity.difficultyLevels[0] || 'beginner');
  }

  private generatePersonalizedReason(
    activity: ActivityMetadata,
    criteria: RecommendationCriteria
  ): string {
    const { userContext, currentEmotionalState, urgencyLevel } = criteria;

    const reasons: string[] = [];

    // Based on emotional state
    if (currentEmotionalState) {
      const stateReasons: Record<string, string> = {
        'stressed': 'to help reduce your current stress levels',
        'anxious': 'to provide anxiety relief and calming techniques',
        'depressed': 'to improve your mood and energy levels',
        'overwhelmed': 'to help you regain control and clarity',
        'angry': 'to help process and manage your emotions'
      };

      if (stateReasons[currentEmotionalState]) {
        reasons.push(stateReasons[currentEmotionalState]);
      }
    }

    // Based on urgency
    if (urgencyLevel === 'immediate') {
      reasons.push('for immediate support and stabilization');
    } else if (urgencyLevel === 'high') {
      reasons.push('for quick relief and emotional regulation');
    }

    // Based on user goals
    const userGoals = userContext.mentalHealthHistory.therapeuticGoals;
    const matchingGoals = activity.therapeuticGoals.filter(goal =>
      userGoals.some(userGoal => userGoal.includes(goal))
    );

    if (matchingGoals.length > 0) {
      reasons.push(`to work on your goal of ${matchingGoals[0]?.replace('_', ' ') || 'personal growth'}`);
    }

    // Based on user concerns
    const userConcerns = userContext.mentalHealthHistory.primaryConcerns;
    const matchingConcerns = userConcerns.filter(concern =>
      activity.therapeuticGoals.some(goal => goal.includes(concern))
    );

    if (matchingConcerns.length > 0) {
      reasons.push(`to address your ${matchingConcerns[0]} concerns`);
    }

    // Default reason
    if (reasons.length === 0) {
      reasons.push(`based on your preferences and current needs`);
    }

    return `Recommended ${reasons.join(' and ')}`;
  }
}