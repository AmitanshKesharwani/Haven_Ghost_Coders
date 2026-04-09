import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Clock, 
  MessageCircle, 
  Brain, 
 
  Calendar,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import { firebaseService, SessionData } from '../services/firebaseService';
import { toast } from 'sonner';

interface SessionManagerProps {
  onStartNewSession?: (sessionType: SessionData['sessionType']) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ onStartNewSession }) => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);

  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadSessions();
    }
  }, [currentUser]);

  const loadSessions = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const userSessions = await firebaseService.getUserSessions(currentUser.uid, 20);
      setSessions(userSessions);
      
      // Check for active session (no end time)
      const active = userSessions.find(session => !session.endTime);
      setActiveSession(active || null);
      
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Error loading sessions / सत्र लोड करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  const startNewSession = async (sessionType: SessionData['sessionType']) => {
    if (!currentUser) return;

    try {
      const sessionData = {
        userId: currentUser.uid,
        startTime: new Date(),
        duration: 0,
        sessionType,
        interactions: [],
        emotionalJourney: [],
        progressMetrics: {
          emotionalRegulation: 0.5,
          selfAwareness: 0.5,
          copingSkillsUsage: 0.5,
          therapeuticAlliance: 0.5,
          engagementLevel: 0.5
        },
        riskAssessments: [],
        outcomes: {
          overallMood: 'stable' as const,
          goalsAddressed: [],
          skillsPracticed: [],
          insightsGained: []
        }
      };

      await firebaseService.createSession(sessionData);
      toast.success(`${sessionType} session started! / ${sessionType} सत्र शुरू हुआ!`);
      
      // Reload sessions to show the new one
      await loadSessions();
      
      if (onStartNewSession) {
        onStartNewSession(sessionType);
      }
      
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Error starting session / सत्र शुरू करने में त्रुटि');
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.sessionId === sessionId);
      if (!session) return;

      const duration = Date.now() - session.startTime.getTime();
      
      await firebaseService.endSession(sessionId, {
        duration,
        outcomes: {
          overallMood: 'stable',
          goalsAddressed: ['emotional_support'],
          skillsPracticed: ['conversation'],
          insightsGained: ['self_reflection']
        }
      });

      toast.success('Session ended successfully! / सत्र सफलतापूर्वक समाप्त हुआ!');
      await loadSessions();
      
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Error ending session / सत्र समाप्त करने में त्रुटि');
    }
  };

  const getSessionIcon = (sessionType: SessionData['sessionType']) => {
    switch (sessionType) {
      case 'chat': return <MessageCircle className="w-4 h-4" />;
      case 'voice': return <Activity className="w-4 h-4" />;
      case 'video': return <Brain className="w-4 h-4" />;
      case 'assessment': return <BarChart3 className="w-4 h-4" />;
      case 'crisis': return <AlertTriangle className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const getSessionTypeColor = (sessionType: SessionData['sessionType']) => {
    switch (sessionType) {
      case 'chat': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'voice': return 'bg-green-100 text-green-800 border-green-200';
      case 'video': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'assessment': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'crisis': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'improved': return 'text-green-600';
      case 'declined': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Manager</h1>
          <p className="text-gray-600">सत्र प्रबंधन / Manage your therapy sessions</p>
        </div>
      </div>

      {/* Active Session Alert */}
      {activeSession && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-green-900">Active Session</p>
                <p className="text-sm text-green-700 capitalize">
                  {activeSession.sessionType} session • Started {activeSession.startTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => endSession(activeSession.sessionId)}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              End Session
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Start Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Start New Session / नया सत्र शुरू करें</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50"
            onClick={() => startNewSession('chat')}
            disabled={!!activeSession}
          >
            <MessageCircle className="w-6 h-6 text-blue-500" />
            <span className="text-sm">Chat Session</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50"
            onClick={() => startNewSession('voice')}
            disabled={!!activeSession}
          >
            <Activity className="w-6 h-6 text-green-500" />
            <span className="text-sm">Voice Session</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-purple-50"
            onClick={() => startNewSession('video')}
            disabled={!!activeSession}
          >
            <Brain className="w-6 h-6 text-purple-500" />
            <span className="text-sm">Video Session</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-yellow-50"
            onClick={() => startNewSession('assessment')}
            disabled={!!activeSession}
          >
            <BarChart3 className="w-6 h-6 text-yellow-500" />
            <span className="text-sm">Assessment</span>
          </Button>
        </div>
      </Card>

      {/* Session History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Sessions / हाल के सत्र</h3>
          <Badge variant="secondary">{sessions.length} total sessions</Badge>
        </div>

        <div className="space-y-4">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session.sessionId}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Session Type Icon */}
                    <div className={`p-2 rounded-lg ${getSessionTypeColor(session.sessionType)}`}>
                      {getSessionIcon(session.sessionType)}
                    </div>
                    
                    {/* Session Details */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium capitalize">{session.sessionType} Session</h4>
                        {!session.endTime && (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{session.startTime.toLocaleDateString('en-IN')}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {session.endTime 
                              ? formatDuration(session.duration)
                              : `Started ${session.startTime.toLocaleTimeString()}`
                            }
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{session.interactions.length} interactions</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Session Outcome */}
                  <div className="text-right">
                    {session.endTime && (
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getMoodColor(session.outcomes.overallMood)}`}>
                          {session.outcomes.overallMood === 'improved' && '📈 Improved'}
                          {session.outcomes.overallMood === 'stable' && '➡️ Stable'}
                          {session.outcomes.overallMood === 'declined' && '📉 Needs attention'}
                        </span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                    
                    {/* Progress Metrics */}
                    <div className="text-xs text-gray-500 mt-1">
                      Engagement: {Math.round(session.progressMetrics.engagementLevel * 100)}%
                    </div>
                  </div>
                </div>

                {/* Risk Assessments */}
                {session.riskAssessments.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-yellow-700">
                        Risk assessments: {session.riskAssessments.length}
                      </span>
                      {session.riskAssessments.some(r => r.level !== 'none') && (
                        <Badge variant="destructive" className="text-xs">
                          Attention needed
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Goals Addressed */}
                {session.outcomes.goalsAddressed.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {session.outcomes.goalsAddressed.map((goal, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No sessions yet</p>
              <p className="text-sm">Start your first session to begin your mental wellness journey!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Session Statistics */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60000)}
            </div>
            <div className="text-sm text-gray-600">Total Minutes</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                sessions.reduce((sum, s) => sum + s.progressMetrics.engagementLevel, 0) / sessions.length * 100
              )}%
            </div>
            <div className="text-sm text-gray-600">Avg Engagement</div>
          </Card>
        </div>
      )}
    </div>
  );
};