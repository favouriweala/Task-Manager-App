import { createClient } from '@supabase/supabase-js';
import { geminiClient } from './gemini-client';

export interface UserBehaviorEvent {
  id?: string;
  userId: string;
  eventType: 'task_created' | 'task_completed' | 'task_updated' | 'project_viewed' | 'search_performed' | 'filter_applied' | 'notification_clicked' | 'feature_used';
  entityId?: string; // task_id, project_id, etc.
  entityType?: 'task' | 'project' | 'user' | 'notification';
  metadata: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    screenSize: string;
  };
}

export interface BehaviorPattern {
  id: string;
  userId: string;
  patternType: 'productivity_peak' | 'task_preference' | 'workflow_habit' | 'collaboration_style' | 'notification_response';
  pattern: {
    description: string;
    frequency: number;
    confidence: number;
    triggers: string[];
    outcomes: string[];
  };
  insights: string[];
  recommendations: string[];
  discoveredAt: Date;
  lastUpdated: Date;
  isActive: boolean;
}

export interface PersonalizedRecommendation {
  id: string;
  userId: string;
  type: 'task_optimization' | 'workflow_improvement' | 'productivity_boost' | 'collaboration_enhancement' | 'time_management';
  title: string;
  description: string;
  actionItems: {
    action: string;
    priority: 'low' | 'medium' | 'high';
    estimatedImpact: number; // 1-10 scale
  }[];
  reasoning: string;
  confidence: number;
  category: string;
  tags: string[];
  createdAt: Date;
  expiresAt?: Date;
  isImplemented: boolean;
  feedback?: {
    helpful: boolean;
    implemented: boolean;
    notes?: string;
  };
}

export interface LearningInsights {
  userId: string;
  productivityScore: number;
  workingPatterns: {
    peakHours: number[];
    preferredTaskTypes: string[];
    averageSessionLength: number;
    breakPatterns: string[];
  };
  collaborationStyle: {
    communicationFrequency: 'high' | 'medium' | 'low';
    preferredMeetingTimes: string[];
    teamInteractionScore: number;
    leadershipTendency: number;
  };
  taskManagementStyle: {
    planningHorizon: 'short' | 'medium' | 'long';
    prioritizationMethod: string;
    completionRate: number;
    procrastinationTendency: number;
  };
  learningPreferences: {
    feedbackReceptivity: number;
    adaptabilityScore: number;
    preferredLearningMethods: string[];
  };
  generatedAt: Date;
}

