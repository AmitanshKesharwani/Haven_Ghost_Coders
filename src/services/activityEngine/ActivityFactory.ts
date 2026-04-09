// Activity Factory - Creates different therapeutic activity types
// Implements factory pattern for activity instantiation and configuration

import { BaseActivityService } from './BaseActivityService';
import { MindfulnessActivityService } from './examples/MindfulnessActivityService';
import {
  ActivityType,
  ActivityConfiguration,
  UserContext,
  DifficultyLevel,
  UserInput,
  ActivityResponse,
  // AdaptationTrigger, - removed unused import
  // ActivityAdaptation - removed unused import
} from './types';

// Interface for activity service constructors
export interface ActivityServiceConstructor {
  new(
    sessionId: string,
    userId: string,
    activityType: ActivityType,
    userContext: UserContext
  ): BaseActivityService;
}

// Activity metadata for registry
export interface ActivityMetadata {
  type: ActivityType;
  name: string;
  description: string;
  category: 'mindfulness' | 'cbt' | 'assessment' | 'crisis' | 'cultural' | 'behavioral';
  culturalRelevance: number; // 1-10 scale
  difficultyLevels: DifficultyLevel[];
  estimatedDurations: number[]; // Available duration options in minutes
  prerequisites?: ActivityType[];
  therapeuticGoals: string[];
  skillsTargeted: string[];
  contraindications?: string[];
  serviceClass: ActivityServiceConstructor;
}

// Placeholder activity services (to be implemented)
class GuidedConversationService extends BaseActivityService {
  async initializeActivity(_config: ActivityConfiguration) {
    // Placeholder implementation
    return {} as any;
  }
  async processUserInput(_input: UserInput): Promise<ActivityResponse> {
    return {
      content: 'Guided conversation response',
      type: 'guidance' as const,
      nextStep: 1,
      adaptationTriggered: false
    };
  }
  async generateNextStep(): Promise<ActivityResponse> {
    return {
      content: 'Next conversation step',
      type: 'question' as const,
      nextStep: 2,
      adaptationTriggered: false
    };
  }
  async completeActivity() {
    return {} as any;
  }
  protected async handleActivitySpecificAdaptation(_trigger: any, _context: any) {
    return {} as any;
  }
}

class CBTExerciseService extends BaseActivityService {
  async initializeActivity(_config: ActivityConfiguration) {
    return {} as any;
  }
  async processUserInput(_input: UserInput): Promise<ActivityResponse> {
    return { 
      content: 'CBT exercise response', 
      type: 'guidance' as const,
      nextStep: 1,
      adaptationTriggered: false
    };
  }
  async generateNextStep(): Promise<ActivityResponse> {
    return { 
      content: 'Next CBT step', 
      type: 'question' as const,
      nextStep: 2,
      adaptationTriggered: false
    };
  }
  async completeActivity() {
    return {} as any;
  }
  protected async handleActivitySpecificAdaptation(_trigger: any, _context: any) {
    return {} as any;
  }
}

class AssessmentActivityService extends BaseActivityService {
  async initializeActivity(_config: ActivityConfiguration) {
    return {} as any;
  }
  async processUserInput(_input: UserInput): Promise<ActivityResponse> {
    return { 
      content: 'Assessment question', 
      type: 'question' as const,
      nextStep: 1,
      adaptationTriggered: false
    };
  }
  async generateNextStep(): Promise<ActivityResponse> {
    return { 
      content: 'Next assessment item', 
      type: 'question' as const,
      nextStep: 2,
      adaptationTriggered: false
    };
  }
  async completeActivity() {
    return {} as any;
  }
  protected async handleActivitySpecificAdaptation(_trigger: any, _context: any) {
    return {} as any;
  }
}

class CrisisInterventionService extends BaseActivityService {
  async initializeActivity(_config: ActivityConfiguration) {
    return {} as any;
  }
  async processUserInput(_input: UserInput): Promise<ActivityResponse> {
    return { 
      content: 'Crisis support response', 
      type: 'intervention' as const,
      nextStep: 1,
      adaptationTriggered: false
    };
  }
  async generateNextStep(): Promise<ActivityResponse> {
    return { 
      content: 'Crisis intervention step', 
      type: 'intervention' as const,
      nextStep: 2,
      adaptationTriggered: false
    };
  }
  async completeActivity() {
    return {} as any;
  }
  protected async handleActivitySpecificAdaptation(_trigger: any, _context: any) {
    return {} as any;
  }
}

export class ActivityFactory {
  private static instance: ActivityFactory;
  private activityRegistry: Map<ActivityType, ActivityMetadata> = new Map();

