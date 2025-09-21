import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const projectId = searchParams.get('projectId');
    const timeRange = searchParams.get('timeRange') || '30d';

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
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
        startDate.setDate(now.getDate() - 30);
    }

    if (projectId) {
      // Get specific project analytics
      const projectAnalytics = await getProjectAnalytics(supabase, projectId, startDate, now);
      return NextResponse.json({
        success: true,
        data: projectAnalytics,
        projectId,
        timeRange
      });
    } else {
      // Get all projects analytics
      const allProjectsAnalytics = await getAllProjectsAnalytics(supabase, startDate, now);
      return NextResponse.json({
        success: true,
        data: allProjectsAnalytics,
        timeRange
      });
    }

  } catch (error) {
    console.error('Project analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getProjectAnalytics(supabase: any, projectId: string, startDate: Date, endDate: Date) {
  // Get project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      status,
      created_at,
      updated_at,
      start_date,
      end_date
    `)
    .eq('id', projectId)
    .single();

  if (projectError) {
    throw new Error('Project not found');
  }

  // Get project tasks
  const { data: tasks, error: tasksError } = await supabase
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
      assignee_id,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('project_id', projectId)
    .gte('created_at', startDate.toISOString());

  if (tasksError) {
    throw new Error('Failed to fetch project tasks');
  }

  // Get time entries for project tasks
  const taskIds = tasks?.map((task: any) => task.id) || [];
  const { data: timeEntries, error: timeError } = await supabase
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
      profiles (
        id,
        full_name
      )
    `)
    .in('task_id', taskIds)
    .gte('created_at', startDate.toISOString());

  if (timeError) {
    console.error('Error fetching time entries:', timeError);
  }

  // Calculate project metrics
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((task: any) => task.status === 'done').length || 0;
  const inProgressTasks = tasks?.filter((task: any) => task.status === 'in_progress').length || 0;
  const todoTasks = tasks?.filter((task: any) => task.status === 'todo').length || 0;
  const reviewTasks = tasks?.filter((task: any) => task.status === 'review').length || 0;
  
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const totalTimeLogged = timeEntries?.reduce((sum: any, entry: any) => sum + (entry.duration || 0), 0) || 0;
  const averageTimePerTask = totalTasks > 0 ? totalTimeLogged / totalTasks : 0;

  // Team member performance
  const teamPerformance = tasks?.reduce((acc: any, task: any) => {
    const userId = task.assignee_id;
    const userName = task.profiles?.full_name || 'Unassigned';
    const userAvatar = task.profiles?.avatar_url;
    
    if (!acc[userId]) {
      acc[userId] = {
        id: userId,
        name: userName,
        avatar: userAvatar,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        timeLogged: 0,
        completionRate: 0
      };
    }
    
    acc[userId].totalTasks++;
    if (task.status === 'done') acc[userId].completedTasks++;
    if (task.status === 'in_progress') acc[userId].inProgressTasks++;
    if (task.status === 'todo') acc[userId].todoTasks++;
    
    // Add time logged for this user
    const userTimeEntries = timeEntries?.filter((entry: any) => entry.user_id === userId) || [];
    acc[userId].timeLogged = userTimeEntries.reduce((sum: any, entry: any) => sum + (entry.duration || 0), 0);
    
    acc[userId].completionRate = acc[userId].totalTasks > 0 
      ? (acc[userId].completedTasks / acc[userId].totalTasks) * 100 
      : 0;
    
    return acc;
  }, {} as Record<string, any>) || {};

  // Priority distribution
  const priorityDistribution = {
    low: tasks?.filter((task: any) => task.priority === 'low').length || 0,
    medium: tasks?.filter((task: any) => task.priority === 'medium').length || 0,
    high: tasks?.filter((task: any) => task.priority === 'high').length || 0,
    urgent: tasks?.filter((task: any) => task.priority === 'urgent').length || 0,
  };

  // Daily progress
  const dailyProgress = generateProjectDailyProgress(tasks || [], timeEntries || [], startDate, endDate);

  // Project health score (0-100)
  const healthScore = calculateProjectHealthScore({
    completionRate,
    onTimeDelivery: calculateOnTimeDelivery(tasks || []),
    teamUtilization: calculateTeamUtilization(Object.values(teamPerformance)),
    timeAccuracy: calculateTimeAccuracy(tasks || [])
  });

  return {
    project,
    metrics: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      reviewTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      totalTimeLogged: Math.round(totalTimeLogged * 100) / 100,
      averageTimePerTask: Math.round(averageTimePerTask * 100) / 100,
      healthScore: Math.round(healthScore * 100) / 100
    },
    priorityDistribution,
    teamPerformance: Object.values(teamPerformance),
    dailyProgress,
    insights: generateProjectInsights(tasks || [], timeEntries || [], teamPerformance)
  };
}

