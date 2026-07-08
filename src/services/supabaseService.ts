// ============================================================
// supabaseService.ts — Drop-in replacement for firebaseService.ts
// Identical public method signatures. Only swap the import.
// ============================================================
import { supabase } from './supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { encryptTransportPayload } from './transportEncryption';

// Re-export all interfaces unchanged so import paths keep working
export type {
  UserProfile, SessionData, SessionInteraction, SessionEmotion,
  SessionRiskAssessment, CrisisEvent, AssessmentResult, JournalEntry,
  MoodEntry, ChatConversation, ChatMessage, DateValuePoint,
  AssessmentHistoryPoint, ProgressData, DailyProgressData,
  AppSettings, UserActivity,
} from './firebaseService';

import type {
  UserProfile, SessionData, SessionInteraction, SessionEmotion,
  SessionRiskAssessment, CrisisEvent, AssessmentResult, JournalEntry,
  MoodEntry, ChatConversation, ChatMessage, DateValuePoint,
  AssessmentHistoryPoint, ProgressData, DailyProgressData,
  AppSettings, UserActivity,
} from './firebaseService';

// ── Default shapes ────────────────────────────────────────────────────────────
const DEFAULT_PREFERENCES: UserProfile['preferences'] = {
  language: 'mixed', culturalBackground: 'indian', communicationStyle: 'casual',
  interests: [], comfortEnvironment: '', avatarStyle: 'friendly', notificationsEnabled: true,
};
const DEFAULT_MHP: UserProfile['mentalHealthProfile'] = {
  primaryConcerns: [], goals: [], riskFactors: [], protectiveFactors: [], currentRiskLevel: 'none',
};
const DEFAULT_PLAN: UserProfile['therapeuticPlan'] = {
  primaryGoals: [], secondaryGoals: [], interventionStrategies: [],
  progressMilestones: {}, lastUpdated: new Date(),
};
const DEFAULT_PRIVACY: UserProfile['privacySettings'] = {
  dataCollection: true, analyticsOptIn: true, researchParticipation: false,
};

const mkDefaultSettings = (userId: string): AppSettings => ({
  userId, theme: 'auto', language: 'mixed',
  notifications: {
    enabled: true, dailyCheckIn: true, moodReminders: true, crisisAlerts: true, progressUpdates: true,
    quietHours: { enabled: false, startTime: '22:00', endTime: '08:00' },
  },
  privacy: { dataSharing: false, analytics: true, crashReporting: true, personalizedAds: false },
  accessibility: { fontSize: 'medium', highContrast: false, screenReader: false, reducedMotion: false },
  aiPreferences: { personality: 'supportive', responseLength: 'detailed', culturalContext: true, hindiSupport: true },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function removeUndefined(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(removeUndefined).filter((v: any) => v !== undefined);
  const out: Record<string, any> = {};
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const v = removeUndefined(obj[k]);
      if (v !== undefined) out[k] = v;
    }
  }
  return out;
}

function authError(err: any): string {
  const m = (err?.message ?? err?.code ?? '').toLowerCase();
  if (m.includes('invalid_credentials') || m.includes('invalid login')) return 'Incorrect password. Please try again.';
  if (m.includes('user_already_exists') || m.includes('already registered')) return 'An account with this email already exists.';
  if (m.includes('weak_password')) return 'Password should be at least 6 characters long.';
  if (m.includes('user not found')) return 'No account found with this email address.';
  if (m.includes('invalid email')) return 'Please enter a valid email address.';
  if (m.includes('too_many_requests')) return 'Too many failed attempts. Please try again later.';
  if (m.includes('email not confirmed')) return 'Please verify your email address before signing in.';
  return 'An error occurred. Please try again.';
}

function rowToProfile(r: any): UserProfile {
  return {
    uid: r.id, email: r.email ?? '', displayName: r.display_name ?? '',
    photoURL: r.photo_url ?? undefined,
    createdAt: new Date(r.created_at),
    lastLoginAt: new Date(r.last_login_at ?? r.created_at),
    onboardingComplete: r.onboarding_complete ?? false,
    preferences: r.preferences ?? DEFAULT_PREFERENCES,
    mentalHealthProfile: r.mental_health_profile ?? DEFAULT_MHP,
    therapeuticPlan: {
      ...(r.therapeutic_plan ?? DEFAULT_PLAN),
      lastUpdated: new Date(r.therapeutic_plan?.lastUpdated ?? r.created_at),
    },
    privacySettings: r.privacy_settings ?? DEFAULT_PRIVACY,
  };
}

// ════════════════════════════════════════════════════════════
export class SupabaseService {
  private currentUser: SupabaseUser | null = null;

  constructor() {
    supabase.auth.getSession().then(({ data }) => { this.currentUser = data.session?.user ?? null; });
    supabase.auth.onAuthStateChange((_e, session) => {
      this.currentUser = session?.user ?? null;
      if (this.currentUser) this.updateLastLoginTime(this.currentUser.id).catch(() => {});
    });
  }

