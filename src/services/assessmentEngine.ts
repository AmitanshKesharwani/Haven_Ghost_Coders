// Basic Assessment Engine - Task 4.1 Implementation
export type AssessmentType = 'phq9' | 'gad7' | 'indian_stress' | 'cultural_pressure' | 'family_dynamics';

export interface AssessmentQuestion {
  id: string;
  type: 'conversational' | 'scale' | 'choice' | 'open_ended';
  originalText: string;
  conversationalPrompt: string;
  culturalAdaptations: Record<string, string>;
  followUpQuestions: string[];
  scoringWeight: number;
  category: string;
}

export interface AssessmentResponse {
  questionId: string;
  userResponse: string;
  extractedScore: number;
  emotionalTone: string;
  culturalContext: string[];
  followUpNeeded: boolean;
}

export interface AssessmentResult {
  assessmentType: AssessmentType;
  totalScore: number;
  categoryScores: Record<string, number>;
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  culturalFactors: string[];
  recommendations: AssessmentRecommendation[];
  insights: string[];
  nextSteps: string[];
}

export interface AssessmentRecommendation {
  type: 'activity' | 'professional_help' | 'family_support' | 'crisis_intervention';
  priority: 'immediate' | 'high' | 'medium' | 'low';
  description: string;
  culturalConsiderations: string[];
}

export interface SimpleUserProfile {
  uid: string;
  age: number;
  location: string;
  culturalBackground?: any;
}

export interface SimpleAssessmentSession {
  sessionId: string;
  userId: string;
  assessmentType: AssessmentType;
  currentStep: number;
  totalSteps: number;
  status: 'active' | 'completed';
  responses: AssessmentResponse[];
  startTime: Date;
  culturalAdaptations: any[];
}

export class ConversationalAssessmentEngine {
  private assessmentQuestions: Map<AssessmentType, AssessmentQuestion[]>;

  constructor() {
    this.assessmentQuestions = new Map();
    this.initializeAssessmentQuestions();
  }

  private initializeAssessmentQuestions(): void {
    // PHQ-9 Conversational Questions
    const phq9Questions: AssessmentQuestion[] = [
      {
        id: 'phq9_1',
        type: 'conversational',
        originalText: 'Little interest or pleasure in doing things',
        conversationalPrompt: 'I\'d like to understand how you\'ve been feeling lately. Tell me, have there been activities or things you usually enjoy that don\'t seem as interesting or fun anymore?',
        culturalAdaptations: {
          'hindi': 'मैं समझना चाहता हूं कि आप कैसा महसूस कर रहे हैं। क्या कोई ऐसी चीजें हैं जो आपको पहले अच्छी लगती थीं लेकिन अब दिलचस्प नहीं लगतीं?',
          'family_focused': 'Sometimes when we\'re going through tough times, even spending time with family or doing things we used to love doesn\'t feel the same. Has this been happening with you?'
        },
        followUpQuestions: [
          'Can you tell me about a specific activity that used to bring you joy?',
          'When did you first notice this change?',
          'How does this affect your daily routine?'
        ],
        scoringWeight: 1,
        category: 'anhedonia'
      },
      {
        id: 'phq9_2',
        type: 'conversational',
        originalText: 'Feeling down, depressed, or hopeless',
        conversationalPrompt: 'Life can feel heavy sometimes. I\'m wondering if you\'ve been experiencing feelings of sadness, feeling low, or like things might not get better?',
        culturalAdaptations: {
          'hindi': 'कभी-कभी जिंदगी भारी लग सकती है। क्या आप उदास महसूस कर रहे हैं या लगता है कि चीजें बेहतर नहीं होंगी?',
          'family_focused': 'Sometimes the pressure to meet family expectations can make us feel overwhelmed or sad. Have you been feeling this way?'
        },
        followUpQuestions: [
          'How would you describe this feeling to someone close to you?',
          'Are there particular times of day when this feeling is stronger?',
          'What thoughts go through your mind during these moments?'
        ],
        scoringWeight: 1,
        category: 'mood'
      }
    ];

    // GAD-7 Conversational Questions
    const gad7Questions: AssessmentQuestion[] = [
      {
        id: 'gad7_1',
        type: 'conversational',
        originalText: 'Feeling nervous, anxious, or on edge',
        conversationalPrompt: 'Anxiety can show up in different ways for different people. Have you been feeling nervous, restless, or like you\'re constantly on edge lately?',
        culturalAdaptations: {
          'hindi': 'चिंता अलग-अलग लोगों में अलग तरीकों से दिखती है। क्या आप घबराहट या बेचैनी महसूस कर रहे हैं?',
          'academic_focused': 'With all the academic and career pressures we face, it\'s common to feel anxious. Have you been experiencing this kind of nervousness?'
        },
        followUpQuestions: [
          'What situations tend to make you feel most anxious?',
          'How does this anxiety show up in your body?',
          'When did you first start noticing these feelings?'
        ],
        scoringWeight: 1,
        category: 'anxiety'
      }
    ];

    // Indian-Specific Stress Assessment
    const indianStressQuestions: AssessmentQuestion[] = [
      {
        id: 'indian_stress_1',
        type: 'conversational',
        originalText: 'Academic and career pressure stress',
        conversationalPrompt: 'In our culture, there\'s often a lot of emphasis on academic achievement and career success. How are you handling the pressure around your studies or career path?',
        culturalAdaptations: {
          'hindi': 'हमारी संस्कृति में शिक्षा और करियर पर बहुत जोर दिया जाता है। आप इस दबाव को कैसे संभाल रहे हैं?',
          'parent_focused': 'I understand that parents often have high expectations. How are you managing the pressure to succeed academically or professionally?'
        },
        followUpQuestions: [
          'What specific expectations feel most challenging?',
          'How do you feel when you think about your future career?',
          'What would happen if you didn\'t meet these expectations?'
        ],
        scoringWeight: 1.5,
        category: 'academic_pressure'
      }
    ];

    this.assessmentQuestions.set('phq9', phq9Questions);
    this.assessmentQuestions.set('gad7', gad7Questions);
    this.assessmentQuestions.set('indian_stress', indianStressQuestions);
  }

