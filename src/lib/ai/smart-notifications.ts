import { createClient } from '@supabase/supabase-js';
import { geminiClient } from './gemini-client';

export interface NotificationContext {
  userId: string;
  projectId?: string;
  taskId?: string;
  type: 'task_due' | 'project_milestone' | 'team_update' | 'ai_insight' | 'system_alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  content: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface UserPreferences {
  userId: string;
  enabledChannels: ('email' | 'push' | 'in_app')[];
  quietHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
  priorityThreshold: 'low' | 'medium' | 'high' | 'urgent';
  categoryFilters: {
    taskReminders: boolean;
    projectUpdates: boolean;
    teamNotifications: boolean;
    aiInsights: boolean;
    systemAlerts: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  workingDays: number[]; // 0-6, Sunday = 0
  workingHours: {
    start: string;
    end: string;
  };
}

export interface NotificationRule {
  id: string;
  userId: string;
  name: string;
  conditions: {
    projectIds?: string[];
    taskTypes?: string[];
    priorities?: string[];
    keywords?: string[];
    timeConditions?: {
      daysBeforeDue?: number;
      hoursBeforeDue?: number;
    };
  };
  actions: {
    channels: ('email' | 'push' | 'in_app')[];
    customMessage?: string;
    escalation?: {
      delayMinutes: number;
      escalateTo: string[];
    };
  };
  enabled: boolean;
  createdAt: Date;
}

export interface ProcessedNotification {
  id: string;
  originalContext: NotificationContext;
  shouldSend: boolean;
  channels: ('email' | 'push' | 'in_app')[];
  processedContent: string;
  scheduledFor: Date;
  reasoning: string;
  aiEnhanced: boolean;
}

class SmartNotificationService {
  private readonly BATCH_SIZE = 50;
  private readonly PROCESSING_INTERVAL = 1000 * 60 * 5; // 5 minutes
  private processingTimer?: NodeJS.Timeout;
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async processNotification(context: NotificationContext): Promise<ProcessedNotification> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(context.userId);
      if (!preferences) {
        return this.createDefaultProcessedNotification(context, false, 'No user preferences found');
      }

      // Check if notification should be sent based on basic filters
      const basicCheck = this.applyBasicFilters(context, preferences);
      if (!basicCheck.shouldSend) {
        return this.createDefaultProcessedNotification(context, false, basicCheck.reason);
      }

      // Get user's notification rules
      const rules = await this.getUserNotificationRules(context.userId);
      const applicableRules = this.findApplicableRules(context, rules);

      // Use AI to analyze context and enhance notification
      const aiAnalysis = await geminiClient.analyzeNotificationContext({
        type: context.type,
        title: (context as any).title || 'Notification',
        message: (context as any).message || 'New notification',
        priority: context.priority,
        userContext: {
          currentActivity: (context as any).currentActivity,
          workingHours: (context as any).workingHours,
          recentNotifications: (context as any).recentNotifications,
          preferences: preferences
        }
      });

      // Determine optimal delivery time
      const scheduledFor = this.calculateOptimalDeliveryTime(context, preferences, aiAnalysis);

      // Generate enhanced content
      const enhancedContent = (aiAnalysis as any).enhancedContent || context.content;

      return {
        id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        originalContext: context,
        shouldSend: aiAnalysis.shouldDeliver,
        channels: (aiAnalysis as any).recommendedChannels || ['push'],
        processedContent: enhancedContent,
        scheduledFor,
        reasoning: aiAnalysis.reasoning,
        aiEnhanced: true
      };
    } catch (error) {
      console.error('Error processing notification:', error);
      return this.createDefaultProcessedNotification(context, true, 'Fallback to default processing');
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Return default preferences
        return this.getDefaultPreferences(userId);
      }

