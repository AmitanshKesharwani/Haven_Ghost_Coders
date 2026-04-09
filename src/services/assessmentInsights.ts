// Real-time Assessment Insights Engine
// Provides immediate feedback, personalized recommendations, and progress tracking

import { AssessmentResult, AssessmentType, SimpleUserProfile } from './assessmentEngine';

export interface RealTimeInsight {
  id: string;
  type: 'immediate_feedback' | 'pattern_recognition' | 'progress_update' | 'risk_alert' | 'strength_identification';
  category: 'emotional' | 'behavioral' | 'cognitive' | 'cultural' | 'social';
  title: string;
  description: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  recommendations: InsightRecommendation[];
  culturalContext: string[];
  timestamp: Date;
  confidence: number; // 0-1 scale
}

export interface InsightRecommendation {
  id: string;
  type: 'immediate_action' | 'therapeutic_activity' | 'lifestyle_change' | 'professional_help' | 'family_support';
  priority: 'immediate' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedDuration: number; // minutes
  culturalAdaptations: string[];
  expectedOutcome: string;
  trackingMetrics: string[];
}

export interface ProgressComparison {
  currentAssessment: AssessmentResult;
  previousAssessment?: AssessmentResult;
  timeSpan: number; // days between assessments
  overallTrend: 'improving' | 'stable' | 'declining' | 'mixed';
  categoryTrends: Record<string, {
    trend: 'improving' | 'stable' | 'declining';
    changeAmount: number;
    significance: 'minimal' | 'moderate' | 'significant';
  }>;
  milestones: ProgressMilestone[];
  concerns: ProgressConcern[];
}

export interface ProgressMilestone {
  id: string;
  type: 'improvement' | 'stability' | 'goal_achievement' | 'skill_development';
  title: string;
  description: string;
  achievedDate: Date;
  significance: 'minor' | 'moderate' | 'major';
  culturalRelevance: number; // 1-10 scale
}

export interface ProgressConcern {
  id: string;
  type: 'deterioration' | 'stagnation' | 'new_symptom' | 'risk_increase';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
  urgency: 'monitor' | 'address_soon' | 'immediate_attention';
}

export interface PersonalizedRecommendationEngine {
  userProfile: SimpleUserProfile;
  assessmentHistory: AssessmentResult[];
  culturalFactors: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  preferredActivityTypes: string[];
  sessionDuration: 'short' | 'medium' | 'long'; // 15min, 30min, 60min
  interactionStyle: 'gentle' | 'direct' | 'motivational';
  culturalIntegration: 'high' | 'medium' | 'low';
  familyInvolvement: 'yes' | 'no' | 'selective';
  languagePreference: 'english' | 'hindi' | 'mixed';
}

export class RealTimeAssessmentInsights {
  private insightHistory: Map<string, RealTimeInsight[]>;
  private progressHistory: Map<string, ProgressComparison[]>;
  private recommendationEngine: PersonalizedRecommendationEngine | null;

  constructor() {
    this.insightHistory = new Map();
    this.progressHistory = new Map();
    this.recommendationEngine = null;
  }

  // Generate immediate insights from assessment results
  async generateImmediateInsights(
    assessmentResult: AssessmentResult,
    userProfile: SimpleUserProfile,
    previousResults?: AssessmentResult[]
  ): Promise<RealTimeInsight[]> {
    const insights: RealTimeInsight[] = [];

    // 1. Risk-based insights
    const riskInsights = await this.generateRiskBasedInsights(assessmentResult, userProfile);
    insights.push(...riskInsights);

    // 2. Pattern recognition insights
    if (previousResults && previousResults.length > 0) {
      const patternInsights = await this.generatePatternInsights(assessmentResult, previousResults, userProfile);
      insights.push(...patternInsights);
    }

    // 3. Strength identification insights
    const strengthInsights = await this.generateStrengthInsights(assessmentResult, userProfile);
    insights.push(...strengthInsights);

    // 4. Cultural context insights
    const culturalInsights = await this.generateCulturalInsights(assessmentResult, userProfile);
    insights.push(...culturalInsights);

    // 5. Immediate action insights
    const actionInsights = await this.generateActionableInsights(assessmentResult, userProfile);
    insights.push(...actionInsights);

    // Store insights for history
    const userId = userProfile.uid;
    const userInsights = this.insightHistory.get(userId) || [];
    userInsights.push(...insights);
    this.insightHistory.set(userId, userInsights);

    return insights.sort((a, b) => this.prioritizeInsights(a, b));
  }

