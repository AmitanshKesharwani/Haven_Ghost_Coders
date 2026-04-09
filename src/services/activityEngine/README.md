# Activity Engine Framework

A comprehensive, AI-powered therapeutic activity management system designed for Haven's mental health platform. The Activity Engine provides intelligent activity recommendations, real-time adaptation, and culturally sensitive therapeutic interventions.

## 🏗️ Architecture Overview

The Activity Engine consists of several interconnected components:

### Core Components

1. **BaseActivityService** - Abstract base class for all therapeutic activities
2. **ActivitySessionManager** - Manages session lifecycle and state persistence
3. **ActivityFactory** - Creates activity instances using factory pattern
4. **ActivityRegistry** - Manages available activities and configurations
5. **ActivityRecommendationEngine** - AI-powered activity recommendations
6. **AdaptationEngine** - Real-time activity adaptation system
7. **DifficultyAdjustmentSystem** - Dynamic difficulty scaling

## 🚀 Key Features

### Intelligent Recommendations
- AI-powered activity suggestions based on user context
- Cultural sensitivity and personalization
- Real-time emotional state analysis
- Goal-oriented therapeutic planning

### Real-time Adaptation
- Dynamic response to user engagement levels
- Automatic difficulty adjustment
- Crisis detection and emergency protocols
- Cultural mismatch detection and correction

### Session Management
- Comprehensive session lifecycle management
- State persistence and recovery
- Multi-session user progress tracking
- Analytics and insights generation

### Cultural Intelligence
- Indian cultural context awareness
- Multi-language support (Hindi, English, Mixed)
- Family-aware therapeutic approaches
- Respectful communication patterns

## 📋 Available Activity Types

1. **Mindfulness Session** - Guided mindfulness and breathing exercises
2. **CBT Exercise** - Cognitive behavioral therapy interventions
3. **Guided Conversation** - Therapeutic dialogue sessions
4. **Assessment Activity** - Mental health assessments and evaluations
5. **Crisis Intervention** - Emergency support protocols
6. **Breathing Exercise** - Quick stress relief techniques
7. **Journaling Prompt** - Guided self-reflection exercises
8. **Mood Tracking** - Emotional state monitoring
9. **Thought Challenge** - Cognitive restructuring exercises
10. **Grounding Technique** - Anxiety management techniques

## 🎯 Usage Examples

### Basic Activity Execution

```typescript
import { ActivityEngine } from './activityEngine';

// Initialize the engine
const engine = new ActivityEngine();

// Get recommendations
const recommendations = await engine.getRecommendations({
  userContext,
  currentEmotionalState: 'anxious',
  timeAvailable: 15,
  urgencyLevel: 'medium'
});

// Create and start session
const session = await engine.createSession(
  userId,
  recommendations.primaryRecommendations[0].activityType,
  userContext
);

// Execute activity with real-time adaptation
const result = await engine.executeActivity(session, userInputs);
```

### Custom Activity Implementation

```typescript
import { BaseActivityService } from './BaseActivityService';

class CustomTherapyService extends BaseActivityService {
  async initializeActivity(config: ActivityConfiguration): Promise<ActivitySession> {
    // Custom initialization logic
  }

  async processUserInput(input: UserInput): Promise<ActivityResponse> {
    // Custom input processing
  }

  async generateNextStep(): Promise<ActivityResponse> {
    // Custom step generation
  }

  async completeActivity(): Promise<ActivityResult> {
    // Custom completion logic
  }

  protected async handleActivitySpecificAdaptation(
    trigger: AdaptationTrigger,
    context: any
  ): Promise<ActivityAdaptation> {
    // Custom adaptation logic
  }
}
```

## 🔧 Configuration

### User Context Setup

```typescript
const userContext: UserContext = {
  userId: 'user-123',
  demographics: {
    age: 22,
    language: 'mixed',
    culturalBackground: 'indian'
  },
  mentalHealthHistory: {
    primaryConcerns: ['anxiety', 'stress'],
    therapeuticGoals: ['emotional_regulation'],
    riskFactors: ['academic_pressure'],
    protectiveFactors: ['family_support']
  },
  currentState: {
    emotionalState: 'anxious',
    stressLevel: 7
  },
  activityPreferences: {
    preferredTypes: ['mindfulness_session'],
    sessionDuration: 15,
    difficultyLevel: 'beginner',
    culturalAdaptationLevel: 9
  }
};
```

