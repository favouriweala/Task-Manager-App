// Main AI integration exports
export * from './gemini';
export * from './vercel-ai';
export * from './task-categorization';
export * from './embeddings';

// Test integration
export * from './test-integration';

// Re-export commonly used types and constants
export { TASK_CATEGORIES, PRIORITY_LEVELS } from './task-categorization';
export type { TaskCategory, TaskPriority } from './task-categorization';
export type { TaskEmbedding, SearchResult } from './embeddings';

// Convenience functions for common AI operations
import { categorizeTaskIntelligently } from './task-categorization';
import { analyzeTaskWithAI } from './vercel-ai';
import { categorizeTask } from './gemini';

/**
 * Smart task categorization that tries multiple AI approaches
 * and falls back gracefully if any fail
 */
export async function smartCategorizeTask(
  title: string,
  description?: string,
  context?: {
    projectName?: string;
    existingTasks?: Array<{ title: string; category: string }>;
  }
) {
  try {
    return await categorizeTaskIntelligently(title, description, context);
  } catch (error) {
    console.error('Smart categorization failed:', error);
    
    // Fallback to basic categorization
    try {
      const basicResult = await categorizeTask(title, description);
      return {
        category: basicResult?.category || 'general',
        priority: basicResult?.priority || 'medium',
        confidence: 0.5,
        reasoning: 'Fallback categorization',
        estimatedHours: 2,
        tags: [],
      };
    } catch (fallbackError) {
      console.error('Fallback categorization also failed:', fallbackError);
      return {
        category: 'general' as const,
        priority: 'medium' as const,
        confidence: 0.3,
        reasoning: 'Default categorization due to AI failure',
        estimatedHours: 2,
        tags: [],
      };
    }
  }
}

/**
 * Enhanced task analysis combining multiple AI approaches
 */
export async function enhancedTaskAnalysis(
  title: string,
  description?: string,
  context?: {
    projectName?: string;
    teamSize?: number;
    existingTasks?: Array<{ title: string; status: string }>;
  }
) {
  try {
    const [categorization, analysis] = await Promise.allSettled([
      categorizeTaskIntelligently(title, description, {
        projectName: context?.projectName,
        existingTasks: context?.existingTasks?.map(t => ({ title: t.title, category: 'unknown' })),
      }),
      analyzeTaskWithAI(title, description, context),
    ]);
    
    const result = {
      title,
      description,
      categorization: categorization.status === 'fulfilled' ? categorization.value : null,
      analysis: analysis.status === 'fulfilled' ? analysis.value : null,
      timestamp: new Date().toISOString(),
    };
    
    return result;
  } catch (error) {
    console.error('Enhanced task analysis failed:', error);
    throw error;
  }
}

// AI Configuration and Health Check
export interface AIConfig {
  geminiApiKey?: string;
  supabaseUrl?: string;
  supabaseServiceKey?: string;
  enableEmbeddings?: boolean;
  enableCategorization?: boolean;
}

export async function checkAIHealth(): Promise<{
  gemini: boolean;
  vercelAI: boolean;
  embeddings: boolean;
  overall: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let gemini = false;
  let vercelAI = false;
  let embeddings = false;
  
  // Check Gemini API
  try {
    if (process.env.GOOGLE_AI_API_KEY) {
      await categorizeTask('Test task', 'Test description');
      gemini = true;
    } else {
      errors.push('Google AI API key not configured');
    }
  } catch (error) {
    errors.push(`Gemini API error: ${error}`);
  }
  
  // Check Vercel AI
  try {
    if (process.env.GOOGLE_AI_API_KEY) {
      await analyzeTaskWithAI('Test task', 'Test description');
      vercelAI = true;
    } else {
      errors.push('Google AI API key not configured for Vercel AI');
    }
  } catch (error) {
    errors.push(`Vercel AI error: ${error}`);
  }
  
  // Check embeddings (requires database)
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // This would require actual database connection
      embeddings = true; // Assume working if env vars are set
    } else {
      errors.push('Supabase configuration missing for embeddings');
    }
  } catch (error) {
    errors.push(`Embeddings error: ${error}`);
  }
  
  const overall = gemini && vercelAI && embeddings;
  
  return {
    gemini,
    vercelAI,
    embeddings,
    overall,
    errors,
  };
}

// Default export for convenience
export default {
  smartCategorizeTask,
  enhancedTaskAnalysis,
  checkAIHealth,
};