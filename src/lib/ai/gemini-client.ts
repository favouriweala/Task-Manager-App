'use client';

import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';

// AI Model Configuration
const AI_CONFIG = {
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
};

export class GeminiAIClient {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Google AI API key is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: AI_CONFIG.model,
      generationConfig: AI_CONFIG.generationConfig,
      safetySettings: AI_CONFIG.safetySettings as any, // Temporarily using any to fix typing
    });
  }

  /**
   * Generate embeddings for semantic similarity
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Analyze project similarity for merge recommendations
   */
  async analyzeProjectSimilarity(projects: Array<{
    id: string;
    name: string;
    description: string;
    tasks: Array<{ title: string; description: string }>;
  }>): Promise<Array<{
    projectIds: string[];
    similarity: number;
    reasoning: string;
    confidence: number;
  }>> {
    const prompt = `
Analyze the following projects for similarity and potential merge opportunities:

${projects.map(p => `
Project: ${p.name}
Description: ${p.description}
Tasks: ${p.tasks.map(t => `- ${t.title}: ${t.description}`).join('\n')}
`).join('\n---\n')}

Please identify projects that could be merged based on:
1. Similar objectives and scope
2. Overlapping tasks or deliverables
3. Complementary resources or timelines
4. Potential efficiency gains

Return a JSON array of merge recommendations with:
- projectIds: array of project IDs to merge
- similarity: score from 0-1
- reasoning: explanation for the recommendation
- confidence: confidence level from 0-1

Only suggest merges with similarity > 0.7 and confidence > 0.6.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('Error analyzing project similarity:', error);
      return [];
    }
  }

  /**
   * Predict task priority based on context
   */
  async predictTaskPriority(task: {
    title: string;
    description: string;
    dueDate?: string;
    dependencies?: string[];
    projectContext?: string;
  }): Promise<{
    priority: 'low' | 'medium' | 'high' | 'urgent';
    confidence: number;
    reasoning: string;
  }> {
    const prompt = `
Analyze the following task and predict its priority level:

Task: ${task.title}
Description: ${task.description}
Due Date: ${task.dueDate || 'Not specified'}
Dependencies: ${task.dependencies?.join(', ') || 'None'}
Project Context: ${task.projectContext || 'Not specified'}

Consider these factors:
1. Urgency based on due date
2. Impact on other tasks (dependencies)
3. Business value and importance
4. Resource requirements
5. Risk of delays

Return a JSON object with:
- priority: one of 'low', 'medium', 'high', 'urgent'
- confidence: score from 0-1
- reasoning: explanation for the priority assignment

Be conservative with 'urgent' priority - only use for truly critical tasks.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        priority: 'medium',
        confidence: 0.5,
        reasoning: 'Unable to analyze task priority'
      };
    } catch (error) {
      console.error('Error predicting task priority:', error);
      return {
        priority: 'medium',
        confidence: 0.3,
        reasoning: 'Error occurred during priority analysis'
      };
    }
  }

  /**
   * Analyze workflow patterns for automation
   */
  async analyzeWorkflowPatterns(userActions: Array<{
    action: string;
    timestamp: string;
    context: Record<string, any>;
  }>): Promise<Array<{
    pattern: string;
    frequency: number;
    automation_potential: number;
    suggested_rule: string;
    confidence: number;
  }>> {
    const prompt = `
Analyze the following user actions to identify workflow patterns that could be automated:

${userActions.map(action => `
Action: ${action.action}
Time: ${action.timestamp}
Context: ${JSON.stringify(action.context)}
`).join('\n---\n')}

Look for patterns such as:
1. Repetitive task assignments
2. Consistent priority settings
3. Regular status updates
4. Predictable due date patterns
5. Common project structures

Return a JSON array of automation opportunities with:
- pattern: description of the identified pattern
- frequency: how often this pattern occurs (0-1)
- automation_potential: how suitable for automation (0-1)
- suggested_rule: proposed automation rule
- confidence: confidence in the pattern (0-1)

Only include patterns with frequency > 0.3 and automation_potential > 0.5.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('Error analyzing workflow patterns:', error);
      return [];
    }
  }

  /**
   * Generate project completion forecast
   */
  async forecastProjectCompletion(project: {
    name: string;
    description: string;
    tasks: Array<{
      title: string;
      status: string;
      estimatedHours?: number;
      actualHours?: number;
      dueDate?: string;
    }>;
    teamSize: number;
    startDate: string;
  }): Promise<{
    estimatedCompletion: string;
    confidence: number;
    risks: string[];
    recommendations: string[];
  }> {
    const prompt = `
Analyze the following project and forecast its completion:

Project: ${project.name}
Description: ${project.description}
Team Size: ${project.teamSize}
Start Date: ${project.startDate}

Tasks:
${project.tasks.map(task => `
- ${task.title} (${task.status})
  Estimated: ${task.estimatedHours || 'N/A'} hours
  Actual: ${task.actualHours || 'N/A'} hours
  Due: ${task.dueDate || 'N/A'}
`).join('\n')}

Consider:
1. Current progress and velocity
2. Task dependencies and critical path
3. Team capacity and availability
4. Historical performance patterns
5. Potential risks and blockers

Return a JSON object with:
- estimatedCompletion: predicted completion date (ISO format)
- confidence: confidence level (0-1)
- risks: array of potential risks
- recommendations: array of actionable recommendations

Be realistic and account for typical project delays.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.5,
        risks: ['Unable to analyze project data'],
        recommendations: ['Provide more detailed task information']
      };
    } catch (error) {
      console.error('Error forecasting project completion:', error);
      return {
        estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.3,
        risks: ['Analysis error occurred'],
        recommendations: ['Review project data and try again']
      };
    }
  }

  /**
   * Analyze notification context for smart filtering
   */
  async analyzeNotificationContext(notification: {
    type: string;
    title: string;
    message: string;
    priority: string;
    userContext: {
      currentActivity?: string;
      workingHours?: boolean;
      recentNotifications?: number;
      preferences?: Record<string, any>;
    };
  }): Promise<{
    shouldDeliver: boolean;
    deliveryTime?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    reasoning: string;
    confidence: number;
  }> {
    const prompt = `
Analyze this notification for smart delivery:

Type: ${notification.type}
Title: ${notification.title}
Message: ${notification.message}
Current Priority: ${notification.priority}

User Context:
- Current Activity: ${notification.userContext.currentActivity || 'Unknown'}
- Working Hours: ${notification.userContext.workingHours ? 'Yes' : 'No'}
- Recent Notifications: ${notification.userContext.recentNotifications || 0}
- Preferences: ${JSON.stringify(notification.userContext.preferences || {})}

Determine:
1. Should this notification be delivered immediately?
2. If not, when should it be delivered?
3. What priority should it have?
4. Consider user's current context and preferences

Return a JSON object with:
- shouldDeliver: boolean for immediate delivery
- deliveryTime: ISO timestamp if delayed (optional)
- priority: adjusted priority level
- reasoning: explanation for the decision
- confidence: confidence in the decision (0-1)

Respect user preferences and avoid notification fatigue.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        shouldDeliver: true,
        priority: notification.priority as any,
        reasoning: 'Unable to analyze notification context',
        confidence: 0.5
      };
    } catch (error) {
      console.error('Error analyzing notification context:', error);
      return {
        shouldDeliver: true,
        priority: notification.priority as any,
        reasoning: 'Error occurred during context analysis',
        confidence: 0.3
      };
    }
  }

  /**
   * Generate personalized recommendations
   */
  async generatePersonalizedRecommendations(user: {
    id: string;
    workPatterns: Array<{
      activity: string;
      frequency: number;
      performance: number;
    }>;
    preferences: Record<string, any>;
    recentTasks: Array<{
      title: string;
      status: string;
      completionTime?: number;
    }>;
  }): Promise<Array<{
    type: 'productivity' | 'workflow' | 'learning' | 'optimization';
    title: string;
    description: string;
    actionable: boolean;
    impact: number;
    confidence: number;
  }>> {
    const prompt = `
Generate personalized recommendations for this user:

Work Patterns:
${user.workPatterns.map(pattern => `
- ${pattern.activity}: ${pattern.frequency}% frequency, ${pattern.performance}% performance
`).join('\n')}

Preferences: ${JSON.stringify(user.preferences)}

Recent Tasks:
${user.recentTasks.map(task => `
- ${task.title} (${task.status}) - ${task.completionTime || 'N/A'} hours
`).join('\n')}

Generate recommendations for:
1. Productivity improvements
2. Workflow optimizations
3. Learning opportunities
4. Process optimizations

Return a JSON array with:
- type: category of recommendation
- title: brief title
- description: detailed explanation
- actionable: whether user can act on this immediately
- impact: potential impact score (0-1)
- confidence: confidence in recommendation (0-1)

Focus on actionable, high-impact recommendations.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Start a chat session for interactive AI assistance
   */
  startChatSession(): ChatSession {
    return this.model.startChat({
      history: [],
    });
  }

  /**
   * Generate content with custom prompt
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate AI content');
    }
  }
}

// Singleton instance
export const geminiClient = new GeminiAIClient();