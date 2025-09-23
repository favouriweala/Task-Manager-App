import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiAIClient } from '../ai/gemini-client';

interface ProjectSimilarity {
  projectAId: string;
  projectBId: string;
  similarityScore: number;
  similarityFactors: {
    namesimilarity: number;
    descriptionSimilarity: number;
    taskOverlap: number;
    categoryMatch: number;
    timelineOverlap: number;
  };
  mergeRecommendation: {
    recommended: boolean;
    confidence: number;
    benefits: string[];
    challenges: string[];
    suggestedApproach: string;
  };
  embeddingSimilarity: number;
  contentSimilarity: number;
  structureSimilarity: number;
}

interface ProjectAnalysis {
  id: string;
  name: string;
  description: string;
  taskCount: number;
  completionRate: number;
  categories: string[];
  keywords: string[];
  complexity: 'low' | 'medium' | 'high';
  timeline: {
    startDate?: Date;
    endDate?: Date;
    duration?: number;
  };
}

interface MergeRecommendation {
  id: string;
  primaryProject: ProjectAnalysis;
  secondaryProject: ProjectAnalysis;
  similarity: ProjectSimilarity;
  actionPlan: {
    steps: string[];
    estimatedTime: string;
    riskLevel: 'low' | 'medium' | 'high';
    prerequisites: string[];
  };
  createdAt: Date;
  expiresAt: Date;
}

class AISimilarityService {
  private supabase: any; // Temporarily using any to fix typing issues
  private geminiClient: GeminiAIClient;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.geminiClient = new GeminiAIClient();
    
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is required for AI similarity analysis');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }

  /**
   * Analyze project similarity and generate recommendations
   */
  async analyzeProjectSimilarity(
    projectAId: string, 
    projectBId: string
  ): Promise<{ success: boolean; similarity?: ProjectSimilarity; error?: string }> {
    try {
      // Get project data
      const [projectA, projectB] = await Promise.all([
        this.getProjectAnalysis(projectAId),
        this.getProjectAnalysis(projectBId)
      ]);

      if (!projectA.success || !projectB.success) {
        return { success: false, error: 'Failed to fetch project data' };
      }

      const analysisA = projectA.data!;
      const analysisB = projectB.data!;

      // Calculate various similarity metrics
      const nameScore = this.calculateTextSimilarity(analysisA.name, analysisB.name);
      const descriptionScore = this.calculateTextSimilarity(
        analysisA.description, 
        analysisB.description
      );
      const categoryScore = this.calculateCategorySimilarity(
        analysisA.categories, 
        analysisB.categories
      );
      const taskOverlapScore = await this.calculateTaskOverlap(projectAId, projectBId);
      const timelineScore = this.calculateTimelineOverlap(
        analysisA.timeline, 
        analysisB.timeline
      );

      // Get embedding similarity
      const embeddingScore = await this.getEmbeddingSimilarity(projectAId, projectBId);

      // Calculate overall similarity
      const similarityFactors = {
        namesimilarity: nameScore,
        descriptionSimilarity: descriptionScore,
        taskOverlap: taskOverlapScore,
        categoryMatch: categoryScore,
        timelineOverlap: timelineScore,
      };

      const overallScore = this.calculateOverallSimilarity(similarityFactors, embeddingScore);

      // Generate AI-powered merge recommendation
      const mergeRecommendation = await this.generateMergeRecommendation(
        analysisA,
        analysisB,
        similarityFactors,
        overallScore
      );

      const similarity: ProjectSimilarity = {
        projectAId,
        projectBId,
        similarityScore: overallScore,
        similarityFactors,
        mergeRecommendation,
        embeddingSimilarity: embeddingScore,
        contentSimilarity: (nameScore + descriptionScore) / 2,
        structureSimilarity: (categoryScore + taskOverlapScore) / 2,
      };

      // Store similarity analysis
      await this.storeSimilarityAnalysis(similarity);

      return { success: true, similarity };
    } catch (error) {
      console.error('Error analyzing project similarity:', error);
      return { success: false, error: 'Failed to analyze project similarity' };
    }
  }

