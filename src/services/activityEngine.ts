// Activity Engine - Manages execution of therapeutic activities
// Coordinates with AI Orchestrator for personalized, culturally-aware therapeutic experiences

import { aiOrchestrator } from './aiOrchestrator';
import type { 
  ActivityType, 
  ActivitySession, 
  ActivityRecommendation, 
  // UserContext, - removed unused import
  CulturalContext,
  // EngagementMetrics - removed unused import 
} from './aiOrchestrator';

export interface ActivityStep {
  stepNumber: number;
  title: string;
  instruction: string;
  expectedResponse: string;
  adaptationOptions: string[];
  culturalVariations: Record<string, string>;
  estimatedDuration: number; // seconds
}

export interface ActivityResponse {
  stepContent: string;
  userGuidance: string;
  progressIndicator: {
    current: number;
    total: number;
    percentage: number;
  };
  adaptationApplied?: string;
  nextStepPreview?: string;
  emergencyProtocol?: boolean;
}

export interface ActivityResult {
  sessionId: string;
  activityType: ActivityType;
  completionStatus: 'completed' | 'partially_completed' | 'abandoned';
  engagementScore: number;
  skillsDemonstrated: string[];
  insightsGained: string[];
  recommendedFollowUp: ActivityRecommendation[];
  culturalEffectiveness: number;
}

// Base Activity Service - Abstract class for all therapeutic activities
export abstract class BaseActivityService {
  protected activityType: ActivityType;
  protected steps: ActivityStep[] = [];
  protected culturalAdaptations: Map<string, any> = new Map();

  constructor(activityType: ActivityType) {
    this.activityType = activityType;
    this.initializeSteps();
    this.initializeCulturalAdaptations();
  }

  abstract initializeSteps(): void;
  abstract initializeCulturalAdaptations(): void;
  abstract processUserInput(input: string, session: ActivitySession): Promise<ActivityResponse>;
  abstract generateInsights(session: ActivitySession): Promise<string[]>;

  // Common methods for all activities
  protected validateInput(input: string): boolean {
    return Boolean(input && input.trim().length > 0);
  }

  protected adaptForCulture(content: string, culturalContext: CulturalContext): string {
    const adaptations = this.culturalAdaptations.get(culturalContext.primaryCulture);
    if (!adaptations) return content;

    let adaptedContent = content;
    
    // Apply language adaptations
    if (culturalContext.languagePreference === 'hindi' || culturalContext.languagePreference === 'mixed') {
      adaptedContent = this.addHindiElements(adaptedContent);
    }

    // Apply cultural context adaptations
    if (culturalContext.familyStructure === 'joint') {
      adaptedContent = this.adaptForJointFamily(adaptedContent);
    }

    return adaptedContent;
  }

  protected addHindiElements(content: string): string {
    const hindiGreetings = {
      'Hello': 'Namaste',
      'How are you': 'Aap kaise hain',
      'Thank you': 'Dhanyawad',
      'Good': 'Accha',
      'Feel better': 'Behtar mehsoos kariye'
    };

    let adaptedContent = content;
    Object.entries(hindiGreetings).forEach(([english, hindi]) => {
      adaptedContent = adaptedContent.replace(new RegExp(english, 'gi'), `${english} (${hindi})`);
    });

    return adaptedContent;
  }

  protected adaptForJointFamily(content: string): string {
    // Add family-sensitive language
    return content.replace(/your decision/g, 'your family\'s decision')
                 .replace(/you should/g, 'you and your family might consider');
  }

  protected calculateProgress(currentStep: number, totalSteps: number): { current: number; total: number; percentage: number } {
    return {
      current: currentStep,
      total: totalSteps,
      percentage: Math.round((currentStep / totalSteps) * 100)
    };
  }
}

// Guided Conversation Activity Service
export class GuidedConversationService extends BaseActivityService {
  constructor() {
    super('guided_conversation');
  }

