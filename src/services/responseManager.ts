// Personalized Therapy Memory System - Complete therapist-like personalization
// Remembers everything: conversations, emotions, preferences, progress, triggers

import { conversationMemory } from './conversationMemory';

export interface UserProfile {
  // Basic preferences
  responseLength: 'short' | 'normal' | 'detailed';
  addressStyle: 'casual' | 'respectful' | 'formal';
  communicationStyle: 'direct' | 'gentle' | 'encouraging' | 'analytical';

  // Remembered instructions and boundaries
  rememberedInstructions: string[];
  avoidTerms: string[];
  preferredTerms: string[];

  // Emotional patterns and history
  emotionalHistory: Array<{
    emotion: string;
    intensity: number;
    timestamp: Date;
    context: string;
  }>;

  // Conversation memory
  conversationHistory: Array<{
    userMessage: string;
    aiResponse: string;
    timestamp: Date;
    emotionalState: string;
    topics: string[];
  }>;

  // Personal insights and progress
  personalInsights: {
    mainConcerns: string[];
    triggers: string[];
    copingStrategies: string[];
    progressNotes: string[];
    strengths: string[];
    goals: string[];
  };

  // Therapy preferences
  therapyStyle: {
    preferredApproaches: string[]; // CBT, mindfulness, etc.
    sessionLength: 'brief' | 'standard' | 'extended';
    checkInFrequency: 'daily' | 'weekly' | 'as-needed';
  };

  // Session tracking
  sessionData: {
    totalSessions: number;
    lastSession: Date;
    currentStreak: number;
    moodTrends: Array<{ date: Date; mood: number; notes: string }>;
  };
}

export class PersonalizedTherapyManager {
  private static instance: PersonalizedTherapyManager;
  private userProfile: UserProfile = {
    responseLength: 'normal',
    addressStyle: 'respectful',
    communicationStyle: 'gentle',
    rememberedInstructions: [],
    avoidTerms: ['beta', 'yaar', 'dost'],
    preferredTerms: [],
    emotionalHistory: [],
    conversationHistory: [],
    personalInsights: {
      mainConcerns: [],
      triggers: [],
      copingStrategies: [],
      progressNotes: [],
      strengths: [],
      goals: []
    },
    therapyStyle: {
      preferredApproaches: [],
      sessionLength: 'standard',
      checkInFrequency: 'as-needed'
    },
    sessionData: {
      totalSessions: 0,
      lastSession: new Date(),
      currentStreak: 0,
      moodTrends: []
    }
  };

  static getInstance(): PersonalizedTherapyManager {
    if (!PersonalizedTherapyManager.instance) {
      PersonalizedTherapyManager.instance = new PersonalizedTherapyManager();
    }
    return PersonalizedTherapyManager.instance;
  }

  // Update any part of user profile
  updateProfile(updates: Partial<UserProfile>): void {
    this.userProfile = { ...this.userProfile, ...updates };
    console.log('Updated user profile:', this.userProfile);
  }

  getProfile(): UserProfile {
    return this.userProfile;
  }

  // Legacy method for compatibility
  getPreferences(): { responseLength: string; addressStyle: string; rememberedInstructions: string[] } {
    return {
      responseLength: this.userProfile.responseLength,
      addressStyle: this.userProfile.addressStyle,
      rememberedInstructions: this.userProfile.rememberedInstructions
    };
  }

  // Record a complete conversation exchange
  recordConversation(userMessage: string, aiResponse: string, emotionalState: string = 'neutral'): void {
    const topics = this.extractTopics(userMessage);
    const emotion = this.analyzeEmotion(userMessage);

    // Add to conversation history (legacy support)
    this.userProfile.conversationHistory.push({
      userMessage,
      aiResponse,
      timestamp: new Date(),
      emotionalState,
      topics
    });

    // Add to emotional history
    if (emotion.emotion !== 'neutral') {
      this.userProfile.emotionalHistory.push({
        emotion: emotion.emotion,
        intensity: emotion.intensity,
        timestamp: new Date(),
        context: userMessage.substring(0, 100)
      });
    }

    // Update insights based on conversation
    this.updateInsights(userMessage, topics, emotion);

    // Keep only last 50 conversations to prevent memory bloat
    if (this.userProfile.conversationHistory.length > 50) {
      this.userProfile.conversationHistory = this.userProfile.conversationHistory.slice(-50);
    }

    // Note: The new conversation memory system is now handled by the AI orchestrator
    // This method is kept for backward compatibility and preference tracking
  }

