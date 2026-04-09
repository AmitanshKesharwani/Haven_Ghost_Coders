import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner';

interface WorkingAuthFormProps {
  onSuccess: () => void;
}

export const WorkingAuthForm: React.FC<WorkingAuthFormProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const { signIn, signUp, signInWithGoogle, sendPasswordResetEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signUp(formData.email, formData.password, formData.displayName);
        toast.success('Account created successfully!');
      } else {
        await signIn(formData.email, formData.password);
        toast.success('Welcome back!');
      }
      onSuccess();
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Successfully signed in with Google!');
      onSuccess();
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(resetEmail);
      setResetSuccess(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e1b4b, #581c87, #be185d)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden'
  };

  const backgroundEffectStyle1: React.CSSProperties = {
    position: 'absolute',
    top: '-8rem',
    right: '-8rem',
    width: '24rem',
    height: '24rem',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    animation: 'pulse 4s ease-in-out infinite'
  };

  const backgroundEffectStyle2: React.CSSProperties = {
    position: 'absolute',
    bottom: '-8rem',
    left: '-8rem',
    width: '24rem',
    height: '24rem',
    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    animation: 'pulse 4s ease-in-out infinite 2s'
  };

  const mainCardStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '72rem',
    margin: '0 auto',
    zIndex: 10
  };

  const glassCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: '2rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    overflow: 'hidden'
  };

  const leftSideStyle: React.CSSProperties = {
    width: window.innerWidth >= 1024 ? '50%' : '100%',
    padding: '3rem',
    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.1))',
    borderRight: window.innerWidth >= 1024 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  const rightSideStyle: React.CSSProperties = {
    width: window.innerWidth >= 1024 ? '50%' : '100%',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '2rem'
  };

  const logoIconStyle: React.CSSProperties = {
    width: '3rem',
    height: '3rem',
    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '1rem'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '1rem'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    color: '#e9d5ff',
    marginBottom: '2rem'
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  };

  const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#e9d5ff',
    marginBottom: '0.5rem'
  };

  const inputContainerStyle: React.CSSProperties = {
    position: 'relative'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0.5rem',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s'
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '1.25rem',
    height: '1.25rem',
    color: '#c4b5fd'
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    background: 'linear-gradient(135deg, #9333ea, #ec4899)',
    color: 'white',
    fontWeight: '600',
    padding: '0.875rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    opacity: loading ? 0.7 : 1
  };

  const secondaryButtonStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'white',
    fontWeight: '500',
    padding: '0.875rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    transition: 'all 0.2s'
  };

  const errorStyle: React.CSSProperties = {
    padding: '1rem',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '0.5rem',
    color: '#fca5a5',
    fontSize: '0.875rem',
    marginBottom: '1.5rem'
  };

  return (
    <div style={containerStyle}>
      {/* Background Effects */}
      <div style={backgroundEffectStyle1}></div>
      <div style={backgroundEffectStyle2}></div>

      {/* Main Container */}
      <div style={mainCardStyle}>
        <div style={glassCardStyle}>
          <div style={{ display: 'flex', flexDirection: window.innerWidth >= 1024 ? 'row' : 'column' }}>

            {/* Left Side - Branding */}
            <div style={leftSideStyle}>
              {/* Logo */}
              <div style={logoStyle}>
                <div style={logoIconStyle}>
                  <Heart style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>Haven</h1>
              </div>

              {/* Content */}
              <h2 style={titleStyle}>
                Your Mental Wellness Companion
              </h2>
              <p style={subtitleStyle}>
                आपका मानसिक स्वास्थ्य साथी - AI-powered support designed for Indian youth
              </p>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { icon: "🤖", text: "24/7 AI Companion Support" },
                  { icon: "🚨", text: "Crisis Detection & Intervention" },
                  { icon: "🗣️", text: "Hindi/English/Hinglish Support" },
                  { icon: "🔒", text: "100% Private & Secure" }
                ].map((feature, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div style={{
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <p style={{ color: '#e9d5ff', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                  "Haven transformed my mental health journey. The AI truly understands Indian culture."
                </p>
                <p style={{ color: '#c4b5fd', fontSize: '0.875rem' }}>- Kavya, 20, Bangalore</p>
              </div>
            </div>

            {/* Right Side - Form */}
            <div style={rightSideStyle}>
              <div style={{ maxWidth: '28rem', margin: '0 auto', width: '100%' }}>

                {/* Form Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </h3>
                  <p style={{ color: '#c4b5fd' }}>
                    {isSignUp ? 'Start your wellness journey today' : 'Sign in to continue your journey'}
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div style={errorStyle}>
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={formStyle}>

                  {/* Name Field (Sign Up Only) */}
                  {isSignUp && (
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Full Name</label>
                      <div style={inputContainerStyle}>
                        <User style={iconStyle} />
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                          style={inputStyle}
                          placeholder="Your name"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Email Address</label>
                    <div style={inputContainerStyle}>
                      <Mail style={iconStyle} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        style={inputStyle}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Password</label>
                    <div style={inputContainerStyle}>
                      <Lock style={iconStyle} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        style={{ ...inputStyle, paddingRight: '3rem' }}
                        placeholder="Your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#c4b5fd',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link (Sign In Only) */}
                  {!isSignUp && (
                    <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#c4b5fd',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {/* Confirm Password (Sign Up Only) */}
                  {isSignUp && (
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Confirm Password</label>
                      <div style={inputContainerStyle}>
                        <Lock style={iconStyle} />
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          style={inputStyle}
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={buttonStyle}
                  >
                    {loading ? (
                      <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <>
                        <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
                  <span style={{ padding: '0 1rem', color: '#c4b5fd', fontSize: '0.875rem' }}>or</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
                </div>

                {/* Google Sign In */}
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  style={secondaryButtonStyle}
                >
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Toggle Form */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <p style={{ color: '#c4b5fd' }}>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      style={{
                        color: '#e9d5ff',
                        fontWeight: '500',
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                </div>

                {/* Crisis Support */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: '#c4b5fd' }}>
                    Need immediate help? Call:{' '}
                    <span style={{ fontWeight: 'bold', color: '#f87171' }}>1800-599-0019</span> (KIRAN, Toll-Free 24/7)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '28rem',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {!resetSuccess ? (
              <>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  Reset Password
                </h3>
                <p style={{
                  color: '#c4b5fd',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  fontSize: '0.875rem'
                }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleForgotPassword} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#e9d5ff',
                      marginBottom: '0.5rem'
                    }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '1.25rem',
                        height: '1.25rem',
                        color: '#c4b5fd'
                      }} />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.5rem',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '0.5rem',
                          color: 'white',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #9333ea, #ec4899)',
                      color: 'white',
                      fontWeight: '600',
                      padding: '0.875rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      opacity: resetLoading ? 0.7 : 1,
                      marginBottom: '1rem'
                    }}
                  >
                    {resetLoading ? (
                      <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      'Send Reset Email'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>✓</span>
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  Email Sent!
                </h3>
                <p style={{
                  color: '#c4b5fd',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem'
                }}>
                  We've sent a password reset link to <strong>{resetEmail}</strong>.
                  Check your inbox and follow the instructions to reset your password.
                </p>
                <p style={{
                  color: '#a78bfa',
                  fontSize: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  Don't see the email? Check your spam folder or try again.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmail('');
                setResetSuccess(false);
              }}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                fontWeight: '500',
                padding: '0.875rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {resetSuccess ? 'Back to Sign In' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};