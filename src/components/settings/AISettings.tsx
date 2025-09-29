'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Brain, 
  Zap, 
  Settings, 
  Sparkles, 
  Target, 
  Clock, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Calendar, 
  BarChart3, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Globe, 
  Shield, 
  Database, 
  Cpu, 
  Activity, 
  Workflow, 
  Filter, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  ChevronRight,
  RefreshCw,
  Eye,
  XCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

interface AISettings {
  assistant: {
    enabled: boolean;
    model: 'gpt-4' | 'claude-3' | 'gemini-pro';
    creativity: number;
    responseLength: 'concise' | 'balanced' | 'detailed';
    personality: 'professional' | 'friendly' | 'casual';
  };
  automation: {
    smartScheduling: boolean;
    autoTaskCreation: boolean;
    intelligentPrioritization: boolean;
    predictiveDeadlines: boolean;
    autoTagging: boolean;
    duplicateDetection: boolean;
  };
  insights: {
    productivityAnalytics: boolean;
    performancePredictions: boolean;
    workloadOptimization: boolean;
    burnoutPrevention: boolean;
    teamInsights: boolean;
    customReports: boolean;
  };
  privacy: {
    dataProcessing: boolean;
    personalizedRecommendations: boolean;
    usageAnalytics: boolean;
    shareWithTeam: boolean;
    retentionPeriod: number;
  };
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused' | 'draft';
  lastRun: string;
  executions: number;
}

