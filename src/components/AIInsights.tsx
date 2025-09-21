import React, { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AIInsightsSkeleton } from '@/components/ui/loading-states';
import { Brain, TrendingUp, Lightbulb, Loader2, RefreshCw } from 'lucide-react';

interface AIInsightsProps {
  tasks: Task[];
  className?: string;
}

export function AIInsights({ tasks, className = '' }: AIInsightsProps) {
  const [insights, setInsights] = useState<{
    insights: string[];
    recommendations: string[];
    productivityTrends: string[];
  } | null>(null);
  
  const { getPatternInsights, isAnalyzingPatterns, aiAvailable, error } = useAI();

  const analyzePatterns = async () => {
    if (tasks.length === 0) return;
    
    const result = await getPatternInsights(tasks);
    if (result) {
      setInsights(result);
    }
  };

  useEffect(() => {
    if (aiAvailable && tasks.length > 0) {
      analyzePatterns();
    }
  }, [tasks.length, aiAvailable]);

  if (!aiAvailable) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <Brain className="h-5 w-5" />
          <span className="text-sm">AI insights unavailable - API not configured</span>
        </div>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <Brain className="h-5 w-5" />
          <span className="text-sm">Add some tasks to see AI insights</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={analyzePatterns}
          disabled={isAnalyzingPatterns}
          className="h-8 px-2"
        >
          {isAnalyzingPatterns ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-md border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isAnalyzingPatterns && !insights && (
        <AIInsightsSkeleton />
      )}

      {insights && (
        <div className="space-y-4">
          {/* Productivity Trends */}
          {insights.productivityTrends.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-gray-800">Productivity Trends</h4>
              </div>
              <ul className="space-y-1">
                {insights.productivityTrends.map((trend, index) => (
                  <li key={index} className="text-sm text-gray-600 pl-6 relative">
                    <span className="absolute left-2 top-1.5 w-1 h-1 bg-green-400 rounded-full"></span>
                    {trend}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Insights */}
          {insights.insights.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-gray-800">Key Insights</h4>
              </div>
              <ul className="space-y-1">
                {insights.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-600 pl-6 relative">
                    <span className="absolute left-2 top-1.5 w-1 h-1 bg-blue-400 rounded-full"></span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-gray-800">Recommendations</h4>
              </div>
              <ul className="space-y-1">
                {insights.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-gray-600 pl-6 relative">
                    <span className="absolute left-2 top-1.5 w-1 h-1 bg-yellow-400 rounded-full"></span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}