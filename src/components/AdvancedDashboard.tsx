import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, TrendingUp, Users, Calendar, Activity, BarChart3, MessageCircle, BookOpen, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import VantaBackground from './VantaBackground';
import AssessmentSystem from './AssessmentSystem';
import type { Screen } from '../types';
import { useAuth } from './auth/AuthProvider';
import { supabaseService } from '../services/supabaseService';
import { getUserConversations } from '../services/localChatStorage';
import { toast } from 'sonner';

interface AdvancedDashboardProps {
  userId: string;
  navigateTo: (screen: Screen) => void;
}

interface DashboardData {
  userName: string;
  wellnessScore: number;
  sessionCount: number;
  avgSessionDuration: number;
  emotionalTrend: string;
  riskLevel: string;
  lastJournalEntry: any;
  lastConversation: any;
  recentSessions: any[];
  aiInsight: string;
}

export function AdvancedDashboard({ userId, navigateTo }: AdvancedDashboardProps) {
  const { currentTheme } = useTheme();
  const { currentUser, userProfile } = useAuth();
  const [showAssessments, setShowAssessments] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Poll for currentUser since auth resolves async after mount.
    // Keeping only [userId] in deps avoids the autofix stripping currentUser.
    let alive = true;
    (async () => {
      for (let i = 0; i < 40; i++) { // wait up to 10s
        if (currentUser || !alive) break;
        await new Promise(r => setTimeout(r, 250));
      }
      if (alive) loadDashboardData();
    })();
    return () => { alive = false; };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboardData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Fetch user data
      const userName = userProfile?.displayName || currentUser.email?.split('@')[0] || 'User';
      
      // Fetch journal entries
      const journalEntries = await supabaseService.getJournalEntries(userId, 1);
      const lastJournal = journalEntries[0] || null;
      
      // Fetch conversations
      const conversations = await getUserConversations(userId);
      const lastConv = conversations[0] || null;
      
      // Fetch sessions
      const sessions = await supabaseService.getUserSessions(userId, 5);
      
      // Fetch analytics
      const analytics = await supabaseService.getUserAnalytics(userId, 7);
      
      // Calculate wellness score (0-100)
      const wellnessScore = calculateWellnessScore(analytics, sessions);
      
      // Determine emotional trend
      const emotionalTrend = determineEmotionalTrend(sessions);
      
      // Calculate risk level
      const riskLevel = calculateRiskLevel(sessions);
      
      // Generate AI insight
      const aiInsight = await generateAIInsight(userName, wellnessScore, emotionalTrend, sessions);
      
      setDashboardData({
        userName,
        wellnessScore,
        sessionCount: sessions.length,
        avgSessionDuration: calculateAvgDuration(sessions),
        emotionalTrend,
        riskLevel,
        lastJournalEntry: lastJournal,
        lastConversation: lastConv,
        recentSessions: sessions,
        aiInsight
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateWellnessScore = (analytics: any, sessions: any[]): number => {
    // Simple wellness score calculation based on activity
    let score = 50; // Base score
    
    if (sessions.length > 0) score += 10;
    if (sessions.length > 5) score += 10;
    if (analytics?.totalActivities > 10) score += 10;
    
    // Check for recent activity (last 7 days)
    const recentActivity = sessions.filter(s => {
      const sessionDate = s.startTime?.toDate?.() || new Date(s.startTime);
      const daysSince = (Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });
    
    if (recentActivity.length > 0) score += 10;
    if (recentActivity.length > 3) score += 10;
    
    return Math.min(score, 100);
  };

  const determineEmotionalTrend = (sessions: any[]): string => {
    if (sessions.length === 0) return 'Stable';
    
    // Analyze recent sessions for emotional patterns
    const recentEmotions = sessions.slice(0, 3).flatMap(s => 
      s.emotionalJourney?.map((e: any) => e.emotion) || []
    );
    
    if (recentEmotions.length === 0) return 'Stable';
    
    const positiveEmotions = ['happy', 'calm', 'hopeful', 'grateful', 'content'];
    const positiveCount = recentEmotions.filter((e: string) => 
      positiveEmotions.some(pe => e.toLowerCase().includes(pe))
    ).length;
    
    const ratio = positiveCount / recentEmotions.length;
    
    if (ratio > 0.6) return 'Improving';
    if (ratio < 0.3) return 'Needs Attention';
    return 'Stable';
  };

  const calculateRiskLevel = (sessions: any[]): string => {
    if (sessions.length === 0) return 'Low';
    
    // Check for crisis indicators in recent sessions
    const recentSessions = sessions.slice(0, 3);
    const hasCrisisIndicators = recentSessions.some(s => 
      s.riskAssessments?.some((r: any) => r.level === 'high' || r.level === 'severe')
    );
    
    if (hasCrisisIndicators) return 'High';
    
    const hasModerateRisk = recentSessions.some(s => 
      s.riskAssessments?.some((r: any) => r.level === 'moderate')
    );
    
    if (hasModerateRisk) return 'Moderate';
    
    return 'Low';
  };

  const calculateAvgDuration = (sessions: any[]): number => {
    if (sessions.length === 0) return 0;
    
    const durations = sessions
      .filter(s => s.endTime && s.startTime)
      .map(s => {
        const start = s.startTime?.toDate?.() || new Date(s.startTime);
        const end = s.endTime?.toDate?.() || new Date(s.endTime);
        return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
      });
    
    if (durations.length === 0) return 0;
    
    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  };

  const generateAIInsight = async (userName: string, score: number, trend: string, sessions: any[]): Promise<string> => {
    // Generate personalized insight based on user data
    const insights = [
      `Hello ${userName}, your wellness score of ${score} reflects your consistent engagement with your mental health journey. Keep up the great work!`,
      `${userName}, your emotional trend is ${trend.toLowerCase()}. This shows you're making meaningful progress in understanding and managing your emotions.`,
      `Great to see you here, ${userName}! With ${sessions.length} sessions completed, you're building strong mental wellness habits.`,
      `${userName}, your dedication to mental wellness is inspiring. Your ${trend.toLowerCase()} emotional trend shows the positive impact of your efforts.`
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  };

  const handleAssessmentComplete = (results: any) => {
    setAssessmentResults(prev => [...prev.filter(r => r.assessmentId !== results.assessmentId), results]);
    setShowAssessments(false);
  };

  if (showAssessments) {
    return (
      <AssessmentSystem 
        onBack={() => setShowAssessments(false)}
        onComplete={handleAssessmentComplete}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load dashboard data</p>
          <Button onClick={loadDashboardData} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen p-6 ${
      currentTheme === 'whatsapp' ? 'whatsapp-main-bg' : ''
    }`}>
      <VantaBackground variant="local" />
      
      <div className={`relative max-w-6xl mx-auto ${
        currentTheme === 'whatsapp' ? '' : ''
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo('home')}
              className="mr-4 hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className={`text-2xl font-bold ${
                currentTheme === 'whatsapp' ? '!text-black' : 'text-gray-900'
              }`}>
                Hello {dashboardData.userName}!
              </h1>
              <p className={`${
                currentTheme === 'whatsapp' ? '!text-black/70' : 'text-gray-600'
              }`}>
                Your mental wellness journey
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white">Week</Button>
            <Button variant="ghost" size="sm">Month</Button>
            <Button variant="ghost" size="sm">Year</Button>
            <Button variant="outline" size="sm" className="bg-white">🔄 Refresh</Button>
            <Button variant="outline" size="sm" className="bg-white">💡 Tips</Button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Wellness Score */}
          <Card className={`p-6 ${
            currentTheme === 'whatsapp' ? 'bg-white/90 border border-gray-200' : 'bg-white border border-gray-200'
          }`}>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Wellness Score</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.wellnessScore}/100</div>
              <div className={`text-sm font-medium ${
                dashboardData.wellnessScore >= 70 ? 'text-green-600' : 
                dashboardData.wellnessScore >= 50 ? 'text-yellow-600' : 'text-orange-600'
              }`}>
                {dashboardData.wellnessScore >= 70 ? 'Great' : 
                 dashboardData.wellnessScore >= 50 ? 'Good' : 'Needs Attention'}
              </div>
            </div>
          </Card>

          {/* Sessions */}
          <Card className={`p-6 ${
            currentTheme === 'whatsapp' ? 'bg-white/90 border border-gray-200' : 'bg-white border border-gray-200'
          }`}>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Sessions</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.sessionCount}</div>
              <div className="text-sm text-gray-500">Avg: {dashboardData.avgSessionDuration} min</div>
            </div>
          </Card>

          {/* Emotional Trend */}
          <Card className={`p-6 ${
            currentTheme === 'whatsapp' ? 'bg-white/90 border border-gray-200' : 'bg-white border border-gray-200'
          }`}>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Emotional Trend</span>
              </div>
              <div className="text-lg font-bold text-gray-900 mb-1">{dashboardData.emotionalTrend}</div>
              <div className={`text-sm font-medium ${
                dashboardData.emotionalTrend === 'Improving' ? 'text-green-600' :
                dashboardData.emotionalTrend === 'Needs Attention' ? 'text-orange-600' : 'text-blue-600'
              }`}>
                📊 {dashboardData.emotionalTrend}
              </div>
            </div>
          </Card>

          {/* Clinical Risk */}
          <Card className={`p-6 ${
            currentTheme === 'whatsapp' ? 'bg-white/90 border border-gray-200' : 'bg-white border border-gray-200'
          }`}>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Clinical Risk Indicator</span>
              </div>
              <div className={`text-lg font-bold mb-1 ${
                dashboardData.riskLevel === 'Low' ? 'text-green-600' :
                dashboardData.riskLevel === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {dashboardData.riskLevel === 'Low' ? 'कम / Low' :
                 dashboardData.riskLevel === 'Moderate' ? 'मध्यम / Moderate' : 'उच्च / High'}
              </div>
              <div className="text-xs text-gray-500">
                {dashboardData.riskLevel === 'Low' ? 'जारी रखें / Continue wellness practices' :
                 dashboardData.riskLevel === 'Moderate' ? 'Consider professional support' : 
                 'Please seek professional help'}
              </div>
            </div>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Today's AI Insight */}
            <Card className={`p-6 ${
              currentTheme === 'whatsapp' ? 'bg-white/90 border border-gray-200' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Today's AI Insight</h3>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <p className="text-sm text-green-800 italic leading-relaxed">
                  "{dashboardData.aiInsight}"
                </p>
              </div>
            </Card>

            {/* Recent Sessions */}
            <Card className={`p-6 ${
              currentTheme === 'whatsapp' ? 'bg-white/90 border border-gray-200' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
                </div>
                <span className="text-sm text-blue-600 font-medium">{dashboardData.recentSessions.length} sessions</span>
              </div>
              {dashboardData.recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentSessions.slice(0, 3).map((session, idx) => (
                    <div key={idx} className="border-l-4 border-blue-400 pl-4 py-2">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {session.activityType?.replace(/_/g, ' ') || 'Session'}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {session.startTime?.toDate?.()?.toLocaleDateString() || 'Recent'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No recent sessions to display. Start your first session!
                </div>
              )}
            </Card>

            {/* Your Recent Activity */}
            <Card className={`p-6 ${
              currentTheme === 'whatsapp' ? 'bg-white/90 border border-gray-200' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center mb-4">
                <BookOpen className="w-5 h-5 text-purple-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Your Recent Activity</h3>
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-purple-400 pl-4 py-2">
                  <h4 className="font-medium text-gray-900">Last Journal Entry</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    This is your first journal entry. Haven is here to support your mental health journey with AI-powered insights and personalized care.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">21/9/2025</p>
                </div>
                <div className="border-l-4 border-blue-400 pl-4 py-2">
                  <h4 className="font-medium text-gray-900">Last Conversation</h4>
                  <p className="text-sm text-gray-600 mt-1">I feel anxious</p>
                  <p className="text-xs text-gray-400 mt-2">Invalid Date</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className={`p-6 ${
              currentTheme === 'whatsapp' ? 'bg-white/90 border border-gray-200' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigateTo('ai-companion')}
                  className="w-full justify-start bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  Talk to Companion
                </Button>
                <Button 
                  onClick={() => setShowAssessments(true)}
                  className="w-full justify-start bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Take Assessment
                </Button>
                <Button 
                  onClick={() => navigateTo('calm-down')}
                  className="w-full justify-start bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Activity className="w-4 h-4 mr-3" />
                  Start Voice Session
                </Button>
              </div>
            </Card>

            {/* Assessment Scores */}
            <Card className={`p-6 ${
              currentTheme === 'whatsapp' ? 'bg-white/90 border border-gray-200' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Assessment Scores</h3>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white"
                  onClick={() => setShowAssessments(true)}
                >
                  Take Assessment
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">PHQ-9 (Depression)</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {assessmentResults.find(r => r.assessmentId === 'phq9') ? 
                      `Score: ${assessmentResults.find(r => r.assessmentId === 'phq9')?.totalScore}` : 
                      'Not taken'
                    }
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => setShowAssessments(true)}
                  >
                    📊 Take Assessment
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    {assessmentResults.find(r => r.assessmentId === 'phq9') ? 
                      'Assessment completed' : 
                      'No PHQ-9 data available'
                    }
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">GAD-7 (Anxiety)</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {assessmentResults.find(r => r.assessmentId === 'gad7') ? 
                      `Score: ${assessmentResults.find(r => r.assessmentId === 'gad7')?.totalScore}` : 
                      'Not taken'
                    }
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => setShowAssessments(true)}
                  >
                    📊 Take Assessment
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    {assessmentResults.find(r => r.assessmentId === 'gad7') ? 
                      'Assessment completed' : 
                      'No GAD-7 data available'
                    }
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}