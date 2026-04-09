// Test for Natural AI Companion enhancements
// Tests both conversation memory/flow and cultural authenticity/emotional intelligence

import { aiOrchestrator } from '../aiOrchestrator';
import { conversationMemory } from '../conversationMemory';

describe('Natural AI Companion Enhancements', () => {
  const testUserId = 'test-user-123';
  
  beforeEach(() => {
    // Clear any existing conversation history - method doesn't exist yet
    // conversationMemory.clearUserHistory?.(testUserId);
  });

  describe('Task 2: Conversation Flow and Memory', () => {
    test('should maintain conversation continuity across sessions', async () => {
      // First conversation
      const firstResponse = await aiOrchestrator.generateTherapeuticResponse(
        "I'm really stressed about my upcoming exams. My parents have such high expectations.",
        testUserId,
        { session: { sessionId: 'session-1' } }
      );

      expect(firstResponse.message).toBeTruthy();
      expect(firstResponse.message.length).toBeGreaterThan(50);

      // Second conversation - should reference the first
      const secondResponse = await aiOrchestrator.generateTherapeuticResponse(
        "I'm still feeling overwhelmed about everything.",
        testUserId,
        { session: { sessionId: 'session-2' } }
      );

      expect(secondResponse.message).toBeTruthy();
      // The response should show continuity (though we can't test exact content due to AI variability)
      expect(secondResponse.message.length).toBeGreaterThan(50);
    });

    test('should generate natural conversation bridges', () => {
      // Record a conversation turn first
      conversationMemory.recordConversationTurn(
        testUserId,
        "I had a fight with my parents about my career choice",
        "I can understand how difficult that must be...",
        { primaryEmotion: 'stress', intensity: 0.7 },
        ['family', 'career'],
        [{ type: 'validation', content: 'validation response', effectiveness: 0.8 }]
      );

      const bridge = conversationMemory.generateContinuityBridge(
        testUserId,
        "I'm still thinking about what we discussed"
      );

      expect(bridge).toBeDefined();
      expect(bridge.naturalTransitions).toBeDefined();
      expect(bridge.naturalTransitions.length).toBeGreaterThan(0);
    });

    test('should acknowledge user progress naturally', () => {
      // Record multiple conversation turns to show progress
      conversationMemory.recordConversationTurn(
        testUserId,
        "I'm feeling really anxious",
        "I hear that anxiety...",
        { primaryEmotion: 'anxiety', intensity: 0.8 },
        ['anxiety'],
        [{ type: 'validation', content: 'validation', effectiveness: 0.7 }]
      );

      conversationMemory.recordConversationTurn(
        testUserId,
        "I tried the breathing exercise you suggested",
        "That's wonderful that you tried it...",
        { primaryEmotion: 'anxiety', intensity: 0.5 },
        ['coping'],
        [{ type: 'encouragement', content: 'encouragement', effectiveness: 0.9 }]
      );

      const progressAck = conversationMemory.generateProgressAcknowledgment(testUserId);
      expect(progressAck).toBeTruthy();
      expect(progressAck.length).toBeGreaterThan(10);
    });
  });

  describe('Task 3: Cultural Authenticity and Emotional Intelligence', () => {
    test('should detect and respond to Indian cultural context', async () => {
      const response = await aiOrchestrator.generateTherapeuticResponse(
        "My parents want me to become an engineer but I want to study art. Log kya kahenge if I don't follow their wishes?",
        testUserId,
        { session: { sessionId: 'cultural-test-1' } }
      );

      expect(response.message).toBeTruthy();
      expect(response.culturalAdaptation).toBeDefined();
      expect(response.culturalAdaptation.culturalReferences).toContain('socialPressure');
      expect(response.culturalAdaptation.language).toBe('mixed');
    });

    test('should show appropriate emotional intelligence', async () => {
      const response = await aiOrchestrator.generateTherapeuticResponse(
        "I feel completely hopeless. Nothing I do seems to matter anymore.",
        testUserId,
        { session: { sessionId: 'emotional-test-1' } }
      );

      expect(response.message).toBeTruthy();
      expect(response.emotionalSupport).toBeDefined();
      expect(response.emotionalSupport.empathyLevel).toBeGreaterThan(0.7);
      expect(response.emotionalSupport.validationStrategies).toContain('acknowledge_feelings');
      expect(response.riskAssessment.level).not.toBe('none');
    });

    test('should adapt to family dynamics and academic pressure', async () => {
      const response = await aiOrchestrator.generateTherapeuticResponse(
        "My family doesn't understand the pressure I'm under. They think I should just study harder for JEE.",
        testUserId,
        { session: { sessionId: 'family-test-1' } }
      );

      expect(response.message).toBeTruthy();
      expect(response.culturalAdaptation.culturalReferences).toEqual(
        expect.arrayContaining(['familyReferences', 'academicPressure'])
      );
    });

    test('should provide culturally appropriate coping strategies', async () => {
      const response = await aiOrchestrator.generateTherapeuticResponse(
        "I'm stressed about my arranged marriage. I don't know how to handle family expectations.",
        testUserId,
        { session: { sessionId: 'coping-test-1' } }
      );

      expect(response.message).toBeTruthy();
      expect(response.emotionalSupport.copingStrategies).toBeDefined();
      expect(response.emotionalSupport.copingStrategies.length).toBeGreaterThan(0);
      expect(response.culturalAdaptation.culturalReferences).toContain('marriagePressure');
    });

    test('should handle mixed language naturally', async () => {
      const response = await aiOrchestrator.generateTherapeuticResponse(
        "Mujhe bahut tension ho rahi hai about my future. I don't know kya karna chahiye.",
        testUserId,
        { session: { sessionId: 'language-test-1' } }
      );

      expect(response.message).toBeTruthy();
      expect(response.culturalAdaptation.language).toBe('mixed');
    });
  });

  describe('Integration: Memory + Cultural Intelligence', () => {
    test('should combine conversation memory with cultural understanding', async () => {
      // First conversation about family pressure
      await aiOrchestrator.generateTherapeuticResponse(
        "My parents are pressuring me to get married. I'm only 24 and want to focus on my career.",
        testUserId,
        { session: { sessionId: 'integration-1' } }
      );

      // Second conversation should reference the first and show cultural understanding
      const response = await aiOrchestrator.generateTherapeuticResponse(
        "I talked to my parents but they still don't understand my perspective.",
        testUserId,
        { session: { sessionId: 'integration-2' } }
      );

      expect(response.message).toBeTruthy();
      expect(response.culturalAdaptation.culturalReferences).toEqual(
        expect.arrayContaining(['familyReferences'])
      );
    });
  });
});