  initializeSteps(): void {
    this.steps = [
      {
        stepNumber: 1,
        title: 'Welcome and Check-in',
        instruction: 'Let\'s start by checking in with how you\'re feeling right now.',
        expectedResponse: 'emotional_state',
        adaptationOptions: ['simplify_language', 'add_cultural_context'],
        culturalVariations: {
          'north_indian': 'Namaste! Aaj aap kaisa mehsoos kar rahe hain?',
          'south_indian': 'Vanakkam! How are you feeling today?'
        },
        estimatedDuration: 120
      },
      {
        stepNumber: 2,
        title: 'Explore Current Concerns',
        instruction: 'What\'s been on your mind lately? What brought you here today?',
        expectedResponse: 'concern_description',
        adaptationOptions: ['encourage_elaboration', 'validate_emotions'],
        culturalVariations: {
          'joint_family': 'What challenges are you and your family facing?'
        },
        estimatedDuration: 180
      },
      {
        stepNumber: 3,
        title: 'Emotional Validation',
        instruction: 'I hear you, and what you\'re experiencing is completely valid.',
        expectedResponse: 'acknowledgment',
        adaptationOptions: ['increase_empathy', 'cultural_validation'],
        culturalVariations: {
          'academic_pressure': 'The pressure to succeed academically is very real in our society.'
        },
        estimatedDuration: 90
      },
      {
        stepNumber: 4,
        title: 'Explore Coping Strategies',
        instruction: 'How have you been managing these feelings? What usually helps you?',
        expectedResponse: 'coping_strategies',
        adaptationOptions: ['suggest_alternatives', 'build_on_strengths'],
        culturalVariations: {
          'traditional': 'Have you tried any traditional practices like meditation or yoga?'
        },
        estimatedDuration: 150
      },
      {
        stepNumber: 5,
        title: 'Next Steps and Support',
        instruction: 'Based on our conversation, let\'s think about some next steps that might help.',
        expectedResponse: 'commitment_to_action',
        adaptationOptions: ['provide_resources', 'schedule_followup'],
        culturalVariations: {
          'family_oriented': 'How can we involve your support system in this journey?'
        },
        estimatedDuration: 120
      }
    ];
  }

  initializeCulturalAdaptations(): void {
    this.culturalAdaptations.set('north_indian', {
      greetings: ['Namaste', 'Sat Sri Akal'],
      familyReferences: ['ghar wale', 'parivaar'],
      respectTerms: ['ji', 'sahib']
    });

    this.culturalAdaptations.set('south_indian', {
      greetings: ['Vanakkam', 'Namaskara'],
      familyReferences: ['kudumbam', 'family'],
      respectTerms: ['sir', 'madam']
    });
  }

  async processUserInput(input: string, session: ActivitySession): Promise<ActivityResponse> {
    if (!this.validateInput(input)) {
      return {
        stepContent: 'I didn\'t quite catch that. Could you share a bit more about how you\'re feeling?',
        userGuidance: 'Please provide a response to continue our conversation.',
        progressIndicator: this.calculateProgress(session.currentStep, session.totalSteps)
      };
    }

    const currentStep = this.steps[session.currentStep - 1];
    if (!currentStep) {
      throw new Error(`Step ${session.currentStep} not found`);
    }
    // Removed unused adaptedInstruction variable
    
    // Generate contextual response based on user input
    const response = await this.generateContextualResponse(input, currentStep, session);
    
    return {
      stepContent: response,
      userGuidance: this.getNextStepGuidance(session.currentStep, session.totalSteps),
      progressIndicator: this.calculateProgress(session.currentStep, session.totalSteps),
      nextStepPreview: session.currentStep < session.totalSteps ? 
        (this.steps[session.currentStep]?.title || 'Next step') : 'Complete'
    };
  }

