import { AssessmentQuestion, AssessmentResponse, ConversationalAssessmentEngine, SimpleAssessmentSession } from './assessmentEngine';

export interface AdaptationTrigger {
  type: 'low_engagement' | 'high_distress' | 'cultural_sensitivity' | 'comprehension_issue' | 'crisis_indicator';
  severity: 'low' | 'medium' | 'high';
  context: string;
  suggestedAdaptation: AdaptationType;
}

export interface AdaptationType {
  strategy: 'simplify_language' | 'increase_cultural_context' | 'provide_emotional_support' | 'crisis_intervention' | 'engagement_boost' | 'clarify_question';
  parameters: Record<string, any>;
}

export interface AssessmentAdaptation {
  triggerId: string;
  adaptationType: AdaptationType;
  originalQuestion: AssessmentQuestion;
  adaptedQuestion: AssessmentQuestion;
  adaptationReason: string;
  timestamp: Date;
}

export class AdaptiveAssessmentEngine extends ConversationalAssessmentEngine {
  private adaptationHistory: Map<string, AssessmentAdaptation[]>;
  private engagementThresholds: Record<string, number>;
  private distressIndicators: string[];
  private crisisKeywords: string[];

  constructor() {
    super();
    this.adaptationHistory = new Map();
    this.engagementThresholds = {
      very_short_response: 10,
      minimal_response: 25,
      low_engagement_score: 4,
      response_time_too_quick: 5000,
      response_time_too_slow: 120000
    };
    this.distressIndicators = [
      'overwhelmed', 'can\'t handle', 'too much', 'breaking down', 'falling apart',
      'hopeless', 'worthless', 'burden', 'give up', 'end it all',
      'नहीं संभल रहा', 'बहुत परेशान', 'टूट गया हूं', 'हार गया हूं'
    ];
    this.crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'not worth living', 'better off dead',
      'hurt myself', 'self harm', 'cutting', 'overdose',
      'आत्महत्या', 'मरना चाहता हूं', 'जीना नहीं चाहता'
    ];
  }

  async processResponseWithAdaptation(
    sessionId: string,
    userResponse: string,
    currentQuestion: AssessmentQuestion,
    session: SimpleAssessmentSession
  ): Promise<{
    assessmentResponse: AssessmentResponse;
    adaptationTriggered: boolean;
    adaptation?: AssessmentAdaptation;
    nextQuestion?: AssessmentQuestion;
    immediateIntervention?: boolean;
  }> {
    // Analyze response for adaptation triggers
    const triggers = await this.analyzeForAdaptationTriggers(
      userResponse,
      currentQuestion,
      session
    );

    // Process the response normally first
    const assessmentResponse = await this.extractScoreFromResponse(
      userResponse,
      currentQuestion,
      session.culturalAdaptations
    );

    // Check for immediate crisis intervention
    const crisisDetected = this.detectCrisisIndicators(userResponse);
    if (crisisDetected) {
      return {
        assessmentResponse,
        adaptationTriggered: true,
        immediateIntervention: true
      };
    }

    // Apply adaptations if needed
    if (triggers.length > 0) {
      const primaryTrigger = this.selectPrimaryTrigger(triggers);
      const adaptation = await this.generateAdaptation(
        primaryTrigger,
        currentQuestion,
        session
      );

      // Store adaptation history
      const sessionAdaptations = this.adaptationHistory.get(sessionId) || [];
      sessionAdaptations.push(adaptation);
      this.adaptationHistory.set(sessionId, sessionAdaptations);

      // Generate next question with adaptation
      const nextQuestion = await this.applyAdaptationToNextQuestion(
        adaptation,
        session
      );

      return {
        assessmentResponse,
        adaptationTriggered: true,
        adaptation,
        nextQuestion: nextQuestion || undefined
      };
    }

    return {
      assessmentResponse,
      adaptationTriggered: false
    };
  }

  private async analyzeForAdaptationTriggers(
    userResponse: string,
    currentQuestion: AssessmentQuestion,
    session: SimpleAssessmentSession
  ): Promise<AdaptationTrigger[]> {
    const triggers: AdaptationTrigger[] = [];

    // Check for low engagement
    const engagementTrigger = this.checkEngagementLevel(userResponse, session);
    if (engagementTrigger) triggers.push(engagementTrigger);

    // Check for distress indicators
    const distressTrigger = this.checkDistressLevel(userResponse);
    if (distressTrigger) triggers.push(distressTrigger);

    // Check for cultural sensitivity issues
    const culturalTrigger = await this.checkCulturalSensitivity(userResponse, session);
    if (culturalTrigger) triggers.push(culturalTrigger);

    // Check for comprehension issues
    const comprehensionTrigger = this.checkComprehensionIssues(userResponse, currentQuestion);
    if (comprehensionTrigger) triggers.push(comprehensionTrigger);

    return triggers;
  }

  private checkEngagementLevel(userResponse: string, session: SimpleAssessmentSession): AdaptationTrigger | null {
    // Very short responses
    if (userResponse.length < this.engagementThresholds.very_short_response) {
      return {
        type: 'low_engagement',
        severity: 'high',
        context: 'Very short response indicating possible disengagement',
        suggestedAdaptation: {
          strategy: 'engagement_boost',
          parameters: { approach: 'encourage_elaboration', tone: 'supportive' }
        }
      };
    }

    // Minimal responses
    if (userResponse.length < this.engagementThresholds.minimal_response) {
      return {
        type: 'low_engagement',
        severity: 'medium',
        context: 'Minimal response suggesting low engagement',
        suggestedAdaptation: {
          strategy: 'engagement_boost',
          parameters: { approach: 'ask_follow_up', tone: 'curious' }
        }
      };
    }

    // Generic or evasive responses
    const genericResponses = ['fine', 'okay', 'nothing much', 'i don\'t know', 'maybe', 'ठीक है', 'पता नहीं'];
    if (genericResponses.some(generic => userResponse.toLowerCase().includes(generic))) {
      return {
        type: 'low_engagement',
        severity: 'medium',
        context: 'Generic response indicating possible avoidance',
        suggestedAdaptation: {
          strategy: 'engagement_boost',
          parameters: { approach: 'normalize_and_encourage', tone: 'understanding' }
        }
      };
    }

    return null;
  }

  private checkDistressLevel(userResponse: string): AdaptationTrigger | null {
    const responseText = userResponse.toLowerCase();
    
    // Check for high distress indicators
    const highDistressFound = this.distressIndicators.some(indicator => 
      responseText.includes(indicator.toLowerCase())
    );

    if (highDistressFound) {
      return {
        type: 'high_distress',
        severity: 'high',
        context: 'User expressing significant emotional distress',
        suggestedAdaptation: {
          strategy: 'provide_emotional_support',
          parameters: { 
            approach: 'validate_and_support',
            tone: 'compassionate',
            include_coping_strategies: true
          }
        }
      };
    }

    // Check for moderate distress through emotional language
    const moderateDistressWords = [
      'stressed', 'anxious', 'worried', 'scared', 'frustrated', 'angry', 'sad', 'upset',
      'तनाव', 'चिंता', 'परेशान', 'डर', 'गुस्सा', 'उदास'
    ];

    const moderateDistressFound = moderateDistressWords.some(word => 
      responseText.includes(word.toLowerCase())
    );

    if (moderateDistressFound) {
      return {
        type: 'high_distress',
        severity: 'medium',
        context: 'User expressing moderate emotional distress',
        suggestedAdaptation: {
          strategy: 'provide_emotional_support',
          parameters: { 
            approach: 'acknowledge_and_normalize',
            tone: 'supportive'
          }
        }
      };
    }

    return null;
  }

  private async checkCulturalSensitivity(
    userResponse: string,
    session: SimpleAssessmentSession
  ): Promise<AdaptationTrigger | null> {
    // Check for cultural context that wasn't addressed
    const culturalCues = [
      'family won\'t understand', 'parents don\'t get it', 'cultural difference',
      'tradition vs modern', 'arranged marriage', 'family honor', 'izzat',
      'परिवार नहीं समझेगा', 'माता-पिता नहीं समझते', 'पारंपरिक vs आधुनिक'
    ];

    const culturalCueFound = culturalCues.some(cue => 
      userResponse.toLowerCase().includes(cue.toLowerCase())
    );

    if (culturalCueFound) {
      return {
        type: 'cultural_sensitivity',
        severity: 'medium',
        context: 'User mentioning cultural factors that need addressing',
        suggestedAdaptation: {
          strategy: 'increase_cultural_context',
          parameters: { 
            approach: 'acknowledge_cultural_complexity',
            include_cultural_examples: true
          }
        }
      };
    }

    return null;
  }

  private checkComprehensionIssues(
    userResponse: string,
    currentQuestion: AssessmentQuestion
  ): AdaptationTrigger | null {
    // Check for confusion indicators
    const confusionIndicators = [
      'don\'t understand', 'what do you mean', 'confused', 'not clear',
      'समझ नहीं आया', 'क्या मतलब', 'स्पष्ट नहीं है'
    ];

    const confusionFound = confusionIndicators.some(indicator => 
      userResponse.toLowerCase().includes(indicator.toLowerCase())
    );

    if (confusionFound) {
      return {
        type: 'comprehension_issue',
        severity: 'medium',
        context: 'User indicating difficulty understanding the question',
        suggestedAdaptation: {
          strategy: 'clarify_question',
          parameters: { 
            approach: 'simplify_and_provide_examples',
            use_analogies: true
          }
        }
      };
    }

    return null;
  }

  private detectCrisisIndicators(userResponse: string): boolean {
    const responseText = userResponse.toLowerCase();
    return this.crisisKeywords.some(keyword => 
      responseText.includes(keyword.toLowerCase())
    );
  }

  private selectPrimaryTrigger(triggers: AdaptationTrigger[]): AdaptationTrigger {
    // Priority order: crisis > high distress > cultural sensitivity > comprehension > engagement
    const priorityOrder = ['crisis_indicator', 'high_distress', 'cultural_sensitivity', 'comprehension_issue', 'low_engagement'];
    
    for (const priority of priorityOrder) {
      const trigger = triggers.find(t => t.type === priority);
      if (trigger) return trigger;
    }

    // Fallback to first trigger if available
    if (triggers.length > 0) {
      return triggers[0];
    }

    // Default fallback trigger
    return {
      type: 'low_engagement',
      severity: 'low',
      context: 'Default adaptation trigger',
      suggestedAdaptation: {
        strategy: 'engagement_boost',
        parameters: { approach: 'encourage_elaboration', tone: 'supportive' }
      }
    };
  }

  private async generateAdaptation(
    trigger: AdaptationTrigger,
    currentQuestion: AssessmentQuestion,
    session: SimpleAssessmentSession
  ): Promise<AssessmentAdaptation> {
    const adaptedQuestion = await this.adaptQuestion(trigger, currentQuestion, session);

    return {
      triggerId: `trigger_${Date.now()}`,
      adaptationType: trigger.suggestedAdaptation,
      originalQuestion: currentQuestion,
      adaptedQuestion,
      adaptationReason: trigger.context,
      timestamp: new Date()
    };
  }

  private async adaptQuestion(
    trigger: AdaptationTrigger,
    question: AssessmentQuestion,
    session: SimpleAssessmentSession
  ): Promise<AssessmentQuestion> {
    const adaptedQuestion = { ...question };

    switch (trigger.suggestedAdaptation.strategy) {
      case 'engagement_boost':
        adaptedQuestion.conversationalPrompt = await this.addEngagementBoost(
          question.conversationalPrompt,
          trigger.suggestedAdaptation.parameters
        );
        break;

      case 'provide_emotional_support':
        adaptedQuestion.conversationalPrompt = await this.addEmotionalSupport(
          question.conversationalPrompt,
          trigger.suggestedAdaptation.parameters
        );
        break;

      case 'increase_cultural_context':
        adaptedQuestion.conversationalPrompt = await this.addCulturalContext(
          question.conversationalPrompt,
          session.culturalAdaptations
        );
        break;

      case 'clarify_question':
        adaptedQuestion.conversationalPrompt = await this.clarifyQuestion(
          question.conversationalPrompt,
          trigger.suggestedAdaptation.parameters
        );
        break;

      case 'simplify_language':
        adaptedQuestion.conversationalPrompt = await this.simplifyLanguage(
          question.conversationalPrompt
        );
        break;
    }

    return adaptedQuestion;
  }

  private async addEngagementBoost(prompt: string, parameters: any): Promise<string> {
    const encouragements = {
      encourage_elaboration: [
        "I'd love to hear more about that. ",
        "That's really helpful - can you tell me a bit more? ",
        "I appreciate you sharing that. Could you help me understand better? "
      ],
      ask_follow_up: [
        "I'm here to listen. ",
        "Take your time - there's no rush. ",
        "Whatever you're comfortable sharing is helpful. "
      ],
      normalize_and_encourage: [
        "It's completely normal to find these questions challenging. ",
        "Many people find it hard to put these feelings into words. ",
        "You're doing great by being here and trying. "
      ]
    };

    const approach = parameters.approach || 'encourage_elaboration';
    const encouragementOptions = encouragements[approach as keyof typeof encouragements] || encouragements.encourage_elaboration;
    const selectedEncouragement = encouragementOptions[Math.floor(Math.random() * encouragementOptions.length)];

    return selectedEncouragement + prompt;
  }

  private async addEmotionalSupport(prompt: string, parameters: any): Promise<string> {
    const supportPrefixes = {
      validate_and_support: [
        "I can hear that you're going through a really difficult time right now. ",
        "What you're feeling sounds incredibly challenging. ",
        "I want you to know that your feelings are completely valid. "
      ],
      acknowledge_and_normalize: [
        "It sounds like you're dealing with some tough emotions. ",
        "Many people experience these kinds of feelings. ",
        "Thank you for trusting me with something so personal. "
      ]
    };

    const approach = parameters.approach || 'acknowledge_and_normalize';
    const supportOptions = supportPrefixes[approach as keyof typeof supportPrefixes] || supportPrefixes.acknowledge_and_normalize;
    const selectedSupport = supportOptions[Math.floor(Math.random() * supportOptions.length)];

    let adaptedPrompt = selectedSupport + prompt;

    if (parameters.include_coping_strategies) {
      adaptedPrompt += " And remember, if you need immediate support, I'm here to help you find resources.";
    }

    return adaptedPrompt;
  }

  private async addCulturalContext(prompt: string, culturalAdaptations: any[]): Promise<string> {
    const culturalPrefixes = [
      "I understand that cultural and family dynamics can make these situations more complex. ",
      "Navigating these feelings while honoring your cultural background can be challenging. ",
      "I recognize that family and cultural expectations add another layer to what you're experiencing. "
    ];

    const selectedPrefix = culturalPrefixes[Math.floor(Math.random() * culturalPrefixes.length)];
    return selectedPrefix + prompt;
  }

  private async clarifyQuestion(prompt: string, parameters: any): Promise<string> {
    const clarificationPrefixes = {
      simplify_and_provide_examples: [
        "Let me ask this in a different way. ",
        "To put it more simply, ",
        "For example, "
      ],
      gently_redirect: [
        "I appreciate you sharing that. Let me ask about something specific: ",
        "That's interesting. I'd like to focus on ",
        "Thank you for that. What I'm curious about is "
      ]
    };

    const approach = parameters.approach || 'simplify_and_provide_examples';
    const clarificationOptions = clarificationPrefixes[approach as keyof typeof clarificationPrefixes] || clarificationPrefixes.simplify_and_provide_examples;
    const selectedClarification = clarificationOptions[Math.floor(Math.random() * clarificationOptions.length)];

    return selectedClarification + prompt;
  }

  private async simplifyLanguage(prompt: string): Promise<string> {
    // Simple language substitutions
    const substitutions = {
      'experiencing': 'having',
      'challenging': 'hard',
      'overwhelming': 'too much',
      'circumstances': 'situations',
      'particularly': 'especially',
      'significant': 'big',
      'concerning': 'worrying'
    };

    let simplifiedPrompt = prompt;
    Object.entries(substitutions).forEach(([complex, simple]) => {
      simplifiedPrompt = simplifiedPrompt.replace(new RegExp(complex, 'gi'), simple);
    });

    return simplifiedPrompt;
  }

  private async applyAdaptationToNextQuestion(
    adaptation: AssessmentAdaptation,
    session: SimpleAssessmentSession
  ): Promise<AssessmentQuestion | undefined> {
    // This would get the next question in the sequence and apply any necessary adaptations
    // For now, returning the adapted question
    return adaptation.adaptedQuestion;
  }

  async getAdaptationHistory(sessionId: string): Promise<AssessmentAdaptation[]> {
    return this.adaptationHistory.get(sessionId) || [];
  }

  async getAdaptationInsights(sessionId: string): Promise<{
    totalAdaptations: number;
    adaptationTypes: Record<string, number>;
    engagementTrend: string;
    culturalSensitivityNeeded: boolean;
  }> {
    const adaptations = this.adaptationHistory.get(sessionId) || [];
    
    const adaptationTypes: Record<string, number> = {};
    adaptations.forEach(adaptation => {
      const strategy = adaptation.adaptationType.strategy;
      adaptationTypes[strategy] = (adaptationTypes[strategy] || 0) + 1;
    });

    const engagementAdaptations = adaptations.filter(a => 
      a.adaptationType.strategy === 'engagement_boost'
    ).length;

    const culturalAdaptations = adaptations.filter(a => 
      a.adaptationType.strategy === 'increase_cultural_context'
    ).length;

    return {
      totalAdaptations: adaptations.length,
      adaptationTypes,
      engagementTrend: engagementAdaptations > 2 ? 'declining' : 'stable',
      culturalSensitivityNeeded: culturalAdaptations > 0
    };
  }
}