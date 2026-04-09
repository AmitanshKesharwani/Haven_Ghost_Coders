import React, { useState } from 'react';

interface DemoLauncherProps {
  onLaunchDemo: (demoId: string) => void;
}

const DemoLauncher: React.FC<DemoLauncherProps> = ({ onLaunchDemo }) => {
  const [selectedDemo, setSelectedDemo] = useState<string>('');

  const demos = [
    {
      id: 'assessment',
      title: '🧠 Conversational Assessment Engine',
      description: 'Experience PHQ-9 transformed into natural conversation with AI',
      status: 'Ready',
      features: [
        'Natural conversation flow instead of clinical questions',
        'Real-time emotional tone detection',
        'Cultural context integration for Indian youth',
        'Immediate risk assessment and recommendations'
      ]
    },
    {
      id: 'insights',
      title: '📊 Real-time Assessment Insights',
      description: 'Immediate feedback and personalized recommendations',
      status: 'Ready',
      features: [
        'Instant analysis of assessment responses',
        'Personalized mental health insights',
        'Cultural adaptation of recommendations',
        'Progress tracking and comparison'
      ]
    },
    {
      id: 'activities',
      title: '🎯 Therapeutic Activity Engine',
      description: 'AI-powered therapeutic interventions and exercises',
      status: 'In Development',
      features: [
        'CBT exercises adapted for Indian context',
        'Mindfulness and breathing activities',
        'Real-time adaptation based on engagement',
        'Cultural therapy modules'
      ]
    }
  ];

  const runDemo = (demoId: string) => {
    setSelectedDemo(demoId);
    
    const demo = demos.find(d => d.id === demoId);
    if (demo?.status === 'Ready') {
      // Actually launch the demo
      onLaunchDemo(demoId);
    } else {
      alert(`🚧 ${demo?.title} is still in development.\n\nComing soon with features:\n${demo?.features.map(f => `• ${f}`).join('\n')}`);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          🌟 Mann-Mitra Funding Demo
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '40px', opacity: 0.9 }}>
          AI-Powered Mental Health Platform for Indian Youth
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {demos.map((demo) => (
            <div
              key={demo.id}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '30px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => runDemo(demo.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'white' }}>
                {demo.title}
              </h3>
              
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                marginBottom: '15px',
                background: demo.status === 'Ready' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: demo.status === 'Ready' ? '#10b981' : '#f59e0b',
                border: `1px solid ${demo.status === 'Ready' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
              }}>
                {demo.status}
              </div>

              <p style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                {demo.description}
              </p>

              <div style={{ textAlign: 'left' }}>
                <h4 style={{ 
                  color: 'white', 
                  fontSize: '1rem', 
                  marginBottom: '10px',
                  fontWeight: '600'
                }}>
                  Key Features:
                </h4>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem'
                }}>
                  {demo.features.map((feature, index) => (
                    <li key={index} style={{ 
                      marginBottom: '8px',
                      paddingLeft: '20px',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: '0',
                        color: '#10b981'
                      }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  background: demo.status === 'Ready' ? '#10b981' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: demo.status === 'Ready' ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (demo.status === 'Ready') {
                    e.currentTarget.style.background = '#059669';
                  }
                }}
                onMouseLeave={(e) => {
                  if (demo.status === 'Ready') {
                    e.currentTarget.style.background = '#10b981';
                  }
                }}
              >
                {demo.status === 'Ready' ? '🚀 Launch Demo' : '🚧 Coming Soon'}
              </button>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '15px',
          padding: '30px',
          marginTop: '40px'
        }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>
            🎯 Implementation Progress
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            textAlign: 'left'
          }}>
            <div>
              <h4 style={{ color: '#10b981', marginBottom: '10px' }}>✅ Completed</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                <li>• AI Orchestration Infrastructure</li>
                <li>• Activity Engine Framework</li>
                <li>• Cultural Intelligence AI</li>
                <li>• Conversational Assessment Engine</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: '#f59e0b', marginBottom: '10px' }}>🚧 In Progress</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                <li>• Real-time Assessment Insights</li>
                <li>• CBT Activity Modules</li>
                <li>• Group Therapy System</li>
                <li>• Crisis Intervention Protocols</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: '#6b7280', marginBottom: '10px' }}>📋 Planned</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                <li>• Family Therapy Integration</li>
                <li>• Professional Bridge System</li>
                <li>• Analytics Dashboard</li>
                <li>• Gamification Engine</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          fontSize: '0.9rem',
          opacity: 0.8
        }}>
          <p>
            💡 <strong>Note:</strong> This is a funding demonstration showcasing the core AI-powered 
            conversational assessment engine. The full platform includes 16 major components 
            designed specifically for Indian youth mental health needs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoLauncher;