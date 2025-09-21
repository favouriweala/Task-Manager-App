import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface TaskAnalysis {
  category: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  reasoning: string;
}

export interface AITaskSuggestion {
  suggestedTitle?: string;
  suggestedDescription?: string;
  estimatedDuration?: string;
  tags?: string[];
}

/**
 * Analyzes a task and predicts its category and priority using AI
 */
export async function analyzeTask(
  title: string,
  description?: string,
  context?: {
    existingTasks?: Array<{ title: string; category?: string; priority: string }>;
    userPreferences?: Record<string, any>;
  }
): Promise<TaskAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Analyze the following task and provide categorization and priority prediction:

Task Title: "${title}"
Task Description: "${description || 'No description provided'}"

${context?.existingTasks ? `
Context - Similar existing tasks:
${context.existingTasks.slice(0, 5).map(task => 
  `- "${task.title}" (Category: ${task.category || 'Uncategorized'}, Priority: ${task.priority})`
).join('\n')}
` : ''}

Please analyze this task and respond with a JSON object containing:
{
  "category": "string (choose from: Development, Design, Marketing, Research, Planning, Meeting, Bug Fix, Feature, Documentation, Testing, Other)",
  "priority": "string (low/medium/high based on urgency and importance)",
  "confidence": "number (0-1 representing confidence in the analysis)",
  "reasoning": "string (brief explanation of the categorization and priority decision)"
}

Consider these factors:
- Urgency indicators (words like "urgent", "ASAP", "deadline", dates)
- Complexity indicators (technical terms, scope, dependencies)
- Business impact (customer-facing, revenue impact, critical systems)
- Task type and domain
- Similar patterns from existing tasks

Respond only with valid JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const analysis = JSON.parse(text) as TaskAnalysis;
      
      // Validate the response
      if (!analysis.category || !analysis.priority || typeof analysis.confidence !== 'number') {
        throw new Error('Invalid AI response format');
      }

      // Ensure priority is valid
      if (!['low', 'medium', 'high'].includes(analysis.priority)) {
        analysis.priority = 'medium';
      }

      // Ensure confidence is between 0 and 1
      analysis.confidence = Math.max(0, Math.min(1, analysis.confidence));

      return analysis;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return getFallbackAnalysis(title, description);
    }
  } catch (error) {
    console.error('AI analysis failed:', error);
    return getFallbackAnalysis(title, description);
  }
}

/**
 * Provides AI-powered suggestions for improving task details
 */
export async function suggestTaskImprovements(
  title: string,
  description?: string
): Promise<AITaskSuggestion> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Analyze this task and suggest improvements:

Task Title: "${title}"
Task Description: "${description || 'No description provided'}"

Please provide suggestions to improve this task definition. Respond with a JSON object:
{
  "suggestedTitle": "string (improved title if current one could be clearer)",
  "suggestedDescription": "string (enhanced description with more details)",
  "estimatedDuration": "string (estimated time to complete, e.g., '2 hours', '1 day')",
  "tags": ["array", "of", "relevant", "tags"]
}

Guidelines:
- Make titles more specific and actionable
- Add missing context or requirements to descriptions
- Provide realistic time estimates
- Suggest relevant tags for organization

Only suggest improvements if they would genuinely help. If the current title/description is good, don't change it.
Respond only with valid JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const suggestions = JSON.parse(text) as AITaskSuggestion;
      return suggestions;
    } catch (parseError) {
      console.error('Failed to parse AI suggestions:', parseError);
      return {};
    }
  } catch (error) {
    console.error('AI suggestions failed:', error);
    return {};
  }
}

/**
 * Analyzes multiple tasks to identify patterns and provide insights
 */
export async function analyzeTaskPatterns(
  tasks: Array<{ title: string; description?: string; category?: string; priority: string; status: string; created_at: string }>
): Promise<{
  insights: string[];
  recommendations: string[];
  productivityTrends: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const taskSummary = tasks.slice(0, 20).map(task => ({
      title: task.title,
      category: task.category || 'Uncategorized',
      priority: task.priority,
      status: task.status,
      age: Math.floor((Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24))
    }));

    const prompt = `
Analyze these tasks to identify patterns and provide insights:

Tasks (${taskSummary.length} total):
${taskSummary.map(task => 
  `- "${task.title}" | Category: ${task.category} | Priority: ${task.priority} | Status: ${task.status} | Age: ${task.age} days`
).join('\n')}

Provide analysis in JSON format:
{
  "insights": ["array of key insights about task patterns"],
  "recommendations": ["array of actionable recommendations for improvement"],
  "productivityTrends": ["array of observations about productivity patterns"]
}

Focus on:
- Task completion patterns
- Priority distribution and accuracy
- Category trends
- Bottlenecks or recurring issues
- Time management insights

Respond only with valid JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const analysis = JSON.parse(text);
      return {
        insights: analysis.insights || [],
        recommendations: analysis.recommendations || [],
        productivityTrends: analysis.productivityTrends || []
      };
    } catch (parseError) {
      console.error('Failed to parse pattern analysis:', parseError);
      return {
        insights: [],
        recommendations: [],
        productivityTrends: []
      };
    }
  } catch (error) {
    console.error('Pattern analysis failed:', error);
    return {
      insights: [],
      recommendations: [],
      productivityTrends: []
    };
  }
}

/**
 * Fallback analysis when AI is unavailable
 */
function getFallbackAnalysis(title: string, description?: string): TaskAnalysis {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  // Simple keyword-based categorization
  let category = 'Other';
  let priority: 'low' | 'medium' | 'high' = 'medium';

  // Category detection
  if (text.includes('bug') || text.includes('fix') || text.includes('error')) {
    category = 'Bug Fix';
    priority = 'high';
  } else if (text.includes('design') || text.includes('ui') || text.includes('ux')) {
    category = 'Design';
  } else if (text.includes('develop') || text.includes('code') || text.includes('implement')) {
    category = 'Development';
  } else if (text.includes('test') || text.includes('qa')) {
    category = 'Testing';
  } else if (text.includes('meeting') || text.includes('call') || text.includes('discuss')) {
    category = 'Meeting';
  } else if (text.includes('research') || text.includes('investigate')) {
    category = 'Research';
  } else if (text.includes('document') || text.includes('write') || text.includes('spec')) {
    category = 'Documentation';
  }

  // Priority detection
  if (text.includes('urgent') || text.includes('asap') || text.includes('critical') || text.includes('emergency')) {
    priority = 'high';
  } else if (text.includes('low priority') || text.includes('nice to have') || text.includes('when time permits')) {
    priority = 'low';
  }

  return {
    category,
    priority,
    confidence: 0.6,
    reasoning: 'Fallback analysis based on keyword detection'
  };
}

/**
 * Check if AI service is available
 */
export function isAIAvailable(): boolean {
  return !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
}