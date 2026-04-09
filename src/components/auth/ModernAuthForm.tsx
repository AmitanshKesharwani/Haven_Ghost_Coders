import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner';

interface ModernAuthFormProps {
    onSuccess: () => void;
}

export const ModernAuthForm: React.FC<ModernAuthFormProps> = ({ onSuccess }) => {
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

    const { signIn, signUp, signInWithGoogle } = useAuth();

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

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 bg-black overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-black to-black"></div>
                <div className="absolute w-[600px] h-[600px] -top-40 -left-40 bg-fuchsia-600/30 rounded-full blur-[160px] animate-pulse"></div>
                <div className="absolute w-[600px] h-[600px] -bottom-40 -right-40 bg-indigo-600/30 rounded-full blur-[160px] animate-pulse delay-1000"></div>
            </div>

            {/* Glass Card */}
            <div className="relative w-full max-w-6xl mx-auto z-10">
                <div className="bg-white/5 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">

                        {/* Left Side */}
                        <div className="lg:w-1/2 p-14 bg-gradient-to-br from-purple-800/40 to-pink-800/30 border-r border-white/10">
                            <div className="h-full flex flex-col justify-center space-y-10">

                                {/* Logo */}
                                <div className="flex items-center">
                                    <div className="w-14 h-14 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/40">
                                        <Heart className="w-7 h-7 text-white" />
                                    </div>
                                    <h1 className="ml-4 text-4xl font-extrabold text-white tracking-tight">
                                        Haven
                                    </h1>
                                </div>

                                {/* Tagline */}
                                <div>
                                    <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                                        Your Premium Mental Wellness Companion
                                    </h2>
                                    <p className="text-lg text-purple-100/90">
                                        Personalized AI-powered support designed for Indian youth.
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="grid gap-4">
                                    {[
                                        { icon: "🤖", text: "24/7 AI Companion" },
                                        { icon: "🚨", text: "Smart Crisis Detection" },
                                        { icon: "🗣️", text: "Multilingual (Hindi/English/Hinglish)" },
                                        { icon: "🔒", text: "Military-Grade Privacy" }
                                    ].map((feature, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center space-x-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition"
                                        >
                                            <span className="text-2xl">{feature.icon}</span>
                                            <span className="text-white/90 font-medium">{feature.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Testimonial */}
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                                    <p className="text-purple-100/90 italic mb-3 text-lg">
                                        “Haven has completely changed how I approach my mental health. It just feels like it understands me.”
                                    </p>
                                    <p className="text-purple-200 text-sm">— Kavya, 20, Bangalore</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="lg:w-1/2 p-14">
                            <div className="max-w-md mx-auto">

                                {/* Header */}
                                <div className="text-center mb-10">
                                    <h3 className="text-3xl font-extrabold text-white mb-3">
                                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                                    </h3>
                                    <p className="text-purple-200 text-base">
                                        {isSignUp ? 'Start your journey with us' : 'Continue your wellness journey'}
                                    </p>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">

                                    {/* Full Name */}
                                    {isSignUp && (
                                        <div>
                                            <label className="block text-sm font-semibold text-purple-200 mb-2">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                                                <input
                                                    type="text"
                                                    value={formData.displayName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-fuchsia-500"
                                                    placeholder="Your name"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold text-purple-200 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-fuchsia-500"
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-semibold text-purple-200 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                                className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-fuchsia-500"
                                                placeholder="Enter password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    {isSignUp && (
                                        <div>
                                            <label className="block text-sm font-semibold text-purple-200 mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                                                <input
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-fuchsia-500"
                                                    placeholder="Confirm password"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-600/30 flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Divider */}
                                <div className="my-8 flex items-center">
                                    <div className="flex-1 border-t border-white/20"></div>
                                    <span className="px-4 text-purple-300 text-sm">OR</span>
                                    <div className="flex-1 border-t border-white/20"></div>
                                </div>

                                {/* Google */}
                                <button
                                    onClick={handleGoogleAuth}
                                    disabled={loading}
                                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53" />
                                    </svg>
                                    <span>Continue with Google</span>
                                </button>

                                {/* Toggle */}
                                <div className="mt-8 text-center">
                                    <p className="text-purple-200">
                                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                                        <button
                                            onClick={() => setIsSignUp(!isSignUp)}
                                            className="text-fuchsia-400 hover:text-fuchsia-200 font-medium underline underline-offset-2"
                                        >
                                            {isSignUp ? 'Sign In' : 'Sign Up'}
                                        </button>
                                    </p>
                                </div>

                                {/* Crisis */}
                                <div className="mt-6 text-center">
                                    <p className="text-xs text-purple-300">
                                        Need immediate help? Call:{' '}
                                        <span className="font-bold text-red-400">1800-599-0019</span> (Toll-Free 24/7)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
