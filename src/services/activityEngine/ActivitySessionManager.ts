// Activity Session Manager - Handles session state management and persistence
// Manages active sessions, session storage, and session lifecycle

import {
  ActivitySession,
  ActivityType,
  ActivityConfiguration,
  UserContext,
  ActivityResult,
  ActivityStatus
} from './types';

export interface SessionStorage {
  saveSession(session: ActivitySession): Promise<void>;
  loadSession(sessionId: string): Promise<ActivitySession | null>;
  deleteSession(sessionId: string): Promise<void>;
  getUserSessions(userId: string): Promise<ActivitySession[]>;
  updateSession(sessionId: string, updates: Partial<ActivitySession>): Promise<void>;
}

// In-memory storage implementation (can be replaced with Firebase/database storage)
class InMemorySessionStorage implements SessionStorage {
  private sessions: Map<string, ActivitySession> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();

  async saveSession(session: ActivitySession): Promise<void> {
    this.sessions.set(session.sessionId, { ...session });
    
    if (!this.userSessions.has(session.userId)) {
      this.userSessions.set(session.userId, new Set());
    }
    this.userSessions.get(session.userId)!.add(session.sessionId);
  }

  async loadSession(sessionId: string): Promise<ActivitySession | null> {
    const session = this.sessions.get(sessionId);
    return session ? { ...session } : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      this.userSessions.get(session.userId)?.delete(sessionId);
    }
  }

  async getUserSessions(userId: string): Promise<ActivitySession[]> {
    const sessionIds = this.userSessions.get(userId) || new Set();
    const sessions: ActivitySession[] = [];
    
    for (const sessionId of sessionIds) {
      const session = this.sessions.get(sessionId);
      if (session) {
        sessions.push({ ...session });
      }
    }
    
    return sessions;
  }

  async updateSession(sessionId: string, updates: Partial<ActivitySession>): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
      await this.saveSession(session);
    }
  }
}

export class ActivitySessionManager {
  private storage: SessionStorage;
  private activeSessions: Map<string, ActivitySession> = new Map();
  private sessionTimeouts: Map<string, NodeJS.Timeout> = new Map();
  
  // Configuration
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CONCURRENT_SESSIONS = 3;

  constructor(storage?: SessionStorage) {
    this.storage = storage || new InMemorySessionStorage();
  }

  // Create a new activity session
  async createSession(
    userId: string,
    activityType: ActivityType,
    configuration: ActivityConfiguration,
    userContext: UserContext
  ): Promise<ActivitySession> {
    // Check for existing active sessions
    await this.enforceSessionLimits(userId);

    const sessionId = this.generateSessionId();
    const now = new Date();

    const session: ActivitySession = {
      sessionId,
      userId,
      activityType,
      configuration,
      status: 'not_started',
      startTime: now,
      currentStep: 0,
      totalSteps: this.estimateTotalSteps(activityType, configuration),
      userEngagement: 0,
      completionPercentage: 0,
      adaptations: [],
      realTimeMetrics: {
        emotionalState: userContext.currentState.emotionalState || 'neutral',
        stressLevel: userContext.currentState.stressLevel || 5,
        responseTime: 0,
        comprehension: 0,
        participationLevel: 0
      },
      interactions: [],
      userResponses: [],
      aiResponses: []
    };

    // Save session
    await this.storage.saveSession(session);
    this.activeSessions.set(sessionId, session);

    // Set timeout for session cleanup
    this.setSessionTimeout(sessionId);

    return session;
  }

  // Get an existing session
  async getSession(sessionId: string): Promise<ActivitySession | null> {
    // Check active sessions first
    let session = this.activeSessions.get(sessionId);
    
    if (!session) {
      // Load from storage
      const loadedSession = await this.storage.loadSession(sessionId);
      session = loadedSession || undefined;
      if (session) {
        this.activeSessions.set(sessionId, session);
        this.setSessionTimeout(sessionId);
      }
    }

    return session || null;
  }

  // Update session state
  async updateSession(sessionId: string, updates: Partial<ActivitySession>): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Apply updates
    Object.assign(session, updates);

    // Save to storage
    await this.storage.updateSession(sessionId, updates);

    // Update active session
    this.activeSessions.set(sessionId, session);

