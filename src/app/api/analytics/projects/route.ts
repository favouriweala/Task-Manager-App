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

async function getAllProjectsAnalytics(supabase: any, startDate: Date, _endDate: Date) {
  // Get all projects
  const { data: projects, error: projectsError } = await supabase
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