  private async generateContextualResponse(input: string, step: ActivityStep, session: ActivitySession): Promise<string> {
    // Use AI orchestrator to generate therapeutic response
    const therapeuticResponse = await aiOrchestrator.generateTherapeuticResponse(
      input, 
      session.userId,
      { session }
    );

    // Adapt response for current step context
    let response = therapeuticResponse.message;
    
    switch (step.stepNumber) {
      case 1:
        response = `Thank you for sharing how you're feeling. ${response}`;
        break;
      case 2:
        response = `I understand your concerns. ${response}`;
        break;
      case 3:
        response = `Your feelings are completely valid. ${response}`;
        break;
      case 4:
        response = `It's great that you're thinking about coping strategies. ${response}`;
        break;
      case 5:
        response = `Let's focus on moving forward. ${response}`;
        break;
    }

    return this.adaptForCulture(response, session.culturalContext);
  }

  private getNextStepGuidance(currentStep: number, totalSteps: number): string {
    if (currentStep >= totalSteps) {
      return 'We\'re completing our conversation. Thank you for sharing with me.';
    }
    
    const nextStep = this.steps[currentStep];
    if (!nextStep) {
      return 'Continue with the next part of the activity';
    }
    return `Next, ${nextStep.instruction}`;
  }

  async generateInsights(session: ActivitySession): Promise<string[]> {
    const insights: string[] = [];
    
    if (session.userEngagement > 0.7) {
      insights.push('You showed great openness in sharing your experiences');
    }
    
    if (session.adaptations.length > 0) {
      insights.push('We adapted our conversation to better meet your needs');
    }
    
    insights.push('Continuing regular check-ins can help maintain emotional awareness');
    
    return insights;
  }
}

// CBT Exercise Activity Service
export class CBTExerciseService extends BaseActivityService {
  constructor() {
    super('cbt_exercise');
  }

  initializeSteps(): void {
    this.steps = [
      {
        stepNumber: 1,
        title: 'Identify the Situation',
        instruction: 'Think of a recent situation that caused you stress or upset. Describe what happened.',
        expectedResponse: 'situation_description',
        adaptationOptions: ['provide_examples', 'simplify_language'],
        culturalVariations: {
          'academic_pressure': 'Think about a recent academic or career-related situation that stressed you.'
        },
        estimatedDuration: 180
      },
      {
        stepNumber: 2,
        title: 'Recognize Your Thoughts',
        instruction: 'What thoughts went through your mind during that situation?',
        expectedResponse: 'automatic_thoughts',
        adaptationOptions: ['help_identify_thoughts', 'normalize_experience'],
        culturalVariations: {
          'family_pressure': 'What thoughts did you have about family expectations?'
        },
        estimatedDuration: 150
      },
      {
        stepNumber: 3,
        title: 'Identify Emotions',
        instruction: 'What emotions did you feel? How intense were they on a scale of 1-10?',
        expectedResponse: 'emotions_and_intensity',
        adaptationOptions: ['emotion_vocabulary', 'cultural_emotions'],
        culturalVariations: {
          'traditional': 'In our culture, we might feel shame or guilt. These are normal emotions.'
        },
        estimatedDuration: 120
      },
      {
        stepNumber: 4,
        title: 'Examine the Evidence',
        instruction: 'Let\'s look at the evidence. What facts support your thoughts? What facts contradict them?',
        expectedResponse: 'evidence_analysis',
        adaptationOptions: ['guide_analysis', 'provide_structure'],
        culturalVariations: {},
        estimatedDuration: 200
      },
      {
        stepNumber: 5,
        title: 'Challenge Negative Thoughts',
        instruction: 'Are there other ways to look at this situation? What would you tell a friend in the same situation?',
        expectedResponse: 'alternative_thoughts',
        adaptationOptions: ['suggest_alternatives', 'use_socratic_questions'],
        culturalVariations: {
          'collectivist': 'How might your family or community view this situation differently?'
        },
        estimatedDuration: 180
      },
      {
        stepNumber: 6,
        title: 'Develop Balanced Thoughts',
        instruction: 'Based on the evidence, what\'s a more balanced way to think about this situation?',
        expectedResponse: 'balanced_thoughts',
        adaptationOptions: ['help_formulate', 'validate_progress'],
        culturalVariations: {},
        estimatedDuration: 150
      },
      {
        stepNumber: 7,
        title: 'Plan Action Steps',
        instruction: 'What specific actions can you take to handle similar situations in the future?',
        expectedResponse: 'action_plan',
        adaptationOptions: ['make_specific', 'ensure_realistic'],
        culturalVariations: {
          'family_oriented': 'How can you involve your support system in these actions?'
        },
        estimatedDuration: 180
      }
    ];
  }