### Activity Configuration

```typescript
const configuration: ActivityConfiguration = {
  activityType: 'mindfulness_session',
  difficultyLevel: 'beginner',
  estimatedDuration: 15,
  culturalAdaptations: ['indian_cultural_context', 'hindi_language_support'],
  personalizations: ['anxiety_focused', 'family_aware'],
  learningObjectives: ['stress_reduction', 'emotional_regulation']
};
```

## 🧠 Adaptation System

### Adaptation Triggers

- **Low Engagement** - User shows decreased participation
- **Emotional Distress** - Signs of emotional overwhelm detected
- **Comprehension Issues** - Difficulty understanding content
- **Cultural Mismatch** - Cultural sensitivity concerns
- **Crisis Detection** - Emergency intervention needed
- **Time Constraints** - Session time limitations

### Adaptation Types

- **Difficulty Adjustment** - Modify complexity level
- **Cultural Modification** - Apply cultural sensitivity
- **Intervention Change** - Switch therapeutic approach
- **Emergency Protocol** - Activate crisis support
- **Pacing Change** - Adjust session speed
- **Language Switch** - Change communication language

## 📊 Analytics and Insights

### Session Metrics

- Engagement scores and trends
- Completion rates and patterns
- Adaptation frequency and effectiveness
- Cultural relevance assessments
- Risk level monitoring

### User Progress Tracking

- Skill development over time
- Therapeutic goal achievement
- Activity preference evolution
- Stress level improvements
- Crisis intervention history

## 🛡️ Safety Features

### Crisis Detection

- Automatic detection of suicidal ideation
- Self-harm risk assessment
- Emergency resource provision
- Professional referral protocols

### Cultural Sensitivity

- Respectful communication patterns
- Family dynamics awareness
- Religious and cultural considerations
- Language preference accommodation

## 🧪 Testing and Verification

The Activity Engine includes comprehensive testing:

- **Unit Tests** - Individual component testing
- **Integration Tests** - Cross-component functionality
- **Adaptation Tests** - Real-time adaptation scenarios
- **Performance Tests** - Scalability and efficiency
- **Cultural Tests** - Cultural sensitivity validation

### Running Tests

```bash
# Run base activity service tests
npx tsx src/services/activityEngine/verify.ts

# Run factory and registry tests
npx tsx src/services/activityEngine/verifyFactoryRegistry.ts

# Run adaptation system tests
npx tsx src/services/activityEngine/verifyAdaptationSystem.ts

# Run complete demo
npx tsx src/services/activityEngine/ActivityEngineDemo.ts
```

## 🔮 Future Enhancements

### Planned Features

1. **Voice Integration** - Speech-based activity interaction
2. **Biometric Monitoring** - Heart rate and stress level integration
3. **Group Activities** - Multi-user therapeutic sessions
4. **VR/AR Support** - Immersive therapeutic experiences
5. **Advanced Analytics** - Machine learning insights
6. **Therapist Dashboard** - Professional oversight tools

### Extensibility

The Activity Engine is designed for easy extension:

- Plugin architecture for new activity types
- Configurable adaptation rules
- Custom recommendation algorithms
- Flexible cultural adaptation systems

## 📚 API Reference

### Core Classes

- `BaseActivityService` - Abstract base for activities
- `ActivityFactory` - Activity instance creation
- `ActivityRegistry` - Activity discovery and management
- `ActivitySessionManager` - Session lifecycle management
- `AdaptationEngine` - Real-time adaptation
- `DifficultyAdjustmentSystem` - Dynamic difficulty scaling

### Key Interfaces

- `UserContext` - User profile and state
- `ActivityConfiguration` - Activity setup parameters
- `ActivitySession` - Session state and progress
- `ActivityResult` - Session outcomes and insights
- `ActivityAdaptation` - Adaptation records

## 🤝 Contributing

To contribute to the Activity Engine:

1. Follow the established architecture patterns
2. Implement comprehensive tests
3. Ensure cultural sensitivity
4. Document new features thoroughly
5. Maintain backward compatibility

## 📄 License

This Activity Engine is part of the Haven mental health platform and is subject to the project's licensing terms.

---

**Built with ❤️ for mental health support in India**