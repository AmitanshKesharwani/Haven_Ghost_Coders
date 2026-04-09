# Enhanced Memory & User Preferences System

## Overview
The AI Companion now has an advanced memory system that remembers user preferences across all conversations.

## Key Features

### 1. **Automatic Preference Detection**
The system automatically detects when users make requests about response style:

**Examples:**
- "Give me shorter answers" → Sets `responseLength: 'short'`
- "Be more simple" → Sets `responseComplexity: 'simple'`
- "Use bullet points" → Sets `preferredFormat: 'bullet_points'`
- "Don't ask questions" → Sets `includeQuestions: false`
- "Be more casual" → Sets `languageStyle: 'casual'`

### 2. **Persistent Memory**
Once a preference is set, it's remembered for ALL future conversations with that user.

### 3. **Preference Categories**

#### Response Length
- `short`: 2-3 sentences max
- `medium`: Standard length
- `long`: Detailed explanations
- `adaptive`: Adjusts based on context

#### Response Complexity
- `simple`: Easy-to-understand language
- `moderate`: Standard complexity
- `complex`: Detailed, nuanced explanations
- `adaptive`: Adjusts based on user's level

#### Format Preferences
- `conversational`: Natural conversation flow
- `structured`: Clear sections and organization
- `bullet_points`: Lists and bullet points
- `adaptive`: Chooses best format for content

#### Language Style
- `casual`: Friendly, informal tone
- `formal`: Professional language
- `mixed`: Balanced approach
- `adaptive`: Matches user's style

### 4. **Feedback Learning**
The system learns from user feedback:
- "Too long" → Automatically switches to shorter responses
- "Too complex" → Simplifies language
- "More detail please" → Provides longer responses

## How It Works

### For Users:
1. **Make a request**: "Please give me shorter and simpler answers"
2. **System remembers**: Preference is saved permanently
3. **All future responses**: Will be shorter and simpler
4. **Provide feedback**: "That was perfect" or "Still too long"
5. **System adapts**: Continuously improves based on feedback

### For Developers:
```typescript
// Check user preferences
const preferences = aiOrchestrator.getUserPreferences(userId);

// Handle feedback
await aiOrchestrator.handleUserFeedback(userId, "too long", previousResponse);

// Reset preferences if needed
aiOrchestrator.resetUserPreferences(userId);
```

## Example Conversation Flow

**User**: "Hi, I'm feeling stressed about work"
**AI**: "I can hear that work is really weighing on you right now. That kind of stress can feel overwhelming, especially when it builds up over time. What's been the most challenging part of your work situation lately? Sometimes talking through the specific stressors can help us figure out some ways to manage them."

**User**: "Please give me shorter and simpler answers"
**AI**: ✅ *System detects and saves preference*
**AI**: "Got it. Work stress is tough. What's the main thing stressing you out?"

**User**: "My boss keeps giving me too much work"
**AI**: "That's really hard. Too much work can make anyone feel overwhelmed. Have you been able to talk to your boss about the workload?"

*All future conversations will now use shorter, simpler responses for this user*

## Benefits

1. **Personalized Experience**: Each user gets responses tailored to their preferences
2. **Improved Satisfaction**: Users get exactly the type of help they want
3. **Reduced Friction**: No need to repeat preferences in every conversation
4. **Adaptive Learning**: System gets better over time based on feedback
5. **Cultural Sensitivity**: Maintains cultural awareness while respecting individual preferences

## Technical Implementation

- **Automatic Detection**: Uses natural language processing to detect preference requests
- **Persistent Storage**: Preferences are stored in the conversation memory system
- **Real-time Application**: Preferences are applied immediately to response generation
- **Feedback Loop**: Continuous learning from user interactions
- **Fallback Handling**: Graceful defaults when preferences aren't set