    // Reset timeout
    this.setSessionTimeout(sessionId);
  }

  // Start a session
  async startSession(sessionId: string): Promise<ActivitySession> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.status !== 'not_started') {
      throw new Error(`Session ${sessionId} is already ${session.status}`);
    }

    await this.updateSession(sessionId, {
      status: 'active',
      startTime: new Date()
    });

    return session;
  }

  // Pause a session
  async pauseSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.status !== 'active') {
      throw new Error(`Cannot pause session ${sessionId} with status ${session.status}`);
    }

    await this.updateSession(sessionId, {
      status: 'paused'
    });
  }

  // Resume a session
  async resumeSession(sessionId: string): Promise<ActivitySession> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.status !== 'paused') {
      throw new Error(`Cannot resume session ${sessionId} with status ${session.status}`);
    }

    await this.updateSession(sessionId, {
      status: 'active'
    });

    return session;
  }

  // Complete a session
  async completeSession(sessionId: string, result: ActivityResult): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    await this.updateSession(sessionId, {
      status: 'completed',
      endTime: new Date(),
      completionPercentage: 100,
      sessionResult: result
    });

    // Clean up active session
    this.cleanupSession(sessionId);
  }

  // Abandon a session
  async abandonSession(sessionId: string, reason?: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    await this.updateSession(sessionId, {
      status: 'abandoned',
      endTime: new Date()
    });

    // Add abandonment reason to interactions
    if (reason) {
      session.interactions.push({
        timestamp: new Date(),
        type: 'system_event',
        content: `Session abandoned: ${reason}`,
        metadata: { reason }
      });
      await this.storage.updateSession(sessionId, { interactions: session.interactions });
    }

    // Clean up active session
    this.cleanupSession(sessionId);
  }

  // Get all sessions for a user
  async getUserSessions(
    userId: string,
    status?: ActivityStatus,
    activityType?: ActivityType
  ): Promise<ActivitySession[]> {
    let sessions = await this.storage.getUserSessions(userId);

    // Filter by status if specified
    if (status) {
      sessions = sessions.filter(session => session.status === status);
    }

    // Filter by activity type if specified
    if (activityType) {
      sessions = sessions.filter(session => session.activityType === activityType);
    }

    // Sort by start time (most recent first)
    sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    return sessions;
  }

  // Get active sessions for a user
  async getActiveUserSessions(userId: string): Promise<ActivitySession[]> {
    return this.getUserSessions(userId, 'active');
  }

  // Check if user has reached session limits
  async enforceSessionLimits(userId: string): Promise<void> {
    const activeSessions = await this.getActiveUserSessions(userId);
    
    if (activeSessions.length >= this.MAX_CONCURRENT_SESSIONS) {
      // Abandon the oldest active session
      const oldestSession = activeSessions[activeSessions.length - 1];
      if (oldestSession) {
        await this.abandonSession(
          oldestSession.sessionId, 
          'Exceeded maximum concurrent sessions'
        );
      }
    }
  }

  // Session cleanup and maintenance
  private cleanupSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
    
    const timeout = this.sessionTimeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.sessionTimeouts.delete(sessionId);
    }
  }

  private setSessionTimeout(sessionId: string): void {
    // Clear existing timeout
    const existingTimeout = this.sessionTimeouts.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      const session = this.activeSessions.get(sessionId);
      if (session && (session.status === 'active' || session.status === 'paused')) {
        await this.abandonSession(sessionId, 'Session timeout');
      }
    }, this.SESSION_TIMEOUT);

    this.sessionTimeouts.set(sessionId, timeout);
  }

  // Utility methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimateTotalSteps(activityType: ActivityType, configuration: ActivityConfiguration): number {
    // Estimate based on activity type and duration
    const baseSteps = {
      'guided_conversation': 8,
      'cbt_exercise': 6,
      'mindfulness_session': 5,
      'assessment_activity': 10,
      'group_therapy': 12,
      'family_integration': 8,
      'crisis_intervention': 4,
      'cultural_therapy': 7,
      'breathing_exercise': 3,
      'journaling_prompt': 4,
      'mood_tracking': 3,
      'thought_challenge': 5,
      'behavior_experiment': 6,
      'grounding_technique': 4
    };

    let steps = baseSteps[activityType] || 6;

    // Adjust based on difficulty level
    switch (configuration.difficultyLevel) {
      case 'beginner':
        steps = Math.ceil(steps * 0.8);
        break;
      case 'advanced':
        steps = Math.ceil(steps * 1.3);
        break;
      // intermediate stays the same
    }

    // Adjust based on estimated duration
    if (configuration.estimatedDuration > 30) {
      steps = Math.ceil(steps * 1.5);
    } else if (configuration.estimatedDuration < 10) {
      steps = Math.ceil(steps * 0.7);
    }

    return Math.max(3, steps); // Minimum 3 steps
  }

  // Session statistics and analytics
  async getSessionStatistics(userId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    abandonedSessions: number;
    averageEngagement: number;
    averageDuration: number;
    mostUsedActivityTypes: { type: ActivityType; count: number }[];
  }> {
    const sessions = await this.getUserSessions(userId);
    
    const completed = sessions.filter(s => s.status === 'completed');
    const abandoned = sessions.filter(s => s.status === 'abandoned');
    
    const avgEngagement = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.userEngagement, 0) / sessions.length 
      : 0;

    const avgDuration = completed.length > 0
      ? completed.reduce((sum, s) => {
          const duration = s.endTime && s.startTime 
            ? (s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60)
            : 0;
          return sum + duration;
        }, 0) / completed.length
      : 0;

    // Count activity types
    const activityTypeCounts = new Map<ActivityType, number>();
    sessions.forEach(session => {
      const count = activityTypeCounts.get(session.activityType) || 0;
      activityTypeCounts.set(session.activityType, count + 1);
    });

    const mostUsedActivityTypes = Array.from(activityTypeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      abandonedSessions: abandoned.length,
      averageEngagement: avgEngagement,
      averageDuration: avgDuration,
      mostUsedActivityTypes
    };
  }

  // Cleanup expired sessions
  async cleanupExpiredSessions(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [sessionId, session] of this.activeSessions) {
      if (session.startTime < cutoffTime && 
          (session.status === 'active' || session.status === 'paused')) {
        await this.abandonSession(sessionId, 'Session expired');
      }
    }
  }
}