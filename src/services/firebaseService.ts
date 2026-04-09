import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp,
  deleteDoc,
  writeBatch,
  orderBy, // Keep orderBy for existing methods
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// User Profile Interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  onboardingComplete: boolean;
  preferences: {
    language: 'hindi' | 'english' | 'mixed' | 'bengali' | 'marathi' | 'telugu' | 'tamil' | 'gujarati' | 'kannada' | 'malayalam' | 'urdu' | 'punjabi' | 'odia' | 'assamese';
    culturalBackground: string;
    communicationStyle: 'formal' | 'casual';
    interests: string[];
    comfortEnvironment: string;
    avatarStyle: string;
    notificationsEnabled: boolean;
    crisisContactName?: string;
    crisisContactPhone?: string;
    selectedVoice?: string; // Google Cloud voice name (e.g., 'en-IN-Wavenet-D')
  };
  mentalHealthProfile: {
    primaryConcerns: string[];
    goals: string[];
    riskFactors: string[];
    protectiveFactors: string[];
    currentRiskLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    lastAssessmentDate?: Date;
    phq9Score?: number;
    gad7Score?: number;
    wellnessScore?: number;
  };
  therapeuticPlan: {
    primaryGoals: string[];
    secondaryGoals: string[];
    interventionStrategies: string[];
    progressMilestones: { [milestone: string]: boolean };
    lastUpdated: Date;
  };
  privacySettings: {
    dataCollection: boolean;
    analyticsOptIn: boolean;
    researchParticipation: boolean;
  };
}

// Session Data Interface
export interface SessionData {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  sessionType: 'chat' | 'voice' | 'video' | 'assessment' | 'crisis';
  progressMetrics: {
    emotionalRegulation: number;
    selfAwareness: number;
    copingSkillsUsage: number;
    therapeuticAlliance: number;
    engagementLevel: number;
  };
  outcomes: {
    overallMood: 'improved' | 'stable' | 'declined';
    goalsAddressed: string[];
    skillsPracticed: string[];
    insightsGained: string[];
  };
  updatedAt?: Date;
}

// Define Interfaces for Subcollection Documents
export interface SessionInteraction {
  timestamp: Date;
  type: 'user_message' | 'ai_response' | 'emotion_detected' | 'voice_analysis';
  content: string;
  metadata?: any;
}

export interface SessionEmotion {
  timestamp: Date;
  primaryEmotion: string;
  intensity: number;
  valence: number;
  arousal: number;
  confidence: number;
  source: 'text' | 'voice' | 'facial';
}

export interface SessionRiskAssessment {
  timestamp: Date;
  level: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  indicators: string[];
  interventions: string[];
  // Removed fields not relevant to a single point-in-time assessment
}

// Crisis Event Interface
export interface CrisisEvent {
  eventId: string;
  userId: string;
  timestamp: Date;
  severity: 'moderate' | 'high' | 'severe';
  triggerMessage: string;
  detectedIndicators: string[];
  interventionsTaken: string[];
  helplinesCalled?: string[];
  professionalReferral: boolean;
  followUpScheduled: boolean;
  resolution: 'resolved' | 'monitoring' | 'escalated' | 'pending';
  notes?: string;
}

// Assessment Result Interface
export interface AssessmentResult {
  assessmentId: string;
  userId: string;
  assessmentType: 'phq9' | 'gad7' | 'custom_wellness' | 'crisis_screening';
  completedAt: Date;
  responses: { [questionId: string]: number | string };
  scores: {
    totalScore: number;
    subscaleScores?: { [subscale: string]: number };
    severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
    recommendations: string[];
  };
  comparedToPrevious?: {
    previousScore: number;
    change: number;
    trend: 'improving' | 'stable' | 'declining';
  };
}

// Journal Entry Interface
export interface JournalEntry {
  entryId: string;
  userId: string;
  title: string;
  content: string;
  mood: 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad';
  emotions: string[];
  tags: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  aiInsights?: {
    sentimentScore?: number; // e.g., -1.0 (negative) to 1.0 (positive)
    sentimentMagnitude?: number; // Strength of sentiment
    keyThemes?: string[]; // e.g., ['work', 'stress', 'family']
    positiveMentions?: string[]; // Specific positive phrases/topics
    negativeMentions?: string[]; // Specific negative phrases/topics
    potentialTriggers?: string[]; // Possible triggers identified
    copingMentioned?: string[]; // Coping mechanisms mentioned
    riskFlags?: string[]; // e.g., ['hopelessness', 'self_harm_reference'] - Use cautiously!
    summary?: string; // Brief AI-generated summary
    analysisTimestamp?: Date; // When was this analyzed
    modelVersion?: string; // Which AI model version was used
  };
}

// Mood Entry Interface
export interface MoodEntry {
  entryId: string;
  userId: string;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  anxiety: number; // 1-10 scale
  sleep: number; // 1-10 scale
  notes?: string;
  triggers?: string[];
  activities?: string[];
  location?: string;
  weather?: string;
  createdAt: Date;
}

// Chat Conversation Interface
export interface ChatConversation {
  conversationId: string;
  userId: string;
  title: string;
  // messages: ChatMessage[];
  startedAt: Date;
  lastMessageAt: Date;
  isActive: boolean;
  sessionType: 'general' | 'crisis' | 'therapy' | 'assessment';
  aiPersonality: 'supportive' | 'professional' | 'friendly' | 'clinical';
}

// Chat Message Interface
export interface ChatMessage {
  messageId: string;
  conversationId: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  messageType: 'text' | 'voice' | 'image' | 'assessment' | 'crisis_alert';
  metadata?: {
    sentiment?: number;
    detectedLanguage?: string; // Add this
    emotions?: string[];
    riskLevel?: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    aiModel?: string;
    responseTime?: number; // Should be number or Timestamp
  };
}

// --- Define Chart Data Types ---
export interface DateValuePoint {
  date: string; // Formatted date string (e.g., 'Oct 29')
  value: number;
}

export interface AssessmentHistoryPoint {
  date: string; // Formatted date string
  phq9: number | null;
  gad7: number | null;
}
// --- End Chart Data Types ---