  private constructor() {
    this.initializeRegistry();
  }

  public static getInstance(): ActivityFactory {
    if (!ActivityFactory.instance) {
      ActivityFactory.instance = new ActivityFactory();
    }
    return ActivityFactory.instance;
  }

  private initializeRegistry(): void {
    // Register all available activity types
    this.registerActivity({
      type: 'mindfulness_session',
      name: 'Mindfulness Session',
      description: 'Guided mindfulness and breathing exercises for stress reduction and emotional regulation',
      category: 'mindfulness',
      culturalRelevance: 9,
      difficultyLevels: ['beginner', 'intermediate', 'advanced'],
      estimatedDurations: [5, 10, 15, 20, 30],
      therapeuticGoals: ['stress_reduction', 'emotional_regulation', 'present_moment_awareness'],
      skillsTargeted: ['mindful_breathing', 'body_awareness', 'emotional_observation'],
      serviceClass: MindfulnessActivityService
    });

    this.registerActivity({
      type: 'guided_conversation',
      name: 'Guided Therapeutic Conversation',
      description: 'Structured conversation with AI therapist for emotional support and insight',
      category: 'cbt',
      culturalRelevance: 8,
      difficultyLevels: ['beginner', 'intermediate', 'advanced'],
      estimatedDurations: [15, 20, 30, 45],
      therapeuticGoals: ['emotional_expression', 'insight_development', 'problem_solving'],
      skillsTargeted: ['emotional_awareness', 'communication', 'self_reflection'],
      serviceClass: GuidedConversationService
    });

    this.registerActivity({
      type: 'cbt_exercise',
      name: 'Cognitive Behavioral Therapy Exercise',
      description: 'Structured CBT exercises for thought challenging and behavioral change',
      category: 'cbt',
      culturalRelevance: 7,
      difficultyLevels: ['beginner', 'intermediate', 'advanced'],
      estimatedDurations: [10, 15, 20, 30],
      therapeuticGoals: ['cognitive_restructuring', 'behavioral_change', 'mood_improvement'],
      skillsTargeted: ['thought_challenging', 'behavioral_experiments', 'mood_monitoring'],
      serviceClass: CBTExerciseService
    });

    this.registerActivity({
      type: 'assessment_activity',
      name: 'Mental Health Assessment',
      description: 'Comprehensive assessment of mental health status and needs',
      category: 'assessment',
      culturalRelevance: 8,
      difficultyLevels: ['beginner'],
      estimatedDurations: [15, 20, 30],
      therapeuticGoals: ['assessment', 'goal_setting', 'treatment_planning'],
      skillsTargeted: ['self_awareness', 'goal_identification'],
      serviceClass: AssessmentActivityService
    });

    this.registerActivity({
      type: 'crisis_intervention',
      name: 'Crisis Support Session',
      description: 'Immediate support and intervention for mental health crises',
      category: 'crisis',
      culturalRelevance: 9,
      difficultyLevels: ['beginner'],
      estimatedDurations: [10, 15, 20],
      therapeuticGoals: ['crisis_stabilization', 'safety_planning', 'immediate_support'],
      skillsTargeted: ['crisis_coping', 'safety_awareness', 'help_seeking'],
      contraindications: ['severe_psychosis', 'active_substance_use'],
      serviceClass: CrisisInterventionService
    });

    this.registerActivity({
      type: 'breathing_exercise',
      name: 'Breathing Exercise',
      description: 'Simple breathing techniques for immediate stress relief',
      category: 'mindfulness',
      culturalRelevance: 10,
      difficultyLevels: ['beginner', 'intermediate'],
      estimatedDurations: [3, 5, 10],
      therapeuticGoals: ['stress_reduction', 'anxiety_management'],
      skillsTargeted: ['breathing_techniques', 'relaxation'],
      serviceClass: MindfulnessActivityService // Reuse mindfulness service
    });

    this.registerActivity({
      type: 'journaling_prompt',
      name: 'Guided Journaling',
      description: 'Structured journaling exercises for self-reflection and emotional processing',
      category: 'behavioral',
      culturalRelevance: 7,
      difficultyLevels: ['beginner', 'intermediate', 'advanced'],
      estimatedDurations: [10, 15, 20],
      therapeuticGoals: ['self_reflection', 'emotional_processing', 'insight_development'],
      skillsTargeted: ['written_expression', 'self_analysis', 'pattern_recognition'],
      serviceClass: GuidedConversationService // Reuse conversation service
    });

    this.registerActivity({
      type: 'mood_tracking',
      name: 'Mood Tracking Session',
      description: 'Interactive mood assessment and tracking for pattern recognition',
      category: 'assessment',
      culturalRelevance: 8,
      difficultyLevels: ['beginner'],
      estimatedDurations: [5, 10],
      therapeuticGoals: ['mood_awareness', 'pattern_recognition', 'self_monitoring'],
      skillsTargeted: ['emotional_awareness', 'self_monitoring', 'data_interpretation'],
      serviceClass: AssessmentActivityService
    });

    this.registerActivity({
      type: 'thought_challenge',
      name: 'Thought Challenging Exercise',
      description: 'CBT-based exercise for identifying and challenging negative thought patterns',
      category: 'cbt',
      culturalRelevance: 6,
      difficultyLevels: ['intermediate', 'advanced'],
      estimatedDurations: [15, 20, 25],
      prerequisites: ['cbt_exercise'],
      therapeuticGoals: ['cognitive_restructuring', 'negative_thought_reduction'],
      skillsTargeted: ['thought_identification', 'evidence_evaluation', 'balanced_thinking'],
      serviceClass: CBTExerciseService
    });

    this.registerActivity({
      type: 'grounding_technique',
      name: 'Grounding Techniques',
      description: 'Sensory-based grounding exercises for anxiety and dissociation',
      category: 'mindfulness',
      culturalRelevance: 9,
      difficultyLevels: ['beginner', 'intermediate'],
      estimatedDurations: [5, 10, 15],
      therapeuticGoals: ['anxiety_reduction', 'present_moment_awareness', 'emotional_regulation'],
      skillsTargeted: ['sensory_awareness', 'grounding_techniques', 'anxiety_management'],
      serviceClass: MindfulnessActivityService
    });
  }

