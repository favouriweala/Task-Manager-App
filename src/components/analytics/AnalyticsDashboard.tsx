'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { TaskMetricsChart } from './TaskMetricsChart';
import { ProductivityChart } from './ProductivityChart';
import { TimeTrackingChart } from './TimeTrackingChart';
import { ProjectAnalyticsChart } from './ProjectAnalyticsChart';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const { 
    data, 
    loading: isLoading, 
    error, 
    refetch: refreshMetrics
  } = useAnalytics({ timeRange, projectId: selectedProject === 'all' ? undefined : selectedProject });

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log('Exporting analytics data...');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load analytics data</p>
            <Button onClick={refreshMetrics} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header Controls - Zyra Design System */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zyra-text-primary">📊 Performance Analytics</h2>
          <p className="text-zyra-text-secondary">Comprehensive insights into your productivity patterns</p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:flex-wrap sm:items-center sm:space-y-0 gap-3">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as '24h' | '7d' | '30d' | '90d')}>
            <SelectTrigger className="w-full sm:w-40 bg-zyra-surface border-zyra-border hover:border-zyra-primary/50 focus:border-zyra-primary focus:ring-2 focus:ring-zyra-primary/20">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-zyra-surface border-zyra-border shadow-zyra-lg">
              <SelectItem value="7d">📅 Last 7 days</SelectItem>
              <SelectItem value="30d">📊 Last 30 days</SelectItem>
              <SelectItem value="90d">📈 Last 90 days</SelectItem>
              <SelectItem value="1y">🗓️ Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={refreshMetrics}
            disabled={isLoading}
            className="flex items-center gap-2 bg-zyra-surface border-zyra-border hover:bg-zyra-primary/5 hover:border-zyra-primary/50 text-zyra-text-primary w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>🔄 Refresh</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportData}
            className="flex items-center gap-2 bg-zyra-surface border-zyra-border hover:bg-zyra-success/5 hover:border-zyra-success/50 text-zyra-text-primary w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            <span>📥 Export</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Key Metrics Cards - Mobile-first responsive design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-200 shadow-mobile touch-manipulation">
          <CardContent className="mobile-padding sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-responsive-xs font-medium text-green-700 dark:text-green-300">✅ Tasks Completed</p>
                <p className="text-responsive-lg sm:text-3xl font-bold text-green-900 dark:text-green-100">
                  {data?.overview?.completedTasks || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-200 dark:bg-green-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <Badge variant={data?.trends?.tasksCompletedTrend && data.trends.tasksCompletedTrend > 0 ? 'default' : 'secondary'} className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-responsive-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {data?.overview?.completionRate || 0}% completion rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200 shadow-mobile touch-manipulation">
          <CardContent className="mobile-padding sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-responsive-xs font-medium text-blue-700 dark:text-blue-300">⏰ Time Logged</p>
                <p className="text-responsive-lg sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {Math.round((data?.overview?.totalTimeLogged || 0) / 60)}h
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-200 dark:bg-blue-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300 text-responsive-xs">
                {data?.overview?.averageTimePerTask || 0}min avg per task
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-200 shadow-mobile touch-manipulation">
          <CardContent className="mobile-padding sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-responsive-xs font-medium text-purple-700 dark:text-purple-300">📊 Active Projects</p>
                <p className="text-responsive-lg sm:text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {data?.projectStats?.length || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-200 dark:bg-purple-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300 text-responsive-xs">
                {data?.overview?.totalTasks || 0} total tasks
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-200 shadow-mobile touch-manipulation">
          <CardContent className="mobile-padding sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-responsive-xs font-medium text-orange-700 dark:text-orange-300">👥 Team Members</p>
                <p className="text-responsive-lg sm:text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {data?.userStats?.length || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-200 dark:bg-orange-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <Badge variant="outline" className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300 text-responsive-xs">
                {data?.userStats?.filter(user => user.isActive)?.length || 0} active this week
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts and Detailed Analytics - Mobile-first responsive design */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-mobile overflow-hidden">
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-transparent h-auto p-0">
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 py-3 sm:py-4 text-responsive-xs touch-manipulation"
              >
                📊 Overview
              </TabsTrigger>
              <TabsTrigger 
                value="productivity"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 py-3 sm:py-4 text-responsive-xs touch-manipulation"
              >
                🚀 Productivity
              </TabsTrigger>
              <TabsTrigger 
                value="time-tracking"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 py-3 sm:py-4 text-responsive-xs touch-manipulation"
              >
                ⏰ Time
              </TabsTrigger>
              <TabsTrigger 
                value="projects"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 py-3 sm:py-4 text-responsive-xs touch-manipulation"
              >
                📁 Projects
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mobile-padding sm:p-6">
            <TabsContent value="overview" className="mt-0 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 mobile-padding sm:p-6 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800">
                  <TaskMetricsChart 
                    data={data?.dailyStats?.map(item => ({
                      date: item.date,
                      completed: item.tasksCompleted,
                      created: item.tasksCreated,
                      inProgress: 0,
                      overdue: 0
                    }))} 
                    timeRange={timeRange}
                  />
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 mobile-padding sm:p-6 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800">
                  <ProductivityChart 
                    data={data?.dailyStats?.map(item => ({
                      date: item.date,
                      tasksCompleted: item.tasksCompleted,
                      timeLogged: item.timeLogged,
                      focusTime: item.timeLogged * 0.8,
                      efficiency: item.productivity
                    }))} 
                    timeRange={timeRange}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="productivity" className="mt-0">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 mobile-padding sm:p-6 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800">
                <ProductivityChart 
                  data={data?.dailyStats?.map(item => ({
                    date: item.date,
                    tasksCompleted: item.tasksCompleted,
                    timeLogged: item.timeLogged,
                    focusTime: item.timeLogged * 0.8,
                    efficiency: item.productivity
                  }))} 
                  timeRange={timeRange}
                  detailed={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="time-tracking" className="mt-0">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 mobile-padding sm:p-6 rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-800">
                <TimeTrackingChart 
                  data={data?.dailyStats?.map(item => ({
                    date: item.date,
                    totalTime: item.timeLogged,
                    focusTime: item.timeLogged * 0.8,
                    breakTime: item.timeLogged * 0.1,
                    meetings: item.timeLogged * 0.1
                  }))} 
                  timeRange={timeRange}
                />
              </div>
            </TabsContent>

            <TabsContent value="projects" className="mt-0">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 mobile-padding sm:p-6 rounded-lg sm:rounded-xl border border-orange-200 dark:border-orange-800">
                <ProjectAnalyticsChart 
                  data={data?.projectStats?.map(project => ({
                    id: project.id,
                    name: project.name,
                    tasksTotal: project.totalTasks,
                    tasksCompleted: project.completedTasks,
                    tasksInProgress: project.inProgressTasks,
                    tasksPending: project.todoTasks,
                    teamMembers: 1,
                    timeSpent: 0,
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    progress: (project.completedTasks / project.totalTasks) * 100,
                    status: 'on-track' as const
                  }))} 
                  timeRange={timeRange}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}