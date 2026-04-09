# Live Emotion Detection Integration Guide

## 🎯 Overview

This implementation adds real-time facial emotion detection to your Haven mental health platform using Google Cloud Vision API. The system captures video frames at 1 FPS, analyzes emotions via Cloud Functions, and displays live feedback.

## 🏗️ Architecture

```
[User Camera / Live Video Feed]
│
▼ [Frame Capture Script (1 FPS)]
│
▼ [Call Cloud Function]
│
▼ [Cloud Vision API → FACE_DETECTION]
│
▼ [Response: joy, anger, sorrow, surprise likelihoods]
│
▼ [Frontend / Dashboard shows live emotion + confidence]
```

## 📁 New Components Added

### 1. `LiveEmotionDashboard.tsx`
- **Purpose**: Full-featured live emotion detection dashboard
- **Features**: 
  - Real-time emotion analysis
  - Wellness indicators (stress, engagement, energy)
  - Emotion history tracking
  - Visual feedback and alerts
- **Usage**: Standalone page or embedded component

### 2. `LiveEmotionPage.tsx`
- **Purpose**: Complete page with session management
- **Features**:
  - Session tracking and history
  - Data export functionality
  - Firebase integration for saving sessions
  - Settings panel
- **Route**: `/live-emotion`

### 3. `EmotionWidget.tsx`
- **Purpose**: Compact widget for integration into other components
- **Features**:
  - Compact and full modes
  - Easy integration
  - Real-time emotion display
- **Usage**: Can be embedded in AICompanion or any other component

### 4. `AICompanionWithEmotion.tsx`
- **Purpose**: Example integration with AI Companion
- **Features**:
  - Side-by-side emotion detection
  - Emotion-aware AI responses
  - Toggle visibility

## 🔧 Integration Options

### Option 1: Use the New Live Emotion Page
```typescript
// Already added to AppRouter.tsx
// Access via: /live-emotion
```

### Option 2: Add Widget to Existing Components
```typescript
import { EmotionWidget } from './EmotionWidget';

// In your component:
<EmotionWidget 
  onEmotionUpdate={(emotion) => {
    console.log('Current emotion:', emotion);
    // Handle emotion updates
  }}
  compact={true} // or false for full widget
/>
```

### Option 3: Replace AICompanion with Enhanced Version
```typescript
// In AppRouter.tsx, replace:
// <Route path="/companion" element={<AICompanion userData={currentUser as any} />} />
// with:
// <Route path="/companion" element={<AICompanionWithEmotion userData={currentUser as any} />} />
```

## 🚀 Quick Start

### 1. Access the Live Emotion Detection
- Navigate to the sidebar menu
- Click on "Live Emotion" (📹 icon)
- Grant camera permissions when prompted
- Click "Start Detection"

### 2. Features Available
- **Real-time Analysis**: 1-second intervals for live feedback
- **Emotion Breakdown**: Joy, sorrow, anger, surprise, fear, disgust
- **Wellness Metrics**: Stress level, engagement, energy
- **Session Tracking**: Automatic session management
- **Data Export**: JSON export of session data
- **Firebase Integration**: Auto-save to user profile

## 🔒 Privacy & Security

- **Local Processing**: Video frames are processed locally before sending to Cloud Vision
- **No Video Storage**: Only emotion data is stored, never video content
- **User Control**: Users can start/stop detection at any time
- **Permission-Based**: Requires explicit camera permission

## 📊 Data Structure

### Emotion Detection Result
```typescript
interface EmotionDetectionResult {
  faceDetected: boolean;
  emotions: {
    joy: number;        // 0-1 confidence
    sorrow: number;
    anger: number;
    surprise: number;
    fear: number;
    disgust: number;
  };
  primaryEmotion: string;
  confidence: number;
  wellnessIndicators: {
    stressLevel: number;      // 0-1
    fatigueLevel: number;
    engagementLevel: number;
    authenticity: number;
  };
  // ... additional fields
}
```

### Session Data
```typescript
interface EmotionSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  emotions: Array<{
    timestamp: Date;
    emotion: string;
    confidence: number;
    stressLevel: number;
    engagementLevel: number;
  }>;
  averageStress: number;
  dominantEmotion: string;
  totalFrames: number;
}
```

## 🎨 UI Components

### Dashboard Features
- **Live Emotion Display**: Current emotion with confidence
- **Wellness Status**: Color-coded stress/energy indicators
- **Metrics Grid**: Stress, engagement, energy levels
- **Emotion Breakdown**: All detected emotions with percentages
- **History Timeline**: Recent emotion changes
- **Alert System**: High stress notifications

### Widget Features
- **Compact Mode**: Small emotion indicator
- **Full Mode**: Complete metrics display
- **Toggle Controls**: Start/stop detection
- **Status Indicators**: Active/inactive states

## 🔧 Configuration

### Emotion Detection Settings
```typescript
// In component usage:
await emotionDetection.startRealTimeAnalysis(
  (result) => {
    // Handle emotion updates
  },
  {
    interval: 1000,           // Analysis interval (ms)
    culturalContext: 'indian', // Cultural adaptation
    sensitivity: 'medium'      // Detection sensitivity
  }
);
```

### Firebase Integration
```typescript
// Auto-save sessions (optional)
const [autoSave, setAutoSave] = useState(true);

// Sessions saved to 'emotion_sessions' collection
// Includes: userId, sessionData, emotionData, timestamps
```

## 🚨 Error Handling

### Common Issues & Solutions

1. **Camera Access Denied**
   - Check browser permissions
   - Ensure HTTPS connection
   - Try different browser

2. **Cloud Function Errors**
   - Verify Firebase Functions deployment
   - Check API key configuration
   - Monitor function logs

3. **Performance Issues**
   - Reduce analysis interval
   - Check network connection
   - Monitor browser resources

## 📈 Usage Analytics

The system tracks:
- Session duration and frequency
- Emotion patterns over time
- Stress level trends
- Engagement metrics
- User interaction patterns

## 🔄 Future Enhancements

Potential improvements:
- **Multi-face Detection**: Support multiple people
- **Emotion Trends**: Long-term pattern analysis
- **AI Integration**: Emotion-aware chatbot responses
- **Therapeutic Insights**: Professional recommendations
- **Group Sessions**: Team emotion monitoring

## 🛠️ Technical Requirements

- **Browser**: Modern browser with camera support
- **Permissions**: Camera access required
- **Network**: Internet connection for Cloud Vision API
- **Firebase**: Functions and Firestore enabled
- **API**: Google Cloud Vision API configured

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify camera permissions
3. Test with different browsers
4. Check Firebase Functions logs
5. Monitor Cloud Vision API usage

---

**Note**: This implementation is designed to integrate seamlessly with your existing Haven platform without disrupting current functionality. All components are modular and can be used independently or together.