  private registerActivity(metadata: ActivityMetadata): void {
    this.activityRegistry.set(metadata.type, metadata);
  }

  // Create activity service instance
  public createActivity(
    activityType: ActivityType,
    sessionId: string,
    userId: string,
    userContext: UserContext
  ): BaseActivityService {
    const metadata = this.activityRegistry.get(activityType);

    if (!metadata) {
      throw new Error(`Activity type '${activityType}' is not registered`);
    }

    // Check prerequisites
    if (metadata.prerequisites) {
      const completedActivities = userContext.therapeuticProgress.completedActivities;
      const missingPrerequisites = metadata.prerequisites.filter(
        prereq => !completedActivities.includes(prereq)
      );

      if (missingPrerequisites.length > 0) {
        throw new Error(`Missing prerequisites for ${activityType}: ${missingPrerequisites.join(', ')}`);
      }
    }

    // Check contraindications
    if (metadata.contraindications) {
      const userRiskFactors = userContext.mentalHealthHistory.riskFactors;
      const contraindications = metadata.contraindications.filter(
        contraindication => userRiskFactors.includes(contraindication)
      );

      if (contraindications.length > 0) {
        throw new Error(`Activity ${activityType} is contraindicated due to: ${contraindications.join(', ')}`);
      }
    }

    return new metadata.serviceClass(sessionId, userId, activityType, userContext);
  }

  // Get activity metadata
  public getActivityMetadata(activityType: ActivityType): ActivityMetadata | undefined {
    return this.activityRegistry.get(activityType);
  }

  // Get all registered activities
  public getAllActivities(): ActivityMetadata[] {
    return Array.from(this.activityRegistry.values());
  }

  // Get activities by category
  public getActivitiesByCategory(category: ActivityMetadata['category']): ActivityMetadata[] {
    return this.getAllActivities().filter(activity => activity.category === category);
  }

  // Get activities suitable for user
  public getSuitableActivities(
    userContext: UserContext,
    filters?: {
      category?: ActivityMetadata['category'];
      maxDuration?: number;
      minCulturalRelevance?: number;
      difficultyLevel?: DifficultyLevel;
    }
  ): ActivityMetadata[] {
    let activities = this.getAllActivities();

    // Filter by user's completed prerequisites
    activities = activities.filter(activity => {
      if (!activity.prerequisites) return true;

      const completedActivities = userContext.therapeuticProgress.completedActivities;
      return activity.prerequisites.every(prereq => completedActivities.includes(prereq));
    });

    // Filter by contraindications
    activities = activities.filter(activity => {
      if (!activity.contraindications) return true;

      const userRiskFactors = userContext.mentalHealthHistory.riskFactors;
      return !activity.contraindications.some(contraindication =>
        userRiskFactors.includes(contraindication)
      );
    });

    // Apply additional filters
    if (filters) {
      if (filters.category) {
        activities = activities.filter(activity => activity.category === filters.category);
      }

      if (filters.maxDuration) {
        activities = activities.filter(activity =>
          activity.estimatedDurations.some(duration => duration <= filters.maxDuration!)
        );
      }

      if (filters.minCulturalRelevance) {
        activities = activities.filter(activity =>
          activity.culturalRelevance >= filters.minCulturalRelevance!
        );
      }

      if (filters.difficultyLevel) {
        activities = activities.filter(activity =>
          activity.difficultyLevels.includes(filters.difficultyLevel!)
        );
      }
    }

    return activities;
  }