class LearningSystemService {
  private readonly BATCH_SIZE = 100;
  private readonly PATTERN_CONFIDENCE_THRESHOLD = 0.7;
  private readonly RECOMMENDATION_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async trackBehaviorEvent(event: Omit<UserBehaviorEvent, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_behavior_events')
        .insert({
          user_id: event.userId,
          event_type: event.eventType,
          entity_id: event.entityId,
          entity_type: event.entityType,
          metadata: event.metadata,
          session_id: event.sessionId,
          device_info: event.deviceInfo,
          timestamp: new Date().toISOString()
        });

      if (!error) {
        // Trigger pattern analysis if we have enough new events
        this.schedulePatternAnalysis(event.userId);
      }

      return !error;
    } catch (error) {
      console.error('Error tracking behavior event:', error);
      return false;
    }
  }

  async analyzeBehaviorPatterns(userId: string): Promise<BehaviorPattern[]> {
    try {
      // Get recent behavior events
      const { data: events, error } = await this.supabase
        .from('user_behavior_events')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error || !events) return [];

            // Use AI to analyze patterns
      const aiAnalysis = await geminiClient.analyzeWorkflowPatterns(
        events.map((event: any) => ({
          action: event.action,
          timestamp: event.timestamp.toISOString(),
          context: event.context
        }))
      );
// ... existing code ...

      const patterns: BehaviorPattern[] = [];

      // Process AI-identified patterns
      for (const pattern of aiAnalysis) {
        if (pattern.confidence >= this.PATTERN_CONFIDENCE_THRESHOLD) {
          const behaviorPattern: BehaviorPattern = {
            id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            patternType: pattern.pattern as any, // Temporarily using any to fix typing
            pattern: {
              description: pattern.pattern,
              frequency: pattern.frequency,
              confidence: pattern.confidence,
              triggers: [],
              outcomes: []
            },
            insights: [pattern.suggested_rule],
            recommendations: [pattern.suggested_rule],
            discoveredAt: new Date(),
            lastUpdated: new Date(),
            isActive: true
          };

          patterns.push(behaviorPattern);

          // Save to database
          await this.saveBehaviorPattern(behaviorPattern);
        }
      }

      return patterns;
    } catch (error) {
      console.error('Error analyzing behavior patterns:', error);
      return [];
    }
  }

  async generatePersonalizedRecommendations(userId: string): Promise<PersonalizedRecommendation[]> {
    try {
      // Get user's behavior patterns
      const patterns = await this.getUserBehaviorPatterns(userId);
      
      // Get user's task and project data
      const { data: userData } = await this.supabase
        .from('user_profiles')
        .select(`
          *,
          tasks:tasks(count),
          projects:project_members(count)
        `)
        .eq('id', userId)
        .single();

      // Get recent performance metrics
      const performanceMetrics = await this.calculatePerformanceMetrics(userId);

      // Use AI to generate personalized recommendations
      const aiRecommendations = await geminiClient.generatePersonalizedRecommendations({
        id: userId,
        workPatterns: [],
        preferences: {},
        recentTasks: []
      });

      const recommendations: PersonalizedRecommendation[] = [];

      for (const rec of aiRecommendations) {
        const recommendation: PersonalizedRecommendation = {
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          type: rec.type as any, // Temporarily using any to fix typing
          title: rec.title,
          description: rec.description,
          actionItems: (rec as any).actionItems || [],
          reasoning: (rec as any).reasoning || '',
          confidence: rec.confidence,
          category: (rec as any).category || 'general',
          tags: (rec as any).tags || [],
          createdAt: new Date(),
          expiresAt: (rec as any).expiresAt ? new Date((rec as any).expiresAt) : undefined,
          isImplemented: false
        };

        recommendations.push(recommendation);

        // Save to database
        await this.saveRecommendation(recommendation);
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return [];
    }
  }

  async generateLearningInsights(userId: string): Promise<LearningInsights | null> {
    try {
      // Get comprehensive user data
      const [events, tasks, projects, patterns] = await Promise.all([
        this.getUserBehaviorEvents(userId, 90), // Last 90 days
        this.getUserTasks(userId),
        this.getUserProjects(userId),
        this.getUserBehaviorPatterns(userId)
      ]);

      // Use AI to generate comprehensive insights
      const aiInsights = await geminiClient.generatePersonalizedRecommendations({
        id: userId,
        workPatterns: [],
        preferences: {},
        recentTasks: []
      });

      const insights: LearningInsights = {
        userId,
        productivityScore: this.calculateProductivityScore(events, tasks),
        workingPatterns: {
          peakHours: this.identifyPeakHours(events),
          preferredTaskTypes: this.identifyPreferredTaskTypes(tasks),
          averageSessionLength: this.calculateAverageSessionLength(events),
          breakPatterns: this.identifyBreakPatterns(events)
        },
        collaborationStyle: {
          communicationFrequency: this.assessCommunicationFrequency(events),
          preferredMeetingTimes: this.identifyPreferredMeetingTimes(events),
          teamInteractionScore: this.calculateTeamInteractionScore(events),
          leadershipTendency: this.assessLeadershipTendency(events, projects)
        },
        taskManagementStyle: {
          planningHorizon: this.assessPlanningHorizon(tasks),
          prioritizationMethod: this.identifyPrioritizationMethod(tasks),
          completionRate: this.calculateCompletionRate(tasks),
          procrastinationTendency: this.assessProcrastinationTendency(tasks)
        },
        learningPreferences: {
          feedbackReceptivity: this.assessFeedbackReceptivity(events),
          adaptabilityScore: this.calculateAdaptabilityScore(patterns),
          preferredLearningMethods: this.identifyPreferredLearningMethods(events)
        },
        generatedAt: new Date()
      };

      // Save insights to database
      await this.saveLearningInsights(insights);

      return insights;
    } catch (error) {
      console.error('Error generating learning insights:', error);
      return null;
    }
  }

  async provideFeedbackOnRecommendation(
    recommendationId: string, 
    feedback: PersonalizedRecommendation['feedback']
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('personalized_recommendations')
        .update({ 
          feedback,
          is_implemented: feedback?.implemented || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', recommendationId);

      if (!error && feedback?.implemented) {
        // Track implementation for learning
        await this.trackBehaviorEvent({
          userId: '', // Will be retrieved from recommendation
          eventType: 'feature_used',
          entityId: recommendationId,
          entityType: 'notification',
          metadata: { action: 'recommendation_implemented', feedback }
        });
      }

      return !error;
    } catch (error) {
      console.error('Error providing feedback:', error);
      return false;
    }
  }

  async getActiveRecommendations(userId: string): Promise<PersonalizedRecommendation[]> {
    try {
      const { data, error } = await this.supabase
        .from('personalized_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_implemented', false)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('confidence', { ascending: false })
        .limit(10);

      if (error || !data) return [];

            return data.map((rec: any) => ({
        id: rec.id,
        userId: rec.user_id,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        actionItems: rec.action_items,
        reasoning: rec.reasoning,
        confidence: rec.confidence,
        category: rec.category,
        tags: rec.tags,
        createdAt: new Date(rec.created_at),
        expiresAt: rec.expires_at ? new Date(rec.expires_at) : undefined,
        isImplemented: rec.is_implemented,
        feedback: rec.feedback
      }));
    } catch (error) {
      console.error('Error getting active recommendations:', error);
      return [];
    }
  }

  private async schedulePatternAnalysis(userId: string): Promise<void> {
    // In a real implementation, this would queue a background job
    // For now, we'll just trigger analysis after a delay
    setTimeout(() => {
      this.analyzeBehaviorPatterns(userId);
    }, 5000);
  }

  private async saveBehaviorPattern(pattern: BehaviorPattern): Promise<void> {
    try {
      await this.supabase
        .from('behavior_patterns')
        .upsert({
          id: pattern.id,
          user_id: pattern.userId,
          pattern_type: pattern.patternType,
          pattern: pattern.pattern,
          insights: pattern.insights,
          recommendations: pattern.recommendations,
          discovered_at: pattern.discoveredAt.toISOString(),
          last_updated: pattern.lastUpdated.toISOString(),
          is_active: pattern.isActive
        });
    } catch (error) {
      console.error('Error saving behavior pattern:', error);
    }
  }

  private async saveRecommendation(recommendation: PersonalizedRecommendation): Promise<void> {
    try {
      await this.supabase
        .from('personalized_recommendations')
        .insert({
          id: recommendation.id,
          user_id: recommendation.userId,
          type: recommendation.type,
          title: recommendation.title,
          description: recommendation.description,
          action_items: recommendation.actionItems,
          reasoning: recommendation.reasoning,
          confidence: recommendation.confidence,
          category: recommendation.category,
          tags: recommendation.tags,
          expires_at: recommendation.expiresAt?.toISOString(),
          is_implemented: recommendation.isImplemented
        });
    } catch (error) {
      console.error('Error saving recommendation:', error);
    }
  }

  private async saveLearningInsights(insights: LearningInsights): Promise<void> {
    try {
      await this.supabase
        .from('learning_insights')
        .upsert({
          user_id: insights.userId,
          productivity_score: insights.productivityScore,
          working_patterns: insights.workingPatterns,
          collaboration_style: insights.collaborationStyle,
          task_management_style: insights.taskManagementStyle,
          learning_preferences: insights.learningPreferences,
          generated_at: insights.generatedAt.toISOString()
        });
    } catch (error) {
      console.error('Error saving learning insights:', error);
    }
  }

  private async getUserBehaviorPatterns(userId: string): Promise<BehaviorPattern[]> {
    try {
      const { data, error } = await this.supabase
        .from('behavior_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error || !data) return [];

            return data.map((pattern: any) => ({
        id: pattern.id,
        userId: pattern.user_id,
        patternType: pattern.pattern_type,
        pattern: pattern.pattern,
        insights: pattern.insights,
        recommendations: pattern.recommendations,
        discoveredAt: new Date(pattern.discovered_at),
        lastUpdated: new Date(pattern.last_updated),
        isActive: pattern.is_active
      }));
    } catch (error) {
      console.error('Error getting behavior patterns:', error);
      return [];
    }
  }

  private async getUserBehaviorEvents(userId: string, days: number): Promise<UserBehaviorEvent[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const { data, error } = await this.supabase
        .from('user_behavior_events')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error || !data) return [];

            return data.map((event: any) => ({
        id: event.id,
        userId: event.user_id,
        eventType: event.event_type,
        entityId: event.entity_id,
        entityType: event.entity_type,
        metadata: event.metadata,
        timestamp: new Date(event.timestamp),
        sessionId: event.session_id,
        deviceInfo: event.device_info
      }));
    } catch (error) {
      console.error('Error getting behavior events:', error);
      return [];
    }
  }

  private async getUserTasks(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', userId)
        .order('created_at', { ascending: false })
        .limit(500);

      return data || [];
    } catch (error) {
      console.error('Error getting user tasks:', error);
      return [];
    }
  }

  private async getUserProjects(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('project_members')
        .select(`
          *,
          projects:project_id (*)
        `)
        .eq('user_id', userId);

      return data || [];
    } catch (error) {
      console.error('Error getting user projects:', error);
      return [];
    }
  }

  private async calculatePerformanceMetrics(userId: string): Promise<any> {
    // Implementation for calculating various performance metrics
    return {
      taskCompletionRate: 0.85,
      averageTaskDuration: 2.5,
      productivityTrend: 'increasing',
      collaborationScore: 0.75
    };
  }

  // Helper methods for calculating specific insights
  private calculateProductivityScore(events: UserBehaviorEvent[], tasks: any[]): number {
    // Implementation for productivity score calculation
    return Math.random() * 100; // Placeholder
  }

  private identifyPeakHours(events: UserBehaviorEvent[]): number[] {
    const hourCounts = new Array(24).fill(0);
    events.forEach(event => {
      const hour = event.timestamp.getHours();
      hourCounts[hour]++;
    });

    const maxCount = Math.max(...hourCounts);
    const threshold = maxCount * 0.8;

    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count >= threshold)
      .map(({ hour }) => hour);
  }

  private identifyPreferredTaskTypes(tasks: any[]): string[] {
    const typeCounts: Record<string, number> = {};
    tasks.forEach(task => {
      const type = task.type || 'general';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  }

  private calculateAverageSessionLength(events: UserBehaviorEvent[]): number {
    // Implementation for session length calculation
    return 45; // minutes, placeholder
  }

  private identifyBreakPatterns(events: UserBehaviorEvent[]): string[] {
    // Implementation for break pattern identification
    return ['mid-morning', 'lunch', 'mid-afternoon']; // Placeholder
  }

  private assessCommunicationFrequency(events: UserBehaviorEvent[]): 'high' | 'medium' | 'low' {
    // Implementation for communication frequency assessment
    return 'medium'; // Placeholder
  }

  private identifyPreferredMeetingTimes(events: UserBehaviorEvent[]): string[] {
    // Implementation for meeting time preference identification
    return ['10:00', '14:00']; // Placeholder
  }

  private calculateTeamInteractionScore(events: UserBehaviorEvent[]): number {
    // Implementation for team interaction score calculation
    return 0.75; // Placeholder
  }

  private assessLeadershipTendency(events: UserBehaviorEvent[], projects: any[]): number {
    // Implementation for leadership tendency assessment
    return 0.6; // Placeholder
  }

  private assessPlanningHorizon(tasks: any[]): 'short' | 'medium' | 'long' {
    // Implementation for planning horizon assessment
    return 'medium'; // Placeholder
  }

  private identifyPrioritizationMethod(tasks: any[]): string {
    // Implementation for prioritization method identification
    return 'deadline-based'; // Placeholder
  }

  private calculateCompletionRate(tasks: any[]): number {
    const completed = tasks.filter(t => t.status === 'completed').length;
    return tasks.length > 0 ? completed / tasks.length : 0;
  }

  private assessProcrastinationTendency(tasks: any[]): number {
    // Implementation for procrastination tendency assessment
    return 0.3; // Placeholder
  }

  private assessFeedbackReceptivity(events: UserBehaviorEvent[]): number {
    // Implementation for feedback receptivity assessment
    return 0.8; // Placeholder
  }

  private calculateAdaptabilityScore(patterns: BehaviorPattern[]): number {
    // Implementation for adaptability score calculation
    return 0.7; // Placeholder
  }

  private identifyPreferredLearningMethods(events: UserBehaviorEvent[]): string[] {
    // Implementation for learning method preference identification
    return ['visual', 'hands-on']; // Placeholder
  }
}

export const learningSystemService = new LearningSystemService();