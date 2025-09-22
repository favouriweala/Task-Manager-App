import { createClient } from '@supabase/supabase-js';
import { geminiClient } from './gemini-client';

export interface ProjectMetrics {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  averageTaskDuration: number;
  teamSize: number;
  complexity: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
  startDate: Date;
  targetDate?: Date;
  actualCompletionDate?: Date;
  tags: string[];
}

export interface TaskMetrics {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  complexity: number; // 1-10 scale
  estimatedHours: number;
  actualHours?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assigneeId?: string;
  dependencies: string[];
  tags: string[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface CompletionForecast {
  projectId: string;
  predictedCompletionDate: Date;
  confidence: number; // 0-1 scale
  remainingDays: number;
  riskFactors: string[];
  recommendations: string[];
  milestones: {
    name: string;
    predictedDate: Date;
    confidence: number;
  }[];
}

export interface ProductivityTrends {
  userId?: string;
  projectId?: string;
  period: 'daily' | 'weekly' | 'monthly';
  tasksCompleted: number;
  averageCompletionTime: number;
  velocityTrend: 'increasing' | 'stable' | 'decreasing';
  burnoutRisk: 'low' | 'medium' | 'high';
  peakProductivityHours: number[];
  suggestions: string[];
}

export interface ResourceAllocation {
  projectId: string;
  recommendedTeamSize: number;
  skillRequirements: {
    skill: string;
    importance: number;
    currentCoverage: number;
  }[];
  workloadDistribution: {
    userId: string;
    currentLoad: number;
    recommendedLoad: number;
    capacity: number;
  }[];
  bottlenecks: string[];
}

class PredictiveAnalyticsService {
  private readonly FORECAST_CACHE_TTL = 1000 * 60 * 30; // 30 minutes
  private forecastCache = new Map<string, { forecast: CompletionForecast; timestamp: number }>();
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async getProjectMetrics(projectId: string): Promise<ProjectMetrics | null> {
    try {
      const { data: project, error: projectError } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !project) return null;

      const { data: tasks, error: tasksError } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);

      if (tasksError) return null;

      const totalTasks = tasks.length;
      // Fix for lines 112-121 - Add explicit type annotations for filter parameters
const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
const inProgressTasks = tasks.filter((t: any) => t.status === 'in_progress').length;
const pendingTasks = tasks.filter((t: any) => t.status === 'pending').length;

const completedTasksWithDuration = tasks.filter((t: any) => 
  t.status === 'completed' && t.started_at && t.completed_at
);

      const averageTaskDuration = completedTasksWithDuration.length > 0
        ? completedTasksWithDuration.reduce((sum: number, task: any) => {
            const duration = new Date(task.completed_at).getTime() - new Date(task.started_at).getTime();
            return sum + duration;
          }, 0) / completedTasksWithDuration.length / (1000 * 60 * 60) // Convert to hours
        : 0;

      // Get team size from project members
      const { data: members } = await this.supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', projectId);

      return {
        id: project.id,
        name: project.name,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        averageTaskDuration,
        teamSize: members?.length || 1,
        complexity: project.complexity || 'medium',
        priority: project.priority || 'medium',
        startDate: new Date(project.created_at),
        targetDate: project.target_date ? new Date(project.target_date) : undefined,
        actualCompletionDate: project.completed_at ? new Date(project.completed_at) : undefined,
        tags: project.tags || []
      };
    } catch (error) {
      console.error('Error getting project metrics:', error);
      return null;
    }
  }

