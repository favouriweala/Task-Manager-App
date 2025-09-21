'use client';

import { useState, useEffect } from 'react';

export interface AnalyticsData {
  overview: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    reviewTasks: number;
    completionRate: number;
    totalTimeLogged: number;
    averageTimePerTask: number;
    dailyProductivity: number;
  };
  priorityDistribution: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  projectStats: Array<{
    id: string;
    name: string;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    reviewTasks: number;
  }>;
  userStats: Array<{
    id: string;
    name: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    isActive: boolean;
  }>;
  dailyStats: Array<{
    date: string;
    tasksCreated: number;
    tasksCompleted: number;
    timeLogged: number;
    productivity: number;
  }>;
  trends: {
    tasksCreatedTrend: number;
    tasksCompletedTrend: number;
    timeLoggedTrend: number;
  };
}

export interface AnalyticsFilters {
  timeRange: '24h' | '7d' | '30d' | '90d';
  projectId?: string;
  userId?: string;
}

export function useAnalytics(filters: AnalyticsFilters = { timeRange: '7d' }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        timeRange: filters.timeRange,
      });

      if (filters.projectId) {
        params.append('projectId', filters.projectId);
      }
      if (filters.userId) {
        params.append('userId', filters.userId);
      }

      const response = await fetch(`/api/analytics?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analytics');
      }

      setData(result.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      
      // Set mock data for development
      setData(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters.timeRange, filters.projectId, filters.userId]);

  const refetch = () => {
    fetchAnalytics();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Mock data for development and fallback
function getMockAnalyticsData(): AnalyticsData {
  return {
    overview: {
      totalTasks: 45,
      completedTasks: 32,
      inProgressTasks: 8,
      todoTasks: 3,
      reviewTasks: 2,
      completionRate: 71.1,
      totalTimeLogged: 156.5,
      averageTimePerTask: 3.5,
      dailyProductivity: 4.6,
    },
    priorityDistribution: {
      low: 12,
      medium: 18,
      high: 10,
      urgent: 5,
    },
    projectStats: [
      {
        id: '1',
        name: 'Website Redesign',
        totalTasks: 15,
        completedTasks: 12,
        inProgressTasks: 2,
        todoTasks: 1,
        reviewTasks: 0,
      },
      {
        id: '2',
        name: 'Mobile App',
        totalTasks: 20,
        completedTasks: 14,
        inProgressTasks: 4,
        todoTasks: 1,
        reviewTasks: 1,
      },
      {
        id: '3',
        name: 'API Development',
        totalTasks: 10,
        completedTasks: 6,
        inProgressTasks: 2,
        todoTasks: 1,
        reviewTasks: 1,
      },
    ],
        userStats: [
      {
        id: '1',
        name: 'John Doe',
        totalTasks: 20,
        completedTasks: 16,
        completionRate: 80,
        isActive: true,
      },
      {
        id: '2',
        name: 'Jane Smith',
        totalTasks: 15,
        completedTasks: 12,
        completionRate: 80,
        isActive: true,
      },
      {
        id: '3',
        name: 'Mike Johnson',
        totalTasks: 10,
        completedTasks: 4,
        completionRate: 40,
        isActive: false,
      },
    ],
    
    dailyStats: [
      { date: '2024-01-15', tasksCreated: 3, tasksCompleted: 5, timeLogged: 8.5, productivity: 1.7 },
      { date: '2024-01-16', tasksCreated: 2, tasksCompleted: 4, timeLogged: 7.2, productivity: 1.8 },
      { date: '2024-01-17', tasksCreated: 4, tasksCompleted: 3, timeLogged: 6.8, productivity: 2.3 },
      { date: '2024-01-18', tasksCreated: 1, tasksCompleted: 6, timeLogged: 9.1, productivity: 1.5 },
      { date: '2024-01-19', tasksCreated: 5, tasksCompleted: 2, timeLogged: 5.4, productivity: 2.7 },
      { date: '2024-01-20', tasksCreated: 2, tasksCompleted: 7, timeLogged: 8.9, productivity: 1.3 },
      { date: '2024-01-21', tasksCreated: 3, tasksCompleted: 5, timeLogged: 7.6, productivity: 1.5 },
    ],
    trends: {
      tasksCreatedTrend: 12.5,
      tasksCompletedTrend: -8.3,
      timeLoggedTrend: 15.7,
    },
  };
}