  /**
   * Find similar projects for a given project
   */
  async findSimilarProjects(
    projectId: string,
    threshold: number = 0.7,
    limit: number = 5
  ): Promise<{ success: boolean; similarities?: ProjectSimilarity[]; error?: string }> {
    try {
      // Get project embedding
      const { data: projectEmbedding, error: embeddingError } = await this.supabase
        .from('project_embeddings')
        .select('embedding')
        .eq('project_id', projectId)
        .single();

      if (embeddingError || !projectEmbedding) {
        return { success: false, error: 'Project embedding not found' };
      }

      // Search for similar projects using vector similarity
      const { data: similarProjects, error: searchError } = await this.supabase
        .rpc('search_similar_projects', {
          query_embedding: projectEmbedding.embedding,
          exclude_project_id: projectId,
          match_threshold: threshold,
          match_count: limit
        });

      if (searchError) {
        console.error('Error searching similar projects:', searchError);
        return { success: false, error: 'Failed to search similar projects' };
      }

      // Analyze each similar project in detail
      const similarities: ProjectSimilarity[] = [];
      
      for (const similar of similarProjects || []) {
        const analysisResult = await this.analyzeProjectSimilarity(
          projectId, 
          similar.project_id
        );
        
        if (analysisResult.success && analysisResult.similarity) {
          similarities.push(analysisResult.similarity);
        }
      }

      // Sort by similarity score
      similarities.sort((a, b) => b.similarityScore - a.similarityScore);

      return { success: true, similarities };
    } catch (error) {
      console.error('Error finding similar projects:', error);
      return { success: false, error: 'Failed to find similar projects' };
    }
  }

  /**
   * Generate project embeddings for similarity analysis
   */
  async generateProjectEmbedding(projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get project data with tasks
      const { data: project, error: projectError } = await this.supabase
        .from('projects')
        .select(`
          *,
          tasks (
            title,
            description,
            status,
            priority,
            category
          )
        `)
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        return { success: false, error: 'Project not found' };
      }

      // Create content for embedding
      const taskSummaries = (project.tasks || []).map((task: any) => 
        `${task.title}: ${task.description || ''} (${task.status}, ${task.priority})`
      ).join('\n');

      const content = `
Project: ${project.name}
Description: ${project.description || ''}
Category: ${project.category || ''}
Status: ${project.status}
Tasks:
${taskSummaries}
      `.trim();

      // Generate embedding using Google AI
      const model = this.genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await model.embedContent(content);
      const embedding = result.embedding.values;

      // Calculate project metrics
      const taskCount = (project.tasks || []).length;
      const completedTasks = (project.tasks || []).filter((task: any) => 
        task.status === 'completed'
      ).length;
      const completionRate = taskCount > 0 ? completedTasks / taskCount : 0;

      // Store or update embedding
      const { error: upsertError } = await this.supabase
        .from('project_embeddings')
        .upsert({
          project_id: projectId,
          content,
          embedding: `[${embedding.join(',')}]`,
          metadata: {
            category: project.category,
            status: project.status,
            taskCategories: Array.from(new Set((project.tasks || []).map((t: any) => t.category).filter(Boolean)))
          },
          task_count: taskCount,
          completion_rate: completionRate,
        });

      if (upsertError) {
        console.error('Error storing project embedding:', upsertError);
        return { success: false, error: 'Failed to store project embedding' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error generating project embedding:', error);
      return { success: false, error: 'Failed to generate project embedding' };
    }
  }

  /**
   * Batch update embeddings for all projects
   */
  async updateAllProjectEmbeddings(): Promise<{ success: boolean; updated: number; errors: number }> {
    try {
      const { data: projects, error } = await this.supabase
        .from('projects')
        .select('id');

      if (error) {
        console.error('Error fetching projects:', error);
        return { success: false, updated: 0, errors: 1 };
      }

      let updated = 0;
      let errors = 0;

      for (const project of projects || []) {
        const result = await this.generateProjectEmbedding(project.id);
        if (result.success) {
          updated++;
        } else {
          errors++;
        }
      }

      return { success: true, updated, errors };
    } catch (error) {
      console.error('Error updating all project embeddings:', error);
      return { success: false, updated: 0, errors: 1 };
    }
  }

