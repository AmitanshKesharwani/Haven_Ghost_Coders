// Adaptation Engine - Real-time activity adaptation system
// Monitors user engagement and adapts activities dynamically based on user responses

import {
  ActivitySession,
  ActivityAdaptation,
  AdaptationTrigger,
  EngagementMetrics,
  UserInput,
  ActivityResponse,
  UserContext,
  // ActivityConfiguration - removed unused import
} from './types';

export interface AdaptationResult {
  adaptationApplied: boolean;
  adaptations: ActivityAdaptation[];
  modifiedResponse?: ActivityResponse;
  sessionUpdates: Partial<ActivitySession>;
  reasoning: string;
  confidence: number;
}

export interface AdaptationRule {
  id: string;
  name: string;
  description: string;
  trigger: AdaptationTrigger;
  conditions: AdaptationCondition[];
  adaptations: AdaptationType[];
  priority: number; // 1-10, higher = more important
  culturalSensitive: boolean;
}

export interface AdaptationCondition {
  type: 'engagement' | 'response_time' | 'emotional_state' | 'stress_level' | 'comprehension' | 'cultural_mismatch';
  operator: 'less_than' | 'greater_than' | 'equals' | 'contains' | 'not_contains';
  value: number | string;
  weight: number; // How much this condition contributes to triggering adaptation
}

export interface AdaptationType {
  type: 'difficulty_adjustment' | 'cultural_modification' | 'intervention_change' | 'emergency_protocol' | 'pacing_change' | 'language_switch';
  parameters: Record<string, any>;
  description: string;
}

export interface AdaptationContext {
  session: ActivitySession;
  userContext: UserContext;
  currentInput?: UserInput;
  engagementMetrics?: EngagementMetrics;
  recentInteractions: any[];
  culturalFactors: string[];
  timeConstraints?: number;
}

export interface AdaptationResult {
  adaptationApplied: boolean;
  adaptations: ActivityAdaptation[];
  modifiedResponse?: ActivityResponse;
  sessionUpdates: Partial<ActivitySession>;
  reasoning: string;
  confidence: number;
}

export class AdaptationEngine {
  private adaptationRules: Map<string, AdaptationRule> = new Map();
  private adaptationHistory: Map<string, ActivityAdaptation[]> = new Map();
  private engagementThresholds = {
    critical: 0.2,
    low: 0.4,
    moderate: 0.6,
    high: 0.8
  };

  constructor() {
    this.initializeAdaptationRules();
  }

  // Main adaptation method
  public async adaptActivity(
    context: AdaptationContext,
    potentialTriggers: AdaptationTrigger[] = []
  ): Promise<AdaptationResult> {
    const { session } = context;

    // Detect all applicable triggers
    const detectedTriggers = await this.detectAdaptationTriggers(context, potentialTriggers);
    
    if (detectedTriggers.length === 0) {
      return {
        adaptationApplied: false,
        adaptations: [],
        sessionUpdates: {},
        reasoning: 'No adaptation triggers detected',
        confidence: 0.9
      };
    }

    // Find applicable rules
    const applicableRules = this.findApplicableRules(detectedTriggers, context);
    
    if (applicableRules.length === 0) {
      return {
        adaptationApplied: false,
        adaptations: [],
        sessionUpdates: {},
        reasoning: 'No applicable adaptation rules found',
        confidence: 0.8
      };
    }

    // Apply adaptations
    const adaptations: ActivityAdaptation[] = [];
    let modifiedResponse: ActivityResponse | undefined;
    let sessionUpdates: Partial<ActivitySession> = {};

    for (const rule of applicableRules) {
      const adaptation = await this.applyAdaptationRule(rule, context);
      if (adaptation) {
        adaptations.push(adaptation);
        
        // Apply rule-specific modifications
        const modifications = await this.generateRuleModifications(rule, context);
        if (modifications.response) {
          modifiedResponse = modifications.response;
        }
        if (modifications.sessionUpdates) {
          sessionUpdates = { ...sessionUpdates, ...modifications.sessionUpdates };
        }
      }
    }

    // Store adaptation history
    this.storeAdaptationHistory(session.sessionId, adaptations);

    const reasoning = this.generateAdaptationReasoning(detectedTriggers, applicableRules, adaptations);
    const confidence = this.calculateAdaptationConfidence(adaptations, context);

    return {
      adaptationApplied: adaptations.length > 0,
      adaptations,
      modifiedResponse: modifiedResponse || undefined,
      sessionUpdates,
      reasoning,
      confidence
    };
  }

