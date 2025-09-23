'use client';

import { createClient } from '@supabase/supabase-js';
import { geminiClient } from './gemini-client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface WorkflowPattern {
  id: string;
  userId: string;
  patternType: 'task_creation' | 'priority_assignment' | 'status_update' | 'project_management' | 'time_tracking';
  pattern: string;
  frequency: number;
  confidence: number;
  automationPotential: number;
  suggestedRule: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  createdAt: string;
  lastSeen: string;
  status: 'active' | 'inactive' | 'applied';
}

export interface AutomationRule {
  id: string;
  userId: string;
  name: string;
  description: string;
  triggerConditions: Record<string, any>;
  actions: Record<string, any>;
  confidence: number;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
  successRate: number;
}

export interface TaskRoutingRule {
  id: string;
  userId: string;
  name: string;
  conditions: {
    keywords?: string[];
    priority?: string;
    dueDate?: string;
    projectType?: string;
    taskType?: string;
    complexity?: 'low' | 'medium' | 'high';
  };
  routing: {
    assignTo?: string;
    priority?: string;
    labels?: string[];
    estimatedHours?: number;
    suggestedDueDate?: string;
  };
  confidence: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

class PatternRecognitionService {
  private patterns: Map<string, WorkflowPattern> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  private taskRoutingRules: Map<string, TaskRoutingRule> = new Map();

  constructor() {
    this.loadExistingPatterns();
  }

  /**
   * Load existing patterns from database
   */
  private async loadExistingPatterns() {
    try {
      const { data: patterns, error } = await supabase
        .from('workflow_patterns')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      patterns?.forEach(pattern => {
        this.patterns.set(pattern.id, pattern);
      });

      console.log(`Loaded ${patterns?.length || 0} workflow patterns`);
    } catch (error) {
      console.error('Error loading patterns:', error);
    }
  }

  /**
   * Analyze user behavior events to identify patterns
   */
  async analyzeUserBehaviorPatterns(userId: string, timeRange: number = 30) {
    try {
      // Get user behavior events from the last timeRange days
      const { data: events, error } = await supabase
        .from('user_behavior_events')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (!events || events.length < 10) {
        return { patterns: [], message: 'Insufficient data for pattern analysis' };
      }

      // Group events by type and analyze patterns
      const eventGroups = this.groupEventsByType(events);
      const detectedPatterns: WorkflowPattern[] = [];

      for (const [eventType, eventList] of eventGroups.entries()) {
        const patterns = await this.detectPatternsInEventGroup(userId, eventType, eventList);
        detectedPatterns.push(...patterns);
      }

      // Use AI to enhance pattern detection
      const aiPatterns = await geminiClient.analyzeWorkflowPatterns(
        events.map(event => ({
          action: event.event_type,
          timestamp: event.timestamp,
          context: event.event_data
        }))
      );

      // Merge AI patterns with detected patterns
      const enhancedPatterns = await this.mergeAIPatterns(detectedPatterns, aiPatterns, userId);

      // Store patterns in database
      for (const pattern of enhancedPatterns) {
        await this.storePattern(pattern);
      }

      return { 
        patterns: enhancedPatterns, 
        automationOpportunities: enhancedPatterns.filter(p => p.automationPotential > 0.7).length 
      };
    } catch (error) {
      console.error('Error analyzing behavior patterns:', error);
      throw error;
    }
  }

  /**
   * Create automation rules based on detected patterns
   */
  async createAutomationRules(userId: string, patterns: WorkflowPattern[]) {
    const createdRules: AutomationRule[] = [];

    for (const pattern of patterns) {
      if (pattern.automationPotential > 0.7 && pattern.confidence > 0.6) {
        const rule = await this.createAutomationRule(userId, pattern);
        if (rule) {
          createdRules.push(rule);
        }
      }
    }

    return createdRules;
  }

