import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { firebaseService } from '../../services/firebaseService';
import { createConversation, addMessage } from '../../services/localChatStorage';
import { toast } from 'sonner';
import { Zap, CheckCircle } from 'lucide-react';

export const QuickSetup: React.FC = () => {
  const { currentUser } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const runQuickSetup = async () => {
    if (!currentUser) {
      toast.error('Please sign in first!');
      return;
    }

    setIsRunning(true);
    
    try {
      // 1. Create a simple journal entry
      await firebaseService.createJournalEntry({
        userId: currentUser.id,
        title: 'Welcome to Haven!',
        content: 'This is your first journal entry. Haven is here to support your mental health journey with AI-powered insights and personalized care.',
        mood: 'happy',
        emotions: ['hopeful', 'excited'],
        tags: ['welcome', 'first-entry'],
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 2. Create a mood entry
      await firebaseService.createMoodEntry({
        userId: currentUser.id,
        mood: 8,
        energy: 7,
        anxiety: 3,
        sleep: 8,
        notes: 'Feeling optimistic about starting my mental health journey!',
        activities: ['setup', 'exploration'],
        createdAt: new Date()
      });

      // 3. Create app settings
      await firebaseService.saveAppSettings({
        userId: currentUser.id,
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
      });

      // 4. Create a conversation
      const conversationId = await createConversation(currentUser.id, 'general', 'supportive');

      // 5. Add a welcome message
      await addMessage(
        conversationId,
        'ai',
        'Welcome to Haven! I\'m here to support you on your mental health journey. How are you feeling today?',
        'text',
        {
          sentiment: 0.8,
          aiModel: 'groq',
          responseTime: 1000
        }
      );

      setCompleted(true);
      toast.success('🎉 Quick setup completed! Your Firebase is now populated with sample data.');
      
    } catch (error) {
      console.error('Quick setup error:', error);
      toast.error('Setup failed. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '1rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '2rem auto'
  };

  if (completed) {
    return (
      <div style={containerStyle}>
        <CheckCircle size={64} style={{ color: '#10b981', marginBottom: '1rem' }} />
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>✅ Setup Complete!</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Your Firebase database is now populated with sample data. You can:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
          <span>📝 View journal entries</span>
          <span>😊 Check mood tracking data</span>
          <span>💬 See AI conversations</span>
          <span>⚙️ Review app settings</span>
        </div>
        <button
          onClick={() => window.location.href = '/admin'}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          View Your Data →
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Zap size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
      <h2 style={{ color: '#333', marginBottom: '1rem' }}>⚡ Quick Setup</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Instantly populate your Firebase with essential sample data to get started.
      </p>
      
      <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
        <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>This will create:</h4>
        <ul style={{ color: '#666', lineHeight: '1.6' }}>
          <li>✅ Welcome journal entry</li>
          <li>✅ Sample mood data</li>
          <li>✅ AI conversation</li>
          <li>✅ App settings</li>
        </ul>
      </div>

      <button
        onClick={runQuickSetup}
        disabled={isRunning || !currentUser}
        style={{
          width: '100%',
          padding: '1rem 2rem',
          background: isRunning ? '#94a3b8' : '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        {isRunning ? (
          <>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #ffffff40',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Setting up...
          </>
        ) : (
          <>
            <Zap size={20} />
            ⚡ Quick Setup (30 seconds)
          </>
        )}
      </button>

      {!currentUser && (
        <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '1rem' }}>
          Please sign in first to run setup
        </p>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};