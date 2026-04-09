// Activity Recommendation Engine - AI-powered activity recommendations
// Provides intelligent activity suggestions based on user needs and progress

import { ActivityRegistry } from './ActivityRegistry';
import { ActivityFactory } from './ActivityFactory';
import {
  ActivityType,
  ActivityRecommendation,
  UserContext,
  TherapeuticInsight,
  ActivityResult,
  DifficultyLevel
} from './types';

export interface RecommendationRequest {
  userContext: UserContext;
  currentEmotionalState?: string;
  recentTriggers?: string[];
  timeAvailable?: number;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'immediate';
  specificGoals?: string[];
  avoidActivities?: ActivityType[];
  preferredCategories?: string[];
}

export interface RecommendationResponse {
  primaryRecommendations: ActivityRecommendation[];
  alternativeRecommendations: ActivityRecommendation[];
  emergencyRecommendations?: ActivityRecommendation[];
  insights: TherapeuticInsight[];
  reasoning: string;
  confidence: number;
}

export class ActivityRecommendationEngine {
  private registry: ActivityRegistry;
  private factory: ActivityFactory;
  private userProgressHistory: Map<string, ActivityResult[]> = new Map();

  constructor() {
    this.registry = ActivityRegistry.getInstance();
    this.factory = ActivityFactory.getInstance();
  }

  // Main recommendation method
  public async generateRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    const {
      userContext,
      currentEmotionalState,
      recentTriggers,
      timeAvailable,
      urgencyLevel = 'medium',
      specificGoals,
      avoidActivities = [],
      preferredCategories = []
    } = request;

    // Analyze user's current state and needs
    const needsAnalysis = this.analyzeUserNeeds(userContext, currentEmotionalState, recentTriggers);
    
    // Get suitable activities
    const suitableActivities = this.registry.getSuitableActivities(userContext, {
      excludeTypes: avoidActivities,
      maxDuration: timeAvailable
    });

    // Score and rank activities
    const scoredActivities = this.scoreActivities(
      suitableActivities,
      needsAnalysis,
      request
    );

    // Generate different types of recommendations
    const primaryRecommendations = this.selectPrimaryRecommendations(
      scoredActivities,
      needsAnalysis,
      urgencyLevel
    );

    const alternativeRecommendations = this.selectAlternativeRecommendations(
      scoredActivities,
      primaryRecommendations
    );

    const emergencyRecommendations = urgencyLevel === 'immediate' 
      ? this.registry.getCrisisActivities(userContext)
      : undefined;

    // Generate insights
    const insights = this.generateTherapeuticInsights(needsAnalysis, userContext);

    // Generate reasoning
    const reasoning = this.generateRecommendationReasoning(
      needsAnalysis,
      primaryRecommendations,
      urgencyLevel
    );

    // Calculate confidence
    const confidence = this.calculateRecommendationConfidence(
      needsAnalysis,
      primaryRecommendations,
      userContext
    );