  async startAssessment(
    assessmentType: AssessmentType,
    userProfile: SimpleUserProfile
  ): Promise<SimpleAssessmentSession> {
    const questions = this.assessmentQuestions.get(assessmentType) || [];

    const session: SimpleAssessmentSession = {
      sessionId: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userProfile.uid,
      assessmentType,
      currentStep: 0,
      totalSteps: questions.length,
      status: 'active',
      responses: [],
      startTime: new Date(),
      culturalAdaptations: this.generateCulturalAdaptations(userProfile)
    };

    return session;
  }

  async processAssessmentResponse(
    sessionId: string,
    userResponse: string,
    session: SimpleAssessmentSession
  ): Promise<{ aiResponse: string; nextQuestion?: AssessmentQuestion; isComplete: boolean }> {
    const questions = this.assessmentQuestions.get(session.assessmentType) || [];
    const currentQuestion = questions[session.currentStep];

    if (!currentQuestion) {
      return { aiResponse: 'Assessment completed', isComplete: true };
    }

    // Extract score from conversational response
    const assessmentResponse = await this.extractScoreFromResponse(
      userResponse,
      currentQuestion,
      session.culturalAdaptations
    );

    // Store response
    session.responses.push(assessmentResponse);

    // Generate acknowledgment
    const acknowledgment = this.generateAcknowledgment(assessmentResponse);

    // Move to next question
    session.currentStep++;
    const isComplete = session.currentStep >= questions.length;

    if (isComplete) {
      const result = await this.generateAssessmentResult(session);
      session.status = 'completed';
      
      const completionMessage = this.generateCompletionMessage(result);
      return { aiResponse: `${acknowledgment}\n\n${completionMessage}`, isComplete: true };
    }

    const nextQuestion = questions[session.currentStep];
    if (nextQuestion) {
      const nextQuestionPrompt = this.adaptQuestionForUser(nextQuestion, session.culturalAdaptations);
      return {
        aiResponse: `${acknowledgment}\n\n${nextQuestionPrompt}`,
        nextQuestion,
        isComplete: false
      };
    }

    return { aiResponse: acknowledgment, isComplete: true };
  }

  protected async extractScoreFromResponse(
    response: string,
    question: AssessmentQuestion,
    culturalAdaptations: any[]
  ): Promise<AssessmentResponse> {
    // Simple scoring logic - in real implementation this would use AI
    let score = 1; // Default moderate score
    
    const responseText = response.toLowerCase();
    
    // High distress indicators
    if (responseText.includes('very') || responseText.includes('extremely') || 
        responseText.includes('always') || responseText.includes('constantly')) {
      score = 3;
    }
    // Low distress indicators
    else if (responseText.includes('not really') || responseText.includes('rarely') || 
             responseText.includes('never') || responseText.includes('fine')) {
      score = 0;
    }
    // Moderate indicators
    else if (responseText.includes('sometimes') || responseText.includes('often')) {
      score = 2;
    }

    return {
      questionId: question.id,
      userResponse: response,
      extractedScore: score,
      emotionalTone: this.detectEmotionalTone(response),
      culturalContext: this.extractCulturalContext(response),
      followUpNeeded: score >= 2
    };
  }

