'use client';

import { useState, useEffect, useCallback } from 'react';
import { aiAgentService, AIProcessingRequest, UserBehaviorEvent } from '../ai/ai-agent-service';
import { useAuth } from './useAuth';

export interface AIAgentState {
  isProcessing: boolean;
  lastProcessingTime?: string;
  error?: string;
  recommendations: Array<{
    id: string;
    type: 'productivity' | 'workflow' | 'learning' | 'optimization';
    title: string;
    description: string;
    actionable: boolean;
    impact: number;
    confidence: number;
  }>;
  predictions: Array<{
    id: string;
    type: string;
    prediction: any;
    confidence: number;
    createdAt: string;
  }>;
  automationRules: Array<{
    id: string;
    name: string;
    pattern: string;
    confidence: number;
    status: 'active' | 'inactive';
  }>;
}

export interface UseAIAgentReturn {
  state: AIAgentState;
  
  // User behavior tracking
  trackBehavior: (eventType: string, eventData: Record<string, any>, context?: Record<string, any>) => Promise<void>;
  
  // AI processing requests
  requestPatternAnalysis: () => Promise<void>;
  requestTaskPriorityPrediction: (taskData: any) => Promise<any>;
  requestProjectForecast: (projectId: string) => Promise<any>;
  requestNotificationAnalysis: (notification: any) => Promise<any>;
  requestPersonalizedRecommendations: () => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  refreshRecommendations: () => Promise<void>;
  dismissRecommendation: (recommendationId: string) => Promise<void>;
  toggleAutomationRule: (ruleId: string) => Promise<void>;
}

export const useAIAgent = (): UseAIAgentReturn => {
  const { user } = useAuth();
  const [state, setState] = useState<AIAgentState>({
    isProcessing: false,
    recommendations: [],
    predictions: [],
    automationRules: []
  });

  // Track user behavior
  const trackBehavior = useCallback(async (
    eventType: string, 
    eventData: Record<string, any>, 
    context: Record<string, any> = {}
  ) => {
    if (!user?.id) return;

    try {
      await aiAgentService.trackUserBehavior({
        userId: user.id,
        eventType,
        eventData,
        context: {
          ...context,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href
        }
      });
    } catch (error) {
      console.error('Error tracking user behavior:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to track behavior' 
      }));
    }
  }, [user?.id]);

  // Request pattern analysis
  const requestPatternAnalysis = useCallback(async () => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, isProcessing: true, error: undefined }));

    try {
      await aiAgentService.queueProcessingRequest({
        type: 'pattern_analysis',
        data: { userId: user.id },
        userId: user.id,
        priority: 'medium'
      });

      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        lastProcessingTime: new Date().toISOString() 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Pattern analysis failed' 
      }));
    }
  }, [user?.id]);

  // Request task priority prediction
  const requestTaskPriorityPrediction = useCallback(async (taskData: {
    title: string;
    description: string;
    dueDate?: string;
    projectId?: string;
  }) => {
    if (!user?.id) return null;

    setState(prev => ({ ...prev, isProcessing: true, error: undefined }));

    try {
      const prediction = await aiAgentService.predictTaskPriority({
        ...taskData,
        userId: user.id
      });

      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        predictions: [
          ...prev.predictions,
          {
            id: crypto.randomUUID(),
            type: 'task_priority',
            prediction,
            confidence: prediction.confidence,
            createdAt: new Date().toISOString()
          }
        ]
      }));

      return prediction;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Priority prediction failed' 
      }));
      return null;
    }
  }, [user?.id]);

  // Request project completion forecast
  const requestProjectForecast = useCallback(async (projectId: string) => {
    if (!user?.id) return null;

    setState(prev => ({ ...prev, isProcessing: true, error: undefined }));

    try {
      const forecast = await aiAgentService.forecastProjectCompletion(projectId, user.id);

      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        predictions: [
          ...prev.predictions,
          {
            id: crypto.randomUUID(),
            type: 'project_completion',
            prediction: forecast,
            confidence: forecast.confidence,
            createdAt: new Date().toISOString()
          }
        ]
      }));

      return forecast;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Project forecast failed' 
      }));
      return null;
    }
  }, [user?.id]);

  // Request notification analysis
  const requestNotificationAnalysis = useCallback(async (notification: {
    type: string;
    title: string;
    message: string;
    priority: string;
  }) => {
    if (!user?.id) return null;

    try {
      const analysis = await aiAgentService.analyzeNotificationContext({
        ...notification,
        userId: user.id
      });

      return analysis;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Notification analysis failed' 
      }));
      return null;
    }
  }, [user?.id]);

  // Request personalized recommendations
  const requestPersonalizedRecommendations = useCallback(async () => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, isProcessing: true, error: undefined }));

    try {
      const recommendations = await aiAgentService.generatePersonalizedRecommendations(user.id);

      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        recommendations: recommendations.map(rec => ({
          id: crypto.randomUUID(),
          ...rec
        })),
        lastProcessingTime: new Date().toISOString()
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Recommendations generation failed' 
      }));
    }
  }, [user?.id]);

  // Refresh recommendations
  const refreshRecommendations = useCallback(async () => {
    await requestPersonalizedRecommendations();
  }, [requestPersonalizedRecommendations]);

  // Dismiss recommendation
  const dismissRecommendation = useCallback(async (recommendationId: string) => {
    setState(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter(rec => rec.id !== recommendationId)
    }));

    // Track dismissal behavior
    await trackBehavior('recommendation_dismissed', { recommendationId });
  }, [trackBehavior]);

  // Toggle automation rule
  const toggleAutomationRule = useCallback(async (ruleId: string) => {
    setState(prev => ({
      ...prev,
      automationRules: prev.automationRules.map(rule =>
        rule.id === ruleId
          ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' }
          : rule
      )
    }));

    // Track rule toggle behavior
    await trackBehavior('automation_rule_toggled', { ruleId });
  }, [trackBehavior]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: undefined }));
  }, []);

  // Auto-track page views and interactions
  useEffect(() => {
    if (!user?.id) return;

    // Track page view
    trackBehavior('page_view', {
      path: window.location.pathname,
      search: window.location.search
    });

    // Track clicks
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        trackBehavior('button_click', {
          buttonText: button?.textContent?.trim(),
          buttonId: button?.id,
          buttonClass: button?.className
        });
      }
    };

    // Track form submissions
    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      trackBehavior('form_submit', {
        formId: form.id,
        formClass: form.className,
        formAction: form.action
      });
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit);
    };
  }, [user?.id, trackBehavior]);

  // Load initial recommendations on mount
  useEffect(() => {
    if (user?.id && state.recommendations.length === 0) {
      requestPersonalizedRecommendations();
    }
  }, [user?.id, requestPersonalizedRecommendations, state.recommendations.length]);

  return {
    state,
    trackBehavior,
    requestPatternAnalysis,
    requestTaskPriorityPrediction,
    requestProjectForecast,
    requestNotificationAnalysis,
    requestPersonalizedRecommendations,
    clearError,
    refreshRecommendations,
    dismissRecommendation,
    toggleAutomationRule
  };
};