async function getAllProjectsAnalytics(supabase: any, startDate: Date, endDate: Date) {
  // Get all projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      status,
      created_at,
      start_date,
      end_date
    `);

  if (projectsError) {
    throw new Error('Failed to fetch projects');
  }

  // Get tasks for all projects
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      status,
      priority,
      project_id,
      created_at,
      updated_at,
      due_date,
      estimated_hours,
      actual_hours
    `)
    .gte('created_at', startDate.toISOString());

  if (tasksError) {
    throw new Error('Failed to fetch tasks');
  }

  // Calculate metrics for each project
  const projectAnalytics = projects?.map((project: any) => {
    const projectTasks = tasks?.filter((task: any) => task.project_id === project.id) || [];
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((task: any) => task.status === 'done').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return {
      id: project.id,
      name: project.name,
      status: project.status,
      totalTasks,
      completedTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      healthScore: calculateProjectHealthScore({
        completionRate,
        onTimeDelivery: calculateOnTimeDelivery(projectTasks),
        teamUtilization: 75, // Default value
        timeAccuracy: calculateTimeAccuracy(projectTasks)
      })
    };
  }) || [];

  return {
    projects: projectAnalytics,
    summary: {
      totalProjects: projects?.length || 0,
      activeProjects: projects?.filter((p: any) => p.status === 'active').length || 0,
      completedProjects: projects?.filter((p: any) => p.status === 'completed').length || 0,
      totalTasks: tasks?.length || 0,
      completedTasks: tasks?.filter((t: any) => t.status === 'done').length || 0,
      overallCompletionRate: tasks?.length > 0 
        ? Math.round((tasks.filter((t: any) => t.status === 'done').length / tasks.length) * 100 * 100) / 100
        : 0
    }
  };
}

function generateProjectDailyProgress(tasks: any[], timeEntries: any[], startDate: Date, endDate: Date) {
  const dailyProgress = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    
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
    
    dailyProgress.push({
      date: dateStr,
      tasksCreated: dayTasks.length,
      tasksCompleted: dayCompletedTasks.length,
      timeLogged: Math.round(dayTimeLogged * 100) / 100
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return dailyProgress;
}

function calculateProjectHealthScore(metrics: {
  completionRate: number;
  onTimeDelivery: number;
  teamUtilization: number;
  timeAccuracy: number;
}) {
  const weights = {
    completionRate: 0.3,
    onTimeDelivery: 0.3,
    teamUtilization: 0.2,
    timeAccuracy: 0.2
  };
  
  return (
    metrics.completionRate * weights.completionRate +
    metrics.onTimeDelivery * weights.onTimeDelivery +
    metrics.teamUtilization * weights.teamUtilization +
    metrics.timeAccuracy * weights.timeAccuracy
  );
}

function calculateOnTimeDelivery(tasks: any[]) {
  const tasksWithDueDate = tasks.filter(task => task.due_date && task.status === 'done');
  if (tasksWithDueDate.length === 0) return 100;
  
  const onTimeTasks = tasksWithDueDate.filter(task => {
    const dueDate = new Date(task.due_date);
    const completedDate = new Date(task.updated_at);
    return completedDate <= dueDate;
  });
  
  return (onTimeTasks.length / tasksWithDueDate.length) * 100;
}

function calculateTeamUtilization(teamMembers: any[]) {
  if (teamMembers.length === 0) return 0;
  
  const avgCompletionRate = teamMembers.reduce((sum, member) => sum + member.completionRate, 0) / teamMembers.length;
  return avgCompletionRate;
}

function calculateTimeAccuracy(tasks: any[]) {
  const tasksWithEstimates = tasks.filter(task => task.estimated_hours && task.actual_hours);
  if (tasksWithEstimates.length === 0) return 100;
  
  const accuracyScores = tasksWithEstimates.map(task => {
    const accuracy = Math.min(task.estimated_hours, task.actual_hours) / Math.max(task.estimated_hours, task.actual_hours);
    return accuracy * 100;
  });
  
  return accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length;
}

function generateProjectInsights(tasks: any[], timeEntries: any[], teamPerformance: Record<string, any>) {
  const insights = [];
  
  // Task completion insights
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  
  if (totalTasks > 0) {
    const completionRate = (completedTasks / totalTasks) * 100;
    if (completionRate > 80) {
      insights.push({
        type: 'positive',
        title: 'Excellent Progress',
        description: `Project is ${completionRate.toFixed(1)}% complete with strong momentum.`
      });
    } else if (completionRate < 30) {
      insights.push({
        type: 'warning',
        title: 'Slow Progress',
        description: `Only ${completionRate.toFixed(1)}% of tasks completed. Consider reviewing priorities.`
      });
    }
  }
  
  // Team performance insights
  const teamMembers = Object.values(teamPerformance);
  if (teamMembers.length > 0) {
    const topPerformer = teamMembers.reduce((top, member) => 
      member.completionRate > top.completionRate ? member : top
    );
    
    if (topPerformer.completionRate > 90) {
      insights.push({
        type: 'positive',
        title: 'Top Performer',
        description: `${topPerformer.name} is excelling with ${topPerformer.completionRate.toFixed(1)}% completion rate.`
      });
    }
  }
  
  // Time tracking insights
  const totalTimeLogged = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  if (totalTimeLogged > 0 && totalTasks > 0) {
    const avgTimePerTask = totalTimeLogged / totalTasks;
    if (avgTimePerTask > 8) {
      insights.push({
        type: 'info',
        title: 'Time Investment',
        description: `Tasks are taking an average of ${avgTimePerTask.toFixed(1)} hours. Consider breaking down complex tasks.`
      });
    }
  }
  
  return insights;
}