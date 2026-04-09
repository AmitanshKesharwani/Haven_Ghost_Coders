import React, { useState } from 'react';
import AssessmentDemo from './components/AssessmentDemo';
import DemoLauncher from './components/DemoLauncher';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'launcher' | 'assessment' | 'activities' | 'insights'>('launcher');

  const demos = [
    {
      id: 'assessment',
      title: '🧠 Conversational Assessment',
      description: 'Experience PHQ-9 transformed into natural conversation',
      status: '✅ Implemented'
    },
    {
      id: 'activities',
      title: '🎯 Therapeutic Activities',
      description: 'AI-powered therapeutic interventions and exercises',
      status: '🚧 In Progress'
    },
    {
      id: 'insights',
      title: '📊 Real-time Insights',
      description: 'Immediate feedback and personalized recommendations',
      status: '🚧 In Progress'
    }
  ];

  const handleLaunchDemo = (demoId: string) => {
    setCurrentView(demoId as any);
  };

  // Show launcher by default, or specific demo if selected
  if (currentView === 'launcher') {
    return <DemoLauncher onLaunchDemo={handleLaunchDemo} />;
  }

  return (
    <ErrorBoundary>
      <div className="app">
      <header className="app-header">
        <div className="header-content">
          <button 
            onClick={() => setCurrentView('launcher')}
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#15803d',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '20px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            ← Back to Demo Launcher
          </button>
          
          <h1>🌟 Mann-Mitra Funding Demo</h1>
          <p>AI-Powered Mental Health Platform for Indian Youth</p>
        </div>
      </header>

      <main className="app-main">
        {currentView === 'assessment' && <AssessmentDemo />}
        
        {currentView === 'activities' && (
          <div className="coming-soon">
            <h2>🎯 Therapeutic Activities Engine</h2>
            <p>Coming next! This will showcase:</p>
            <ul>
              <li>AI-guided CBT exercises</li>
              <li>Mindfulness and breathing activities</li>
              <li>Cultural therapy modules</li>
              <li>Real-time adaptation based on user engagement</li>
            </ul>
          </div>
        )}
        
        {currentView === 'insights' && (
          <div className="coming-soon">
            <h2>📊 Real-time Insights Dashboard</h2>
            <p>Coming next! This will showcase:</p>
            <ul>
              <li>Immediate assessment feedback</li>
              <li>Progress tracking and analytics</li>
              <li>Personalized recommendations</li>
              <li>Cultural context integration</li>
            </ul>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="implementation-status">
            <h3>🚀 Implementation Status</h3>
            <div className="status-grid">
              <div className="status-item completed">
                <span className="status-icon">✅</span>
                <div>
                  <h4>AI Orchestration Infrastructure</h4>
                  <p>Centralized AI coordination system</p>
                </div>
              </div>
              <div className="status-item completed">
                <span className="status-icon">✅</span>
                <div>
                  <h4>Activity Engine Framework</h4>
                  <p>Base architecture for therapeutic activities</p>
                </div>
              </div>
              <div className="status-item completed">
                <span className="status-icon">✅</span>
                <div>
                  <h4>Cultural Intelligence AI</h4>
                  <p>Indian cultural context understanding</p>
                </div>
              </div>
              <div className="status-item completed">
                <span className="status-icon">✅</span>
                <div>
                  <h4>Conversational Assessment</h4>
                  <p>PHQ-9/GAD-7 transformed to conversations</p>
                </div>
              </div>
              <div className="status-item in-progress">
                <span className="status-icon">🚧</span>
                <div>
                  <h4>Real-time Assessment Insights</h4>
                  <p>Immediate feedback and recommendations</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="key-features">
            <h3>🎯 Key Features Demonstrated</h3>
            <div className="features-grid">
              <div className="feature">
                <span className="feature-icon">🗣️</span>
                <span>Natural Conversation Flow</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🧠</span>
                <span>AI Response Processing</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🎭</span>
                <span>Emotional Tone Detection</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🇮🇳</span>
                <span>Cultural Context Integration</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚠️</span>
                <span>Risk Level Assessment</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💡</span>
                <span>Personalized Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;