      return {
        userId: data.user_id,
        enabledChannels: data.enabled_channels || ['in_app'],
        quietHours: data.quiet_hours || { start: '22:00', end: '08:00', timezone: 'UTC' },
        priorityThreshold: data.priority_threshold || 'medium',
        categoryFilters: data.category_filters || {
          taskReminders: true,
          projectUpdates: true,
          teamNotifications: true,
          aiInsights: true,
          systemAlerts: true
        },
        frequency: data.frequency || 'immediate',
        workingDays: data.working_days || [1, 2, 3, 4, 5], // Monday to Friday
        workingHours: data.working_hours || { start: '09:00', end: '17:00' }
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  async getUserNotificationRules(userId: string): Promise<NotificationRule[]> {
    try {
      const { data, error } = await this.supabase
        .from('notification_rules')
        .select('*')
        .eq('user_id', userId)
        .eq('enabled', true);

      if (error || !data) return [];

      return data.map(rule => ({
        id: rule.id,
        userId: rule.user_id,
        name: rule.name,
        conditions: rule.conditions,
        actions: rule.actions,
        enabled: rule.enabled,
        createdAt: new Date(rule.created_at)
      }));
    } catch (error) {
      console.error('Error getting notification rules:', error);
      return [];
    }
  }

  async createNotificationRule(rule: Omit<NotificationRule, 'id' | 'createdAt'>): Promise<NotificationRule | null> {
    try {
      const { data, error } = await this.supabase
        .from('notification_rules')
        .insert({
          user_id: rule.userId,
          name: rule.name,
          conditions: rule.conditions,
          actions: rule.actions,
          enabled: rule.enabled
        })
        .select()
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        conditions: data.conditions,
        actions: data.actions,
        enabled: data.enabled,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error creating notification rule:', error);
      return null;
    }
  }

  async updateUserPreferences(preferences: UserPreferences): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: preferences.userId,
          enabled_channels: preferences.enabledChannels,
          quiet_hours: preferences.quietHours,
          priority_threshold: preferences.priorityThreshold,
          category_filters: preferences.categoryFilters,
          frequency: preferences.frequency,
          working_days: preferences.workingDays,
          working_hours: preferences.workingHours,
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }

