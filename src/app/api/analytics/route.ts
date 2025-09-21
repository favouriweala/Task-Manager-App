import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const timeRange = searchParams.get('timeRange') || '7d';
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Build base query
    let tasksQuery = supabase
      .from('tasks')
      .select(`
        id,
        title,
        status,
        priority,
        created_at,
        updated_at,
        due_date,
        estimated_hours,
        actual_hours,
        project_id,
        assignee_id,
        projects (
          id,
          name
        ),
        profiles (
          id,
          full_name
        )
      `)
      .gte('created_at', startDate.toISOString());

    // Apply filters
    if (projectId) {
      tasksQuery = tasksQuery.eq('project_id', projectId);
    }
    if (userId) {
      tasksQuery = tasksQuery.eq('assignee_id', userId);
    }

    const { data: tasks, error: tasksError } = await tasksQuery;
    
    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    // Get time tracking data
    let timeQuery = supabase
      .from('time_entries')
      .select(`
        id,
        task_id,
        user_id,
        start_time,
        end_time,
        duration,
        description,
        created_at,
        tasks (
          id,
          title,
          project_id
        ),
        profiles (
          id,
          full_name
        )
      `)
      .gte('created_at', startDate.toISOString());

    if (projectId) {
      timeQuery = timeQuery.eq('tasks.project_id', projectId);
    }
    if (userId) {
      timeQuery = timeQuery.eq('user_id', userId);
    }

    const { data: timeEntries, error: timeError } = await timeQuery;
    
    if (timeError) {
      console.error('Error fetching time entries:', timeError);
      return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
    }

    // Calculate analytics metrics
    const analytics = calculateAnalytics(tasks || [], timeEntries || [], timeRange);

    return NextResponse.json({
      success: true,
      data: analytics,
      timeRange,
      filters: {
        projectId,
        userId,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateAnalytics(tasks: any[], timeEntries: any[], timeRange: string) {
  // Task metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;
  const reviewTasks = tasks.filter(task => task.status === 'review').length;
  
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Priority distribution
  const priorityDistribution = {
    low: tasks.filter(task => task.priority === 'low').length,
    medium: tasks.filter(task => task.priority === 'medium').length,
    high: tasks.filter(task => task.priority === 'high').length,
    urgent: tasks.filter(task => task.priority === 'urgent').length,
  };

  // Time tracking metrics
  const totalTimeLogged = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const averageTimePerTask = totalTasks > 0 ? totalTimeLogged / totalTasks : 0;
  
  // Daily productivity (tasks completed per day)
  const daysInRange = timeRange === '24h' ? 1 : 
                     timeRange === '7d' ? 7 : 
                     timeRange === '30d' ? 30 : 90;
  const dailyProductivity = completedTasks / daysInRange;

  // Project breakdown
  const projectStats = tasks.reduce((acc, task) => {
    const projectId = task.project_id;
    const projectName = task.projects?.name || 'Unknown Project';
    
    if (!acc[projectId]) {
      acc[projectId] = {
        id: projectId,
        name: projectName,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        reviewTasks: 0
      };
    }
    
    acc[projectId].totalTasks++;
    if (task.status === 'done') acc[projectId].completedTasks++;
    if (task.status === 'in_progress') acc[projectId].inProgressTasks++;
    if (task.status === 'todo') acc[projectId].todoTasks++;
    if (task.status === 'review') acc[projectId].reviewTasks++;
    
    return acc;
  }, {} as Record<string, any>);

  // User performance
  const userStats = tasks.reduce((acc, task) => {
    const userId = task.assignee_id;
    const userName = task.profiles?.full_name || 'Unknown User';
    
    if (!acc[userId]) {
      acc[userId] = {
        id: userId,
        name: userName,
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0
      };
    }
    
    acc[userId].totalTasks++;
    if (task.status === 'done') acc[userId].completedTasks++;
    acc[userId].completionRate = (acc[userId].completedTasks / acc[userId].totalTasks) * 100;
    
    return acc;
  }, {} as Record<string, any>);

  // Time series data for charts
  const dailyStats = generateDailyStats(tasks, timeEntries, daysInRange);

  return {
    overview: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      reviewTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      totalTimeLogged: Math.round(totalTimeLogged * 100) / 100,
      averageTimePerTask: Math.round(averageTimePerTask * 100) / 100,
      dailyProductivity: Math.round(dailyProductivity * 100) / 100
    },
    priorityDistribution,
    projectStats: Object.values(projectStats),
    userStats: Object.values(userStats),
    dailyStats,
    trends: {
      tasksCreatedTrend: calculateTrend(tasks, 'created_at', daysInRange),
      tasksCompletedTrend: calculateTrend(tasks.filter(t => t.status === 'done'), 'updated_at', daysInRange),
      timeLoggedTrend: calculateTimeLoggedTrend(timeEntries, daysInRange)
    }
  };
}

function generateDailyStats(tasks: any[], timeEntries: any[], days: number) {
  const dailyStats = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTasks = tasks.filter(task => 
      task.created_at.startsWith(dateStr)
    );
    
    const dayCompletedTasks = tasks.filter(task => 
      task.status === 'done' && task.updated_at.startsWith(dateStr)
    );
    
    const dayTimeEntries = timeEntries.filter(entry =>
      entry.created_at.startsWith(dateStr)
    );
    
    const dayTimeLogged = dayTimeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    
    dailyStats.push({
      date: dateStr,
      tasksCreated: dayTasks.length,
      tasksCompleted: dayCompletedTasks.length,
      timeLogged: Math.round(dayTimeLogged * 100) / 100,
      productivity: dayCompletedTasks.length > 0 ? dayTimeLogged / dayCompletedTasks.length : 0
    });
  }
  
  return dailyStats;
}

function calculateTrend(items: any[], dateField: string, days: number) {
  if (items.length < 2) return 0;
  
  const midPoint = Math.floor(days / 2);
  const firstHalf = items.filter(item => {
    const itemDate = new Date(item[dateField]);
    const daysAgo = Math.floor((Date.now() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo >= midPoint;
  }).length;
  
  const secondHalf = items.filter(item => {
    const itemDate = new Date(item[dateField]);
    const daysAgo = Math.floor((Date.now() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo < midPoint;
  }).length;
  
  return firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
}

function calculateTimeLoggedTrend(timeEntries: any[], days: number) {
  if (timeEntries.length < 2) return 0;
  
  const midPoint = Math.floor(days / 2);
  const firstHalfTime = timeEntries.filter(entry => {
    const entryDate = new Date(entry.created_at);
    const daysAgo = Math.floor((Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo >= midPoint;
  }).reduce((sum, entry) => sum + (entry.duration || 0), 0);
  
  const secondHalfTime = timeEntries.filter(entry => {
    const entryDate = new Date(entry.created_at);
    const daysAgo = Math.floor((Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo < midPoint;
  }).reduce((sum, entry) => sum + (entry.duration || 0), 0);
  
  return firstHalfTime > 0 ? ((secondHalfTime - firstHalfTime) / firstHalfTime) * 100 : 0;
}