    return {
      primaryRecommendations,
      alternativeRecommendations,
      emergencyRecommendations,
      insights,
      reasoning,
      confidence
    };
  }

  // Analyze user's current needs
  private analyzeUserNeeds(
    userContext: UserContext,
    currentEmotionalState?: string,
    recentTriggers?: string[]
  ): UserNeedsAnalysis {
    const analysis: UserNeedsAnalysis = {
      primaryNeeds: [],
      secondaryNeeds: [],
      urgentNeeds: [],
      emotionalState: currentEmotionalState || userContext.currentState.emotionalState || 'neutral',
      stressLevel: userContext.currentState.stressLevel || 5,
      riskLevel: this.assessRiskLevel(userContext, recentTriggers),
      therapeuticPriorities: [],
      culturalConsiderations: [],
      timeConstraints: userContext.activityPreferences.sessionDuration
    };

    // Analyze primary concerns
    userContext.mentalHealthHistory.primaryConcerns.forEach(concern => {
      if (['anxiety', 'stress', 'panic'].some(keyword => concern.includes(keyword))) {
        analysis.primaryNeeds.push('anxiety_management');
        analysis.therapeuticPriorities.push('emotional_regulation');
      }
      
      if (['depression', 'mood', 'sadness'].some(keyword => concern.includes(keyword))) {
        analysis.primaryNeeds.push('mood_enhancement');
        analysis.therapeuticPriorities.push('behavioral_activation');
      }
      
      if (['sleep', 'insomnia'].some(keyword => concern.includes(keyword))) {
        analysis.secondaryNeeds.push('sleep_hygiene');
      }
      
      if (['relationship', 'family', 'social'].some(keyword => concern.includes(keyword))) {
        analysis.secondaryNeeds.push('social_skills');
        analysis.culturalConsiderations.push('family_dynamics');
      }
    });

    // Analyze current emotional state
    if (analysis.emotionalState) {
      const stateNeeds = this.getEmotionalStateNeeds(analysis.emotionalState);
      analysis.primaryNeeds.push(...stateNeeds.primary);
      analysis.secondaryNeeds.push(...stateNeeds.secondary);
      
      if (stateNeeds.urgent) {
        analysis.urgentNeeds.push(...stateNeeds.urgent);
      }
    }

    // Analyze recent triggers
    if (recentTriggers) {
      recentTriggers.forEach(trigger => {
        if (['exam', 'academic', 'study'].some(keyword => trigger.includes(keyword))) {
          analysis.primaryNeeds.push('academic_stress_management');
          analysis.culturalConsiderations.push('academic_pressure');
        }
        
        if (['family', 'parents', 'home'].some(keyword => trigger.includes(keyword))) {
          analysis.primaryNeeds.push('family_conflict_resolution');
          analysis.culturalConsiderations.push('family_harmony');
        }
        
        if (['work', 'job', 'career'].some(keyword => trigger.includes(keyword))) {
          analysis.primaryNeeds.push('work_stress_management');
        }
      });
    }

    // Analyze stress level
    if (analysis.stressLevel > 8) {
      analysis.urgentNeeds.push('immediate_stress_relief');
      analysis.therapeuticPriorities.unshift('crisis_stabilization');
    } else if (analysis.stressLevel > 6) {
      analysis.primaryNeeds.push('stress_reduction');
    }

    // Cultural considerations
    if (userContext.demographics.culturalBackground?.includes('indian')) {
      analysis.culturalConsiderations.push('indian_cultural_context', 'respect_hierarchy');
    }

    return analysis;
  }

  private getEmotionalStateNeeds(emotionalState: string): {
    primary: string[];
    secondary: string[];
    urgent?: string[];
  } {
    const stateNeedsMap: Record<string, any> = {
      'anxious': {
        primary: ['anxiety_management', 'grounding_techniques'],
        secondary: ['breathing_exercises', 'mindfulness_practice'],
        urgent: ['immediate_calming']
      },
      'stressed': {
        primary: ['stress_reduction', 'relaxation_techniques'],
        secondary: ['time_management', 'coping_strategies']
      },
      'depressed': {
        primary: ['mood_enhancement', 'behavioral_activation'],
        secondary: ['social_connection', 'activity_scheduling']
      },
      'overwhelmed': {
        primary: ['cognitive_organization', 'priority_setting'],
        secondary: ['stress_management', 'boundary_setting'],
        urgent: ['immediate_support']
      },
      'angry': {
        primary: ['anger_management', 'emotional_regulation'],
        secondary: ['communication_skills', 'conflict_resolution']
      },
      'lonely': {
        primary: ['social_connection', 'relationship_building'],
        secondary: ['self_compassion', 'community_engagement']
      },
      'confused': {
        primary: ['clarity_building', 'decision_making'],
        secondary: ['goal_setting', 'value_clarification']
      }
    };

    return stateNeedsMap[emotionalState] || {
      primary: ['general_wellbeing'],
      secondary: ['self_awareness']
    };
  }

  private assessRiskLevel(
    userContext: UserContext,
    recentTriggers?: string[]
  ): 'low' | 'medium' | 'high' | 'severe' {
    let riskScore = 0;

    // Risk factors from user history
    const riskFactors = userContext.mentalHealthHistory.riskFactors;
    riskScore += riskFactors.length * 0.5;

    // Current stress level
    const stressLevel = userContext.currentState.stressLevel || 5;
    if (stressLevel > 8) riskScore += 2;
    else if (stressLevel > 6) riskScore += 1;

    // Recent triggers
    if (recentTriggers) {
      const highRiskTriggers = ['crisis', 'emergency', 'suicide', 'harm', 'breakdown'];
      const hasHighRiskTrigger = recentTriggers.some(trigger =>
        highRiskTriggers.some(riskTrigger => trigger.toLowerCase().includes(riskTrigger))
      );
      if (hasHighRiskTrigger) riskScore += 3;
    }

    // Protective factors (reduce risk)
    const protectiveFactors = userContext.mentalHealthHistory.protectiveFactors;
    riskScore -= protectiveFactors.length * 0.3;

    // Convert score to risk level
    if (riskScore >= 4) return 'severe';
    if (riskScore >= 2.5) return 'high';
    if (riskScore >= 1) return 'medium';
    return 'low';
  }

  // Score activities based on user needs
  private scoreActivities(
    activities: any[],
    needsAnalysis: UserNeedsAnalysis,
    request: RecommendationRequest
  ): ScoredActivity[] {
    return activities.map(activity => ({
      activity,
      score: this.calculateActivityScore(activity, needsAnalysis, request),
      reasoning: this.generateActivityScoreReasoning(activity, needsAnalysis)
    })).sort((a, b) => b.score - a.score);
  }

  private calculateActivityScore(
    activity: any,
    needsAnalysis: UserNeedsAnalysis,
    request: RecommendationRequest
  ): number {
    let score = 0;

    // Base score from cultural relevance
    score += activity.culturalRelevance * 0.1;

    // Score based on addressing urgent needs
    const urgentNeedsAlignment = this.calculateNeedsAlignment(
      activity.therapeuticGoals,
      needsAnalysis.urgentNeeds
    );
    score += urgentNeedsAlignment * 4;

    // Score based on addressing primary needs
    const primaryNeedsAlignment = this.calculateNeedsAlignment(
      activity.therapeuticGoals,
      needsAnalysis.primaryNeeds
    );
    score += primaryNeedsAlignment * 3;

    // Score based on addressing secondary needs
    const secondaryNeedsAlignment = this.calculateNeedsAlignment(
      activity.therapeuticGoals,
      needsAnalysis.secondaryNeeds
    );
    score += secondaryNeedsAlignment * 1.5;

    // Score based on emotional state appropriateness
    score += this.getEmotionalStateScore(activity, needsAnalysis.emotionalState);

    // Score based on risk level appropriateness
    score += this.getRiskLevelScore(activity, needsAnalysis.riskLevel);

    // Score based on time constraints
    if (needsAnalysis.timeConstraints) {
      const hasMatchingDuration = activity.estimatedDurations.some(
        (duration: number) => Math.abs(duration - needsAnalysis.timeConstraints!) <= 5
      );
      if (hasMatchingDuration) score += 1;
    }

    // Score based on user preferences
    if (request.userContext.activityPreferences.preferredTypes.includes(activity.type)) {
      score += 2;
    }

    // Score based on preferred categories
    if (request.preferredCategories?.includes(activity.category)) {
      score += 1.5;
    }

    // Score based on specific goals
    if (request.specificGoals) {
      const goalAlignment = this.calculateNeedsAlignment(
        activity.therapeuticGoals,
        request.specificGoals
      );
      score += goalAlignment * 2;
    }

    // Penalty for recently completed activities
    const recentActivities = request.userContext.therapeuticProgress.completedActivities.slice(-3);
    if (recentActivities.includes(activity.type)) {
      score -= 1;
    }

    return Math.max(0, Math.min(10, score));
  }

  private calculateNeedsAlignment(therapeuticGoals: string[], needs: string[]): number {
    if (needs.length === 0) return 0;
    
    const alignmentCount = therapeuticGoals.filter(goal =>
      needs.some(need => 
        goal.includes(need) || 
        need.includes(goal) ||
        this.areRelatedConcepts(goal, need)
      )
    ).length;

    return alignmentCount / needs.length;
  }

  private areRelatedConcepts(concept1: string, concept2: string): boolean {
    const relatedConcepts: Record<string, string[]> = {
      'stress_reduction': ['anxiety_management', 'relaxation', 'calming'],
      'anxiety_management': ['stress_reduction', 'grounding_techniques', 'breathing'],
      'mood_enhancement': ['depression', 'behavioral_activation', 'positive_emotions'],
      'emotional_regulation': ['anger_management', 'mood_stability', 'coping'],
      'mindfulness_practice': ['present_moment', 'awareness', 'meditation'],
      'cognitive_restructuring': ['thought_challenging', 'negative_thinking', 'reframing']
    };

    return relatedConcepts[concept1]?.some(related => 
      concept2.includes(related) || related.includes(concept2)
    ) || false;
  }

  private getEmotionalStateScore(activity: any, emotionalState: string): number {
    const stateActivityMap: Record<string, Record<string, number>> = {
      'anxious': {
        'mindfulness_session': 3,
        'breathing_exercise': 3,
        'grounding_technique': 3,
        'cbt_exercise': 2,
        'guided_conversation': 2
      },
      'stressed': {
        'mindfulness_session': 3,
        'breathing_exercise': 2,
        'grounding_technique': 2,
        'journaling_prompt': 2
      },
      'depressed': {
        'cbt_exercise': 3,
        'behavioral_experiment': 3,
        'guided_conversation': 2,
        'mood_tracking': 2
      },
      'overwhelmed': {
        'grounding_technique': 3,
        'breathing_exercise': 2,
        'mindfulness_session': 2,
        'crisis_intervention': 2
      }
    };

    return stateActivityMap[emotionalState]?.[activity.type] || 1;
  }

  private getRiskLevelScore(activity: any, riskLevel: string): number {
    if (riskLevel === 'severe' && activity.category === 'crisis') return 3;
    if (riskLevel === 'high' && ['crisis', 'mindfulness'].includes(activity.category)) return 2;
    if (riskLevel === 'medium' && activity.category !== 'assessment') return 1;
    return 0;
  }

  // Select primary recommendations
  private selectPrimaryRecommendations(
    scoredActivities: ScoredActivity[],
    needsAnalysis: UserNeedsAnalysis,
    urgencyLevel: string
  ): ActivityRecommendation[] {
    const count = urgencyLevel === 'immediate' ? 2 : 3;
    
    return scoredActivities
      .slice(0, count)
      .map(({ activity, score }) => ({
        activityType: activity.type,
        priority: Math.ceil(score),
        culturalRelevance: activity.culturalRelevance,
        estimatedDuration: this.selectOptimalDuration(activity, needsAnalysis.timeConstraints),
        difficultyLevel: this.selectOptimalDifficulty(activity, needsAnalysis),
        personalizedReason: this.generatePersonalizedReason(activity, needsAnalysis),
        expectedOutcomes: activity.therapeuticGoals.slice(0, 3),
        urgency: this.mapUrgencyLevel(urgencyLevel)
      }));
  }

  // Select alternative recommendations
  private selectAlternativeRecommendations(
    scoredActivities: ScoredActivity[],
    primaryRecommendations: ActivityRecommendation[]
  ): ActivityRecommendation[] {
    const primaryTypes = primaryRecommendations.map(rec => rec.activityType);
    
    return scoredActivities
      .filter(({ activity }) => !primaryTypes.includes(activity.type))
      .slice(0, 3)
      .map(({ activity, score }) => ({
        activityType: activity.type,
        priority: Math.ceil(score * 0.8), // Slightly lower priority
        culturalRelevance: activity.culturalRelevance,
        estimatedDuration: activity.estimatedDurations[0],
        difficultyLevel: 'beginner' as DifficultyLevel,
        personalizedReason: `Alternative option: ${activity.description}`,
        expectedOutcomes: activity.therapeuticGoals.slice(0, 2),
        urgency: 'medium' as const
      }));
  }

  private selectOptimalDuration(activity: any, timeConstraint?: number): number {
    if (!timeConstraint) {
      return activity.estimatedDurations[Math.floor(activity.estimatedDurations.length / 2)];
    }

    return activity.estimatedDurations.reduce((closest: number, current: number) =>
      Math.abs(current - timeConstraint) < Math.abs(closest - timeConstraint)
        ? current
        : closest
    );
  }

  private selectOptimalDifficulty(activity: any, needsAnalysis: UserNeedsAnalysis): DifficultyLevel {
    // If high stress/risk, prefer beginner level
    if (needsAnalysis.stressLevel > 7 || needsAnalysis.riskLevel === 'high') {
      return 'beginner';
    }

    // Default to intermediate if available
    if (activity.difficultyLevels.includes('intermediate')) {
      return 'intermediate';
    }

    return activity.difficultyLevels[0];
  }

  private generatePersonalizedReason(activity: any, needsAnalysis: UserNeedsAnalysis): string {
    const reasons: string[] = [];

    // Based on urgent needs
    if (needsAnalysis.urgentNeeds.length > 0) {
      reasons.push(`to address your immediate need for ${needsAnalysis.urgentNeeds[0].replace('_', ' ')}`);
    }

    // Based on emotional state
    if (needsAnalysis.emotionalState !== 'neutral') {
      const stateReasons: Record<string, string> = {
        'anxious': 'to help calm your anxiety and reduce worry',
        'stressed': 'to provide stress relief and relaxation',
        'depressed': 'to improve your mood and energy',
        'overwhelmed': 'to help you regain control and clarity',
        'angry': 'to help process and manage your emotions'
      };
      
      if (stateReasons[needsAnalysis.emotionalState]) {
        reasons.push(stateReasons[needsAnalysis.emotionalState] || 'to support your emotional wellbeing');
      }
    }

    // Based on primary needs
    if (needsAnalysis.primaryNeeds.length > 0 && reasons.length === 0) {
      reasons.push(`to work on ${needsAnalysis.primaryNeeds[0]?.replace('_', ' ') || 'your wellbeing'}`);
    }

    return reasons.length > 0 
      ? `Recommended ${reasons.join(' and ')}`
      : `Recommended based on your current needs and preferences`;
  }

  private mapUrgencyLevel(urgencyLevel: string): 'low' | 'medium' | 'high' | 'immediate' {
    return urgencyLevel as 'low' | 'medium' | 'high' | 'immediate';
  }

  // Generate therapeutic insights
  private generateTherapeuticInsights(
    needsAnalysis: UserNeedsAnalysis,
    userContext: UserContext
  ): TherapeuticInsight[] {
    const insights: TherapeuticInsight[] = [];

    // Insight about emotional patterns
    if (needsAnalysis.emotionalState !== 'neutral') {
      insights.push({
        category: 'emotional',
        insight: `Your current ${needsAnalysis.emotionalState} state suggests focusing on immediate emotional regulation techniques`,
        confidence: 0.8,
        actionable: true,
        culturallyRelevant: true,
        priority: 'high'
      });
    }

    // Insight about stress levels
    if (needsAnalysis.stressLevel > 6) {
      insights.push({
        category: 'behavioral',
        insight: `Your elevated stress level (${needsAnalysis.stressLevel}/10) indicates a need for regular stress management practices`,
        confidence: 0.9,
        actionable: true,
        culturallyRelevant: true,
        priority: needsAnalysis.stressLevel > 8 ? 'high' : 'medium'
      });
    }

    // Insight about therapeutic progress
    const completedCount = userContext.therapeuticProgress.completedActivities.length;
    if (completedCount > 5) {
      insights.push({
        category: 'cognitive',
        insight: `You've completed ${completedCount} activities, showing good engagement with your mental health journey`,
        confidence: 0.9,
        actionable: false,
        culturallyRelevant: true,
        priority: 'low'
      });
    }

    return insights;
  }

  // Generate recommendation reasoning
  private generateRecommendationReasoning(
    needsAnalysis: UserNeedsAnalysis,
    _recommendations: ActivityRecommendation[],
    urgencyLevel: string
  ): string {
    const reasoningParts: string[] = [];

    // Urgency-based reasoning
    if (urgencyLevel === 'immediate') {
      reasoningParts.push('Given the immediate nature of your needs, I\'ve prioritized quick-acting interventions');
    } else if (urgencyLevel === 'high') {
      reasoningParts.push('Considering your current stress level, I\'ve focused on activities that provide rapid relief');
    }

    // Emotional state reasoning
    if (needsAnalysis.emotionalState !== 'neutral') {
      reasoningParts.push(`Your current ${needsAnalysis.emotionalState} state guided the selection toward ${needsAnalysis.emotionalState === 'anxious' ? 'calming' : 'supportive'} activities`);
    }

    // Needs-based reasoning
    if (needsAnalysis.primaryNeeds.length > 0) {
      reasoningParts.push(`The recommendations address your primary needs: ${needsAnalysis.primaryNeeds.slice(0, 2).join(' and ').replace(/_/g, ' ')}`);
    }

    // Cultural reasoning
    if (needsAnalysis.culturalConsiderations.length > 0) {
      reasoningParts.push('Activities were selected with cultural sensitivity and family dynamics in mind');
    }

    return reasoningParts.length > 0
      ? reasoningParts.join('. ') + '.'
      : 'Recommendations are based on your preferences, current state, and therapeutic goals.';
  }

  // Calculate recommendation confidence
  private calculateRecommendationConfidence(
    needsAnalysis: UserNeedsAnalysis,
    recommendations: ActivityRecommendation[],
    userContext: UserContext
  ): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence if we have clear emotional state
    if (needsAnalysis.emotionalState !== 'neutral') {
      confidence += 0.2;
    }

    // Higher confidence if we have specific needs
    if (needsAnalysis.primaryNeeds.length > 0) {
      confidence += 0.2;
    }

    // Higher confidence if user has activity history
    if (userContext.therapeuticProgress.completedActivities.length > 3) {
      confidence += 0.1;
    }

    // Higher confidence if recommendations have high priority
    const avgPriority = recommendations.reduce((sum, rec) => sum + rec.priority, 0) / recommendations.length;
    if (avgPriority > 7) {
      confidence += 0.1;
    }

    return Math.min(1, confidence);
  }

  private generateActivityScoreReasoning(activity: any, needsAnalysis: UserNeedsAnalysis): string {
    const reasons: string[] = [];

    if (needsAnalysis.urgentNeeds.some(need => 
      activity.therapeuticGoals.some((goal: string) => goal.includes(need))
    )) {
      reasons.push('addresses urgent needs');
    }

    if (activity.culturalRelevance > 8) {
      reasons.push('highly culturally relevant');
    }

    if (needsAnalysis.emotionalState !== 'neutral') {
      reasons.push(`suitable for ${needsAnalysis.emotionalState} state`);
    }

    return reasons.join(', ') || 'general suitability';
  }

  // Store user progress for future recommendations
  public recordActivityResult(userId: string, result: ActivityResult): void {
    if (!this.userProgressHistory.has(userId)) {
      this.userProgressHistory.set(userId, []);
    }
    
    const userHistory = this.userProgressHistory.get(userId)!;
    userHistory.push(result);
    
    // Keep only last 20 results
    if (userHistory.length > 20) {
      userHistory.shift();
    }
  }

  // Get user's activity history for better recommendations
  public getUserActivityHistory(userId: string): ActivityResult[] {
    return this.userProgressHistory.get(userId) || [];
  }
}

// Supporting interfaces
interface UserNeedsAnalysis {
  primaryNeeds: string[];
  secondaryNeeds: string[];
  urgentNeeds: string[];
  emotionalState: string;
  stressLevel: number;
  riskLevel: 'low' | 'medium' | 'high' | 'severe';
  therapeuticPriorities: string[];
  culturalConsiderations: string[];
  timeConstraints?: number;
}

interface ScoredActivity {
  activity: any;
  score: number;
  reasoning: string;
}