  private detectEmotionalTone(response: string): string {
    const responseText = response.toLowerCase();
    
    if (responseText.includes('sad') || responseText.includes('depressed') || 
        responseText.includes('hopeless')) {
      return 'sad';
    } else if (responseText.includes('anxious') || responseText.includes('worried') || 
               responseText.includes('nervous')) {
      return 'anxious';
    } else if (responseText.includes('angry') || responseText.includes('frustrated')) {
      return 'angry';
    } else if (responseText.includes('happy') || responseText.includes('good') || 
               responseText.includes('fine')) {
      return 'positive';
    }
    
    return 'neutral';
  }

  private extractCulturalContext(response: string): string[] {
    const context: string[] = [];
    const responseText = response.toLowerCase();
    
    if (responseText.includes('family') || responseText.includes('parents')) {
      context.push('family_dynamics');
    }
    if (responseText.includes('study') || responseText.includes('exam') || 
        responseText.includes('career')) {
      context.push('academic_pressure');
    }
    if (responseText.includes('marriage') || responseText.includes('relationship')) {
      context.push('relationship_pressure');
    }
    
    return context;
  }

  private generateAcknowledgment(response: AssessmentResponse): string {
    const acknowledgments = {
      low_concern: [
        "Thank you for sharing that with me.",
        "I appreciate your openness.",
        "That gives me a good understanding."
      ],
      moderate_concern: [
        "I hear you, and I want you to know that what you're experiencing is valid.",
        "Thank you for trusting me with this. Many people go through similar challenges.",
        "I understand this must be difficult for you."
      ],
      high_concern: [
        "I'm really glad you felt comfortable sharing this with me. It takes courage.",
        "What you're going through sounds really challenging, and I want to help.",
        "Thank you for being so honest. You're not alone in feeling this way."
      ]
    };

    const concernLevel = response.extractedScore >= 2 ? 'high_concern' : 
                        response.extractedScore >= 1 ? 'moderate_concern' : 'low_concern';

    const options = acknowledgments[concernLevel];
    return options[Math.floor(Math.random() * options.length)];
  }

  private adaptQuestionForUser(
    question: AssessmentQuestion,
    culturalAdaptations: any[]
  ): string {
    // Simple adaptation - in real implementation this would be more sophisticated
    const hasHindiPreference = culturalAdaptations.some(a => a.language === 'hindi');
    const hasFamilyFocus = culturalAdaptations.some(a => a.focus === 'family');

    if (hasHindiPreference && question.culturalAdaptations['hindi']) {
      return question.culturalAdaptations['hindi'];
    } else if (hasFamilyFocus && question.culturalAdaptations['family_focused']) {
      return question.culturalAdaptations['family_focused'];
    } else {
      return question.conversationalPrompt;
    }
  }

  private async generateAssessmentResult(session: SimpleAssessmentSession): Promise<AssessmentResult> {
    const responses = session.responses;
    const totalScore = responses.reduce((sum, response) => sum + response.extractedScore, 0);
    
    // Calculate category scores
    const categoryScores: Record<string, number> = {};
    const questions = this.assessmentQuestions.get(session.assessmentType) || [];
    
    questions.forEach((question, index) => {
      const response = responses[index];
      if (response && question.category) {
        categoryScores[question.category] = (categoryScores[question.category] || 0) + response.extractedScore;
      }
    });

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(totalScore, session.assessmentType);

    // Generate recommendations
    const recommendations = this.generateRecommendations(totalScore, categoryScores, riskLevel);

    // Generate insights
    const insights = this.generateInsights(responses, categoryScores);

    return {
      assessmentType: session.assessmentType,
      totalScore,
      categoryScores,
      riskLevel,
      culturalFactors: this.extractCulturalFactors(responses),
      recommendations,
      insights,
      nextSteps: this.generateNextSteps(riskLevel, recommendations)
    };
  }

  private calculateRiskLevel(score: number, assessmentType: AssessmentType): 'low' | 'moderate' | 'high' | 'severe' {
    const thresholds = {
      phq9: { moderate: 5, high: 10, severe: 15 },
      gad7: { moderate: 5, high: 10, severe: 15 },
      indian_stress: { moderate: 6, high: 12, severe: 18 },
      cultural_pressure: { moderate: 6, high: 12, severe: 18 },
      family_dynamics: { moderate: 5, high: 10, severe: 15 }
    };

    const threshold = thresholds[assessmentType];

    if (score >= threshold.severe) return 'severe';
    if (score >= threshold.high) return 'high';
    if (score >= threshold.moderate) return 'moderate';
    return 'low';
  }

