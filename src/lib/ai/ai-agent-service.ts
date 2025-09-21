'use client';

import { createClient } from '@supabase/supabase-js';
import { geminiClient } from './gemini-client';
import { notificationService } from '../services/notificationService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface AIProcessingRequest {
  id: string;
  type: 'pattern_analysis' | 'priority_prediction' | 'completion_forecast' | 'notification_analysis' | 'recommendation_generation';
  data: Record<string, any>;
  userId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  result?: Record<string, any>;
  error?: string;
}

export interface UserBehaviorEvent {
  id: string;
  userId: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: string;
  sessionId?: string;
  context: Record<string, any>;
}

export interface AIAgent {
  id: string;
  name: string;
  type: 'workflow_optimizer' | 'priority_predictor' | 'completion_forecaster' | 'notification_filter' | 'recommendation_engine';
  status: 'active' | 'inactive' | 'maintenance';
  config: Record<string, any>;
  lastRun?: string;
  performance: {
    accuracy: number;
    responseTime: number;
    successRate: number;
  };
}

class AIAgentService {
  private processingQueue: Map<string, AIProcessingRequest> = new Map();
  private agents: Map<string, AIAgent> = new Map();
  private isProcessing = false;

  constructor() {
    this.initializeAgents();
    this.startProcessingLoop();
  }

  /**
   * Initialize AI agents
   */
  private async initializeAgents() {
    try {
      const { data: agents, error } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      agents?.forEach(agent => {
        this.agents.set(agent.id, agent);
      });

      console.log(`Initialized ${agents?.length || 0} AI agents`);
    } catch (error) {
      console.error('Error initializing AI agents:', error);
    }
  }

