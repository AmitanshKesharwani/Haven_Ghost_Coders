import { useState, useEffect } from 'react';

interface DashboardData {
  insights: string[];
  weeklyGoals: { name: string; progress: number; target: number }[];
  milestones: string[];
}

/**
 * Hook to fetch dashboard data for a given user.
 * Replace the fetch URL with your actual backend endpoint.
 */
export function useDashboardData(userId: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.VITE_AI_BACKEND_URL || ''}/dashboard?userId=${userId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        setData({
          insights: result.insights ?? [],
          weeklyGoals: result.weeklyGoals ?? [],
          milestones: result.milestones ?? [],
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return { data, loading, error };
}