  // Process any AI response with full personalization
  processResponse(response: string, userMessage?: string): string {
    console.log("🔧 ResponseManager - Original response length:", response.length, "words:", response.split(/\s+/).length);
    let processedResponse = response;

    // Remove repetitive greetings and phrases
    processedResponse = this.removeRepetitiveContent(processedResponse);

    // Remove avoided terms
    this.userProfile.avoidTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      processedResponse = processedResponse.replace(regex, '');
    });

    // Remove Hindi phrases and cultural expressions
    processedResponse = processedResponse.replace(/sab theek ho jayega/gi, '');
    processedResponse = processedResponse.replace(/tension mat lo/gi, '');
    processedResponse = processedResponse.replace(/log kya kahenge/gi, '');

    // Clean up extra spaces
    processedResponse = processedResponse.replace(/\s+/g, ' ').trim();

    // Enforce response length
    const beforeLength = processedResponse.length;
    processedResponse = this.enforceLength(processedResponse);
    const afterLength = processedResponse.length;

    if (beforeLength !== afterLength) {
      console.log("⚠️ ResponseManager - Length enforcement applied:", beforeLength, "→", afterLength);
    }

    // Add personalization based on conversation history
    if (userMessage) {
      processedResponse = this.personalizeResponse(processedResponse, userMessage);
    }

    console.log("🔧 ResponseManager - Final response length:", processedResponse.length, "words:", processedResponse.split(/\s+/).length);
    return processedResponse;
  }

  private enforceLength(response: string): string {
    if (this.userProfile.responseLength === 'short') {
      // For short responses, limit to 2-3 sentences or 100 characters
      const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);

      if (sentences.length > 3) {
        return sentences.slice(0, 3).join('. ').trim() + '.';
      }

      if (response.length > 100) {
        // Find the last complete sentence within 100 characters
        const truncated = response.substring(0, 97);
        const lastPeriod = truncated.lastIndexOf('.');
        const lastExclamation = truncated.lastIndexOf('!');
        const lastQuestion = truncated.lastIndexOf('?');

        const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);

        if (lastSentenceEnd > 20) {
          return response.substring(0, lastSentenceEnd + 1);
        } else {
          return truncated + '...';
        }
      }
    } else if (this.userProfile.responseLength === 'detailed') {
      // For detailed responses, ensure they are comprehensive but not too long (100-300 words)
      const wordCount = response.split(/\s+/).length;
      if (wordCount < 100) {
        // If response is too short for detailed mode, add encouraging note
        return response + " I want to make sure I'm giving you the support you need. Could you tell me more about what's on your mind?";
      } else if (wordCount > 300) {
        // If response is too long, truncate to 300 words
        const words = response.split(/\s+/);
        return words.slice(0, 300).join(' ') + '...';
      }
    } else {
      // For normal responses, keep them therapeutic but not too long (100-250 words)
      const wordCount = response.split(/\s+/).length;
      if (wordCount > 250) {
        const words = response.split(/\s+/);
        return words.slice(0, 250).join(' ') + '...';
      }
    }

    return response;
  }

  // Extract topics from user message
  private extractTopics(message: string): string[] {
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Emotional topics
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxious')) topics.push('stress');
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) topics.push('depression');
    if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated')) topics.push('anger');
    if (lowerMessage.includes('lonely') || lowerMessage.includes('alone')) topics.push('loneliness');
    if (lowerMessage.includes('relationship') || lowerMessage.includes('friend')) topics.push('relationships');
    if (lowerMessage.includes('family') || lowerMessage.includes('parent')) topics.push('family');
    if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('career')) topics.push('career');
    if (lowerMessage.includes('study') || lowerMessage.includes('exam') || lowerMessage.includes('school')) topics.push('academics');
    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired')) topics.push('sleep');
    if (lowerMessage.includes('eat') || lowerMessage.includes('food')) topics.push('eating');

    return topics;
  }

  // Analyze emotional content
  private analyzeEmotion(message: string): { emotion: string; intensity: number } {
    const lowerMessage = message.toLowerCase();

    // Stress/Anxiety
    if (lowerMessage.includes('very stressed') || lowerMessage.includes('panic')) return { emotion: 'stress', intensity: 0.9 };
    if (lowerMessage.includes('stressed') || lowerMessage.includes('anxious')) return { emotion: 'stress', intensity: 0.6 };
    if (lowerMessage.includes('worried')) return { emotion: 'stress', intensity: 0.4 };

    // Sadness/Depression
    if (lowerMessage.includes('very sad') || lowerMessage.includes('hopeless')) return { emotion: 'sadness', intensity: 0.9 };
    if (lowerMessage.includes('sad') || lowerMessage.includes('down')) return { emotion: 'sadness', intensity: 0.6 };
    if (lowerMessage.includes('disappointed')) return { emotion: 'sadness', intensity: 0.4 };

    // Anger
    if (lowerMessage.includes('furious') || lowerMessage.includes('rage')) return { emotion: 'anger', intensity: 0.9 };
    if (lowerMessage.includes('angry') || lowerMessage.includes('mad')) return { emotion: 'anger', intensity: 0.6 };
    if (lowerMessage.includes('frustrated') || lowerMessage.includes('annoyed')) return { emotion: 'anger', intensity: 0.4 };

    // Happiness
    if (lowerMessage.includes('amazing') || lowerMessage.includes('fantastic')) return { emotion: 'happiness', intensity: 0.9 };
    if (lowerMessage.includes('happy') || lowerMessage.includes('good')) return { emotion: 'happiness', intensity: 0.6 };
    if (lowerMessage.includes('okay') || lowerMessage.includes('fine')) return { emotion: 'happiness', intensity: 0.3 };

    return { emotion: 'neutral', intensity: 0.0 };
  }

  // Update insights based on conversation
  private updateInsights(message: string, topics: string[], emotion: { emotion: string; intensity: number }): void {
    const lowerMessage = message.toLowerCase();

    // Update main concerns
    topics.forEach(topic => {
      if (!this.userProfile.personalInsights.mainConcerns.includes(topic)) {
        this.userProfile.personalInsights.mainConcerns.push(topic);
      }
    });

    // Detect triggers
    if (emotion.intensity > 0.7) {
      const trigger = `${emotion.emotion} triggered by: ${message.substring(0, 50)}`;
      if (!this.userProfile.personalInsights.triggers.some(t => t.includes(emotion.emotion))) {
        this.userProfile.personalInsights.triggers.push(trigger);
      }
    }

    // Detect coping strategies mentioned
    if (lowerMessage.includes('helped') || lowerMessage.includes('better')) {
      const strategy = `Mentioned helpful: ${message.substring(0, 50)}`;
      this.userProfile.personalInsights.copingStrategies.push(strategy);
    }

    // Detect strengths
    if (lowerMessage.includes('proud') || lowerMessage.includes('accomplished') || lowerMessage.includes('succeeded')) {
      const strength = `Strength shown: ${message.substring(0, 50)}`;
      this.userProfile.personalInsights.strengths.push(strength);
    }
  }

  // Remove repetitive content and greetings
  private removeRepetitiveContent(response: string): string {
    let cleanedResponse = response;

    // Remove common repetitive greetings
    const repetitiveGreetings = [
      /^Hello!?\s*/gi,
      /^Hi!?\s*/gi,
      /^Hey!?\s*/gi,
      /^I'm here to help\.?\s*/gi,
      /^I understand you're going through a difficult time\.?\s*/gi,
      /^Thank you for sharing with me\.?\s*/gi,
      /^I'm here to listen and support you\.?\s*/gi,
      /^Your feelings are valid\.?\s*/gi,
      /^You're not alone in this\.?\s*/gi,
      /^I hear you\.?\s*/gi,
      /^I can see that\.?\s*/gi
    ];

    repetitiveGreetings.forEach(pattern => {
      cleanedResponse = cleanedResponse.replace(pattern, '');
    });

    // Remove repeated phrases from previous responses
    const recentResponses = this.userProfile.conversationHistory
      .slice(-3)
      .map(c => c.aiResponse)
      .join(' ');

    // Check for repeated sentences (more than 50% similarity)
    const currentSentences = cleanedResponse.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const recentSentences = recentResponses.split(/[.!?]+/).filter(s => s.trim().length > 10);

    const filteredSentences = currentSentences.filter(currentSentence => {
      const currentWords = currentSentence.toLowerCase().split(/\s+/);
      return !recentSentences.some(recentSentence => {
        const recentWords = recentSentence.toLowerCase().split(/\s+/);
        const commonWords = currentWords.filter(word => recentWords.includes(word));
        const similarity = commonWords.length / Math.max(currentWords.length, recentWords.length);
        return similarity > 0.5; // More than 50% similarity
      });
    });

    if (filteredSentences.length > 0) {
      cleanedResponse = filteredSentences.join('. ').trim();
      if (!cleanedResponse.endsWith('.') && !cleanedResponse.endsWith('!') && !cleanedResponse.endsWith('?')) {
        cleanedResponse += '.';
      }
    }

    return cleanedResponse;
  }

  // Personalize response based on conversation history
  private personalizeResponse(response: string, userMessage: string): string {
    const recentConversations = this.userProfile.conversationHistory.slice(-5);
    const recentTopics = recentConversations.flatMap(c => c.topics);
    const currentTopics = this.extractTopics(userMessage);

    // If user is repeating a topic, acknowledge the pattern
    const repeatedTopics = currentTopics.filter(topic =>
      recentTopics.filter(rt => rt === topic).length >= 2
    );

    if (repeatedTopics.length > 0 && this.userProfile.responseLength !== 'short') {
      const topicAcknowledgment = `I notice ${repeatedTopics[0]} has been on your mind lately. `;
      if (!response.toLowerCase().includes('notice') && !response.toLowerCase().includes('remember')) {
        response = topicAcknowledgment + response;
      }
    }

    return response;
  }

  // Comprehensive preference and personality detection
  detectPreferenceChanges(userMessage: string): void {
    const lowerMessage = userMessage.toLowerCase();

    // Response length preferences
    if (lowerMessage.includes('short') && (lowerMessage.includes('answer') || lowerMessage.includes('response'))) {
      this.updateProfile({
        responseLength: 'short',
        rememberedInstructions: [...this.userProfile.rememberedInstructions, 'Keep responses short']
      });
    }

    if (lowerMessage.includes('detailed') || lowerMessage.includes('explain more')) {
      this.updateProfile({
        responseLength: 'detailed',
        rememberedInstructions: [...this.userProfile.rememberedInstructions, 'Provide detailed explanations']
      });
    }

    // Address style and avoided terms
    if (lowerMessage.includes('dont') && lowerMessage.includes('call') && lowerMessage.includes('beta')) {
      this.updateProfile({
        avoidTerms: [...this.userProfile.avoidTerms, 'beta'],
        rememberedInstructions: [...this.userProfile.rememberedInstructions, 'Do not use "beta"']
      });
    }

    // Communication style preferences
    if (lowerMessage.includes('professional') || lowerMessage.includes('proper')) {
      this.updateProfile({
        addressStyle: 'formal',
        communicationStyle: 'direct',
        rememberedInstructions: [...this.userProfile.rememberedInstructions, 'Use professional communication']
      });
    }

    if (lowerMessage.includes('gentle') || lowerMessage.includes('soft')) {
      this.updateProfile({
        communicationStyle: 'gentle',
        rememberedInstructions: [...this.userProfile.rememberedInstructions, 'Use gentle, soft communication']
      });
    }

    if (lowerMessage.includes('direct') || lowerMessage.includes('straight')) {
      this.updateProfile({
        communicationStyle: 'direct',
        rememberedInstructions: [...this.userProfile.rememberedInstructions, 'Be direct and straightforward']
      });
    }

    if (lowerMessage.includes('encouraging') || lowerMessage.includes('motivate')) {
      this.updateProfile({
        communicationStyle: 'encouraging',
        rememberedInstructions: [...this.userProfile.rememberedInstructions, 'Be encouraging and motivational']
      });
    }

    // Therapy approach preferences
    if (lowerMessage.includes('mindfulness') || lowerMessage.includes('meditation')) {
      const approaches = [...this.userProfile.therapyStyle.preferredApproaches];
      if (!approaches.includes('mindfulness')) approaches.push('mindfulness');
      this.updateProfile({
        therapyStyle: { ...this.userProfile.therapyStyle, preferredApproaches: approaches }
      });
    }

    if (lowerMessage.includes('practical') || lowerMessage.includes('solution')) {
      const approaches = [...this.userProfile.therapyStyle.preferredApproaches];
      if (!approaches.includes('solution-focused')) approaches.push('solution-focused');
      this.updateProfile({
        therapyStyle: { ...this.userProfile.therapyStyle, preferredApproaches: approaches }
      });
    }

    // Goals and aspirations
    if (lowerMessage.includes('want to') || lowerMessage.includes('goal') || lowerMessage.includes('hope to')) {
      const goal = userMessage.substring(0, 100);
      if (!this.userProfile.personalInsights.goals.some(g => g.includes(goal.substring(0, 20)))) {
        this.userProfile.personalInsights.goals.push(goal);
      }
    }
  }

  // Generate comprehensive personalized prompt for AI services
  getPersonalizedPrompt(userId?: string): string {
    const profile = this.userProfile;
    let prompt = '\n\n=== PERSONALIZED THERAPY CONTEXT ===\n';

    // Response preferences
    prompt += `RESPONSE STYLE:\n`;
    if (profile.responseLength === 'short') {
      prompt += '- KEEP RESPONSES VERY SHORT (1-2 sentences maximum, under 80 characters)\n';
    } else if (profile.responseLength === 'detailed') {
      prompt += '- Provide detailed, thorough explanations\n';
    }

    prompt += `- Communication style: ${profile.communicationStyle}\n`;
    prompt += `- Address style: ${profile.addressStyle}\n`;

    // Avoided and preferred terms
    if (profile.avoidTerms.length > 0) {
      prompt += `- NEVER use these terms: ${profile.avoidTerms.join(', ')}\n`;
    }
    if (profile.preferredTerms.length > 0) {
      prompt += `- Prefer these terms: ${profile.preferredTerms.join(', ')}\n`;
    }

    // Remembered instructions
    if (profile.rememberedInstructions.length > 0) {
      prompt += `- IMPORTANT INSTRUCTIONS: ${profile.rememberedInstructions.join('; ')}\n`;
    }

    // Personal insights and history
    if (profile.personalInsights.mainConcerns.length > 0) {
      prompt += `\nUSER'S MAIN CONCERNS: ${profile.personalInsights.mainConcerns.join(', ')}\n`;
    }

    if (profile.personalInsights.triggers.length > 0) {
      prompt += `KNOWN TRIGGERS: ${profile.personalInsights.triggers.slice(-3).join('; ')}\n`;
    }

    if (profile.personalInsights.copingStrategies.length > 0) {
      prompt += `EFFECTIVE COPING STRATEGIES: ${profile.personalInsights.copingStrategies.slice(-3).join('; ')}\n`;
    }

    if (profile.personalInsights.strengths.length > 0) {
      prompt += `USER'S STRENGTHS: ${profile.personalInsights.strengths.slice(-3).join('; ')}\n`;
    }

    if (profile.personalInsights.goals.length > 0) {
      prompt += `USER'S GOALS: ${profile.personalInsights.goals.slice(-2).join('; ')}\n`;
    }

    // Enhanced conversation context from memory system
    if (userId) {
      try {
        const conversationStats = conversationMemory.getUserConversationStats(userId);
        if (conversationStats.totalConversations > 0) {
          prompt += `\nCONVERSATION INSIGHTS:\n`;
          prompt += `- Total conversations: ${conversationStats.totalConversations}\n`;
          prompt += `- Communication style: ${conversationStats.communicationStyle}\n`;
          prompt += `- Average engagement: ${Math.round(conversationStats.averageEngagement * 100)}%\n`;

          if (conversationStats.preferredTopics.length > 0) {
            prompt += `- Frequently discussed: ${conversationStats.preferredTopics.slice(0, 3).join(', ')}\n`;
          }

          if (conversationStats.emotionalProgress.improvement > 0.1) {
            prompt += `- Emotional progress: Improving (${Math.round(conversationStats.emotionalProgress.improvement * 100)}%)\n`;
          }
        }
      } catch (error) {
        // Fallback to legacy conversation context if memory system fails
        const recentConversations = profile.conversationHistory.slice(-2);
        if (recentConversations.length > 0) {
          prompt += `\nRECENT CONVERSATION CONTEXT:\n`;
          recentConversations.forEach((conv, i) => {
            prompt += `${i + 1}. User: "${conv.userMessage.substring(0, 50)}..." (${conv.emotionalState})\n`;
          });
        }
      }
    } else {
      // Legacy conversation context
      const recentConversations = profile.conversationHistory.slice(-2);
      if (recentConversations.length > 0) {
        prompt += `\nRECENT CONVERSATION CONTEXT:\n`;
        recentConversations.forEach((conv, i) => {
          prompt += `${i + 1}. User: "${conv.userMessage.substring(0, 50)}..." (${conv.emotionalState})\n`;
        });
      }
    }

    // Emotional patterns
    const recentEmotions = profile.emotionalHistory.slice(-5);
    if (recentEmotions.length > 0) {
      const emotionSummary = recentEmotions.map(e => `${e.emotion}(${e.intensity})`).join(', ');
      prompt += `RECENT EMOTIONAL PATTERN: ${emotionSummary}\n`;
    }

    // Therapy preferences
    if (profile.therapyStyle.preferredApproaches.length > 0) {
      prompt += `PREFERRED THERAPY APPROACHES: ${profile.therapyStyle.preferredApproaches.join(', ')}\n`;
    }

    prompt += `\nSESSION DATA: Total sessions: ${profile.sessionData.totalSessions}, Current streak: ${profile.sessionData.currentStreak}\n`;

    prompt += '\n=== PERSONALIZATION INSTRUCTIONS ===\n';
    prompt += '- Reference previous conversations when relevant\n';
    prompt += '- Acknowledge patterns you notice in their communication\n';
    prompt += '- Build on their known strengths and coping strategies\n';
    prompt += '- Be aware of their triggers and approach sensitively\n';
    prompt += '- Adapt your therapeutic approach to their preferences\n';
    prompt += '- Remember their goals and check progress when appropriate\n';
    prompt += '- Use professional English only, no Hindi phrases\n';

    return prompt;
  }

  // Legacy method for compatibility
  getPromptAdditions(): string {
    return this.getPersonalizedPrompt();
  }

  // Session management
  startSession(): void {
    this.userProfile.sessionData.totalSessions += 1;
    this.userProfile.sessionData.lastSession = new Date();

    // Update streak
    const daysSinceLastSession = Math.floor(
      (new Date().getTime() - this.userProfile.sessionData.lastSession.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastSession <= 1) {
      this.userProfile.sessionData.currentStreak += 1;
    } else if (daysSinceLastSession > 7) {
      this.userProfile.sessionData.currentStreak = 1;
    }
  }

  // Add mood tracking
  recordMood(mood: number, notes: string = ''): void {
    this.userProfile.sessionData.moodTrends.push({
      date: new Date(),
      mood,
      notes
    });

    // Keep only last 30 mood entries
    if (this.userProfile.sessionData.moodTrends.length > 30) {
      this.userProfile.sessionData.moodTrends = this.userProfile.sessionData.moodTrends.slice(-30);
    }
  }

  // Get conversation summary for therapist-like continuity
  getConversationSummary(): string {
    const profile = this.userProfile;
    let summary = '';

    if (profile.conversationHistory.length > 0) {
      summary += `We've had ${profile.conversationHistory.length} conversations. `;
    }

    if (profile.personalInsights.mainConcerns.length > 0) {
      summary += `Your main areas of focus have been: ${profile.personalInsights.mainConcerns.slice(0, 3).join(', ')}. `;
    }

    if (profile.personalInsights.strengths.length > 0) {
      summary += `I've noticed your strengths in: ${profile.personalInsights.strengths.slice(-2).join(' and ')}. `;
    }

    return summary;
  }

  // Reset profile (for testing or new user)
  resetProfile(): void {
    this.userProfile = {
      responseLength: 'normal',
      addressStyle: 'respectful',
      communicationStyle: 'gentle',
      rememberedInstructions: [],
      avoidTerms: ['beta', 'yaar', 'dost'],
      preferredTerms: [],
      emotionalHistory: [],
      conversationHistory: [],
      personalInsights: {
        mainConcerns: [],
        triggers: [],
        copingStrategies: [],
        progressNotes: [],
        strengths: [],
        goals: []
      },
      therapyStyle: {
        preferredApproaches: [],
        sessionLength: 'standard',
        checkInFrequency: 'as-needed'
      },
      sessionData: {
        totalSessions: 0,
        lastSession: new Date(),
        currentStreak: 0,
        moodTrends: []
      }
    };
  }
}

// Export singleton instance with new name
export const personalizedTherapy = PersonalizedTherapyManager.getInstance();

// Legacy export for compatibility
export const responseManager = personalizedTherapy;