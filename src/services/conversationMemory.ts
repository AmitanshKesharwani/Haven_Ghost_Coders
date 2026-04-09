// Enhanced Conversation Memory and Continuity System
// Maintains natural conversation flow and remembers user's emotional journey

export interface ConversationTurn {
  id: string;
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  emotionalContext: EmotionalContext;
  topics: string[];
  therapeuticElements: TherapeuticElement[];
  userEngagement: number;
  conversationPhase: ConversationPhase;
}

export interface EmotionalContext {
  primaryEmotion: string;
  intensity: number;
  valence: number; // -1 to 1 (negative to positive)
  emotionalShifts: EmotionalShift[];
  triggers: string[];
  copingStrategies: string[];
}

export interface EmotionalShift {
  from: string;
  to: string;
  timestamp: Date;
  trigger?: string;
  intensity: number;
}

export interface TherapeuticElement {
  type: 'validation' | 'insight' | 'coping_strategy' | 'reframe' | 'encouragement' | 'progress_acknowledgment';
  content: string;
  effectiveness?: number;
}

export interface ConversationPhase {
  current: 'opening' | 'exploration' | 'working' | 'integration' | 'closing';
  duration: number;
  transitions: PhaseTransition[];
}

export interface PhaseTransition {
  from: string;
  to: string;
  timestamp: Date;
  reason: string;
}

export interface ConversationPattern {
  userId: string;
  patterns: {
    communicationStyle: 'direct' | 'indirect' | 'emotional' | 'analytical';
    preferredTopics: string[];
    avoidedTopics: string[];
    responseToValidation: number;
    responseToInsights: number;
    responseToStrategies: number;
    emotionalOpenness: number;
  };
  conversationRhythm: {
    averageResponseTime: number;
    preferredSessionLength: number;
    energyLevels: { time: Date; level: number }[];
  };
  userPreferences: {
    responseLength: 'short' | 'medium' | 'long' | 'adaptive';
    responseComplexity: 'simple' | 'moderate' | 'complex' | 'adaptive';
    languageStyle: 'casual' | 'formal' | 'mixed' | 'adaptive';
    includeExamples: boolean;
    includeQuestions: boolean;
    preferredFormat: 'conversational' | 'structured' | 'bullet_points' | 'adaptive';
    culturalReferences: boolean;
    emotionalTone: 'warm' | 'professional' | 'gentle' | 'adaptive';
    lastUpdated: Date;
    explicitRequests: string[]; // Store explicit user requests like "be shorter"
  };
}

export interface ContinuityBridge {
  previousSessionSummary: string;
  emotionalJourney: string;
  progressMade: string[];
  ongoingConcerns: string[];
  naturalTransitions: string[];
}

export class ConversationMemoryManager {
  private conversationHistory: Map<string, ConversationTurn[]> = new Map();
  private userPatterns: Map<string, ConversationPattern> = new Map();
  private sessionContinuity: Map<string, ContinuityBridge> = new Map();
  private emotionalJourneys: Map<string, EmotionalContext[]> = new Map();

  constructor() {
    console.log('🧠 Conversation Memory Manager initialized');
  }

  // Record a complete conversation turn with rich context
  recordConversationTurn(
    userId: string,
    userMessage: string,
    aiResponse: string,
    emotionalAnalysis: any,
    topics: string[],
    therapeuticElements: TherapeuticElement[]
  ): ConversationTurn {
    const turnId = this.generateTurnId();
    const timestamp = new Date();

    // Detect and update user preferences from their message
    this.detectUserPreferences(userId, userMessage);

    // Create emotional context
    const emotionalContext: EmotionalContext = {
      primaryEmotion: emotionalAnalysis.primaryEmotion || 'neutral',
      intensity: emotionalAnalysis.intensity || 0.5,
      valence: emotionalAnalysis.valence || 0,
      emotionalShifts: this.detectEmotionalShifts(userId, emotionalAnalysis),
      triggers: this.extractTriggers(userMessage),
      copingStrategies: this.extractCopingStrategies(userMessage, aiResponse)
    };

    // Determine conversation phase
    const conversationPhase = this.determineConversationPhase(userId, userMessage, emotionalContext);

    // Create conversation turn
    const turn: ConversationTurn = {
      id: turnId,
      timestamp,
      userMessage,
      aiResponse,
      emotionalContext,
      topics,
      therapeuticElements,
      userEngagement: this.calculateEngagement(userMessage),
      conversationPhase
    };

    // Store in history
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    const userHistory = this.conversationHistory.get(userId)!;
    userHistory.push(turn);

    // Keep last 100 turns to prevent memory bloat
    if (userHistory.length > 100) {
      this.conversationHistory.set(userId, userHistory.slice(-100));
    }

    // Update emotional journey
    this.updateEmotionalJourney(userId, emotionalContext);

    // Update user patterns
    this.updateUserPatterns(userId, turn);

    console.log(`💭 Recorded conversation turn for user ${userId}`);
    return turn;
  }

