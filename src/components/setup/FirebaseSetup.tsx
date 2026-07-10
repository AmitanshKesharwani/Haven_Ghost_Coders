import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { firebaseService } from '../../services/firebaseService';
import { createConversation, addMessage } from '../../services/localChatStorage';
import { toast } from 'sonner';
import { Database, AlertCircle, Play } from 'lucide-react';
import { QuickSetup } from './QuickSetup';
type MoodEntry = {
  userId: string;
  mood: number;
  energy: number;
  anxiety: number;
  sleep: number;
  notes: string;
  activities: string[];
  triggers: string[];
  location: string;
  createdAt: Date;
};


export const FirebaseSetup: React.FC = () => {
  const { currentUser } = useAuth();
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const [setupResults, setSetupResults] = useState<string[]>([]);

  const addResult = (message: string, success: boolean = true) => {
    setSetupResults(prev => [...prev, `${success ? '✅' : '❌'} ${message}`]);
  };

  const runCompleteSetup = async () => {
    if (!currentUser) {
      toast.error('Please sign in first!');
      return;
    }

    setIsSetupRunning(true);
    setSetupResults([]);
    addResult('Starting Firebase setup...');

    try {
      // 1. Clear any existing demo entries and set up clean journal
      addResult('Clearing any existing demo entries...');
      
      try {
        const existingEntries = await firebaseService.getJournalEntries(currentUser.id, 50);
        const demoEntries = existingEntries.filter(entry => 
          entry.title.includes('My First Day with Haven') ||
          entry.title.includes('Dealing with Work Stress') ||
          entry.title.includes('Feeling Better Today')
        );
        
        for (const demoEntry of demoEntries) {
          await firebaseService.deleteJournalEntry(demoEntry.entryId);
        }
        
        if (demoEntries.length > 0) {
          addResult(`Removed ${demoEntries.length} demo journal entries`);
        } else {
          addResult('No demo entries found to remove');
        }
      } catch (error) {
        addResult('Journal setup ready (clean slate)');
      }

      // 2. Create Mood Entries
      addResult('Creating mood tracking data...');
      const moodEntries: MoodEntry[] = [];
      for (let i = 7; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const mood = Math.floor(Math.random() * 4) + 6; // 6-10 range
        const entry = {
          userId: currentUser.id,
          mood: mood,
          energy: Math.floor(Math.random() * 3) + 7,
          anxiety: Math.floor(Math.random() * 4) + 2,
          sleep: Math.floor(Math.random() * 3) + 7,
          notes: i === 0 ? 'Feeling great today after meditation!' : 
                 i === 1 ? 'Work stress is manageable' :
                 i === 3 ? 'Had a tough day but practiced breathing' : '',
          activities: i % 2 === 0 ? ['meditation', 'exercise'] : ['reading', 'music'],
          triggers: i === 3 ? ['work deadline'] : [],
          location: 'home',
          createdAt: date
        };
        await firebaseService.createMoodEntry(entry);
        moodEntries.push(entry);
      }
      addResult(`Created ${moodEntries.length} mood entries`);

      // 3. Create Chat Conversation
      addResult('Creating chat conversation...');
      const conversationId = await createConversation(currentUser.id, 'therapy', 'supportive');

      // Add messages to conversation
      const messages = [
        {
          conversationId,
          sender: 'user' as const,
          content: 'Hi, I\'ve been feeling anxious lately and need some support.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          messageType: 'text' as const,
          metadata: { sentiment: -0.3, emotions: ['anxious'], riskLevel: 'low' as const }
        },
        {
          conversationId,
          sender: 'ai' as const,
          content: 'I understand you\'re feeling anxious, and I\'m here to support you. Anxiety is very common and manageable. Can you tell me more about what\'s been triggering these feelings?',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
          messageType: 'text' as const,
          metadata: { sentiment: 0.7, aiModel: 'groq', responseTime: 1200 }
        },
        {
          conversationId,
          sender: 'user' as const,
          content: 'It\'s mainly work stress and some personal relationships. I feel overwhelmed.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          messageType: 'text' as const,
          metadata: { sentiment: -0.5, emotions: ['overwhelmed', 'stressed'], riskLevel: 'low' as const }
        },
        {
          conversationId,
          sender: 'ai' as const,
          content: 'Work stress and relationship concerns can definitely feel overwhelming. Let\'s work on some coping strategies. Have you tried the 4-7-8 breathing technique? It can help calm your nervous system when you\'re feeling stressed.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 45000),
          messageType: 'text' as const,
          metadata: { sentiment: 0.8, aiModel: 'groq', responseTime: 1500 }
        }
      ];

      for (const message of messages) {
        await addMessage(
          message.conversationId,
          message.sender,
          message.content,
          message.messageType,
          message.metadata
        );
      }
      addResult(`Created conversation with ${messages.length} messages`);

      // 4. Create Assessment Results
      addResult('Creating assessment results...');
      const assessmentResult = {
        userId: currentUser.id,
        assessmentType: 'phq9' as const,
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        responses: {
          'q1': 1, 'q2': 2, 'q3': 1, 'q4': 0, 'q5': 1,
          'q6': 2, 'q7': 1, 'q8': 0, 'q9': 0
        },
        scores: {
          totalScore: 8,
          severity: 'mild' as const,
          recommendations: [
            'Continue regular exercise and healthy sleep habits',
            'Practice mindfulness and stress reduction techniques',
            'Consider talking to a counselor if symptoms persist'
          ]
        },
        comparedToPrevious: {
          previousScore: 12,
          change: -4,
          trend: 'improving' as const
        }
      };
      await firebaseService.saveAssessmentResult(assessmentResult);
      addResult('Created PHQ-9 assessment result');

      // 5. Create Progress Data
      addResult('Creating progress tracking data...');
      const progressData = {
        userId: currentUser.id,
        date: new Date(),
        metrics: {
          overallWellbeing: 7,
          moodStability: 6,
          anxietyLevel: 4,
          sleepQuality: 8,
          socialConnection: 6,
          copingSkills: 7
        },
        goals: [
          {
            goalId: 'goal1',
            title: 'Practice daily meditation',
            progress: 75,
            completed: false
          },
          {
            goalId: 'goal2',
            title: 'Exercise 3 times per week',
            progress: 60,
            completed: false
          },
          {
            goalId: 'goal3',
            title: 'Maintain sleep schedule',
            progress: 90,
            completed: false
          }
        ],
        achievements: ['Completed first week of meditation', '7-day mood tracking streak'],
        challenges: ['Work-life balance', 'Social anxiety in group settings']
      };
      await firebaseService.saveProgressData(progressData);
      addResult('Created progress tracking data');

      // 6. Create App Settings
      addResult('Creating app settings...');
      const appSettings = {
        userId: currentUser.id,
        theme: 'auto' as const,
        language: 'mixed' as const,
        notifications: {
          enabled: true,
          dailyCheckIn: true,
          moodReminders: true,
          crisisAlerts: true,
          progressUpdates: true,
          quietHours: {
            enabled: true,
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
          fontSize: 'medium' as const,
          highContrast: false,
          screenReader: false,
          reducedMotion: false
        },
        aiPreferences: {
          personality: 'supportive' as const,
          responseLength: 'detailed' as const,
          culturalContext: true,
          hindiSupport: true
        }
      };
      await firebaseService.saveAppSettings(appSettings);
      addResult('Created app settings');

      // 7. Create Crisis Event (for testing)
      addResult('Creating sample crisis event...');
      try {
        const crisisEvent = {
          userId: currentUser.id,
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          severity: 'moderate' as const,
          triggerMessage: 'I feel like everything is falling apart and I can\'t handle it anymore',
          detectedIndicators: ['hopelessness', 'overwhelming stress', 'emotional distress'],
          interventionsTaken: [
            'Provided immediate coping strategies',
            'Shared crisis helpline numbers',
            'Scheduled follow-up check-in'
          ],
          helplinesCalled: ['1800-599-0019', '14416'],
          professionalReferral: false,
          followUpScheduled: true,
          resolution: 'resolved' as const,
          notes: 'User responded well to breathing exercises and felt better after 30 minutes'
        };
        await firebaseService.logCrisisEvent(crisisEvent);
        addResult('Created crisis event record');
      } catch (error) {
        addResult('Crisis event creation failed - method may not exist yet', false);
      }

      // 8. Update User Profile with more data
      addResult('Updating user profile...');
      await firebaseService.updateUserProfile(currentUser.id, {
        preferences: {
          language: 'mixed',
          culturalBackground: 'indian',
          communicationStyle: 'casual',
          interests: ['meditation', 'yoga', 'music', 'reading'],
          comfortEnvironment: 'quiet spaces with soft music',
          avatarStyle: 'friendly',
          notificationsEnabled: true,
          crisisContactName: 'Emergency Contact',
          crisisContactPhone: '1800-599-0019'
        },
        mentalHealthProfile: {
          primaryConcerns: ['anxiety', 'work stress', 'sleep issues'],
          goals: ['reduce anxiety', 'improve sleep', 'better work-life balance'],
          riskFactors: ['work pressure', 'social isolation'],
          protectiveFactors: ['supportive family', 'regular exercise', 'meditation practice'],
          currentRiskLevel: 'low',
          lastAssessmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          phq9Score: 8,
          gad7Score: 6
        },
        therapeuticPlan: {
          primaryGoals: ['anxiety management', 'stress reduction'],
          secondaryGoals: ['improved sleep', 'social confidence'],
          interventionStrategies: ['CBT techniques', 'mindfulness', 'breathing exercises'],
          progressMilestones: {
            'first_week_complete': true,
            'mood_tracking_started': true,
            'coping_skills_learned': true,
            'crisis_plan_created': false
          },
          lastUpdated: new Date()
        }
      });
      addResult('Updated user profile with comprehensive data');

      addResult('🎉 Firebase setup completed successfully!', true);
      toast.success('Firebase setup completed! All collections are now populated with sample data.');

    } catch (error) {
      console.error('Setup error:', error);
      addResult(`Setup failed: ${error}`, false);
      toast.error('Setup failed. Check console for details.');
    } finally {
      setIsSetupRunning(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '1rem',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Database size={48} style={{ color: '#667eea', marginBottom: '1rem' }} />
          <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>
            🚀 Haven Firebase Setup
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Launch-ready in 2 days! Let's populate your Firebase with real data.
          </p>
        </div>

        {!currentUser ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertCircle size={32} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
            <p style={{ color: '#666' }}>Please sign in first to run the setup.</p>
          </div>
        ) : (
          <>
            {/* Quick Setup Option */}
            <QuickSetup />
            
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <div style={{ height: '1px', background: '#e5e7eb', margin: '1rem 0' }} />
              <span style={{ color: '#666', fontSize: '0.875rem' }}>OR</span>
              <div style={{ height: '1px', background: '#e5e7eb', margin: '1rem 0' }} />
            </div>
          </>
        )}

        {currentUser && (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>What this setup will create:</h3>
              <ul style={{ color: '#666', lineHeight: '1.6' }}>
                <li>✅ Journal system ready (no demo entries)</li>
                <li>✅ 8 Days of mood tracking data</li>
                <li>✅ Complete chat conversation with AI</li>
                <li>✅ PHQ-9 assessment results</li>
                <li>✅ Progress tracking metrics</li>
                <li>✅ App settings configuration</li>
                <li>✅ Crisis event record (for testing)</li>
                <li>✅ Enhanced user profile data</li>
              </ul>
            </div>

            <button
              onClick={runCompleteSetup}
              disabled={isSetupRunning}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: isSetupRunning ? '#94a3b8' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: isSetupRunning ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '2rem'
              }}
            >
              {isSetupRunning ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #ffffff40',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Setting up Firebase...
                </>
              ) : (
                <>
                  <Play size={20} />
                  🚀 Run Complete Setup
                </>
              )}
            </button>

            {setupResults.length > 0 && (
              <div style={{
                background: '#f8f9fa',
                borderRadius: '0.5rem',
                padding: '1rem',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <h4 style={{ color: '#333', marginBottom: '1rem' }}>Setup Progress:</h4>
                {setupResults.map((result, index) => (
                  <div key={index} style={{
                    padding: '0.25rem 0',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    color: result.startsWith('❌') ? '#dc2626' : '#059669'
                  }}>
                    {result}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {currentUser && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              After setup, visit <strong>/admin</strong> to view all your data!
            </p>
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};