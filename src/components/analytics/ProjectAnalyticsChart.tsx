'use client';

import React from 'react';
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
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FolderOpen, 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Target
} from 'lucide-react';

interface ProjectData {
  id: string;
  name: string;
  tasksTotal: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
  teamMembers: number;
  timeSpent: number;
  deadline: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'delayed';
}

interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overallProgress: number;
  totalTasks: number;
  completedTasks: number;
}

interface ProjectAnalyticsChartProps {
  data?: ProjectData[];
  timeRange: string;
  className?: string;
}

const STATUS_COLORS = {
  'on-track': '#10B981',
  'at-risk': '#F59E0B',
  'delayed': '#EF4444'
};

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function ProjectAnalyticsChart({ data, timeRange, className }: ProjectAnalyticsChartProps) {
  // Mock data if none provided
  const mockProjects: ProjectData[] = [
    {
      id: '1',
      name: 'Task Manager App',
      tasksTotal: 45,
      tasksCompleted: 32,
      tasksInProgress: 8,
      tasksPending: 5,
      teamMembers: 5,
      timeSpent: 1200,
      deadline: '2024-02-15',
      progress: 71,
      status: 'on-track'
    },
    {
      id: '2',
      name: 'Website Redesign',
      tasksTotal: 28,
      tasksCompleted: 18,
      tasksInProgress: 6,
      tasksPending: 4,
      teamMembers: 3,
      timeSpent: 800,
      deadline: '2024-01-30',
      progress: 64,
      status: 'at-risk'
    },
    {
      id: '3',
      name: 'Mobile App',
      tasksTotal: 35,
      tasksCompleted: 15,
      tasksInProgress: 12,
      tasksPending: 8,
      teamMembers: 4,
      timeSpent: 600,
      deadline: '2024-03-01',
      progress: 43,
      status: 'delayed'
    },
    {
      id: '4',
      name: 'API Development',
      tasksTotal: 22,
      tasksCompleted: 20,
      tasksInProgress: 2,
      tasksPending: 0,
      teamMembers: 2,
      timeSpent: 950,
      deadline: '2024-01-20',
      progress: 91,
      status: 'on-track'
    },
    {
      id: '5',
      name: 'Documentation',
      tasksTotal: 15,
      tasksCompleted: 12,
      tasksInProgress: 2,
      tasksPending: 1,
      teamMembers: 2,
      timeSpent: 300,
      deadline: '2024-02-01',
      progress: 80,
      status: 'on-track'
    }
  ];

  const projectData = data || mockProjects;

  // Calculate metrics
  const metrics: ProjectMetrics = {
    totalProjects: projectData.length,
    activeProjects: projectData.filter(p => p.progress < 100).length,
    completedProjects: projectData.filter(p => p.progress === 100).length,
    overallProgress: projectData.reduce((sum, p) => sum + p.progress, 0) / projectData.length,
    totalTasks: projectData.reduce((sum, p) => sum + p.tasksTotal, 0),
    completedTasks: projectData.reduce((sum, p) => sum + p.tasksCompleted, 0)
  };

  // Prepare chart data
  const progressData = projectData.map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    progress: project.progress,
    completed: project.tasksCompleted,
    total: project.tasksTotal,
    status: project.status
  }));

  const statusDistribution = [
    { name: 'On Track', value: projectData.filter(p => p.status === 'on-track').length, color: STATUS_COLORS['on-track'] },
    { name: 'At Risk', value: projectData.filter(p => p.status === 'at-risk').length, color: STATUS_COLORS['at-risk'] },
    { name: 'Delayed', value: projectData.filter(p => p.status === 'delayed').length, color: STATUS_COLORS['delayed'] }
  ].filter(item => item.value > 0);

  const timeSpentData = projectData.map(project => ({
    name: project.name.length > 12 ? project.name.substring(0, 12) + '...' : project.name,
    time: project.timeSpent,
    tasks: project.tasksCompleted
  }));

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'at-risk':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'delayed':
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'default';
      case 'at-risk':
        return 'secondary';
      case 'delayed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Project Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.totalProjects}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-green-600">{metrics.activeProjects}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.overallProgress.toFixed(0)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Task Completion</p>
                <p className="text-2xl font-bold text-orange-600">
                  {((metrics.completedTasks / metrics.totalTasks) * 100).toFixed(0)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <CardTitle>Project Progress Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'progress' ? `${value}%` : value,
                  name === 'progress' ? 'Progress' : name === 'completed' ? 'Completed Tasks' : 'Total Tasks'
                ]}
              />
              <Bar 
                dataKey="progress" 
                name="Progress"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle>Project Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                                    <Pie            
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                {statusDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <Badge variant="outline">
                      {item.value} project{item.value !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Spent by Project */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <CardTitle>Time Investment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSpentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tickFormatter={formatTime}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'time' ? formatTime(value) : value,
                    name === 'time' ? 'Time Spent' : 'Tasks Completed'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="time" 
                  name="Time"
                  stroke="#10B981" 
                  fill="#10B981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project Details List */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectData.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    {getStatusIcon(project.status)}
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className="font-medium">{new Date(project.deadline).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={project.progress} className="flex-1" />
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Tasks</p>
                    <p className="font-medium">
                      {project.tasksCompleted}/{project.tasksTotal}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Team Size</p>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{project.teamMembers}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Time Spent</p>
                    <p className="font-medium">{formatTime(project.timeSpent)}</p>
                  </div>
                </div>

                <div className="flex space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Completed: {project.tasksCompleted}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>In Progress: {project.tasksInProgress}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>Pending: {project.tasksPending}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}