  // Generate natural conversation continuity from previous sessions
  generateContinuityBridge(userId: string, currentMessage: string): ContinuityBridge {
    const recentHistory = this.getRecentHistory(userId, 5);
    const emotionalJourney = this.getEmotionalJourney(userId);
    const userPattern = this.getUserPattern(userId);

    if (recentHistory.length === 0) {
      return {
        previousSessionSummary: '',
        emotionalJourney: '',
        progressMade: [],
        ongoingConcerns: [],
        naturalTransitions: []
      };
    }

    // Generate previous session summary
    const previousSessionSummary = this.generateSessionSummary(recentHistory);

    // Create emotional journey narrative
    const emotionalJourneyNarrative = this.createEmotionalJourneyNarrative(emotionalJourney);

    // Identify progress made
    const progressMade = this.identifyProgressMade(recentHistory);

    // Extract ongoing concerns
    const ongoingConcerns = this.extractOngoingConcerns(recentHistory, currentMessage);

    // Generate natural transitions
    const naturalTransitions = this.generateNaturalTransitions(
      recentHistory,
      currentMessage,
      userPattern
    );

    const bridge: ContinuityBridge = {
      previousSessionSummary,
      emotionalJourney: emotionalJourneyNarrative,
      progressMade,
      ongoingConcerns,
      naturalTransitions
    };

    this.sessionContinuity.set(userId, bridge);
    return bridge;
  }

  // Get contextual conversation history for AI prompts
  getConversationContext(userId: string, contextLength: number = 3): {
    recentTurns: ConversationTurn[];
    emotionalArc: string;
    conversationFlow: string;
    userPreferences: any;
  } {
    const recentTurns = this.getRecentHistory(userId, contextLength);
    const emotionalArc = this.generateEmotionalArc(recentTurns);
    const conversationFlow = this.analyzeConversationFlow(recentTurns);
    const userPreferences = this.getUserPattern(userId);

    return {
      recentTurns,
      emotionalArc,
      conversationFlow,
      userPreferences
    };
  }

  // Generate natural acknowledgment of user's journey and progress
  generateProgressAcknowledgment(userId: string): string {
    const recentHistory = this.getRecentHistory(userId, 10);
    const emotionalJourney = this.getEmotionalJourney(userId);

    if (recentHistory.length < 2) {
      return '';
    }

    const progressElements: string[] = [];

    // Emotional progress
    const emotionalProgress = this.analyzeEmotionalProgress(emotionalJourney);
    if (emotionalProgress.improvement > 0.2) {
      progressElements.push(`I've noticed you seem to be feeling a bit more settled than when we first started talking`);
    } else if (emotionalProgress.consistency > 0.7) {
      progressElements.push(`I can see you've been working through some consistent feelings`);
    }

    // Coping strategies usage
    const copingProgress = this.analyzeCopingStrategiesUsage(recentHistory);
    if (copingProgress.improvement > 0.3) {
      progressElements.push(`you've been trying some of the strategies we've discussed`);
    }

    // Engagement and openness
    const engagementTrend = this.analyzeEngagementTrend(recentHistory);
    if (engagementTrend > 0.2) {
      progressElements.push(`you've been sharing more openly with me`);
    }

    // Self-awareness growth
    const selfAwarenessGrowth = this.analyzeSelfAwarenessGrowth(recentHistory);
    if (selfAwarenessGrowth > 0.3) {
      progressElements.push(`you're becoming more aware of your patterns and feelings`);
    }

    if (progressElements.length === 0) {
      return '';
    }

    // Create natural acknowledgment
    const acknowledgments = [
      `I want to acknowledge that ${progressElements.join(' and ')}.`,
      `I've been noticing that ${progressElements.join(', and ')}.`,
      `It seems like ${progressElements.join(' and ')}.`
    ];

    return acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
  }