  /**
   * Create task routing rules based on patterns
   */
  async createTaskRoutingRules(userId: string) {
    try {
      // Analyze task creation and assignment patterns
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (name, description)
        `)
        .eq('created_by', userId)
        .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (!tasks || tasks.length < 10) {
        return { rules: [], message: 'Insufficient task data for routing analysis' };
      }

      // Analyze task patterns for routing
      const routingRules = await this.analyzeTaskRoutingPatterns(userId, tasks);

      // Store routing rules
      for (const rule of routingRules) {
        await this.storeTaskRoutingRule(rule);
      }

      return { rules: routingRules };
    } catch (error) {
      console.error('Error creating task routing rules:', error);
      throw error;
    }
  }

  /**
   * Apply automation rules to new tasks/events
   */
  async applyAutomationRules(userId: string, eventType: string, eventData: Record<string, any>) {
    try {
      const applicableRules = Array.from(this.automationRules.values())
        .filter(rule => 
          rule.userId === userId && 
          rule.status === 'active' &&
          this.matchesRuleConditions(rule, eventType, eventData)
        );

      const appliedActions: Array<{ ruleId: string; actions: Record<string, any> }> = [];

      for (const rule of applicableRules) {
        try {
          const actions = await this.executeRuleActions(rule, eventData);
          appliedActions.push({ ruleId: rule.id, actions });

          // Update rule statistics
          await this.updateRuleStatistics(rule.id, true);
        } catch (error) {
          console.error(`Error applying rule ${rule.id}:`, error);
          await this.updateRuleStatistics(rule.id, false);
        }
      }

      return appliedActions;
    } catch (error) {
      console.error('Error applying automation rules:', error);
      throw error;
    }
  }

  /**
   * Route new tasks based on routing rules
   */
  async routeNewTask(userId: string, taskData: {
    title: string;
    description: string;
    projectId?: string;
    priority?: string;
  }) {
    try {
      const applicableRules = Array.from(this.taskRoutingRules.values())
        .filter(rule => 
          rule.userId === userId && 
          rule.status === 'active' &&
          this.matchesTaskRoutingConditions(rule, taskData)
        )
        .sort((a, b) => b.confidence - a.confidence);

      if (applicableRules.length === 0) {
        return { routed: false, suggestions: [] };
      }

      const bestRule = applicableRules[0];
      const suggestions = {
        assignTo: bestRule.routing.assignTo,
        priority: bestRule.routing.priority || taskData.priority,
        labels: bestRule.routing.labels || [],
        estimatedHours: bestRule.routing.estimatedHours,
        suggestedDueDate: bestRule.routing.suggestedDueDate,
        confidence: bestRule.confidence,
        ruleName: bestRule.name
      };

      return { routed: true, suggestions, appliedRule: bestRule };
    } catch (error) {
      console.error('Error routing task:', error);
      throw error;
    }
  }

  /**
   * Get workflow optimization suggestions
   */
  async getWorkflowOptimizations(userId: string) {
    try {
      const patterns = Array.from(this.patterns.values())
        .filter(p => p.userId === userId && p.status === 'active');

      const optimizations = [];

      // Analyze inefficient patterns
      const inefficientPatterns = patterns.filter(p => 
        p.patternType === 'status_update' && p.frequency > 0.3
      );

      if (inefficientPatterns.length > 0) {
        optimizations.push({
          type: 'workflow_efficiency',
          title: 'Reduce Status Update Overhead',
          description: 'You frequently update task statuses. Consider using automation rules or batch updates.',
          impact: 0.7,
          patterns: inefficientPatterns.map(p => p.pattern)
        });
      }

      // Analyze task creation patterns
      const taskCreationPatterns = patterns.filter(p => 
        p.patternType === 'task_creation' && p.frequency > 0.5
      );

      if (taskCreationPatterns.length > 0) {
        optimizations.push({
          type: 'task_templates',
          title: 'Create Task Templates',
          description: 'You create similar tasks frequently. Templates could save time.',
          impact: 0.6,
          patterns: taskCreationPatterns.map(p => p.pattern)
        });
      }

      // Analyze priority assignment patterns
      const priorityPatterns = patterns.filter(p => 
        p.patternType === 'priority_assignment' && p.confidence > 0.8
      );

      if (priorityPatterns.length > 0) {
        optimizations.push({
          type: 'priority_automation',
          title: 'Automate Priority Assignment',
          description: 'Your priority assignments follow predictable patterns. Consider automation.',
          impact: 0.8,
          patterns: priorityPatterns.map(p => p.pattern)
        });
      }

      return optimizations;
    } catch (error) {
      console.error('Error getting workflow optimizations:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private groupEventsByType(events: any[]): Map<string, any[]> {
    const groups = new Map();
    
    events.forEach(event => {
      if (!groups.has(event.event_type)) {
        groups.set(event.event_type, []);
      }
      groups.get(event.event_type).push(event);
    });

    return groups;
  }

  private async detectPatternsInEventGroup(userId: string, eventType: string, events: any[]): Promise<WorkflowPattern[]> {
    const patterns: WorkflowPattern[] = [];

    // Detect time-based patterns
    const timePatterns = this.detectTimePatterns(events);
    
    // Detect sequence patterns
    const sequencePatterns = this.detectSequencePatterns(events);
    
    // Detect context patterns
    const contextPatterns = this.detectContextPatterns(events);

    // Convert to WorkflowPattern objects
    [...timePatterns, ...sequencePatterns, ...contextPatterns].forEach(pattern => {
      if (pattern.frequency > 0.3 && pattern.confidence > 0.5) {
        patterns.push({
          id: crypto.randomUUID(),
          userId,
          patternType: this.mapEventTypeToPatternType(eventType),
          pattern: pattern.description,
          frequency: pattern.frequency,
          confidence: pattern.confidence,
          automationPotential: this.calculateAutomationPotential(pattern),
          suggestedRule: pattern.suggestedRule || '',
          conditions: pattern.conditions || {},
          actions: pattern.actions || {},
          createdAt: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          status: 'active'
        });
      }
    });

    return patterns;
  }

  private detectTimePatterns(events: any[]) {
    // Analyze time-based patterns (e.g., user always creates tasks on Monday mornings)
    const timeGroups = new Map();
    
    events.forEach(event => {
      const date = new Date(event.timestamp);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();
      const key = `${dayOfWeek}-${Math.floor(hour / 4) * 4}`; // 4-hour blocks
      
      if (!timeGroups.has(key)) {
        timeGroups.set(key, 0);
      }
      const currentCount = timeGroups.get(key) || 0;
      timeGroups.set(key, currentCount + 1);
    });

    const patterns = [];
    const totalEvents = events.length;

    for (const [timeKey, count] of Array.from(timeGroups.entries())) {
      const frequency = count / totalEvents;
      if (frequency > 0.3) {
        const [dayOfWeek, hour] = timeKey.split('-').map(Number);
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
        
        patterns.push({
          description: `Frequently performs actions on ${dayName} around ${hour}:00`,
          frequency,
          confidence: Math.min(frequency * 2, 1),
          suggestedRule: `Auto-schedule similar tasks for ${dayName} ${hour}:00`,
          conditions: { dayOfWeek, hour },
          actions: { suggestTime: `${dayOfWeek}-${hour}` }
        });
      }
    }

    return patterns;
  }

  private detectSequencePatterns(events: any[]) {
    // Analyze action sequences (e.g., user always creates task -> assigns priority -> sets due date)
    const sequences = new Map();
    
    for (let i = 0; i < events.length - 1; i++) {
      const current = events[i];
      const next = events[i + 1];
      const timeDiff = new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime();
      
      // Only consider sequences within 10 minutes
      if (timeDiff < 10 * 60 * 1000) {
        const sequenceKey = `${current.event_type}->${next.event_type}`;
        if (!sequences.has(sequenceKey)) {
          sequences.set(sequenceKey, 0);
        }
        sequences.set(sequenceKey, (sequences.get(sequenceKey) || 0) + 1);
      }
    }

    const patterns = [];
    const totalSequences = events.length - 1;

    for (const [sequence, count] of Array.from(sequences.entries())) {
      const frequency = count / totalSequences;
      if (frequency > 0.2) {
        patterns.push({
          description: `Frequently follows sequence: ${sequence.replace('->', ' then ')}`,
          frequency,
          confidence: Math.min(frequency * 3, 1),
          suggestedRule: `Auto-suggest next action in sequence: ${sequence}`,
          conditions: { sequence: sequence.split('->')[0] },
          actions: { suggestNext: sequence.split('->')[1] }
        });
      }
    }

    return patterns;
  }

  private detectContextPatterns(events: any[]) {
    // Analyze context-based patterns (e.g., user always sets high priority for tasks with certain keywords)
    const contextGroups = new Map();
    
    events.forEach(event => {
      if (event.event_data && typeof event.event_data === 'object') {
        Object.keys(event.event_data).forEach(key => {
          const value = event.event_data[key];
          if (typeof value === 'string' || typeof value === 'number') {
            const contextKey = `${key}:${value}`;
            if (!contextGroups.has(contextKey)) {
              contextGroups.set(contextKey, 0);
            }
            contextGroups.set(contextKey, (contextGroups.get(contextKey) || 0) + 1);
          }
        });
      }
    });

    const patterns = [];
    const totalEvents = events.length;

    for (const [context, count] of Array.from(contextGroups.entries())) {
      const frequency = count / totalEvents;
      if (frequency > 0.4) {
        const [key, value] = context.split(':');
        patterns.push({
          description: `Frequently uses ${key} = ${value}`,
          frequency,
          confidence: Math.min(frequency * 2, 1),
          suggestedRule: `Auto-set ${key} to ${value} for similar contexts`,
          conditions: { [key]: value },
          actions: { autoSet: { [key]: value } }
        });
      }
    }

    return patterns;
  }

  private async mergeAIPatterns(detectedPatterns: WorkflowPattern[], aiPatterns: any[], userId: string): Promise<WorkflowPattern[]> {
    const merged = [...detectedPatterns];

    for (const aiPattern of aiPatterns) {
      if (aiPattern.automation_potential > 0.5) {
        merged.push({
          id: crypto.randomUUID(),
          userId,
          patternType: 'task_creation', // Default type, could be enhanced
          pattern: aiPattern.pattern,
          frequency: aiPattern.frequency,
          confidence: aiPattern.confidence,
          automationPotential: aiPattern.automation_potential,
          suggestedRule: aiPattern.suggested_rule,
          conditions: {},
          actions: {},
          createdAt: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          status: 'active'
        });
      }
    }

    return merged;
  }

  private mapEventTypeToPatternType(eventType: string): WorkflowPattern['patternType'] {
    const mapping: Record<string, WorkflowPattern['patternType']> = {
      'task_created': 'task_creation',
      'task_updated': 'status_update',
      'priority_set': 'priority_assignment',
      'project_created': 'project_management',
      'time_logged': 'time_tracking'
    };

    return mapping[eventType] || 'task_creation';
  }

  private calculateAutomationPotential(pattern: any): number {
    // Calculate automation potential based on frequency, confidence, and complexity
    const frequencyScore = Math.min(pattern.frequency * 2, 1);
    const confidenceScore = pattern.confidence;
    const complexityScore = 0.8; // Assume medium complexity for now
    
    return (frequencyScore + confidenceScore + complexityScore) / 3;
  }

  private async createAutomationRule(userId: string, pattern: WorkflowPattern): Promise<AutomationRule | null> {
    try {
      const rule: AutomationRule = {
        id: crypto.randomUUID(),
        userId,
        name: `Auto: ${pattern.pattern}`,
        description: `Automatically apply ${pattern.suggestedRule}`,
        triggerConditions: pattern.conditions,
        actions: pattern.actions,
        confidence: pattern.confidence,
        status: 'active',
        createdAt: new Date().toISOString(),
        triggerCount: 0,
        successRate: 1.0
      };

      const { error } = await supabase
        .from('automation_rules')
        .insert(rule);

      if (error) throw error;

      this.automationRules.set(rule.id, rule);
      return rule;
    } catch (error) {
      console.error('Error creating automation rule:', error);
      return null;
    }
  }

  private async analyzeTaskRoutingPatterns(userId: string, tasks: any[]): Promise<TaskRoutingRule[]> {
    const rules: TaskRoutingRule[] = [];

    // Analyze task assignment patterns
    const assignmentPatterns = new Map();
    
    tasks.forEach(task => {
      if (task.assigned_to) {
        const key = `${task.priority || 'medium'}-${task.assigned_to}`;
        if (!assignmentPatterns.has(key)) {
          assignmentPatterns.set(key, { count: 0, tasks: [] });
        }
        assignmentPatterns.get(key).count++;
        assignmentPatterns.get(key).tasks.push(task);
      }
    });

    // Create routing rules based on patterns
    for (const [pattern, data] of Array.from(assignmentPatterns.entries())) {
      if (data.count >= 3) { // At least 3 occurrences
        const [priority, assignedTo] = pattern.split('-');
        const confidence = Math.min(data.count / tasks.length * 5, 1);

        rules.push({
          id: crypto.randomUUID(),
          userId,
          name: `Auto-assign ${priority} priority tasks`,
          conditions: { priority },
          routing: { assignTo: assignedTo, priority },
          confidence,
          status: 'active',
          createdAt: new Date().toISOString()
        });
      }
    }

    return rules;
  }

  private matchesRuleConditions(rule: AutomationRule, eventType: string, eventData: Record<string, any>): boolean {
    // Simple condition matching - can be enhanced
    for (const [key, value] of Object.entries(rule.triggerConditions)) {
      if (eventData[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private matchesTaskRoutingConditions(rule: TaskRoutingRule, taskData: any): boolean {
    const conditions = rule.conditions;
    
    // Check priority
    if (conditions.priority && taskData.priority !== conditions.priority) {
      return false;
    }

    // Check keywords
    if (conditions.keywords) {
      const text = `${taskData.title} ${taskData.description}`.toLowerCase();
      const hasKeyword = conditions.keywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) {
        return false;
      }
    }

    return true;
  }

  private async executeRuleActions(rule: AutomationRule, eventData: Record<string, any>): Promise<Record<string, any>> {
    // Execute rule actions - placeholder implementation
    const results: Record<string, any> = {};
    
    for (const [action, value] of Object.entries(rule.actions)) {
      switch (action) {
        case 'suggestNext':
          results.suggestion = value;
          break;
        case 'autoSet':
          results.autoSet = value;
          break;
        default:
          results[action] = value;
      }
    }

    return results;
  }

  private async updateRuleStatistics(ruleId: string, success: boolean) {
    const rule = this.automationRules.get(ruleId);
    if (!rule) return;

    rule.triggerCount++;
    rule.successRate = (rule.successRate * (rule.triggerCount - 1) + (success ? 1 : 0)) / rule.triggerCount;
    rule.lastTriggered = new Date().toISOString();

    // Update in database
    await supabase
      .from('automation_rules')
      .update({
        trigger_count: rule.triggerCount,
        success_rate: rule.successRate,
        last_triggered: rule.lastTriggered
      })
      .eq('id', ruleId);
  }

  private async storePattern(pattern: WorkflowPattern) {
    try {
      const { error } = await supabase
        .from('workflow_patterns')
        .upsert(pattern);

      if (error) throw error;

      this.patterns.set(pattern.id, pattern);
    } catch (error) {
      console.error('Error storing pattern:', error);
    }
  }

  private async storeTaskRoutingRule(rule: TaskRoutingRule) {
    try {
      const { error } = await supabase
        .from('task_routing_rules')
        .upsert(rule);

      if (error) throw error;

      this.taskRoutingRules.set(rule.id, rule);
    } catch (error) {
      console.error('Error storing task routing rule:', error);
    }
  }
}

// Singleton instance
export const patternRecognitionService = new PatternRecognitionService();