  // Generate personalized recommendations based on assessment
  async generatePersonalizedRecommendations(
    assessmentResult: AssessmentResult,
    userProfile: SimpleUserProfile,
    userPreferences: UserPreferences
  ): Promise<InsightRecommendation[]> {
    const recommendations: InsightRecommendation[] = [];

    // Initialize recommendation engine
    this.recommendationEngine = {
      userProfile,
      assessmentHistory: [assessmentResult],
      culturalFactors: assessmentResult.culturalFactors,
      preferences: userPreferences
    };

    // 1. Immediate intervention recommendations
    if (assessmentResult.riskLevel === 'high' || assessmentResult.riskLevel === 'severe') {
      const crisisRecommendations = await this.generateCrisisRecommendations(assessmentResult, userPreferences);
      recommendations.push(...crisisRecommendations);
    }

    // 2. Therapeutic activity recommendations
    const activityRecommendations = await this.generateActivityRecommendations(assessmentResult, userPreferences);
    recommendations.push(...activityRecommendations);

    // 3. Lifestyle and coping recommendations
    const lifestyleRecommendations = await this.generateLifestyleRecommendations(assessmentResult, userPreferences);
    recommendations.push(...lifestyleRecommendations);

    // 4. Family and social support recommendations
    const socialRecommendations = await this.generateSocialSupportRecommendations(assessmentResult, userPreferences);
    recommendations.push(...socialRecommendations);

    // 5. Professional help recommendations
    const professionalRecommendations = await this.generateProfessionalHelpRecommendations(assessmentResult, userPreferences);
    recommendations.push(...professionalRecommendations);

    return recommendations.sort((a, b) => this.prioritizeRecommendations(a, b));
  }

