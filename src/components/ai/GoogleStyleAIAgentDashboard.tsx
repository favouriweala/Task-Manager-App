'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Target, 
  Clock, 
  Users, 
  BarChart3, 
  Lightbulb,
  Search,
  Filter,
  Settings,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Cpu,
  Database,
  Network,
  Sparkles,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Calendar,
  MessageSquare,
  FileText,
  Globe,
  Shield,
  Workflow
} from 'lucide-react'

// Enhanced interfaces for Google-style AI features
interface AIAgent {
  id: string
  name: string
  type: 'task_optimizer' | 'priority_predictor' | 'workflow_automator' | 'insight_generator' | 'collaboration_enhancer'
  status: 'active' | 'paused' | 'learning' | 'error'
  description: string
  performance: number
  tasksProcessed: number
  accuracy: number
  lastActive: string
  capabilities: string[]
  insights: AIInsight[]
  metrics: AgentMetrics
  automationRules: AutomationRule[]
}

interface AIInsight {
  id: string
  type: 'productivity' | 'optimization' | 'prediction' | 'anomaly' | 'recommendation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  timestamp: string
  actionable: boolean
  category: string
}

interface AgentMetrics {
  efficiency: number
  learningRate: number
  errorRate: number
  uptime: number
  resourceUsage: number
  predictiveAccuracy: number
}

interface AutomationRule {
  id: string
  name: string
  trigger: string
  action: string
  enabled: boolean
  executionCount: number
}

interface SmartRecommendation {
  id: string
  title: string
  description: string
  type: 'workflow' | 'priority' | 'resource' | 'collaboration'
  impact: number
  effort: number
  confidence: number
}

