'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Settings, 
  TrendingUp, 
  Clock, 
  Target,
  Lightbulb,
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Users,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  type: 'task_routing' | 'priority_optimization' | 'deadline_management' | 'team_assignment';
  isActive: boolean;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  tasksProcessed: number;
  timeSaved: number; // in minutes
}

interface AIInsight {
  id: string;
  type: 'productivity' | 'bottleneck' | 'opportunity' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  impact: number;
  timestamp: Date;
}

interface SmartAutomationPanelProps {
  className?: string;
}

export function SmartAutomationPanel({ className }: SmartAutomationPanelProps) {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Smart Task Prioritization',
      description: 'Automatically adjusts task priorities based on deadlines, dependencies, and team capacity',
      type: 'priority_optimization',
      isActive: true,
      confidence: 0.92,
      impact: 'high',
      tasksProcessed: 247,
      timeSaved: 180
    },
    {
      id: '2',
      name: 'Intelligent Task Routing',
      description: 'Routes tasks to optimal team members based on skills, workload, and availability',
      type: 'team_assignment',
      isActive: true,
      confidence: 0.88,
      impact: 'high',
      tasksProcessed: 156,
      timeSaved: 320
    },
    {
      id: '3',
      name: 'Deadline Risk Management',
      description: 'Proactively identifies at-risk deadlines and suggests mitigation strategies',
      type: 'deadline_management',
      isActive: false,
      confidence: 0.85,
      impact: 'medium',
      tasksProcessed: 89,
      timeSaved: 95
    },
    {
      id: '4',
      name: 'Workflow Pattern Recognition',
      description: 'Learns from successful workflows and automatically applies patterns to new projects',
      type: 'task_routing',
      isActive: true,
      confidence: 0.79,
      impact: 'medium',
      tasksProcessed: 203,
      timeSaved: 145
    }
  ]);

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'productivity',
      title: 'Peak Productivity Hours Identified',
      description: 'Your team is 34% more productive between 9-11 AM. Consider scheduling important tasks during this window.',
      confidence: 0.91,
      actionable: true,
      impact: 8.5,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'bottleneck',
      title: 'Review Process Bottleneck Detected',
      description: 'Tasks are spending 40% longer in review phase. Consider adding more reviewers or streamlining the process.',
      confidence: 0.87,
      actionable: true,
      impact: 7.2,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'prediction',
      title: 'Project Completion Forecast',
      description: 'Current project is 85% likely to complete on time based on current velocity and remaining tasks.',
      confidence: 0.83,
      actionable: false,
      impact: 6.8,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: '4',
      type: 'opportunity',
      title: 'Automation Opportunity Found',
      description: 'Detected repetitive pattern in bug triage process. Automation could save 2.5 hours per week.',
      confidence: 0.76,
      actionable: true,
      impact: 9.1,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules(rules => 
      rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive }
          : rule
      )
    );
  };

  const refreshInsights = async () => {
    setIsProcessing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastUpdate(new Date());
    setIsProcessing(false);
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'productivity': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'bottleneck': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'opportunity': return <Lightbulb className="h-4 w-4 text-blue-600" />;
      case 'prediction': return <BarChart3 className="h-4 w-4 text-purple-600" />;
      default: return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: AutomationRule['impact']) => {
    switch (impact) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalTimeSaved = automationRules.reduce((sum, rule) => sum + rule.timeSaved, 0);
  const totalTasksProcessed = automationRules.reduce((sum, rule) => sum + rule.tasksProcessed, 0);
  const activeRules = automationRules.filter(rule => rule.isActive).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with AI Status */}
      <div className="bg-gradient-to-r from-zyra-surface to-zyra-background rounded-2xl p-6 border border-zyra-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-zyra-primary rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-zyra-text-primary">AI Automation Hub</h2>
              <p className="text-zyra-text-secondary">Intelligent automation powered by Google Gemini 2.5 Flash</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-zyra-success rounded-full animate-pulse"></div>
              <span className="text-sm text-zyra-text-secondary">AI Active</span>
            </div>
            <Button 
              onClick={refreshInsights}
              disabled={isProcessing}
              variant="outline"
              className="hover:bg-zyra-surface hover:border-zyra-border"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Processing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-zyra-success/5 to-zyra-success/10 border-zyra-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zyra-text-secondary">Time Saved</p>
                <p className="text-3xl font-bold text-zyra-text-primary">
                  {Math.round(totalTimeSaved / 60)}h
                </p>
              </div>
              <div className="w-12 h-12 bg-zyra-success/10 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-zyra-success" />
              </div>
            </div>
            <div className="mt-4">
              <Badge className="bg-zyra-success/10 text-zyra-success border-zyra-success/20">
                {totalTimeSaved} minutes total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zyra-primary/5 to-zyra-primary/10 border-zyra-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zyra-text-secondary">Tasks Processed</p>
                <p className="text-3xl font-bold text-zyra-text-primary">
                  {totalTasksProcessed}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                Automated processing
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Rules</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {activeRules}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300">
                of {automationRules.length} total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">AI Insights</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {aiInsights.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-200 dark:bg-orange-800 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300">
                Updated {lastUpdate.toLocaleTimeString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <Tabs defaultValue="automation" className="w-full">
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0">
              <TabsTrigger 
                value="automation"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 py-4"
              >
                <Zap className="h-4 w-4 mr-2" />
                Automation Rules
              </TabsTrigger>
              <TabsTrigger 
                value="insights"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 py-4"
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 py-4"
              >
                <Settings className="h-4 w-4 mr-2" />
                AI Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="automation" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Automation Rules</h3>
                  <p className="text-gray-600 dark:text-gray-400">Configure intelligent automation for your workflows</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Bot className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </div>

              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <Card key={rule.id} className="hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Switch
                              checked={rule.isActive}
                              onCheckedChange={() => toggleAutomationRule(rule.id)}
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{rule.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-4">
                            <Badge className={getImpactColor(rule.impact)}>
                              {rule.impact} impact
                            </Badge>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
                              <Progress value={rule.confidence * 100} className="w-20 h-2" />
                              <span className="text-sm font-medium">{Math.round(rule.confidence * 100)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {rule.tasksProcessed} tasks processed
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            {rule.timeSaved}min saved
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Generated Insights</h3>
                  <p className="text-gray-600 dark:text-gray-400">Intelligent analysis of your team's productivity patterns</p>
                </div>
                <Badge variant="outline">
                  {aiInsights.filter(insight => insight.actionable).length} actionable insights
                </Badge>
              </div>

              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <Card key={insight.id} className="hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="capitalize">
                                {insight.type}
                              </Badge>
                              {insight.actionable && (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                  Actionable
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
                                <Progress value={insight.confidence * 100} className="w-20 h-2" />
                                <span className="text-sm font-medium">{Math.round(insight.confidence * 100)}%</span>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Impact: {insight.impact}/10
                              </div>
                            </div>
                            
                            {insight.actionable && (
                              <Button size="sm" variant="outline">
                                Take Action
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Configuration</h3>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">AI Processing Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Real-time Analysis</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Enable continuous AI monitoring and insights</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Smart Notifications</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">AI-filtered notifications based on importance</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Predictive Analytics</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Enable project completion forecasting</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Learning Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Personalized Recommendations</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Tailor suggestions based on your work patterns</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Team Insights</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Share anonymized insights with team leads</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}