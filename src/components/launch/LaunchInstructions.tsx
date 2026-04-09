import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Database, CheckCircle, BarChart3, ArrowRight } from 'lucide-react';

export const LaunchInstructions: React.FC = () => {
  const navigate = useNavigate();

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
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)'
  };

  const stepStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1.5rem',
    background: '#f8fafc',
    borderRadius: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid #e2e8f0'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Rocket size={64} style={{ color: '#667eea', marginBottom: '1rem' }} />
          <h1 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '2.5rem' }}>
            🚀 Haven Launch Guide
          </h1>
          <p style={{ color: '#666', fontSize: '1.2rem' }}>
            Get your mental health app ready for launch in 3 simple steps!
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          
          {/* Step 1 */}
          <div style={stepStyle}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#f59e0b',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              flexShrink: 0
            }}>
              1
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                ⚡ Run Quick Setup
              </h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                Set up your Firebase database with the necessary collections for journal entries, mood tracking, 
                AI conversations, and user settings. No demo data will be created.
              </p>
              <button
                style={buttonStyle}
                onClick={() => navigate('/setup')}
              >
                <Database size={18} />
                Go to Setup
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div style={stepStyle}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              flexShrink: 0
            }}>
              2
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                ✅ Verify System Health
              </h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                Run the automated launch checklist to ensure all 10 core systems are working properly. 
                This includes authentication, database, journal, mood tracking, and more.
              </p>
              <button
                style={buttonStyle}
                onClick={() => navigate('/launch-check')}
              >
                <CheckCircle size={18} />
                Run Checklist
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div style={stepStyle}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#8b5cf6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              flexShrink: 0
            }}>
              3
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                📊 Review Your Data
              </h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                View all your user data in a beautiful admin dashboard. Check journal entries, 
                mood tracking, conversations, settings, and analytics to ensure everything looks perfect.
              </p>
              <button
                style={buttonStyle}
                onClick={() => navigate('/admin')}
              >
                <BarChart3 size={18} />
                View Dashboard
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>

        {/* Success Message */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
            🎉 Ready for Launch!
          </h2>
          <p style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>
            After completing these 3 steps, your Haven app will be fully operational with:
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
              <strong>✅ Complete Database</strong>
              <br />
              <small>All Firebase collections populated</small>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
              <strong>✅ User Authentication</strong>
              <br />
              <small>Email & Google OAuth working</small>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
              <strong>✅ AI Features</strong>
              <br />
              <small>Chat, analysis, insights ready</small>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
              <strong>✅ Admin Tools</strong>
              <br />
              <small>Data monitoring & management</small>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Quick access to all launch tools:
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              style={{ ...buttonStyle, background: '#f59e0b' }}
              onClick={() => navigate('/setup')}
            >
              Setup
            </button>
            <button
              style={{ ...buttonStyle, background: '#10b981' }}
              onClick={() => navigate('/launch-check')}
            >
              Checklist
            </button>
            <button
              style={{ ...buttonStyle, background: '#8b5cf6' }}
              onClick={() => navigate('/admin')}
            >
              Dashboard
            </button>
            <button
              style={{ ...buttonStyle, background: '#6366f1' }}
              onClick={() => navigate('/dashboard')}
            >
              Main App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};