export function GoogleStyleAIAgentDashboard() {
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    const mockAgents: AIAgent[] = [
      {
        id: '1',
        name: 'TaskFlow Optimizer',
        type: 'task_optimizer',
        status: 'active',
        description: 'Optimizes task workflows using machine learning algorithms',
        performance: 94,
        tasksProcessed: 1247,
        accuracy: 96.8,
        lastActive: '2 minutes ago',
        capabilities: ['Task Prioritization', 'Workflow Analysis', 'Resource Allocation'],
        insights: [
          {
            id: 'i1',
            type: 'optimization',
            title: 'Workflow Bottleneck Detected',
            description: 'Review process taking 40% longer than optimal',
            impact: 'high',
            confidence: 89,
            timestamp: '5 minutes ago',
            actionable: true,
            category: 'Performance'
          }
        ],
        metrics: {
          efficiency: 94,
          learningRate: 87,
          errorRate: 3.2,
          uptime: 99.7,
          resourceUsage: 67,
          predictiveAccuracy: 91
        },
        automationRules: [
          {
            id: 'r1',
            name: 'High Priority Auto-Assignment',
            trigger: 'Task priority = High',
            action: 'Auto-assign to available team lead',
            enabled: true,
            executionCount: 156
          }
        ]
      },
      {
        id: '2',
        name: 'Priority Predictor',
        type: 'priority_predictor',
        status: 'learning',
        description: 'Predicts task priorities based on historical data and context',
        performance: 88,
        tasksProcessed: 892,
        accuracy: 92.3,
        lastActive: '1 minute ago',
        capabilities: ['Priority Prediction', 'Deadline Analysis', 'Impact Assessment'],
        insights: [
          {
            id: 'i2',
            type: 'prediction',
            title: 'Priority Shift Predicted',
            description: 'Project Alpha tasks likely to become high priority next week',
            impact: 'medium',
            confidence: 76,
            timestamp: '12 minutes ago',
            actionable: true,
            category: 'Planning'
          }
        ],
        metrics: {
          efficiency: 88,
          learningRate: 92,
          errorRate: 7.7,
          uptime: 98.9,
          resourceUsage: 54,
          predictiveAccuracy: 85
        },
        automationRules: []
      },
      {
        id: '3',
        name: 'Collaboration Enhancer',
        type: 'collaboration_enhancer',
        status: 'active',
        description: 'Enhances team collaboration through intelligent suggestions',
        performance: 91,
        tasksProcessed: 634,
        accuracy: 89.5,
        lastActive: '30 seconds ago',
        capabilities: ['Team Matching', 'Communication Optimization', 'Knowledge Sharing'],
        insights: [
          {
            id: 'i3',
            type: 'recommendation',
            title: 'Team Synergy Opportunity',
            description: 'Sarah and Mike show 85% collaboration efficiency',
            impact: 'medium',
            confidence: 82,
            timestamp: '8 minutes ago',
            actionable: true,
            category: 'Collaboration'
          }
        ],
        metrics: {
          efficiency: 91,
          learningRate: 79,
          errorRate: 10.5,
          uptime: 97.8,
          resourceUsage: 43,
          predictiveAccuracy: 88
        },
        automationRules: []
      }
    ]

    const mockRecommendations: SmartRecommendation[] = [
      {
        id: 'r1',
        title: 'Implement Sprint Planning Automation',
        description: 'Automate sprint planning based on team velocity and task complexity',
        type: 'workflow',
        impact: 85,
        effort: 60,
        confidence: 92
      },
      {
        id: 'r2',
        title: 'Optimize Resource Allocation',
        description: 'Redistribute tasks based on team member expertise and availability',
        type: 'resource',
        impact: 78,
        effort: 45,
        confidence: 87
      }
    ]

    setTimeout(() => {
      setAgents(mockAgents)
      setInsights(mockAgents.flatMap(agent => agent.insights))
      setRecommendations(mockRecommendations)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'learning': return 'bg-blue-500'
      case 'paused': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task_optimizer': return <Workflow className="w-5 h-5" />
      case 'priority_predictor': return <Target className="w-5 h-5" />
      case 'workflow_automator': return <Zap className="w-5 h-5" />
      case 'insight_generator': return <Lightbulb className="w-5 h-5" />
      case 'collaboration_enhancer': return <Users className="w-5 h-5" />
      default: return <Brain className="w-5 h-5" />
    }
  }

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* AI Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Active Agents</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {agents.filter(a => a.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                <Brain className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Tasks Processed</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {agents.reduce((sum, agent) => sum + agent.tasksProcessed, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg Accuracy</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {Math.round(agents.reduce((sum, agent) => sum + agent.accuracy, 0) / agents.length)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-full">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 dark:from-orange-900/20 dark:to-amber-900/20 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Insights Generated</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {insights.length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-full">
                <Lightbulb className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search AI agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            New Agent
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* AI Agents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg">
                        {getTypeIcon(agent.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">{agent.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{agent.status}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{agent.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Performance</span>
                      <span className="text-sm font-bold text-green-600">{agent.performance}%</span>
                    </div>
                    <Progress value={agent.performance} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Tasks Processed</p>
                      <p className="font-semibold">{agent.tasksProcessed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Accuracy</p>
                      <p className="font-semibold">{agent.accuracy}%</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 2).map((capability, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.capabilities.length - 2} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Active {agent.lastActive}
                    </span>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="space-y-4">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl">
                      {getTypeIcon(agent.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{agent.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{agent.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
                    <span className="text-sm font-medium capitalize">{agent.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{agent.metrics.efficiency}%</p>
                    <p className="text-xs text-gray-500">Efficiency</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{agent.metrics.learningRate}%</p>
                    <p className="text-xs text-gray-500">Learning Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{agent.metrics.errorRate}%</p>
                    <p className="text-xs text-gray-500">Error Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{agent.metrics.uptime}%</p>
                    <p className="text-xs text-gray-500">Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{agent.metrics.resourceUsage}%</p>
                    <p className="text-xs text-gray-500">Resource Usage</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{agent.metrics.predictiveAccuracy}%</p>
                    <p className="text-xs text-gray-500">Prediction Accuracy</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((capability, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50 dark:bg-gray-800">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      insight.impact === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                      insight.impact === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      {insight.type === 'optimization' && <TrendingUp className="w-5 h-5 text-orange-600" />}
                      {insight.type === 'prediction' && <Target className="w-5 h-5 text-blue-600" />}
                      {insight.type === 'recommendation' && <Lightbulb className="w-5 h-5 text-purple-600" />}
                      {insight.type === 'anomaly' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                      {insight.type === 'productivity' && <BarChart3 className="w-5 h-5 text-green-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{insight.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">{insight.description}</p>
                    </div>
                  </div>
                  <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                    {insight.impact} impact
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{insight.confidence}% confidence</span>
                    <span>•</span>
                    <span>{insight.timestamp}</span>
                    <span>•</span>
                    <span className="capitalize">{insight.category}</span>
                  </div>
                  {insight.actionable && (
                    <Button size="sm" variant="outline">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Take Action
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{rec.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">{rec.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {rec.type}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Impact</span>
                    <span className="text-sm font-bold text-green-600">{rec.impact}%</span>
                  </div>
                  <Progress value={rec.impact} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Effort Required</span>
                    <span className="text-sm font-bold text-orange-600">{rec.effort}%</span>
                  </div>
                  <Progress value={rec.effort} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Confidence</span>
                    <span className="text-sm font-bold text-blue-600">{rec.confidence}%</span>
                  </div>
                  <Progress value={rec.confidence} className="h-2" />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ROI Score: {Math.round((rec.impact / rec.effort) * rec.confidence / 100)}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Implement
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}