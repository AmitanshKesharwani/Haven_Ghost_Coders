import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { supabaseService } from '../services/supabaseService';
import type { SessionData, SessionInteraction, SessionEmotion, SessionRiskAssessment } from '../services/supabaseService';

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

  const startSession = useCallback(async (sessionType: SessionData['sessionType']): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    setLoading(true);
    setError(null);
    try {
      const sessionData = {
        userId: currentUser.id,
        startTime: new Date(),
        duration: 0,
        sessionType,
        progressMetrics: {
          emotionalRegulation: 0.5, selfAwareness: 0.5,
          copingSkillsUsage: 0.5, therapeuticAlliance: 0.5, engagementLevel: 0.5,
        },
        outcomes: {
          overallMood: 'stable' as const,
          goalsAddressed: [], skillsPracticed: [], insightsGained: [],
        },
      };
      const sessionId = await supabaseService.createSession(sessionData);
      setCurrentSession({ sessionId, ...sessionData });
      return sessionId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const endSession = useCallback(async (): Promise<void> => {
    if (!currentSession) throw new Error('No active session to end');
    setLoading(true);
    setError(null);
    try {
      await supabaseService.endSession(currentSession.sessionId, {
        outcomes: {
          overallMood: 'stable',
          goalsAddressed: currentSession.outcomes.goalsAddressed,
          skillsPracticed: currentSession.outcomes.skillsPracticed,
          insightsGained: currentSession.outcomes.insightsGained,
        },
      });
      setCurrentSession(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const updateSession = useCallback(async (updates: Partial<SessionData>): Promise<void> => {
    if (!currentSession) throw new Error('No active session to update');
    setError(null);
    try {
      await supabaseService.updateSession(currentSession.sessionId, updates);
      setCurrentSession(prev => prev ? { ...prev, ...updates } : null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [currentSession]);

  const addInteraction = useCallback(async (interaction: Omit<SessionInteraction, 'timestamp'>): Promise<void> => {
    if (!currentSession) throw new Error('No active session');
    setError(null);
    try {
      await supabaseService.addInteractionToSubcollection(currentSession.sessionId, interaction);
    } catch (err: any) {
      setError(err.message);
      console.error('useFirebaseSession: Error adding interaction:', err);
      throw err;
    }
  }, [currentSession]);

  const addEmotionalDataPoint = useCallback(async (emotion: Omit<SessionEmotion, 'timestamp'>): Promise<void> => {
    if (!currentSession) throw new Error('No active session');
    setError(null);
    try {
      await supabaseService.addEmotionToSubcollection(currentSession.sessionId, emotion);
    } catch (err: any) {
      setError(err.message);
      console.error('useFirebaseSession: Error adding emotion:', err);
      throw err;
    }
  }, [currentSession]);

  const recordCrisisEvent = useCallback(async (event: {
    severity: 'moderate' | 'high' | 'severe';
    triggerMessage: string;
    detectedIndicators: string[];
  }): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    setError(null);
    try {
      await supabaseService.recordCrisisEvent({
        userId: currentUser.id,
        timestamp: new Date(),
        severity: event.severity,
        triggerMessage: event.triggerMessage,
        detectedIndicators: event.detectedIndicators,
        interventionsTaken: [],
        professionalReferral: event.severity === 'severe',
        followUpScheduled: event.severity !== 'moderate',
        resolution: 'pending',
      });
      if (currentSession) {
        const riskPoint: Omit<SessionRiskAssessment, 'timestamp'> = {
          level: event.severity,
          indicators: event.detectedIndicators,
          interventions: [],
        };
        await supabaseService.addRiskAssessmentToSubcollection(currentSession.sessionId, riskPoint);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('useFirebaseSession: Error recording crisis event:', err);
      throw err;
    }
  }, [currentUser, currentSession]);

  useEffect(() => {
    const checkActiveSession = async () => {
      if (!currentUser) return;
      try {
        const recentSessions = await supabaseService.getUserSessions(currentUser.id, 1);
        const lastSession = recentSessions[0];
        if (lastSession && !lastSession.endTime) setCurrentSession(lastSession);
      } catch (err: any) {
        console.error('Error checking active session:', err);
        setError(err.message);
      }
    };
    checkActiveSession();
  }, [currentUser]);

  return { currentSession, isSessionActive, startSession, endSession, updateSession, addInteraction, addEmotionalDataPoint, recordCrisisEvent, loading, error };
};