  // Compare current assessment with previous assessments
  async generateProgressComparison(
    currentResult: AssessmentResult,
    previousResults: AssessmentResult[],
    userProfile: SimpleUserProfile
  ): Promise<ProgressComparison> {
    const mostRecentPrevious = previousResults[previousResults.length - 1];
    const timeSpan = mostRecentPrevious ? 
      Math.floor((new Date().getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    // Calculate overall trend
    const overallTrend = this.calculateOverallTrend(currentResult, mostRecentPrevious);

    // Calculate category trends
    const categoryTrends = this.calculateCategoryTrends(currentResult, mostRecentPrevious);

    // Identify milestones
    const milestones = await this.identifyProgressMilestones(currentResult, previousResults, userProfile);

    // Identify concerns
    const concerns = await this.identifyProgressConcerns(currentResult, previousResults, userProfile);

    const comparison: ProgressComparison = {
      currentAssessment: currentResult,
      previousAssessment: mostRecentPrevious,
      timeSpan,
      overallTrend,
      categoryTrends,
      milestones,
      concerns
    };

    // Store progress comparison
    const userId = userProfile.uid;
    const userProgress = this.progressHistory.get(userId) || [];
    userProgress.push(comparison);
    this.progressHistory.set(userId, userProgress);

    return comparison;
  }

  // Generate visual analytics for progress tracking
  async generateProgressAnalytics(
    userId: string,
    timeRange: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<{
    scoreTimeline: { date: Date; score: number; assessmentType: AssessmentType }[];
    categoryBreakdown: Record<string, number[]>;
    improvementAreas: string[];
    concernAreas: string[];
    milestoneTimeline: ProgressMilestone[];
    recommendationEffectiveness: Record<string, number>;
  }> {
    const progressHistory = this.progressHistory.get(userId) || [];
    const insightHistory = this.insightHistory.get(userId) || [];

    // Filter by time range
    const cutoffDate = this.getTimeRangeCutoff(timeRange);
    const filteredProgress = progressHistory.filter(p => 
      new Date() >= cutoffDate
    );

    // Generate score timeline
    const scoreTimeline = filteredProgress.map(p => ({
      date: new Date(),
      score: p.currentAssessment.totalScore,
      assessmentType: p.currentAssessment.assessmentType
    }));

    // Generate category breakdown
    const categoryBreakdown: Record<string, number[]> = {};
    filteredProgress.forEach(p => {
      Object.entries(p.currentAssessment.categoryScores).forEach(([category, score]) => {
        if (!categoryBreakdown[category]) categoryBreakdown[category] = [];
        categoryBreakdown[category].push(score);
      });
    });

    // Identify improvement and concern areas
    const improvementAreas = Object.entries(categoryBreakdown)
      .filter(([_, scores]) => this.isImprovingTrend(scores))
      .map(([category, _]) => category);

    const concernAreas = Object.entries(categoryBreakdown)
      .filter(([_, scores]) => this.isDecliningTrend(scores))
      .map(([category, _]) => category);

    // Get milestone timeline
    const milestoneTimeline = filteredProgress
      .flatMap(p => p.milestones)
      .sort((a, b) => a.achievedDate.getTime() - b.achievedDate.getTime());

    // Calculate recommendation effectiveness
    const recommendationEffectiveness = await this.calculateRecommendationEffectiveness(
      filteredProgress,
      insightHistory
    );

    return {
      scoreTimeline,
      categoryBreakdown,
      improvementAreas,
      concernAreas,
      milestoneTimeline,
      recommendationEffectiveness
    };
  }

  // Private helper methods

  private async generateRiskBasedInsights(
    result: AssessmentResult,
    userProfile: SimpleUserProfile
  ): Promise<RealTimeInsight[]> {
    const insights: RealTimeInsight[] = [];

    if (result.riskLevel === 'severe' || result.riskLevel === 'high') {
      insights.push({
        id: `risk_${Date.now()}`,
        type: 'risk_alert',
        category: 'emotional',
        title: 'Elevated Mental Health Concerns Detected',
        description: `Your assessment indicates ${result.riskLevel} level concerns that warrant immediate attention and support.`,
        severity: result.riskLevel === 'severe' ? 'critical' : 'high',
        actionable: true,
        recommendations: await this.generateCrisisRecommendations(result, {
          preferredActivityTypes: ['crisis_support'],
          sessionDuration: 'short',
          interactionStyle: 'gentle',
          culturalIntegration: 'high',
          familyInvolvement: 'selective',
          languagePreference: 'english'
        }),
        culturalContext: result.culturalFactors,
        timestamp: new Date(),
        confidence: 0.95
      });
    }

    return insights;
  }

  private async generatePatternInsights(
    current: AssessmentResult,
    previous: AssessmentResult[],
    userProfile: SimpleUserProfile
  ): Promise<RealTimeInsight[]> {
    const insights: RealTimeInsight[] = [];
    const mostRecent = previous[previous.length - 1];

    if (mostRecent) {
      const scoreChange = current.totalScore - mostRecent.totalScore;
      const changePercentage = Math.abs(scoreChange) / mostRecent.totalScore * 100;

      if (changePercentage > 20) { // Significant change
        const isImprovement = scoreChange < 0; // Lower scores are better
        
        insights.push({
          id: `pattern_${Date.now()}`,
          type: 'pattern_recognition',
          category: 'emotional',
          title: isImprovement ? 'Significant Improvement Detected' : 'Concerning Pattern Identified',
          description: `Your scores have ${isImprovement ? 'improved' : 'worsened'} by ${changePercentage.toFixed(1)}% since your last assessment.`,
          severity: isImprovement ? 'info' : 'medium',
          actionable: true,
          recommendations: [],
          culturalContext: current.culturalFactors,
          timestamp: new Date(),
          confidence: 0.85
        });
      }
    }

    return insights;
  }

  private async generateStrengthInsights(
    result: AssessmentResult,
    userProfile: SimpleUserProfile
  ): Promise<RealTimeInsight[]> {
    const insights: RealTimeInsight[] = [];

    // Identify low-scoring categories as strengths
    const strengths = Object.entries(result.categoryScores)
      .filter(([_, score]) => score <= 2)
      .map(([category, _]) => category);

    if (strengths.length > 0) {
      insights.push({
        id: `strength_${Date.now()}`,
        type: 'strength_identification',
        category: 'emotional',
        title: 'Personal Strengths Identified',
        description: `You show resilience in areas like ${strengths.join(', ')}. These are valuable resources for your mental health journey.`,
        severity: 'info',
        actionable: true,
        recommendations: [{
          id: `strength_rec_${Date.now()}`,
          type: 'therapeutic_activity',
          priority: 'medium',
          title: 'Strength-Building Activities',
          description: 'Engage in activities that build on your existing strengths',
          estimatedDuration: 20,
          culturalAdaptations: ['strength_based_approach'],
          expectedOutcome: 'Enhanced self-confidence and resilience',
          trackingMetrics: ['self_efficacy', 'confidence_level']
        }],
        culturalContext: result.culturalFactors,
        timestamp: new Date(),
        confidence: 0.8
      });
    }

    return insights;
  }

  private async generateCulturalInsights(
    result: AssessmentResult,
    userProfile: SimpleUserProfile
  ): Promise<RealTimeInsight[]> {
    const insights: RealTimeInsight[] = [];

    if (result.culturalFactors.includes('family_dynamics') || 
        result.culturalFactors.includes('academic_pressure')) {
      
      insights.push({
        id: `cultural_${Date.now()}`,
        type: 'immediate_feedback',
        category: 'cultural',
        title: 'Cultural Context Recognized',
        description: 'Your responses indicate that cultural and family factors play a significant role in your current experiences. This is completely normal and we can work with these dynamics.',
        severity: 'info',
        actionable: true,
        recommendations: [{
          id: `cultural_rec_${Date.now()}`,
          type: 'family_support',
          priority: 'medium',
          title: 'Cultural Integration Activities',
          description: 'Activities that honor your cultural background while addressing your mental health needs',
          estimatedDuration: 30,
          culturalAdaptations: ['family_inclusive', 'culturally_sensitive'],
          expectedOutcome: 'Better integration of cultural values with personal well-being',
          trackingMetrics: ['cultural_comfort', 'family_understanding']
        }],
        culturalContext: result.culturalFactors,
        timestamp: new Date(),
        confidence: 0.9
      });
    }

    return insights;
  }

  private async generateActionableInsights(
    result: AssessmentResult,
    userProfile: SimpleUserProfile
  ): Promise<RealTimeInsight[]> {
    const insights: RealTimeInsight[] = [];

    // Generate specific actionable insights based on highest scoring categories
    const highestCategory = Object.entries(result.categoryScores)
      .reduce((a, b) => a[1] > b[1] ? a : b);

    if (highestCategory[1] >= 3) {
      insights.push({
        id: `action_${Date.now()}`,
        type: 'immediate_feedback',
        category: 'behavioral',
        title: `Focus Area: ${highestCategory[0].replace('_', ' ')}`,
        description: `Your responses suggest that ${highestCategory[0].replace('_', ' ')} is currently your primary area of concern. Let's work on specific strategies to address this.`,
        severity: 'medium',
        actionable: true,
        recommendations: await this.generateCategorySpecificRecommendations(highestCategory[0], result),
        culturalContext: result.culturalFactors,
        timestamp: new Date(),
        confidence: 0.85
      });
    }

    return insights;
  }

  private async generateCrisisRecommendations(
    result: AssessmentResult,
    preferences: UserPreferences
  ): Promise<InsightRecommendation[]> {
    return [
      {
        id: `crisis_${Date.now()}`,
        type: 'immediate_action',
        priority: 'immediate',
        title: 'Connect with Crisis Support',
        description: 'Immediate connection to crisis helplines and emergency resources',
        estimatedDuration: 5,
        culturalAdaptations: ['crisis_culturally_appropriate'],
        expectedOutcome: 'Immediate safety and stabilization',
        trackingMetrics: ['safety_level', 'crisis_resolution']
      },
      {
        id: `professional_${Date.now()}`,
        type: 'professional_help',
        priority: 'immediate',
        title: 'Professional Mental Health Support',
        description: 'Schedule consultation with mental health professional within 24-48 hours',
        estimatedDuration: 60,
        culturalAdaptations: ['culturally_competent_therapist'],
        expectedOutcome: 'Professional assessment and treatment planning',
        trackingMetrics: ['professional_engagement', 'treatment_adherence']
      }
    ];
  }

  private async generateActivityRecommendations(
    result: AssessmentResult,
    preferences: UserPreferences
  ): Promise<InsightRecommendation[]> {
    const recommendations: InsightRecommendation[] = [];

    // Anxiety management activities
    if ((result.categoryScores.anxiety || 0) >= 2) {
      recommendations.push({
        id: `anxiety_activity_${Date.now()}`,
        type: 'therapeutic_activity',
        priority: 'high',
        title: 'Anxiety Management Activities',
        description: 'Breathing exercises, mindfulness, and grounding techniques',
        estimatedDuration: preferences.sessionDuration === 'short' ? 15 : 30,
        culturalAdaptations: ['pranayama_integration', 'meditation_techniques'],
        expectedOutcome: 'Reduced anxiety and improved emotional regulation',
        trackingMetrics: ['anxiety_level', 'coping_effectiveness']
      });
    }

    // Mood improvement activities
    if ((result.categoryScores.mood || 0) >= 2) {
      recommendations.push({
        id: `mood_activity_${Date.now()}`,
        type: 'therapeutic_activity',
        priority: 'high',
        title: 'Mood Enhancement Activities',
        description: 'Behavioral activation and positive psychology exercises',
        estimatedDuration: preferences.sessionDuration === 'short' ? 20 : 40,
        culturalAdaptations: ['culturally_meaningful_activities'],
        expectedOutcome: 'Improved mood and increased engagement',
        trackingMetrics: ['mood_rating', 'activity_engagement']
      });
    }

    return recommendations;
  }

  private async generateLifestyleRecommendations(
    result: AssessmentResult,
    preferences: UserPreferences
  ): Promise<InsightRecommendation[]> {
    return [
      {
        id: `lifestyle_${Date.now()}`,
        type: 'lifestyle_change',
        priority: 'medium',
        title: 'Daily Wellness Routine',
        description: 'Establish consistent sleep, exercise, and mindfulness practices',
        estimatedDuration: 30,
        culturalAdaptations: ['family_routine_integration'],
        expectedOutcome: 'Improved overall well-being and stability',
        trackingMetrics: ['sleep_quality', 'energy_level', 'routine_adherence']
      }
    ];
  }

  private async generateSocialSupportRecommendations(
    result: AssessmentResult,
    preferences: UserPreferences
  ): Promise<InsightRecommendation[]> {
    const recommendations: InsightRecommendation[] = [];

    if (preferences.familyInvolvement === 'yes') {
      recommendations.push({
        id: `family_support_${Date.now()}`,
        type: 'family_support',
        priority: 'medium',
        title: 'Family Education and Support',
        description: 'Help family members understand and support your mental health journey',
        estimatedDuration: 45,
        culturalAdaptations: ['family_education_culturally_appropriate'],
        expectedOutcome: 'Increased family understanding and support',
        trackingMetrics: ['family_support_level', 'communication_quality']
      });
    }

    return recommendations;
  }

  private async generateProfessionalHelpRecommendations(
    result: AssessmentResult,
    preferences: UserPreferences
  ): Promise<InsightRecommendation[]> {
    if (result.riskLevel === 'moderate' || result.riskLevel === 'high') {
      return [{
        id: `professional_${Date.now()}`,
        type: 'professional_help',
        priority: result.riskLevel === 'high' ? 'high' : 'medium',
        title: 'Professional Mental Health Consultation',
        description: 'Consider speaking with a mental health professional for additional support',
        estimatedDuration: 60,
        culturalAdaptations: ['culturally_competent_provider'],
        expectedOutcome: 'Professional guidance and treatment planning',
        trackingMetrics: ['professional_engagement', 'symptom_improvement']
      }];
    }

    return [];
  }

  private async generateCategorySpecificRecommendations(
    category: string,
    result: AssessmentResult
  ): Promise<InsightRecommendation[]> {
    const categoryMap: Record<string, InsightRecommendation> = {
      'academic_pressure': {
        id: `academic_${Date.now()}`,
        type: 'therapeutic_activity',
        priority: 'high',
        title: 'Academic Stress Management',
        description: 'Strategies for managing academic pressure and family expectations',
        estimatedDuration: 25,
        culturalAdaptations: ['academic_pressure_culturally_aware'],
        expectedOutcome: 'Reduced academic anxiety and improved coping',
        trackingMetrics: ['academic_stress_level', 'study_effectiveness']
      },
      'family_expectations': {
        id: `family_${Date.now()}`,
        type: 'family_support',
        priority: 'high',
        title: 'Family Communication Enhancement',
        description: 'Improve communication with family about expectations and personal needs',
        estimatedDuration: 35,
        culturalAdaptations: ['family_communication_culturally_sensitive'],
        expectedOutcome: 'Better family understanding and reduced conflict',
        trackingMetrics: ['family_relationship_quality', 'communication_satisfaction']
      }
    };

    return categoryMap[category] ? [categoryMap[category]] : [];
  }

  // Helper methods for calculations and analysis

  private calculateOverallTrend(
    current: AssessmentResult,
    previous?: AssessmentResult
  ): 'improving' | 'stable' | 'declining' | 'mixed' {
    if (!previous) return 'stable';

    const scoreDiff = current.totalScore - previous.totalScore;
    const changePercentage = Math.abs(scoreDiff) / previous.totalScore * 100;

    if (changePercentage < 10) return 'stable';
    if (scoreDiff < 0) return 'improving'; // Lower scores are better
    return 'declining';
  }

  private calculateCategoryTrends(
    current: AssessmentResult,
    previous?: AssessmentResult
  ): Record<string, { trend: 'improving' | 'stable' | 'declining'; changeAmount: number; significance: 'minimal' | 'moderate' | 'significant' }> {
    const trends: Record<string, any> = {};

    if (!previous) {
      Object.keys(current.categoryScores).forEach(category => {
        trends[category] = { trend: 'stable', changeAmount: 0, significance: 'minimal' };
      });
      return trends;
    }

    Object.entries(current.categoryScores).forEach(([category, currentScore]) => {
      const previousScore = previous.categoryScores[category] || 0;
      const changeAmount = currentScore - previousScore;
      const changePercentage = previousScore > 0 ? Math.abs(changeAmount) / previousScore * 100 : 0;

      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (changeAmount < -0.5) trend = 'improving';
      else if (changeAmount > 0.5) trend = 'declining';

      let significance: 'minimal' | 'moderate' | 'significant' = 'minimal';
      if (changePercentage > 30) significance = 'significant';
      else if (changePercentage > 15) significance = 'moderate';

      trends[category] = { trend, changeAmount, significance };
    });

    return trends;
  }

  private async identifyProgressMilestones(
    current: AssessmentResult,
    previous: AssessmentResult[],
    userProfile: SimpleUserProfile
  ): Promise<ProgressMilestone[]> {
    const milestones: ProgressMilestone[] = [];

    // Check for risk level improvements
    if (previous.length > 0) {
      const lastResult = previous[previous.length - 1];
      if (this.isRiskLevelImprovement(lastResult.riskLevel, current.riskLevel)) {
        milestones.push({
          id: `milestone_${Date.now()}`,
          type: 'improvement',
          title: 'Risk Level Improvement',
          description: `Your risk level has improved from ${lastResult.riskLevel} to ${current.riskLevel}`,
          achievedDate: new Date(),
          significance: 'major',
          culturalRelevance: 8
        });
      }
    }

    // Check for consistent engagement (if this is 3rd+ assessment)
    if (previous.length >= 2) {
      milestones.push({
        id: `engagement_${Date.now()}`,
        type: 'goal_achievement',
        title: 'Consistent Self-Assessment',
        description: 'You\'ve completed multiple assessments, showing commitment to your mental health journey',
        achievedDate: new Date(),
        significance: 'moderate',
        culturalRelevance: 7
      });
    }

    return milestones;
  }

  private async identifyProgressConcerns(
    current: AssessmentResult,
    previous: AssessmentResult[],
    userProfile: SimpleUserProfile
  ): Promise<ProgressConcern[]> {
    const concerns: ProgressConcern[] = [];

    if (previous.length > 0) {
      const lastResult = previous[previous.length - 1];
      
      // Check for risk level deterioration
      if (this.isRiskLevelDeterioration(lastResult.riskLevel, current.riskLevel)) {
        concerns.push({
          id: `concern_${Date.now()}`,
          type: 'deterioration',
          title: 'Increased Risk Level',
          description: `Your risk level has increased from ${lastResult.riskLevel} to ${current.riskLevel}`,
          severity: current.riskLevel === 'severe' ? 'critical' : 'high',
          recommendedActions: ['immediate_professional_consultation', 'crisis_support_activation'],
          urgency: current.riskLevel === 'severe' ? 'immediate_attention' : 'address_soon'
        });
      }

      // Check for new high-scoring categories
      Object.entries(current.categoryScores).forEach(([category, score]) => {
        const previousScore = lastResult.categoryScores[category] || 0;
        if (score >= 3 && previousScore < 2) {
          concerns.push({
            id: `new_symptom_${Date.now()}`,
            type: 'new_symptom',
            title: `New Area of Concern: ${category.replace('_', ' ')}`,
            description: `${category.replace('_', ' ')} has emerged as a new area requiring attention`,
            severity: 'medium',
            recommendedActions: [`targeted_${category}_intervention`],
            urgency: 'address_soon'
          });
        }
      });
    }

    return concerns;
  }

  private prioritizeInsights(a: RealTimeInsight, b: RealTimeInsight): number {
    const severityOrder = { 'critical': 5, 'high': 4, 'medium': 3, 'low': 2, 'info': 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    
    return b.confidence - a.confidence;
  }

  private prioritizeRecommendations(a: InsightRecommendation, b: InsightRecommendation): number {
    const priorityOrder = { 'immediate': 4, 'high': 3, 'medium': 2, 'low': 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  }

  private isRiskLevelImprovement(previous: string, current: string): boolean {
    const riskOrder = { 'low': 1, 'moderate': 2, 'high': 3, 'severe': 4 };
    return riskOrder[previous as keyof typeof riskOrder] > riskOrder[current as keyof typeof riskOrder];
  }

  private isRiskLevelDeterioration(previous: string, current: string): boolean {
    const riskOrder = { 'low': 1, 'moderate': 2, 'high': 3, 'severe': 4 };
    return riskOrder[previous as keyof typeof riskOrder] < riskOrder[current as keyof typeof riskOrder];
  }

  private isImprovingTrend(scores: number[]): boolean {
    if (scores.length < 2) return false;
    const recent = scores.slice(-3); // Last 3 scores
    return recent.every((score, i) => i === 0 || score <= recent[i - 1]);
  }

  private isDecliningTrend(scores: number[]): boolean {
    if (scores.length < 2) return false;
    const recent = scores.slice(-3); // Last 3 scores
    return recent.every((score, i) => i === 0 || score >= recent[i - 1]);
  }

  private getTimeRangeCutoff(timeRange: 'week' | 'month' | 'quarter' | 'year'): Date {
    const now = new Date();
    const cutoff = new Date(now);
    
    switch (timeRange) {
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return cutoff;
  }

  private async calculateRecommendationEffectiveness(
    progressHistory: ProgressComparison[],
    insightHistory: RealTimeInsight[]
  ): Promise<Record<string, number>> {
    // This would analyze how well recommendations correlate with improvements
    // For now, returning mock data
    return {
      'therapeutic_activity': 0.85,
      'lifestyle_change': 0.72,
      'family_support': 0.78,
      'professional_help': 0.91,
      'immediate_action': 0.95
    };
  }
}