  initializeCulturalAdaptations(): void {
    this.culturalAdaptations.set('academic_pressure', {
      commonThoughts: ['I must be perfect', 'I will disappoint my family', 'I am not good enough'],
      culturalChallenges: ['Perfectionism is valued but unrealistic', 'Family pride vs. personal wellbeing']
    });

    this.culturalAdaptations.set('family_dynamics', {
      commonThoughts: ['I must obey my parents', 'Individual needs are selfish', 'Family reputation matters most'],
      culturalChallenges: ['Balancing respect with personal needs', 'Individual vs. collective values']
    });
  }

  async processUserInput(input: string, session: ActivitySession): Promise<ActivityResponse> {
    if (!this.validateInput(input)) {
      return {
        stepContent: 'Please share your thoughts so we can work through this together.',
        userGuidance: 'Your response helps us understand your thinking patterns.',
        progressIndicator: this.calculateProgress(session.currentStep, session.totalSteps)
      };
    }

    const currentStep = this.steps[session.currentStep - 1];
    if (!currentStep) {
      throw new Error(`CBT step ${session.currentStep} not found`);
    }
    const response = await this.generateCBTResponse(input, currentStep, session);
    
    return {
      stepContent: response,
      userGuidance: this.getCBTGuidance(session.currentStep),
      progressIndicator: this.calculateProgress(session.currentStep, session.totalSteps),
      nextStepPreview: session.currentStep < session.totalSteps ? 
        (this.steps[session.currentStep]?.title || 'Next step') : 'Complete'
    };
  }

  private async generateCBTResponse(_input: string, step: ActivityStep, session: ActivitySession): Promise<string> {
    let response = '';
    
    switch (step.stepNumber) {
      case 1:
        response = `Thank you for sharing that situation. I can understand how that would be stressful. Let's explore what thoughts came up for you.`;
        break;
      case 2:
        response = `Those thoughts are very common. Many people have similar automatic thoughts in stressful situations. Now let's identify the emotions you felt.`;
        break;
      case 3:
        response = `It's important to acknowledge these emotions. They're valid responses to your thoughts and situation. Now let's examine the evidence.`;
        break;
      case 4:
        response = `Good work examining the evidence. This is a key skill in CBT. Now let's challenge those negative thoughts.`;
        break;
      case 5:
        response = `Excellent! You're developing the ability to see situations from different perspectives. Let's create a more balanced thought.`;
        break;
      case 6:
        response = `That's a much more balanced way of thinking! This new perspective can help you feel better and respond more effectively.`;
        break;
      case 7:
        response = `Great action plan! Having specific steps makes it easier to handle similar situations in the future.`;
        break;
    }

    return this.adaptForCulture(response, session.culturalContext);
  }

  private getCBTGuidance(currentStep: number): string {
    const guidance = [
      'Describe the situation as objectively as possible',
      'Notice what thoughts automatically came to mind',
      'Identify and rate the intensity of your emotions',
      'Look for facts that support and contradict your thoughts',
      'Consider alternative perspectives on the situation',
      'Create a more balanced, realistic thought',
      'Plan specific actions you can take'
    ];
    
    return guidance[currentStep - 1] || 'Continue working through the exercise';
  }

  async generateInsights(session: ActivitySession): Promise<string[]> {
    const insights: string[] = [];
    
    insights.push('You practiced identifying and challenging negative thought patterns');
    insights.push('Examining evidence helps create more balanced thinking');
    insights.push('Regular practice of these skills can improve emotional wellbeing');
    
    if (session.culturalContext.primaryCulture !== 'mixed') {
      insights.push('We adapted the exercise to fit your cultural context');
    }
    
    return insights;
  }
}