  // Detect adaptation triggers
  private async detectAdaptationTriggers(
    context: AdaptationContext,
    potentialTriggers: AdaptationTrigger[]
  ): Promise<AdaptationTrigger[]> {
    const triggers: AdaptationTrigger[] = [...potentialTriggers];
    const { session, engagementMetrics, currentInput } = context;

    // Check engagement levels
    if (engagementMetrics) {
      if (engagementMetrics.overallEngagement < this.engagementThresholds.critical) {
        triggers.push('low_engagement');
      }
      
      if (engagementMetrics.responseTime > 30000) { // 30 seconds
        triggers.push('comprehension_issue');
      }
    }

    // Check emotional distress
    if (currentInput && this.detectEmotionalDistress(currentInput.content)) {
      triggers.push('emotional_distress');
    }

    // Check crisis indicators
    if (currentInput && this.detectCrisisIndicators(currentInput.content)) {
      triggers.push('crisis_detected');
    }

    // Check cultural mismatch
    if (this.detectCulturalMismatch(context)) {
      triggers.push('cultural_mismatch');
    }

    // Check time constraints
    if (context.timeConstraints && this.isTimeConstrained(session, context.timeConstraints)) {
      triggers.push('time_constraint');
    }

    // Check stress level
    if (session.realTimeMetrics.stressLevel > 8) {
      triggers.push('emotional_distress');
    }

    return Array.from(new Set(triggers)); // Remove duplicates
  }

  // Find applicable adaptation rules
  private findApplicableRules(
    triggers: AdaptationTrigger[],
    context: AdaptationContext
  ): AdaptationRule[] {
    const applicableRules: AdaptationRule[] = [];

    for (const [, rule] of Array.from(this.adaptationRules)) {
      if (triggers.includes(rule.trigger)) {
        if (this.evaluateRuleConditions(rule, context)) {
          applicableRules.push(rule);
        }
      }
    }

    // Sort by priority (highest first)
    return applicableRules.sort((a, b) => b.priority - a.priority);
  }

  // Evaluate rule conditions
  private evaluateRuleConditions(rule: AdaptationRule, context: AdaptationContext): boolean {
    let totalWeight = 0;
    let satisfiedWeight = 0;

    for (const condition of rule.conditions) {
      totalWeight += condition.weight;
      
      if (this.evaluateCondition(condition, context)) {
        satisfiedWeight += condition.weight;
      }
    }

    // Rule applies if at least 70% of weighted conditions are satisfied
    return totalWeight === 0 || (satisfiedWeight / totalWeight) >= 0.7;
  }

  // Evaluate individual condition
  private evaluateCondition(condition: AdaptationCondition, context: AdaptationContext): boolean {
    const { session, engagementMetrics } = context;

    switch (condition.type) {
      case 'engagement':
        if (!engagementMetrics) return false;
        return this.compareValues(engagementMetrics.overallEngagement, condition.operator, condition.value as number);

      case 'response_time':
        if (!engagementMetrics) return false;
        return this.compareValues(engagementMetrics.responseTime, condition.operator, condition.value as number);

      case 'emotional_state':
        const emotionalState = session.realTimeMetrics.emotionalState;
        return this.compareValues(emotionalState, condition.operator, condition.value as string);

      case 'stress_level':
        return this.compareValues(session.realTimeMetrics.stressLevel, condition.operator, condition.value as number);

      case 'comprehension':
        return this.compareValues(session.realTimeMetrics.comprehension, condition.operator, condition.value as number);

      case 'cultural_mismatch':
        const culturalScore = this.calculateCulturalAlignment(context);
        return this.compareValues(culturalScore, condition.operator, condition.value as number);

      default:
        return false;
    }
  }

