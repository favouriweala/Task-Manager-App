import { google } from '@ai-sdk/google';
import { generateObject, generateText, streamText } from 'ai';
import { z } from 'zod';

// Initialize the Google AI provider with proper model configuration
const googleModel = google('gemini-2.0-flash-exp');

// Schema for task analysis
const TaskAnalysisSchema = z.object({
  category: z.string().describe('Task category'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).describe('Task priority'),
  estimatedHours: z.number().describe('Estimated hours to complete'),
  tags: z.array(z.string()).describe('Relevant tags for the task'),
  dependencies: z.array(z.string()).describe('Potential dependencies'),
  confidence: z.number().min(0).max(1).describe('Confidence in analysis'),
});

// Schema for project insights
const ProjectInsightsSchema = z.object({
  completionPrediction: z.object({
    estimatedDays: z.number(),
    confidence: z.number(),
    factors: z.array(z.string()),
  }),
  riskAssessment: z.object({
    level: z.enum(['low', 'medium', 'high']),
    risks: z.array(z.string()),
    mitigations: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
});

// Advanced task analysis using structured generation
export async function analyzeTaskWithAI(
  title: string,
  description?: string,
  context?: {
    projectName?: string;
    teamSize?: number;
    existingTasks?: Array<{ title: string; status: string }>;
  }
): Promise<z.infer<typeof TaskAnalysisSchema>> {
  try {
    const { object } = await generateObject({
      model: googleModel,
      schema: TaskAnalysisSchema,
      prompt: `
        Analyze this task and provide structured insights:
        
        Task Title: ${title}
        Description: ${description || 'No description provided'}
        
        ${context ? `
        Context:
        - Project: ${context.projectName || 'Unknown'}
        - Team Size: ${context.teamSize || 'Unknown'}
        - Existing Tasks: ${context.existingTasks?.map(t => `${t.title} (${t.status})`).join(', ') || 'None'}
        ` : ''}
        
        Provide a comprehensive analysis including category, priority, estimated hours, relevant tags, potential dependencies, and your confidence level.
      `,
    });

    return object;
  } catch (error) {
    console.error('Error analyzing task with AI:', error);
    return {
      category: 'general',
      priority: 'medium',
      estimatedHours: 2,
      tags: [],
      dependencies: [],
      confidence: 0.0,
    };
  }
}

// Generate project insights
export async function generateProjectInsights(
  projectData: {
    name: string;
    description?: string;
    tasks: Array<{
      title: string;
      status: string;
      priority: string;
      estimatedHours?: number;
      actualHours?: number;
    }>;
    teamMembers: number;
    startDate: string;
  }
): Promise<z.infer<typeof ProjectInsightsSchema>> {
  try {
    const { object } = await generateObject({
      model: googleModel,
      schema: ProjectInsightsSchema,
      prompt: `
        Analyze this project and provide comprehensive insights:
        
        Project: ${projectData.name}
        Description: ${projectData.description || 'No description'}
        Team Members: ${projectData.teamMembers}
        Start Date: ${projectData.startDate}
        
        Tasks:
        ${projectData.tasks.map(task => `
        - ${task.title} (${task.status}, Priority: ${task.priority})
          Estimated: ${task.estimatedHours || 'N/A'}h, Actual: ${task.actualHours || 'N/A'}h
        `).join('')}
        
        Provide completion predictions, risk assessment, and actionable recommendations.
      `,
    });

    return object;
  } catch (error) {
    console.error('Error generating project insights:', error);
    return {
      completionPrediction: {
        estimatedDays: 30,
        confidence: 0.0,
        factors: ['Unable to analyze'],
      },
      riskAssessment: {
        level: 'medium',
        risks: ['Analysis failed'],
        mitigations: ['Manual review required'],
      },
      recommendations: ['Unable to generate recommendations'],
    };
  }
}

// Streaming AI chat for task assistance
export async function createTaskAssistantStream(
  message: string,
  context?: {
    currentTask?: { title: string; description?: string };
    projectContext?: string;
    userPreferences?: Record<string, any>;
  }
) {
  try {
    const result = await streamText({
      model: googleModel,
      prompt: `
        You are a helpful task management assistant. Help the user with their task-related questions.
        
        User Message: ${message}
        
        ${context?.currentTask ? `
        Current Task Context:
        - Title: ${context.currentTask.title}
        - Description: ${context.currentTask.description || 'No description'}
        ` : ''}
        
        ${context?.projectContext ? `
        Project Context: ${context.projectContext}
        ` : ''}
        
        Provide helpful, actionable advice for task management, project planning, and productivity.
        Keep responses concise but informative.
      `,
      temperature: 0.7,
    });

    return result;
  } catch (error) {
    console.error('Error creating task assistant stream:', error);
    throw error;
  }
}

// Generate task suggestions based on project context
export async function generateTaskSuggestions(
  projectName: string,
  projectDescription?: string,
  existingTasks?: Array<{ title: string; status: string }>
): Promise<Array<{
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}>> {
  try {
    const { text } = await generateText({
      model: googleModel,
      prompt: `
        Generate 5 relevant task suggestions for this project:
        
        Project: ${projectName}
        Description: ${projectDescription || 'No description provided'}
        
        ${existingTasks ? `
        Existing Tasks:
        ${existingTasks.map(task => `- ${task.title} (${task.status})`).join('\n')}
        ` : ''}
        
        Respond with a JSON array of task objects, each containing:
        - title: Clear, actionable task title
        - description: Detailed description of what needs to be done
        - priority: One of "low", "medium", "high", "urgent"
        - category: Task category (e.g., "development", "design", "testing", "documentation")
        
        Focus on tasks that complement existing work and move the project forward.
      `,
    });

    // Parse the JSON response
    const suggestions = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error('Error generating task suggestions:', error);
    return [];
  }
}

// AI-powered task optimization
export async function optimizeTaskWorkflow(
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    priority: string;
    status: string;
    estimatedHours?: number;
    dependencies?: string[];
  }>
): Promise<{
  optimizedOrder: string[];
  insights: string[];
  bottlenecks: Array<{
    taskId: string;
    issue: string;
    suggestion: string;
  }>;
}> {
  try {
    const { text } = await generateText({
      model: googleModel,
      prompt: `
        Analyze these tasks and suggest workflow optimizations:
        
        Tasks:
        ${tasks.map(task => `
        ID: ${task.id}
        Title: ${task.title}
        Description: ${task.description || 'No description'}
        Priority: ${task.priority}
        Status: ${task.status}
        Estimated Hours: ${task.estimatedHours || 'Not specified'}
        Dependencies: ${task.dependencies?.join(', ') || 'None'}
        `).join('\n---\n')}
        
        Provide a JSON response with:
        - optimizedOrder: Array of task IDs in optimal execution order
        - insights: Array of workflow optimization insights
        - bottlenecks: Array of objects with taskId, issue, and suggestion
        
        Consider dependencies, priorities, resource allocation, and parallel execution opportunities.
      `,
    });

    const result = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
    return {
      optimizedOrder: result.optimizedOrder || tasks.map(t => t.id),
      insights: result.insights || [],
      bottlenecks: result.bottlenecks || [],
    };
  } catch (error) {
    console.error('Error optimizing task workflow:', error);
    return {
      optimizedOrder: tasks.map(t => t.id),
      insights: ['Unable to optimize workflow'],
      bottlenecks: [],
    };
  }
}