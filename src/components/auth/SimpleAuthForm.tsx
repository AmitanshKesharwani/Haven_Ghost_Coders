import React from 'react';

interface SimpleAuthFormProps {
  onSuccess: () => void;
}

export const SimpleAuthForm: React.FC<SimpleAuthFormProps> = ({ onSuccess }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #581c87, #be185d)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1.5rem',
        padding: '2rem',
        maxWidth: '28rem',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>Haven</h1>
        <p style={{
          color: '#e9d5ff',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>Your Mental Wellness Companion</p>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#e9d5ff',
              marginBottom: '0.5rem'
            }}>Email</label>
            <input
              type="email"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '1rem'
              }}
              placeholder="your.email@example.com"
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#e9d5ff',
              marginBottom: '0.5rem'
            }}>Password</label>
            <input
              type="password"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '1rem'
              }}
              placeholder="Your password"
            />
          </div>
          
          <button
            type="button"
            onClick={onSuccess}
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #9333ea, #ec4899)',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Sign In (Test)
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#e9d5ff', fontSize: '0.875rem' }}>
            This is a test form with inline styles to check if CSS is working.
          </p>
        </div>
      </div>
    </div>
  );
};