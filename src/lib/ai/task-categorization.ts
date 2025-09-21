import { categorizeTask as geminiCategorizeTask } from './gemini';
import { analyzeTaskWithAI } from './vercel-ai';

// Predefined task categories with descriptions
export const TASK_CATEGORIES = {
  development: {
    name: 'Development',
    description: 'Coding, programming, and technical implementation tasks',
    color: '#3B82F6',
    icon: 'code',
    keywords: ['code', 'develop', 'implement', 'build', 'create', 'program', 'api', 'database', 'frontend', 'backend'],
  },
  design: {
    name: 'Design',
    description: 'UI/UX design, graphics, and visual elements',
    color: '#8B5CF6',
    icon: 'palette',
    keywords: ['design', 'ui', 'ux', 'mockup', 'wireframe', 'prototype', 'visual', 'graphics', 'layout', 'style'],
  },
  testing: {
    name: 'Testing',
    description: 'Quality assurance, testing, and bug fixes',
    color: '#EF4444',
    icon: 'bug',
    keywords: ['test', 'bug', 'fix', 'debug', 'qa', 'quality', 'verify', 'validate', 'error', 'issue'],
  },
  documentation: {
    name: 'Documentation',
    description: 'Writing documentation, guides, and specifications',
    color: '#10B981',
    icon: 'book',
    keywords: ['document', 'write', 'guide', 'readme', 'spec', 'manual', 'help', 'wiki', 'notes', 'explain'],
  },
  planning: {
    name: 'Planning',
    description: 'Project planning, research, and strategy',
    color: '#F59E0B',
    icon: 'lightbulb',
    keywords: ['plan', 'research', 'strategy', 'analyze', 'brainstorm', 'meeting', 'discuss', 'review', 'evaluate'],
  },
  deployment: {
    name: 'Deployment',
    description: 'Deployment, DevOps, and infrastructure tasks',
    color: '#6366F1',
    icon: 'server',
    keywords: ['deploy', 'release', 'server', 'infrastructure', 'devops', 'ci/cd', 'build', 'publish', 'launch'],
  },
  maintenance: {
    name: 'Maintenance',
    description: 'Maintenance, updates, and optimization tasks',
    color: '#84CC16',
    icon: 'wrench',
    keywords: ['maintain', 'update', 'optimize', 'refactor', 'cleanup', 'upgrade', 'performance', 'security'],
  },
  communication: {
    name: 'Communication',
    description: 'Meetings, emails, and team communication',
    color: '#06B6D4',
    icon: 'message-circle',
    keywords: ['meeting', 'email', 'call', 'discuss', 'present', 'communicate', 'report', 'update', 'sync'],
  },
  general: {
    name: 'General',
    description: 'General tasks that don\'t fit other categories',
    color: '#6B7280',
    icon: 'circle',
    keywords: [],
  },
} as const;

export type TaskCategory = keyof typeof TASK_CATEGORIES;

// Priority levels with scoring
export const PRIORITY_LEVELS = {
  urgent: { name: 'Urgent', score: 4, color: '#DC2626' },
  high: { name: 'High', score: 3, color: '#EA580C' },
  medium: { name: 'Medium', score: 2, color: '#CA8A04' },
  low: { name: 'Low', score: 1, color: '#16A34A' },
} as const;

export type TaskPriority = keyof typeof PRIORITY_LEVELS;

// Simple keyword-based categorization fallback
function categorizeByKeywords(title: string, description?: string): TaskCategory {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  for (const [category, config] of Object.entries(TASK_CATEGORIES)) {
    if (config.keywords.some(keyword => text.includes(keyword))) {
      return category as TaskCategory;
    }
  }
  
  return 'general';
}

