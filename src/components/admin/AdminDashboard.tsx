import React, { useState, useEffect } from 'react';
import { supabaseService } from '../../services/supabaseService';
import type { UserProfile, JournalEntry, MoodEntry } from '../../services/supabaseService';
import { useAuth } from '../auth/AuthProvider';
import { Users, BookOpen, Heart, BarChart3, Settings, Database } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'journal' | 'mood' | 'analytics' | 'settings'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [appSettings, setAppSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const loadUserData = async () => {
      setLoading(true);
      try {
        // Load all user data
        const [profile, journal, mood, analyticsData, settings] = await Promise.all([
          supabaseService.getUserProfile(currentUser.id),
          supabaseService.getJournalEntries(currentUser.id, 10),
          supabaseService.getMoodEntries(currentUser.id, 50),
          supabaseService.getUserAnalytics(currentUser.id, 30),
          supabaseService.getAppSettings(currentUser.id)
        ]);

        setUserProfile(profile);
        setJournalEntries(journal);
        setMoodEntries(mood);
        setAnalytics(analyticsData);
        setAppSettings(settings);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem'
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)'
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    background: isActive ? '#667eea' : 'transparent',
    color: isActive ? 'white' : '#667eea',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  });

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <h1>Loading your data...</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ marginBottom: '2rem', color: '#333', textAlign: 'center' }}>
          📊 Your Haven Data Dashboard
        </h1>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem', 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button 
            style={tabStyle(activeTab === 'profile')}
            onClick={() => setActiveTab('profile')}
          >
            <Users size={18} />
            Profile
          </button>
          <button 
            style={tabStyle(activeTab === 'journal')}
            onClick={() => setActiveTab('journal')}
          >
            <BookOpen size={18} />
            Journal ({journalEntries.length})
          </button>
          <button 
            style={tabStyle(activeTab === 'mood')}
            onClick={() => setActiveTab('mood')}
          >
            <Heart size={18} />
            Mood ({moodEntries.length})
          </button>
          <button 
            style={tabStyle(activeTab === 'analytics')}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={18} />
            Analytics
          </button>
          <button 
            style={tabStyle(activeTab === 'settings')}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '400px' }}>
          
          {/* Profile Tab */}
          {activeTab === 'profile' && userProfile && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', color: '#667eea' }}>👤 User Profile</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
                  <h3>Basic Info</h3>
                  <p><strong>UID:</strong> {userProfile.uid}</p>
                  <p><strong>Email:</strong> {userProfile.email}</p>
                  <p><strong>Name:</strong> {userProfile.displayName}</p>
                  <p><strong>Created:</strong> {userProfile.createdAt.toLocaleDateString()}</p>
                  <p><strong>Last Login:</strong> {userProfile.lastLoginAt.toLocaleDateString()}</p>
                  <p><strong>Onboarding:</strong> {userProfile.onboardingComplete ? '✅ Complete' : '❌ Incomplete'}</p>
                </div>

                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
                  <h3>Preferences</h3>
                  <p><strong>Language:</strong> {userProfile.preferences.language}</p>
                  <p><strong>Cultural Background:</strong> {userProfile.preferences.culturalBackground}</p>
                  <p><strong>Communication Style:</strong> {userProfile.preferences.communicationStyle}</p>
                  <p><strong>Interests:</strong> {userProfile.preferences.interests.join(', ') || 'None'}</p>
                  <p><strong>Notifications:</strong> {userProfile.preferences.notificationsEnabled ? '✅ On' : '❌ Off'}</p>
                </div>

                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
                  <h3>Mental Health Profile</h3>
                  <p><strong>Risk Level:</strong> {userProfile.mentalHealthProfile.currentRiskLevel}</p>
                  <p><strong>Primary Concerns:</strong> {userProfile.mentalHealthProfile.primaryConcerns.join(', ') || 'None'}</p>
                  <p><strong>Goals:</strong> {userProfile.mentalHealthProfile.goals.join(', ') || 'None'}</p>
                  <p><strong>PHQ-9 Score:</strong> {userProfile.mentalHealthProfile.phq9Score || 'Not assessed'}</p>
                  <p><strong>GAD-7 Score:</strong> {userProfile.mentalHealthProfile.gad7Score || 'Not assessed'}</p>
                </div>

              </div>
            </div>
          )}

          {/* Journal Tab */}
          {activeTab === 'journal' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', color: '#667eea' }}>📝 Journal Entries</h2>
              {journalEntries.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {journalEntries.map((entry) => (
                    <div key={entry.entryId} style={{ 
                      padding: '1rem', 
                      background: '#f8f9fa', 
                      borderRadius: '0.5rem',
                      borderLeft: '4px solid #667eea'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4>{entry.title}</h4>
                        <span style={{ fontSize: '0.875rem', color: '#666' }}>
                          {entry.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ marginBottom: '0.5rem', color: '#555' }}>
                        {entry.content.substring(0, 200)}...
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#666' }}>
                        <span>Mood: {entry.mood}</span>
                        <span>Emotions: {entry.emotions.join(', ')}</span>
                        <span>Tags: {entry.tags.join(', ')}</span>
                        <span>Private: {entry.isPrivate ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#666' }}>No journal entries found.</p>
              )}
            </div>
          )}

          {/* Mood Tab */}
          {activeTab === 'mood' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', color: '#667eea' }}>😊 Mood Tracking</h2>
              {moodEntries.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {moodEntries.slice(0, 10).map((entry) => (
                    <div key={entry.entryId} style={{ 
                      padding: '1rem', 
                      background: '#f8f9fa', 
                      borderRadius: '0.5rem',
                      borderLeft: '4px solid #28a745'
                    }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>{entry.createdAt.toLocaleDateString()}</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <span>Mood: {entry.mood}/10</span>
                        <span>Energy: {entry.energy}/10</span>
                        <span>Anxiety: {entry.anxiety}/10</span>
                        <span>Sleep: {entry.sleep}/10</span>
                      </div>
                      {entry.notes && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#555' }}>
                          "{entry.notes}"
                        </p>
                      )}
                      {entry.activities && entry.activities.length > 0 && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                          Activities: {entry.activities.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#666' }}>No mood entries found.</p>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', color: '#667eea' }}>📈 Analytics (Last 30 Days)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                
                <div style={{ padding: '1rem', background: '#e3f2fd', borderRadius: '0.5rem' }}>
                  <h3 style={{ color: '#1976d2' }}>Mood Analytics</h3>
                  <p><strong>Average Mood:</strong> {analytics.mood.averageMood.toFixed(1)}/10</p>
                  <p><strong>Trend:</strong> {analytics.mood.moodTrend}</p>
                  <p><strong>Total Entries:</strong> {analytics.mood.totalEntries}</p>
                </div>

                <div style={{ padding: '1rem', background: '#f3e5f5', borderRadius: '0.5rem' }}>
                  <h3 style={{ color: '#7b1fa2' }}>Journal Analytics</h3>
                  <p><strong>Total Entries:</strong> {analytics.journal.totalEntries}</p>
                  <p><strong>Avg Words/Entry:</strong> {Math.round(analytics.journal.averageWordsPerEntry)}</p>
                  <p><strong>Common Emotions:</strong> {analytics.journal.mostCommonEmotions.slice(0, 3).join(', ')}</p>
                </div>

                <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '0.5rem' }}>
                  <h3 style={{ color: '#388e3c' }}>Session Analytics</h3>
                  <p><strong>Total Sessions:</strong> {analytics.sessions.totalSessions}</p>
                  <p><strong>Avg Duration:</strong> {Math.round(analytics.sessions.averageDuration / 60000)}min</p>
                  <p><strong>Session Types:</strong></p>
                  <ul style={{ fontSize: '0.875rem', marginLeft: '1rem' }}>
                    {Object.entries(analytics.sessions.sessionTypes).map(([type, count]) => (
                      <li key={type}>{type}: {count as number}</li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && appSettings && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', color: '#667eea' }}>⚙️ App Settings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
                  <h3>General</h3>
                  <p><strong>Theme:</strong> {appSettings.theme}</p>
                  <p><strong>Language:</strong> {appSettings.language}</p>
                </div>

                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
                  <h3>Notifications</h3>
                  <p><strong>Enabled:</strong> {appSettings.notifications.enabled ? '✅' : '❌'}</p>
                  <p><strong>Daily Check-in:</strong> {appSettings.notifications.dailyCheckIn ? '✅' : '❌'}</p>
                  <p><strong>Mood Reminders:</strong> {appSettings.notifications.moodReminders ? '✅' : '❌'}</p>
                  <p><strong>Crisis Alerts:</strong> {appSettings.notifications.crisisAlerts ? '✅' : '❌'}</p>
                </div>

                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
                  <h3>Privacy</h3>
                  <p><strong>Data Sharing:</strong> {appSettings.privacy.dataSharing ? '✅' : '❌'}</p>
                  <p><strong>Analytics:</strong> {appSettings.privacy.analytics ? '✅' : '❌'}</p>
                  <p><strong>Crash Reporting:</strong> {appSettings.privacy.crashReporting ? '✅' : '❌'}</p>
                </div>

                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
                  <h3>AI Preferences</h3>
                  <p><strong>Personality:</strong> {appSettings.aiPreferences.personality}</p>
                  <p><strong>Response Length:</strong> {appSettings.aiPreferences.responseLength}</p>
                  <p><strong>Cultural Context:</strong> {appSettings.aiPreferences.culturalContext ? '✅' : '❌'}</p>
                  <p><strong>Hindi Support:</strong> {appSettings.aiPreferences.hindiSupport ? '✅' : '❌'}</p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Raw Data Export */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={() => {
              const data = {
                userProfile,
                journalEntries,
                moodEntries,
                analytics,
                appSettings
              };
              console.log('Complete User Data:', data);
              alert('Check browser console for complete data export!');
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto'
            }}
          >
            <Database size={18} />
            Export Raw Data to Console
          </button>
        </div>

      </div>
    </div>
  );
};