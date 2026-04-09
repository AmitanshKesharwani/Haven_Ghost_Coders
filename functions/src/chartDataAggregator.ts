// functions/src/chartDataAggregator.ts

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

// Define the data types we'll be using and saving
interface DateValuePoint {
  date: string;
  value: number;
}

interface AssessmentHistoryPoint {
  date: string;
  phq9: number | null;
  gad7: number | null;
}

interface AnalyticsData {
  timeframe: string;
  sessions: {
    total: number;
    averageDuration: number; // in milliseconds
    emotionalTrend: string;
    engagementLevel: number; // 0-1
  };
  assessments: {
    total: number;
    latestScores: {
      phq9: number | null;
      gad7: number | null;
    };
    progressTrend: {
      phq9: string;
      gad7: string;
    };
  };
  insights: string[];
  emotionalTrendChartData: DateValuePoint[];
  assessmentHistoryChartData: AssessmentHistoryPoint[];
}

/**
 * This function runs on a schedule (e.g., every 24 hours) for ALL users.
 * It fetches raw data, calculates analytics, and saves it to a simple
 * 'user_analytics' document for fast dashboard loading.
 */
export const aggregateUserChartData = functions.pubsub
  .schedule("every 24 hours") // You can change this schedule
  .onRun(async () => {
    console.log("Running aggregateUserChartData for all users...");

    // Get the Firestore database instance inside the function
    const db = admin.firestore();
    const usersSnapshot = await db.collection("users").get();
    const aggregationPromises: Promise<void>[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      // Process each user's data in parallel
      aggregationPromises.push(aggregateDataForUser(userId, db));
    }

    await Promise.all(aggregationPromises);
    console.log(`Analytics aggregation complete for ${usersSnapshot.size} users.`);
    return null;
  });

/**
 * Performs the data aggregation for a single user.
 */
