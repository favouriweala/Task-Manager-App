'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { predictiveAnalyticsService, CompletionForecast, ProductivityTrends, ResourceAllocation } from '@/lib/ai/predictive-analytics';

interface PredictiveAnalyticsProps {
  projectId?: string;
  userId?: string;
}

export function PredictiveAnalytics({ projectId, userId }: PredictiveAnalyticsProps) {
  const [forecast, setForecast] = useState<CompletionForecast | null>(null);
  const [trends, setTrends] = useState<ProductivityTrends | null>(null);
  const [allocation, setAllocation] = useState<ResourceAllocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = [];

      if (projectId) {
        promises.push(
          predictiveAnalyticsService.generateCompletionForecast(projectId),
          predictiveAnalyticsService.optimizeResourceAllocation(projectId)
        );
      }

      promises.push(
        predictiveAnalyticsService.analyzeProductivityTrends(userId, projectId)
      );

      const results = await Promise.all(promises);

      if (projectId) {
        setForecast(results[0] as CompletionForecast);
        setAllocation(results[1] as ResourceAllocation);
        setTrends(results[2] as ProductivityTrends);
      } else {
        setTrends(results[0] as ProductivityTrends);
      }
    } catch (err) {
      setError('Failed to load predictive analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, userId]);

  useEffect(() => {
    loadAnalytics();
  }, [projectId, userId, loadAnalytics]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Predictive Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Predictive Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadAnalytics} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Predictive Analytics
        </CardTitle>
        <CardDescription>
          AI-powered insights and forecasts for your projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="forecast" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="forecast" disabled={!forecast}>
              <Target className="h-4 w-4 mr-2" />
              Forecast
            </TabsTrigger>
            <TabsTrigger value="trends" disabled={!trends}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="resources" disabled={!allocation}>
              <Users className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
          </TabsList>

          {forecast && (
            <TabsContent value="forecast" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Completion Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Predicted Completion</span>
                      <span className="text-lg font-bold">
                        {forecast.predictedCompletionDate.toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Confidence Level</span>
                      <span className={`text-lg font-bold ${getConfidenceColor(forecast.confidence)}`}>
                        {Math.round(forecast.confidence * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Days Remaining</span>
                      <Badge variant={forecast.remainingDays > 0 ? 'default' : 'destructive'}>
                        {forecast.remainingDays} days
                      </Badge>
                    </div>

                    <Progress 
                      value={Math.max(0, Math.min(100, (1 - forecast.remainingDays / 100) * 100))} 
                      className="w-full" 
                    />
                  </CardContent>
                </Card>

                {forecast.riskFactors.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        Risk Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {forecast.riskFactors.map((risk, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {forecast.recommendations.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {forecast.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {forecast.milestones.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Milestone Predictions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {forecast.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium">{milestone.name}</span>
                              <div className="text-sm text-gray-600">
                                {milestone.predictedDate.toLocaleDateString()}
                              </div>
                            </div>
                            <Badge className={getConfidenceColor(milestone.confidence)}>
                              {Math.round(milestone.confidence * 100)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}

          {trends && (
            <TabsContent value="trends" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Productivity Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{trends.tasksCompleted}</div>
                        <div className="text-sm text-gray-600">Tasks Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {trends.averageCompletionTime.toFixed(1)}h
                        </div>
                        <div className="text-sm text-gray-600">Avg. Completion Time</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Velocity Trend</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trends.velocityTrend)}
                        <span className="capitalize">{trends.velocityTrend}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Burnout Risk</span>
                      <Badge className={getRiskColor(trends.burnoutRisk)}>
                        {trends.burnoutRisk.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {trends.peakProductivityHours.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Peak Productivity Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {trends.peakProductivityHours.map((hour) => (
                          <Badge key={hour} variant="outline">
                            {hour}:00 - {hour + 1}:00
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {trends.suggestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-600" />
                        AI Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {trends.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}

          {allocation && (
            <TabsContent value="resources" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Resource Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Recommended Team Size</span>
                      <Badge>{allocation.recommendedTeamSize} members</Badge>
                    </div>

                    {allocation.skillRequirements.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Skill Requirements</h4>
                        <div className="space-y-2">
                          {allocation.skillRequirements.map((skill, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{skill.skill}</span>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={skill.currentCoverage * 100} 
                                  className="w-20" 
                                />
                                <span className="text-xs text-gray-600">
                                  {Math.round(skill.currentCoverage * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {allocation.workloadDistribution.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Workload Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {allocation.workloadDistribution.map((member, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Member {index + 1}</span>
                              <Badge variant={member.currentLoad > member.capacity ? 'destructive' : 'default'}>
                                {Math.round(member.currentLoad / member.capacity * 100)}% capacity
                              </Badge>
                            </div>
                            <Progress 
                              value={Math.min(100, (member.currentLoad / member.capacity) * 100)} 
                              className="w-full" 
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {allocation.bottlenecks.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Identified Bottlenecks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {allocation.bottlenecks.map((bottleneck, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{bottleneck}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={loadAnalytics} variant="outline">
            Refresh Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}