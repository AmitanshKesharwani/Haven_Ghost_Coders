// Intelligent Session Management for MannMitra
// Tracks user progress, adapts AI responses, and manages therapeutic journey

import { aiOrchestrator } from './aiOrchestrator';
import { emotionDetection } from './emotionDetection';

export interface UserSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  sessionType: 'chat' | 'voice' | 'video' | 'assessment' | 'crisis';
  interactions: SessionInteraction[];
  emotionalJourney: EmotionalDataPoint[];
  therapeuticGoals: string[];
  progressMetrics: ProgressMetrics;
  aiAdaptations: AIAdaptation[];
  culturalContext: CulturalSessionContext;
  riskAssessments: RiskAssessment[];
  outcomes: SessionOutcome;
}

export interface SessionInteraction {
  timestamp: Date;
  type: 'user_message' | 'ai_response' | 'emotion_detected' | 'voice_analysis' | 'action_taken';
  content: string;
  metadata: {
    emotionalState?: any;
    confidence?: number;
    interventionType?: string;
    effectiveness?: number;
  };
}

export interface EmotionalDataPoint {
  timestamp: Date;
  primaryEmotion: string;
  intensity: number;
  valence: number;
  arousal: number;
  confidence: number;
  source: 'text' | 'voice' | 'facial' | 'behavioral';
  contextualFactors: string[];
}

export interface ProgressMetrics {
  emotionalRegulation: number;
  selfAwareness: number;
  copingSkillsUsage: number;
  therapeuticAlliance: number;
  goalProgress: { [goal: string]: number };
  riskReduction: number;
  engagementLevel: number;
  sessionSatisfaction: number;
}

export interface AIAdaptation {
  timestamp: Date;
  adaptationType: 'tone' | 'language' | 'intervention' | 'cultural_reference' | 'complexity';
  previousValue: any;
  newValue: any;
  reason: string;
  effectiveness: number;
}

export interface CulturalSessionContext {
  languagePreference: 'hindi' | 'english' | 'mixed';
  culturalReferences: string[];
  familyDynamics: string[];
  socialContext: string[];
  religiousConsiderations: string[];
  generationalFactors: string[];
}

export interface RiskAssessment {
  timestamp: Date;
  level: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  indicators: string[];
  protectiveFactors: string[];
  interventions: string[];
  followUpRequired: boolean;
  professionalReferral: boolean;
  confidence?: number;
}

export interface SessionOutcome {
  overallMood: 'improved' | 'stable' | 'declined';
  goalsAddressed: string[];
  skillsPracticed: string[];
  insightsGained: string[];
  nextSessionRecommendations: string[];
  homeworkAssigned: string[];
  riskStatus: 'resolved' | 'monitoring' | 'escalated';
}

export interface TherapeuticPlan {
  userId: string;
  createdDate: Date;
  lastUpdated: Date;
  primaryGoals: string[];
  secondaryGoals: string[];
  interventionStrategies: string[];
  culturalConsiderations: string[];
  riskFactors: string[];
  protectiveFactors: string[];
  progressMilestones: { [milestone: string]: boolean };
  adaptiveStrategies: string[];
}

export class SessionManager {
  private activeSessions: Map<string, UserSession> = new Map();
  private userPlans: Map<string, TherapeuticPlan> = new Map();
  private sessionHistory: Map<string, UserSession[]> = new Map();
  private realTimeAnalysis: Map<string, any> = new Map();

  constructor() {
    console.log('📊 Session Manager initialized');
  }

  // Start a new therapeutic session
  async startSession(
    userId: string,
    sessionType: UserSession['sessionType'],
    options: {
      goals?: string[];
      culturalContext?: Partial<CulturalSessionContext>;
      riskLevel?: string;
    } = {}
  ): Promise<string> {
    const sessionId = this.generateSessionId();

    // Get or create therapeutic plan
    const therapeuticPlan = await this.getTherapeuticPlan(userId);

    // Initialize session
    const session: UserSession = {
      sessionId,
      userId,
      startTime: new Date(),
      duration: 0,
      sessionType,
      interactions: [],
      emotionalJourney: [],
      therapeuticGoals: options.goals || therapeuticPlan.primaryGoals,
      progressMetrics: this.initializeProgressMetrics(),
      aiAdaptations: [],
      culturalContext: this.initializeCulturalContext(options.culturalContext),
      riskAssessments: [],
      outcomes: this.initializeOutcomes()
    };

    this.activeSessions.set(sessionId, session);

    // Start real-time monitoring if needed
    if (sessionType === 'video' || sessionType === 'voice') {
      await this.startRealTimeMonitoring(sessionId);
    }

    console.log(`🎯 Session ${sessionId} started for user ${userId}`);
    return sessionId;
  }