  // Create default configuration for activity
  public createDefaultConfiguration(
    activityType: ActivityType,
    userContext: UserContext,
    customizations?: {
      difficultyLevel?: DifficultyLevel;
      duration?: number;
      culturalAdaptations?: string[];
      personalizations?: string[];
    }
  ): ActivityConfiguration {
    const metadata = this.getActivityMetadata(activityType);

    if (!metadata) {
      throw new Error(`Activity type '${activityType}' is not registered`);
    }

    // Determine difficulty level
    const difficultyLevel = customizations?.difficultyLevel ||
      userContext.activityPreferences.difficultyLevel ||
      'beginner';

    // Determine duration
    const preferredDuration = userContext.activityPreferences.sessionDuration;
    const availableDurations = metadata.estimatedDurations;
    const duration = customizations?.duration ||
      availableDurations.find(d => Math.abs(d - preferredDuration) <= 5) ||
      availableDurations[Math.floor(availableDurations.length / 2)];

    // Cultural adaptations based on user context
    const culturalAdaptations = customizations?.culturalAdaptations ||
      this.generateCulturalAdaptations(userContext);

    // Personalizations based on user needs
    const personalizations = customizations?.personalizations ||
      this.generatePersonalizations(userContext, metadata);

    return {
      activityType,
      difficultyLevel,
      estimatedDuration: duration,
      culturalAdaptations,
      personalizations,
      prerequisites: metadata.prerequisites,
      learningObjectives: metadata.therapeuticGoals
    };
  }

  private generateCulturalAdaptations(userContext: UserContext): string[] {
    const adaptations: string[] = [];

    if (userContext.demographics.culturalBackground?.includes('indian')) {
      adaptations.push('indian_cultural_context');
    }

    if (userContext.demographics.language === 'hindi') {
      adaptations.push('hindi_language_support');
    }

    if (userContext.demographics.language === 'mixed') {
      adaptations.push('bilingual_approach');
    }

    // Add family-oriented adaptations for Indian context
    if (userContext.demographics.culturalBackground?.includes('indian')) {
      adaptations.push('family_aware_approach');
      adaptations.push('respect_hierarchy');
    }

    return adaptations;
  }

  private generatePersonalizations(
    userContext: UserContext,
    metadata: ActivityMetadata
  ): string[] {
    const personalizations: string[] = [];

    // Based on primary concerns
    userContext.mentalHealthHistory.primaryConcerns.forEach(concern => {
      if (metadata.therapeuticGoals.some(goal => goal.includes(concern))) {
        personalizations.push(`${concern}_focused`);
      }
    });

    // Based on interaction style preference
    personalizations.push(`${userContext.activityPreferences.interactionStyle}_style`);

    // Based on current emotional state
    if (userContext.currentState.emotionalState) {
      personalizations.push(`${userContext.currentState.emotionalState}_state_aware`);
    }

    // Based on stress level
    if (userContext.currentState.stressLevel && userContext.currentState.stressLevel > 7) {
      personalizations.push('high_stress_adaptation');
    }

    return personalizations;
  }

  // Validate activity configuration
  public validateConfiguration(
    activityType: ActivityType,
    configuration: ActivityConfiguration
  ): { valid: boolean; errors: string[] } {
    const metadata = this.getActivityMetadata(activityType);
    const errors: string[] = [];

    if (!metadata) {
      errors.push(`Activity type '${activityType}' is not registered`);
      return { valid: false, errors };
    }

    // Validate difficulty level
    if (!metadata.difficultyLevels.includes(configuration.difficultyLevel)) {
      errors.push(`Difficulty level '${configuration.difficultyLevel}' not supported for ${activityType}`);
    }

    // Validate duration
    const minDuration = Math.min(...metadata.estimatedDurations);
    const maxDuration = Math.max(...metadata.estimatedDurations);

    if (configuration.estimatedDuration < minDuration || configuration.estimatedDuration > maxDuration) {
      errors.push(`Duration ${configuration.estimatedDuration} minutes is outside supported range (${minDuration}-${maxDuration})`);
    }

    return { valid: errors.length === 0, errors };
  }
}