  /**
   * Track user behavior event
   */
  async trackUserBehavior(event: Omit<UserBehaviorEvent, 'id' | 'timestamp'>) {
    try {
      const behaviorEvent: UserBehaviorEvent = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...event
      };

      const { error } = await supabase
        .from('user_behavior_events')
        .insert(behaviorEvent);

      if (error) throw error;

      // Trigger pattern analysis if enough events accumulated
      await this.checkForPatternAnalysis(event.userId);

      return behaviorEvent;
    } catch (error) {
      console.error('Error tracking user behavior:', error);
      throw error;
    }
  }

  /**
   * Queue AI processing request
   */
  async queueProcessingRequest(request: Omit<AIProcessingRequest, 'id' | 'createdAt' | 'status'>) {
    try {
      const processingRequest: AIProcessingRequest = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        ...request
      };

      // Store in database
      const { error } = await supabase
        .from('ai_processing_queue')
        .insert(processingRequest);

      if (error) throw error;

      // Add to local queue
      this.processingQueue.set(processingRequest.id, processingRequest);

      console.log(`Queued AI processing request: ${processingRequest.type}`);
      return processingRequest;
    } catch (error) {
      console.error('Error queuing processing request:', error);
      throw error;
    }
  }

  /**
   * Process workflow patterns for automation
   */
  async analyzeWorkflowPatterns(userId: string) {
    try {
      // Get recent user actions
      const { data: events, error } = await supabase
        .from('user_behavior_events')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (!events || events.length < 10) {
        return { patterns: [], message: 'Insufficient data for pattern analysis' };
      }

      // Analyze patterns with Gemini
      const patterns = await geminiClient.analyzeWorkflowPatterns(
        events.map(event => ({
          action: event.event_type,
          timestamp: event.timestamp,
          context: event.event_data
        }))
      );

      // Store automation rules
      for (const pattern of patterns) {
        if (pattern.automation_potential > 0.7) {
          await this.createAutomationRule(userId, pattern);
        }
      }

      return { patterns, automationRulesCreated: patterns.filter(p => p.automation_potential > 0.7).length };
    } catch (error) {
      console.error('Error analyzing workflow patterns:', error);
      throw error;
    }
  }

  /**
   * Predict task priority using AI
   */
  async predictTaskPriority(taskData: {
    title: string;
    description: string;
    dueDate?: string;
    projectId?: string;
    userId: string;
  }) {
    try {
      // Get project context if available
      let projectContext = '';
      if (taskData.projectId) {
        const { data: project } = await supabase
          .from('projects')
          .select('name, description')
          .eq('id', taskData.projectId)
          .single();
        
        if (project) {
          projectContext = `${project.name}: ${project.description}`;
        }
      }

      // Get task dependencies
      const { data: dependencies } = await supabase
        .from('tasks')
        .select('title')
        .eq('project_id', taskData.projectId)
        .neq('id', taskData.title); // Assuming we have task ID

      const prediction = await geminiClient.predictTaskPriority({
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        dependencies: dependencies?.map(d => d.title) || [],
        projectContext
      });

      // Store prediction for learning
      await supabase
        .from('ai_predictions')
        .insert({
          id: crypto.randomUUID(),
          user_id: taskData.userId,
          prediction_type: 'task_priority',
          input_data: taskData,
          prediction: prediction,
          confidence: prediction.confidence,
          created_at: new Date().toISOString()
        });

      return prediction;
    } catch (error) {
      console.error('Error predicting task priority:', error);
      throw error;
    }
  }

  /**
   * Forecast project completion
   */
  async forecastProjectCompletion(projectId: string, userId: string) {
    try {
      // Get project data
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          tasks (
            id,
            title,
            status,
            estimated_hours,
            actual_hours,
            due_date
          )
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Get team size (assuming project members table exists)
      const { data: members } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', projectId);

      const forecast = await geminiClient.forecastProjectCompletion({
        name: project.name,
        description: project.description,
        tasks: project.tasks.map((task: any) => ({
          title: task.title,
          status: task.status,
          estimatedHours: task.estimated_hours,
          actualHours: task.actual_hours,
          dueDate: task.due_date
        })),
        teamSize: members?.length || 1,
        startDate: project.created_at
      });

      // Store forecast
      await supabase
        .from('ai_predictions')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          prediction_type: 'project_completion',
          input_data: { projectId },
          prediction: forecast,
          confidence: forecast.confidence,
          created_at: new Date().toISOString()
        });

      return forecast;
    } catch (error) {
      console.error('Error forecasting project completion:', error);
      throw error;
    }
  }

  /**
   * Analyze notification context for smart delivery
   */
  async analyzeNotificationContext(notification: {
    type: string;
    title: string;
    message: string;
    priority: string;
    userId: string;
  }) {
    try {
      // Get user context
      const userContext = await this.getUserContext(notification.userId);

      const analysis = await geminiClient.analyzeNotificationContext({
        ...notification,
        userContext
      });

      // Store analysis result
      await supabase
        .from('notification_rules')
        .insert({
          id: crypto.randomUUID(),
          user_id: notification.userId,
          rule_type: 'smart_delivery',
          conditions: { notificationType: notification.type },
          actions: {
            shouldDeliver: analysis.shouldDeliver,
            deliveryTime: analysis.deliveryTime,
            priority: analysis.priority
          },
          confidence: analysis.confidence,
          created_at: new Date().toISOString()
        });

      return analysis;
    } catch (error) {
      console.error('Error analyzing notification context:', error);
      throw error;
    }
  }

  /**
   * Generate personalized recommendations
   */
  async generatePersonalizedRecommendations(userId: string) {
    try {
      // Get user work patterns
      const workPatterns = await this.getUserWorkPatterns(userId);
      
      // Get user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      // Get recent tasks
      const { data: recentTasks } = await supabase
        .from('tasks')
        .select('title, status, estimated_hours, actual_hours')
        .eq('assigned_to', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      const recommendations = await geminiClient.generatePersonalizedRecommendations({
        id: userId,
        workPatterns: workPatterns || [],
        preferences: preferences?.preferences || {},
        recentTasks: recentTasks?.map(task => ({
          title: task.title,
          status: task.status,
          completionTime: task.actual_hours
        })) || []
      });

      // Store recommendations
      for (const recommendation of recommendations) {
        await supabase
          .from('ai_recommendations')
          .insert({
            id: crypto.randomUUID(),
            user_id: userId,
            type: recommendation.type,
            title: recommendation.title,
            description: recommendation.description,
            actionable: recommendation.actionable,
            impact_score: recommendation.impact,
            confidence: recommendation.confidence,
            status: 'active',
            created_at: new Date().toISOString()
          });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Start processing loop for queued requests
   */
  private async startProcessingLoop() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    while (this.isProcessing) {
      try {
        await this.processQueuedRequests();
        await new Promise(resolve => setTimeout(resolve, 5000)); // Process every 5 seconds
      } catch (error) {
        console.error('Error in processing loop:', error);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait longer on error
      }
    }
  }

  /**
   * Process queued AI requests
   */
  private async processQueuedRequests() {
    try {
      // Get pending requests from database
      const { data: requests, error } = await supabase
        .from('ai_processing_queue')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(5);

      if (error) throw error;

      for (const request of requests || []) {
        await this.processRequest(request);
      }
    } catch (error) {
      console.error('Error processing queued requests:', error);
    }
  }

  /**
   * Process individual AI request
   */
  private async processRequest(request: AIProcessingRequest) {
    try {
      // Mark as processing
      await supabase
        .from('ai_processing_queue')
        .update({ status: 'processing', processed_at: new Date().toISOString() })
        .eq('id', request.id);

      let result: any;

      switch (request.type) {
        case 'pattern_analysis':
          result = await this.analyzeWorkflowPatterns(request.userId);
          break;
        case 'priority_prediction':
          result = await this.predictTaskPriority(request.data);
          break;
        case 'completion_forecast':
          result = await this.forecastProjectCompletion(request.data.projectId, request.userId);
          break;
        case 'notification_analysis':
          result = await this.analyzeNotificationContext(request.data);
          break;
        case 'recommendation_generation':
          result = await this.generatePersonalizedRecommendations(request.userId);
          break;
        default:
          throw new Error(`Unknown request type: ${request.type}`);
      }

      // Mark as completed
      await supabase
        .from('ai_processing_queue')
        .update({ 
          status: 'completed', 
          result,
          processed_at: new Date().toISOString()
        })
        .eq('id', request.id);

      console.log(`Completed AI processing request: ${request.type}`);
    } catch (error) {
      console.error(`Error processing request ${request.id}:`, error);
      
      // Mark as failed
      await supabase
        .from('ai_processing_queue')
        .update({ 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error',
          processed_at: new Date().toISOString()
        })
        .eq('id', request.id);
    }
  }

  /**
   * Helper methods
   */
  private async checkForPatternAnalysis(userId: string) {
    const { data: recentEvents } = await supabase
      .from('user_behavior_events')
      .select('id')
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (recentEvents && recentEvents.length >= 20) {
      await this.queueProcessingRequest({
        type: 'pattern_analysis',
        data: { userId },
        userId,
        priority: 'medium'
      });
    }
  }

  private async createAutomationRule(userId: string, pattern: any) {
    await supabase
      .from('automation_rules')
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        name: `Auto: ${pattern.pattern}`,
        trigger_conditions: { pattern: pattern.pattern },
        actions: { rule: pattern.suggested_rule },
        confidence: pattern.confidence,
        status: 'active',
        created_at: new Date().toISOString()
      });
  }

  private async getUserContext(userId: string) {
    // Get current activity, working hours, recent notifications, etc.
    const { data: recentActivity } = await supabase
      .from('user_behavior_events')
      .select('event_type, event_data')
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(1);

    const { data: recentNotifications } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    const currentHour = new Date().getHours();
    const isWorkingHours = currentHour >= 9 && currentHour <= 17;

    return {
      currentActivity: recentActivity?.[0]?.event_type,
      workingHours: isWorkingHours,
      recentNotifications: recentNotifications?.length || 0,
      preferences: {}
    };
  }

  private async getUserWorkPatterns(userId: string) {
    const { data: events } = await supabase
      .from('user_behavior_events')
      .select('event_type, event_data')
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (!events) return [];

    // Analyze patterns (simplified)
    const patterns = new Map();
    events.forEach(event => {
      const key = event.event_type;
      if (!patterns.has(key)) {
        patterns.set(key, { count: 0, performance: 0.8 });
      }
      patterns.get(key).count++;
    });

    return Array.from(patterns.entries()).map(([activity, data]) => ({
      activity,
      frequency: (data.count / events.length) * 100,
      performance: data.performance * 100
    }));
  }

  /**
   * Stop processing loop
   */
  stopProcessing() {
    this.isProcessing = false;
  }
}

// Singleton instance
export const aiAgentService = new AIAgentService();