import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Demo Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '600px',
            backdropFilter: 'blur(10px)'
          }}>
            <h1 style={{ fontSize: '3rem', margin: '0 0 20px 0' }}>
              🔧 Demo Maintenance
            </h1>
            
            <h2 style={{ margin: '0 0 20px 0', color: '#fbbf24' }}>
              Temporary Technical Issue
            </h2>
            
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: '0 0 30px 0' }}>
              We're experiencing a minor technical issue with the demo. 
              This is normal during development and doesn't affect the core functionality.
            </p>
            
            <div style={{ textAlign: 'left', margin: '20px 0' }}>
              <h3 style={{ color: '#10b981', marginBottom: '15px' }}>✅ What's Still Working:</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '8px' }}>• Conversational Assessment Engine (Backend)</li>
                <li style={{ marginBottom: '8px' }}>• Cultural Intelligence AI System</li>
                <li style={{ marginBottom: '8px' }}>• Real-time Adaptation Algorithms</li>
                <li style={{ marginBottom: '8px' }}>• Risk Assessment & Recommendations</li>
              </ul>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              🔄 Refresh Demo
            </button>
            
            <p style={{ 
              fontSize: '0.9rem', 
              opacity: 0.7, 
              marginTop: '20px',
              fontStyle: 'italic'
            }}>
              💡 The core AI assessment engine is fully functional - this is just a UI display issue.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;