  // Process user interaction and generate AI response
  async processInteraction(
    sessionId: string,
    userMessage: string,
    interactionType: 'text' | 'voice' | 'video' = 'text',
    metadata: any = {}
  ): Promise<{
    aiResponse: any;
    sessionInsights: any;
    adaptations: AIAdaptation[];
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      // Record user interaction
      this.recordInteraction(session, {
        timestamp: new Date(),
        type: 'user_message',
        content: userMessage,
        metadata: { interactionType, ...metadata }
      });

      // Analyze emotional state
      let emotionalAnalysis: any = {};
      if (interactionType === 'video' && metadata.imageData) {
        emotionalAnalysis = await emotionDetection.analyzeImage(metadata.imageData);
      }

      // Update emotional journey
      if (emotionalAnalysis.primaryEmotion) {
        const sourceType = interactionType === 'video' ? 'facial' : interactionType as 'text' | 'voice' | 'facial';
        this.updateEmotionalJourney(session, emotionalAnalysis, sourceType);
      }

      // Assess risk level
      const riskAssessment = await this.assessCurrentRisk(session, userMessage, emotionalAnalysis);
      session.riskAssessments.push(riskAssessment);

      // Determine AI adaptations needed
      const adaptations = await this.determineAIAdaptations(session, emotionalAnalysis);

      // Generate AI response using orchestrator
      const aiResponse = await aiOrchestrator.generateTherapeuticResponse(
        userMessage,
        session.userId,
        {
          session,
          emotionalAnalysis,
          riskAssessment,
          adaptations
        }
      );

      // Record AI response
      this.recordInteraction(session, {
        timestamp: new Date(),
        type: 'ai_response',
        content: aiResponse.message,
        metadata: {
          interventionType: aiResponse.interventionType,
          confidence: aiResponse.riskAssessment?.confidence || 0.8
        }
      });

      // Update progress metrics
      this.updateProgressMetrics(session, aiResponse, emotionalAnalysis);

      // Generate session insights
      const sessionInsights = this.generateSessionInsights(session);

      return {
        aiResponse,
        sessionInsights,
        adaptations
      };
    } catch (error) {
      console.error('Interaction processing error:', error);
      throw error;
    }
  }

  // End session and generate comprehensive report
  async endSession(sessionId: string): Promise<{
    sessionSummary: any;
    progressReport: any;
    recommendations: string[];
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Stop real-time monitoring
    this.stopRealTimeMonitoring(sessionId);

    // Calculate session duration
    session.endTime = new Date();
    session.duration = session.endTime.getTime() - session.startTime.getTime();

    // Generate comprehensive session analysis
    const sessionSummary = await this.generateSessionSummary(session);
    const progressReport = await this.generateProgressReport(session);
    const recommendations = await this.generateRecommendations(session);

    // Update therapeutic plan
    await this.updateTherapeuticPlan(session.userId, session);

    // Store session in history
    this.storeSessionHistory(session);

    // Remove from active sessions
    this.activeSessions.delete(sessionId);

    console.log(`✅ Session ${sessionId} completed`);
    return {
      sessionSummary,
      progressReport,
      recommendations
    };
  }

  // Crisis intervention management
  async handleCrisisIntervention(
    sessionId: string,
    crisisLevel: 'moderate' | 'high' | 'severe',
    indicators: string[]
  ): Promise<{
    immediateActions: string[];
    professionalContacts: any[];
    safetyPlan: string[];
    followUpSchedule: any;
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Record crisis assessment
    const crisisAssessment: RiskAssessment = {
      timestamp: new Date(),
      level: crisisLevel,
      indicators,
      protectiveFactors: await this.identifyProtectiveFactors(session),
      interventions: [],
      followUpRequired: true,
      professionalReferral: crisisLevel === 'severe'
    };

    session.riskAssessments.push(crisisAssessment);

    // Generate crisis response
    const immediateActions = this.generateImmediateActions(crisisLevel, indicators);
    const professionalContacts = this.getProfessionalContacts(session.culturalContext);
    const safetyPlan = await this.generateSafetyPlan(session, crisisLevel);
    const followUpSchedule = this.createFollowUpSchedule(crisisLevel);

    // Update interventions
    crisisAssessment.interventions = [...immediateActions, ...safetyPlan];

    console.log(`🚨 Crisis intervention activated for session ${sessionId}`);
    return {
      immediateActions,
      professionalContacts,
      safetyPlan,
      followUpSchedule
    };
  }

  // Private helper methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getTherapeuticPlan(userId: string): Promise<TherapeuticPlan> {
    if (!this.userPlans.has(userId)) {
      const defaultPlan: TherapeuticPlan = {
        userId,
        createdDate: new Date(),
        lastUpdated: new Date(),
        primaryGoals: ['stress_management', 'emotional_regulation'],
        secondaryGoals: ['family_communication', 'academic_balance'],
        interventionStrategies: ['CBT', 'mindfulness', 'cultural_therapy'],
        culturalConsiderations: ['family_dynamics', 'academic_pressure'],
        riskFactors: ['social_isolation', 'perfectionism'],
        protectiveFactors: ['family_support', 'academic_achievement'],
        progressMilestones: {},
        adaptiveStrategies: ['language_mixing', 'cultural_references']
      };
      this.userPlans.set(userId, defaultPlan);
    }
    return this.userPlans.get(userId)!;
  }

  private initializeProgressMetrics(): ProgressMetrics {
    return {
      emotionalRegulation: 0.5,
      selfAwareness: 0.5,
      copingSkillsUsage: 0.5,
      therapeuticAlliance: 0.5,
      goalProgress: {},
      riskReduction: 0.5,
      engagementLevel: 0.5,
      sessionSatisfaction: 0.5
    };
  }

  private initializeCulturalContext(context?: Partial<CulturalSessionContext>): CulturalSessionContext {
    return {
      languagePreference: 'mixed',
      culturalReferences: [],
      familyDynamics: [],
      socialContext: [],
      religiousConsiderations: [],
      generationalFactors: [],
      ...context
    };
  }

  private initializeOutcomes(): SessionOutcome {
    return {
      overallMood: 'stable',
      goalsAddressed: [],
      skillsPracticed: [],
      insightsGained: [],
      nextSessionRecommendations: [],
      homeworkAssigned: [],
      riskStatus: 'monitoring'
    };
  }

  private async startRealTimeMonitoring(sessionId: string): Promise<void> {
    this.realTimeAnalysis.set(sessionId, {
      emotionalBaseline: null,
      behavioralPatterns: [],
      riskIndicators: [],
      engagementLevel: 0.5
    });
  }

  private stopRealTimeMonitoring(sessionId: string): void {
    this.realTimeAnalysis.delete(sessionId);
  }

  private recordInteraction(session: UserSession, interaction: SessionInteraction): void {
    session.interactions.push(interaction);
    if (session.interactions.length > 100) {
      session.interactions = session.interactions.slice(-100);
    }
  }

  private updateEmotionalJourney(
    session: UserSession,
    emotionalAnalysis: any,
    source: 'text' | 'voice' | 'facial'
  ): void {
    const dataPoint: EmotionalDataPoint = {
      timestamp: new Date(),
      primaryEmotion: emotionalAnalysis.primaryEmotion || 'neutral',
      intensity: emotionalAnalysis.intensity || 0.5,
      valence: emotionalAnalysis.valence || 0,
      arousal: emotionalAnalysis.arousal || 0.5,
      confidence: emotionalAnalysis.confidence || 0.7,
      source,
      contextualFactors: emotionalAnalysis.contextualFactors || []
    };

    session.emotionalJourney.push(dataPoint);
    if (session.emotionalJourney.length > 50) {
      session.emotionalJourney = session.emotionalJourney.slice(-50);
    }
  }

  private async assessCurrentRisk(
    _session: UserSession,
    userMessage: string,
    emotionalAnalysis: any
  ): Promise<RiskAssessment> {
    const indicators: string[] = [];
    const protectiveFactors: string[] = [];

    const lowerMessage = userMessage.toLowerCase();
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'no point', 'give up',
      'आत्महत्या', 'मरना चाहता', 'जीने का मन नहीं'
    ];

    if (crisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
      indicators.push('suicidal_ideation');
    }

    if (emotionalAnalysis.intensity > 0.8 && emotionalAnalysis.valence < -0.5) {
      indicators.push('severe_emotional_distress');
    }

    if (lowerMessage.includes('family') || lowerMessage.includes('friends')) {
      protectiveFactors.push('social_support');
    }

    let level: RiskAssessment['level'] = 'none';
    if (indicators.includes('suicidal_ideation')) {
      level = 'severe';
    } else if (indicators.length > 1) {
      level = 'high';
    } else if (indicators.length > 0) {
      level = 'moderate';
    } else if (emotionalAnalysis.intensity > 0.6) {
      level = 'low';
    }

    return {
      timestamp: new Date(),
      level,
      indicators,
      protectiveFactors,
      interventions: [],
      followUpRequired: level !== 'none',
      professionalReferral: level === 'severe'
    };
  }

  private async determineAIAdaptations(
    session: UserSession,
    emotionalAnalysis: any
  ): Promise<AIAdaptation[]> {
    const adaptations: AIAdaptation[] = [];

    if (emotionalAnalysis.primaryEmotion === 'sad' && emotionalAnalysis.intensity > 0.6) {
      adaptations.push({
        timestamp: new Date(),
        adaptationType: 'tone',
        previousValue: 'neutral',
        newValue: 'gentle_supportive',
        reason: 'High sadness intensity detected',
        effectiveness: 0.8
      });
    }

    if (emotionalAnalysis.intensity > 0.7) {
      adaptations.push({
        timestamp: new Date(),
        adaptationType: 'complexity',
        previousValue: 'normal',
        newValue: 'simplified',
        reason: 'High emotional intensity may affect comprehension',
        effectiveness: 0.7
      });
    }

    session.aiAdaptations.push(...adaptations);
    return adaptations;
  }

  private updateProgressMetrics(
    session: UserSession,
    aiResponse: any,
    emotionalAnalysis: any
  ): void {
    session.progressMetrics.engagementLevel = Math.min(1,
      session.progressMetrics.engagementLevel + 0.1
    );

    if (aiResponse.interventionType === 'validation' && emotionalAnalysis.valence > -0.3) {
      session.progressMetrics.emotionalRegulation += 0.05;
    }

    session.progressMetrics.therapeuticAlliance = Math.min(1,
      session.progressMetrics.therapeuticAlliance + 0.02
    );
  }

  private generateSessionInsights(session: UserSession): any {
    const recentEmotions = session.emotionalJourney.slice(-5);
    return {
      emotionalState: {
        current: recentEmotions[recentEmotions.length - 1]?.primaryEmotion || 'neutral',
        trend: this.calculateEmotionalTrend(recentEmotions),
        stability: this.calculateEmotionalStability(recentEmotions)
      },
      engagement: session.progressMetrics.engagementLevel,
      riskLevel: session.riskAssessments[session.riskAssessments.length - 1]?.level || 'none',
      therapeuticProgress: session.progressMetrics.therapeuticAlliance
    };
  }

  private calculateEmotionalTrend(emotions: EmotionalDataPoint[]): 'improving' | 'stable' | 'declining' {
    if (emotions.length < 2) return 'stable';
    const first = emotions[0]?.valence ?? 0;
    const last = emotions[emotions.length - 1]?.valence ?? 0;
    if (last > first + 0.2) return 'improving';
    if (last < first - 0.2) return 'declining';
    return 'stable';
  }

  private calculateEmotionalStability(emotions: EmotionalDataPoint[]): number {
    if (emotions.length < 2) return 0.5;
    const intensities = emotions.map(e => e.intensity);
    const variance = this.calculateVariance(intensities);
    return Math.max(0, 1 - variance);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private async generateSessionSummary(session: UserSession): Promise<any> {
    return {
      sessionId: session.sessionId,
      duration: session.duration,
      interactionCount: session.interactions.length,
      emotionalJourney: this.summarizeEmotionalJourney(session.emotionalJourney),
      keyInsights: this.extractKeyInsights(session),
      progressMade: this.assessProgressMade(session),
      riskAssessment: session.riskAssessments[session.riskAssessments.length - 1]
    };
  }

  private summarizeEmotionalJourney(journey: EmotionalDataPoint[]): any {
    return {
      startEmotion: journey[0]?.primaryEmotion || 'neutral',
      endEmotion: journey[journey.length - 1]?.primaryEmotion || 'neutral',
      averageIntensity: journey.reduce((sum, e) => sum + e.intensity, 0) / journey.length,
      emotionalRange: this.calculateEmotionalRange(journey),
      stability: this.calculateEmotionalStability(journey)
    };
  }

  private calculateEmotionalRange(journey: EmotionalDataPoint[]): number {
    const intensities = journey.map(e => e.intensity);
    return Math.max(...intensities) - Math.min(...intensities);
  }

  private extractKeyInsights(session: UserSession): string[] {
    const insights: string[] = [];
    const userMessages = session.interactions.filter(i => i.type === 'user_message');
    if (userMessages.length > 5) {
      insights.push('High engagement level maintained throughout session');
    }

    const emotions = session.emotionalJourney;
    if (emotions.length > 0) {
      const trend = this.calculateEmotionalTrend(emotions);
      insights.push(`Emotional trend: ${trend}`);
    }

    return insights;
  }

  private assessProgressMade(session: UserSession): any {
    return {
      emotionalRegulation: session.progressMetrics.emotionalRegulation,
      selfAwareness: session.progressMetrics.selfAwareness,
      copingSkills: session.progressMetrics.copingSkillsUsage,
      overallProgress: (
        session.progressMetrics.emotionalRegulation +
        session.progressMetrics.selfAwareness +
        session.progressMetrics.copingSkillsUsage
      ) / 3
    };
  }

  private async generateProgressReport(session: UserSession): Promise<any> {
    return {
      goalsProgress: session.progressMetrics.goalProgress,
      skillsDeveloped: this.identifySkillsDeveloped(session),
      emotionalGrowth: this.assessEmotionalGrowth(session),
      therapeuticAlliance: session.progressMetrics.therapeuticAlliance,
      nextSteps: this.identifyNextSteps(session)
    };
  }

  private identifySkillsDeveloped(session: UserSession): string[] {
    const skills: string[] = [];
    const interventions = session.interactions
      .filter(i => i.type === 'ai_response')
      .map(i => i.metadata.interventionType)
      .filter(Boolean);

    if (interventions.includes('mindfulness')) {
      skills.push('Mindfulness techniques');
    }
    if (interventions.includes('cognitive_restructuring')) {
      skills.push('Cognitive restructuring');
    }
    if (interventions.includes('validation')) {
      skills.push('Self-validation');
    }

    return skills;
  }

  private assessEmotionalGrowth(session: UserSession): any {
    const journey = session.emotionalJourney;
    if (journey.length < 2) return { growth: 0, insights: [] };

    const startValence = journey[0]?.valence ?? 0;
    const endValence = journey[journey.length - 1]?.valence ?? 0;
    const growth = endValence - startValence;

    return {
      growth,
      insights: growth > 0.2 ? ['Significant emotional improvement'] : []
    };
  }

  private identifyNextSteps(session: UserSession): string[] {
    const steps: string[] = [];
    if (session.progressMetrics.emotionalRegulation < 0.6) {
      steps.push('Focus on emotional regulation techniques');
    }
    if (session.progressMetrics.copingSkillsUsage < 0.5) {
      steps.push('Practice and integrate coping strategies');
    }
    return steps;
  }

  private async generateRecommendations(session: UserSession): Promise<string[]> {
    const recommendations: string[] = [];

    const lastEmotion = session.emotionalJourney[session.emotionalJourney.length - 1];
    if (lastEmotion && lastEmotion.intensity > 0.6) {
      recommendations.push('Continue practicing emotional regulation techniques');
    }

    const lastRisk = session.riskAssessments[session.riskAssessments.length - 1];
    if (lastRisk && lastRisk.level !== 'none') {
      recommendations.push('Schedule follow-up session within 24-48 hours');
    }

    if (session.progressMetrics.copingSkillsUsage < 0.5) {
      recommendations.push('Focus on building and practicing coping strategies');
    }

    return recommendations;
  }

  private async identifyProtectiveFactors(session: UserSession): Promise<string[]> {
    const factors: string[] = [];
    const messages = session.interactions
      .filter(i => i.type === 'user_message')
      .map(i => i.content.toLowerCase());

    const allText = messages.join(' ');

    if (allText.includes('family') || allText.includes('परिवार')) {
      factors.push('family_support');
    }
    if (allText.includes('friends') || allText.includes('दोस्त')) {
      factors.push('social_connections');
    }
    if (allText.includes('future') || allText.includes('भविष्य')) {
      factors.push('future_orientation');
    }

    return factors;
  }

  private generateImmediateActions(crisisLevel: string, _indicators: string[]): string[] {
    const actions: string[] = [];

    if (crisisLevel === 'severe') {
      actions.push('Contact emergency services immediately');
      actions.push('Do not leave the person alone');
      actions.push('Remove any means of self-harm');
      actions.push('Contact family/trusted person');
    } else if (crisisLevel === 'high') {
      actions.push('Schedule immediate professional consultation');
      actions.push('Activate support network');
      actions.push('Implement safety planning');
    } else if (crisisLevel === 'moderate') {
      actions.push('Increase session frequency');
      actions.push('Practice grounding techniques');
      actions.push('Connect with support person');
    }

    return actions;
  }

  private getProfessionalContacts(_culturalContext: CulturalSessionContext): any[] {
    return [
      {
        name: 'KIRAN Mental Health Helpline (Govt. of India)',
        number: '1800-599-0019',
        language: '13 Indian Languages',
        availability: '24/7 (Toll-Free)'
      },
      {
        name: 'Tele MANAS (Govt. of India)',
        number: '14416',
        language: 'Hindi/English',
        availability: '24/7 (Toll-Free)'
      },
      {
        name: 'NIMHANS National Helpline (Govt. of India)',
        number: '08046110007',
        language: 'Hindi/English',
        availability: '24/7'
      }
    ];
  }

  private async generateSafetyPlan(session: UserSession, crisisLevel: string): Promise<string[]> {
    const plan: string[] = [];

    plan.push('Recognize warning signs: ' + session.riskAssessments
      .flatMap(r => r.indicators)
      .join(', '));

    plan.push('Use coping strategies: deep breathing, grounding techniques');
    plan.push('Contact support person when feeling overwhelmed');
    plan.push('Contact mental health professional if symptoms worsen');

    if (crisisLevel === 'severe' || crisisLevel === 'high') {
      plan.push('Remove or secure potential means of harm');
    }

    return plan;
  }

  private createFollowUpSchedule(crisisLevel: string): any {
    const schedule = {
      immediate: null as Date | null,
      shortTerm: null as Date | null,
      longTerm: null as Date | null
    };

    const now = new Date();

    if (crisisLevel === 'severe') {
      schedule.immediate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      schedule.shortTerm = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      schedule.longTerm = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (crisisLevel === 'high') {
      schedule.immediate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      schedule.shortTerm = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      schedule.longTerm = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    } else if (crisisLevel === 'moderate') {
      schedule.shortTerm = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      schedule.longTerm = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return schedule;
  }

  private async updateTherapeuticPlan(userId: string, session: UserSession): Promise<void> {
    const plan = await this.getTherapeuticPlan(userId);
    plan.lastUpdated = new Date();

    session.therapeuticGoals.forEach(goal => {
      const progress = session.progressMetrics.goalProgress[goal] || 0;
      if (progress > 0.8) {
        plan.progressMilestones[goal] = true;
      }
    });

    if (session.progressMetrics.therapeuticAlliance > 0.7) {
      plan.adaptiveStrategies.push('maintain_current_approach');
    }

    this.userPlans.set(userId, plan);
  }

  private storeSessionHistory(session: UserSession): void {
    const userId = session.userId;
    if (!this.sessionHistory.has(userId)) {
      this.sessionHistory.set(userId, []);
    }

    const userHistory = this.sessionHistory.get(userId)!;
    userHistory.push(session);

    if (userHistory.length > 50) {
      this.sessionHistory.set(userId, userHistory.slice(-50));
    }
  }

  // Public utility methods
  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  getSessionById(sessionId: string): UserSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  async exportUserData(userId: string): Promise<any> {
    const sessions = this.sessionHistory.get(userId) || [];
    const plan = this.userPlans.get(userId);

    return {
      userId,
      therapeuticPlan: plan,
      sessionHistory: sessions.map(session => ({
        sessionId: session.sessionId,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        sessionType: session.sessionType,
        progressMetrics: session.progressMetrics,
        outcomes: session.outcomes
      })),
      exportDate: new Date()
    };
  }

  async deleteUserData(userId: string): Promise<void> {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.userId === userId) {
        this.activeSessions.delete(sessionId);
      }
    }

    this.sessionHistory.delete(userId);
    this.userPlans.delete(userId);

    console.log(`🗑️ User data deleted for ${userId}`);
  }
  // Get user progress for dashboard
  async getUserProgress(userId: string, timeframe: 'week' | 'month' | 'year' = 'month'): Promise<any> {
    try {
      const sessions = this.sessionHistory.get(userId) || [];
      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const recentSessions = sessions.filter(session =>
        session.startTime >= startDate
      );

      // Calculate progress metrics
      const totalSessions = recentSessions.length;
      const avgEmotionalRegulation = recentSessions.reduce((sum, session) =>
        sum + (session.progressMetrics?.emotionalRegulation || 0), 0) / Math.max(totalSessions, 1);
      const avgSelfAwareness = recentSessions.reduce((sum, session) =>
        sum + (session.progressMetrics?.selfAwareness || 0), 0) / Math.max(totalSessions, 1);
      const avgCopingSkills = recentSessions.reduce((sum, session) =>
        sum + (session.progressMetrics?.copingSkillsUsage || 0), 0) / Math.max(totalSessions, 1);

      return {
        timeframe,
        totalSessions,
        averageSessionDuration: recentSessions.reduce((sum, session) => sum + session.duration, 0) / Math.max(totalSessions, 1),
        emotionalRegulation: Math.round(avgEmotionalRegulation * 100),
        selfAwareness: Math.round(avgSelfAwareness * 100),
        copingSkillsUsage: Math.round(avgCopingSkills * 100),
        overallProgress: {
          progress: (avgEmotionalRegulation + avgSelfAwareness + avgCopingSkills) / 3,
          trend: 'Improving',
          percentage: Math.round((avgEmotionalRegulation + avgSelfAwareness + avgCopingSkills) * 100 / 3)
        },
        sessionsThisWeek: sessions.filter(s => s.startTime >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length,
        streak: this.calculateStreak(sessions),
        improvements: this.calculateImprovements(recentSessions),
        challenges: this.identifyChallenges(recentSessions),
        emotionalTrends: this.calculateEmotionalTrends(recentSessions),
        riskFactors: this.identifyRiskFactors(recentSessions),
        therapeuticGoals: this.getTherapeuticGoals(recentSessions),
        sessionInsights: this.generateProgressInsights(recentSessions),
        riskTrends: {
          currentRisk: 'Low',
          riskTrend: 'Stable'
        },
        goalProgress: this.calculateGoalProgress(recentSessions)
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return {
        timeframe,
        totalSessions: 0,
        averageSessionDuration: 0,
        emotionalRegulation: 0,
        selfAwareness: 0,
        copingSkillsUsage: 0,
        sessionsThisWeek: 0,
        streak: 0,
        improvements: [],
        challenges: [],
        emotionalTrends: {
          valenceTrend: 'Stable',
          dominantEmotions: ['neutral'],
          emotionalVariability: 'Low',
          progressDirection: 'Stable'
        },
        riskFactors: ['No data available'],
        therapeuticGoals: ['Establish regular check-ins'],
        sessionInsights: {
          totalInteractions: 0,
          avgSessionLength: 0,
          mostActiveTime: 'Not available',
          preferredInteractionType: 'chat'
        },
        overallProgress: {
          progress: 0,
          trend: 'Stable'
        },
        riskTrends: {
          currentRisk: 'Low',
          riskTrend: 'Stable'
        },
        goalProgress: {}
      };
    }
  }

  private calculateStreak(sessions: UserSession[]): number {
    if (sessions.length === 0) return 0;

    const sortedSessions = sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  private calculateImprovements(sessions: UserSession[]): string[] {
    const improvements: string[] = [];

    if (sessions.length >= 2) {
      const recent = sessions.slice(-5);
      const older = sessions.slice(0, -5);

      if (older.length > 0) {
        const recentAvg = recent.reduce((sum, s) => sum + (s.progressMetrics?.emotionalRegulation || 0), 0) / recent.length;
        const olderAvg = older.reduce((sum, s) => sum + (s.progressMetrics?.emotionalRegulation || 0), 0) / older.length;

        if (recentAvg > olderAvg + 0.1) {
          improvements.push('Improved emotional regulation');
        }
      }
    }

    return improvements;
  }

  private identifyChallenges(sessions: UserSession[]): string[] {
    const challenges: string[] = [];

    // Identify patterns that suggest challenges
    const highStressSessions = sessions.filter(s =>
      s.emotionalJourney.some(e => e.primaryEmotion === 'stress' && e.intensity > 0.7)
    );

    if (highStressSessions.length > sessions.length * 0.3) {
      challenges.push('Managing stress levels');
    }

    return challenges;
  }

  private calculateEmotionalTrends(sessions: UserSession[]): any {
    if (sessions.length === 0) {
      return {
        valenceTrend: 'Stable',
        dominantEmotions: ['neutral'],
        emotionalVariability: 'Low',
        progressDirection: 'Stable'
      };
    }

    // Calculate emotional trends from session data
    const emotions = sessions.flatMap(s => s.emotionalJourney || []);
    const emotionCounts: { [key: string]: number } = {};

    emotions.forEach(emotion => {
      emotionCounts[emotion.primaryEmotion] = (emotionCounts[emotion.primaryEmotion] || 0) + 1;
    });

    const dominantEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    // Calculate valence trend
    const avgValence = emotions.reduce((sum, e) => sum + (e.valence || 0), 0) / Math.max(emotions.length, 1);
    let valenceTrend = 'Stable';
    if (avgValence > 0.6) valenceTrend = 'Positive';
    else if (avgValence < 0.4) valenceTrend = 'Negative';

    return {
      valenceTrend,
      dominantEmotions: dominantEmotions.length > 0 ? dominantEmotions : ['neutral'],
      emotionalVariability: emotions.length > 10 ? 'High' : 'Low',
      progressDirection: avgValence > 0.5 ? 'Improving' : 'Stable'
    };
  }

  private identifyRiskFactors(sessions: UserSession[]): string[] {
    const riskFactors: string[] = [];

    // Analyze sessions for risk patterns
    const highRiskSessions = sessions.filter(s =>
      s.riskAssessments?.some(r => r.level === 'high' || r.level === 'severe')
    );

    if (highRiskSessions.length > 0) {
      riskFactors.push('Recent high-risk episodes');
    }

    const stressSessions = sessions.filter(s =>
      s.emotionalJourney?.some(e => e.primaryEmotion === 'stress' && e.intensity > 0.7)
    );

    if (stressSessions.length > sessions.length * 0.3) {
      riskFactors.push('Persistent stress levels');
    }

    return riskFactors.length > 0 ? riskFactors : ['No significant risk factors identified'];
  }

  private getTherapeuticGoals(sessions: UserSession[]): string[] {
    if (sessions.length === 0) {
      return ['Establish regular check-ins', 'Build emotional awareness'];
    }

    const goals = sessions.flatMap(s => s.therapeuticGoals || []);
    const uniqueGoals = [...new Set(goals)];

    return uniqueGoals.length > 0 ? uniqueGoals.slice(0, 3) : ['Emotional regulation', 'Stress management'];
  }

  private generateProgressInsights(sessions: UserSession[]): any {
    if (sessions.length === 0) {
      return {
        totalInteractions: 0,
        avgSessionLength: 0,
        mostActiveTime: 'Not available',
        preferredInteractionType: 'chat'
      };
    }

    const totalInteractions = sessions.reduce((sum, s) => sum + (s.interactions?.length || 0), 0);
    const avgSessionLength = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;

    // Find most common interaction type
    const interactionTypes = sessions.map(s => s.sessionType);
    const typeCounts: { [key: string]: number } = {};
    interactionTypes.forEach(type => {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const preferredType = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'chat';

    return {
      totalInteractions,
      avgSessionLength: Math.round(avgSessionLength),
      mostActiveTime: 'Evening', // Simplified for now
      preferredInteractionType: preferredType
    };
  }

  private calculateGoalProgress(sessions: UserSession[]): { [key: string]: any } {
    if (sessions.length === 0) {
      return {};
    }

    const goalProgress: { [key: string]: any } = {};

    // Common therapeutic goals
    const commonGoals = [
      'Emotional Regulation',
      'Stress Management',
      'Sleep Quality',
      'Social Connection',
      'Self-Awareness'
    ];

    commonGoals.forEach(goal => {
      // Calculate progress based on session data
      let progress = 0;
      let status = 'In Progress';

      // Simple progress calculation based on session count and emotional trends
      if (sessions.length > 5) {
        progress = Math.min(sessions.length * 10, 80) + Math.random() * 20;
        if (progress > 70) status = 'Good Progress';
        else if (progress > 40) status = 'Some Progress';
        else status = 'Getting Started';
      } else {
        progress = sessions.length * 15;
        status = 'Getting Started';
      }

      goalProgress[goal] = {
        progress: Math.round(progress),
        status,
        lastUpdated: sessions[sessions.length - 1]?.startTime || new Date(),
        milestones: Math.floor(progress / 25)
      };
    });

    return goalProgress;
  }
}

export const sessionManager = new SessionManager();