// --- Update ProgressData Interface ---
export interface ProgressData {
  timeframe: string;
  sessions: {
    total: number;
    averageDuration: number;
    emotionalTrend: string;
    engagementLevel: number;
  };
  assessments: {
    total: number;
    latestScores: {
      phq9: number | null;
      gad7: number | null;
    };
    progressTrend: {
      phq9: string;
      gad7: string;
    };
  };
  insights: string[];
  // --- Add fields for chart data ---
  emotionalTrendChartData: DateValuePoint[];
  assessmentHistoryChartData: AssessmentHistoryPoint[];
  // --- End added fields ---
}
// --- End Update ProgressData ---

// Legacy Progress Tracking Interface (for daily progress tracking)
export interface DailyProgressData {
  userId: string;
  date: Date;
  metrics: {
    overallWellbeing: number; // 1-10
    moodStability: number; // 1-10
    anxietyLevel: number; // 1-10
    sleepQuality: number; // 1-10
    socialConnection: number; // 1-10
    copingSkills: number; // 1-10
  };
  goals: {
    goalId: string;
    title: string;
    progress: number; // 0-100%
    completed: boolean;
  }[];
  achievements: string[];
  challenges: string[];
}

// App Settings Interface
export interface AppSettings {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'english' | 'hindi' | 'mixed';
  notifications: {
    enabled: boolean;
    dailyCheckIn: boolean;
    moodReminders: boolean;
    crisisAlerts: boolean;
    progressUpdates: boolean;
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    crashReporting: boolean;
    personalizedAds: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
  };
  aiPreferences: {
    personality: 'supportive' | 'professional' | 'friendly';
    responseLength: 'brief' | 'detailed';
    culturalContext: boolean;
    hindiSupport: boolean;
  };
}

// User Activity Interface for logging user actions
export interface UserActivity {
  activityId: string;
  userId: string;
  type: 'wrote_journal_entry' | 'completed_assessment' | 'started_voice_session' | 'completed_voice_session' | 'used_emotion_detection' | 'chatted_with_ai' | 'updated_mood' | 'viewed_dashboard' | 'crisis_event_triggered';
  metadata: {
    [key: string]: any; // Flexible metadata for context
  };
  timestamp: Date;
}

function removeUndefinedValues(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    // Filter out undefined values from arrays as well
    return obj.map(removeUndefinedValues).filter(val => val !== undefined);
  }
  const newObj: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = removeUndefinedValues(obj[key]);
      if (value !== undefined) {
        newObj[key] = value;
      }
    }
  }
  // Return null if the object becomes empty after cleaning,
  // or handle as needed depending if an empty metadata object is desired.
  // Returning {} might be safer if the field itself is expected.
  return Object.keys(newObj).length > 0 ? newObj : {}; // Return empty object if all nested were undefined
}

// Firebase Service Class
export class FirebaseService {
  private currentUser: User | null = null;