  // Generate natural conversation starters based on history
  generateConversationStarters(userId: string): string[] {
    const recentHistory = this.getRecentHistory(userId, 3);
    const userPattern = this.getUserPattern(userId);
    const starters: string[] = [];

    if (recentHistory.length === 0) {
      return [
        "How has your heart been feeling today?",
        "What's been on your mind lately?",
        "I'm here to listen - what would you like to talk about?"
      ];
    }

    const lastTurn = recentHistory[recentHistory.length - 1];
    const lastEmotion = lastTurn.emotionalContext.primaryEmotion;
    const lastTopics = lastTurn.topics;

    // Follow up on previous emotional state
    if (lastEmotion === 'sad' || lastEmotion === 'depressed') {
      starters.push("How have you been feeling since we last talked?");
      starters.push("I've been thinking about what you shared - how are things today?");
    } else if (lastEmotion === 'anxious' || lastEmotion === 'stressed') {
      starters.push("How has your anxiety been since our last conversation?");
      starters.push("Have you been able to try any of those calming techniques?");
    } else if (lastEmotion === 'hopeful' || lastEmotion === 'better') {
      starters.push("You seemed to be feeling a bit better last time - how are you today?");
      starters.push("I'm curious how things have been going for you.");
    }

    // Follow up on specific topics
    if (lastTopics.includes('family')) {
      starters.push("How have things been with your family?");
    }
    if (lastTopics.includes('work') || lastTopics.includes('career')) {
      starters.push("How has work been treating you?");
    }
    if (lastTopics.includes('relationships')) {
      starters.push("How are your relationships feeling lately?");
    }

    // Based on user communication style
    if (userPattern?.patterns.communicationStyle === 'direct') {
      starters.push("What's the main thing on your mind today?");
    } else if (userPattern?.patterns.communicationStyle === 'emotional') {
      starters.push("How is your heart today?");
    }

    return starters.slice(0, 3);
  }