// Enhanced task categorization with AI
export async function categorizeTaskIntelligently(
  title: string,
  description?: string,
  context?: {
    projectName?: string;
    existingTasks?: Array<{ title: string; category: string }>;
    userPreferences?: {
      preferredCategories?: TaskCategory[];
      customKeywords?: Record<string, string[]>;
    };
  }
): Promise<{
  category: TaskCategory;
  priority: TaskPriority;
  confidence: number;
  reasoning: string;
  estimatedHours: number;
  tags: string[];
  aiAnalysis?: any;
}> {
  try {
    // Try AI-powered analysis first
    const [geminiResult, vercelResult] = await Promise.allSettled([
      geminiCategorizeTask(title, description),
      analyzeTaskWithAI(title, description, {
        projectName: context?.projectName,
        existingTasks: context?.existingTasks?.map(t => ({ title: t.title, status: 'unknown' })),
      }),
    ]);

    let category: TaskCategory = 'general';
    let priority: TaskPriority = 'medium';
    let confidence = 0.5;
    let reasoning = 'Keyword-based categorization';
    let estimatedHours = 2;
    let tags: string[] = [];
    let aiAnalysis: any = null;

    // Process Vercel AI result
    if (vercelResult.status === 'fulfilled') {
      aiAnalysis = vercelResult.value;
      
      // Map AI category to our predefined categories
      const aiCategory = vercelResult.value.category.toLowerCase();
      const matchedCategory = Object.keys(TASK_CATEGORIES).find(cat => 
        cat === aiCategory || TASK_CATEGORIES[cat as TaskCategory].keywords.some(keyword => 
          keyword.toLowerCase() === aiCategory.toLowerCase()
        )
      );
      
      if (matchedCategory) {
        category = matchedCategory as TaskCategory;
      }
      
      priority = vercelResult.value.priority;
      confidence = vercelResult.value.confidence;
      estimatedHours = vercelResult.value.estimatedHours;
      tags = vercelResult.value.tags;
      reasoning = 'AI-powered analysis with structured output';
    }
    
    // Process Gemini result as fallback or enhancement
    if (geminiResult.status === 'fulfilled' && geminiResult.value) {
      const geminiCategory = geminiResult.value.category?.toLowerCase();
      const matchedGeminiCategory = Object.keys(TASK_CATEGORIES).find(cat => 
        cat === geminiCategory || TASK_CATEGORIES[cat as TaskCategory].keywords.some(keyword => 
          keyword.toLowerCase() === geminiCategory.toLowerCase()
        )
      );
      
      if (matchedGeminiCategory && (!aiAnalysis || confidence < 0.7)) {
        category = matchedGeminiCategory as TaskCategory;
        priority = (geminiResult.value.priority as TaskPriority) || priority;
        reasoning = 'Gemini AI categorization';
      }
    }

    // Fallback to keyword-based categorization if AI fails or confidence is low
    if (confidence < 0.3) {
      category = categorizeByKeywords(title, description);
      reasoning = 'Keyword-based fallback categorization';
      confidence = 0.6;
    }

    // Apply user preferences
    if (context?.userPreferences?.preferredCategories?.includes(category)) {
      confidence = Math.min(confidence + 0.1, 1.0);
    }

    // Custom keyword matching
    if (context?.userPreferences?.customKeywords) {
      const text = `${title} ${description || ''}`.toLowerCase();
      for (const [customCategory, keywords] of Object.entries(context.userPreferences.customKeywords)) {
        if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
          if (Object.keys(TASK_CATEGORIES).includes(customCategory)) {
            category = customCategory as TaskCategory;
            confidence = Math.min(confidence + 0.2, 1.0);
            reasoning = 'Custom keyword matching';
            break;
          }
        }
      }
    }

    return {
      category,
      priority,
      confidence,
      reasoning,
      estimatedHours,
      tags,
      aiAnalysis,
    };
  } catch (error) {
    console.error('Error in intelligent task categorization:', error);
    
    // Fallback to keyword-based categorization
    const fallbackCategory = categorizeByKeywords(title, description);
    
    return {
      category: fallbackCategory,
      priority: 'medium',
      confidence: 0.4,
      reasoning: 'Fallback categorization due to AI error',
      estimatedHours: 2,
      tags: [],
    };
  }
}

