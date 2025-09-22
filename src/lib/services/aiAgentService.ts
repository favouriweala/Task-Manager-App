import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { Database, AIAgent, AIAgentAction, InsertAIAgentAction } from '../database/types';
import { aiSimilarityService, ProjectSimilarity } from './aiSimilarityService';
import { notificationService } from './notificationService';

interface MergeSuggestion {
  primaryProjectId: string;
  secondaryProjectId: string;
  similarity: ProjectSimilarity;
  actionPlan: {
    steps: string[];
    estimatedTime: string;
    riskLevel: 'low' | 'medium' | 'high';
    prerequisites: string[];
  };
  benefits: string[];
  challenges: string[];
}

class AIAgentService {
  private genAI: GoogleGenerativeAI;
  private supabase: any; // Temporarily using any to fix typing issues

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is required for AI agent service');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }

  /**
   * Run similarity analysis and generate merge suggestions
   */
  async runSimilarityAnalysis(userId?: string): Promise<{ success: boolean; suggestions: number; error?: string }> {
    try {
      // Get all projects for the user or all projects if no user specified
      let query = this.supabase.from('projects').select('id, name, owner_id');
      
      if (userId) {
        query = query.eq('owner_id', userId);
      }

      const { data: projects, error } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        return { success: false, suggestions: 0, error: error.message };
      }

      if (!projects || projects.length < 2) {
        return { success: true, suggestions: 0 };
      }

      let suggestionsCreated = 0;

      // Analyze all project pairs
      for (let i = 0; i < projects.length; i++) {
        for (let j = i + 1; j < projects.length; j++) {
          const projectA = projects[i];
          const projectB = projects[j];

          // Skip if projects have different owners (unless running system-wide analysis)
          if (userId && projectA?.owner_id !== projectB?.owner_id) {
            continue;
          }

          // Check if we already have a recent analysis
          const existingAnalysis = await this.getExistingSimilarityAnalysis(
            projectA?.id || '', 
            projectB?.id || ''
          );

          if (existingAnalysis) {
            continue; // Skip if analyzed recently
          }

          // Perform similarity analysis
          const similarityResult = await aiSimilarityService.analyzeProjectSimilarity(
            projectA?.id || '',
            projectB?.id || ''
          );

          if (similarityResult.success && similarityResult.similarity) {
            const similarity = similarityResult.similarity;

            // Create merge suggestion if similarity is high enough
            if (similarity.similarityScore > 0.7 && similarity.mergeRecommendation.recommended) {
              await this.createMergeSuggestion(
                projectA?.owner_id || '',
                similarity,
                projectA?.name || '',
                projectB?.name || ''
              );
              suggestionsCreated++;
            }
          }
        }
      }

      return { success: true, suggestions: suggestionsCreated };
    } catch (error) {
      console.error('Error running similarity analysis:', error);
      return { success: false, suggestions: 0, error: 'Failed to run similarity analysis' };
    }
  }

  /**
   * Create a merge suggestion and notify the user
   */
  async createMergeSuggestion(
    userId: string,
    similarity: ProjectSimilarity,
    primaryProjectName: string,
    secondaryProjectName: string
  ): Promise<{ success: boolean; actionId?: string; error?: string }> {
    try {
      // Get the similarity analyzer agent
      const { data: agent } = await this.supabase
        .from('ai_agents')
        .select('id')
        .eq('type', 'similarity_analyzer')
        .single();

      if (!agent) {
        return { success: false, error: 'Similarity analyzer agent not found' };
      }

      // Create detailed action plan
      const actionPlan = await this.generateMergeActionPlan(similarity);

      // Create AI agent action
      const suggestion: MergeSuggestion = {
        primaryProjectId: similarity.projectAId,
        secondaryProjectId: similarity.projectBId,
        similarity,
        actionPlan,
        benefits: similarity.mergeRecommendation.benefits,
        challenges: similarity.mergeRecommendation.challenges,
      };

      const { data: action, error: actionError } = await this.supabase
        .from('ai_agent_actions')
        .insert({
          agent_id: agent.id,
          user_id: userId,
          action_type: 'merge_suggestion',
          target_type: 'project',
          target_id: similarity.projectAId,
          suggestion: suggestion as any, // Temporarily using any to fix typing
          confidence: similarity.mergeRecommendation.confidence,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })
        .select()
        .single();

      if (actionError) {
        console.error('Error creating AI agent action:', actionError);
        return { success: false, error: actionError.message };
      }

      // Send notification to user
      await notificationService.createNotification({
        userId,
        type: 'ai_merge_recommendation',
        title: 'AI Suggestion: Merge Similar Projects',
        message: `Our AI has identified that "${primaryProjectName}" and "${secondaryProjectName}" are ${(similarity.similarityScore * 100).toFixed(0)}% similar and could be merged for better organization.`,
        metadata: {
          primaryProject: primaryProjectName,
          secondaryProject: secondaryProjectName,
          similarityScore: similarity.similarityScore,
          actionId: action.id,
        },
        priority: 'normal',
        actionUrl: `/projects/${similarity.projectAId}/merge-suggestion/${action.id}`,
      });

      return { success: true, actionId: action.id };
    } catch (error) {
      console.error('Error creating merge suggestion:', error);
      return { success: false, error: 'Failed to create merge suggestion' };
    }
  }

  /**
   * Accept a merge suggestion and execute the merge
   */
  async acceptMergeSuggestion(
    actionId: string,
    userId: string,
    userFeedback?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the action
      const { data: action, error: actionError } = await this.supabase
        .from('ai_agent_actions')
        .select('*')
        .eq('id', actionId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single();

      if (actionError || !action) {
        return { success: false, error: 'Action not found or already processed' };
      }

      const suggestion = action.suggestion as MergeSuggestion;

      // Execute the merge
      const mergeResult = await this.executeMerge(
        suggestion.primaryProjectId,
        suggestion.secondaryProjectId,
        userId
      );

      if (!mergeResult.success) {
        return { success: false, error: mergeResult.error };
      }

      // Update action status
      await this.supabase
        .from('ai_agent_actions')
        .update({
          status: 'accepted',
          user_feedback: userFeedback,
          applied_at: new Date().toISOString(),
        })
        .eq('id', actionId);

      // Update agent learning data
      await this.updateAgentLearning(action.agent_id, 'merge_accepted', {
        similarity: suggestion.similarity.similarityScore,
        confidence: action.confidence,
        userFeedback,
      });

      // Send confirmation notification
      await notificationService.createNotification({
        userId,
        type: 'ai_suggestion',
        title: 'Projects Successfully Merged',
        message: 'Your projects have been merged successfully based on AI recommendation.',
        priority: 'normal',
      });

      return { success: true };
    } catch (error) {
      console.error('Error accepting merge suggestion:', error);
      return { success: false, error: 'Failed to accept merge suggestion' };
    }
  }

  /**
   * Reject a merge suggestion
   */
  async rejectMergeSuggestion(
    actionId: string,
    userId: string,
    userFeedback?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the action
      const { data: action, error: actionError } = await this.supabase
        .from('ai_agent_actions')
        .select('*')
        .eq('id', actionId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single();

      if (actionError || !action) {
        return { success: false, error: 'Action not found or already processed' };
      }

      // Update action status
      await this.supabase
        .from('ai_agent_actions')
        .update({
          status: 'rejected',
          user_feedback: userFeedback,
        })
        .eq('id', actionId);

      // Update agent learning data
      await this.updateAgentLearning(action.agent_id, 'merge_rejected', {
        similarity: (action.suggestion as MergeSuggestion).similarity.similarityScore,
        confidence: action.confidence,
        userFeedback,
      });

      return { success: true };
    } catch (error) {
      console.error('Error rejecting merge suggestion:', error);
      return { success: false, error: 'Failed to reject merge suggestion' };
    }
  }

  /**
   * Get AI agent actions for a user
   */
  async getUserAIActions(
    userId: string,
    options: {
      status?: 'pending' | 'accepted' | 'rejected' | 'expired';
      actionType?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ success: boolean; actions?: AIAgentAction[]; error?: string }> {
    try {
      let query = this.supabase
        .from('ai_agent_actions')
        .select(`
          *,
          ai_agents (
            name,
            type,
            description
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.actionType) {
        query = query.eq('action_type', options.actionType);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching AI actions:', error);
        return { success: false, error: error.message };
      }

      return { success: true, actions: data || [] };
    } catch (error) {
      console.error('Error in getUserAIActions:', error);
      return { success: false, error: 'Failed to fetch AI actions' };
    }
  }

  /**
   * Get AI agent performance metrics
   */
  async getAgentMetrics(agentId?: string): Promise<{ success: boolean; metrics?: any; error?: string }> {
    try {
      let query = this.supabase
        .from('ai_agent_actions')
        .select('agent_id, status, confidence, created_at');

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data: actions, error } = await query;

      if (error) {
        console.error('Error fetching agent metrics:', error);
        return { success: false, error: error.message };
      }

      // Calculate metrics
      const metrics = this.calculateAgentMetrics(actions || []);

      return { success: true, metrics };
    } catch (error) {
      console.error('Error in getAgentMetrics:', error);
      return { success: false, error: 'Failed to get agent metrics' };
    }
  }

  /**
   * Execute project merge
   */
  private async executeMerge(
    primaryProjectId: string,
    secondaryProjectId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get both projects
      const { data: projects, error: projectsError } = await this.supabase
        .from('projects')
        .select('*')
        .in('id', [primaryProjectId, secondaryProjectId])
        .eq('owner_id', userId);

      if (projectsError || !projects || projects.length !== 2) {
        return { success: false, error: 'Projects not found or access denied' };
      }

            const primaryProject = projects.find((p: any) => p.id === primaryProjectId);
      const secondaryProject = projects.find((p: any) => p.id === secondaryProjectId);

      if (!primaryProject || !secondaryProject) {
        return { success: false, error: 'Invalid project configuration' };
      }

      // Move all tasks from secondary to primary project
      const { error: tasksError } = await this.supabase
        .from('tasks')
        .update({ project_id: primaryProjectId })
        .eq('project_id', secondaryProjectId);

      if (tasksError) {
        console.error('Error moving tasks:', tasksError);
        return { success: false, error: 'Failed to move tasks' };
      }

      // Move all comments
      const { error: commentsError } = await this.supabase
        .from('task_comments')
        .update({ 
          content: `[Merged from ${secondaryProject.name}] ${this.supabase.from('task_comments').select('content')}`
        })
        .in('task_id', this.supabase.from('tasks').select('id').eq('project_id', secondaryProjectId));

      // Update primary project description to include secondary project info
      const mergedDescription = `${primaryProject.description || ''}\n\n[Merged with: ${secondaryProject.name}]\n${secondaryProject.description || ''}`.trim();

      const { error: updateError } = await this.supabase
        .from('projects')
        .update({
          description: mergedDescription,
          updated_at: new Date().toISOString(),
        })
        .eq('id', primaryProjectId);

      if (updateError) {
        console.error('Error updating primary project:', updateError);
        return { success: false, error: 'Failed to update primary project' };
      }

      // Archive the secondary project instead of deleting
      const { error: archiveError } = await this.supabase
        .from('projects')
        .update({
          status: 'archived',
          name: `[MERGED] ${secondaryProject.name}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', secondaryProjectId);

      if (archiveError) {
        console.error('Error archiving secondary project:', archiveError);
        return { success: false, error: 'Failed to archive secondary project' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error executing merge:', error);
      return { success: false, error: 'Failed to execute merge' };
    }
  }

  /**
   * Generate detailed merge action plan
   */
  private async generateMergeActionPlan(similarity: ProjectSimilarity): Promise<any> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Create a detailed action plan for merging two similar projects with ${(similarity.similarityScore * 100).toFixed(1)}% similarity.

Similarity factors:
- Name similarity: ${(similarity.similarityFactors.namesimilarity * 100).toFixed(1)}%
- Description similarity: ${(similarity.similarityFactors.descriptionSimilarity * 100).toFixed(1)}%
- Task overlap: ${(similarity.similarityFactors.taskOverlap * 100).toFixed(1)}%

Provide a JSON response with:
{
  "steps": ["step1", "step2", ...],
  "estimatedTime": "time estimate",
  "riskLevel": "low|medium|high",
  "prerequisites": ["prerequisite1", "prerequisite2", ...]
}
      `;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      try {
        return JSON.parse(response);
      } catch {
        // Fallback action plan
        return {
          steps: [
            'Review both projects for conflicts',
            'Backup project data',
            'Merge tasks into primary project',
            'Update project description',
            'Archive secondary project',
            'Notify team members'
          ],
          estimatedTime: '15-30 minutes',
          riskLevel: similarity.similarityScore > 0.8 ? 'low' : 'medium',
          prerequisites: [
            'Project owner permissions',
            'No active tasks in progress',
            'Team member notification'
          ]
        };
      }
    } catch (error) {
      console.error('Error generating action plan:', error);
      return {
        steps: ['Manual review required'],
        estimatedTime: 'Unknown',
        riskLevel: 'high',
        prerequisites: ['Manual analysis']
      };
    }
  }

  /**
   * Check for existing similarity analysis
   */
  private async getExistingSimilarityAnalysis(
    projectAId: string,
    projectBId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('project_similarities')
        .select('analyzed_at')
        .or(`and(project_a_id.eq.${projectAId},project_b_id.eq.${projectBId}),and(project_a_id.eq.${projectBId},project_b_id.eq.${projectAId})`)
        .gte('analyzed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Within last 24 hours
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update agent learning data
   */
  private async updateAgentLearning(
    agentId: string,
    event: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      const { data: agent, error } = await this.supabase
        .from('ai_agents')
        .select('learning_data, performance_metrics')
        .eq('id', agentId)
        .single();

      if (error || !agent) return;

      const learningData = agent.learning_data || {};
      const performanceMetrics = agent.performance_metrics || {};

      // Update learning data
      if (!learningData[event]) {
        learningData[event] = [];
      }
      learningData[event].push({
        ...data,
        timestamp: new Date().toISOString(),
      });

      // Keep only last 100 entries per event
      if (learningData[event].length > 100) {
        learningData[event] = learningData[event].slice(-100);
      }

      // Update performance metrics
      if (event === 'merge_accepted') {
        performanceMetrics.acceptanceRate = (performanceMetrics.acceptanceRate || 0) + 1;
      } else if (event === 'merge_rejected') {
        performanceMetrics.rejectionRate = (performanceMetrics.rejectionRate || 0) + 1;
      }

      await this.supabase
        .from('ai_agents')
        .update({
          learning_data: learningData,
          performance_metrics: performanceMetrics,
          updated_at: new Date().toISOString(),
        })
        .eq('id', agentId);
    } catch (error) {
      console.error('Error updating agent learning:', error);
    }
  }

  /**
   * Calculate agent performance metrics
   */
  private calculateAgentMetrics(actions: any[]): any {
    const total = actions.length;
    const accepted = actions.filter(a => a.status === 'accepted').length;
    const rejected = actions.filter(a => a.status === 'rejected').length;
    const pending = actions.filter(a => a.status === 'pending').length;
    const expired = actions.filter(a => a.status === 'expired').length;

    const avgConfidence = total > 0 
      ? actions.reduce((sum, a) => sum + (a.confidence || 0), 0) / total 
      : 0;

    return {
      totalActions: total,
      acceptanceRate: total > 0 ? accepted / total : 0,
      rejectionRate: total > 0 ? rejected / total : 0,
      pendingActions: pending,
      expiredActions: expired,
      averageConfidence: avgConfidence,
      lastActivity: total > 0 ? actions[0].created_at : null,
    };
  }
}

export const aiAgentService = new AIAgentService();
export type { AIAgent, AIAgentAction, MergeSuggestion };