  async getTaskMetrics(taskId: string): Promise<TaskMetrics | null> {
    try {
      const { data: task, error } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error || !task) return null;

      return {
        id: task.id,
        projectId: task.project_id,
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        complexity: task.complexity || 5,
        estimatedHours: task.estimated_hours || 0,
        actualHours: task.actual_hours,
        status: task.status,
        assigneeId: task.assignee_id,
        dependencies: task.dependencies || [],
        tags: task.tags || [],
        createdAt: new Date(task.created_at),
        startedAt: task.started_at ? new Date(task.started_at) : undefined,
        completedAt: task.completed_at ? new Date(task.completed_at) : undefined
      };
    } catch (error) {
      console.error('Error getting task metrics:', error);
      return null;
    }
  }

  async generateCompletionForecast(projectId: string): Promise<CompletionForecast | null> {
    try {
      // Check cache first
      const cached = this.forecastCache.get(projectId);
      if (cached && Date.now() - cached.timestamp < this.FORECAST_CACHE_TTL) {
        return cached.forecast;
      }

      const metrics = await this.getProjectMetrics(projectId);
      if (!metrics) return null;

      // Get historical data for similar projects
      const { data: historicalProjects } = await this.supabase
        .from('projects')
        .select('*')
        .eq('status', 'completed')
        .eq('complexity', metrics.complexity)
        .limit(10);

      // Get current velocity (tasks completed per day)
      const { data: recentTasks } = await this.supabase
        .from('tasks')
        .select('completed_at')
        .eq('project_id', projectId)
        .eq('status', 'completed')
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('completed_at', { ascending: false });

      const velocity = this.calculateVelocity(recentTasks || []);
      const remainingTasksCount = metrics.totalTasks - metrics.completedTasks;
      
      // Use AI to analyze patterns and generate forecast
      const aiAnalysis = await geminiClient.forecastProjectCompletion({
        name: metrics.name || 'Project',
        description: (metrics as any).description || '',
        tasks: [], // Simplified for now
        teamSize: metrics.teamSize || 1,
        startDate: (metrics as any).created_at || new Date().toISOString()
      });

      const forecast: CompletionForecast = {
        projectId,
        predictedCompletionDate: new Date(aiAnalysis.estimatedCompletion),
        confidence: aiAnalysis.confidence,
        remainingDays: Math.ceil((new Date(aiAnalysis.estimatedCompletion).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        riskFactors: aiAnalysis.risks,
        recommendations: aiAnalysis.recommendations,
        milestones: []
      };

      // Cache the forecast
      this.forecastCache.set(projectId, { forecast, timestamp: Date.now() });

      return forecast;
    } catch (error) {
      console.error('Error generating completion forecast:', error);
      return null;
    }
  }

  async analyzeProductivityTrends(userId?: string, projectId?: string): Promise<ProductivityTrends | null> {
    try {
      let query = this.supabase
        .from('tasks')
        .select('*')
        .eq('status', 'completed')
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (userId) query = query.eq('assignee_id', userId);
      if (projectId) query = query.eq('project_id', projectId);

      const { data: tasks, error } = await query;
      if (error || !tasks) return null;

      const tasksCompleted = tasks.length;
      const averageCompletionTime = this.calculateAverageCompletionTime(tasks);
      const velocityTrend = this.calculateVelocityTrend(tasks);
      const burnoutRisk = this.assessBurnoutRisk(tasks);
      const peakHours = this.findPeakProductivityHours(tasks);

      // Use AI to generate personalized suggestions
      // Fix for line 279 - Add explicit type annotation for userId parameter
      const suggestions = await geminiClient.generatePersonalizedRecommendations({
        id: userId as string,

        workPatterns: [],
        preferences: {},
        recentTasks: []
      });

      return {
        userId,
        projectId,
        period: 'monthly',
        tasksCompleted,
        averageCompletionTime,
        velocityTrend,
        burnoutRisk,
        peakProductivityHours: peakHours,
        suggestions: suggestions.map((s: any) => s.title || s.description || String(s))
      };
    } catch (error) {
      console.error('Error analyzing productivity trends:', error);
      return null;
    }
  }

  async optimizeResourceAllocation(projectId: string): Promise<ResourceAllocation | null> {
    try {
      const metrics = await this.getProjectMetrics(projectId);
      if (!metrics) return null;

      // Get project members and their workloads
      const { data: members } = await this.supabase
        .from('project_members')
        .select(`
          user_id,
          role,
          profiles:user_id (
            id,
            full_name,
            skills
          )
        `)
        .eq('project_id', projectId);

      if (!members) return null;

      // Get current task assignments
      const { data: assignments } = await this.supabase
        .from('tasks')
        .select('assignee_id, status, estimated_hours, complexity')
        .eq('project_id', projectId)
        .in('status', ['pending', 'in_progress']);

      // Use AI to analyze optimal resource allocation
      const aiAnalysis = await geminiClient.analyzeWorkflowPatterns(
        // Fix for line 323 - Add explicit type annotation for assignment parameter
    assignments?.map((assignment: any) => ({
      action: `task_assignment_${assignment.status}`,
      timestamp: new Date().toISOString(),
      context: {
        assignee_id: assignment.assignee_id,
        estimated_hours: assignment.estimated_hours,
        complexity: assignment.complexity
      }

        })) || []
      );

      return {
        projectId,
        recommendedTeamSize: members.length,
        skillRequirements: [],
        workloadDistribution: [],
        bottlenecks: []
      };
    } catch (error) {
      console.error('Error optimizing resource allocation:', error);
      return null;
    }
  }

  private calculateVelocity(tasks: any[]): number {
    if (tasks.length === 0) return 0;
    
    const daySpan = 30; // Last 30 days
    return tasks.length / daySpan;
  }

  private calculateAverageCompletionTime(tasks: any[]): number {
    const tasksWithDuration = tasks.filter(t => t.started_at && t.completed_at);
    if (tasksWithDuration.length === 0) return 0;

    const totalDuration = tasksWithDuration.reduce((sum, task) => {
      const duration = new Date(task.completed_at).getTime() - new Date(task.started_at).getTime();
      return sum + duration;
    }, 0);

    return totalDuration / tasksWithDuration.length / (1000 * 60 * 60); // Hours
  }

  private calculateVelocityTrend(tasks: any[]): 'increasing' | 'stable' | 'decreasing' {
    if (tasks.length < 4) return 'stable';

    const sortedTasks = tasks.sort((a, b) => 
      new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
    );

    const firstHalf = sortedTasks.slice(0, Math.floor(tasks.length / 2));
    const secondHalf = sortedTasks.slice(Math.floor(tasks.length / 2));

    const firstHalfVelocity = firstHalf.length / 15; // Per day
    const secondHalfVelocity = secondHalf.length / 15; // Per day

    const change = (secondHalfVelocity - firstHalfVelocity) / firstHalfVelocity;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private assessBurnoutRisk(tasks: any[]): 'low' | 'medium' | 'high' {
    const recentTasks = tasks.filter(t => 
      new Date(t.completed_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    const weeklyTaskCount = recentTasks.length;
    const averageComplexity = recentTasks.reduce((sum, t) => sum + (t.complexity || 5), 0) / recentTasks.length;

    if (weeklyTaskCount > 20 || averageComplexity > 8) return 'high';
    if (weeklyTaskCount > 10 || averageComplexity > 6) return 'medium';
    return 'low';
  }

  private findPeakProductivityHours(tasks: any[]): number[] {
    const hourCounts = new Array(24).fill(0);
    
    // Fix for line 403 - Add explicit type annotation for task parameter
    tasks.forEach((task: any) => {
      if (task.completed_at) {
        const hour = new Date(task.completed_at).getHours();
        hourCounts[hour]++;
      }
    });

    const maxCount = Math.max(...hourCounts);
    const threshold = maxCount * 0.8;

    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count >= threshold)
      .map(({ hour }) => hour);
  }

  async invalidateForecastCache(projectId: string): Promise<void> {
    this.forecastCache.delete(projectId);
  }

  async batchGenerateForecasts(projectIds: string[]): Promise<Map<string, CompletionForecast>> {
    const forecasts = new Map<string, CompletionForecast>();
    
    const promises = projectIds.map(async (projectId) => {
      const forecast = await this.generateCompletionForecast(projectId);
      if (forecast) {
        forecasts.set(projectId, forecast);
      }
    });

    await Promise.all(promises);
    return forecasts;
  }
}

export const predictiveAnalyticsService = new PredictiveAnalyticsService();