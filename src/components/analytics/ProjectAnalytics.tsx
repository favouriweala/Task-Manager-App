'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Calendar,
  Download,
  RefreshCw,
  Target,
  Zap,
  Brain,
  Activity,
  PieChart,
  LineChart,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Shield,
  Globe,
  Workflow,
  Timer,
  Star,
  Award,
  Flame
} from 'lucide-react';

interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  teamProductivity: number;
  burndownRate: number;
  velocityTrend: number;
  qualityScore: number;
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  tasksCompleted: number;
  productivity: number;
  efficiency: number;
  collaboration: number;
}

interface ProjectInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'critical';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  confidence: number;
}

export function ProjectAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real implementation, this would come from API
  const [metrics] = useState<ProjectMetrics>({
    totalTasks: 247,
    completedTasks: 189,
    inProgressTasks: 42,
    overdueTasks: 16,
    completionRate: 76.5,
    averageCompletionTime: 3.2,
    teamProductivity: 87.3,
    burndownRate: 12.4,
    velocityTrend: 8.7,
    qualityScore: 94.2
  });

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: '/avatars/sarah.jpg',
      role: 'Senior Developer',
      tasksCompleted: 34,
      productivity: 92,
      efficiency: 88,
      collaboration: 95
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      avatar: '/avatars/marcus.jpg',
      role: 'Product Manager',
      tasksCompleted: 28,
      productivity: 89,
      efficiency: 91,
      collaboration: 87
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      avatar: '/avatars/elena.jpg',
      role: 'UX Designer',
      tasksCompleted: 31,
      productivity: 85,
      efficiency: 89,
      collaboration: 93
    }
  ]);

  const [insights] = useState<ProjectInsight[]>([
    {
      id: '1',
      type: 'success',
      title: 'Velocity Acceleration',
      description: 'Team velocity has increased by 23% over the last sprint, indicating improved workflow efficiency.',
      impact: 'high',
      actionable: false,
      confidence: 94
    },
    {
      id: '2',
      type: 'warning',
      title: 'Resource Bottleneck Detected',
      description: 'Code review process is creating a 2-day average delay. Consider adding more reviewers.',
      impact: 'medium',
      actionable: true,
      confidence: 87
    },
    {
      id: '3',
      type: 'info',
      title: 'Collaboration Pattern',
      description: 'Cross-functional collaboration has improved by 15% with the new daily sync meetings.',
      impact: 'medium',
      actionable: false,
      confidence: 91
    },
    {
      id: '4',
      type: 'critical',
      title: 'Deadline Risk Alert',
      description: 'Current velocity suggests 3 high-priority tasks may miss their deadlines without intervention.',
      impact: 'high',
      actionable: true,
      confidence: 89
    }
  ]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInsightBadge = (type: string) => {
    switch (type) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Success</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Warning</Badge>;
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Info</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Project Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Comprehensive insights and performance metrics
                </p>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48"
              />
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="web-app">Web Application</SelectItem>
                <SelectItem value="mobile-app">Mobile App</SelectItem>
                <SelectItem value="api-service">API Service</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.completionRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">+5.2% from last month</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Productivity</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.teamProductivity}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-600">+8.7% velocity increase</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality Score</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.qualityScore}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-purple-500" />
                    <span className="text-xs text-purple-600">Excellent quality</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Completion Time</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.averageCompletionTime}d</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowDownRight className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-orange-600">-0.8d improvement</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                  <Timer className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="team">Team Analytics</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Distribution */}
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-500" />
                    Task Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Completed</span>
                      </div>
                      <span className="font-medium">{metrics.completedTasks}</span>
                    </div>
                    <Progress value={(metrics.completedTasks / metrics.totalTasks) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">In Progress</span>
                      </div>
                      <span className="font-medium">{metrics.inProgressTasks}</span>
                    </div>
                    <Progress value={(metrics.inProgressTasks / metrics.totalTasks) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Overdue</span>
                      </div>
                      <span className="font-medium">{metrics.overdueTasks}</span>
                    </div>
                    <Progress value={(metrics.overdueTasks / metrics.totalTasks) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Velocity Trend */}
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-green-500" />
                    Velocity Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Sprint</span>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-bold text-orange-600">42 points</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Previous Sprint</span>
                      <span className="font-medium">38 points</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average</span>
                      <span className="font-medium">35 points</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">+{metrics.velocityTrend}% improvement</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Timeline */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-500" />
                  Project Timeline & Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'MVP Release', date: '2024-02-15', status: 'completed', progress: 100 },
                    { name: 'Beta Testing', date: '2024-03-01', status: 'in-progress', progress: 75 },
                    { name: 'Production Deploy', date: '2024-03-15', status: 'upcoming', progress: 25 },
                    { name: 'Post-Launch Review', date: '2024-04-01', status: 'upcoming', progress: 0 }
                  ].map((milestone, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{milestone.name}</span>
                          <span className="text-sm text-gray-500">{milestone.date}</span>
                        </div>
                        <Progress value={milestone.progress} className="h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Burndown Rate</span>
                        <span className="text-sm text-gray-500">{metrics.burndownRate}%</span>
                      </div>
                      <Progress value={metrics.burndownRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Code Quality</span>
                        <span className="text-sm text-gray-500">{metrics.qualityScore}%</span>
                      </div>
                      <Progress value={metrics.qualityScore} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Team Efficiency</span>
                        <span className="text-sm text-gray-500">{metrics.teamProductivity}%</span>
                      </div>
                      <Progress value={metrics.teamProductivity} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-purple-500" />
                    Workflow Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { stage: 'Planning', time: '2.3 days', efficiency: 85 },
                      { stage: 'Development', time: '5.7 days', efficiency: 92 },
                      { stage: 'Review', time: '1.8 days', efficiency: 78 },
                      { stage: 'Testing', time: '2.1 days', efficiency: 88 }
                    ].map((stage, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                        <div>
                          <span className="font-medium">{stage.stage}</span>
                          <p className="text-xs text-gray-500">Avg: {stage.time}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">{stage.efficiency}%</span>
                          <Progress value={stage.efficiency} className="w-16 h-1 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Analytics Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Team Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{member.tasksCompleted} tasks</p>
                          <p className="text-sm text-gray-500">completed</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs">Productivity</span>
                            <span className="text-xs">{member.productivity}%</span>
                          </div>
                          <Progress value={member.productivity} className="h-1" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs">Efficiency</span>
                            <span className="text-xs">{member.efficiency}%</span>
                          </div>
                          <Progress value={member.efficiency} className="h-1" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs">Collaboration</span>
                            <span className="text-xs">{member.collaboration}%</span>
                          </div>
                          <Progress value={member.collaboration} className="h-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getInsightIcon(insight.type)}
                          <div>
                            <h4 className="font-medium">{insight.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getInsightBadge(insight.type)}
                          {insight.actionable && (
                            <Button variant="outline" size="sm">
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>{insight.impact} impact</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          <span>{insight.confidence}% confidence</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Predictive Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Project Completion</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Estimated completion: March 18, 2024</p>
                      <div className="mt-2">
                        <Progress value={78} className="h-2" />
                        <p className="text-xs text-blue-600 mt-1">78% confidence</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100">Resource Optimization</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">Can reduce timeline by 5 days with current velocity</p>
                      <div className="mt-2">
                        <Progress value={85} className="h-2" />
                        <p className="text-xs text-green-600 mt-1">85% confidence</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <h4 className="font-medium text-orange-900 dark:text-orange-100">Risk Assessment</h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">Low risk of scope creep based on current patterns</p>
                      <div className="mt-2">
                        <Progress value={92} className="h-2" />
                        <p className="text-xs text-orange-600 mt-1">92% confidence</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-indigo-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Increase Code Review Capacity',
                        description: 'Add 2 more reviewers to reduce bottleneck',
                        priority: 'high',
                        impact: '+15% velocity'
                      },
                      {
                        title: 'Optimize Daily Standups',
                        description: 'Reduce meeting time by focusing on blockers',
                        priority: 'medium',
                        impact: '+2 hours/week'
                      },
                      {
                        title: 'Implement Pair Programming',
                        description: 'For complex features to improve quality',
                        priority: 'low',
                        impact: '+8% quality score'
                      }
                    ].map((rec, index) => (
                      <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{rec.description}</p>
                        <p className="text-xs font-medium text-green-600">{rec.impact}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}