interface AIInsight {
  id: string;
  type: 'productivity' | 'workload' | 'deadline' | 'collaboration';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export function AISettings() {
  const [activeTab, setActiveTab] = useState('assistant');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [aiSettings, setAISettings] = useState<AISettings>({
    assistant: {
      enabled: true,
      model: 'gpt-4',
      creativity: 70,
      responseLength: 'balanced',
      personality: 'professional',
    },
    automation: {
      smartScheduling: true,
      autoTaskCreation: true,
      intelligentPrioritization: true,
      predictiveDeadlines: false,
      autoTagging: true,
      duplicateDetection: true,
    },
    insights: {
      productivityAnalytics: true,
      performancePredictions: true,
      workloadOptimization: true,
      burnoutPrevention: true,
      teamInsights: false,
      customReports: false,
    },
    privacy: {
      dataProcessing: true,
      personalizedRecommendations: true,
      usageAnalytics: true,
      shareWithTeam: false,
      retentionPeriod: 90,
    },
  });

  const [automationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'High Priority Task Alert',
      description: 'Automatically notify team when high-priority tasks are created',
      trigger: 'Task priority = High',
      action: 'Send Slack notification',
      status: 'active',
      lastRun: '2 hours ago',
      executions: 47,
    },
    {
      id: '2',
      name: 'Deadline Reminder',
      description: 'Send reminders 24 hours before task deadlines',
      trigger: 'Task due in 24 hours',
      action: 'Send email reminder',
      status: 'active',
      lastRun: '6 hours ago',
      executions: 156,
    },
    {
      id: '3',
      name: 'Auto-assign Bug Reports',
      description: 'Automatically assign bug reports to available developers',
      trigger: 'Task contains "bug" tag',
      action: 'Assign to developer',
      status: 'paused',
      lastRun: '2 days ago',
      executions: 23,
    },
  ]);

  const [aiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'productivity',
      title: 'Peak Productivity Hours',
      description: 'You\'re most productive between 9-11 AM. Consider scheduling important tasks during this time.',
      confidence: 87,
      impact: 'high',
      actionable: true,
    },
    {
      id: '2',
      type: 'workload',
      title: 'Workload Distribution',
      description: 'Your workload is 23% higher than team average. Consider delegating some tasks.',
      confidence: 92,
      impact: 'medium',
      actionable: true,
    },
    {
      id: '3',
      type: 'deadline',
      title: 'Deadline Risk',
      description: '3 tasks are at risk of missing deadlines based on current progress.',
      confidence: 78,
      impact: 'high',
      actionable: true,
    },
    {
      id: '4',
      type: 'collaboration',
      title: 'Team Collaboration',
      description: 'Increased collaboration with design team has improved project completion by 15%.',
      confidence: 85,
      impact: 'medium',
      actionable: false,
    },
  ]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'productivity':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'workload':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      case 'deadline':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'collaboration':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Impact</Badge>;
      case 'medium':
        return <Badge variant="default" className="text-xs bg-orange-100 text-orange-800">Medium Impact</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Low Impact</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Paused</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Draft</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* AI Assistant Tab */}
        <TabsContent value="assistant" className="space-y-6">
          {/* AI Assistant Settings */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-500" />
                AI Assistant Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">AI Assistant Enabled</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Get intelligent help with task management and productivity</p>
                  </div>
                </div>
                <Switch
                  checked={aiSettings.assistant.enabled}
                  onCheckedChange={(checked) => setAISettings({
                    ...aiSettings,
                    assistant: { ...aiSettings.assistant, enabled: checked }
                  })}
                />
              </div>

              {aiSettings.assistant.enabled && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>AI Model</Label>
                    <Select
                      value={aiSettings.assistant.model}
                      onValueChange={(value: 'gpt-4' | 'claude-3' | 'gemini-pro') => setAISettings({
                        ...aiSettings,
                        assistant: { ...aiSettings.assistant, model: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4 (Most Capable)</SelectItem>
                        <SelectItem value="claude-3">Claude 3 (Best for Analysis)</SelectItem>
                        <SelectItem value="gemini-pro">Gemini Pro (Fastest)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Response Style</Label>
                    <Select
                      value={aiSettings.assistant.personality}
                      onValueChange={(value: 'professional' | 'friendly' | 'casual') => setAISettings({
                        ...aiSettings,
                        assistant: { ...aiSettings.assistant, personality: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Response Length</Label>
                    <Select
                      value={aiSettings.assistant.responseLength}
                      onValueChange={(value: 'concise' | 'balanced' | 'detailed') => setAISettings({
                        ...aiSettings,
                        assistant: { ...aiSettings.assistant, responseLength: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concise">Concise</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Creativity Level: {aiSettings.assistant.creativity}%</Label>
                    <Slider
                      value={[aiSettings.assistant.creativity]}
                      onValueChange={(value) => setAISettings({
                        ...aiSettings,
                        assistant: { ...aiSettings.assistant, creativity: value[0] }
                      })}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Conservative</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: <MessageSquare className="h-5 w-5 text-blue-500" />, title: 'Smart Suggestions', desc: 'Get intelligent task and project suggestions' },
                  { icon: <Calendar className="h-5 w-5 text-green-500" />, title: 'Schedule Optimization', desc: 'AI-powered calendar and deadline management' },
                  { icon: <Target className="h-5 w-5 text-red-500" />, title: 'Goal Tracking', desc: 'Intelligent progress monitoring and insights' },
                  { icon: <Workflow className="h-5 w-5 text-purple-500" />, title: 'Process Automation', desc: 'Automate repetitive workflows and tasks' },
                  { icon: <BarChart3 className="h-5 w-5 text-orange-500" />, title: 'Analytics', desc: 'Deep insights into productivity patterns' },
                  { icon: <Lightbulb className="h-5 w-5 text-yellow-500" />, title: 'Smart Recommendations', desc: 'Personalized productivity recommendations' },
                ].map((capability, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      {capability.icon}
                      <h4 className="font-medium text-gray-900 dark:text-white">{capability.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{capability.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          {/* Automation Settings */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Smart Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Smart Scheduling</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered task scheduling optimization</p>
                  </div>
                  <Switch
                    checked={aiSettings.automation.smartScheduling}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      automation: { ...aiSettings.automation, smartScheduling: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Auto Task Creation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create tasks from emails and messages</p>
                  </div>
                  <Switch
                    checked={aiSettings.automation.autoTaskCreation}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      automation: { ...aiSettings.automation, autoTaskCreation: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Intelligent Prioritization</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI-based task priority suggestions</p>
                  </div>
                  <Switch
                    checked={aiSettings.automation.intelligentPrioritization}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      automation: { ...aiSettings.automation, intelligentPrioritization: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Predictive Deadlines</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI-suggested realistic deadlines</p>
                  </div>
                  <Switch
                    checked={aiSettings.automation.predictiveDeadlines}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      automation: { ...aiSettings.automation, predictiveDeadlines: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Auto Tagging</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automatically tag tasks based on content</p>
                  </div>
                  <Switch
                    checked={aiSettings.automation.autoTagging}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      automation: { ...aiSettings.automation, autoTagging: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Duplicate Detection</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Detect and merge duplicate tasks</p>
                  </div>
                  <Switch
                    checked={aiSettings.automation.duplicateDetection}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      automation: { ...aiSettings.automation, duplicateDetection: checked }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automation Rules */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-green-500" />
                  Automation Rules ({automationRules.length})
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Workflow className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{rule.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(rule.status)}
                        <Button variant="outline" size="sm">
                          {rule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">When:</span>
                        <Badge variant="outline">{rule.trigger}</Badge>
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-500">Then:</span>
                        <Badge variant="outline">{rule.action}</Badge>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Last run: {rule.lastRun}</span>
                        <span>{rule.executions} executions</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {/* Insights Settings */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Productivity Analytics</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track and analyze productivity patterns</p>
                  </div>
                  <Switch
                    checked={aiSettings.insights.productivityAnalytics}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      insights: { ...aiSettings.insights, productivityAnalytics: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Performance Predictions</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI predictions for project outcomes</p>
                  </div>
                  <Switch
                    checked={aiSettings.insights.performancePredictions}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      insights: { ...aiSettings.insights, performancePredictions: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Workload Optimization</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Smart workload distribution suggestions</p>
                  </div>
                  <Switch
                    checked={aiSettings.insights.workloadOptimization}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      insights: { ...aiSettings.insights, workloadOptimization: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Burnout Prevention</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Early warning system for overwork</p>
                  </div>
                  <Switch
                    checked={aiSettings.insights.burnoutPrevention}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      insights: { ...aiSettings.insights, burnoutPrevention: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Team Insights</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Collaborative analytics and insights</p>
                  </div>
                  <Switch
                    checked={aiSettings.insights.teamInsights}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      insights: { ...aiSettings.insights, teamInsights: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Custom Reports</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI-generated custom analytics reports</p>
                  </div>
                  <Switch
                    checked={aiSettings.insights.customReports}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      insights: { ...aiSettings.insights, customReports: checked }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Insights */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Current AI Insights
                </CardTitle>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getInsightIcon(insight.type)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getImpactBadge(insight.impact)}
                        {insight.actionable && (
                          <Button variant="outline" size="sm">
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <Progress value={insight.confidence} className="w-20 h-2" />
                      <span className="text-xs text-gray-500">{insight.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          {/* Privacy Settings */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                AI Privacy & Data Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Data Processing Notice</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      AI features require processing your task data to provide intelligent insights and automation. 
                      All data is processed securely and never shared with third parties.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Allow AI Data Processing</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable AI to analyze your data for insights</p>
                  </div>
                  <Switch
                    checked={aiSettings.privacy.dataProcessing}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      privacy: { ...aiSettings.privacy, dataProcessing: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Personalized Recommendations</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Use your data to provide personalized suggestions</p>
                  </div>
                  <Switch
                    checked={aiSettings.privacy.personalizedRecommendations}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      privacy: { ...aiSettings.privacy, personalizedRecommendations: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Usage Analytics</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Collect anonymous usage data to improve AI features</p>
                  </div>
                  <Switch
                    checked={aiSettings.privacy.usageAnalytics}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      privacy: { ...aiSettings.privacy, usageAnalytics: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Share Insights with Team</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Allow team members to see aggregated insights</p>
                  </div>
                  <Switch
                    checked={aiSettings.privacy.shareWithTeam}
                    onCheckedChange={(checked) => setAISettings({
                      ...aiSettings,
                      privacy: { ...aiSettings.privacy, shareWithTeam: checked }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Retention Period (days)</Label>
                  <Select
                    value={aiSettings.privacy.retentionPeriod.toString()}
                    onValueChange={(value) => setAISettings({
                      ...aiSettings,
                      privacy: { ...aiSettings.privacy, retentionPeriod: parseInt(value) }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="0">Keep indefinitely</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-500" />
                AI Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="font-medium">View AI Data</div>
                    <div className="text-xs text-gray-500">See what data AI uses</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <RefreshCw className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="font-medium">Reset AI Learning</div>
                    <div className="text-xs text-gray-500">Clear personalization data</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 border-red-200 hover:bg-red-50">
                  <div className="text-center">
                    <XCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                    <div className="font-medium text-red-600">Delete AI Data</div>
                    <div className="text-xs text-red-500">Permanently remove data</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Changes */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save AI Settings</Button>
      </div>
    </div>
  );
}