  // Private helper methods
  private generateTurnId(): string {
    return `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectEmotionalShifts(userId: string, currentEmotion: any): EmotionalShift[] {
    const emotionalHistory = this.emotionalJourneys.get(userId) || [];
    const shifts: EmotionalShift[] = [];

    if (emotionalHistory.length > 0) {
      const lastEmotion = emotionalHistory[emotionalHistory.length - 1];
      if (lastEmotion.primaryEmotion !== currentEmotion.primaryEmotion) {
        shifts.push({
          from: lastEmotion.primaryEmotion,
          to: currentEmotion.primaryEmotion,
          timestamp: new Date(),
          intensity: Math.abs(currentEmotion.intensity - lastEmotion.intensity)
        });
      }
    }

    return shifts;
  }

  private extractTriggers(message: string): string[] {
    const triggers: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Common trigger patterns
    const triggerPatterns = {
      'family_conflict': ['family fight', 'parents angry', 'family problem', 'परिवार में झगड़ा'],
      'work_stress': ['work pressure', 'boss angry', 'deadline', 'काम का तनाव'],
      'academic_pressure': ['exam stress', 'grades', 'study pressure', 'परीक्षा का डर'],
      'relationship_issues': ['breakup', 'fight with friend', 'relationship problem', 'रिश्ते की समस्या'],
      'financial_worry': ['money problem', 'financial stress', 'पैसे की चिंता'],
      'health_concern': ['health issue', 'sick', 'medical problem', 'स्वास्थ्य की समस्या']
    };

    Object.entries(triggerPatterns).forEach(([trigger, patterns]) => {
      if (patterns.some(pattern => lowerMessage.includes(pattern))) {
        triggers.push(trigger);
      }
    });

    return triggers;
  }

  private extractCopingStrategies(userMessage: string, aiResponse: string): string[] {
    const strategies: string[] = [];
    const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();

    const strategyPatterns = {
      'breathing': ['deep breath', 'breathing', 'सांस लेना'],
      'mindfulness': ['mindful', 'present moment', 'awareness', 'ध्यान'],
      'exercise': ['walk', 'exercise', 'physical activity', 'व्यायाम'],
      'social_support': ['talk to friend', 'family support', 'reach out', 'सहारा लेना'],
      'journaling': ['write', 'journal', 'express feelings', 'लिखना'],
      'grounding': ['grounding', '5-4-3-2-1', 'notice surroundings']
    };

    Object.entries(strategyPatterns).forEach(([strategy, patterns]) => {
      if (patterns.some(pattern => combinedText.includes(pattern))) {
        strategies.push(strategy);
      }
    });

    return strategies;
  }

  private determineConversationPhase(
    userId: string,
    userMessage: string,
    emotionalContext: EmotionalContext
  ): ConversationPhase {
    const history = this.getRecentHistory(userId, 5);
    const messageLength = userMessage.length;
    const emotionalIntensity = emotionalContext.intensity;

    let currentPhase: ConversationPhase['current'] = 'exploration';

    if (history.length === 0) {
      currentPhase = 'opening';
    } else if (messageLength > 200 && emotionalIntensity > 0.6) {
      currentPhase = 'working';
    } else if (emotionalIntensity < 0.3 && messageLength < 100) {
      currentPhase = 'integration';
    } else if (userMessage.toLowerCase().includes('thank') || userMessage.toLowerCase().includes('better')) {
      currentPhase = 'closing';
    }

    return {
      current: currentPhase,
      duration: this.calculatePhaseDuration(userId, currentPhase),
      transitions: this.getPhaseTransitions(userId)
    };
  }

  private calculateEngagement(message: string): number {
    const length = message.length;
    const questionMarks = (message.match(/\?/g) || []).length;
    const emotionalWords = this.countEmotionalWords(message);
    const personalPronouns = (message.match(/\b(i|me|my|myself)\b/gi) || []).length;

    // Normalize factors
    const lengthScore = Math.min(1, length / 200);
    const questionScore = Math.min(1, questionMarks / 3);
    const emotionalScore = Math.min(1, emotionalWords / 5);
    const personalScore = Math.min(1, personalPronouns / 5);

    return (lengthScore * 0.3) + (questionScore * 0.2) + (emotionalScore * 0.3) + (personalScore * 0.2);
  }

  private countEmotionalWords(message: string): number {
    const emotionalWords = [
      'feel', 'feeling', 'felt', 'emotion', 'sad', 'happy', 'angry', 'worried', 'anxious',
      'excited', 'frustrated', 'overwhelmed', 'stressed', 'calm', 'peaceful', 'upset',
      'महसूस', 'लगता', 'खुश', 'उदास', 'चिंता', 'गुस्सा', 'परेशान'
    ];

    const lowerMessage = message.toLowerCase();
    return emotionalWords.filter(word => lowerMessage.includes(word)).length;
  }

  private updateEmotionalJourney(userId: string, emotionalContext: EmotionalContext): void {
    if (!this.emotionalJourneys.has(userId)) {
      this.emotionalJourneys.set(userId, []);
    }

    const journey = this.emotionalJourneys.get(userId)!;
    journey.push(emotionalContext);

    // Keep last 50 emotional states
    if (journey.length > 50) {
      this.emotionalJourneys.set(userId, journey.slice(-50));
    }
  }

  private updateUserPatterns(userId: string, turn: ConversationTurn): void {
    if (!this.userPatterns.has(userId)) {
      this.userPatterns.set(userId, this.initializeUserPattern(userId));
    }

    const pattern = this.userPatterns.get(userId)!;

    // Update communication style
    pattern.patterns.communicationStyle = this.inferCommunicationStyle(turn);

    // Update preferred topics
    turn.topics.forEach(topic => {
      if (!pattern.patterns.preferredTopics.includes(topic)) {
        pattern.patterns.preferredTopics.push(topic);
      }
    });

    // Update response patterns
    turn.therapeuticElements.forEach(element => {
      if (element.effectiveness && element.effectiveness > 0.7) {
        switch (element.type) {
          case 'validation':
            pattern.patterns.responseToValidation = Math.min(1, pattern.patterns.responseToValidation + 0.1);
            break;
          case 'insight':
            pattern.patterns.responseToInsights = Math.min(1, pattern.patterns.responseToInsights + 0.1);
            break;
          case 'coping_strategy':
            pattern.patterns.responseToStrategies = Math.min(1, pattern.patterns.responseToStrategies + 0.1);
            break;
        }
      }
    });

    // Update emotional openness
    if (turn.userEngagement > 0.7) {
      pattern.patterns.emotionalOpenness = Math.min(1, pattern.patterns.emotionalOpenness + 0.05);
    }
  }

  private getRecentHistory(userId: string, count: number): ConversationTurn[] {
    const history = this.conversationHistory.get(userId) || [];
    return history.slice(-count);
  }

  private getEmotionalJourney(userId: string): EmotionalContext[] {
    return this.emotionalJourneys.get(userId) || [];
  }

  private getUserPattern(userId: string): ConversationPattern | undefined {
    return this.userPatterns.get(userId);
  }

  private generateSessionSummary(turns: ConversationTurn[]): string {
    if (turns.length === 0) return '';

    const mainTopics = this.extractMainTopics(turns);
    const emotionalArc = this.generateEmotionalArc(turns);
    const keyInsights = this.extractKeyInsights(turns);

    return `Last time we talked about ${mainTopics.join(' and ')}. ${emotionalArc} ${keyInsights}`;
  }

  private createEmotionalJourneyNarrative(journey: EmotionalContext[]): string {
    if (journey.length < 2) return '';

    const recentJourney = journey.slice(-5);
    const startEmotion = recentJourney[0].primaryEmotion;
    const endEmotion = recentJourney[recentJourney.length - 1].primaryEmotion;

    if (startEmotion === endEmotion) {
      return `You've been consistently feeling ${startEmotion} in our recent conversations.`;
    } else {
      return `I've noticed your emotional journey from feeling ${startEmotion} to ${endEmotion}.`;
    }
  }

  private identifyProgressMade(turns: ConversationTurn[]): string[] {
    const progress: string[] = [];

    // Check for emotional improvement
    if (turns.length >= 2) {
      const firstEmotion = turns[0].emotionalContext;
      const lastEmotion = turns[turns.length - 1].emotionalContext;

      if (lastEmotion.valence > firstEmotion.valence + 0.2) {
        progress.push('emotional_improvement');
      }
    }

    // Check for increased engagement
    const engagementTrend = turns.map(t => t.userEngagement);
    if (engagementTrend.length >= 2) {
      const avgEarly = engagementTrend.slice(0, Math.ceil(engagementTrend.length / 2))
        .reduce((sum, val) => sum + val, 0) / Math.ceil(engagementTrend.length / 2);
      const avgLate = engagementTrend.slice(Math.floor(engagementTrend.length / 2))
        .reduce((sum, val) => sum + val, 0) / Math.ceil(engagementTrend.length / 2);

      if (avgLate > avgEarly + 0.1) {
        progress.push('increased_openness');
      }
    }

    // Check for coping strategies usage
    const copingStrategies = turns.flatMap(t => t.emotionalContext.copingStrategies);
    if (copingStrategies.length > 0) {
      progress.push('using_coping_strategies');
    }

    return progress;
  }

  private extractOngoingConcerns(turns: ConversationTurn[], currentMessage: string): string[] {
    const allTopics = turns.flatMap(t => t.topics);
    const currentTopics = this.extractTopicsFromMessage(currentMessage);

    // Find topics that appear in both recent history and current message
    const ongoingConcerns = allTopics.filter(topic =>
      currentTopics.includes(topic) &&
      allTopics.filter(t => t === topic).length >= 2
    );

    return Array.from(new Set(ongoingConcerns));
  }

  private generateNaturalTransitions(
    recentHistory: ConversationTurn[],
    currentMessage: string,
    userPattern?: ConversationPattern
  ): string[] {
    const transitions: string[] = [];

    if (recentHistory.length === 0) {
      return transitions;
    }

    const lastTurn = recentHistory[recentHistory.length - 1];
    const lastEmotion = lastTurn.emotionalContext.primaryEmotion;
    const currentTopics = this.extractTopicsFromMessage(currentMessage);

    // Emotional continuity transitions
    if (lastEmotion === 'sad' && currentMessage.toLowerCase().includes('better')) {
      transitions.push("I'm glad to hear you're feeling a bit better than last time.");
    } else if (lastEmotion === 'anxious' && currentMessage.toLowerCase().includes('calm')) {
      transitions.push("It sounds like you've found some calm since we last talked.");
    }

    // Topic continuity transitions
    const lastTopics = lastTurn.topics;
    const continuingTopics = lastTopics.filter(topic => currentTopics.includes(topic));
    if (continuingTopics.length > 0) {
      transitions.push(`I see ${continuingTopics[0]} is still on your mind.`);
    }

    // Pattern-based transitions
    if (userPattern?.patterns.communicationStyle === 'emotional') {
      transitions.push("How has your heart been since we last connected?");
    } else if (userPattern?.patterns.communicationStyle === 'direct') {
      transitions.push("What's been the main thing on your mind?");
    }

    return transitions;
  }

  private extractTopicsFromMessage(message: string): string[] {
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();

    const topicKeywords = {
      'family': ['family', 'parents', 'mom', 'dad', 'परिवार', 'माता-पिता'],
      'work': ['work', 'job', 'career', 'office', 'काम', 'नौकरी'],
      'relationships': ['friend', 'relationship', 'love', 'दोस्त', 'रिश्ता'],
      'health': ['health', 'sick', 'tired', 'स्वास्थ्य', 'बीमार'],
      'education': ['study', 'exam', 'school', 'college', 'पढ़ाई', 'परीक्षा'],
      'money': ['money', 'financial', 'expensive', 'पैसा', 'आर्थिक']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  // Additional helper methods for analysis
  private generateEmotionalArc(turns: ConversationTurn[]): string {
    if (turns.length < 2) return '';

    const emotions = turns.map(t => t.emotionalContext);
    const startValence = emotions[0].valence;
    const endValence = emotions[emotions.length - 1].valence;
    const change = endValence - startValence;

    if (change > 0.3) {
      return 'Your emotional state has been improving throughout our conversation.';
    } else if (change < -0.3) {
      return 'I notice you\'ve been feeling more challenged as we\'ve talked.';
    } else {
      return 'Your emotional state has remained fairly consistent.';
    }
  }

  private analyzeConversationFlow(turns: ConversationTurn[]): string {
    if (turns.length < 2) return 'beginning_conversation';

    const phases = turns.map(t => t.conversationPhase.current);
    const lastPhase = phases[phases.length - 1];
    const phaseChanges = phases.filter((phase, i) => i > 0 && phase !== phases[i - 1]).length;

    if (phaseChanges > 2) {
      return 'dynamic_exploration';
    } else if (lastPhase === 'working') {
      return 'deep_therapeutic_work';
    } else if (lastPhase === 'integration') {
      return 'consolidating_insights';
    } else {
      return 'steady_exploration';
    }
  }

  private extractMainTopics(turns: ConversationTurn[]): string[] {
    const topicCounts = new Map<string, number>();

    turns.forEach(turn => {
      turn.topics.forEach(topic => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
    });

    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);
  }

  private extractKeyInsights(turns: ConversationTurn[]): string {
    const insights = turns.flatMap(t =>
      t.therapeuticElements.filter(e => e.type === 'insight' || e.type === 'progress_acknowledgment')
    );

    if (insights.length === 0) return '';

    const recentInsight = insights[insights.length - 1];
    return `We explored ${recentInsight.content.substring(0, 50)}...`;
  }

  private analyzeEmotionalProgress(journey: EmotionalContext[]): { improvement: number; consistency: number } {
    if (journey.length < 3) return { improvement: 0, consistency: 0 };

    const recentJourney = journey.slice(-5);
    const valences = recentJourney.map(e => e.valence);

    const improvement = valences[valences.length - 1] - valences[0];
    const variance = this.calculateVariance(valences);
    const consistency = Math.max(0, 1 - variance);

    return { improvement, consistency };
  }

  private analyzeCopingStrategiesUsage(turns: ConversationTurn[]): { improvement: number } {
    if (turns.length < 2) return { improvement: 0 };

    const earlyStrategies = turns.slice(0, Math.ceil(turns.length / 2))
      .flatMap(t => t.emotionalContext.copingStrategies).length;
    const lateStrategies = turns.slice(Math.floor(turns.length / 2))
      .flatMap(t => t.emotionalContext.copingStrategies).length;

    const improvement = lateStrategies - earlyStrategies;
    return { improvement: Math.max(0, improvement / turns.length) };
  }

  private analyzeEngagementTrend(turns: ConversationTurn[]): number {
    if (turns.length < 2) return 0;

    const engagements = turns.map(t => t.userEngagement);
    const earlyAvg = engagements.slice(0, Math.ceil(engagements.length / 2))
      .reduce((sum, val) => sum + val, 0) / Math.ceil(engagements.length / 2);
    const lateAvg = engagements.slice(Math.floor(engagements.length / 2))
      .reduce((sum, val) => sum + val, 0) / Math.ceil(engagements.length / 2);

    return lateAvg - earlyAvg;
  }

  private analyzeSelfAwarenessGrowth(turns: ConversationTurn[]): number {
    const selfAwarenessIndicators = [
      'i realize', 'i understand', 'i notice', 'i see that', 'i think',
      'मुझे लगता है', 'मैं समझता हूं', 'मुझे एहसास है'
    ];

    let totalIndicators = 0;
    turns.forEach(turn => {
      const lowerMessage = turn.userMessage.toLowerCase();
      totalIndicators += selfAwarenessIndicators.filter(indicator =>
        lowerMessage.includes(indicator)
      ).length;
    });

    return Math.min(1, totalIndicators / turns.length);
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculatePhaseDuration(userId: string, phase: ConversationPhase['current']): number {
    const history = this.getRecentHistory(userId, 10);
    let duration = 0;

    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].conversationPhase.current === phase) {
        duration++;
      } else {
        break;
      }
    }

    return duration;
  }

  private getPhaseTransitions(userId: string): PhaseTransition[] {
    const history = this.getRecentHistory(userId, 10);
    const transitions: PhaseTransition[] = [];

    for (let i = 1; i < history.length; i++) {
      const prevPhase = history[i - 1].conversationPhase.current;
      const currPhase = history[i].conversationPhase.current;

      if (prevPhase !== currPhase) {
        transitions.push({
          from: prevPhase,
          to: currPhase,
          timestamp: history[i].timestamp,
          reason: this.inferTransitionReason(prevPhase, currPhase)
        });
      }
    }

    return transitions;
  }

  private inferTransitionReason(from: string, to: string): string {
    const transitionReasons: { [key: string]: string } = {
      'opening_exploration': 'user_opened_up',
      'exploration_working': 'deeper_emotional_content',
      'working_integration': 'insights_emerging',
      'integration_closing': 'resolution_reached',
      'working_exploration': 'new_topic_introduced',
      'integration_working': 'deeper_processing_needed'
    };

    return transitionReasons[`${from}_${to}`] || 'natural_flow';
  }

  private initializeUserPattern(userId: string): ConversationPattern {
    return {
      userId,
      patterns: {
        communicationStyle: 'emotional',
        preferredTopics: [],
        avoidedTopics: [],
        responseToValidation: 0.5,
        responseToInsights: 0.5,
        responseToStrategies: 0.5,
        emotionalOpenness: 0.5
      },
      conversationRhythm: {
        averageResponseTime: 30000,
        preferredSessionLength: 15,
        energyLevels: []
      },
      userPreferences: this.getDefaultPreferences()
    };
  }

  private inferCommunicationStyle(turn: ConversationTurn): 'direct' | 'indirect' | 'emotional' | 'analytical' {
    const message = turn.userMessage.toLowerCase();
    const engagement = turn.userEngagement;
    const emotionalIntensity = turn.emotionalContext.intensity;

    if (emotionalIntensity > 0.7 && engagement > 0.6) {
      return 'emotional';
    } else if (message.includes('what should i') || message.includes('how do i')) {
      return 'direct';
    } else if (message.includes('i think') || message.includes('analysis') || message.includes('because')) {
      return 'analytical';
    } else {
      return 'indirect';
    }
  }

  // Public utility methods
  getUserConversationStats(userId: string): any {
    const history = this.conversationHistory.get(userId) || [];
    const emotionalJourney = this.emotionalJourneys.get(userId) || [];
    const pattern = this.userPatterns.get(userId);

    return {
      totalConversations: history.length,
      averageEngagement: history.reduce((sum, turn) => sum + turn.userEngagement, 0) / Math.max(history.length, 1),
      emotionalProgress: this.analyzeEmotionalProgress(emotionalJourney),
      communicationStyle: pattern?.patterns.communicationStyle || 'unknown',
      preferredTopics: pattern?.patterns.preferredTopics || [],
      lastConversation: history[history.length - 1]?.timestamp
    };
  }

  clearUserData(userId: string): void {
    this.conversationHistory.delete(userId);
    this.userPatterns.delete(userId);
    this.sessionContinuity.delete(userId);
    this.emotionalJourneys.delete(userId);
    console.log(`🗑️ Cleared conversation data for user ${userId}`);
  }

  // Enhanced User Preference Management
  detectUserPreferences(userId: string, userMessage: string): void {
    const lowerMessage = userMessage.toLowerCase();
    let pattern = this.userPatterns.get(userId);

    if (!pattern) {
      pattern = this.createDefaultPattern(userId);
      this.userPatterns.set(userId, pattern);
    }

    // Detect preference requests
    const preferenceUpdates: Partial<ConversationPattern['userPreferences']> = {};
    const explicitRequests: string[] = [...pattern.userPreferences.explicitRequests];

    // Response length preferences
    if (lowerMessage.includes('shorter') || lowerMessage.includes('brief') || lowerMessage.includes('concise')) {
      preferenceUpdates.responseLength = 'short';
      explicitRequests.push('shorter responses');
      console.log(`📝 User ${userId} requested shorter responses`);
    }
    if (lowerMessage.includes('longer') || lowerMessage.includes('more detail') || lowerMessage.includes('elaborate')) {
      preferenceUpdates.responseLength = 'long';
      explicitRequests.push('longer responses');
      console.log(`📝 User ${userId} requested longer responses`);
    }

    // Complexity preferences
    if (lowerMessage.includes('simpler') || lowerMessage.includes('simple') || lowerMessage.includes('easy to understand')) {
      preferenceUpdates.responseComplexity = 'simple';
      explicitRequests.push('simpler language');
      console.log(`📝 User ${userId} requested simpler language`);
    }
    if (lowerMessage.includes('more complex') || lowerMessage.includes('detailed explanation')) {
      preferenceUpdates.responseComplexity = 'complex';
      explicitRequests.push('more complex explanations');
      console.log(`📝 User ${userId} requested more complex explanations`);
    }

    // Format preferences
    if (lowerMessage.includes('bullet points') || lowerMessage.includes('list format') || lowerMessage.includes('points')) {
      preferenceUpdates.preferredFormat = 'bullet_points';
      explicitRequests.push('bullet point format');
      console.log(`📝 User ${userId} requested bullet point format`);
    }
    if (lowerMessage.includes('conversational') || lowerMessage.includes('talk normally') || lowerMessage.includes('casual')) {
      preferenceUpdates.preferredFormat = 'conversational';
      explicitRequests.push('conversational format');
      console.log(`📝 User ${userId} requested conversational format`);
    }

    // Language style preferences
    if (lowerMessage.includes('formal') || lowerMessage.includes('professional')) {
      preferenceUpdates.languageStyle = 'formal';
      explicitRequests.push('formal language');
      console.log(`📝 User ${userId} requested formal language`);
    }
    if (lowerMessage.includes('casual') || lowerMessage.includes('informal') || lowerMessage.includes('friendly')) {
      preferenceUpdates.languageStyle = 'casual';
      explicitRequests.push('casual language');
      console.log(`📝 User ${userId} requested casual language`);
    }

    // Examples and questions preferences
    if (lowerMessage.includes('no examples') || lowerMessage.includes('without examples')) {
      preferenceUpdates.includeExamples = false;
      explicitRequests.push('no examples');
      console.log(`📝 User ${userId} requested no examples`);
    }
    if (lowerMessage.includes('with examples') || lowerMessage.includes('give examples')) {
      preferenceUpdates.includeExamples = true;
      explicitRequests.push('include examples');
      console.log(`📝 User ${userId} requested examples`);
    }

    if (lowerMessage.includes('no questions') || lowerMessage.includes('don\'t ask questions')) {
      preferenceUpdates.includeQuestions = false;
      explicitRequests.push('no follow-up questions');
      console.log(`📝 User ${userId} requested no questions`);
    }

    // Update preferences if any were detected
    if (Object.keys(preferenceUpdates).length > 0) {
      pattern.userPreferences = {
        ...pattern.userPreferences,
        ...preferenceUpdates,
        lastUpdated: new Date(),
        explicitRequests: [...new Set(explicitRequests)] // Remove duplicates
      };
      this.userPatterns.set(userId, pattern);
      console.log(`✅ Updated preferences for user ${userId}:`, preferenceUpdates);
    }
  }

  // Get user preferences for response generation
  getUserPreferences(userId: string): ConversationPattern['userPreferences'] {
    const pattern = this.userPatterns.get(userId);
    return pattern?.userPreferences || this.getDefaultPreferences();
  }

  // Create default pattern with preferences
  private createDefaultPattern(userId: string): ConversationPattern {
    return {
      userId,
      patterns: {
        communicationStyle: 'direct',
        preferredTopics: [],
        avoidedTopics: [],
        responseToValidation: 0.5,
        responseToInsights: 0.5,
        responseToStrategies: 0.5,
        emotionalOpenness: 0.5
      },
      conversationRhythm: {
        averageResponseTime: 5000,
        preferredSessionLength: 15,
        energyLevels: []
      },
      userPreferences: this.getDefaultPreferences()
    };
  }

  // Get default preferences
  private getDefaultPreferences(): ConversationPattern['userPreferences'] {
    return {
      responseLength: 'adaptive',
      responseComplexity: 'adaptive',
      languageStyle: 'adaptive',
      includeExamples: true,
      includeQuestions: true,
      preferredFormat: 'adaptive',
      culturalReferences: true,
      emotionalTone: 'adaptive',
      lastUpdated: new Date(),
      explicitRequests: []
    };
  }

  // Generate preference-aware prompt instructions
  generatePreferenceInstructions(userId: string): string {
    const preferences = this.getUserPreferences(userId);
    let instructions = '';

    // Response length instructions
    if (preferences.responseLength === 'short') {
      instructions += '- Keep responses SHORT and CONCISE (2-3 sentences max)\n';
    } else if (preferences.responseLength === 'long') {
      instructions += '- Provide DETAILED and COMPREHENSIVE responses with thorough explanations\n';
    }

    // Complexity instructions
    if (preferences.responseComplexity === 'simple') {
      instructions += '- Use SIMPLE, EASY-TO-UNDERSTAND language\n';
      instructions += '- Avoid complex terminology or concepts\n';
    } else if (preferences.responseComplexity === 'complex') {
      instructions += '- Provide DETAILED explanations with nuanced insights\n';
    }

    // Format instructions
    if (preferences.preferredFormat === 'bullet_points') {
      instructions += '- Format responses using BULLET POINTS or numbered lists\n';
    } else if (preferences.preferredFormat === 'structured') {
      instructions += '- Use STRUCTURED format with clear sections\n';
    }

    // Language style instructions
    if (preferences.languageStyle === 'formal') {
      instructions += '- Use FORMAL, PROFESSIONAL language\n';
    } else if (preferences.languageStyle === 'casual') {
      instructions += '- Use CASUAL, FRIENDLY language\n';
    }

    // Examples and questions
    if (!preferences.includeExamples) {
      instructions += '- DO NOT include examples in your response\n';
    }
    if (!preferences.includeQuestions) {
      instructions += '- DO NOT ask follow-up questions\n';
    }

    // Add explicit requests
    if (preferences.explicitRequests.length > 0) {
      instructions += `- REMEMBER: User has specifically requested: ${preferences.explicitRequests.join(', ')}\n`;
    }

    return instructions;
  }

  // Update preferences based on user feedback
  updatePreferencesFromFeedback(userId: string, feedback: string): void {
    const lowerFeedback = feedback.toLowerCase();

    if (lowerFeedback.includes('too long') || lowerFeedback.includes('too much')) {
      this.updateUserPreference(userId, 'responseLength', 'short');
    }
    if (lowerFeedback.includes('too short') || lowerFeedback.includes('more detail')) {
      this.updateUserPreference(userId, 'responseLength', 'long');
    }
    if (lowerFeedback.includes('too complex') || lowerFeedback.includes('confusing')) {
      this.updateUserPreference(userId, 'responseComplexity', 'simple');
    }
  }

  // Helper method to update specific preference
  private updateUserPreference(userId: string, key: keyof ConversationPattern['userPreferences'], value: any): void {
    let pattern = this.userPatterns.get(userId);
    if (!pattern) {
      pattern = this.createDefaultPattern(userId);
    }

    (pattern.userPreferences as any)[key] = value;
    pattern.userPreferences.lastUpdated = new Date();
    this.userPatterns.set(userId, pattern);

    console.log(`🔄 Updated ${key} to ${value} for user ${userId}`);
  }
}

// Export singleton instance
export const conversationMemory = new ConversationMemoryManager();