  /**
   * Get project analysis data
   */
  private async getProjectAnalysis(projectId: string): Promise<{ success: boolean; data?: ProjectAnalysis; error?: string }> {
    try {
      const { data: project, error } = await this.supabase
        .from('projects')
        .select(`
          *,
          tasks (
            title,
            description,
            status,
            priority,
            category,
            due_date,
            created_at
          )
        `)
        .eq('id', projectId)
        .single();

      if (error || !project) {
        return { success: false, error: 'Project not found' };
      }

      const tasks = project.tasks || [];
      const completedTasks = tasks.filter((task: any) => task.status === 'completed');
      const categories = Array.from(new Set(tasks.map((task: any) => task.category).filter(Boolean))) as string[];
      
      // Extract keywords from project name and description
      const text = `${project.name} ${project.description || ''}`.toLowerCase();
      const keywords = text.match(/\b\w{3,}\b/g) || [];

      // Calculate timeline
     // Fix for line 365 - Add explicit type annotation for date parameter
              // Calculate timeline
      // Fix for line 365 - Add explicit type annotation for date parameter
      const taskDates = tasks
        .map((task: any) => new Date(task.created_at))
        .filter((date: Date) => !isNaN(date.getTime()));

      const dueDates = tasks
        .map((task: any) => task.due_date ? new Date(task.due_date) : null)
        .filter((date: Date | null) => date && !isNaN(date.getTime())) as Date[];

      const timeline = {
        startDate: taskDates.length > 0 ? new Date(Math.min(...taskDates.map((d: Date) => d.getTime()))) : undefined,
        endDate: dueDates.length > 0 ? new Date(Math.max(...dueDates.map((d: Date) => d.getTime()))) : undefined,
        duration: taskDates.length > 0 && dueDates.length > 0 ? 
          Math.max(...dueDates.map((d: Date) => d.getTime())) - Math.min(...taskDates.map((d: Date) => d.getTime())) : 
          undefined
      };

      const analysis: ProjectAnalysis = {
        id: projectId,
        name: project.name,
        description: project.description || '',
        taskCount: tasks.length,
        completionRate: tasks.length > 0 ? completedTasks.length / tasks.length : 0,
        categories,
        keywords: Array.from(new Set(keywords)),
        complexity: this.calculateComplexity(tasks.length, categories.length),
        timeline,
      };

            return { success: true, data: analysis };
    } catch (error) {
      console.error('Error getting project analysis:', error);
      return { success: false, error: 'Failed to analyze project' };
    }
  } 
  /**
   * Calculate text similarity using simple algorithm
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;

    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set(Array.from(words1).filter(word => words2.has(word)));
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Calculate category similarity
   */
  private calculateCategorySimilarity(categories1: string[], categories2: string[]): number {
    if (categories1.length === 0 && categories2.length === 0) return 1;
    if (categories1.length === 0 || categories2.length === 0) return 0;

    const set1 = new Set(categories1.map(c => c.toLowerCase()));
    const set2 = new Set(categories2.map(c => c.toLowerCase()));
    
    const intersection = new Set(Array.from(set1).filter(cat => set2.has(cat)));
    const union = new Set([...Array.from(set1), ...Array.from(set2)]);
    
    return intersection.size / union.size;
  }

  /**
   * Calculate task overlap between projects
   */
  private async calculateTaskOverlap(projectAId: string, projectBId: string): Promise<number> {
    try {
      const { data: tasksA } = await this.supabase
        .from('tasks')
        .select('title, description')
        .eq('project_id', projectAId);

      const { data: tasksB } = await this.supabase
        .from('tasks')
        .select('title, description')
        .eq('project_id', projectBId);

      if (!tasksA || !tasksB || tasksA.length === 0 || tasksB.length === 0) {
        return 0;
      }

      let totalSimilarity = 0;
      let comparisons = 0;

      for (const taskA of tasksA) {
        for (const taskB of tasksB) {
          const titleSim = this.calculateTextSimilarity(taskA.title, taskB.title);
          const descSim = this.calculateTextSimilarity(
            taskA.description || '', 
            taskB.description || ''
          );
          totalSimilarity += (titleSim + descSim) / 2;
          comparisons++;
        }
      }

      return comparisons > 0 ? totalSimilarity / comparisons : 0;
    } catch (error) {
      console.error('Error calculating task overlap:', error);
      return 0;
    }
  }

  /**
   * Calculate timeline overlap
   */
  private calculateTimelineOverlap(timeline1: any, timeline2: any): number {
    if (!timeline1.startDate || !timeline1.endDate || 
        !timeline2.startDate || !timeline2.endDate) {
      return 0;
    }

    const start1 = timeline1.startDate.getTime();
    const end1 = timeline1.endDate.getTime();
    const start2 = timeline2.startDate.getTime();
    const end2 = timeline2.endDate.getTime();

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);
    
    if (overlapStart >= overlapEnd) return 0;

    const overlapDuration = overlapEnd - overlapStart;
    const totalDuration = Math.max(end1, end2) - Math.min(start1, start2);