// Mindfulness Session Activity Service
export class MindfulnessSessionService extends BaseActivityService {
  constructor() {
    super('mindfulness_session');
  }

  initializeSteps(): void {
    this.steps = [
      {
        stepNumber: 1,
        title: 'Preparation and Settling',
        instruction: 'Find a comfortable position and take a moment to settle in. Notice how your body feels right now.',
        expectedResponse: 'readiness_confirmation',
        adaptationOptions: ['adjust_position', 'cultural_elements'],
        culturalVariations: {
          'traditional': 'Sit in a comfortable meditation posture, perhaps like in yoga or dhyana practice.'
        },
        estimatedDuration: 60
      },
      {
        stepNumber: 2,
        title: 'Breath Awareness',
        instruction: 'Begin to notice your natural breathing. Don\'t change it, just observe each breath in and out.',
        expectedResponse: 'breath_observation',
        adaptationOptions: ['guided_counting', 'cultural_breathing'],
        culturalVariations: {
          'yoga_tradition': 'This is similar to pranayama - the awareness of life force through breath.'
        },
        estimatedDuration: 180
      },
      {
        stepNumber: 3,
        title: 'Body Scan',
        instruction: 'Now gently scan your body from head to toe, noticing any sensations without trying to change them.',
        expectedResponse: 'body_awareness',
        adaptationOptions: ['guided_scan', 'tension_release'],
        culturalVariations: {},
        estimatedDuration: 240
      },
      {
        stepNumber: 4,
        title: 'Present Moment Awareness',
        instruction: 'Expand your awareness to include sounds, thoughts, and feelings, accepting whatever arises.',
        expectedResponse: 'present_moment_experience',
        adaptationOptions: ['acceptance_guidance', 'cultural_wisdom'],
        culturalVariations: {
          'buddhist_influence': 'This is the practice of mindful awareness, accepting what is without judgment.'
        },
        estimatedDuration: 180
      }
    ];
  }

  initializeCulturalAdaptations(): void {
    this.culturalAdaptations.set('traditional', {
      references: ['dhyana', 'pranayama', 'yoga nidra'],
      guidance: ['Like ancient sages practiced', 'Following traditional wisdom']
    });

    this.culturalAdaptations.set('modern', {
      references: ['meditation apps', 'stress relief', 'mental wellness'],
      guidance: ['Evidence-based practice', 'Scientifically proven benefits']
    });
  }

  async processUserInput(input: string, session: ActivitySession): Promise<ActivityResponse> {
    const currentStep = this.steps[session.currentStep - 1];
    if (!currentStep) {
      throw new Error(`Mindfulness step ${session.currentStep} not found`);
    }
    const response = await this.generateMindfulnessResponse(input, currentStep, session);
    
    return {
      stepContent: response,
      userGuidance: this.getMindfulnessGuidance(session.currentStep),
      progressIndicator: this.calculateProgress(session.currentStep, session.totalSteps),
      nextStepPreview: session.currentStep < session.totalSteps ? 
        (this.steps[session.currentStep]?.title || 'Next step') : 'Complete'
    };
  }

  private async generateMindfulnessResponse(_input: string, step: ActivityStep, session: ActivitySession): Promise<string> {
    let response = '';
    
    switch (step.stepNumber) {
      case 1:
        response = `Good, you're ready to begin. Let's start with your breath - the foundation of mindfulness.`;
        break;
      case 2:
        response = `Wonderful. Your breath is always available as an anchor to the present moment. Now let's explore your body.`;
        break;
      case 3:
        response = `Excellent awareness. Notice how your body holds your experiences. Now let's expand to full present moment awareness.`;
        break;
      case 4:
        response = `Beautiful practice. You've cultivated mindful awareness. Take a moment to appreciate this peaceful state.`;
        break;
    }

    return this.adaptForCulture(response, session.culturalContext);
  }

