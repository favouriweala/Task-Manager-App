import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIProcessingRequest {
  type: 'pattern_analysis' | 'priority_prediction' | 'completion_forecast' | 'notification_context' | 'recommendation_generation';
  userId: string;
  data: any;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

interface AIProcessingResponse {
  success: boolean;
  result?: any;
  error?: string;
  processingTime: number;
  requestId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Initialize Gemini AI
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    // Parse request body
    const requestBody: AIProcessingRequest = await req.json();
    const { type, userId, data, priority, metadata } = requestBody;

    console.log(`Processing AI request: ${type} for user ${userId} (${requestId})`);

    // Validate request
    if (!type || !userId || !data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: type, userId, data',
          requestId
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Log the processing request
    await supabaseClient
      .from('ai_processing_logs')
      .insert({
        request_id: requestId,
        user_id: userId,
        processing_type: type,
        priority,
        status: 'processing',
        metadata: { ...metadata, startTime }
      });

    let result: any;

    // Process based on type
    switch (type) {
      case 'pattern_analysis':
        result = await processPatternAnalysis(model, supabaseClient, userId, data);
        break;
      
      case 'priority_prediction':
        result = await processPriorityPrediction(model, supabaseClient, userId, data);
        break;
      
      case 'completion_forecast':
        result = await processCompletionForecast(model, supabaseClient, userId, data);
        break;
      
      case 'notification_context':
        result = await processNotificationContext(model, supabaseClient, userId, data);
        break;
      
      case 'recommendation_generation':
        result = await processRecommendationGeneration(model, supabaseClient, userId, data);
        break;
      
      default:
        throw new Error(`Unknown processing type: ${type}`);
    }

    const processingTime = Date.now() - startTime;

    // Log successful completion
    await supabaseClient
      .from('ai_processing_logs')
      .update({
        status: 'completed',
        result,
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('request_id', requestId);

    // Store result in appropriate table
    await storeProcessingResult(supabaseClient, type, userId, result, requestId);

    // Trigger real-time notifications if needed
    if (priority === 'high' || type === 'notification_context') {
      await triggerRealTimeNotification(supabaseClient, userId, type, result);
    }

    const response: AIProcessingResponse = {
      success: true,
      result,
      processingTime,
      requestId
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('AI Processing Error:', error);

    const response: AIProcessingResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      processingTime: Date.now() - (Date.now()), // Will be overridden
      requestId: crypto.randomUUID()
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function processPatternAnalysis(model: any, supabase: any, userId: string, data: any) {
  const prompt = `
    Analyze the following user behavior data and identify patterns:
    
    User ID: ${userId}
    Behavior Events: ${JSON.stringify(data.events, null, 2)}
    Timeframe: ${data.timeframe || '30 days'}
    
    Please identify:
    1. Productivity patterns (peak hours, work rhythms)
    2. Task completion patterns
    3. Collaboration patterns
    4. Workflow inefficiencies
    5. Automation opportunities
    
    Return a JSON response with:
    {
      "identifiedPatterns": [
        {
          "type": "productivity_peak" | "task_preference" | "workflow_habit" | "collaboration_style",
          "description": "Clear description of the pattern",
          "confidence": 0.0-1.0,
          "frequency": "daily" | "weekly" | "monthly",
          "triggers": ["list of triggers"],
          "outcomes": ["list of outcomes"],
          "insights": ["actionable insights"],
          "recommendations": ["specific recommendations"]
        }
      ],
      "overallInsights": ["high-level insights"],
      "automationOpportunities": ["automation suggestions"]
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    // Fallback if JSON parsing fails
    return {
      identifiedPatterns: [],
      overallInsights: [text],
      automationOpportunities: []
    };
  }
}

async function processPriorityPrediction(model: any, supabase: any, userId: string, data: any) {
  const prompt = `
    Predict the priority level for the following task based on user behavior and context:
    
    Task: ${JSON.stringify(data.task, null, 2)}
    User Context: ${JSON.stringify(data.userContext, null, 2)}
    Historical Data: ${JSON.stringify(data.historicalData, null, 2)}
    
    Consider:
    1. Task urgency and importance
    2. User's historical prioritization patterns
    3. Current workload and deadlines
    4. Project dependencies
    5. Business impact
    
    Return a JSON response with:
    {
      "predictedPriority": "low" | "medium" | "high" | "urgent",
      "confidence": 0.0-1.0,
      "reasoning": "Explanation of the prediction",
      "factors": ["key factors that influenced the decision"],
      "recommendations": ["suggestions for task handling"],
      "estimatedTimeToComplete": "time estimate",
      "suggestedDeadline": "ISO date string"
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      predictedPriority: 'medium',
      confidence: 0.5,
      reasoning: text,
      factors: [],
      recommendations: [],
      estimatedTimeToComplete: 'unknown',
      suggestedDeadline: null
    };
  }
}

async function processCompletionForecast(model: any, supabase: any, userId: string, data: any) {
  const prompt = `
    Generate a completion forecast for the following project:
    
    Project: ${JSON.stringify(data.project, null, 2)}
    Tasks: ${JSON.stringify(data.tasks, null, 2)}
    Team Data: ${JSON.stringify(data.teamData, null, 2)}
    Historical Performance: ${JSON.stringify(data.historicalPerformance, null, 2)}
    
    Analyze:
    1. Current progress and velocity
    2. Remaining work estimation
    3. Resource availability and capacity
    4. Risk factors and blockers
    5. Historical completion patterns
    
    Return a JSON response with:
    {
      "forecastedCompletionDate": "ISO date string",
      "confidence": 0.0-1.0,
      "progressPercentage": 0-100,
      "estimatedRemainingHours": number,
      "riskFactors": ["list of risks"],
      "recommendations": ["actionable recommendations"],
      "milestones": [
        {
          "name": "milestone name",
          "estimatedDate": "ISO date string",
          "confidence": 0.0-1.0
        }
      ],
      "resourceNeeds": ["resource requirements"],
      "alternativeScenarios": [
        {
          "scenario": "scenario name",
          "completionDate": "ISO date string",
          "conditions": ["required conditions"]
        }
      ]
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      forecastedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: 0.5,
      progressPercentage: 50,
      estimatedRemainingHours: 40,
      riskFactors: [],
      recommendations: [text],
      milestones: [],
      resourceNeeds: [],
      alternativeScenarios: []
    };
  }
}

async function processNotificationContext(model: any, supabase: any, userId: string, data: any) {
  const prompt = `
    Analyze the context for this notification and determine the best delivery strategy:
    
    Notification: ${JSON.stringify(data.notification, null, 2)}
    User Context: ${JSON.stringify(data.userContext, null, 2)}
    User Preferences: ${JSON.stringify(data.userPreferences, null, 2)}
    Current Activity: ${JSON.stringify(data.currentActivity, null, 2)}
    
    Consider:
    1. User's current focus and availability
    2. Notification urgency and importance
    3. User's notification preferences and patterns
    4. Optimal timing for delivery
    5. Best delivery channel
    
    Return a JSON response with:
    {
      "shouldDeliver": boolean,
      "deliveryStrategy": "immediate" | "scheduled" | "batched" | "suppress",
      "optimalDeliveryTime": "ISO date string or null",
      "deliveryChannel": "push" | "email" | "in-app" | "sms",
      "priority": "low" | "medium" | "high" | "urgent",
      "reasoning": "Explanation of the decision",
      "userImpactScore": 0.0-1.0,
      "contextualMessage": "Personalized message based on context"
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      shouldDeliver: true,
      deliveryStrategy: 'immediate',
      optimalDeliveryTime: null,
      deliveryChannel: 'in-app',
      priority: 'medium',
      reasoning: text,
      userImpactScore: 0.5,
      contextualMessage: data.notification.message || 'You have a new notification'
    };
  }
}

async function processRecommendationGeneration(model: any, supabase: any, userId: string, data: any) {
  const prompt = `
    Generate personalized recommendations for this user:
    
    User Profile: ${JSON.stringify(data.userProfile, null, 2)}
    Behavior Patterns: ${JSON.stringify(data.behaviorPatterns, null, 2)}
    Performance Metrics: ${JSON.stringify(data.performanceMetrics, null, 2)}
    Current Goals: ${JSON.stringify(data.currentGoals, null, 2)}
    Context: ${data.context}
    
    Generate recommendations for:
    1. Productivity optimization
    2. Workflow improvements
    3. Time management
    4. Collaboration enhancement
    5. Skill development
    
    Return a JSON response with an array of recommendations:
    [
      {
        "type": "task_optimization" | "workflow_improvement" | "productivity_boost" | "collaboration_enhancement" | "time_management",
        "title": "Clear, actionable title",
        "description": "Detailed description",
        "actionItems": [
          {
            "action": "Specific action to take",
            "priority": "low" | "medium" | "high",
            "estimatedImpact": 1-10
          }
        ],
        "reasoning": "Why this recommendation is relevant",
        "confidence": 0.0-1.0,
        "category": "category name",
        "tags": ["relevant", "tags"],
        "expiresAt": "ISO date string or null"
      }
    ]
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    return [{
      type: 'productivity_boost',
      title: 'AI-Generated Recommendation',
      description: text,
      actionItems: [{ action: 'Review AI suggestion', priority: 'medium', estimatedImpact: 5 }],
      reasoning: 'Generated based on your activity patterns',
      confidence: 0.5,
      category: 'general',
      tags: ['ai-generated'],
      expiresAt: null
    }];
  }
}

async function storeProcessingResult(supabase: any, type: string, userId: string, result: any, requestId: string) {
  const tableName = getResultTableName(type);
  
  if (tableName) {
    await supabase
      .from(tableName)
      .insert({
        user_id: userId,
        request_id: requestId,
        result,
        created_at: new Date().toISOString()
      });
  }
}

async function triggerRealTimeNotification(supabase: any, userId: string, type: string, result: any) {
  // Send real-time notification via Supabase Realtime
  await supabase
    .from('real_time_notifications')
    .insert({
      user_id: userId,
      type: `ai_${type}_completed`,
      payload: {
        processingType: type,
        result,
        timestamp: new Date().toISOString()
      }
    });
}

function getResultTableName(type: string): string | null {
  const tableMap: Record<string, string> = {
    'pattern_analysis': 'ai_pattern_results',
    'priority_prediction': 'ai_priority_predictions',
    'completion_forecast': 'ai_completion_forecasts',
    'notification_context': 'ai_notification_contexts',
    'recommendation_generation': 'ai_recommendation_results'
  };
  
  return tableMap[type] || null;
}

/* To deploy this function:
1. Make sure you have the Supabase CLI installed
2. Run: supabase functions deploy ai-processing
3. Set the required environment variables:
   - GEMINI_API_KEY
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
*/