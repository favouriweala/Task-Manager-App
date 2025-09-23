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
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Timer, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface TimeTrackingData {
  date: string;
  totalTime: number;
  focusTime: number;
  breakTime: number;
  meetings: number;
}

interface ProjectTimeData {
  project: string;
  time: number;
  color: string;
  [key: string]: any; // Add index signature for Recharts compatibility
}

interface TimeTrackingChartProps {
  data?: TimeTrackingData[];
  timeRange: string;
  className?: string;
}

const PROJECT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function TimeTrackingChart({ data, timeRange, className }: TimeTrackingChartProps) {
  // Mock data if none provided
  const mockData: TimeTrackingData[] = [
    { date: '2024-01-01', totalTime: 480, focusTime: 360, breakTime: 60, meetings: 60 },
    { date: '2024-01-02', totalTime: 520, focusTime: 420, breakTime: 40, meetings: 60 },
    { date: '2024-01-03', totalTime: 450, focusTime: 340, breakTime: 50, meetings: 60 },
    { date: '2024-01-04', totalTime: 600, focusTime: 480, breakTime: 60, meetings: 60 },
    { date: '2024-01-05', totalTime: 510, focusTime: 390, breakTime: 60, meetings: 60 },
    { date: '2024-01-06', totalTime: 580, focusTime: 460, breakTime: 60, meetings: 60 },
    { date: '2024-01-07', totalTime: 620, focusTime: 500, breakTime: 60, meetings: 60 }
  ];

  const mockProjectData: ProjectTimeData[] = [
    { project: 'Task Manager', time: 1200, color: PROJECT_COLORS[0] },
    { project: 'Website Redesign', time: 800, color: PROJECT_COLORS[1] },
    { project: 'Mobile App', time: 600, color: PROJECT_COLORS[2] },
    { project: 'Documentation', time: 400, color: PROJECT_COLORS[3] },
    { project: 'Bug Fixes', time: 300, color: PROJECT_COLORS[4] }
  ];

  const chartData = data || mockData;
  const projectData = mockProjectData;

  // Calculate metrics
  const totalTimeLogged = chartData.reduce((sum, item) => sum + item.totalTime, 0);
  const totalFocusTime = chartData.reduce((sum, item) => sum + item.focusTime, 0);
  const avgDailyTime = totalTimeLogged / chartData.length;
  const focusPercentage = totalTimeLogged > 0 ? (totalFocusTime / totalTimeLogged) * 100 : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatHours = (minutes: number) => {
    return `${(minutes / 60).toFixed(1)}h`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatTime(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Time Tracking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatHours(totalTimeLogged)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Focus Time</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatHours(totalFocusTime)}
                </p>
              </div>
              <Timer className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Average</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatHours(avgDailyTime)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Focus Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {focusPercentage.toFixed(0)}%
                </p>
              </div>
              <PieChartIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Time Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle>Daily Time Breakdown</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => formatHours(value)}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="focusTime" 
                name="Focus Time"
                fill="#10B981"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="meetings" 
                name="Meetings"
                fill="#3B82F6"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="breakTime" 
                name="Break Time"
                fill="#F59E0B"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <CardTitle>Time Trend</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => formatHours(value)}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="totalTime" 
                  name="Total Time"
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="focusTime" 
                  name="Focus Time"
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Time Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-purple-600" />
              <CardTitle>Time by Project</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="time"
                    label={(props: any) => `${(props.percent * 100).toFixed(0)}%`}
                  >
                    {projectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatTime(value), 'Time']}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                {projectData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.project}</span>
                    </div>
                    <Badge variant="outline">
                      {formatTime(item.time)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{formatHours(totalTimeLogged)}</p>
              <p className="text-sm text-gray-600">Total Time</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{formatHours(totalFocusTime)}</p>
              <p className="text-sm text-gray-600">Focus Time</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{formatHours(avgDailyTime)}</p>
              <p className="text-sm text-gray-600">Daily Average</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{focusPercentage.toFixed(0)}%</p>
              <p className="text-sm text-gray-600">Focus Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}