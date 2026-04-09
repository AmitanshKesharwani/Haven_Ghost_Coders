# Firebase Setup Guide for Haven

This guide will help you set up Firebase Authentication and Firestore Database for the Haven mental health application.

## 🔥 Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `Haven-mental-health` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Choose or create a Google Analytics account
6. Click "Create project"

### Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable the following providers:
   - **Email/Password**: Click and toggle "Enable"
   - **Google**: Click, toggle "Enable", add your project support email
5. Click **Save**

### Step 3: Create Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. **Select location type and region:**
   - **Choose: Regional** (recommended for Haven)
   - **Select region: `asia-south2` (Delhi, India)** - **TOP RECOMMENDATION for Startups**
   
   **Why `asia-south2` (Delhi) is Perfect for Haven Startup:**
   - 🏛️ **Government proximity**: Easier regulatory compliance and partnerships
   - 🎓 **Educational hub**: Access to premier universities and student populations
   - 🚀 **Startup ecosystem**: Growing tech and investor community
   - 🏥 **Healthcare center**: AIIMS and top medical institutions for partnerships
   - ✅ **Same performance**: Identical latency and cost as Mumbai
   
   **Alternative: `asia-south1` (Mumbai)**
   - Better if focusing purely on commercial/corporate market
   - Established financial and business hub
   
   **Why Regional over Multi-region:**
   - ✅ **Cost-effective**: 2-3x cheaper than multi-region
   - ✅ **Perfect for Indian users**: Optimal performance across India
   - ✅ **Data residency**: Keeps mental health data in India
   - ✅ **Startup-friendly**: Lower costs during validation phase
   
   ⚠️ **Cannot be changed later** - choose carefully!
5. Click **Done**

### Step 4: Configure Firestore Security Rules