// Batch categorize multiple tasks
export async function batchCategorizeTask(
  tasks: Array<{ id: string; title: string; description?: string }>,
  context?: {
    projectName?: string;
    userPreferences?: {
      preferredCategories?: TaskCategory[];
      customKeywords?: Record<string, string[]>;
    };
  }
): Promise<Array<{
  id: string;
  category: TaskCategory;
  priority: TaskPriority;
  confidence: number;
  estimatedHours: number;
  tags: string[];
}>> {
  const results = await Promise.allSettled(
    tasks.map(task => 
      categorizeTaskIntelligently(task.title, task.description, {
        ...context,
        existingTasks: tasks.map(t => ({ title: t.title, category: 'unknown' })),
      })
    )
  );

  return results.map((result, index) => {
    const task = tasks[index];
    
    if (result.status === 'fulfilled') {
      return {
        id: task.id,
        category: result.value.category,
        priority: result.value.priority,
        confidence: result.value.confidence,
        estimatedHours: result.value.estimatedHours,
        tags: result.value.tags,
      };
    } else {
      // Fallback for failed categorization
      return {
        id: task.id,
        category: categorizeByKeywords(task.title, task.description),
        priority: 'medium' as TaskPriority,
        confidence: 0.3,
        estimatedHours: 2,
        tags: [],
      };
    }
  });
}

// Get category statistics for a project
export function getCategoryStatistics(
  tasks: Array<{ category: TaskCategory; status: string; estimatedHours?: number }>
): {
  categoryDistribution: Record<TaskCategory, number>;
  priorityDistribution: Record<TaskPriority, number>;
  totalEstimatedHours: number;
  completionByCategory: Record<TaskCategory, { completed: number; total: number; percentage: number }>;
} {
  const categoryDistribution = {} as Record<TaskCategory, number>;
  const completionByCategory = {} as Record<TaskCategory, { completed: number; total: number; percentage: number }>;
  let totalEstimatedHours = 0;

  // Initialize counters
  Object.keys(TASK_CATEGORIES).forEach(category => {
    categoryDistribution[category as TaskCategory] = 0;
    completionByCategory[category as TaskCategory] = { completed: 0, total: 0, percentage: 0 };
  });

  // Count tasks by category and completion status
  tasks.forEach(task => {
    categoryDistribution[task.category]++;
    completionByCategory[task.category].total++;
    
    if (task.status === 'completed') {
      completionByCategory[task.category].completed++;
    }
    
    totalEstimatedHours += task.estimatedHours || 0;
  });

  // Calculate completion percentages
  Object.keys(completionByCategory).forEach(category => {
    const stats = completionByCategory[category as TaskCategory];
    stats.percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  });

  return {
    categoryDistribution,
    priorityDistribution: {} as Record<TaskPriority, number>, // Would need priority data
    totalEstimatedHours,
    completionByCategory,
  };
}

// Smart task suggestions based on project context
export async function suggestTaskCategories(
  projectName: string,
  projectDescription?: string,
  existingCategories?: TaskCategory[]
): Promise<{
  suggestedCategories: TaskCategory[];
  reasoning: string;
  missingCategories: TaskCategory[];
}> {
  const allCategories = Object.keys(TASK_CATEGORIES) as TaskCategory[];
  const missingCategories = allCategories.filter(cat => !existingCategories?.includes(cat));
  
  // Simple heuristic-based suggestions
  let suggestedCategories: TaskCategory[] = [];
  const projectText = `${projectName} ${projectDescription || ''}`.toLowerCase();
  
  if (projectText.includes('web') || projectText.includes('app') || projectText.includes('software')) {
    suggestedCategories = ['development', 'design', 'testing', 'deployment'];
  } else if (projectText.includes('research') || projectText.includes('analysis')) {
    suggestedCategories = ['planning', 'documentation', 'communication'];
  } else {
    suggestedCategories = ['planning', 'development', 'testing', 'documentation'];
  }
  
  // Filter to only missing categories
  suggestedCategories = suggestedCategories.filter(cat => missingCategories.includes(cat));
  
  return {
    suggestedCategories,
    reasoning: 'Based on project type and common task patterns',
    missingCategories,
  };
}