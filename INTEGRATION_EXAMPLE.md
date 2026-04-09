# 🔗 Quick Integration Example

## Adding Live Video Emotion Detection to AICompanion

Here's how to quickly add live video emotion detection to your existing AICompanion component:

### **Option 1: Simple Widget Integration**

```typescript
// In your AICompanion.tsx, add this import
import { EmotionWidget } from './EmotionWidget';

// Add state for emotion tracking
const [currentEmotion, setCurrentEmotion] = useState<EmotionDetectionResult | null>(null);

// Add this in your JSX where you want the emotion widget
<div className="emotion-sidebar">
  <EmotionWidget 
    onEmotionUpdate={(emotion) => {
      setCurrentEmotion(emotion);
      // Use emotion data to influence AI responses
      console.log('User emotion:', emotion.primaryEmotion);
    }}
    compact={true}
    showVideo={true}
    className="mb-4"
  />
</div>
```

### **Option 2: Use the Enhanced AICompanion**

```typescript
// Simply replace your current AICompanion route with:
<Route path="/companion" element={<AICompanionWithEmotion userData={currentUser as any} />} />
```

### **Option 3: Add to Dashboard**

```typescript
// In your dashboard, add a emotion detection card
<Card className="p-4">
  <h3 className="font-semibold mb-3">Live Emotion Detection</h3>
  <EmotionWidget 
    onEmotionUpdate={(emotion) => {
      // Update dashboard metrics
      updateWellnessMetrics(emotion.wellnessIndicators);
    }}
    compact={false}
    showVideo={true}
  />
</Card>
```

### **Emotion-Aware AI Responses**

```typescript
// Use emotion data to customize AI responses
const generateEmotionAwareResponse = (userMessage: string, emotion: EmotionDetectionResult) => {
  const context = {
    userEmotion: emotion.primaryEmotion,
    stressLevel: emotion.wellnessIndicators.stressLevel,
    confidence: emotion.confidence
  };

  // Modify AI prompt based on detected emotion
  if (emotion.wellnessIndicators.stressLevel > 0.7) {
    // Provide calming, supportive responses
    return aiOrchestrator.generateTherapeuticResponse(userMessage, userId, {
      emotionalState: 'high_stress',
      recommendedTone: 'calming'
    });
  }
  
  // Normal response for other emotions
  return aiOrchestrator.generateTherapeuticResponse(userMessage, userId, context);
};
```

## 🎯 **That's it! Your AICompanion now has live video emotion detection!**