  private getMindfulnessGuidance(currentStep: number): string {
    const guidance = [
      'Get comfortable and prepare for mindfulness practice',
      'Focus on your natural breathing rhythm',
      'Scan your body with gentle, non-judgmental awareness',
      'Accept whatever thoughts and feelings arise'
    ];
    
    return guidance[currentStep - 1] || 'Continue with mindful awareness';
  }

  async generateInsights(session: ActivitySession): Promise<string[]> {
    const insights: string[] = [];
    
    insights.push('You practiced present-moment awareness and acceptance');
    insights.push('Regular mindfulness practice can reduce stress and improve emotional regulation');
    insights.push('Your breath is always available as an anchor to the present');
    
    if (session.culturalContext.primaryCulture !== 'mixed') {
      insights.push('Mindfulness connects to ancient wisdom traditions in Indian culture');
    }
    
    return insights;
  }
}

// Main Activity Engine Class
export class ActivityEngine {
  private activityServices: Map<ActivityType, BaseActivityService> = new Map();
  private activeSessions: Map<string, ActivitySession> = new Map();

  constructor() {
    this.initializeActivityServices();
    console.log('🎯 Activity Engine initialized');
  }

  private initializeActivityServices(): void {
    this.activityServices.set('guided_conversation', new GuidedConversationService());
    this.activityServices.set('cbt_exercise', new CBTExerciseService());
    this.activityServices.set('mindfulness_session', new MindfulnessSessionService());
    // Additional services would be added here
  }

  async initializeActivity(activityType: ActivityType, userId: string): Promise<ActivitySession> {
    const session = await aiOrchestrator.initializeActivitySession(userId, activityType);
    this.activeSessions.set(session.sessionId, session);
    return session;
  }

  async processUserInput(sessionId: string, userInput: string): Promise<ActivityResponse> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const service = this.activityServices.get(session.activityType);
    if (!service) {
      throw new Error('Activity service not found');
    }

    // Update session with AI orchestrator
    await aiOrchestrator.updateActivitySession(sessionId, { message: userInput });

    // Process input with specific activity service
    const response = await service.processUserInput(userInput, session);

    // Move to next step if appropriate
    if (session.currentStep < session.totalSteps) {
      session.currentStep++;
    }

    return response;
  }

  async completeActivity(sessionId: string): Promise<ActivityResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const service = this.activityServices.get(session.activityType);
    if (!service) {
      throw new Error('Activity service not found');
    }

    // Generate insights and results
    const insights = await service.generateInsights(session);
    const summary = await aiOrchestrator.completeActivitySession(sessionId);

    // Clean up
    this.activeSessions.delete(sessionId);

    return {
      sessionId,
      activityType: session.activityType,
      completionStatus: session.status === 'completed' ? 'completed' : 'partially_completed',
      engagementScore: session.userEngagement,
      skillsDemonstrated: summary.skillsPracticed,
      insightsGained: insights,
      recommendedFollowUp: summary.nextRecommendations,
      culturalEffectiveness: this.calculateCulturalEffectiveness(session)
    };
  }

  private calculateCulturalEffectiveness(session: ActivitySession): number {
    // Simple calculation based on adaptations and engagement
    const baseScore = 0.7;
    const adaptationBonus = Math.min(0.2, session.adaptations.length * 0.05);
    const engagementBonus = session.userEngagement * 0.1;
    
    return Math.min(1, baseScore + adaptationBonus + engagementBonus);
  }

  // Public utility methods
  getAvailableActivities(): ActivityType[] {
    return Array.from(this.activityServices.keys());
  }

  getActiveSessionIds(): string[] {
    return Array.from(this.activeSessions.keys());
  }

  async getSessionStatus(sessionId: string): Promise<ActivitySession | null> {
    return this.activeSessions.get(sessionId) || null;
  }
}

// Export singleton instance
export const activityEngine = new ActivityEngine();