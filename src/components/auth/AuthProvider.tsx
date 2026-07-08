import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../../services/supabaseClient';
import { supabaseService } from '../../services/supabaseService';
import type { UserProfile } from '../../services/supabaseService';

interface AuthContextType {
  currentUser: SupabaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<UserProfile>;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signInWithGoogle: () => Promise<UserProfile>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (onboardingData: any) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await supabaseService.getUserProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        try {
          let profile = await supabaseService.getUserProfile(user.id);
          if (!profile) {
            // Auto-create profile for users who don't have one yet
            profile = {
              uid: user.id,
              email: user.email ?? '',
              displayName: user.user_metadata?.display_name ?? (user.email?.split('@')[0] ?? 'User'),
              createdAt: new Date(),
              lastLoginAt: new Date(),
              onboardingComplete: false,
              preferences: { language: 'mixed', culturalBackground: 'indian', communicationStyle: 'casual', interests: [], comfortEnvironment: '', avatarStyle: 'friendly', notificationsEnabled: true },
              mentalHealthProfile: { primaryConcerns: [], goals: [], riskFactors: [], protectiveFactors: [], currentRiskLevel: 'none' },
              therapeuticPlan: { primaryGoals: [], secondaryGoals: [], interventionStrategies: [], progressMilestones: {}, lastUpdated: new Date() },
              privacySettings: { dataCollection: true, analyticsOptIn: true, researchParticipation: false },
            } as any;
            await supabaseService.createUserProfile(profile!);
          }
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching/creating user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string): Promise<UserProfile> => {
    try {
      const profile = await supabaseService.signUp(email, password, displayName);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string): Promise<UserProfile> => {
    try {
      const profile = await supabaseService.signIn(email, password);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<UserProfile> => {
    try {
      const profile = await supabaseService.signInWithGoogle();
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabaseService.signOut();
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    try {
      await supabaseService.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) throw new Error('No user logged in');
    try {
      await supabaseService.updateUserProfile(currentUser.id, updates);
      const updatedProfile = await supabaseService.getUserProfile(currentUser.id);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const completeOnboarding = async (onboardingData: any): Promise<void> => {
    if (!currentUser) throw new Error('No user logged in');
    try {
      await supabaseService.completeOnboarding(currentUser.id, onboardingData);
      const updatedProfile = await supabaseService.getUserProfile(currentUser.id);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Complete onboarding error:', error);
      throw error;
    }
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (!currentUser) return;
    try {
      const profile = await supabaseService.getUserProfile(currentUser.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Refresh profile error:', error);
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    sendPasswordResetEmail,
    updateUserProfile,
    completeOnboarding,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