Replace the default rules with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Sessions belong to authenticated users
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Assessments belong to authenticated users
    match /assessments/{assessmentId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Crisis events belong to authenticated users
    match /crisisEvents/{eventId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon in left sidebar)
2. Scroll down to **Your apps** section
3. Click **Web app** icon (`</>`)
4. Register app with nickname: `Haven-web`
5. **Don't** check "Also set up Firebase Hosting"
6. Click **Register app**
7. Copy the configuration object

## � **vStartup Scaling Strategy**

### **Phase 1: MVP & Validation (Regional)**
Start with Regional (`asia-south1`) for:
- Cost-effective user acquisition
- Market validation in India
- Faster development cycles
- Investor-friendly burn rate

### **Phase 2: Scale & Expansion (Multi-region)**
Migrate to Multi-region when you have:
- 10,000+ active users
- Expansion to other countries
- Series A funding secured
- Need for 99.999% uptime

### **Migration Path:**
Firebase provides tools to migrate from Regional to Multi-region without data loss when you're ready to scale.

### **Startup Benefits of Regional Setup (Delhi):**
- 💰 **Lower burn rate**: Keep costs minimal during validation
- �️ **Goveernment access**: Easier partnerships with policy makers
- 🎓 **Educational pilots**: Access to premier institutions for user acquisition
- � **FInvestor appeal**: Shows disciplined approach + strategic location
- �  **Faster MVP**: Simpler setup = quicker time to market
- 🏥 **Healthcare partnerships**: Proximity to top medical institutions
- 📊 **Clear metrics**: Easier to track performance in single region

## 🔧 Environment Configuration

### Step 6: Update Environment Variables

Create or update your `.env` file with the Firebase configuration:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC-your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234

# Google AI (Required for AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Feature Flags
VITE_ENABLE_FIREBASE=true
VITE_ENABLE_GEMINI_AI=true
```

**Important**: Replace the placeholder values with your actual Firebase configuration values.

## 🚀 Testing the Setup

### Step 7: Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. Try creating a new account with email/password
4. Try signing in with Google
5. Verify that user data appears in Firestore Console

### Step 8: Test Database Operations

1. Complete the onboarding flow
2. Start a conversation with the AI companion
3. Check Firestore Console to see:
   - User profile in `users` collection
   - Session data in `sessions` collection
   - Any assessments in `assessments` collection

## 📊 Firestore Data Structure

Your Firestore database will have these collections:

### `users` Collection
```javascript
{
  uid: "user_unique_id",
  email: "user@example.com",
  displayName: "User Name",
  createdAt: timestamp,
  lastLoginAt: timestamp,
  onboardingComplete: true,
  preferences: {
    language: "mixed",
    culturalBackground: "indian",
    communicationStyle: "casual",
    interests: ["music", "nature"],
    comfortEnvironment: "peaceful",
    avatarStyle: "friendly",
    notificationsEnabled: true
  },
  mentalHealthProfile: {
    primaryConcerns: ["stress_management"],
    goals: ["emotional_regulation"],
    riskFactors: [],
    protectiveFactors: ["family_support"],
    currentRiskLevel: "none",
    lastAssessmentDate: timestamp,
    phq9Score: 5,
    gad7Score: 3
  },
  therapeuticPlan: {
    primaryGoals: ["stress_management"],
    secondaryGoals: ["family_communication"],
    interventionStrategies: ["CBT", "mindfulness"],
    progressMilestones: {},
    lastUpdated: timestamp
  },
  privacySettings: {
    dataCollection: true,
    analyticsOptIn: true,
    researchParticipation: false
  }
}
```

### `sessions` Collection
```javascript
{
  sessionId: "auto_generated_id",
  userId: "user_unique_id",
  startTime: timestamp,
  endTime: timestamp,
  duration: 1800000, // milliseconds
  sessionType: "chat", // "chat" | "voice" | "video" | "assessment" | "crisis"
  interactions: [
    {
      timestamp: timestamp,
      type: "user_message",
      content: "I'm feeling anxious today",
      metadata: {
        crisisLevel: "none",
        emotionAnalysis: {...}
      }
    }
  ],
  emotionalJourney: [
    {
      timestamp: timestamp,
      primaryEmotion: "anxiety",
      intensity: 0.7,
      valence: -0.3,
      arousal: 0.8,
      confidence: 0.85,
      source: "text"
    }
  ],
  progressMetrics: {
    emotionalRegulation: 0.6,
    selfAwareness: 0.7,
    copingSkillsUsage: 0.5,
    therapeuticAlliance: 0.8,
    engagementLevel: 0.9
  },
  riskAssessments: [],
  outcomes: {
    overallMood: "improved",
    goalsAddressed: ["emotional_support"],
    skillsPracticed: ["breathing_exercises"],
    insightsGained: ["self_awareness"]
  }
}
```

### `assessments` Collection
```javascript
{
  assessmentId: "auto_generated_id",
  userId: "user_unique_id",
  assessmentType: "phq9", // "phq9" | "gad7" | "custom_wellness"
  completedAt: timestamp,
  responses: {
    0: 1, // question index: response value
    1: 2,
    // ... more responses
  },
  scores: {
    totalScore: 8,
    severity: "mild",
    recommendations: [
      "Focus on self-care and wellness",
      "Consider lifestyle improvements"
    ]
  },
  comparedToPrevious: {
    previousScore: 12,
    change: -4,
    trend: "improving"
  }
}
```

### `crisisEvents` Collection
```javascript
{
  eventId: "auto_generated_id",
  userId: "user_unique_id",
  timestamp: timestamp,
  severity: "high", // "moderate" | "high" | "severe"
  triggerMessage: "I don't want to live anymore",
  detectedIndicators: ["suicidal_ideation", "hopelessness"],
  interventionsTaken: ["crisis_resources_shown", "helpline_provided"],
  helplinesCalled: [],
  professionalReferral: true,
  followUpScheduled: true,
  resolution: "monitoring", // "resolved" | "monitoring" | "escalated" | "pending"
  notes: "User provided with crisis resources"
}
```

## 🔒 Security Best Practices

### Authentication Security
- Users can only access their own data
- All database operations require authentication
- Session tokens are managed by Firebase

### Data Privacy
- Personal data is encrypted in transit and at rest
- Users can request data deletion (GDPR compliance)
- Crisis events are flagged for immediate attention

### Firestore Rules
- Strict user-based access control
- No public read/write access
- Validated data structure requirements

## 🚨 Crisis Management Integration

The Firebase setup includes automatic crisis detection and management:

1. **Real-time Crisis Detection**: Messages are analyzed for crisis indicators
2. **Immediate Intervention**: Crisis events trigger immediate response protocols
3. **Professional Referral**: Severe cases are flagged for professional follow-up
4. **Data Tracking**: All crisis events are logged for pattern analysis

## 📱 Production Deployment

### For Production Environment:

1. **Update Firestore Rules** to production mode:
   ```javascript
   // Remove test mode, keep user-based access control
   ```

2. **Enable Firebase App Check** for additional security

3. **Set up Firebase Functions** for server-side processing (optional)

4. **Configure Firebase Hosting** for web deployment (optional)

5. **Set up monitoring and alerts** for crisis events

## 🆘 Troubleshooting

### Common Issues:

**Authentication not working:**
- Check if Authentication is enabled in Firebase Console
- Verify API keys in `.env` file
- Ensure domain is authorized in Firebase settings

**Firestore permission denied:**
- Check Firestore security rules
- Verify user is authenticated
- Ensure user ID matches document owner

**Data not saving:**
- Check browser console for errors
- Verify Firestore rules allow write operations
- Check network connectivity

**Environment variables not loading:**
- Restart development server after changing `.env`
- Ensure variables start with `VITE_`
- Check for typos in variable names

## 📞 Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

---

**Your Haven app is now ready with full Firebase integration!** 🎉

Users can sign up, sign in, and have all their mental health data securely stored and managed in Firebase, with real-time crisis detection and professional-grade therapeutic session tracking.