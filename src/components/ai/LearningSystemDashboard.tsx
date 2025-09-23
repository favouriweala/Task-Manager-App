'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Lightbulb,
  CheckCircle,
  XCircle,
  Star,
  BarChart3,
  Activity,
  MessageSquare,
  Calendar,
  Zap
} from 'lucide-react';
import { 
  learningSystemService, 
  type PersonalizedRecommendation, 
  type LearningInsights,
  type BehaviorPattern 
} from '@/lib/ai/learning-system';
import { useAuth } from '@/lib/hooks/useAuth';

interface LearningSystemDashboardProps {
  className?: string;
}

export default function LearningSystemDashboard({ className }: LearningSystemDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('insights');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for different data types
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);
  const [processingRecommendation, setProcessingRecommendation] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadLearningData();
    }
  }, [user?.id, loadLearningData]);

  const loadLearningData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const [insightsData, recommendationsData, patternsData] = await Promise.all([
        learningSystemService.generateLearningInsights(user.id),
        learningSystemService.getActiveRecommendations(user.id),
        learningSystemService.analyzeBehaviorPatterns(user.id)
      ]);

      setInsights(insightsData);
      setRecommendations(recommendationsData);
      setPatterns(patternsData);
    } catch (err) {
      console.error('Error loading learning data:', err);
      setError('Failed to load learning data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationFeedback = async (
    recommendationId: string, 
    helpful: boolean, 
    implemented?: boolean,
    notes?: string
  ) => {
    try {
      setProcessingRecommendation(recommendationId);
      
      const success = await learningSystemService.provideFeedbackOnRecommendation(
        recommendationId,
        { helpful, implemented: implemented || false, notes }
      );

      if (success) {
        // Update local state
        setRecommendations(prev => 
          prev.map(rec => 
            rec.id === recommendationId 
              ? { ...rec, feedback: { helpful, implemented: implemented || false, notes }, isImplemented: implemented || false }
              : rec
          )
        );
      }
    } catch (err) {
      console.error('Error providing feedback:', err);
    } finally {
      setProcessingRecommendation(null);
    }
  };

  const generateNewRecommendations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const newRecommendations = await learningSystemService.generatePersonalizedRecommendations(user.id);
      setRecommendations(prev => [...newRecommendations, ...prev]);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Failed to generate new recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const newInsights = await learningSystemService.generateLearningInsights(user.id);
      setInsights(newInsights);
    } catch (err) {
      console.error('Error refreshing insights:', err);
      setError('Failed to refresh insights.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !insights && !recommendations.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Learning System Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Analyzing your behavior patterns...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Learning System Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadLearningData} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Learning System Dashboard
        </CardTitle>
        <CardDescription>
          AI-powered insights into your work patterns and personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            {insights ? (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Your Learning Insights</h3>
                  <Button onClick={refreshInsights} variant="outline" size="sm" disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Productivity Score */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Productivity Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Math.round(insights.productivityScore)}/100</div>
                      <Progress value={insights.productivityScore} className="mt-2" />
                    </CardContent>
                  </Card>

                  {/* Working Patterns */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Peak Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {insights.workingPatterns.peakHours.map(hour => (
                          <Badge key={hour} variant="secondary">
                            {hour}:00
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Avg session: {insights.workingPatterns.averageSessionLength}min
                      </div>
                    </CardContent>
                  </Card>

                  {/* Task Management Style */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Task Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Completion Rate</span>
                          <span className="font-semibold">
                            {Math.round(insights.taskManagementStyle.completionRate * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Planning Horizon</span>
                          <Badge variant="outline">
                            {insights.taskManagementStyle.planningHorizon}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Method</span>
                          <span className="text-sm text-muted-foreground">
                            {insights.taskManagementStyle.prioritizationMethod}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Collaboration Style */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Collaboration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Team Interaction</span>
                          <span className="font-semibold">
                            {Math.round(insights.collaborationStyle.teamInteractionScore * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Communication</span>
                          <Badge variant="outline">
                            {insights.collaborationStyle.communicationFrequency}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Leadership</span>
                          <Progress 
                            value={insights.collaborationStyle.leadershipTendency * 100} 
                            className="w-16 h-2" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Preferred Task Types */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Preferred Task Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {insights.workingPatterns.preferredTaskTypes.map(type => (
                        <Badge key={type} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No insights available yet.</p>
                <Button onClick={refreshInsights} className="mt-4">
                  Generate Insights
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Personalized Recommendations</h3>
              <Button onClick={generateNewRecommendations} variant="outline" size="sm" disabled={loading}>
                {loading ? 'Generating...' : 'Generate New'}
              </Button>
            </div>

            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map(recommendation => (
                  <Card key={recommendation.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            {recommendation.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {recommendation.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={recommendation.confidence > 0.8 ? 'default' : 'secondary'}>
                            {Math.round(recommendation.confidence * 100)}% confidence
                          </Badge>
                          <Badge variant="outline">{recommendation.type}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Action Items */}
                        <div>
                          <h4 className="font-medium mb-2">Action Items:</h4>
                          <div className="space-y-2">
                            {recommendation.actionItems.map((item, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <Badge 
                                  variant={item.priority === 'high' ? 'destructive' : 
                                          item.priority === 'medium' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {item.priority}
                                </Badge>
                                <span className="text-sm flex-1">{item.action}</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="text-xs">{item.estimatedImpact}/10</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Reasoning */}
                        <div>
                          <h4 className="font-medium mb-2">Why this recommendation?</h4>
                          <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {recommendation.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Feedback Section */}
                        {!recommendation.feedback && !recommendation.isImplemented && (
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRecommendationFeedback(recommendation.id, true, true)}
                              disabled={processingRecommendation === recommendation.id}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Implemented
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRecommendationFeedback(recommendation.id, true)}
                              disabled={processingRecommendation === recommendation.id}
                            >
                              Helpful
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRecommendationFeedback(recommendation.id, false)}
                              disabled={processingRecommendation === recommendation.id}
                            >
                              Not Helpful
                            </Button>
                          </div>
                        )}

                        {recommendation.feedback && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center gap-2 text-sm">
                              {recommendation.feedback.implemented ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : recommendation.feedback.helpful ? (
                                <Star className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-muted-foreground">
                                {recommendation.feedback.implemented ? 'Implemented' :
                                 recommendation.feedback.helpful ? 'Marked as helpful' : 'Marked as not helpful'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No recommendations available yet.</p>
                <Button onClick={generateNewRecommendations} className="mt-4">
                  Generate Recommendations
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Behavior Patterns</h3>
              <Button 
                onClick={() => user?.id && learningSystemService.analyzeBehaviorPatterns(user.id).then(setPatterns)} 
                variant="outline" 
                size="sm" 
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Refresh Patterns'}
              </Button>
            </div>

            {patterns.length > 0 ? (
              <div className="space-y-4">
                {patterns.map(pattern => (
                  <Card key={pattern.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        {pattern.pattern.description}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{pattern.patternType}</Badge>
                        <Badge variant={pattern.pattern.confidence > 0.8 ? 'default' : 'secondary'}>
                          {Math.round(pattern.pattern.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Pattern Details */}
                        <div>
                          <h4 className="font-medium mb-2">Pattern Details:</h4>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="font-medium">Frequency:</span> {pattern.pattern.frequency}
                            </div>
                            <div>
                              <span className="font-medium">Triggers:</span> {pattern.pattern.triggers.join(', ')}
                            </div>
                            <div>
                              <span className="font-medium">Outcomes:</span> {pattern.pattern.outcomes.join(', ')}
                            </div>
                          </div>
                        </div>

                        {/* Insights */}
                        {pattern.insights.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Insights:</h4>
                            <ul className="text-sm space-y-1">
                              {pattern.insights.map((insight, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Zap className="h-3 w-3 mt-0.5 text-blue-500" />
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recommendations */}
                        {pattern.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Recommendations:</h4>
                            <ul className="text-sm space-y-1">
                              {pattern.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Discovered: {pattern.discoveredAt.toLocaleDateString()} • 
                          Last updated: {pattern.lastUpdated.toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No behavior patterns detected yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Keep using the app to help us identify your work patterns.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}