import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Eye, EyeOff, Mail, Lock, User, Heart, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { AuthButton } from './AuthButton';
import { useAuth } from './AuthProvider';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { ThemeSelector } from '../ThemeSelector';

import { toast } from 'sonner';
import './animations.css';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
  onSuccess: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToSignIn, onSuccess }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [emailError, setEmailError] = useState('');

  const { signUp, signInWithGoogle } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check password strength
    if (field === 'password') {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value)
      });
    }
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    // Validation
    if (!formData.displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!isPasswordStrong) {
      setError('Please choose a stronger password');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.displayName);
      toast.success('Account created successfully!');
      onSuccess();
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      toast.success('Successfully signed up with Google!');
      onSuccess();
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
        {/* Floating Orbs */}
        <div className="absolute top-32 left-32 w-80 h-80 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-500/25 to-indigo-500/25 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="w-full flex flex-col justify-center px-16 py-12 relative overflow-hidden">
          {/* Glowing Border */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-3xl border-r border-white/10"></div>
          
          <div className="relative z-10">
            {/* Animated Logo */}
            <div className="mb-12 group">
              <div className="w-24 h-24 rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-indigo-500/25 group-hover:shadow-indigo-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <img src="/logo.jpeg" alt="Haven" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-200 mb-4 tracking-tight animate-fade-in">
                Join Haven
              </h1>
              <p className="text-2xl text-indigo-200 mb-8 font-light animate-fade-in delay-200">
                मानसिक स्वास्थ्य की शुरुआत यहाँ से
              </p>
            </div>

            {/* Animated Description */}
            <div className="mb-12 animate-fade-in delay-300">
              <p className="text-xl text-gray-300 leading-relaxed mb-8 font-light">
                Begin your transformative mental wellness journey with cutting-edge AI technology designed for you.
              </p>
            </div>

            {/* Animated Features */}
            <div className="space-y-6">
              {[
                { icon: "🔒", text: "100% Private & Secure", delay: "delay-500" },
                { icon: "🧠", text: "Culturally Sensitive AI", delay: "delay-700" },
                { icon: "⚡", text: "Professional-Grade Support", delay: "delay-900" },
                { icon: "🎯", text: "Designed for Indian Youth", delay: "delay-1000" }
              ].map((feature, index) => (
                <div key={index} className={`flex items-center space-x-4 animate-slide-in-left ${feature.delay} group hover:translate-x-2 transition-transform duration-300`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:border-indigo-400/50 transition-all duration-300">
                    <span className="text-xl">{feature.icon}</span>
                  </div>
                  <span className="text-white/90 text-lg font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Success Stories */}
            <div className="mt-12 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-white/10 animate-fade-in delay-1200">
              <p className="text-indigo-200 italic mb-3">
                "Joining Haven was the best decision I made for my mental health. The AI truly understands Indian culture."
              </p>
              <p className="text-indigo-300 text-sm font-semibold">- Kavya, 20, Bangalore</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-lg animate-fade-in delay-300">
          <Card className="p-10 bg-black/40 backdrop-blur-2xl shadow-2xl border border-white/20 rounded-3xl hover:border-indigo-400/50 transition-all duration-500 hover:shadow-indigo-500/25">
            {/* Mobile Header */}
            <div className="text-center mb-10 lg:hidden">
              <div className="w-24 h-24 rounded-3xl overflow-hidden mx-auto mb-6 shadow-2xl shadow-indigo-500/25 animate-bounce">
                <img src="/logo.jpeg" alt="Haven" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 mb-3">Join Haven</h1>
              <p className="text-gray-300">Your mental wellness companion</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-10">
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-200 mb-4 animate-fade-in">
                Create Account
              </h2>
              <p className="text-gray-300 text-lg animate-fade-in delay-200">
                Start your wellness journey today
              </p>
              <p className="mt-2 inline-block text-[10px] text-indigo-300 px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">UI v2</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start space-x-3 backdrop-blur-sm animate-shake">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-300 font-medium">Sign Up Error</p>
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              </div>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-labelledby="signup-title">
              {/* Name Field */}
              <div className="group">
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-3 group-focus-within:text-indigo-300 transition-colors">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="Your name"
                    className="pl-12 pr-4 py-4 bg-white/5 border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 rounded-xl transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm hover:bg-white/10 focus:bg-white/10"
                    required
                    disabled={loading}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-focus-within:from-indigo-500/10 group-focus-within:via-transparent group-focus-within:to-purple-500/10 transition-all duration-500 pointer-events-none"></div>
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-3 group-focus-within:text-indigo-300 transition-colors">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      handleInputChange('email', e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="your.email@example.com"
                    className={`pl-12 pr-4 py-4 bg-white/5 border ${emailError ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/20' : 'border-white/20 focus:border-indigo-400 focus:ring-indigo-400/20'} focus:ring-2 rounded-xl transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm hover:bg-white/10 focus:bg-white/10`}
                    required
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? 'signup-email-error' : undefined}
                    disabled={loading}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-focus-within:from-indigo-500/10 group-focus-within:via-transparent group-focus-within:to-purple-500/10 transition-all duration-500 pointer-events-none"></div>
                </div>
                {emailError && (
                  <p id="signup-email-error" className="mt-2 text-xs text-red-400">{emailError}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-3 group-focus-within:text-indigo-300 transition-colors">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Strong password"
                    className="pl-12 pr-12 py-4 bg-white/5 border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 rounded-xl transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm hover:bg-white/10 focus:bg-white/10"
                    required
                    onKeyUp={(e) => setCapsLockOn((e as any).getModifierState && (e as any).getModifierState('CapsLock'))}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-focus-within:from-indigo-500/10 group-focus-within:via-transparent group-focus-within:to-purple-500/10 transition-all duration-500 pointer-events-none"></div>
                </div>

                {/* Enhanced Password Strength Indicator */}
                <PasswordStrengthIndicator password={formData.password} />
                {capsLockOn && (
                  <p className="mt-2 text-xs text-amber-300">Caps Lock is on</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-3 group-focus-within:text-indigo-300 transition-colors">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                    className={`pl-12 pr-12 py-4 bg-white/5 border rounded-xl transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm hover:bg-white/10 focus:bg-white/10 ${
                      formData.confirmPassword && !passwordsMatch 
                        ? 'border-red-400/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20' 
                        : 'border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'
                    }`}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-focus-within:from-indigo-500/10 group-focus-within:via-transparent group-focus-within:to-purple-500/10 transition-all duration-500 pointer-events-none"></div>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="mt-2 text-xs text-red-400">Passwords do not match</p>
                )}
              </div>

              {/* Sign Up Button */}
              <AuthButton
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading || !formData.displayName || !formData.email || !isPasswordStrong || !passwordsMatch}
              >
                {loading ? 'Creating account...' : (
                  <>
                    Create Account
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </AuthButton>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-white/20" />
              <span className="px-6 text-sm text-gray-400 bg-black/20 rounded-full py-2">or continue with</span>
              <div className="flex-1 border-t border-white/20" />
            </div>

            {/* Google Sign Up */}
            <AuthButton
              onClick={handleGoogleSignUp}
              variant="secondary"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Connecting...' : (
                <>
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </AuthButton>

            {/* Switch to Sign In */}
            <div className="mt-8 text-center">
              <p className="text-gray-300">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToSignIn}
                  className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline transition-all duration-300 hover:scale-105 inline-block"
                  disabled={loading}
                >
                  Sign In
                </button>
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="mt-8 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl backdrop-blur-sm">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-indigo-200">
                  <strong>100% Secure & Private:</strong> Your mental health data is encrypted and protected. 
                  We follow strict privacy standards and never share personal information.
                </p>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="mt-6">
              <ThemeSelector compact={true} showTitle={false} />
            </div>

            {/* Terms & Privacy */}
            <p className="mt-4 text-center text-[11px] text-gray-400">
              By creating an account, you agree to our <span className="text-indigo-300 hover:text-indigo-200 cursor-pointer">Terms</span> and <span className="text-indigo-300 hover:text-indigo-200 cursor-pointer">Privacy Policy</span>.
            </p>

            {/* Crisis Support */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Need immediate help? Call:{' '}
                <span className="font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer">1800-599-0019</span> (Toll-Free 24/7)
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};