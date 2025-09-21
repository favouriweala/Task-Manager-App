import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Get the Gemini model
export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

// Task categorization function
export async function categorizeTask(title: string, description?: string): Promise<{
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  reasoning: string;
}> {
  const prompt = `
    Analyze this task and provide categorization:
    Title: ${title}
    Description: ${description || 'No description provided'}
    
    Please respond with a JSON object containing:
    - category: A single word category (e.g., "development", "design", "meeting", "research", "bug", "feature")
    - priority: One of "low", "medium", "high", "urgent"
    - confidence: A number between 0 and 1 indicating confidence in the categorization
    - reasoning: A brief explanation of the categorization
    
    Consider factors like urgency keywords, complexity, and business impact.
  `;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
    
    return {
      category: parsed.category || 'general',
      priority: parsed.priority || 'medium',
      confidence: parsed.confidence || 0.5,
      reasoning: parsed.reasoning || 'AI categorization'
    };
  } catch (error) {
    console.error('Error categorizing task:', error);
    return {
      category: 'general',
      priority: 'medium',
      confidence: 0.0,
      reasoning: 'Failed to categorize task'
    };
  }
}

// Project similarity analysis
export async function analyzeProjectSimilarity(
  project1: { name: string; description?: string },
  project2: { name: string; description?: string }
): Promise<{
  similarity: number;
  shouldMerge: boolean;
  reasoning: string;
  mergeStrategy?: string;
}> {
  const prompt = `
    Analyze the similarity between these two projects:
    
    Project 1:
    Name: ${project1.name}
    Description: ${project1.description || 'No description'}
    
    Project 2:
    Name: ${project2.name}
    Description: ${project2.description || 'No description'}
    
    Please respond with a JSON object containing:
    - similarity: A number between 0 and 1 indicating how similar the projects are
    - shouldMerge: Boolean indicating if these projects should be merged
    - reasoning: Explanation of the similarity analysis
    - mergeStrategy: If shouldMerge is true, suggest how to merge them
    
    Consider factors like project scope, goals, team overlap, and timeline.
  `;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
    
    return {
      similarity: parsed.similarity || 0.0,
      shouldMerge: parsed.shouldMerge || false,
      reasoning: parsed.reasoning || 'AI analysis',
      mergeStrategy: parsed.mergeStrategy
    };
  } catch (error) {
    console.error('Error analyzing project similarity:', error);
    return {
      similarity: 0.0,
      shouldMerge: false,
      reasoning: 'Failed to analyze project similarity'
    };
  }
}

// Smart task scheduling
export async function suggestTaskSchedule(tasks: Array<{
  id: string;
  title: string;
  description?: string;
  priority: string;
  estimatedHours?: number;
  dependencies?: string[];
}>): Promise<{
  schedule: Array<{
    taskId: string;
    suggestedStartDate: string;
    suggestedDueDate: string;
    reasoning: string;
  }>;
  insights: string[];
}> {
  const prompt = `
    Analyze these tasks and suggest an optimal schedule:
    
    Tasks:
    ${tasks.map(task => `
    - ID: ${task.id}
    - Title: ${task.title}
    - Description: ${task.description || 'No description'}
    - Priority: ${task.priority}
    - Estimated Hours: ${task.estimatedHours || 'Not specified'}
    - Dependencies: ${task.dependencies?.join(', ') || 'None'}
    `).join('\n')}
    
    Please respond with a JSON object containing:
    - schedule: Array of objects with taskId, suggestedStartDate, suggestedDueDate, and reasoning
    - insights: Array of strings with scheduling insights and recommendations
    
    Consider task priorities, dependencies, estimated effort, and optimal workflow.
    Use ISO date format for dates (YYYY-MM-DD).
  `;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
    
    return {
      schedule: parsed.schedule || [],
      insights: parsed.insights || []
    };
  } catch (error) {
    console.error('Error suggesting task schedule:', error);
    return {
      schedule: [],
      insights: ['Failed to generate schedule suggestions']
    };
  }
}