// Test suite for Conversation Memory and Continuity System
export type TherapeuticElement = {
  type:
    | "validation"
    | "coping_strategy"
    | "insight"
    | "reframe"
    | "encouragement"
    | "progress_acknowledgment";
  content: string;
  effectiveness: number;
};

import { conversationMemory, ConversationMemoryManager } from '../conversationMemory';

describe('ConversationMemoryManager', () => {
  let memoryManager: ConversationMemoryManager;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    memoryManager = new ConversationMemoryManager();
    // Clear any existing data
    memoryManager.clearUserData(testUserId);
  });

  afterEach(() => {
    memoryManager.clearUserData(testUserId);
  });

  describe('recordConversationTurn', () => {
    it('should record a conversation turn with emotional context', () => {
      const userMessage = "I'm feeling really anxious about my exams";
      const aiResponse = "I can hear how worried you are about your exams. That anxiety must feel overwhelming right now.";
      const emotionalAnalysis = {
        primaryEmotion: 'anxiety',
        intensity: 0.8,
        valence: -0.6
      };
      const topics = ['education', 'anxiety'];
      const therapeuticElements: TherapeuticElement[] = [
        { type: 'validation', content: 'acknowledging anxiety', effectiveness: 0.8 }
      ];

      const turn = memoryManager.recordConversationTurn(
        testUserId,
        userMessage,
        aiResponse,
        emotionalAnalysis,
        topics,
        therapeuticElements
      );

      expect(turn).toBeDefined();
      expect(turn.userMessage).toBe(userMessage);
      expect(turn.aiResponse).toBe(aiResponse);
      expect(turn.emotionalContext.primaryEmotion).toBe('anxiety');
      expect(turn.topics).toEqual(topics);
      expect(turn.therapeuticElements).toEqual(therapeuticElements);
    });

    it('should calculate user engagement correctly', () => {
      const shortMessage = "ok";
      const longMessage = "I'm really struggling with my family situation. My parents don't understand me and I feel like I'm constantly disappointing them. How can I deal with this?";

      const shortTurn = memoryManager.recordConversationTurn(
        testUserId,
        shortMessage,
        "I hear you.",
        { primaryEmotion: 'neutral', intensity: 0.2, valence: 0 },
        [],
        []
      );

      const longTurn = memoryManager.recordConversationTurn(
        testUserId,
        longMessage,
        "I can feel how difficult this is for you.",
        { primaryEmotion: 'sadness', intensity: 0.7, valence: -0.5 },
        ['family'],
        []
      );

      expect(shortTurn.userEngagement).toBeLessThan(longTurn.userEngagement);
      expect(longTurn.userEngagement).toBeGreaterThan(0.5);
    });
  });

  describe('generateContinuityBridge', () => {
    it('should generate empty bridge for new users', () => {
      const bridge = memoryManager.generateContinuityBridge(testUserId, "Hello");

      expect(bridge.previousSessionSummary).toBe('');
      expect(bridge.emotionalJourney).toBe('');
      expect(bridge.progressMade).toEqual([]);
      expect(bridge.ongoingConcerns).toEqual([]);
      expect(bridge.naturalTransitions).toEqual([]);
    });

    it('should generate meaningful bridge after conversations', () => {
      // Record some conversation history
      memoryManager.recordConversationTurn(
        testUserId,
        "I'm stressed about work",
        "That sounds really challenging",
        { primaryEmotion: 'stress', intensity: 0.7, valence: -0.4 },
        ['work', 'stress'],
        [{ type: 'validation', content: 'acknowledging stress', effectiveness: 0.8 }]
      );

      memoryManager.recordConversationTurn(
        testUserId,
        "I tried the breathing exercises you suggested",
        "I'm glad you tried them. How did they work for you?",
        { primaryEmotion: 'hopeful', intensity: 0.5, valence: 0.3 },
        ['coping_strategies'],
        [{ type: 'coping_strategy', content: 'breathing exercises', effectiveness: 0.7 }]
      );

      const bridge = memoryManager.generateContinuityBridge(testUserId, "Work is still stressing me out");

      expect(bridge.previousSessionSummary).toContain('work');
      expect(bridge.ongoingConcerns).toContain('work');
      expect(bridge.progressMade.length).toBeGreaterThan(0);
    });
  });

  describe('generateProgressAcknowledgment', () => {
    it('should return empty string for insufficient history', () => {
      const acknowledgment = memoryManager.generateProgressAcknowledgment(testUserId);
      expect(acknowledgment).toBe('');
    });

    it('should acknowledge emotional improvement', () => {
      // Record progression from sad to better
      memoryManager.recordConversationTurn(
        testUserId,
        "I feel terrible",
        "I'm here with you",
        { primaryEmotion: 'sadness', intensity: 0.9, valence: -0.8 },
        ['sadness'],
        []
      );

      memoryManager.recordConversationTurn(
        testUserId,
        "I'm feeling a bit better today",
        "That's wonderful to hear",
        { primaryEmotion: 'hopeful', intensity: 0.6, valence: 0.4 },
        ['improvement'],
        []
      );

      const acknowledgment = memoryManager.generateProgressAcknowledgment(testUserId);
      expect(acknowledgment).toContain('feeling');
      expect(acknowledgment.length).toBeGreaterThan(0);
    });
  });

  describe('generateConversationStarters', () => {
    it('should provide default starters for new users', () => {
      const starters = memoryManager.generateConversationStarters(testUserId);
      
      expect(starters).toHaveLength(3);
      expect(starters[0]).toContain('heart');
      expect(starters[1]).toContain('mind');
    });

    it('should provide contextual starters based on history', () => {
      // Record conversation about anxiety
      memoryManager.recordConversationTurn(
        testUserId,
        "I'm so anxious about everything",
        "I can feel your anxiety",
        { primaryEmotion: 'anxiety', intensity: 0.8, valence: -0.6 },
        ['anxiety'],
        []
      );

      const starters = memoryManager.generateConversationStarters(testUserId);
      
      expect(starters.some(starter => starter.toLowerCase().includes('anxiety'))).toBe(true);
    });
  });

  describe('getConversationContext', () => {
    it('should provide comprehensive conversation context', () => {
      // Record some conversation history
      memoryManager.recordConversationTurn(
        testUserId,
        "I'm struggling with family issues",
        "Family relationships can be really challenging",
        { primaryEmotion: 'frustration', intensity: 0.7, valence: -0.5 },
        ['family'],
        []
      );

      const context = memoryManager.getConversationContext(testUserId, 2);

      expect(context.recentTurns).toHaveLength(1);
      expect(context.emotionalArc).toBeDefined();
      expect(context.conversationFlow).toBeDefined();
      expect(context.userPreferences).toBeDefined();
    });
  });

  describe('getUserConversationStats', () => {
    it('should provide accurate conversation statistics', () => {
      // Record multiple conversations
      memoryManager.recordConversationTurn(
        testUserId,
        "First message",
        "First response",
        { primaryEmotion: 'neutral', intensity: 0.5, valence: 0 },
        [],
        []
      );

      memoryManager.recordConversationTurn(
        testUserId,
        "Second message with more engagement and emotional content",
        "Second response",
        { primaryEmotion: 'sadness', intensity: 0.7, valence: -0.4 },
        ['emotions'],
        []
      );

      const stats = memoryManager.getUserConversationStats(testUserId);

      expect(stats.totalConversations).toBe(2);
      expect(stats.averageEngagement).toBeGreaterThan(0);
      expect(stats.communicationStyle).toBeDefined();
      expect(stats.lastConversation).toBeDefined();
    });
  });

  describe('emotional journey tracking', () => {
    it('should track emotional shifts over time', () => {
      // Record emotional progression
      memoryManager.recordConversationTurn(
        testUserId,
        "I'm really sad",
        "I hear your sadness",
        { primaryEmotion: 'sadness', intensity: 0.8, valence: -0.7 },
        [],
        []
      );

      memoryManager.recordConversationTurn(
        testUserId,
        "I'm feeling anxious now",
        "That anxiety must be difficult",
        { primaryEmotion: 'anxiety', intensity: 0.6, valence: -0.5 },
        [],
        []
      );

      memoryManager.recordConversationTurn(
        testUserId,
        "I'm starting to feel hopeful",
        "Hope is a beautiful thing",
        { primaryEmotion: 'hope', intensity: 0.7, valence: 0.6 },
        [],
        []
      );

      const context = memoryManager.getConversationContext(testUserId, 3);
      expect(context.emotionalArc).toContain('improving');
    });
  });

  describe('conversation phase detection', () => {
    it('should detect opening phase for new conversations', () => {
      const turn = memoryManager.recordConversationTurn(
        testUserId,
        "Hi, I need help",
        "I'm here to help",
        { primaryEmotion: 'neutral', intensity: 0.3, valence: 0 },
        [],
        []
      );

      expect(turn.conversationPhase.current).toBe('opening');
    });

    it('should detect working phase for intense emotional content', () => {
      // First establish some history
      memoryManager.recordConversationTurn(
        testUserId,
        "Hello",
        "Hi there",
        { primaryEmotion: 'neutral', intensity: 0.3, valence: 0 },
        [],
        []
      );

      // Then record intense emotional content
      const turn = memoryManager.recordConversationTurn(
        testUserId,
        "I'm going through a really difficult time with my family. My parents are constantly fighting and I feel like it's my fault. I don't know how to handle this anymore and I'm feeling overwhelmed by everything that's happening at home.",
        "That sounds incredibly difficult",
        { primaryEmotion: 'overwhelmed', intensity: 0.9, valence: -0.8 },
        ['family'],
        []
      );

      expect(turn.conversationPhase.current).toBe('working');
    });
  });
});

// Integration test with singleton instance
describe('conversationMemory singleton', () => {
  const testUserId = 'integration-test-user';

  afterEach(() => {
    conversationMemory.clearUserData(testUserId);
  });

  it('should maintain state across multiple calls', () => {
    // Record first conversation
    conversationMemory.recordConversationTurn(
      testUserId,
      "I'm stressed",
      "I understand",
      { primaryEmotion: 'stress', intensity: 0.7, valence: -0.4 },
      ['stress'],
      []
    );

    // Get stats
    const stats1 = conversationMemory.getUserConversationStats(testUserId);
    expect(stats1.totalConversations).toBe(1);

    // Record second conversation
    conversationMemory.recordConversationTurn(
      testUserId,
      "Still stressed but trying to cope",
      "I see you're working on it",
      { primaryEmotion: 'stress', intensity: 0.5, valence: -0.2 },
      ['stress', 'coping'],
      []
    );

    // Get updated stats
    const stats2 = conversationMemory.getUserConversationStats(testUserId);
    expect(stats2.totalConversations).toBe(2);
    expect(stats2.emotionalProgress.improvement).toBeGreaterThan(0);
  });
});