  // Compare values based on operator
  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'less_than':
        return actual < expected;
      case 'greater_than':
        return actual > expected;
      case 'equals':
        return actual === expected;
      case 'contains':
        return typeof actual === 'string' && actual.includes(expected);
      case 'not_contains':
        return typeof actual === 'string' && !actual.includes(expected);
      default:
        return false;
    }
  }

  // Apply adaptation rule
  private async applyAdaptationRule(
    rule: AdaptationRule,
    context: AdaptationContext
  ): Promise<ActivityAdaptation | null> {
    // const { session } = context; // Unused for now

    // Create adaptation record
    const adaptation: ActivityAdaptation = {
      timestamp: new Date(),
      trigger: rule.trigger,
      adaptationType: rule.adaptations[0]?.type || 'intervention_change',
      originalContent: this.getCurrentActivityContent(context),
      adaptedContent: await this.generateAdaptedContent(rule, context),
      reasoning: `Applied rule: ${rule.name} - ${rule.description}`
    };

    return adaptation;
  }

  // Generate rule-specific modifications
  private async generateRuleModifications(
    rule: AdaptationRule,
    context: AdaptationContext
  ): Promise<{
    response?: ActivityResponse;
    sessionUpdates?: Partial<ActivitySession>;
  }> {
    const modifications: any = {};

    for (const adaptationType of rule.adaptations) {
      switch (adaptationType.type) {
        case 'difficulty_adjustment':
          modifications.sessionUpdates = {
            ...modifications.sessionUpdates,
            ...await this.adjustDifficulty(adaptationType.parameters, context)
          };
          break;

        case 'cultural_modification':
          modifications.response = await this.applyCulturalModification(adaptationType.parameters, context);
          break;

        case 'intervention_change':
          modifications.response = await this.changeIntervention(adaptationType.parameters, context);
          break;

        case 'emergency_protocol':
          modifications.response = await this.activateEmergencyProtocol(adaptationType.parameters, context);
          break;

        case 'pacing_change':
          modifications.sessionUpdates = {
            ...modifications.sessionUpdates,
            ...await this.adjustPacing(adaptationType.parameters, context)
          };
          break;

        case 'language_switch':
          modifications.response = await this.switchLanguage(adaptationType.parameters, context);
          break;
      }
    }

    return modifications;
  }

  // Adaptation implementations
  private async adjustDifficulty(
    parameters: Record<string, any>,
    context: AdaptationContext
  ): Promise<Partial<ActivitySession>> {
    const { session } = context;
    const direction = parameters.direction || 'decrease'; // 'increase' or 'decrease'
    
    return {
      // Adjust total steps if decreasing difficulty
      totalSteps: direction === 'decrease' 
        ? Math.max(3, Math.floor(session.totalSteps * 0.8))
        : Math.min(10, Math.ceil(session.totalSteps * 1.2))
    };
  }

  private async applyCulturalModification(
    _parameters: Record<string, any>,
    context: AdaptationContext
  ): Promise<ActivityResponse> {
    const { userContext } = context;
    const culturalElements = this.getCulturalElements(userContext);

    return {
      content: `${culturalElements.greeting} I understand this might feel different from what you're used to. Let me adjust our approach to be more comfortable for you. ${culturalElements.respectfulTransition}`,
      type: 'guidance',
      culturalAdaptations: culturalElements.adaptations,
      therapeuticTechniques: ['cultural_sensitivity', 'rapport_building']
    };
  }

  private async changeIntervention(
    parameters: Record<string, any>,
    _context: AdaptationContext
  ): Promise<ActivityResponse> {
    const newIntervention = parameters.interventionType || 'supportive';
    
    const interventionResponses: Record<string, string> = {
      'supportive': 'I can see this is challenging for you. Let\'s take a step back and focus on what feels most comfortable right now.',
      'grounding': 'Let\'s pause for a moment. Can you tell me 3 things you can see around you right now? This will help us stay present.',
      'validation': 'What you\'re feeling is completely valid and understandable. Many people in your situation would feel the same way.',
      'psychoeducation': 'It might help to understand what\'s happening. When we feel overwhelmed, our brain activates its stress response system.'
    };

    return {
      content: interventionResponses[newIntervention] || interventionResponses['supportive'] || 'Let me help you with a different approach.',
      type: 'intervention',
      interventionType: newIntervention,
      therapeuticTechniques: [newIntervention, 'adaptation']
    };
  }

  private async activateEmergencyProtocol(
    _parameters: Record<string, any>,
    _context: AdaptationContext
  ): Promise<ActivityResponse> {
    return {
      content: `I'm here to support you through this difficult moment. Your safety is the most important thing right now. Let's focus on getting you the help you need. 

**Immediate Support:**
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Emergency Services: 911

Would you like me to help you connect with someone who can provide immediate support?`,
      type: 'intervention',
      interventionType: 'crisis_intervention',
      therapeuticTechniques: ['crisis_intervention', 'safety_planning'],
      followUpRequired: true
    };
  }

  private async adjustPacing(
    parameters: Record<string, any>,
    context: AdaptationContext
  ): Promise<Partial<ActivitySession>> {
    const pacingAdjustment = parameters.adjustment || 'slower'; // 'slower' or 'faster'
    
    return {
      // Adjust current step progression
      currentStep: pacingAdjustment === 'slower' 
        ? Math.max(1, context.session.currentStep - 1)
        : Math.min(context.session.totalSteps, context.session.currentStep + 1)
    };
  }

  private async switchLanguage(
    parameters: Record<string, any>,
    _context: AdaptationContext
  ): Promise<ActivityResponse> {
    const targetLanguage = parameters.language || 'mixed';
    
    const languageResponses: Record<string, string> = {
      'hindi': 'मैं समझ गया हूँ। आइए हिंदी में बात करते हैं। आप कैसा महसूस कर रहे हैं?',
      'english': 'I understand. Let\'s continue in English. How are you feeling right now?',
      'mixed': 'I understand. चलिए अब हम mixed language में बात करते हैं। How are you feeling अभी?'
    };

    return {
      content: languageResponses[targetLanguage] || languageResponses['mixed'] || 'Let me adjust to better support you.',
      type: 'guidance',
      culturalAdaptations: [`${targetLanguage}_language_preference`],
      therapeuticTechniques: ['language_adaptation', 'cultural_sensitivity']
    };
  }

  // Helper methods
  private detectEmotionalDistress(content: string): boolean {
    const distressIndicators = [
      'overwhelmed', 'can\'t handle', 'too much', 'breaking down', 'falling apart',
      'panic', 'scared', 'terrified', 'hopeless', 'desperate',
      'परेशान', 'बहुत ज्यादा', 'सह नहीं सकता', 'टूट रहा', 'घबराहट'
    ];
    
    const lowerContent = content.toLowerCase();
    return distressIndicators.some(indicator => lowerContent.includes(indicator));
  }

  private detectCrisisIndicators(content: string): boolean {
    const crisisIndicators = [
      'suicide', 'kill myself', 'end it all', 'no point living', 'want to die',
      'hurt myself', 'self harm', 'cutting', 'overdose',
      'आत्महत्या', 'मरना चाहता', 'जिंदगी से तंग', 'खुद को नुकसान'
    ];
    
    const lowerContent = content.toLowerCase();
    return crisisIndicators.some(indicator => lowerContent.includes(indicator));
  }

  private detectCulturalMismatch(context: AdaptationContext): boolean {
    const culturalAlignment = this.calculateCulturalAlignment(context);
    return culturalAlignment < 0.6; // Below 60% alignment indicates mismatch
  }

  private calculateCulturalAlignment(context: AdaptationContext): number {
    const { userContext, session } = context;
    
    // Check language preference alignment
    let alignment = 0.5; // Base alignment
    
    if (userContext.demographics.language === 'hindi' && 
        session.configuration.culturalAdaptations.includes('hindi_language_support')) {
      alignment += 0.2;
    }
    
    if (userContext.demographics.culturalBackground?.includes('indian') &&
        session.configuration.culturalAdaptations.includes('indian_cultural_context')) {
      alignment += 0.2;
    }
    
    if (session.configuration.culturalAdaptations.includes('family_aware_approach')) {
      alignment += 0.1;
    }
    
    return Math.min(1, alignment);
  }

  private isTimeConstrained(session: ActivitySession, timeLimit: number): boolean {
    const elapsedTime = (Date.now() - session.startTime.getTime()) / (1000 * 60); // minutes
    const estimatedRemaining = session.configuration.estimatedDuration - elapsedTime;
    return estimatedRemaining < timeLimit;
  }

  private getCurrentActivityContent(context: AdaptationContext): string {
    const { session } = context;
    const lastResponse = session.aiResponses[session.aiResponses.length - 1];
    return lastResponse?.content || 'Current activity content';
  }

  private async generateAdaptedContent(rule: AdaptationRule, _context: AdaptationContext): Promise<string> {
    return `Adapted content based on ${rule.name}: Modified approach for better user engagement and cultural sensitivity`;
  }

  private getCulturalElements(userContext: UserContext): {
    greeting: string;
    respectfulTransition: string;
    adaptations: string[];
  } {
    const isIndian = userContext.demographics.culturalBackground?.includes('indian');
    const language = userContext.demographics.language;

    if (isIndian && language === 'hindi') {
      return {
        greeting: 'नमस्ते',
        respectfulTransition: 'आइए इसे आपके लिए और आसान बनाते हैं।',
        adaptations: ['hindi_language', 'indian_cultural_context', 'respectful_approach']
      };
    } else if (isIndian && language === 'mixed') {
      return {
        greeting: 'Namaste',
        respectfulTransition: 'Let me make this more comfortable आपके लिए।',
        adaptations: ['mixed_language', 'indian_cultural_context', 'family_sensitive']
      };
    } else {
      return {
        greeting: 'Hello',
        respectfulTransition: 'Let me adjust this to better suit your needs.',
        adaptations: ['culturally_sensitive', 'respectful_approach']
      };
    }
  }

  // Store adaptation history
  private storeAdaptationHistory(sessionId: string, adaptations: ActivityAdaptation[]): void {
    if (!this.adaptationHistory.has(sessionId)) {
      this.adaptationHistory.set(sessionId, []);
    }
    
    const history = this.adaptationHistory.get(sessionId)!;
    history.push(...adaptations);
    
    // Keep only last 20 adaptations per session
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
  }

  // Generate reasoning for adaptations
  private generateAdaptationReasoning(
    triggers: AdaptationTrigger[],
    rules: AdaptationRule[],
    adaptations: ActivityAdaptation[]
  ): string {
    const triggerDescriptions: Record<AdaptationTrigger, string> = {
      'low_engagement': 'low user engagement detected',
      'emotional_distress': 'emotional distress indicators found',
      'comprehension_issue': 'comprehension difficulties observed',
      'cultural_mismatch': 'cultural alignment issues identified',
      'crisis_detected': 'crisis indicators detected',
      'time_constraint': 'time constraints affecting session',
      'user_request': 'user requested modifications'
    };

    const triggerReasons = triggers.map(trigger => triggerDescriptions[trigger]).join(', ');
    const ruleNames = rules.map(rule => rule.name).join(', ');
    
    return `Adaptations applied due to: ${triggerReasons}. Applied rules: ${ruleNames}. ${adaptations.length} modification(s) made to improve user experience.`;
  }

  // Calculate adaptation confidence
  private calculateAdaptationConfidence(
    adaptations: ActivityAdaptation[],
    _context: AdaptationContext
  ): number {
    let confidence = 0.7; // Base confidence

    // Higher confidence with more specific triggers
    if (adaptations.some(a => a.trigger === 'crisis_detected')) {
      confidence += 0.2;
    }

    // Higher confidence with cultural adaptations
    if (adaptations.some(a => a.adaptationType === 'cultural_modification')) {
      confidence += 0.1;
    }

    // Lower confidence with multiple simultaneous adaptations
    if (adaptations.length > 2) {
      confidence -= 0.1;
    }

    return Math.max(0.3, Math.min(1, confidence));
  }

  // Initialize adaptation rules
  private initializeAdaptationRules(): void {
    // Low engagement rule
    this.adaptationRules.set('low_engagement_basic', {
      id: 'low_engagement_basic',
      name: 'Basic Low Engagement Response',
      description: 'Simplify activity when user engagement drops',
      trigger: 'low_engagement',
      conditions: [
        {
          type: 'engagement',
          operator: 'less_than',
          value: 0.4,
          weight: 1.0
        }
      ],
      adaptations: [
        {
          type: 'difficulty_adjustment',
          parameters: { direction: 'decrease' },
          description: 'Reduce activity complexity'
        },
        {
          type: 'intervention_change',
          parameters: { interventionType: 'supportive' },
          description: 'Switch to supportive intervention'
        }
      ],
      priority: 7,
      culturalSensitive: false
    });

    // Emotional distress rule
    this.adaptationRules.set('emotional_distress_support', {
      id: 'emotional_distress_support',
      name: 'Emotional Distress Support',
      description: 'Provide immediate emotional support when distress is detected',
      trigger: 'emotional_distress',
      conditions: [
        {
          type: 'stress_level',
          operator: 'greater_than',
          value: 7,
          weight: 0.8
        },
        {
          type: 'emotional_state',
          operator: 'contains',
          value: 'overwhelmed',
          weight: 0.6
        }
      ],
      adaptations: [
        {
          type: 'intervention_change',
          parameters: { interventionType: 'grounding' },
          description: 'Switch to grounding techniques'
        }
      ],
      priority: 9,
      culturalSensitive: true
    });

    // Crisis intervention rule
    this.adaptationRules.set('crisis_intervention', {
      id: 'crisis_intervention',
      name: 'Crisis Intervention Protocol',
      description: 'Activate emergency protocols when crisis indicators are detected',
      trigger: 'crisis_detected',
      conditions: [], // No additional conditions - always apply when triggered
      adaptations: [
        {
          type: 'emergency_protocol',
          parameters: { escalate: true },
          description: 'Activate crisis intervention protocol'
        }
      ],
      priority: 10,
      culturalSensitive: true
    });

    // Cultural mismatch rule
    this.adaptationRules.set('cultural_adaptation', {
      id: 'cultural_adaptation',
      name: 'Cultural Sensitivity Adjustment',
      description: 'Adjust approach when cultural mismatch is detected',
      trigger: 'cultural_mismatch',
      conditions: [
        {
          type: 'cultural_mismatch',
          operator: 'less_than',
          value: 0.6,
          weight: 1.0
        }
      ],
      adaptations: [
        {
          type: 'cultural_modification',
          parameters: { respectLevel: 'high' },
          description: 'Apply cultural modifications'
        }
      ],
      priority: 8,
      culturalSensitive: true
    });

    // Comprehension issue rule
    this.adaptationRules.set('comprehension_support', {
      id: 'comprehension_support',
      name: 'Comprehension Support',
      description: 'Simplify language and concepts when comprehension issues are detected',
      trigger: 'comprehension_issue',
      conditions: [
        {
          type: 'response_time',
          operator: 'greater_than',
          value: 20000,
          weight: 0.7
        },
        {
          type: 'comprehension',
          operator: 'less_than',
          value: 0.5,
          weight: 0.8
        }
      ],
      adaptations: [
        {
          type: 'difficulty_adjustment',
          parameters: { direction: 'decrease' },
          description: 'Simplify activity'
        },
        {
          type: 'language_switch',
          parameters: { complexity: 'simple' },
          description: 'Use simpler language'
        }
      ],
      priority: 6,
      culturalSensitive: false
    });

    // Time constraint rule
    this.adaptationRules.set('time_constraint_adaptation', {
      id: 'time_constraint_adaptation',
      name: 'Time Constraint Management',
      description: 'Adjust pacing when time constraints are detected',
      trigger: 'time_constraint',
      conditions: [
        {
          type: 'engagement',
          operator: 'greater_than',
          value: 0.5,
          weight: 0.5
        }
      ],
      adaptations: [
        {
          type: 'pacing_change',
          parameters: { adjustment: 'faster' },
          description: 'Increase activity pacing'
        }
      ],
      priority: 5,
      culturalSensitive: false
    });
  }

  // Public methods for external access
  public getAdaptationHistory(sessionId: string): ActivityAdaptation[] {
    return this.adaptationHistory.get(sessionId) || [];
  }

  public getAdaptationRules(): AdaptationRule[] {
    return Array.from(this.adaptationRules.values());
  }

  public addCustomRule(rule: AdaptationRule): void {
    this.adaptationRules.set(rule.id, rule);
  }

  public removeRule(ruleId: string): boolean {
    return this.adaptationRules.delete(ruleId);
  }

  public updateEngagementThresholds(thresholds: Partial<typeof this.engagementThresholds>): void {
    this.engagementThresholds = { ...this.engagementThresholds, ...thresholds };
  }
}