  constructor() {
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.updateLastLoginTime(user.uid);
      }
    });
  }

  // ==================== AUTHENTICATION ====================

  // Sign up with email and password
  async signUp(email: string, password: string, displayName: string): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        onboardingComplete: false,
        preferences: {
          language: 'mixed',
          culturalBackground: 'indian',
          communicationStyle: 'casual',
          interests: [],
          comfortEnvironment: '',
          avatarStyle: 'friendly',
          notificationsEnabled: true
        },
        mentalHealthProfile: {
          primaryConcerns: [],
          goals: [],
          riskFactors: [],
          protectiveFactors: [],
          currentRiskLevel: 'none'
        },
        therapeuticPlan: {
          primaryGoals: [],
          secondaryGoals: [],
          interventionStrategies: [],
          progressMilestones: {},
          lastUpdated: new Date()
        },
        privacySettings: {
          dataCollection: true,
          analyticsOptIn: true,
          researchParticipation: false
        }
      };

      await this.createUserProfile(userProfile);
      return userProfile;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userProfile = await this.getUserProfile(user.uid);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      return userProfile;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user profile exists
      let userProfile = await this.getUserProfile(user.uid);

      if (!userProfile) {
        // Create new profile for Google user
        userProfile = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || "",
          createdAt: new Date(),
          lastLoginAt: new Date(),
          onboardingComplete: false,
          preferences: {
            language: 'mixed',
            culturalBackground: 'indian',
            communicationStyle: 'casual',
            interests: [],
            comfortEnvironment: '',
            avatarStyle: 'friendly',
            notificationsEnabled: true
          },
          mentalHealthProfile: {
            primaryConcerns: [],
            goals: [],
            riskFactors: [],
            protectiveFactors: [],
            currentRiskLevel: 'none'
          },
          therapeuticPlan: {
            primaryGoals: [],
            secondaryGoals: [],
            interventionStrategies: [],
            progressMilestones: {},
            lastUpdated: new Date()
          },
          privacySettings: {
            dataCollection: true,
            analyticsOptIn: true,
            researchParticipation: false
          }
        };

        await this.createUserProfile(userProfile);
      }

      return userProfile;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin, // Redirect back to your app after reset
        handleCodeInApp: false
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // ==================== USER PROFILE MANAGEMENT ====================

  // Create user profile
  async createUserProfile(userProfile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userProfile.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        'therapeuticPlan.lastUpdated': serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const profile: UserProfile = {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
          therapeuticPlan: {
            ...data.therapeuticPlan,
            lastUpdated: data.therapeuticPlan?.lastUpdated?.toDate() || new Date()
          }
        } as UserProfile;
        return profile;
      }

      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Complete onboarding
  async completeOnboarding(uid: string, onboardingData: any): Promise<void> {
    try {
      const updates: Partial<UserProfile> = {
        onboardingComplete: true,
        preferences: {
          ...onboardingData.preferences,
          language: onboardingData.language || 'mixed',
          culturalBackground: onboardingData.culturalBackground || 'indian',
          communicationStyle: onboardingData.communicationStyle || 'casual',
          interests: onboardingData.interests || [],
          comfortEnvironment: onboardingData.comfortEnvironment || '',
          avatarStyle: onboardingData.avatarStyle || 'friendly',
          notificationsEnabled: true
        },
        mentalHealthProfile: {
          primaryConcerns: onboardingData.concerns || [],
          goals: onboardingData.goals || [],
          riskFactors: onboardingData.riskFactors || [],
          protectiveFactors: onboardingData.protectiveFactors || [],
          currentRiskLevel: 'none'
        }
      };

      await this.updateUserProfile(uid, updates);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  // Update last login time
  private async updateLastLoginTime(uid: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        lastLoginAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login time:', error);
    }
  }

  // ==================== SESSION MANAGEMENT ====================

  // Create new session document (without arrays)
  async createSession(sessionData: Omit<SessionData, 'sessionId'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'sessions'), {
        ...sessionData,
        startTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Initialize empty metrics/outcomes if not provided
        progressMetrics: sessionData.progressMetrics || {
          emotionalRegulation: 0,
          selfAwareness: 0,
          copingSkillsUsage: 0,
          therapeuticAlliance: 0,
          engagementLevel: 0
        },
        outcomes: sessionData.outcomes || {
          overallMood: 'stable',
          goalsAddressed: [],
          skillsPracticed: [],
          insightsGained: []
        }
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Add Interaction to Subcollection
  async addInteractionToSubcollection(sessionId: string, interaction: Omit<SessionInteraction, 'timestamp'>): Promise<void> {
    try {
      const interactionColRef = collection(db, 'sessions', sessionId, 'interactions');
      // --- START SANITIZATION ---
      // Deep clean the entire interaction object, especially metadata
      const sanitizedInteraction = removeUndefinedValues(interaction);
      // --- END SANITIZATION ---
      // Ensure we have something valid to add
      if (!sanitizedInteraction || typeof sanitizedInteraction !== 'object' || Object.keys(sanitizedInteraction).length === 0) {
        console.warn(`Skipping addInteraction for session ${sessionId} - sanitized data is empty.`);
        return;
      }
      await addDoc(interactionColRef, {
        ...interaction,
        timestamp: serverTimestamp()
      });
      // Also update the main session doc's updatedAt timestamp
      await this.updateSessionTimestamp(sessionId);
    } catch (error) {
      console.error(`Error adding interaction to session ${sessionId}:`, error);
      throw error;
    }
  }

  // Add Emotion Data Point to Subcollection
  async addEmotionToSubcollection(sessionId: string, emotion: Omit<SessionEmotion, 'timestamp'>): Promise<void> {
    try {
      const emotionColRef = collection(db, 'sessions', sessionId, 'emotionalJourney');
      await addDoc(emotionColRef, {
        ...emotion,
        timestamp: serverTimestamp()
      });
      await this.updateSessionTimestamp(sessionId);
    } catch (error) {
      console.error(`Error adding emotion data to session ${sessionId}:`, error);
      throw error;
    }
  }

  // Add Risk Assessment to Subcollection
  async addRiskAssessmentToSubcollection(sessionId: string, riskAssessment: Omit<SessionRiskAssessment, 'timestamp'>): Promise<void> {
    try {
      const riskColRef = collection(db, 'sessions', sessionId, 'riskAssessments');
      await addDoc(riskColRef, {
        ...riskAssessment,
        timestamp: serverTimestamp()
      });
      await this.updateSessionTimestamp(sessionId);
    } catch (error) {
      console.error(`Error adding risk assessment to session ${sessionId}:`, error);
      throw error;
    }
  }

  // Helper: Update only timestamp
  private async updateSessionTimestamp(sessionId: string): Promise<void> {
    try {
      const docRef = doc(db, 'sessions', sessionId);
      await updateDoc(docRef, { updatedAt: serverTimestamp() });
    } catch (error) {
      console.warn(`Failed to update session timestamp for ${sessionId}:`, error);
      // Non-critical, just log warning
    }
  }

  // Update session (mainly for metrics, outcomes, or general updates - no longer handles large arrays)
  async updateSession(sessionId: string, updates: Partial<SessionData>): Promise<void> {
    try {
      const docRef = doc(db, 'sessions', sessionId);
      const sanitizedUpdates = removeUndefinedValues(updates);

      if (Object.keys(sanitizedUpdates).length === 0) {
        console.log(`Skipping update for session ${sessionId} - no valid data.`);
        // Still update timestamp if only timestamp update is intended
        if (updates && updates.hasOwnProperty('updatedAt')) {
          await updateDoc(docRef, { updatedAt: serverTimestamp() });
        }
        return;
      }

      await updateDoc(docRef, {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  // End session (Calculates final duration, updates outcomes)
  async endSession(sessionId: string, finalData: Partial<Pick<SessionData, 'outcomes'>>): Promise<void> {
    try {
      const docRef = doc(db, 'sessions', sessionId);
      const sessionDoc = await getDoc(docRef);

      if (!sessionDoc.exists()) {
        throw new Error(`Session ${sessionId} not found.`);
      }

      const startTime = (sessionDoc.data()?.startTime as Timestamp)?.toDate();
      const duration = startTime ? Date.now() - startTime.getTime() : 0;

      await updateDoc(docRef, {
        ...(finalData.outcomes && { outcomes: finalData.outcomes }),
        duration: duration,
        endTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  // Get session interactions from subcollection
  async getSessionInteractions(sessionId: string, limitCount: number = 100): Promise<SessionInteraction[]> {
    try {
      const q = query(
        collection(db, 'sessions', sessionId, 'interactions'),
        orderBy('timestamp', 'asc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const interactions = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp)?.toDate() || new Date()
      })) as SessionInteraction[];

      return interactions;
    } catch (error) {
      console.error(`Error getting interactions for session ${sessionId}:`, error);
      throw error;
    }
  }

  // Get session emotional journey from subcollection
  async getSessionEmotionalJourney(sessionId: string, limitCount: number = 100): Promise<SessionEmotion[]> {
    try {
      const q = query(
        collection(db, 'sessions', sessionId, 'emotionalJourney'),
        orderBy('timestamp', 'asc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const emotions = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp)?.toDate() || new Date()
      })) as SessionEmotion[];

      return emotions;
    } catch (error) {
      console.error(`Error getting emotional journey for session ${sessionId}:`, error);
      throw error;
    }
  }

  // Get session risk assessments from subcollection
  async getSessionRiskAssessments(sessionId: string, limitCount: number = 100): Promise<SessionRiskAssessment[]> {
    try {
      const q = query(
        collection(db, 'sessions', sessionId, 'riskAssessments'),
        orderBy('timestamp', 'asc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const riskAssessments = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp)?.toDate() || new Date()
      })) as SessionRiskAssessment[];

      return riskAssessments;
    } catch (error) {
      console.error(`Error getting risk assessments for session ${sessionId}:`, error);
      throw error;
    }
  }

  // Save session data
  async saveSession(sessionData: Omit<SessionData, 'sessionId'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'sessions'), {
        ...sessionData,
        startTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('Session saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  // Get user sessions (NO INDEX REQUIRED)
  async getUserSessions(uid: string, limitCount: number = 10): Promise<SessionData[]> {
    try {
      // Simple query without composite index
      const q = query(
        collection(db, 'sessions'),
        where('userId', '==', uid),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map(doc => ({
        sessionId: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate() || undefined
      })) as SessionData[];

      // Sort in memory by startTime descending
      return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw error;
    }
  }

  // ==================== CRISIS MANAGEMENT ====================

  // Record crisis event
  async recordCrisisEvent(crisisEvent: Omit<CrisisEvent, 'eventId'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'crisisEvents'), {
        ...crisisEvent,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Update user's risk level
      const userProfile = await this.getUserProfile(crisisEvent.userId);
      if (userProfile) {
        await this.updateUserProfile(crisisEvent.userId, {
          mentalHealthProfile: {
            ...userProfile.mentalHealthProfile,
            currentRiskLevel: crisisEvent.severity,
            lastAssessmentDate: new Date()
          }
        });
      }

      return docRef.id;
    } catch (error) {
      console.error('Error recording crisis event:', error);
      throw error;
    }
  }

  // Get user crisis events (NO INDEX REQUIRED)
  async getUserCrisisEvents(uid: string): Promise<CrisisEvent[]> {
    try {
      // Simple query without composite index
      const q = query(
        collection(db, 'crisisEvents'),
        where('userId', '==', uid),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => ({
        eventId: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as CrisisEvent[];

      // Sort in memory by timestamp descending
      return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error getting crisis events:', error);
      throw error;
    }
  }

  // ==================== ASSESSMENTS ====================

  // Save assessment result
  async saveAssessmentResult(assessment: Omit<AssessmentResult, 'assessmentId'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'assessments'), {
        ...assessment,
        completedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Update user's mental health profile with latest scores
      const updates: any = {};
      if (assessment.assessmentType === 'phq9') {
        updates['mentalHealthProfile.phq9Score'] = assessment.scores.totalScore;
      } else if (assessment.assessmentType === 'gad7') {
        updates['mentalHealthProfile.gad7Score'] = assessment.scores.totalScore;
      }
      updates['mentalHealthProfile.lastAssessmentDate'] = new Date();

      await this.updateUserProfile(assessment.userId, updates);

      return docRef.id;
    } catch (error) {
      console.error('Error saving assessment:', error);
      throw error;
    }
  }

  // Get user assessments (NO INDEX REQUIRED)
  async getUserAssessments(uid: string, assessmentType?: string): Promise<AssessmentResult[]> {
    try {
      // Simple query without composite index
      let q = query(
        collection(db, 'assessments'),
        where('userId', '==', uid)
      );

      if (assessmentType) {
        q = query(q, where('assessmentType', '==', assessmentType));
      }

      const querySnapshot = await getDocs(q);
      const assessments = querySnapshot.docs.map(doc => ({
        assessmentId: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate() || new Date()
      })) as AssessmentResult[];

      // Sort in memory by completedAt descending
      return assessments.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    } catch (error) {
      console.error('Error getting assessments:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS & INSIGHTS (Modified) ====================

  /**
   * Fetches the pre-aggregated analytics data from the 'user_analytics' collection.
   * This is fast and scalable. Falls back to raw data calculation if no pre-aggregated data exists.
   */
  async getUserProgressAnalytics(uid: string, timeframe: 'week' | 'month' | 'year' = 'month'): Promise<ProgressData> {
    try {
      // Try to fetch pre-aggregated data first
      const analyticsDocRef = doc(db, 'user_analytics', uid);
      const analyticsDoc = await getDoc(analyticsDocRef);

      if (analyticsDoc.exists()) {
        console.log("Fetched pre-aggregated dashboard data.");
        const data = analyticsDoc.data() as ProgressData;
        // Ensure the timeframe matches what was requested
        if (data.timeframe === timeframe) {
          return data;
        }
      }

      // No pre-aggregated data found or timeframe mismatch, calculate from raw data
      console.log("No pre-aggregated data found, calculating from raw data");
      return await this.calculateProgressDataFromRaw(uid, timeframe);
    } catch (error) {
      console.error('Error getting progress analytics:', error);
      return this.getDefaultAnalyticsData(timeframe);
    }
  }

  /**
   * Calculate progress data from raw sessions and assessments
   */
  private async calculateProgressDataFromRaw(uid: string, timeframe: 'week' | 'month' | 'year'): Promise<ProgressData> {
    try {
      const { startDate, endDate } = this.getDateRange(timeframe);
      
      // Get raw data
      const [sessions, assessments] = await Promise.all([
        this.getUserSessions(uid, 100),
        this.getUserAssessments(uid)
      ]);

      // Filter by date range
      const filteredSessions = sessions.filter(session => {
        const sessionDate = session.startTime instanceof Date ? session.startTime : (session.startTime as any).toDate();
        return sessionDate >= startDate && sessionDate <= endDate;
      });

      const filteredAssessments = assessments.filter(assessment => {
        const assessmentDate = assessment.completedAt instanceof Date ? assessment.completedAt : (assessment.completedAt as any).toDate();
        return assessmentDate >= startDate && assessmentDate <= endDate;
      });

      // Calculate chart data
      const chartData = await this.calculateRawChartData(uid, timeframe);

      // Calculate session analytics
      const totalSessions = filteredSessions.length;
      const averageDuration = totalSessions > 0 
        ? filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions 
        : 0;

      // Calculate emotional trend using engagement level as proxy
      const engagementValues = filteredSessions.map(s => s.progressMetrics?.engagementLevel || 5);
      const avgEngagement = engagementValues.length > 0 ? engagementValues.reduce((a, b) => a + b, 0) / engagementValues.length : 5;
      const emotionalTrend = avgEngagement > 6 ? 'improving' : avgEngagement < 4 ? 'declining' : 'stable';

      // Calculate assessment analytics
      const phq9Assessments = filteredAssessments.filter(a => a.assessmentType === 'phq9');
      const gad7Assessments = filteredAssessments.filter(a => a.assessmentType === 'gad7');
      
      const latestPhq9 = phq9Assessments.length > 0 ? phq9Assessments[phq9Assessments.length - 1].scores.totalScore : null;
      const latestGad7 = gad7Assessments.length > 0 ? gad7Assessments[gad7Assessments.length - 1].scores.totalScore : null;

      return {
        timeframe,
        sessions: {
          total: totalSessions,
          averageDuration: Math.round(averageDuration),
          emotionalTrend: emotionalTrend as 'improving' | 'declining' | 'stable',
          engagementLevel: Math.min(100, totalSessions * 10) // Simple engagement calculation
        },
        assessments: {
          total: filteredAssessments.length,
          latestScores: { phq9: latestPhq9, gad7: latestGad7 },
          progressTrend: {
            phq9: phq9Assessments.length >= 2 ? 'improving' : 'insufficient_data',
            gad7: gad7Assessments.length >= 2 ? 'improving' : 'insufficient_data'
          }
        },
        insights: this.generateBasicInsights(totalSessions, avgEngagement, latestPhq9, latestGad7),
        emotionalTrendChartData: chartData.emotionalTrendChartData,
        assessmentHistoryChartData: chartData.assessmentHistoryChartData,
      };
    } catch (error) {
      console.error('Error calculating progress data from raw:', error);
      return this.getDefaultAnalyticsData(timeframe);
    }
  }

  /**
   * Generate basic insights from calculated data
   */
  private generateBasicInsights(totalSessions: number, avgMood: number, latestPhq9: number | null, latestGad7: number | null): string[] {
    const insights: string[] = [];
    
    if (totalSessions === 0) {
      insights.push('Start your journey to see your insights!');
      return insights;
    }

    if (totalSessions >= 5) {
      insights.push(`Great consistency! You've completed ${totalSessions} sessions.`);
    }

    if (avgMood > 6) {
      insights.push('Your mood has been trending positively! Keep up the great work.');
    } else if (avgMood < 4) {
      insights.push('Consider reaching out for additional support if you need it.');
    }

    if (latestPhq9 !== null && latestPhq9 < 5) {
      insights.push('Your recent depression screening shows minimal symptoms.');
    }

    if (latestGad7 !== null && latestGad7 < 5) {
      insights.push('Your recent anxiety screening shows minimal symptoms.');
    }

    if (insights.length === 0) {
      insights.push('Continue your wellness journey - every step counts!');
    }

    return insights;
  }

  /**
   * Returns a default empty structure for the dashboard.
   */
  private getDefaultAnalyticsData(timeframe: 'week' | 'month' | 'year'): ProgressData {
    return {
      timeframe,
      sessions: { total: 0, averageDuration: 0, emotionalTrend: 'stable', engagementLevel: 0 },
      assessments: { total: 0, latestScores: { phq9: null, gad7: null }, progressTrend: { phq9: 'insufficient_data', gad7: 'insufficient_data' } },
      insights: ['Start your journey to see your insights!'],
      emotionalTrendChartData: [],
      assessmentHistoryChartData: [],
    };
  }



  // ==================== AGGREGATED CHART DATA METHODS ====================

  // Get aggregated chart data (optimized for performance)
  async getAggregatedChartData(userId: string, timeframe: 'week' | 'month' | 'year'): Promise<{
    emotionalTrendChartData: DateValuePoint[];
    assessmentHistoryChartData: AssessmentHistoryPoint[];
  }> {
    try {
      const { startDate, endDate } = this.getDateRange(timeframe);

      // Try to get pre-aggregated data first
      const aggregatedData = await this.getPreAggregatedData(userId, startDate, endDate);

      if (aggregatedData.length > 0) {
        console.log(`Using pre-aggregated data: ${aggregatedData.length} days`);
        return this.formatAggregatedChartData(aggregatedData, timeframe);
      } else {
        console.log('No pre-aggregated data found, falling back to raw data calculation');
        // Fallback to raw data calculation (not getUserProgressAnalytics to avoid circular dependency)
        return await this.calculateRawChartData(userId, timeframe);
      }
    } catch (error) {
      console.error('Error getting aggregated chart data:', error);
      return {
        emotionalTrendChartData: [],
        assessmentHistoryChartData: []
      };
    }
  }

  // Calculate chart data from raw sessions and assessments (fallback method)
  private async calculateRawChartData(userId: string, timeframe: 'week' | 'month' | 'year'): Promise<{
    emotionalTrendChartData: DateValuePoint[];
    assessmentHistoryChartData: AssessmentHistoryPoint[];
  }> {
    try {
      const { startDate, endDate } = this.getDateRange(timeframe);
      
      // Get raw sessions and assessments
      const [sessions, assessments] = await Promise.all([
        this.getUserSessions(userId, 100),
        this.getUserAssessments(userId)
      ]);

      // Filter by date range
      const filteredSessions = sessions.filter(session => {
        const sessionDate = session.startTime instanceof Date ? session.startTime : (session.startTime as any).toDate();
        return sessionDate >= startDate && sessionDate <= endDate;
      });

      const filteredAssessments = assessments.filter(assessment => {
        const assessmentDate = assessment.completedAt instanceof Date ? assessment.completedAt : (assessment.completedAt as any).toDate();
        return assessmentDate >= startDate && assessmentDate <= endDate;
      });

      // Calculate emotional trend data from sessions
      const emotionalTrendChartData: DateValuePoint[] = [];
      const sessionsByDate = new Map<string, SessionData[]>();
      
      filteredSessions.forEach(session => {
        const sessionDate = session.startTime instanceof Date ? session.startTime : (session.startTime as any).toDate();
        const dateStr = sessionDate.toISOString().split('T')[0];
        if (!sessionsByDate.has(dateStr)) {
          sessionsByDate.set(dateStr, []);
        }
        sessionsByDate.get(dateStr)!.push(session);
      });

      sessionsByDate.forEach((sessions, dateStr) => {
        // Use engagement level as a proxy for mood since SessionData doesn't have mood fields
        const avgEngagement = sessions.reduce((sum, s) => sum + (s.progressMetrics?.engagementLevel || 5), 0) / sessions.length;
        emotionalTrendChartData.push({
          date: dateStr,
          value: Math.round(avgEngagement * 10) / 10
        });
      });

      // Calculate assessment history data
      const assessmentHistoryChartData: AssessmentHistoryPoint[] = filteredAssessments.map(assessment => {
        const assessmentDate = assessment.completedAt instanceof Date ? assessment.completedAt : (assessment.completedAt as any).toDate();
        return {
          date: assessmentDate.toISOString().split('T')[0],
          phq9: assessment.assessmentType === 'phq9' ? assessment.scores.totalScore : null,
          gad7: assessment.assessmentType === 'gad7' ? assessment.scores.totalScore : null
        };
      });

      return {
        emotionalTrendChartData: emotionalTrendChartData.sort((a, b) => a.date.localeCompare(b.date)),
        assessmentHistoryChartData: assessmentHistoryChartData.sort((a, b) => a.date.localeCompare(b.date))
      };
    } catch (error) {
      console.error('Error calculating raw chart data:', error);
      return {
        emotionalTrendChartData: [],
        assessmentHistoryChartData: []
      };
    }
  }

  // Trigger data aggregation for a user
  async triggerDataAggregation(userId: string, timeframe: 'week' | 'month' | 'year'): Promise<void> {
    try {
      const { startDate, endDate } = this.getDateRange(timeframe);

      // Call the cloud function to aggregate data
      const aggregateFunction = httpsCallable(getFunctions(), 'aggregateUserChartData');

      await aggregateFunction({
        userId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      console.log(`Data aggregation triggered for user ${userId}, timeframe: ${timeframe}`);
    } catch (error) {
      console.error('Error triggering data aggregation:', error);
      throw error;
    }
  }

  // Get pre-aggregated data from userChartData collection (no composite index needed)
  private async getPreAggregatedData(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Simple query without composite index - just filter by userId
      const q = query(
        collection(db, 'userChartData'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const allData = querySnapshot.docs.map(doc => doc.data());

      // Filter by date range in memory to avoid composite index
      const filteredData = allData.filter(doc => {
        const docDate = doc.date;
        return docDate >= startDateStr && docDate <= endDateStr;
      });

      // Sort by date in memory
      return filteredData.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error fetching pre-aggregated data:', error);
      return [];
    }
  }

  // Format aggregated data for charts
  private formatAggregatedChartData(aggregatedData: any[], timeframe: 'week' | 'month' | 'year'): {
    emotionalTrendChartData: DateValuePoint[];
    assessmentHistoryChartData: AssessmentHistoryPoint[];
  } {
    const dateFormatOptions = this.getDateFormatOptions(timeframe);

    const emotionalTrendChartData: DateValuePoint[] = aggregatedData
      .filter(day => day.emotionalData && day.emotionalData.wellnessScore > 0)
      .map(day => ({
        date: new Date(day.date).toLocaleDateString('en-IN', dateFormatOptions),
        value: day.emotionalData.wellnessScore
      }));

    const assessmentHistoryChartData: AssessmentHistoryPoint[] = aggregatedData
      .filter(day => day.assessmentData && (day.assessmentData.phq9Score !== undefined || day.assessmentData.gad7Score !== undefined))
      .map(day => ({
        date: new Date(day.date).toLocaleDateString('en-IN', dateFormatOptions),
        phq9: day.assessmentData.phq9Score || null,
        gad7: day.assessmentData.gad7Score || null
      }));

    return {
      emotionalTrendChartData,
      assessmentHistoryChartData
    };
  }

  // Helper method to get date range for timeframes
  private getDateRange(timeframe: 'week' | 'month' | 'year'): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    return { startDate, endDate };
  }

  // Helper method to get date format options
  private getDateFormatOptions(timeframe: 'week' | 'month' | 'year'): Intl.DateTimeFormatOptions {
    switch (timeframe) {
      case 'week':
        return { weekday: 'short', month: 'short', day: 'numeric' };
      case 'month':
        return { month: 'short', day: 'numeric' };
      case 'year':
        return { month: 'short', year: '2-digit' };
      default:
        return { month: 'short', day: 'numeric' };
    }
  }

  // ==================== EXISTING HELPER METHODS (Unchanged) ====================

  // Get auth error message
  private getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  // Calculate emotional trend (legacy method, kept for compatibility)
  private calculateEmotionalTrend(sessions: any[]): string {
    if (sessions.length < 2) return 'stable';

    const recentSessions = sessions.slice(0, 3);
    const olderSessions = sessions.slice(3, 6);

    const recentAvg = recentSessions.reduce((sum, s) => {
      const emotions = s.emotionalJourney || [];
      const avgValence = emotions.reduce((sum: number, e: any) => sum + (e.valence || 0), 0) / emotions.length || 0;
      return sum + avgValence;
    }, 0) / recentSessions.length || 0;

    const olderAvg = olderSessions.reduce((sum, s) => {
      const emotions = s.emotionalJourney || [];
      const avgValence = emotions.reduce((sum: number, e: any) => sum + (e.valence || 0), 0) / emotions.length || 0;
      return sum + avgValence;
    }, 0) / olderSessions.length || 0;

    if (recentAvg > olderAvg + 0.1) return 'improving';
    if (recentAvg < olderAvg - 0.1) return 'declining';
    return 'stable';
  }

  // --- All the helper methods below this line have been MOVED ---
  // --- to the cloud function chartDataAggregator.ts ---

  // Delete user data (GDPR compliance)
  async deleteUserData(uid: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete user profile
      batch.delete(doc(db, 'users', uid));

      // Delete sessions
      const sessionsQuery = query(collection(db, 'sessions'), where('userId', '==', uid));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      sessionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      // Delete assessments
      const assessmentsQuery = query(collection(db, 'assessments'), where('userId', '==', uid));
      const assessmentsSnapshot = await getDocs(assessmentsQuery);
      assessmentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      // Delete crisis events
      const crisisQuery = query(collection(db, 'crisisEvents'), where('userId', '==', uid));
      const crisisSnapshot = await getDocs(crisisQuery);
      crisisSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  // ==================== JOURNAL MANAGEMENT ====================

  // Create journal entry
  async createJournalEntry(entry: Omit<JournalEntry, 'entryId'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'journal_entries'), {
        ...entry,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  }

  // Get user's journal entries (NO INDEX REQUIRED)
  async getJournalEntries(userId: string, limitCount: number = 50): Promise<JournalEntry[]> {
    try {
      // Simple query without composite index - just filter by userId
      const q = query(
        collection(db, 'journal_entries'),
        where('userId', '==', userId),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map(doc => ({
        entryId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as JournalEntry[];

      // Sort in memory by createdAt descending
      return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw error;
    }
  }

  // Get mood entries
  async getMoodEntries(userId: string, limitCount: number = 50): Promise<MoodEntry[]> {
    try {
      const q = query(
        collection(db, 'mood_entries'),
        where('userId', '==', userId),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map(doc => ({
        entryId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as MoodEntry[];

      return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting mood entries:', error);
      throw error;
    }
  }

  // Get chat conversations
  async getChatConversations(userId: string, limitCount: number = 50): Promise<ChatConversation[]> {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('userId', '==', userId),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const conversations = querySnapshot.docs.map(doc => ({
        conversationId: doc.id,
        ...doc.data(),
        startedAt: doc.data().startedAt?.toDate() || new Date(),
        lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date()
      })) as ChatConversation[];

      return conversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  // Get progress data
  async getProgressData(userId: string, limitCount: number = 50): Promise<DailyProgressData[]> {
    try {
      const q = query(
        collection(db, 'progress_data'),
        where('userId', '==', userId),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const progressData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      })) as DailyProgressData[];

      return progressData.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Error getting progress data:', error);
      throw error;
    }
  }

  // Create conversation
  async createConversation(conversation: Omit<ChatConversation, 'conversationId'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'chat_conversations'), { // Use correct collection name
        ...conversation,
        startedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Get latest mood entry
  async getLatestMoodEntry(userId: string): Promise<MoodEntry | null> {
    try {
      const entries = await this.getMoodEntries(userId, 1);
      return entries.length > 0 ? entries[0]! : null;
    } catch (error) {
      console.error('Error getting latest mood entry:', error);
      throw error;
    }
  }

  // Update journal entry
  async updateJournalEntry(entryId: string, updates: Partial<JournalEntry>): Promise<void> {
    try {
      const docRef = doc(db, 'journal_entries', entryId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  }

  // Delete journal entry
  async deleteJournalEntry(entryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'journal_entries', entryId));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  }


  async updateJournalEntryWithAIInsights(entryId: string, insights: JournalEntry['aiInsights']): Promise<void> {
    try {
      const docRef = doc(db, 'journal_entries', entryId);
      await updateDoc(docRef, {
        aiInsights: { // Ensure insights object is properly structured
          ...insights,
          analysisTimestamp: serverTimestamp() // Add timestamp in the function
        },
        updatedAt: serverTimestamp() // Also update the main entry timestamp
      });
      console.log(`🧠 AI Insights added to journal entry ${entryId}`);
    } catch (error) {
      console.error(`Error updating journal entry ${entryId} with AI insights:`, error);
      // Don't throw here, just log, as it's a background process
    }
  }
  // ==================== MOOD TRACKING ====================

  // Create mood entry
  async createMoodEntry(entry: Omit<MoodEntry, 'entryId'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'mood_entries'), {
        ...entry,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating mood entry:', error);
      throw error;
    }
  }





  // ==================== CHAT CONVERSATIONS ====================



  // Add message to conversation
  async addMessage(message: Omit<ChatMessage, 'messageId'>): Promise<string> {
    try {
      const batch = writeBatch(db);
      const messageCol = collection(db, 'chat_messages'); // Use correct message collection name
      // Add message
      const messageRef = doc(messageCol);
      batch.set(messageRef, {
        ...message,
        timestamp: serverTimestamp()
      });

      // Update conversation last message time
      const conversationRef = doc(db, 'chat_conversations', message.conversationId); // Use correct conversation collection name
      batch.update(conversationRef, {
        lastMessageAt: serverTimestamp()
        // Optionally update title here if needed
      });

      await batch.commit();
      return messageRef.id;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  // Get conversation messages (NO INDEX REQUIRED)
  async getConversationMessages(conversationId: string, limitCount: number = 100): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, 'chat_messages'), // Use correct collection name
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc'), // Order chronologically
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map(doc => ({
        messageId: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp)?.toDate() || new Date()
      })) as ChatMessage[];
      return messages;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw error;
    }
  }

  // *** NEW: Listen to conversation messages (real-time, ordered) ***
  listenToConversationMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void,
    onError: (error: Error) => void,
    limitCount: number = 100
  ): () => void { // Returns an unsubscribe function
    const q = query(
      collection(db, 'chat_messages'), // Collection name correction
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc'), // *** Order by timestamp ascending ***
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        messageId: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp)?.toDate() || new Date() // Safer timestamp conversion
      })) as ChatMessage[];
      callback(messages);
    }, (error) => {
      console.error('Error listening to conversation messages:', error);
      onError(error);
    });
    return unsubscribe; // Return the unsubscribe function
  }

  // Get user conversations (NO INDEX REQUIRED)
  async getUserConversations(userId: string, limitCount: number = 50): Promise<ChatConversation[]> {
    try {
      const q = query(
        collection(db, 'chat_conversations'), // Collection name correction
        where('userId', '==', userId),
        orderBy('lastMessageAt', 'desc'), // *** Order by last message descending ***
        limit(limitCount) // Keep limit
      );
      const querySnapshot = await getDocs(q);
      const conversations = querySnapshot.docs.map(doc => ({
        conversationId: doc.id,
        ...doc.data(),
        // Messages array likely not stored on conversation doc, remove if so
        // messages: [], // Clear messages array if it exists here
        startedAt: (doc.data().startedAt as Timestamp)?.toDate() || new Date(), // Safer conversion
        lastMessageAt: (doc.data().lastMessageAt as Timestamp)?.toDate() || new Date() // Safer conversion
      })) as ChatConversation[];
      return conversations;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }
  listenToUserConversations(
    userId: string,
    callback: (conversations: ChatConversation[]) => void,
    onError: (error: Error) => void,
    limitCount: number = 50
  ): () => void { // Returns an unsubscribe function
    const q = query(
      collection(db, 'chat_conversations'), // Collection name correction
      where('userId', '==', userId),
      orderBy('lastMessageAt', 'desc'), // *** Order by last message descending ***
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const conversations = querySnapshot.docs.map(doc => ({
        conversationId: doc.id,
        ...doc.data(),
        // messages: [], // Clear messages array if it exists here
        startedAt: (doc.data().startedAt as Timestamp)?.toDate() || new Date(), // Safer conversion
        lastMessageAt: (doc.data().lastMessageAt as Timestamp)?.toDate() || new Date() // Safer conversion
      })) as ChatConversation[];
      callback(conversations);
    }, (error) => {
      console.error('Error listening to user conversations:', error);
      onError(error);
    });

    return unsubscribe; // Return the unsubscribe function
  }
  // ==================== PROGRESS TRACKING ====================

  // Save daily progress
  async saveProgressData(progress: DailyProgressData): Promise<void> {
    try {
      const dateStr = progress.date.toISOString().split('T')[0];
      const docId = `${progress.userId}_${dateStr}`;

      await setDoc(doc(db, 'progress_tracking', docId), {
        ...progress,
        date: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving progress data:', error);
      throw error;
    }
  }



  // ==================== APP SETTINGS ====================

  // Save app settings
  async saveAppSettings(settings: AppSettings): Promise<void> {
    try {
      await setDoc(doc(db, 'app_settings', settings.userId), settings);
    } catch (error) {
      console.error('Error saving app settings:', error);
      throw error;
    }
  }

  // Get app settings
  async getAppSettings(userId: string): Promise<AppSettings | null> {
    try {
      const docRef = doc(db, 'app_settings', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as AppSettings;
      }

      // Return default settings if none exist
      return {
        userId,
        theme: 'auto',
        language: 'mixed',
        notifications: {
          enabled: true,
          dailyCheckIn: true,
          moodReminders: true,
          crisisAlerts: true,
          progressUpdates: true,
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00'
          }
        },
        privacy: {
          dataSharing: false,
          analytics: true,
          crashReporting: true,
          personalizedAds: false
        },
        accessibility: {
          fontSize: 'medium',
          highContrast: false,
          screenReader: false,
          reducedMotion: false
        },
        aiPreferences: {
          personality: 'supportive',
          responseLength: 'detailed',
          culturalContext: true,
          hindiSupport: true
        }
      };
    } catch (error) {
      console.error('Error getting app settings:', error);
      throw error;
    }
  }

  // ==================== CRISIS MANAGEMENT ====================

  // Log crisis event
  async logCrisisEvent(event: Omit<CrisisEvent, 'eventId'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'crisis_events'), {
        ...event,
        timestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error logging crisis event:', error);
      throw error;
    }
  }



  // ==================== ANALYTICS & INSIGHTS ====================

  // Get user analytics summary
  async getUserAnalytics(userId: string, days: number = 30): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const [moodEntries, journalEntries, sessions, assessments] = await Promise.all([
        this.getMoodEntries(userId),
        this.getJournalEntries(userId, 100),
        this.getUserSessions(userId, 50),
        this.getUserAssessments(userId)
      ]);

      return {
        period: { startDate, endDate, days },
        mood: {
          averageMood: moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length || 0,
          moodTrend: this.calculateMoodTrend(moodEntries),
          totalEntries: moodEntries.length
        },
        journal: {
          totalEntries: journalEntries.length,
          averageWordsPerEntry: journalEntries.reduce((sum, entry) => sum + entry.content.split(' ').length, 0) / journalEntries.length || 0,
          mostCommonEmotions: this.getMostCommonEmotions(journalEntries)
        },
        sessions: {
          totalSessions: sessions.length,
          averageDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length || 0,
          sessionTypes: this.getSessionTypeBreakdown(sessions)
        },
        assessments: {
          latestScores: { phq9: null, gad7: null }, // Default values since method moved to cloud function
          progressTrend: { phq9: 'insufficient_data', gad7: 'insufficient_data' } // Default values
        }
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  // Helper methods for analytics
  private calculateMoodTrend(moodEntries: MoodEntry[]): 'improving' | 'stable' | 'declining' {
    if (moodEntries.length < 7) return 'stable';

    const recent = moodEntries.slice(0, 7);
    const older = moodEntries.slice(7, 14);

    const recentAvg = recent.reduce((sum, entry) => sum + entry.mood, 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + entry.mood, 0) / older.length;

    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  }

  private getMostCommonEmotions(journalEntries: JournalEntry[]): string[] {
    const emotionCounts: { [emotion: string]: number } = {};

    journalEntries.forEach(entry => {
      entry.emotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    return Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([emotion]) => emotion);
  }

  private getSessionTypeBreakdown(sessions: SessionData[]): { [type: string]: number } {
    const breakdown: { [type: string]: number } = {};

    sessions.forEach(session => {
      breakdown[session.sessionType] = (breakdown[session.sessionType] || 0) + 1;
    });

    return breakdown;
  }


  // ==================== USER ACTIVITY LOGGING (NEW) ====================

  /**
   * Logs a key user activity to the 'user_activities' collection for AI context.
   * @param userId The ID of the user performing the action.
   * @param type The type of activity (e.g., 'wrote_journal_entry').
   * @param metadata Simple object with context (e.g., { mood: 'sad' }).
   * @returns The ID of the new activity log entry.
   */
  async logUserActivity(userId: string, type: UserActivity['type'], metadata: object): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'user_activities'), {
        userId,
        type,
        metadata,
        timestamp: serverTimestamp()
      });
      console.log(`Activity logged: ${type} for user ${userId}`);
      return docRef.id;
    } catch (error) {
      console.error('Error logging user activity:', error);
      throw error;
    }
  }

  /**
   * Fetches the most recent user activities for contextual AI.
   * Sorts in memory to avoid needing a composite index.
   * @param uid The user's ID.
   * @param limitCount The number of recent activities to fetch.
   * @returns An array of UserActivity objects.
   */
  async getRecentUserActivities(uid: string, limitCount: number = 3): Promise<UserActivity[]> {
    try {
      const q = query(
        collection(db, 'user_activities'),
        where('userId', '==', uid),
        // We fetch more than needed and sort in memory to avoid composite indexes
        limit(limitCount * 2 + 5) // Fetch a bit more to be safe
      );

      const querySnapshot = await getDocs(q);
      const activities = querySnapshot.docs.map(doc => ({
        activityId: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as UserActivity[];

      // Sort in memory (newest first) and take the top N
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limitCount);

    } catch (error) {
      console.error('Error getting recent user activities:', error);
      return []; // Return an empty array on error
    }
  }

} // End Class

// Export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;