  // ── AUTH ──────────────────────────────────────────────────────────────────
  async signUp(email: string, password: string, displayName: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }, // store displayName in auth metadata
      },
    });
    if (error) {
      console.error('❌ Supabase auth.signUp raw error:', error);
      throw new Error(authError(error));
    }
    const user = data.user!;
    const profile: UserProfile = {
      uid: user.id, email, displayName, createdAt: new Date(), lastLoginAt: new Date(),
      onboardingComplete: false, preferences: DEFAULT_PREFERENCES,
      mentalHealthProfile: DEFAULT_MHP, therapeuticPlan: DEFAULT_PLAN, privacySettings: DEFAULT_PRIVACY,
    };
    // Wait briefly for the session JWT to propagate so RLS auth.uid() resolves correctly
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      await this.createUserProfile(profile);
    } catch (profileError: any) {
      console.error('❌ createUserProfile failed:', profileError?.message, profileError?.code);
      throw new Error(`Profile creation failed: ${profileError?.message ?? 'Check RLS policies on public.profiles'}`);
    }
    return profile;
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(authError(error));
    let profile = await this.getUserProfile(data.user.id);
    if (!profile) {
      // Profile missing — create it on the fly (handles users created before trigger was set up)
      console.warn('⚠️ No profile found for user, creating one now...');
      profile = {
        uid: data.user.id,
        email: data.user.email ?? email,
        displayName: data.user.user_metadata?.display_name ?? email.split('@')[0],
        createdAt: new Date(),
        lastLoginAt: new Date(),
        onboardingComplete: false,
        preferences: DEFAULT_PREFERENCES,
        mentalHealthProfile: DEFAULT_MHP,
        therapeuticPlan: DEFAULT_PLAN,
        privacySettings: DEFAULT_PRIVACY,
      };
      await this.createUserProfile(profile);
    }
    return profile;
  }

  async signInWithGoogle(): Promise<UserProfile> {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) throw new Error(authError(error));
    const { data: s } = await supabase.auth.getSession();
    const user = s.session?.user;
    if (!user) throw new Error('No session after Google sign-in redirect.');
    let profile = await this.getUserProfile(user.id);
    if (!profile) {
      profile = {
        uid: user.id, email: user.email ?? '', displayName: user.user_metadata?.full_name ?? 'User',
        photoURL: user.user_metadata?.avatar_url ?? undefined, createdAt: new Date(), lastLoginAt: new Date(),
        onboardingComplete: false, preferences: DEFAULT_PREFERENCES,
        mentalHealthProfile: DEFAULT_MHP, therapeuticPlan: DEFAULT_PLAN, privacySettings: DEFAULT_PRIVACY,
      };
      await this.createUserProfile(profile);
    }
    return profile;
  }

  async signOut(): Promise<void> { const { error } = await supabase.auth.signOut(); if (error) throw error; }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) throw new Error(authError(error));
  }

  getCurrentUser(): SupabaseUser | null { return this.currentUser; }

  // ── PROFILE ───────────────────────────────────────────────────────────────
  async createUserProfile(p: UserProfile): Promise<void> {
    const { error } = await supabase.from('profiles').upsert({
      id: p.uid, email: p.email, display_name: p.displayName, photo_url: p.photoURL ?? null,
      onboarding_complete: p.onboardingComplete, preferences: p.preferences,
      mental_health_profile: p.mentalHealthProfile,
      therapeutic_plan: { ...p.therapeuticPlan, lastUpdated: new Date().toISOString() },
      privacy_settings: p.privacySettings,
      created_at: p.createdAt.toISOString(), last_login_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (error) {
      console.error('❌ profiles upsert error:', error.code, error.message, error.details, error.hint);
      throw error;
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (error) { if (error.code === 'PGRST116') return null; throw error; }
    return rowToProfile(data);
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const row: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.displayName        !== undefined) row.display_name          = updates.displayName;
    if (updates.photoURL           !== undefined) row.photo_url             = updates.photoURL;
    if (updates.onboardingComplete !== undefined) row.onboarding_complete   = updates.onboardingComplete;
    if (updates.preferences        !== undefined) row.preferences           = updates.preferences;
    if (updates.mentalHealthProfile !== undefined) row.mental_health_profile = updates.mentalHealthProfile;
    if (updates.therapeuticPlan    !== undefined) row.therapeutic_plan      = { ...updates.therapeuticPlan, lastUpdated: new Date().toISOString() };
    if (updates.privacySettings    !== undefined) row.privacy_settings      = updates.privacySettings;
    // dot-notation keys like 'mentalHealthProfile.phq9Score'
    for (const [k, v] of Object.entries(updates as any)) {
      if (k.includes('.') && k.startsWith('mentalHealthProfile.')) {
        const leaf = k.slice('mentalHealthProfile.'.length);
        const cur = (await this.getUserProfile(uid))?.mentalHealthProfile ?? { ...DEFAULT_MHP };
        (cur as any)[leaf] = v;
        row.mental_health_profile = cur;
      }
    }
    const { error } = await supabase.from('profiles').update(row).eq('id', uid);
    if (error) throw error;
  }

  async completeOnboarding(uid: string, d: any): Promise<void> {
    await this.updateUserProfile(uid, {
      onboardingComplete: true,
      preferences: { ...DEFAULT_PREFERENCES, ...d.preferences, language: d.language ?? 'mixed', culturalBackground: d.culturalBackground ?? 'indian', communicationStyle: d.communicationStyle ?? 'casual', interests: d.interests ?? [], comfortEnvironment: d.comfortEnvironment ?? '', avatarStyle: d.avatarStyle ?? 'friendly', notificationsEnabled: true },
      mentalHealthProfile: { ...DEFAULT_MHP, primaryConcerns: d.concerns ?? [], goals: d.goals ?? [], riskFactors: d.riskFactors ?? [], protectiveFactors: d.protectiveFactors ?? [], currentRiskLevel: 'none' },
    });
  }

  private async updateLastLoginTime(uid: string): Promise<void> {
    await supabase.from('profiles').update({ last_login_at: new Date().toISOString() }).eq('id', uid);
  }

  // ── SESSIONS ──────────────────────────────────────────────────────────────
  async createSession(s: Omit<SessionData, 'sessionId'>): Promise<string> {
    const { data, error } = await supabase.from('sessions').insert({
      user_id: s.userId, start_time: new Date().toISOString(), duration: s.duration ?? 0,
      session_type: s.sessionType,
      progress_metrics: s.progressMetrics ?? { emotionalRegulation:0, selfAwareness:0, copingSkillsUsage:0, therapeuticAlliance:0, engagementLevel:0 },
      outcomes: s.outcomes ?? { overallMood:'stable', goalsAddressed:[], skillsPracticed:[], insightsGained:[] },
      updated_at: new Date().toISOString(),
    }).select('id').single();
    if (error) throw error;
    return data.id;
  }

  async saveSession(s: Omit<SessionData, 'sessionId'>): Promise<string> { return this.createSession(s); }

  async updateSession(sessionId: string, updates: Partial<SessionData>): Promise<void> {
    const clean = removeUndefined(updates);
    if (!Object.keys(clean).length) return;
    const row: Record<string, any> = { updated_at: new Date().toISOString() };
    if (clean.progressMetrics !== undefined) row.progress_metrics = clean.progressMetrics;
    if (clean.outcomes        !== undefined) row.outcomes          = clean.outcomes;
    if (clean.duration        !== undefined) row.duration          = clean.duration;
    const { error } = await supabase.from('sessions').update(row).eq('id', sessionId);
    if (error) throw error;
  }

  async endSession(sessionId: string, finalData: Partial<Pick<SessionData, 'outcomes'>>): Promise<void> {
    const { data: ex } = await supabase.from('sessions').select('start_time').eq('id', sessionId).single();
    const duration = ex?.start_time ? Date.now() - new Date(ex.start_time).getTime() : 0;
    const row: Record<string, any> = { end_time: new Date().toISOString(), duration, updated_at: new Date().toISOString() };
    if (finalData.outcomes) row.outcomes = finalData.outcomes;
    const { error } = await supabase.from('sessions').update(row).eq('id', sessionId);
    if (error) throw error;
  }

  async getUserSessions(uid: string, limitCount = 10): Promise<SessionData[]> {
    const { data, error } = await supabase.from('sessions').select('*').eq('user_id', uid).order('start_time', { ascending: false }).limit(limitCount);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      sessionId: r.id, userId: r.user_id, startTime: new Date(r.start_time),
      endTime: r.end_time ? new Date(r.end_time) : undefined, duration: r.duration ?? 0,
      sessionType: r.session_type, progressMetrics: r.progress_metrics, outcomes: r.outcomes, updatedAt: r.updated_at ? new Date(r.updated_at) : undefined,
    }));
  }

  async addInteractionToSubcollection(sessionId: string, interaction: Omit<SessionInteraction, 'timestamp'>): Promise<void> {
    const s = removeUndefined(interaction);
    if (!s || !Object.keys(s).length) return;
    const { error } = await supabase.from('session_interactions').insert({ session_id: sessionId, type: s.type, content: s.content, metadata: s.metadata ?? {}, timestamp: new Date().toISOString() });
    if (error) throw error;
    await supabase.from('sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);
  }

  async addEmotionToSubcollection(sessionId: string, e: Omit<SessionEmotion, 'timestamp'>): Promise<void> {
    const { error } = await supabase.from('session_emotions').insert({ session_id: sessionId, primary_emotion: e.primaryEmotion, intensity: e.intensity, valence: e.valence, arousal: e.arousal, confidence: e.confidence, source: e.source, timestamp: new Date().toISOString() });
    if (error) throw error;
    await supabase.from('sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);
  }

  async addRiskAssessmentToSubcollection(sessionId: string, r: Omit<SessionRiskAssessment, 'timestamp'>): Promise<void> {
    const { error } = await supabase.from('session_risk_assessments').insert({ session_id: sessionId, level: r.level, indicators: r.indicators ?? [], interventions: r.interventions ?? [], timestamp: new Date().toISOString() });
    if (error) throw error;
    await supabase.from('sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);
  }

  async getSessionInteractions(sessionId: string, limitCount = 100): Promise<SessionInteraction[]> {
    const { data, error } = await supabase.from('session_interactions').select('*').eq('session_id', sessionId).order('timestamp', { ascending: true }).limit(limitCount);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({ timestamp: new Date(r.timestamp), type: r.type, content: r.content, metadata: r.metadata }));
  }

  async getSessionEmotionalJourney(sessionId: string, limitCount = 100): Promise<SessionEmotion[]> {
    const { data, error } = await supabase.from('session_emotions').select('*').eq('session_id', sessionId).order('timestamp', { ascending: true }).limit(limitCount);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({ timestamp: new Date(r.timestamp), primaryEmotion: r.primary_emotion, intensity: r.intensity, valence: r.valence, arousal: r.arousal, confidence: r.confidence, source: r.source }));
  }

  async getSessionRiskAssessments(sessionId: string, limitCount = 100): Promise<SessionRiskAssessment[]> {
    const { data, error } = await supabase.from('session_risk_assessments').select('*').eq('session_id', sessionId).order('timestamp', { ascending: true }).limit(limitCount);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({ timestamp: new Date(r.timestamp), level: r.level, indicators: r.indicators ?? [], interventions: r.interventions ?? [] }));
  }

  // ── CRISIS ────────────────────────────────────────────────────────────────
  async recordCrisisEvent(ce: Omit<CrisisEvent, 'eventId'>): Promise<string> {
    const { data, error } = await supabase.from('crisis_events').insert({
      user_id: ce.userId, timestamp: new Date().toISOString(), severity: ce.severity,
      trigger_message: ce.triggerMessage, detected_indicators: ce.detectedIndicators ?? [],
      interventions_taken: ce.interventionsTaken ?? [], helplines_called: ce.helplinesCalled ?? [],
      professional_referral: ce.professionalReferral ?? false, follow_up_scheduled: ce.followUpScheduled ?? false,
      resolution: ce.resolution ?? 'pending', notes: ce.notes ?? null,
    }).select('id').single();
    if (error) throw error;
    const profile = await this.getUserProfile(ce.userId);
    if (profile) await this.updateUserProfile(ce.userId, { mentalHealthProfile: { ...profile.mentalHealthProfile, currentRiskLevel: ce.severity, lastAssessmentDate: new Date() } });
    return data.id;
  }

  async getUserCrisisEvents(uid: string): Promise<CrisisEvent[]> {
    const { data, error } = await supabase.from('crisis_events').select('*').eq('user_id', uid).order('timestamp', { ascending: false }).limit(20);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({ eventId: r.id, userId: r.user_id, timestamp: new Date(r.timestamp), severity: r.severity, triggerMessage: r.trigger_message, detectedIndicators: r.detected_indicators ?? [], interventionsTaken: r.interventions_taken ?? [], helplinesCalled: r.helplines_called ?? [], professionalReferral: r.professional_referral ?? false, followUpScheduled: r.follow_up_scheduled ?? false, resolution: r.resolution ?? 'pending', notes: r.notes ?? undefined }));
  }

  async logCrisisEvent(event: Omit<CrisisEvent, 'eventId'>): Promise<string> {
    const { data, error } = await supabase.from('crisis_events').insert({
      user_id: event.userId, timestamp: new Date().toISOString(), severity: event.severity,
      trigger_message: event.triggerMessage, detected_indicators: event.detectedIndicators ?? [],
      interventions_taken: event.interventionsTaken ?? [], helplines_called: event.helplinesCalled ?? [],
      professional_referral: event.professionalReferral ?? false, follow_up_scheduled: event.followUpScheduled ?? false,
      resolution: event.resolution ?? 'pending', notes: event.notes ?? null,
    }).select('id').single();
    if (error) throw error;
    return data.id;
  }

  // ── ASSESSMENTS ───────────────────────────────────────────────────────────
  async saveAssessmentResult(assessment: Omit<AssessmentResult, 'assessmentId'>): Promise<string> {
    const { data, error } = await supabase.from('assessments').insert({
      user_id: assessment.userId, assessment_type: assessment.assessmentType,
      completed_at: new Date().toISOString(), responses: assessment.responses ?? {},
      scores: assessment.scores, compared_to_previous: assessment.comparedToPrevious ?? null,
    }).select('id').single();
    if (error) throw error;
    const profile = await this.getUserProfile(assessment.userId);
    if (profile) {
      const mhp = { ...profile.mentalHealthProfile, lastAssessmentDate: new Date() };
      if (assessment.assessmentType === 'phq9') mhp.phq9Score = assessment.scores.totalScore;
      if (assessment.assessmentType === 'gad7') mhp.gad7Score = assessment.scores.totalScore;
      await this.updateUserProfile(assessment.userId, { mentalHealthProfile: mhp });
    }
    return data.id;
  }

  async getUserAssessments(uid: string, assessmentType?: string): Promise<AssessmentResult[]> {
    let q = supabase.from('assessments').select('*').eq('user_id', uid);
    if (assessmentType) q = q.eq('assessment_type', assessmentType);
    const { data, error } = await q.order('completed_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: any) => ({ assessmentId: r.id, userId: r.user_id, assessmentType: r.assessment_type, completedAt: new Date(r.completed_at), responses: r.responses ?? {}, scores: r.scores, comparedToPrevious: r.compared_to_previous ?? undefined }));
  }

  // ── ANALYTICS ─────────────────────────────────────────────────────────────
  async getUserProgressAnalytics(uid: string, timeframe: 'week'|'month'|'year' = 'month'): Promise<ProgressData> {
    try {
      const { data } = await supabase.from('user_progress_analytics').select('data,updated_at').eq('user_id', uid).eq('timeframe', timeframe).single();
      if (data?.data) {
        const stale = (Date.now() - new Date(data.updated_at).getTime()) > 3600000;
        if (!stale) return data.data as ProgressData;
      }
      const fresh = await this.calculateProgressDataFromRaw(uid, timeframe);
      await supabase.from('user_progress_analytics').upsert({ user_id: uid, timeframe, data: fresh, updated_at: new Date().toISOString() }, { onConflict: 'user_id,timeframe' });
      return fresh;
    } catch { return this.getDefaultAnalyticsData(timeframe); }
  }

  private async calculateProgressDataFromRaw(uid: string, timeframe: 'week'|'month'|'year'): Promise<ProgressData> {
    try {
      const { startDate, endDate } = this.getDateRange(timeframe);
      const [sessions, assessments] = await Promise.all([this.getUserSessions(uid, 100), this.getUserAssessments(uid)]);
      const fs = sessions.filter(s => s.startTime >= startDate && s.startTime <= endDate);
      const fa = assessments.filter(a => a.completedAt >= startDate && a.completedAt <= endDate);
      const chart = await this.calculateRawChartData(uid, timeframe);
      const total = fs.length;
      const avgDur = total > 0 ? fs.reduce((s, x) => s + (x.duration||0), 0) / total : 0;
      const engVals = fs.map(s => s.progressMetrics?.engagementLevel || 5);
      const avgEng = engVals.length > 0 ? engVals.reduce((a,b)=>a+b,0)/engVals.length : 5;
      const trend = avgEng > 6 ? 'improving' : avgEng < 4 ? 'declining' : 'stable';
      const phq9 = fa.filter(a => a.assessmentType==='phq9');
      const gad7 = fa.filter(a => a.assessmentType==='gad7');
      const lPhq9 = phq9.length > 0 ? phq9[phq9.length-1]!.scores.totalScore : null;
      const lGad7 = gad7.length > 0 ? gad7[gad7.length-1]!.scores.totalScore : null;
      return { timeframe, sessions:{ total, averageDuration:Math.round(avgDur), emotionalTrend:trend as any, engagementLevel:Math.min(100,total*10) }, assessments:{ total:fa.length, latestScores:{phq9:lPhq9,gad7:lGad7}, progressTrend:{phq9:phq9.length>=2?'improving':'insufficient_data',gad7:gad7.length>=2?'improving':'insufficient_data'} }, insights:this.generateBasicInsights(total,avgEng,lPhq9,lGad7), emotionalTrendChartData:chart.emotionalTrendChartData, assessmentHistoryChartData:chart.assessmentHistoryChartData };
    } catch { return this.getDefaultAnalyticsData(timeframe); }
  }

  private generateBasicInsights(total: number, avg: number, phq9: number|null, gad7: number|null): string[] {
    const i: string[] = [];
    if (total===0){i.push('Start your journey to see your insights!');return i;}
    if (total>=5) i.push(`Great consistency! You've completed ${total} sessions.`);
    if (avg>6) i.push('Your mood has been trending positively! Keep up the great work.');
    else if (avg<4) i.push('Consider reaching out for additional support if you need it.');
    if (phq9!==null&&phq9<5) i.push('Your recent depression screening shows minimal symptoms.');
    if (gad7!==null&&gad7<5) i.push('Your recent anxiety screening shows minimal symptoms.');
    if (!i.length) i.push('Continue your wellness journey - every step counts!');
    return i;
  }

  private getDefaultAnalyticsData(timeframe: string): ProgressData {
    return { timeframe, sessions:{total:0,averageDuration:0,emotionalTrend:'stable',engagementLevel:0}, assessments:{total:0,latestScores:{phq9:null,gad7:null},progressTrend:{phq9:'insufficient_data',gad7:'insufficient_data'}}, insights:['Start your journey to see your insights!'], emotionalTrendChartData:[], assessmentHistoryChartData:[] };
  }
   async getAggregatedChartData(userId: string, timeframe: 'week'|'month'|'year'): Promise<{
    emotionalTrendChartData: DateValuePoint[];
    assessmentHistoryChartData: AssessmentHistoryPoint[];
  }> {
    try {
      const { startDate, endDate } = this.getDateRange(timeframe);
      const aggregated = await this.getPreAggregatedData(userId, startDate, endDate);
      if (aggregated.length > 0) {
        return this.formatAggregatedChartData(aggregated, timeframe);
      }
      return await this.calculateRawChartData(userId, timeframe);
    } catch (error) {
      console.error('getAggregatedChartData error:', error);
      return { emotionalTrendChartData: [], assessmentHistoryChartData: [] };
    }
  }
 
  private async calculateRawChartData(userId: string, timeframe: 'week'|'month'|'year'): Promise<{
    emotionalTrendChartData: DateValuePoint[];
    assessmentHistoryChartData: AssessmentHistoryPoint[];
  }> {
    try {
      const { startDate, endDate } = this.getDateRange(timeframe);
      const [sessions, assessments] = await Promise.all([
        this.getUserSessions(userId, 100),
        this.getUserAssessments(userId),
      ]);
 
      const filteredSessions = sessions.filter(s => s.startTime >= startDate && s.startTime <= endDate);
      const filteredAssessments = assessments.filter(a => a.completedAt >= startDate && a.completedAt <= endDate);
 
      const sessionsByDate = new Map<string, SessionData[]>();
      filteredSessions.forEach(session => {
        const dateStr = session.startTime.toISOString().split('T')[0]!;
        if (!sessionsByDate.has(dateStr)) sessionsByDate.set(dateStr, []);
        sessionsByDate.get(dateStr)!.push(session);
      });
 
      const emotionalTrendChartData: DateValuePoint[] = [];
      sessionsByDate.forEach((sessionsForDate, dateStr) => {
        const avgEngagement = sessionsForDate.reduce(
          (sum, s) => sum + (s.progressMetrics?.engagementLevel || 5), 0
        ) / sessionsForDate.length;
        emotionalTrendChartData.push({ date: dateStr, value: Math.round(avgEngagement * 10) / 10 });
      });
 
      const assessmentHistoryChartData: AssessmentHistoryPoint[] = filteredAssessments.map(a => ({
        date: a.completedAt.toISOString().split('T')[0]!,
        phq9: a.assessmentType === 'phq9' ? a.scores.totalScore : null,
        gad7: a.assessmentType === 'gad7' ? a.scores.totalScore : null,
      }));
 
      return {
        emotionalTrendChartData: emotionalTrendChartData.sort((a, b) => a.date.localeCompare(b.date)),
        assessmentHistoryChartData: assessmentHistoryChartData.sort((a, b) => a.date.localeCompare(b.date)),
      };
    } catch (error) {
      console.error('calculateRawChartData error:', error);
      return { emotionalTrendChartData: [], assessmentHistoryChartData: [] };
    }
  }
 
  private async getPreAggregatedData(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('user_chart_data')
        .select('*')
        .eq('user_id', userId)
        .gte('chart_date', startStr)
        .lte('chart_date', endStr)
        .order('chart_date', { ascending: true });
      if (error) throw error;
      return data ?? [];
    } catch (error) {
      console.error('getPreAggregatedData error:', error);
      return [];
    }
  }
 
  private formatAggregatedChartData(rows: any[], timeframe: 'week'|'month'|'year'): {
    emotionalTrendChartData: DateValuePoint[];
    assessmentHistoryChartData: AssessmentHistoryPoint[];
  } {
    const opts = this.getDateFormatOptions(timeframe);
 
    const emotionalTrendChartData: DateValuePoint[] = rows
      .filter(r => r.emotional_data && r.emotional_data.wellnessScore > 0)
      .map(r => ({
        date: new Date(r.chart_date).toLocaleDateString('en-IN', opts),
        value: r.emotional_data.wellnessScore,
      }));
 
    const assessmentHistoryChartData: AssessmentHistoryPoint[] = rows
      .filter(r => r.assessment_data && (r.assessment_data.phq9Score !== undefined || r.assessment_data.gad7Score !== undefined))
      .map(r => ({
        date: new Date(r.chart_date).toLocaleDateString('en-IN', opts),
        phq9: r.assessment_data.phq9Score ?? null,
        gad7: r.assessment_data.gad7Score ?? null,
      }));
 
    return { emotionalTrendChartData, assessmentHistoryChartData };
  }
 
  private getDateRange(timeframe: 'week'|'month'|'year'): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();
    switch (timeframe) {
      case 'week': startDate.setDate(endDate.getDate() - 7); break;
      case 'month': startDate.setMonth(endDate.getMonth() - 1); break;
      case 'year': startDate.setFullYear(endDate.getFullYear() - 1); break;
    }
    return { startDate, endDate };
  }
 
  private getDateFormatOptions(timeframe: 'week'|'month'|'year'): Intl.DateTimeFormatOptions {
    switch (timeframe) {
      case 'week': return { weekday: 'short', month: 'short', day: 'numeric' };
      case 'month': return { month: 'short', day: 'numeric' };
      case 'year': return { month: 'short', year: '2-digit' };
      default: return { month: 'short', day: 'numeric' };
    }
  }
 
  async triggerDataAggregation(userId: string, timeframe: 'week'|'month'|'year'): Promise<void> {
    try {
      const { startDate, endDate } = this.getDateRange(timeframe);
      const { error } = await supabase.functions.invoke('aggregate-chart-data', {
        body: {
          userId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('triggerDataAggregation error:', error);
      throw error;
    }
  }
 
  // ── JOURNAL ───────────────────────────────────────────────────────────────
 
  private async analyzeJournalEntryLocally(content: string, mood: JournalEntry['mood']): Promise<JournalEntry['aiInsights']> {
    const fallback: JournalEntry['aiInsights'] = {
      sentimentScore: 0, sentimentMagnitude: 0.4, keyThemes: [], positiveMentions: [],
      negativeMentions: [], potentialTriggers: [], copingMentioned: [], riskFlags: [],
      summary: 'Unable to analyze entry right now.', analysisTimestamp: new Date(),
      modelVersion: 'llama-v3p1-70b-instruct',
    };
    try {
      const payload = await encryptTransportPayload({ content, mood });
      const { data, error } = await supabase.functions.invoke('analyze-journal-entry', { body: { payload } });
      if (error || !data) return fallback;
      return { ...data, analysisTimestamp: data.analysisTimestamp ? new Date(data.analysisTimestamp) : new Date() };
    } catch (error) {
      console.error('analyzeJournalEntryLocally error:', error);
      return fallback;
    }
  }
 
  async createJournalEntry(entry: Omit<JournalEntry, 'entryId'>): Promise<string> {
    const aiInsights = await this.analyzeJournalEntryLocally(entry.content, entry.mood);
    const { data, error } = await supabase.from('journal_entries').insert({
      user_id: entry.userId, title: entry.title, content: entry.content, mood: entry.mood,
      emotions: entry.emotions ?? [], tags: entry.tags ?? [], is_private: entry.isPrivate ?? true,
      ai_insights: aiInsights, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).select('id').single();
    if (error) throw error;
    return data.id;
  }
 
  async getJournalEntries(userId: string, limitCount = 50): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('journal_entries').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(limitCount);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      entryId: r.id, userId: r.user_id, title: r.title, content: r.content, mood: r.mood,
      emotions: r.emotions ?? [], tags: r.tags ?? [], isPrivate: r.is_private,
      createdAt: new Date(r.created_at), updatedAt: new Date(r.updated_at), aiInsights: r.ai_insights,
    }));
  }
 
  async updateJournalEntry(entryId: string, updates: Partial<JournalEntry>): Promise<void> {
    const shouldReanalyze = typeof updates.content === 'string' || typeof updates.mood === 'string';
    const row: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.content !== undefined) row.content = updates.content;
    if (updates.mood !== undefined) row.mood = updates.mood;
    if (updates.emotions !== undefined) row.emotions = updates.emotions;
    if (updates.tags !== undefined) row.tags = updates.tags;
    if (updates.isPrivate !== undefined) row.is_private = updates.isPrivate;
 
    if (shouldReanalyze) {
      const { data: current } = await supabase.from('journal_entries').select('content,mood').eq('id', entryId).single();
      const mergedContent = updates.content ?? current?.content ?? '';
      const mergedMood = updates.mood ?? current?.mood ?? 'neutral';
      row.ai_insights = await this.analyzeJournalEntryLocally(mergedContent, mergedMood);
    }
 
    const { error } = await supabase.from('journal_entries').update(row).eq('id', entryId);
    if (error) throw error;
  }
 
  async deleteJournalEntry(entryId: string): Promise<void> {
    const { error } = await supabase.from('journal_entries').delete().eq('id', entryId);
    if (error) throw error;
  }
 
  async updateJournalEntryWithAIInsights(entryId: string, insights: JournalEntry['aiInsights']): Promise<void> {
    const { error } = await supabase.from('journal_entries').update({
      ai_insights: { ...insights, analysisTimestamp: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    }).eq('id', entryId);
    if (error) console.error(`updateJournalEntryWithAIInsights error for ${entryId}:`, error);
  }
 
  // ── MOOD ──────────────────────────────────────────────────────────────────
 
  async createMoodEntry(entry: Omit<MoodEntry, 'entryId'>): Promise<string> {
    const { data, error } = await supabase.from('mood_entries').insert({
      user_id: entry.userId, mood: entry.mood, energy: entry.energy, anxiety: entry.anxiety,
      sleep: entry.sleep, notes: entry.notes ?? null, triggers: entry.triggers ?? [],
      activities: entry.activities ?? [], location: entry.location ?? null, weather: entry.weather ?? null,
      created_at: new Date().toISOString(),
    }).select('id').single();
    if (error) throw error;
    return data.id;
  }
 
  async getMoodEntries(userId: string, limitCount = 50): Promise<MoodEntry[]> {
    const { data, error } = await supabase
      .from('mood_entries').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(limitCount);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      entryId: r.id, userId: r.user_id, mood: r.mood, energy: r.energy, anxiety: r.anxiety, sleep: r.sleep,
      notes: r.notes ?? undefined, triggers: r.triggers ?? [], activities: r.activities ?? [],
      location: r.location ?? undefined, weather: r.weather ?? undefined, createdAt: new Date(r.created_at),
    }));
  }
 
  async getLatestMoodEntry(userId: string): Promise<MoodEntry | null> {
    const entries = await this.getMoodEntries(userId, 1);
    return entries.length > 0 ? entries[0]! : null;
  }
 
  // ── CHAT ──────────────────────────────────────────────────────────────────
 
  async createConversation(conversation: Omit<ChatConversation, 'conversationId'>): Promise<string> {
    const { data, error } = await supabase.from('chat_conversations').insert({
      user_id: conversation.userId, title: conversation.title,
      started_at: new Date().toISOString(), last_message_at: new Date().toISOString(),
      is_active: conversation.isActive ?? true, session_type: conversation.sessionType,
      ai_personality: conversation.aiPersonality,
    }).select('id').single();
    if (error) throw error;
    return data.id;
  }
 
  async getChatConversations(userId: string, limitCount = 50): Promise<ChatConversation[]> {
    return this.getUserConversations(userId, limitCount);
  }
 
  async getUserConversations(userId: string, limitCount = 50): Promise<ChatConversation[]> {
    const { data, error } = await supabase
      .from('chat_conversations').select('*').eq('user_id', userId)
      .order('last_message_at', { ascending: false }).limit(limitCount);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      conversationId: r.id, userId: r.user_id, title: r.title,
      startedAt: new Date(r.started_at), lastMessageAt: new Date(r.last_message_at),
      isActive: r.is_active, sessionType: r.session_type, aiPersonality: r.ai_personality,
    }));
  }
 
  async addMessage(message: Omit<ChatMessage, 'messageId'>): Promise<string> {
    const { data, error } = await supabase.from('chat_messages').insert({
      conversation_id: message.conversationId, sender: message.sender, content: message.content,
      timestamp: new Date().toISOString(), message_type: message.messageType, metadata: message.metadata ?? {},
    }).select('id').single();
    if (error) throw error;
    await supabase.from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', message.conversationId);
    return data.id;
  }
 
  async getConversationMessages(conversationId: string, limitCount = 100): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages').select('*').eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true }).limit(limitCount);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      messageId: r.id, conversationId: r.conversation_id, sender: r.sender, content: r.content,
      timestamp: new Date(r.timestamp), messageType: r.message_type, metadata: r.metadata,
    }));
  }
 
  listenToConversationMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void,
    onError: (error: Error) => void,
    limitCount = 100
  ): () => void {
    this.getConversationMessages(conversationId, limitCount).then(callback).catch(onError);
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        () => { this.getConversationMessages(conversationId, limitCount).then(callback).catch(onError); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }
 
  listenToUserConversations(
    userId: string,
    callback: (conversations: ChatConversation[]) => void,
    onError: (error: Error) => void,
    limitCount = 50
  ): () => void {
    this.getUserConversations(userId, limitCount).then(callback).catch(onError);
    const channel = supabase
      .channel(`conversations-${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chat_conversations', filter: `user_id=eq.${userId}` },
        () => { this.getUserConversations(userId, limitCount).then(callback).catch(onError); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }
 
  // ── PROGRESS TRACKING ─────────────────────────────────────────────────────
 
  async saveProgressData(progress: DailyProgressData): Promise<void> {
    const dateStr = progress.date.toISOString().split('T')[0];
    const { error } = await supabase.from('daily_progress').upsert({
      user_id: progress.userId, date: dateStr, metrics: progress.metrics,
      goals: progress.goals ?? [], achievements: progress.achievements ?? [], challenges: progress.challenges ?? [],
    }, { onConflict: 'user_id,date' });
    if (error) throw error;
  }
 
  async getProgressData(userId: string, limitCount = 50): Promise<DailyProgressData[]> {
    const { data, error } = await supabase
      .from('daily_progress').select('*').eq('user_id', userId)
      .order('date', { ascending: false }).limit(limitCount);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      userId: r.user_id, date: new Date(r.date), metrics: r.metrics,
      goals: r.goals ?? [], achievements: r.achievements ?? [], challenges: r.challenges ?? [],
    }));
  }
 
  // ── APP SETTINGS ──────────────────────────────────────────────────────────
 
  async saveAppSettings(settings: AppSettings): Promise<void> {
    const { error } = await supabase.from('app_settings').upsert({
      user_id: settings.userId, theme: settings.theme, language: settings.language,
      notifications: settings.notifications, privacy: settings.privacy,
      accessibility: settings.accessibility, ai_preferences: settings.aiPreferences,
    }, { onConflict: 'user_id' });
    if (error) throw error;
  }
 
  async getAppSettings(userId: string): Promise<AppSettings | null> {
    const { data, error } = await supabase.from('app_settings').select('*').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') throw error;
    if (data) {
      return {
        userId: data.user_id, theme: data.theme, language: data.language,
        notifications: data.notifications, privacy: data.privacy,
        accessibility: data.accessibility, aiPreferences: data.ai_preferences,
      };
    }
    return mkDefaultSettings(userId);
  }
 
  // ── USER ACTIVITY ─────────────────────────────────────────────────────────
 
  async logUserActivity(userId: string, type: UserActivity['type'], metadata: object): Promise<string> {
    const { data, error } = await supabase.from('user_activities').insert({
      user_id: userId, type, metadata, timestamp: new Date().toISOString(),
    }).select('id').single();
    if (error) throw error;
    return data.id;
  }
 
  async getRecentUserActivities(uid: string, limitCount = 3): Promise<UserActivity[]> {
    const { data, error } = await supabase
      .from('user_activities').select('*').eq('user_id', uid)
      .order('timestamp', { ascending: false }).limit(limitCount);
    if (error) { console.error('getRecentUserActivities error:', error); return []; }
    return (data ?? []).map((r: any) => ({
      activityId: r.id, userId: r.user_id, type: r.type, metadata: r.metadata, timestamp: new Date(r.timestamp),
    }));
  }
 
  // ── ANALYTICS SUMMARY ────────────────────────────────────────────────────

  async getUserAnalytics(userId: string, days: number = 30): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      const [moodEntries, journalEntries, sessions, assessments] = await Promise.all([
        this.getMoodEntries(userId),
        this.getJournalEntries(userId, 100),
        this.getUserSessions(userId, 50),
        this.getUserAssessments(userId),
      ]);
      return {
        period: { startDate, endDate, days },
        mood: {
          averageMood: moodEntries.reduce((sum, e) => sum + e.mood, 0) / (moodEntries.length || 1),
          moodTrend: this.calculateMoodTrend(moodEntries),
          totalEntries: moodEntries.length,
        },
        journal: {
          totalEntries: journalEntries.length,
          averageWordsPerEntry: journalEntries.reduce((sum, e) => sum + e.content.split(' ').length, 0) / (journalEntries.length || 1),
          mostCommonEmotions: this.getMostCommonEmotions(journalEntries),
        },
        sessions: {
          totalSessions: sessions.length,
          averageDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / (sessions.length || 1),
          sessionTypes: this.getSessionTypeBreakdown(sessions),
        },
        assessments: {
          latestScores: { phq9: null, gad7: null },
          progressTrend: { phq9: 'insufficient_data', gad7: 'insufficient_data' },
        },
      };
    } catch (error) {
      console.error('getUserAnalytics error:', error);
      throw error;
    }
  }

  private calculateMoodTrend(moodEntries: MoodEntry[]): 'improving' | 'stable' | 'declining' {
    if (moodEntries.length < 7) return 'stable';
    const recent = moodEntries.slice(0, 7);
    const older = moodEntries.slice(7, 14);
    const recentAvg = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, e) => sum + e.mood, 0) / older.length : recentAvg;
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  }

  private getMostCommonEmotions(journalEntries: JournalEntry[]): string[] {
    const counts: Record<string, number> = {};
    journalEntries.forEach(entry => {
      (entry.emotions ?? []).forEach(emotion => { counts[emotion] = (counts[emotion] || 0) + 1; });
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([emotion]) => emotion);
  }

  private getSessionTypeBreakdown(sessions: SessionData[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    sessions.forEach(s => { breakdown[s.sessionType] = (breakdown[s.sessionType] || 0) + 1; });
    return breakdown;
  }

  // ── DELETE (GDPR) ─────────────────────────────────────────────────────────
 
  async deleteUserData(uid: string): Promise<void> {
    // Session subtables reference sessions.id, not user_id directly — must fetch
    // session ids and clear those FIRST, before sessions themselves are deleted.
    const { data: userSessions } = await supabase.from('sessions').select('id').eq('user_id', uid);
    const sessionIds = (userSessions ?? []).map((s: any) => s.id);
    if (sessionIds.length > 0) {
      await supabase.from('session_interactions').delete().in('session_id', sessionIds);
      await supabase.from('session_emotions').delete().in('session_id', sessionIds);
      await supabase.from('session_risk_assessments').delete().in('session_id', sessionIds);
    }
 
    // chat_messages has no user_id column either — same pattern as session subtables.
    const { data: userConversations } = await supabase.from('chat_conversations').select('id').eq('user_id', uid);
    const conversationIds = (userConversations ?? []).map((c: any) => c.id);
    if (conversationIds.length > 0) {
      await supabase.from('chat_messages').delete().in('conversation_id', conversationIds);
    }
 
    const tables = [
      'journal_entries', 'mood_entries', 'chat_conversations',
      'daily_progress', 'user_activities', 'assessments', 'crisis_events', 'sessions',
    ];
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq('user_id', uid);
      if (error) console.error(`deleteUserData: failed to clear ${table}:`, error);
    }
 
    await supabase.from('profiles').delete().eq('id', uid);
  }
 
} // end class SupabaseService
 
// Export singleton instance — same pattern as firebaseService.ts
export const supabaseService = new SupabaseService();
export default supabaseService;
