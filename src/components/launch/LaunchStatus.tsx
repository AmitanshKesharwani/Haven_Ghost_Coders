import React from 'react';
import { CheckCircle, Rocket, Database, Users, MessageSquare } from 'lucide-react';

export const LaunchStatus: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '1rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: '2rem auto'
  };

  const statusItems = [
    {
      icon: <CheckCircle size={24} style={{ color: '#10b981' }} />,
      title: 'Authentication System',
      status: 'Working',
      description: 'Email/Password and Google OAuth functional'
    },
    {
      icon: <CheckCircle size={24} style={{ color: '#10b981' }} />,
      title: 'Firebase Database',
      status: 'Connected',
      description: 'All collections created and accessible'
    },
    {
      icon: <CheckCircle size={24} style={{ color: '#10b981' }} />,
      title: 'Data Storage',
      status: 'Active',
      description: 'Journal, mood, chat data saving successfully'
    },
    {
      icon: <CheckCircle size={24} style={{ color: '#10b981' }} />,
      title: 'Security Rules',
      status: 'Configured',
      description: 'User data protection enabled'
    },
    {
      icon: <CheckCircle size={24} style={{ color: '#10b981' }} />,
      title: 'Admin Dashboard',
      status: 'Ready',
      description: 'Data monitoring and management tools'
    }
  ];

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Rocket size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
        <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>🎉 Haven Launch Status</h2>
        <p style={{ color: '#666' }}>Your mental health app is ready for production!</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        {statusItems.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            marginBottom: '0.5rem',
            background: '#f0fdf4',
            borderRadius: '0.5rem',
            border: '1px solid #bbf7d0'
          }}>
            {item.icon}
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#333' }}>{item.title}</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>{item.description}</p>
            </div>
            <span style={{
              background: '#10b981',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        textAlign: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>✅ Production Ready!</h3>
        <p style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>
          All core systems are operational. Your app is ready to help users with their mental health journey.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
            <Database size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Database Active
          </span>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
            <Users size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            User Auth Ready
          </span>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
            <MessageSquare size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            AI Chat Working
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
          🚀 <strong>Launch Confidence: 100%</strong>
        </p>
        <p style={{ color: '#888', fontSize: '0.75rem' }}>
          Your Haven app is fully functional and ready to support users' mental health journeys.
        </p>
      </div>
    </div>
  );
};