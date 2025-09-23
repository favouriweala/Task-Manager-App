'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Brain, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Play,
  Pause,
  Settings,
  BarChart3,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';

interface AIAgent {
  id: string;
  name: string;
  type: string;
  description: string;
  isActive: boolean;
  capabilities: string[];
  performanceMetrics: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface AIAction {
  id: string;
  agentId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  suggestion: Record<string, any>;
  confidence: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  userFeedback?: string;
  createdAt: string;
  expiresAt: string;
  ai_agents?: {
    name: string;
    type: string;
    description: string;
  };
}

interface AgentMetrics {
  totalActions: number;
  acceptanceRate: number;
  rejectionRate: number;
  pendingActions: number;
  expiredActions: number;
  averageConfidence: number;
  lastActivity: string | null;
}

export function AIAgentDashboard() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [actions, setActions] = useState<AIAction[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAgents();
    fetchActions();
    fetchMetrics();
  }, [fetchAgents, fetchActions, fetchMetrics]);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/ai-agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchActions = async () => {
    try {
      const response = await fetch('/api/ai-agents?action=actions&limit=20');
      if (response.ok) {
        const data = await response.json();
        setActions(data.actions || []);
      }
    } catch (error) {
      console.error('Error fetching actions:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/ai-agents?action=metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const runSimilarityAnalysis = async () => {
    setRunningAnalysis(true);
    try {
      const response = await fetch('/api/ai-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_similarity_analysis' }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Analysis completed! ${data.suggestions} new suggestions created.`);
        fetchActions();
        fetchMetrics();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error running analysis:', error);
      alert('Failed to run analysis');
    } finally {
      setRunningAnalysis(false);
    }
  };

  const handleSuggestion = async (actionId: string, action: 'accept' | 'reject', feedback?: string) => {
    try {
      const response = await fetch('/api/ai-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `${action}_suggestion`,
          actionId,
          userFeedback: feedback,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchActions();
        fetchMetrics();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing suggestion:`, error);
      alert(`Failed to ${action} suggestion`);
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'similarity_analyzer': return <Brain className="h-5 w-5" />;
      case 'project_merger': return <Zap className="h-5 w-5" />;
      case 'task_optimizer': return <TrendingUp className="h-5 w-5" />;
      default: return <Bot className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your AI agents and their suggestions
          </p>
        </div>
        
        <Button 
          onClick={runSimilarityAnalysis} 
          disabled={runningAnalysis}
          className="flex items-center gap-2"
        >
          {runningAnalysis ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Running Analysis...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Similarity Analysis
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agents.filter(a => a.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {agents.length} total agents
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Suggestions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {actions.filter(a => a.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  awaiting your review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? `${(metrics.acceptanceRate * 100).toFixed(1)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  of all suggestions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? `${(metrics.averageConfidence * 100).toFixed(1)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  AI confidence level
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Suggestions</CardTitle>
              <CardDescription>
                Latest recommendations from your AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {actions.slice(0, 5).map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(action.status)}`} />
                      <div>
                        <p className="font-medium">{action.ai_agents?.name || 'AI Agent'}</p>
                        <p className="text-sm text-muted-foreground">
                          {action.actionType.replace('_', ' ')} • {formatDistanceToNow(new Date(action.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getConfidenceColor(action.confidence)}>
                        {(action.confidence * 100).toFixed(0)}%
                      </Badge>
                      {action.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuggestion(action.id, 'accept')}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuggestion(action.id, 'reject')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAgentIcon(agent.type)}
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                    </div>
                    <Badge variant={agent.isActive ? 'default' : 'secondary'}>
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Capabilities</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.map((capability, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {agent.performanceMetrics && (
                      <div>
                        <p className="text-sm font-medium mb-1">Performance</p>
                        <div className="text-xs text-muted-foreground">
                          Acceptance: {agent.performanceMetrics.acceptanceRate || 0} • 
                          Rejection: {agent.performanceMetrics.rejectionRate || 0}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <ScrollArea className="h-[600px]">
            {actions.map((action) => (
              <Card key={action.id} className="mb-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(action.status)}`} />
                      <CardTitle className="text-lg">
                        {action.ai_agents?.name || 'AI Agent'}
                      </CardTitle>
                      <Badge variant="outline" className={getConfidenceColor(action.confidence)}>
                        {(action.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                    <Badge variant="outline">
                      {action.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {action.actionType.replace('_', ' ')} • {formatDistanceToNow(new Date(action.createdAt), { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {action.suggestion && (
                      <div>
                        <p className="text-sm font-medium mb-2">Suggestion Details</p>
                        <div className="bg-muted p-3 rounded-lg text-sm">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(action.suggestion, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {action.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSuggestion(action.id, 'accept')}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Suggestion
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleSuggestion(action.id, 'reject')}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Suggestion
                        </Button>
                      </div>
                    )}
                    
                    {action.userFeedback && (
                      <div>
                        <p className="text-sm font-medium mb-1">Your Feedback</p>
                        <p className="text-sm text-muted-foreground">{action.userFeedback}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Acceptance Rate</span>
                      <span>{(metrics.acceptanceRate * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.acceptanceRate * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Confidence</span>
                      <span>{(metrics.averageConfidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.averageConfidence * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Actions</span>
                    <span className="font-medium">{metrics.totalActions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pending Actions</span>
                    <span className="font-medium">{metrics.pendingActions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Expired Actions</span>
                    <span className="font-medium">{metrics.expiredActions}</span>
                  </div>
                  {metrics.lastActivity && (
                    <div className="flex justify-between">
                      <span className="text-sm">Last Activity</span>
                      <span className="font-medium text-xs">
                        {formatDistanceToNow(new Date(metrics.lastActivity), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}