  private generateRecommendations(
    totalScore: number,
    categoryScores: Record<string, number>,
    riskLevel: string
  ): AssessmentRecommendation[] {
    const recommendations: AssessmentRecommendation[] = [];

    // Risk-based recommendations
    if (riskLevel === 'severe' || riskLevel === 'high') {
      recommendations.push({
        type: 'professional_help',
        priority: 'immediate',
        description: 'Consider speaking with a mental health professional for additional support',
        culturalConsiderations: ['Family involvement may be helpful', 'Look for culturally-sensitive therapists']
      });
    }

    // Category-specific recommendations
    if ((categoryScores.anxiety || 0) >= 3) {
      recommendations.push({
        type: 'activity',
        priority: 'high',
        description: 'Try anxiety management activities like breathing exercises and mindfulness',
        culturalConsiderations: ['Include traditional practices like pranayama', 'Consider family meditation sessions']
      });
    }

    if ((categoryScores.academic_pressure || 0) >= 3) {
      recommendations.push({
        type: 'family_support',
        priority: 'high',
        description: 'Family therapy activities to improve communication about academic expectations',
        culturalConsiderations: ['Respect for elder perspectives', 'Gradual introduction of mental health concepts']
      });
    }

    return recommendations;
  }

  private generateInsights(
    responses: AssessmentResponse[],
    categoryScores: Record<string, number>
  ): string[] {
    const insights: string[] = [];

    // Pattern-based insights
    const highestCategory = Object.entries(categoryScores).reduce((a, b) => a[1] > b[1] ? a : b);
    if (highestCategory[1] >= 3) {
      insights.push(`Your responses suggest that ${highestCategory[0].replace('_', ' ')} is a significant area of concern for you right now.`);
    }

    // Cultural insights
    const culturalFactors = responses.filter(r => r.culturalContext && r.culturalContext.length > 0);
    if (culturalFactors.length > 0) {
      insights.push('Your cultural background and family dynamics play an important role in your current experiences.');
    }

    // Strength-based insights
    const lowScoreCategories = Object.entries(categoryScores).filter(([_, score]) => score <= 1);
    if (lowScoreCategories.length > 0) {
      insights.push(`You show strength in areas like ${lowScoreCategories.map(([cat, _]) => cat.replace('_', ' ')).join(', ')}.`);
    }

    return insights;
  }

  private generateNextSteps(riskLevel: string, recommendations: AssessmentRecommendation[]): string[] {
    const nextSteps: string[] = [];

    if (riskLevel === 'severe') {
      nextSteps.push('Seek immediate professional support');
      nextSteps.push('Consider involving trusted family members');
    } else if (riskLevel === 'high') {
      nextSteps.push('Schedule a consultation with a mental health professional');
      nextSteps.push('Start with recommended therapeutic activities');
    } else if (riskLevel === 'moderate') {
      nextSteps.push('Begin with self-help activities and monitoring');
      nextSteps.push('Consider professional support if symptoms persist');
    } else {
      nextSteps.push('Continue with preventive mental health practices');
      nextSteps.push('Regular check-ins with yourself');
    }

    return nextSteps;
  }

  private extractCulturalFactors(responses: AssessmentResponse[]): string[] {
    const factors: string[] = [];
    
    responses.forEach(response => {
      if (response.culturalContext) {
        factors.push(...response.culturalContext);
      }
    });

    return Array.from(new Set(factors)); // Remove duplicates
  }

  private generateCulturalAdaptations(userProfile: SimpleUserProfile): any[] {
    const adaptations: any[] = [];
    
    if (userProfile.age <= 25) {
      adaptations.push({ focus: 'academic', type: 'student_focused' });
    }
    
    if (userProfile.location && (userProfile.location.includes('India') || userProfile.location.includes('indian'))) {
      adaptations.push({ focus: 'family', type: 'family_focused' });
    }

    return adaptations;
  }

  private generateCompletionMessage(result: AssessmentResult): string {
    const messages = {
      low: "Thank you for sharing so openly with me. Based on our conversation, it sounds like you're managing things quite well overall. I have some personalized activities that might help you continue building on your strengths.",
      moderate: "I really appreciate your honesty in our conversation. It sounds like you're dealing with some challenges that many young people face. The good news is that there are effective ways to address these concerns, and I'm here to help guide you.",
      high: "Thank you for trusting me with your experiences. I can see that you're going through a difficult time, and I want you to know that what you're feeling is valid and that help is available. Let's work together on some strategies that can provide relief.",
      severe: "I'm grateful that you felt safe enough to share these difficult experiences with me. What you're going through is serious, and I want to make sure you get the support you deserve. Along with some immediate coping strategies, I'd also recommend connecting with a professional who can provide additional support."
    };

    return messages[result.riskLevel];
  }
}