import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Settings, BarChart3, Rocket, CheckCircle, BookOpen } from 'lucide-react';

export const QuickNav: React.FC = () => {
  const navigate = useNavigate();

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    display: 'flex',
    gap: '0.5rem',
    background: 'rgba(0, 0, 0, 0.8)',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    backdropFilter: 'blur(10px)'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0.25rem',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    transition: 'all 0.2s'
  };

  return (
    <div style={navStyle}>
      <button
        style={buttonStyle}
        onClick={() => navigate('/launch-guide')}
        title="Launch Guide"
      >
        <BookOpen size={16} />
        Guide
      </button>
      <button
        style={buttonStyle}
        onClick={() => navigate('/setup')}
        title="Firebase Setup"
      >
        <Rocket size={16} />
        Setup
      </button>
      <button
        style={buttonStyle}
        onClick={() => navigate('/launch-check')}
        title="Launch Checklist"
      >
        <CheckCircle size={16} />
        Launch
      </button>
      <button
        style={buttonStyle}
        onClick={() => navigate('/admin')}
        title="Admin Dashboard"
      >
        <Database size={16} />
        Data
      </button>
      <button
        style={buttonStyle}
        onClick={() => navigate('/dashboard')}
        title="Main Dashboard"
      >
        <BarChart3 size={16} />
        Dashboard
      </button>
      <button
        style={buttonStyle}
        onClick={() => navigate('/settings')}
        title="Settings"
      >
        <Settings size={16} />
        Settings
      </button>
    </div>
  );
};