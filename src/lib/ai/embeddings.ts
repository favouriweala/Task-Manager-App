import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database/types';

// Initialize clients
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Use the text-embedding-004 model for embeddings
const embeddingModel = genAI.getGenerativeModel({ 
  model: 'text-embedding-004'
});

// Embedding model configuration
const EMBEDDING_DIMENSIONS = 768;

// Types for embeddings
export interface TaskEmbedding {
  id: string;
  task_id: string;
  content: string;
  embedding: number[];
  metadata: {
    title: string;
    description?: string;
    category?: string;
    priority?: string;
    project_id?: string;
    created_at: string;
  };
}

export interface SearchResult {
  task_id: string;
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  similarity_score: number;
  metadata: Record<string, any>;
}

// Generate embeddings using Google AI
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

// Create embeddings for a task
export async function createTaskEmbedding(
  taskId: string,
  title: string,
  description?: string,
  metadata?: {
    category?: string;
    priority?: string;
    project_id?: string;
  }
): Promise<string> {
  try {
    // Combine title and description for embedding
    const content = `${title}${description ? ` ${description}` : ''}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(content);
    
    // Store in Supabase
    const { data, error } = await (supabase as any)
      .from('task_embeddings')
      .insert({
        task_id: taskId,
        content,
        embedding,
        metadata: {
          title,
          description,
          category: metadata?.category,
          priority: metadata?.priority,
          project_id: metadata?.project_id,
          created_at: new Date().toISOString(),
        },
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error storing task embedding:', error);
      throw new Error('Failed to store task embedding');
    }
    
    return (data as any).id;
  } catch (error) {
    console.error('Error creating task embedding:', error);
    throw error;
  }
}

// Update embeddings for a task
export async function updateTaskEmbedding(
  taskId: string,
  title: string,
  description?: string,
  metadata?: {
    category?: string;
    priority?: string;
    project_id?: string;
  }
): Promise<void> {
  try {
    // Check if embedding exists
    const { data: existing } = await supabase
      .from('task_embeddings')
      .select('id')
      .eq('task_id', taskId)
      .single();
    
    if (existing) {
      // Update existing embedding
      const content = `${title}${description ? ` ${description}` : ''}`;
      const embedding = await generateEmbedding(content);
      
      const { error } = await (supabase as any)
        .from('task_embeddings')
        .update({
          content,
          embedding,
          metadata: {
            title,
            description,
            category: metadata?.category,
            priority: metadata?.priority,
            project_id: metadata?.project_id,
            created_at: new Date().toISOString(),
          },
        })
        .eq('task_id', taskId);
      
      if (error) {
        throw new Error('Failed to update task embedding');
      }
    } else {
      // Create new embedding
      await createTaskEmbedding(taskId, title, description, metadata);
    }
  } catch (error) {
    console.error('Error updating task embedding:', error);
    throw error;
  }
}

// Delete embeddings for a task
export async function deleteTaskEmbedding(taskId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('task_embeddings')
      .delete()
      .eq('task_id', taskId);
    
    if (error) {
      console.error('Error deleting task embedding:', error);
      throw new Error('Failed to delete task embedding');
    }
  } catch (error) {
    console.error('Error deleting task embedding:', error);
    throw error;
  }
}

// Semantic search for tasks
export async function searchTasksBySemantics(
  query: string,
  options?: {
    limit?: number;
    threshold?: number;
    projectId?: string;
    category?: string;
    priority?: string;
  }
): Promise<SearchResult[]> {
  try {
    const limit = options?.limit || 10;
    const threshold = options?.threshold || 0.7;
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Build the RPC query
    let rpcQuery = (supabase as any).rpc('search_task_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    });
    
    // Apply filters if provided
    if (options?.projectId) {
      rpcQuery = rpcQuery.filter('metadata->>project_id', 'eq', options.projectId);
    }
    
    if (options?.category) {
      rpcQuery = rpcQuery.filter('metadata->>category', 'eq', options.category);
    }
    
    if (options?.priority) {
      rpcQuery = rpcQuery.filter('metadata->>priority', 'eq', options.priority);
    }
    
    const { data, error } = await rpcQuery;
    
    if (error) {
      console.error('Error searching task embeddings:', error);
      throw new Error('Failed to search task embeddings');
    }
    
    return ((data as any) || []).map((item: any) => ({
      task_id: item.task_id,
      title: item.metadata.title,
      description: item.metadata.description,
      category: item.metadata.category,
      priority: item.metadata.priority,
      similarity_score: item.similarity,
      metadata: item.metadata,
    }));
  } catch (error) {
    console.error('Error in semantic search:', error);
    return [];
  }
}

// Find similar tasks
export async function findSimilarTasks(
  taskId: string,
  options?: {
    limit?: number;
    threshold?: number;
    excludeSelf?: boolean;
  }
): Promise<SearchResult[]> {
  try {
    const limit = options?.limit || 5;
    const threshold = options?.threshold || 0.8;
    const excludeSelf = options?.excludeSelf !== false;
    
    // Get the task embedding first
    const { data: taskEmbedding, error: embeddingError } = await supabase
      .from('task_embeddings')
      .select('embedding')
      .eq('task_id', taskId)
      .single();

    if (embeddingError || !taskEmbedding) {
      throw new Error('Task embedding not found');
    }

    // Search for similar tasks
    let rpcQuery = (supabase as any).rpc('search_task_embeddings', {
      query_embedding: (taskEmbedding as any).embedding,
      match_threshold: threshold,
      match_count: limit + (excludeSelf ? 1 : 0),
    });
    
    const { data, error } = await rpcQuery;
    
    if (error) {
      throw new Error('Failed to find similar tasks');
    }
    
    let results = ((data as any) || []).map((item: any) => ({
      task_id: item.task_id,
      title: item.metadata.title,
      description: item.metadata.description,
      category: item.metadata.category,
      priority: item.metadata.priority,
      similarity_score: item.similarity,
      metadata: item.metadata,
    }));
    
    // Exclude the original task if requested
    if (excludeSelf) {
      results = results.filter((result: any) => result.task_id !== taskId);
    }
    
    return results.slice(0, limit);
  } catch (error) {
    console.error('Error finding similar tasks:', error);
    return [];
  }
}

// Batch create embeddings for multiple tasks
export async function batchCreateTaskEmbeddings(
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    category?: string;
    priority?: string;
    project_id?: string;
  }>
): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = [];
  const failed: string[] = [];
  
  // Process tasks in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(task =>
        createTaskEmbedding(task.id, task.title, task.description, {
          category: task.category,
          priority: task.priority,
          project_id: task.project_id,
        })
      )
    );
    
    results.forEach((result, index) => {
      const taskId = batch[index].id;
      if (result.status === 'fulfilled') {
        success.push(taskId);
      } else {
        failed.push(taskId);
        console.error(`Failed to create embedding for task ${taskId}:`, result.reason);
      }
    });
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < tasks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return { success, failed };
}

// Get embedding statistics
export async function getEmbeddingStatistics(projectId?: string): Promise<{
  totalEmbeddings: number;
  embeddingsByCategory: Record<string, number>;
  embeddingsByPriority: Record<string, number>;
  lastUpdated: string | null;
}> {
  try {
    let query = supabase
      .from('task_embeddings')
      .select('metadata');
    
    if (projectId) {
      query = query.filter('metadata->>project_id', 'eq', projectId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error('Failed to get embedding statistics');
    }
    
    const embeddings = data || [];
    const totalEmbeddings = embeddings.length;
    
    const embeddingsByCategory: Record<string, number> = {};
    const embeddingsByPriority: Record<string, number> = {};
    let lastUpdated: string | null = null;
    
    embeddings.forEach((embedding: Record<string, any>) => {
      const metadata = embedding.metadata as Record<string, any>;
      
      // Count by category
      const category = metadata.category || 'unknown';
      embeddingsByCategory[category] = (embeddingsByCategory[category] || 0) + 1;
      
      // Count by priority
      const priority = metadata.priority || 'unknown';
      embeddingsByPriority[priority] = (embeddingsByPriority[priority] || 0) + 1;
      
      // Track latest update
      if (metadata.created_at && (!lastUpdated || metadata.created_at > lastUpdated)) {
        lastUpdated = metadata.created_at;
      }
    });
    
    return {
      totalEmbeddings,
      embeddingsByCategory,
      embeddingsByPriority,
      lastUpdated,
    };
  } catch (error) {
    console.error('Error getting embedding statistics:', error);
    return {
      totalEmbeddings: 0,
      embeddingsByCategory: {},
      embeddingsByPriority: {},
      lastUpdated: null,
    };
  }
}

// Smart task recommendations based on context
export async function getTaskRecommendations(
  currentTaskId: string,
  options?: {
    limit?: number;
    includeCompleted?: boolean;
    projectId?: string;
  }
): Promise<{
  similarTasks: SearchResult[];
  relatedTasks: SearchResult[];
  suggestedNextTasks: SearchResult[];
}> {
  try {
    const limit = options?.limit || 3;
    
    // Find similar tasks
    const similarTasks = await findSimilarTasks(currentTaskId, {
      limit,
      threshold: 0.8,
      excludeSelf: true,
    });
    
    // Get current task details for context
  const { data: currentTask } = await supabase
    .from('task_embeddings')
    .select('metadata')
    .eq('task_id', currentTaskId)
    .single();

  let relatedTasks: SearchResult[] = [];
  let suggestedNextTasks: SearchResult[] = [];

  if ((currentTask as any)?.metadata) {
    const metadata = (currentTask as any).metadata as Record<string, any>;
      
      // Find tasks in the same category
      if (metadata.category) {
        relatedTasks = await searchTasksBySemantics(
          `${metadata.category} tasks`,
          {
            limit,
            category: metadata.category,
            projectId: options?.projectId,
          }
        );
      }
      
      // Suggest next tasks based on common patterns
      const nextTaskQueries = [
        `follow up to ${metadata.title}`,
        `next steps after ${metadata.title}`,
        `${metadata.category} continuation`,
      ];
      
      for (const query of nextTaskQueries) {
        const results = await searchTasksBySemantics(query, {
          limit: Math.ceil(limit / nextTaskQueries.length),
          projectId: options?.projectId,
        });
        suggestedNextTasks.push(...results);
      }
      
      // Remove duplicates and limit results
      suggestedNextTasks = suggestedNextTasks
        .filter((task, index, self) => 
          self.findIndex(t => t.task_id === task.task_id) === index
        )
        .slice(0, limit);
    }
    
    return {
      similarTasks,
      relatedTasks: relatedTasks.filter(task => task.task_id !== currentTaskId),
      suggestedNextTasks: suggestedNextTasks.filter(task => task.task_id !== currentTaskId),
    };
  } catch (error) {
    console.error('Error getting task recommendations:', error);
    return {
      similarTasks: [],
      relatedTasks: [],
      suggestedNextTasks: [],
    };
  }
}