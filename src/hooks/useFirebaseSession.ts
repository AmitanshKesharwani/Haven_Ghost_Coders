import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { firebaseService, SessionData, SessionInteraction, SessionEmotion, SessionRiskAssessment } from '../services/firebaseService';

interface UseFirebaseSessionReturn {
  currentSession: SessionData | null;
  isSessionActive: boolean;
  startSession: (sessionType: SessionData['sessionType']) => Promise<string>;
  endSession: () => Promise<void>;
  updateSession: (updates: Partial<SessionData>) => Promise<void>;
  addInteraction: (interaction: Omit<SessionInteraction, 'timestamp'>) => Promise<void>;
  addEmotionalDataPoint: (emotion: Omit<SessionEmotion, 'timestamp'>) => Promise<void>;
  recordCrisisEvent: (event: {
    severity: 'moderate' | 'high' | 'severe';
    triggerMessage: string;
    detectedIndicators: string[];
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useFirebaseSession = (): UseFirebaseSessionReturn => {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currentUser } = useAuth();

  const isSessionActive = currentSession !== null && !currentSession.endTime;

  // Start a new session
  const startSession = useCallback(async (sessionType: SessionData['sessionType']): Promise<string> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const sessionData = {
        userId: currentUser.uid,
        startTime: new Date(),
        duration: 0,
        sessionType,
        progressMetrics: {
          emotionalRegulation: 0.5,
          selfAwareness: 0.5,
          copingSkillsUsage: 0.5,
          therapeuticAlliance: 0.5,
          engagementLevel: 0.5
        },
        outcomes: {
          overallMood: 'stable' as const,
          goalsAddressed: [],
          skillsPracticed: [],
          insightsGained: []
        }
      };

      const sessionId = await firebaseService.createSession(sessionData);
      
      const newSession: SessionData = {
        sessionId,
        ...sessionData
      };
      
      setCurrentSession(newSession);
      return sessionId;
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // End the current session
  const endSession = useCallback(async (): Promise<void> => {
    if (!currentSession) {
      throw new Error('No active session to end');
    }

    setLoading(true);
    setError(null);

    try {
      await firebaseService.endSession(currentSession.sessionId, {
        outcomes: {
          overallMood: 'stable',
          goalsAddressed: currentSession.outcomes.goalsAddressed,
          skillsPracticed: currentSession.outcomes.skillsPracticed,
          insightsGained: currentSession.outcomes.insightsGained
        }
      });

      setCurrentSession(null);
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  // Update session data
  const updateSession = useCallback(async (updates: Partial<SessionData>): Promise<void> => {
    if (!currentSession) {
      throw new Error('No active session to update');
    }

    setError(null);

    try {
      await firebaseService.updateSession(currentSession.sessionId, updates);
      
      // Update local session state
      setCurrentSession(prev => prev ? { ...prev, ...updates } : null);
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [currentSession]);

  // Add interaction to current session
  const addInteraction = useCallback(async (interaction: Omit<SessionInteraction, 'timestamp'>): Promise<void> => {
    if (!currentSession) {
      throw new Error('No active session');
    }

    setError(null);

    try {
      // Call the new service function to add to subcollection
      await firebaseService.addInteractionToSubcollection(currentSession.sessionId, interaction);
      // No need to update local state's interactions array anymore
    } catch (err: any) {
      setError(err.message);
      console.error("useFirebaseSession: Error adding interaction:", err);
      throw err;
    }
  }, [currentSession]);

  // Add emotional data point
  const addEmotionalDataPoint = useCallback(async (emotion: Omit<SessionEmotion, 'timestamp'>): Promise<void> => {
    if (!currentSession) {
      throw new Error('No active session');
    }

    setError(null);

    try {
      // Call the new service function
      await firebaseService.addEmotionToSubcollection(currentSession.sessionId, emotion);
      // No need to update local state's emotionalJourney array anymore
    } catch (err: any) {
      setError(err.message);
      console.error("useFirebaseSession: Error adding emotion:", err);
      throw err;
    }
  }, [currentSession]);

  // Record crisis event
  const recordCrisisEvent = useCallback(async (event: {
    severity: 'moderate' | 'high' | 'severe';
    triggerMessage: string;
    detectedIndicators: string[];
  }): Promise<void> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      // Record in separate crisisEvents collection (keep this)
      await firebaseService.recordCrisisEvent({
        userId: currentUser.uid,
        timestamp: new Date(),
        severity: event.severity,
        triggerMessage: event.triggerMessage,
        detectedIndicators: event.detectedIndicators,
        interventionsTaken: [],
        professionalReferral: event.severity === 'severe',
        followUpScheduled: event.severity !== 'moderate',
        resolution: 'pending'
      });

      // Add simplified risk assessment point to CURRENT session's subcollection
      if (currentSession) {
        const riskAssessmentPoint: Omit<SessionRiskAssessment, 'timestamp'> = {
          level: event.severity,
          indicators: event.detectedIndicators,
          interventions: [] // Add interventions if applicable later
        };

        await firebaseService.addRiskAssessmentToSubcollection(currentSession.sessionId, riskAssessmentPoint);
        // No need to update local state's riskAssessments array anymore
      }
      
    } catch (err: any) {
      setError(err.message);
      console.error("useFirebaseSession: Error recording crisis event:", err);
      throw err;
    }
  }, [currentUser, currentSession]);

  // Check for existing active session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!currentUser) return;

      try {
        const recentSessions = await firebaseService.getUserSessions(currentUser.uid, 1);
        const lastSession = recentSessions[0];
        
        // If the last session doesn't have an end time, it's still active
        if (lastSession && !lastSession.endTime) {
          setCurrentSession(lastSession);
        }
      } catch (err: any) {
        console.error('Error checking active session:', err);
        setError(err.message);
      }
    };

    checkActiveSession();
  }, [currentUser]);

  return {
    currentSession,
    isSessionActive,
    startSession,
    endSession,
    updateSession,
    addInteraction,
    addEmotionalDataPoint,
    recordCrisisEvent,
    loading,
    error
  };
};