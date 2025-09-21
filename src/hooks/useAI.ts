import { useState, useCallback } from 'react';
import { analyzeTask, suggestTaskImprovements, analyzeTaskPatterns, TaskAnalysis, AITaskSuggestion, isAIAvailable } from '@/lib/ai';
import { Task } from '@/types/task';

export interface UseAIReturn {
  // State
  isAnalyzing: boolean;
  isGeneratingSuggestions: boolean;
  isAnalyzingPatterns: boolean;
  aiAvailable: boolean;
  
  // Functions
  analyzeTaskAI: (title: string, description?: string, context?: any) => Promise<TaskAnalysis | null>;
  getSuggestions: (title: string, description?: string) => Promise<AITaskSuggestion | null>;
  getPatternInsights: (tasks: Task[]) => Promise<{
    insights: string[];
    recommendations: string[];
    productivityTrends: string[];
  } | null>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export function useAI(): UseAIReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isAnalyzingPatterns, setIsAnalyzingPatterns] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const analyzeTaskAI = useCallback(async (
    title: string, 
    description?: string, 
    context?: {
      existingTasks?: Array<{ title: string; category?: string; priority: string }>;
      userPreferences?: Record<string, any>;
    }
  ): Promise<TaskAnalysis | null> => {
    if (!isAIAvailable()) {
      setError('AI service is not available. Please check your API configuration.');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = await analyzeTask(title, description, context);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze task';
      setError(errorMessage);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getSuggestions = useCallback(async (
    title: string, 
    description?: string
  ): Promise<AITaskSuggestion | null> => {
    if (!isAIAvailable()) {
      setError('AI service is not available. Please check your API configuration.');
      return null;
    }

    setIsGeneratingSuggestions(true);
    setError(null);

    try {
      const suggestions = await suggestTaskImprovements(title, description);
      return suggestions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate suggestions';
      setError(errorMessage);
      return null;
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, []);

  const getPatternInsights = useCallback(async (
    tasks: Task[]
  ): Promise<{
    insights: string[];
    recommendations: string[];
    productivityTrends: string[];
  } | null> => {
    if (!isAIAvailable()) {
      setError('AI service is not available. Please check your API configuration.');
      return null;
    }

    if (tasks.length === 0) {
      setError('No tasks available for pattern analysis.');
      return null;
    }

    setIsAnalyzingPatterns(true);
    setError(null);

    try {
      const analysis = await analyzeTaskPatterns(tasks);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze task patterns';
      setError(errorMessage);
      return null;
    } finally {
      setIsAnalyzingPatterns(false);
    }
  }, []);

  return {
    // State
    isAnalyzing,
    isGeneratingSuggestions,
    isAnalyzingPatterns,
    aiAvailable: isAIAvailable(),
    
    // Functions
    analyzeTaskAI,
    getSuggestions,
    getPatternInsights,
    
    // Error handling
    error,
    clearError,
  };
}