async function aggregateDataForUser(userId: string, db: admin.firestore.Firestore) {
  try {
    console.log(`Aggregating data for user: ${userId}...`);

    const timeframe = "month";
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); // 30 days ago
    const startDateTimestamp = Timestamp.fromDate(startDate);
    const dateFormatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

    // --- Fetch all data for the timeframe ---
    const [sessionsSnapshot, assessmentsSnapshot, snapshotsSnapshot] = await Promise.all([
      db.collection('sessions')
        .where('userId', '==', userId)
        .where('startTime', '>=', startDateTimestamp)
        .limit(150).get(),
      db.collection('assessments')
        .where('userId', '==', userId)
        .where('completedAt', '>=', startDateTimestamp)
        .limit(100).get(),
      db.collection('emotionSnapshots')
        .where('userId', '==', userId)
        .where('timestamp', '>=', startDateTimestamp)
        .limit(300).get()
    ]);

    // --- Process Sessions ---
    // We explicitly define the type for `sessions` to fix the TypeScript error
    const sessions: { duration: number, sessionType: string }[] = sessionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        // Explicitly list properties we need to ensure type safety
        startTime: (data.startTime as Timestamp)?.toDate(),
        duration: data.duration ?? 0, // Ensure duration is set
        sessionType: data.sessionType,
      };
    }).sort((a, b) => (b.startTime?.getTime() ?? 0) - (a.startTime?.getTime() ?? 0)); // Sort newest first

    // --- Process Assessments ---
    const assessments = assessmentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        completedAt: (data.completedAt as Timestamp)?.toDate()
      };
    }).sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0));

    // --- Process Emotion Snapshots ---
    const emotionSnapshots = snapshotsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: (data.timestamp as Timestamp)?.toDate()
      };
    }).sort((a, b) => (a.timestamp?.getTime() ?? 0) - (b.timestamp?.getTime() ?? 0)); // Sort OLDEST first for charts


    // --- Run All Calculations (Logic moved from firebaseService.ts) ---
    const emotionalTrend = calculateEmotionalTrendFromSnapshots(emotionSnapshots);

    const totalSessionCount = sessions.length;
    const totalDurationInMs = sessions.reduce((sum, s) => sum + s.duration, 0); // This will work now
    const averageDurationInMs = totalSessionCount > 0 ? totalDurationInMs / totalSessionCount : 0;

    // New engagement calculation that doesn't use `interactions`
    const calculatedEngagementLevel = calculateEngagementLevel(totalSessionCount, averageDurationInMs);

    const calculatedSessions = {
      total: totalSessionCount,
      averageDuration: averageDurationInMs,
      emotionalTrend: emotionalTrend,
      engagementLevel: calculatedEngagementLevel
    };

    const calculatedAssessments = {
      total: assessments.length,
      latestScores: getLatestAssessmentScores(assessments),
      progressTrend: calculateAssessmentTrend(assessments)
    };

    const emotionalTrendChartData = formatEmotionalTrendChartData(emotionSnapshots, dateFormatOptions);
    const assessmentHistoryChartData = formatAssessmentHistoryChartData(assessments, dateFormatOptions);

    // Pass the calculated trend to generateInsights
    const insights = generateInsights(sessions, assessments, emotionalTrend);

    // --- Create the final aggregated data object ---
    const analyticsData: AnalyticsData = {
      timeframe,
      sessions: calculatedSessions,
      assessments: calculatedAssessments,
      insights,
      emotionalTrendChartData,
      assessmentHistoryChartData,
    };

    // --- Save the aggregated data to a new document ---
    await db.collection('user_analytics').doc(userId).set({
      ...analyticsData,
      lastAggregated: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Successfully aggregated data for user: ${userId}`);

  } catch (error) {
    console.error(`Error aggregating data for user ${userId}:`, error);
  }
} // <-- Fixed: Removed stray characters here


// --- All Helper Functions (Moved from firebaseService.ts) ---

function calculateEmotionalTrendFromSnapshots(snapshots: any[]): string {
  if (snapshots.length < 5) return 'stable';
  const halfIndex = Math.floor(snapshots.length / 2);
  const firstHalf = snapshots.slice(0, halfIndex);
  const secondHalf = snapshots.slice(halfIndex);
  const calcAvgPositivity = (arr: any[]) => {
    if (arr.length === 0) return 0;
    const total = arr.reduce((sum, s) => {
      const e = s.emotions;
      const score = (e?.joy ?? 0) - ((e?.sorrow ?? 0) + (e?.anger ?? 0) + (e?.fear ?? 0) + (e?.disgust ?? 0));
      return sum + score;
    }, 0);
    return total / arr.length;
  };
  const avgFirst = calcAvgPositivity(firstHalf);
  const avgSecond = calcAvgPositivity(secondHalf);
  if (avgSecond > avgFirst + 0.1) return 'improving';
  if (avgSecond < avgFirst - 0.1) return 'declining';
  return 'stable';
}

function formatEmotionalTrendChartData(snapshots: any[], dateFormatOptions: Intl.DateTimeFormatOptions): DateValuePoint[] {
  if (!snapshots || snapshots.length === 0) return [];
  return snapshots.map(s => {
    const e = s.emotions;
    const score = (e?.joy ?? 0) - ((e?.sorrow ?? 0) + (e?.anger ?? 0) + (e?.fear ?? 0) + (e?.disgust ?? 0));
    const normalizedScore = (score + 1) / 2;
    return {
      date: s.timestamp ? s.timestamp.toLocaleDateString('en-IN', dateFormatOptions) : 'Unknown',
      value: Math.max(0, Math.min(1, normalizedScore))
    };
  });
}

function formatAssessmentHistoryChartData(assessments: any[], dateFormatOptions: Intl.DateTimeFormatOptions): AssessmentHistoryPoint[] {
  if (!assessments || assessments.length === 0) return [];
  const sortedAssessments = [...assessments].sort((a, b) => (a.completedAt?.getTime() ?? 0) - (b.completedAt?.getTime() ?? 0));
  return sortedAssessments.map(a => ({
    date: a.completedAt ? a.completedAt.toLocaleDateString('en-IN', dateFormatOptions) : 'Unknown',
    phq9: a.assessmentType === 'phq9' ? a.scores?.totalScore ?? null : null,
    gad7: a.assessmentType === 'gad7' ? a.scores?.totalScore ?? null : null,
  })).reduce((acc, current) => {
    const existing = acc.find(item => item.date === current.date);
    if (existing) {
      if (current.phq9 !== null) existing.phq9 = current.phq9;
      if (current.gad7 !== null) existing.gad7 = current.gad7;
    } else {
      acc.push(current);
    }
    return acc;
  }, [] as AssessmentHistoryPoint[]);
}

// --- NEW engagement calculation (doesn't use `interactions`) ---
function calculateEngagementLevel(totalSessionCount: number, averageDurationInMs: number): number {
  if (totalSessionCount === 0) return 0;

  // Engagement: 0-1 score.
  // 50% from session count (max 5 sessions = 0.5 score)
  // 50% from average duration (max 15 mins avg = 0.5 score)
  const engagementFromCount = Math.min(0.5, (totalSessionCount / 5) * 0.5);
  const engagementFromDuration = Math.min(0.5, (averageDurationInMs / (15 * 60 * 1000)) * 0.5);
  return engagementFromCount + engagementFromDuration;
}

function getLatestAssessmentScores(assessments: any[]): { phq9: number | null, gad7: number | null } {
  const latest: { phq9: number | null, gad7: number | null } = { phq9: null, gad7: null };
  // Assessments are already sorted newest first
  for (const assessment of assessments) {
    if (assessment.assessmentType === 'phq9' && latest.phq9 === null) {
      latest.phq9 = assessment.scores.totalScore;
    }
    if (assessment.assessmentType === 'gad7' && latest.gad7 === null) {
      latest.gad7 = assessment.scores.totalScore;
    }
    if (latest.phq9 !== null && latest.gad7 !== null) break;
  }
  return latest;
}

function calculateAssessmentTrend(assessments: any[]): { phq9: string, gad7: string } {
  const phq9Assessments = assessments.filter(a => a.assessmentType === 'phq9');
  const gad7Assessments = assessments.filter(a => a.assessmentType === 'gad7');
  return {
    phq9: calculateScoreTrend(phq9Assessments),
    gad7: calculateScoreTrend(gad7Assessments)
  };
}

function calculateScoreTrend(assessments: any[]): string {
  if (assessments.length < 2) return 'insufficient_data';
  // Assessments are sorted newest first
  const latest = assessments[0]?.scores?.totalScore;
  const previous = assessments[1]?.scores?.totalScore;

  if (typeof latest === 'number' && typeof previous === 'number') {
    if (latest < previous - 2) return 'improving';
    if (latest > previous + 2) return 'declining';
  }
  return 'stable';
}

// --- UPDATED to accept the pre-calculated emotionalTrend ---
function generateInsights(sessions: any[], assessments: any[], emotionalTrend: string): string[] {
  const insights: string[] = [];
  if (sessions.length > 5) {
    insights.push('Consistent engagement with therapeutic sessions');
  } else if (sessions.length > 0) {
    insights.push('Great job starting your first few sessions!');
  }

  // Use the trend passed from the main function
  if (emotionalTrend === 'improving') {
    insights.push('Your emotional well-being is showing positive trends!');
  }

  const assessmentTrend = calculateAssessmentTrend(assessments);
  if (assessmentTrend.phq9 === 'improving' || assessmentTrend.gad7 === 'improving') {
    insights.push('Your assessment scores are showing improvement!');
  }
  if (assessmentTrend.phq9 === 'declining' || assessmentTrend.gad7 === 'declining') {
    insights.push('Your recent assessment scores are higher. Be mindful and use your coping tools.');
  }

  if (insights.length === 0) {
    insights.push('Start logging sessions and assessments to see your personalized insights here.');
  }

  return insights;
}