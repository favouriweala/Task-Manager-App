'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Lightbulb, 
  Zap, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  BarChart3,
  Sparkles,
  Users,
  Calendar,
  DollarSign,
  Award,
  Activity,
  ArrowRight,
  Eye,
  MessageSquare
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'opportunity' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'budget' | 'timeline' | 'team' | 'quality' | 'risk';
  actionable: boolean;
  estimatedValue?: string;
  timeframe?: string;
}

interface ProjectRisk {
  id: string;
  title: string;
  probability: number;
  impact: number;
  category: 'technical' | 'resource' | 'timeline' | 'budget' | 'external';
  mitigation: string;
  status: 'identified' | 'monitoring' | 'mitigating' | 'resolved';
}

interface PerformanceMetric {
  name: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  category: 'productivity' | 'quality' | 'efficiency' | 'satisfaction';
}

export function ProjectAIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data - in real app, this would come from AI service
  useEffect(() => {
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'recommendation',
        title: 'Optimize Sprint Planning',
        description: 'Based on team velocity patterns, consider reducing sprint scope by 15% to improve delivery consistency.',
        confidence: 87,
        impact: 'high',
        category: 'performance',
        actionable: true,
        estimatedValue: '+23% delivery reliability',
        timeframe: '2-3 sprints'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Budget Overrun Risk',
        description: 'Current spending trajectory suggests 18% budget overrun by project completion.',
        confidence: 92,
        impact: 'critical',
        category: 'budget',
        actionable: true,
        estimatedValue: '$27,000 potential savings',
        timeframe: 'Immediate action needed'
      },
      {
        id: '3',
        type: 'opportunity',
        title: 'Team Skill Development',
        description: 'Sarah Chen shows exceptional AI/ML aptitude. Consider advanced training for 40% productivity boost.',
        confidence: 78,
        impact: 'medium',
        category: 'team',
        actionable: true,
        estimatedValue: '+40% AI feature velocity',
        timeframe: '4-6 weeks'
      },
      {
        id: '4',
        type: 'prediction',
        title: 'Delivery Timeline Forecast',
        description: 'With current velocity, project completion expected 2 weeks ahead of schedule.',
        confidence: 85,
        impact: 'high',
        category: 'timeline',
        actionable: false,
        timeframe: 'March 15, 2024'
      }
    ];

    const mockRisks: ProjectRisk[] = [
      {
        id: '1',
        title: 'API Integration Complexity',
        probability: 75,
        impact: 85,
        category: 'technical',
        mitigation: 'Implement fallback mechanisms and increase testing coverage',
        status: 'monitoring'
      },
      {
        id: '2',
        title: 'Key Developer Availability',
        probability: 60,
        impact: 90,
        category: 'resource',
        mitigation: 'Cross-train team members and document critical processes',
        status: 'mitigating'
      },
      {
        id: '3',
        title: 'Third-party Service Dependency',
        probability: 40,
        impact: 70,
        category: 'external',
        mitigation: 'Establish SLA agreements and backup service providers',
        status: 'identified'
      }
    ];

    const mockMetrics: PerformanceMetric[] = [
      { name: 'Code Quality Score', current: 8.7, target: 9.0, trend: 'up', unit: '/10', category: 'quality' },
      { name: 'Sprint Velocity', current: 42, target: 45, trend: 'up', unit: 'points', category: 'productivity' },
      { name: 'Bug Resolution Time', current: 2.3, target: 2.0, trend: 'down', unit: 'days', category: 'efficiency' },
      { name: 'Team Satisfaction', current: 4.2, target: 4.5, trend: 'stable', unit: '/5', category: 'satisfaction' }
    ];

    setInsights(mockInsights);
    setRisks(mockRisks);
    setMetrics(mockMetrics);
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'opportunity': return <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'prediction': return <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      default: return <Brain className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'recommendation': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 'opportunity': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      case 'prediction': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getRiskLevel = (probability: number, impact: number) => {
    const riskScore = (probability * impact) / 100;
    if (riskScore >= 70) return { level: 'High', color: 'text-red-600 dark:text-red-400' };
    if (riskScore >= 40) return { level: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' };
    return { level: 'Low', color: 'text-green-600 dark:text-green-400' };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'stable': return <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      default: return <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Project Insights</h2>
            <p className="text-gray-600 dark:text-gray-400">Intelligent recommendations and predictions</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsLoading(true)}
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Refresh Insights
        </Button>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="insights" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/20">
            <Lightbulb className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="risks" className="data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="text-xs"
            >
              All Categories
            </Button>
            {['performance', 'budget', 'timeline', 'team', 'quality', 'risk'].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Insights List */}
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <Card key={insight.id} className={`${getInsightColor(insight.type)} border transition-all duration-200 hover:shadow-md`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        {getInsightIcon(insight.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{insight.title}</h3>
                          <Badge className={`${getImpactColor(insight.impact)} border-0 text-xs`}>
                            {insight.impact} impact
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.confidence}% confidence
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{insight.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            {insight.estimatedValue && (
                              <div className="flex items-center space-x-1">
                                <Target className="h-4 w-4" />
                                <span>{insight.estimatedValue}</span>
                              </div>
                            )}
                            {insight.timeframe && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{insight.timeframe}</span>
                              </div>
                            )}
                          </div>
                          
                          {insight.actionable && (
                            <Button size="sm" variant="outline" className="text-xs">
                              <ArrowRight className="h-3 w-3 mr-1" />
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="grid gap-4">
            {risks.map((risk) => {
              const riskLevel = getRiskLevel(risk.probability, risk.impact);
              return (
                <Card key={risk.id} className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{risk.title}</h3>
                        <Badge className={`${risk.category === 'technical' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' : 
                          risk.category === 'resource' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                          risk.category === 'timeline' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                          risk.category === 'budget' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'} border-0 text-xs capitalize`}>
                          {risk.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${riskLevel.color}`}>{riskLevel.level} Risk</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {Math.round((risk.probability * risk.impact) / 100)} score
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Probability</div>
                        <Progress value={risk.probability} className="h-2" />
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{risk.probability}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Impact</div>
                        <Progress value={risk.impact} className="h-2" />
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{risk.impact}%</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Mitigation Strategy</div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{risk.mitigation}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={`${risk.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        risk.status === 'mitigating' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                        risk.status === 'monitoring' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'} border-0 text-xs capitalize`}>
                        {risk.status}
                      </Badge>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Monitor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index} className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{metric.name}</h3>
                      <Badge className={`${metric.category === 'productivity' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                        metric.category === 'quality' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        metric.category === 'efficiency' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'} border-0 text-xs capitalize mt-1`}>
                        {metric.category}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(metric.trend)}
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {metric.current}{metric.unit}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Progress to Target</span>
                      <span>{metric.target}{metric.unit}</span>
                    </div>
                    <Progress 
                      value={(metric.current / metric.target) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {Math.round(((metric.current / metric.target) * 100))}% of target achieved
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}