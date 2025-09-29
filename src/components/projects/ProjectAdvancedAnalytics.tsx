'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  PieChart as PieChartIcon,
  Activity,
  Clock,
  Users,
  Target,
  DollarSign,
  Award,
  Zap,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  Settings
} from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  target?: number;
  previous?: number;
  category?: string;
  color?: string;
  [key: string]: any; // Add index signature to allow additional properties
}

interface ProjectMetrics {
  velocity: ChartData[];
  burndown: ChartData[];
  quality: ChartData[];
  teamPerformance: ChartData[];
  budgetAnalysis: ChartData[];
  riskTrends: ChartData[];
  timeDistribution: ChartData[];
  satisfactionScores: ChartData[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export function ProjectAdvancedAnalytics() {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedProject, setSelectedProject] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, this would come from analytics API
  useEffect(() => {
    const mockMetrics: ProjectMetrics = {
      velocity: [
        { name: 'Week 1', value: 32, target: 35, previous: 28 },
        { name: 'Week 2', value: 38, target: 35, previous: 31 },
        { name: 'Week 3', value: 42, target: 35, previous: 35 },
        { name: 'Week 4', value: 35, target: 35, previous: 38 },
        { name: 'Week 5', value: 45, target: 35, previous: 33 },
        { name: 'Week 6', value: 41, target: 35, previous: 40 }
      ],
      burndown: [
        { name: 'Sprint Start', value: 120, target: 120 },
        { name: 'Day 3', value: 105, target: 108 },
        { name: 'Day 6', value: 88, target: 96 },
        { name: 'Day 9', value: 72, target: 84 },
        { name: 'Day 12', value: 58, target: 72 },
        { name: 'Day 15', value: 42, target: 60 },
        { name: 'Day 18', value: 28, target: 48 },
        { name: 'Day 21', value: 15, target: 36 },
        { name: 'Day 24', value: 8, target: 24 },
        { name: 'Day 27', value: 3, target: 12 },
        { name: 'Sprint End', value: 0, target: 0 }
      ],
      quality: [
        { name: 'Code Coverage', value: 87, target: 90, category: 'Testing' },
        { name: 'Bug Density', value: 2.3, target: 2.0, category: 'Quality' },
        { name: 'Tech Debt', value: 15, target: 10, category: 'Maintenance' },
        { name: 'Performance Score', value: 92, target: 95, category: 'Performance' },
        { name: 'Security Score', value: 96, target: 98, category: 'Security' }
      ],
      teamPerformance: [
        { name: 'Sarah Chen', value: 95, category: 'Lead Developer' },
        { name: 'Mike Johnson', value: 88, category: 'AI Specialist' },
        { name: 'Emma Davis', value: 92, category: 'UX Designer' },
        { name: 'Alex Rodriguez', value: 85, category: 'Mobile Lead' },
        { name: 'Lisa Wang', value: 90, category: 'Flutter Developer' },
        { name: 'David Kim', value: 87, category: 'Data Engineer' }
      ],
      budgetAnalysis: [
        { name: 'Development', value: 65000, target: 70000, category: 'Personnel' },
        { name: 'Infrastructure', value: 12000, target: 15000, category: 'Technology' },
        { name: 'Tools & Licenses', value: 8500, target: 10000, category: 'Software' },
        { name: 'Training', value: 5500, target: 8000, category: 'Education' },
        { name: 'Contingency', value: 2000, target: 5000, category: 'Buffer' }
      ],
      riskTrends: [
        { name: 'Jan', value: 15, category: 'Low Risk' },
        { name: 'Feb', value: 23, category: 'Medium Risk' },
        { name: 'Mar', value: 18, category: 'Low Risk' },
        { name: 'Apr', value: 32, category: 'High Risk' },
        { name: 'May', value: 28, category: 'Medium Risk' },
        { name: 'Jun', value: 21, category: 'Low Risk' }
      ],
      timeDistribution: [
        { name: 'Development', value: 45, color: '#3B82F6' },
        { name: 'Testing', value: 20, color: '#10B981' },
        { name: 'Meetings', value: 15, color: '#F59E0B' },
        { name: 'Planning', value: 12, color: '#8B5CF6' },
        { name: 'Documentation', value: 8, color: '#06B6D4' }
      ],
      satisfactionScores: [
        { name: 'Project Clarity', value: 4.2, target: 4.5 },
        { name: 'Team Collaboration', value: 4.6, target: 4.5 },
        { name: 'Tool Satisfaction', value: 3.8, target: 4.0 },
        { name: 'Work-Life Balance', value: 4.1, target: 4.2 },
        { name: 'Growth Opportunities', value: 4.3, target: 4.4 }
      ]
    };
    
    setMetrics(mockMetrics);
  }, [selectedTimeframe, selectedProject]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderMetricCard = (title: string, value: string | number, change: string, trend: 'up' | 'down' | 'stable', icon: React.ReactNode) => (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
          ) : trend === 'down' ? (
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />
          ) : (
            <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-1" />
          )}
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600 dark:text-green-400' :
            trend === 'down' ? 'text-red-600 dark:text-red-400' :
            'text-gray-600 dark:text-gray-400'
          }`}>
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Advanced Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive project performance insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32 bg-white dark:bg-gray-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-40 bg-white dark:bg-gray-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="zyra-ai">Zyra AI Enhancement</SelectItem>
              <SelectItem value="mobile-app">Mobile App</SelectItem>
              <SelectItem value="analytics">Analytics Dashboard</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricCard(
          'Sprint Velocity',
          '42 pts',
          '+12% vs target',
          'up',
          <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        )}
        {renderMetricCard(
          'Team Efficiency',
          '87%',
          '+5% this week',
          'up',
          <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
        )}
        {renderMetricCard(
          'Budget Utilization',
          '75%',
          'On track',
          'stable',
          <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        )}
        {renderMetricCard(
          'Quality Score',
          '8.7/10',
          '+0.3 improvement',
          'up',
          <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        )}
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="velocity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="velocity" className="text-xs">Velocity</TabsTrigger>
          <TabsTrigger value="burndown" className="text-xs">Burndown</TabsTrigger>
          <TabsTrigger value="quality" className="text-xs">Quality</TabsTrigger>
          <TabsTrigger value="team" className="text-xs">Team</TabsTrigger>
          <TabsTrigger value="budget" className="text-xs">Budget</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">Risks</TabsTrigger>
          <TabsTrigger value="time" className="text-xs">Time</TabsTrigger>
          <TabsTrigger value="satisfaction" className="text-xs">Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="velocity" className="space-y-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Sprint Velocity Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={metrics.velocity}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" name="Actual Velocity" />
                  <Line type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} name="Target" />
                  <Line type="monotone" dataKey="previous" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="Previous Period" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="burndown" className="space-y-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span>Sprint Burndown Chart</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={metrics.burndown}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="value" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Remaining Work" />
                  <Line type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} name="Ideal Burndown" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span>Quality Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={metrics.quality}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Current" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Radar name="Target" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span>Team Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={metrics.teamPerformance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span>Budget Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={metrics.budgetAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" name="Spent" />
                  <Bar dataKey="target" fill="#10B981" name="Budget" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span>Risk Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={metrics.riskTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Time Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={metrics.timeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.timeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span>Team Satisfaction Scores</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={metrics.satisfactionScores}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" name="Current Score" />
                  <Bar dataKey="target" fill="#10B981" name="Target Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}