    return totalDuration > 0 ? overlapDuration / totalDuration : 0;
  }

  /**
   * Get embedding similarity between two projects
   */
  private async getEmbeddingSimilarity(projectAId: string, projectBId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .rpc('search_similar_projects', {
          query_embedding: `(SELECT embedding FROM project_embeddings WHERE project_id = '${projectAId}')`,
          exclude_project_id: projectAId,
          match_threshold: 0,
          match_count: 1000
        });

      if (error) return 0;

      const match = data?.find((item: any) => item.project_id === projectBId);
      return match?.similarity || 0;
    } catch (error) {
      console.error('Error getting embedding similarity:', error);
      return 0;
    }
  }

  /**
   * Calculate overall similarity score
   */
  private calculateOverallSimilarity(factors: any, embeddingScore: number): number {
    const weights = {
      nameScore: 0.2,
      descriptionScore: 0.2,
      taskOverlap: 0.25,
      categoryMatch: 0.15,
      timelineOverlap: 0.1,
      embeddingScore: 0.1
    };

    return (
      factors.nameScore * weights.nameScore +
      factors.descriptionScore * weights.descriptionScore +
      factors.taskOverlap * weights.taskOverlap +
      factors.categoryMatch * weights.categoryMatch +
      factors.timelineOverlap * weights.timelineOverlap +
      embeddingScore * weights.embeddingScore
    );
  }

  /**
   * Generate AI-powered merge recommendation
   */
  private async generateMergeRecommendation(
    projectA: ProjectAnalysis,
    projectB: ProjectAnalysis,
    factors: any,
    overallScore: number
  ): Promise<any> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Analyze these two projects and provide a merge recommendation:

Project A: ${projectA.name}
- Description: ${projectA.description}
- Tasks: ${projectA.taskCount}
- Completion: ${(projectA.completionRate * 100).toFixed(1)}%
- Categories: ${projectA.categories.join(', ')}

Project B: ${projectB.name}
- Description: ${projectB.description}
- Tasks: ${projectB.taskCount}
- Completion: ${(projectB.completionRate * 100).toFixed(1)}%
- Categories: ${projectB.categories.join(', ')}

Similarity Factors:
- Name similarity: ${(factors.nameScore * 100).toFixed(1)}%
- Description similarity: ${(factors.descriptionScore * 100).toFixed(1)}%
- Task overlap: ${(factors.taskOverlap * 100).toFixed(1)}%
- Category match: ${(factors.categoryMatch * 100).toFixed(1)}%
- Overall similarity: ${(overallScore * 100).toFixed(1)}%

Provide a JSON response with:
{
  "recommended": boolean,
  "confidence": number (0-1),
  "benefits": ["benefit1", "benefit2", ...],
  "challenges": ["challenge1", "challenge2", ...],
  "suggestedApproach": "detailed approach description"
}
      `;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        return JSON.parse(response);
      } catch {
        // Fallback if AI doesn't return valid JSON
        return {
          recommended: overallScore > 0.7,
          confidence: overallScore,
          benefits: overallScore > 0.7 ? ['Consolidate similar work', 'Reduce duplication'] : [],
          challenges: ['Data migration', 'User adaptation'],
          suggestedApproach: overallScore > 0.7 ? 
            'Merge projects by combining tasks and maintaining both project histories' :
            'Keep projects separate due to low similarity'
        };
      }
    } catch (error) {
      console.error('Error generating merge recommendation:', error);
      return {
        recommended: false,
        confidence: 0,
        benefits: [],
        challenges: ['Analysis failed'],
        suggestedApproach: 'Manual review required'
      };
    }
  }

  /**
   * Store similarity analysis in database
   */
  private async storeSimilarityAnalysis(similarity: ProjectSimilarity): Promise<void> {
    try {
      await this.supabase
        .from('project_similarities')
        .upsert({
          project_a_id: similarity.projectAId,
          project_b_id: similarity.projectBId,
          similarity_score: similarity.similarityScore,
          similarity_factors: similarity.similarityFactors,
          merge_recommendation: similarity.mergeRecommendation,
          embedding_similarity: similarity.embeddingSimilarity,
          content_similarity: similarity.contentSimilarity,
          structure_similarity: similarity.structureSimilarity,
        });
    } catch (error) {
      console.error('Error storing similarity analysis:', error);
    }
  }

  /**
   * Calculate project complexity
   */
  private calculateComplexity(taskCount: number, categoryCount: number): 'low' | 'medium' | 'high' {
    const complexityScore = taskCount * 0.1 + categoryCount * 0.5;
    
    if (complexityScore < 2) return 'low';
    if (complexityScore < 5) return 'medium';
    return 'high';
  }
}

export const aiSimilarityService = new AISimilarityService();
export type { ProjectSimilarity, ProjectAnalysis, MergeRecommendation };