  async batchProcessNotifications(contexts: NotificationContext[]): Promise<ProcessedNotification[]> {
    const results: ProcessedNotification[] = [];
    
    for (let i = 0; i < contexts.length; i += this.BATCH_SIZE) {
      const batch = contexts.slice(i, i + this.BATCH_SIZE);
      const batchPromises = batch.map(context => this.processNotification(context));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  async scheduleNotification(processed: ProcessedNotification): Promise<boolean> {
    try {
      if (!processed.shouldSend) return false;

      const { error } = await this.supabase
        .from('scheduled_notifications')
        .insert({
          user_id: processed.originalContext.userId,
          type: processed.originalContext.type,
          priority: processed.originalContext.priority,
          content: processed.processedContent,
          channels: processed.channels,
          scheduled_for: processed.scheduledFor.toISOString(),
          metadata: {
            ...processed.originalContext.metadata,
            aiEnhanced: processed.aiEnhanced,
            reasoning: processed.reasoning
          }
        });

      return !error;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }

  async getNotificationAnalytics(userId: string, days: number = 30): Promise<{
    totalSent: number;
    byChannel: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    engagementRate: number;
    optimalTimes: string[];
  }> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data: notifications, error } = await this.supabase
        .from('sent_notifications')
        .select('*')
        .eq('user_id', userId)
        .gte('sent_at', startDate.toISOString());

      if (error || !notifications) {
        return {
          totalSent: 0,
          byChannel: {},
          byType: {},
          byPriority: {},
          engagementRate: 0,
          optimalTimes: []
        };
      }

      const totalSent = notifications.length;
      const engaged = notifications.filter(n => n.engaged).length;
      const engagementRate = totalSent > 0 ? engaged / totalSent : 0;

      const byChannel: Record<string, number> = {};
      const byType: Record<string, number> = {};
      const byPriority: Record<string, number> = {};
      const hourCounts: Record<number, number> = {};

      notifications.forEach(notification => {
        // Count by channel
        notification.channels?.forEach((channel: string) => {
          byChannel[channel] = (byChannel[channel] || 0) + 1;
        });

        // Count by type
        byType[notification.type] = (byType[notification.type] || 0) + 1;

        // Count by priority
        byPriority[notification.priority] = (byPriority[notification.priority] || 0) + 1;

        // Count by hour for optimal times
        const hour = new Date(notification.sent_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      // Find optimal times (top 3 hours with most engagement)
      const optimalTimes = Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => `${hour}:00`);

      return {
        totalSent,
        byChannel,
        byType,
        byPriority,
        engagementRate,
        optimalTimes
      };
    } catch (error) {
      console.error('Error getting notification analytics:', error);
      return {
        totalSent: 0,
        byChannel: {},
        byType: {},
        byPriority: {},
        engagementRate: 0,
        optimalTimes: []
      };
    }
  }

  private applyBasicFilters(context: NotificationContext, preferences: UserPreferences): { shouldSend: boolean; reason: string } {
    // Check priority threshold
    const priorityLevels = { low: 1, medium: 2, high: 3, urgent: 4 };
    const contextPriority = priorityLevels[context.priority];
    const thresholdPriority = priorityLevels[preferences.priorityThreshold];

    if (contextPriority < thresholdPriority) {
      return { shouldSend: false, reason: 'Below priority threshold' };
    }

    // Check category filters
    const categoryMap = {
      task_due: 'taskReminders',
      project_milestone: 'projectUpdates',
      team_update: 'teamNotifications',
      ai_insight: 'aiInsights',
      system_alert: 'systemAlerts'
    };

    const category = categoryMap[context.type] as keyof typeof preferences.categoryFilters;
    if (category && !preferences.categoryFilters[category]) {
      return { shouldSend: false, reason: 'Category filtered out' };
    }

    // Check quiet hours
    if (this.isInQuietHours(context.timestamp, preferences.quietHours)) {
      return { shouldSend: false, reason: 'In quiet hours' };
    }

    return { shouldSend: true, reason: 'Passed basic filters' };
  }

  private findApplicableRules(context: NotificationContext, rules: NotificationRule[]): NotificationRule[] {
    return rules.filter(rule => {
      const { conditions } = rule;

      // Check project IDs
      if (conditions.projectIds && context.projectId && !conditions.projectIds.includes(context.projectId)) {
        return false;
      }

      // Check task types
      if (conditions.taskTypes && !conditions.taskTypes.includes(context.type)) {
        return false;
      }

      // Check priorities
      if (conditions.priorities && !conditions.priorities.includes(context.priority)) {
        return false;
      }

      // Check keywords
      if (conditions.keywords) {
        const hasKeyword = conditions.keywords.some(keyword =>
          context.content.toLowerCase().includes(keyword.toLowerCase())
        );
        if (!hasKeyword) return false;
      }

      return true;
    });
  }

  private calculateOptimalDeliveryTime(
    context: NotificationContext,
    preferences: UserPreferences,
    aiAnalysis: any
  ): Date {
    const now = new Date();

    // For urgent notifications, send immediately
    if (context.priority === 'urgent') {
      return now;
    }

    // Check if it's within working hours and working days
    const isWorkingDay = preferences.workingDays.includes(now.getDay());
    const currentHour = now.getHours();
    const workingStart = parseInt(preferences.workingHours.start.split(':')[0]);
    const workingEnd = parseInt(preferences.workingHours.end.split(':')[0]);
    const isWorkingHours = currentHour >= workingStart && currentHour < workingEnd;

    if (preferences.frequency === 'immediate' && isWorkingDay && isWorkingHours) {
      return now;
    }

    // For non-immediate frequencies, calculate next appropriate time
    switch (preferences.frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000); // Next hour
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(workingStart, 0, 0, 0);
        return tomorrow;
      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(workingStart, 0, 0, 0);
        return nextWeek;
      default:
        return now;
    }
  }

  private isInQuietHours(timestamp: Date, quietHours: UserPreferences['quietHours']): boolean {
    const hour = timestamp.getHours();
    const minute = timestamp.getMinutes();
    const currentTime = hour * 60 + minute;

    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      // Same day quiet hours
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private async getUserNotificationHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('sent_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(100);

      return data || [];
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  }

  private createDefaultProcessedNotification(
    context: NotificationContext,
    shouldSend: boolean,
    reason: string
  ): ProcessedNotification {
    return {
      id: `default_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalContext: context,
      shouldSend,
      channels: ['in_app'],
      processedContent: context.content,
      scheduledFor: new Date(),
      reasoning: reason,
      aiEnhanced: false
    };
  }

  private getDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      enabledChannels: ['in_app'],
      quietHours: { start: '22:00', end: '08:00', timezone: 'UTC' },
      priorityThreshold: 'medium',
      categoryFilters: {
        taskReminders: true,
        projectUpdates: true,
        teamNotifications: true,
        aiInsights: true,
        systemAlerts: true
      },
      frequency: 'immediate',
      workingDays: [1, 2, 3, 4, 5],
      workingHours: { start: '09:00', end: '17:00' }
    };
  }

  startProcessingQueue(): void {
    if (this.processingTimer) return;

    this.processingTimer = setInterval(async () => {
      await this.processScheduledNotifications();
    }, this.PROCESSING_INTERVAL);
  }

  stopProcessingQueue(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = undefined;
    }
  }

  private async processScheduledNotifications(): Promise<void> {
    try {
      const { data: scheduled, error } = await this.supabase
        .from('scheduled_notifications')
        .select('*')
        .lte('scheduled_for', new Date().toISOString())
        .eq('sent', false)
        .limit(this.BATCH_SIZE);

      if (error || !scheduled || scheduled.length === 0) return;

      for (const notification of scheduled) {
        // Send notification through appropriate channels
        await this.sendNotification(notification);

        // Mark as sent
        await this.supabase
          .from('scheduled_notifications')
          .update({ sent: true, sent_at: new Date().toISOString() })
          .eq('id', notification.id);
      }
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
    }
  }

  private async sendNotification(notification: any): Promise<void> {
    // Implementation would depend on your notification channels
    // This is a placeholder for the actual sending logic
    console.log('Sending notification:', notification);
  }
}

export const smartNotificationService = new SmartNotificationService();