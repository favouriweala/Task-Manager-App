'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Target } from 'lucide-react';

interface ProductivityData {
  date: string;
  tasksCompleted: number;
  timeLogged: number;
  focusTime: number;
  efficiency: number;
}

interface ProductivityChartProps {
  data?: ProductivityData[];
  timeRange: string;
  detailed?: boolean;
  className?: string;
}

export function ProductivityChart({ data, timeRange, detailed = false, className }: ProductivityChartProps) {
  // Mock data if none provided
  const mockData: ProductivityData[] = [
    { date: '2024-01-01', tasksCompleted: 5, timeLogged: 480, focusTime: 360, efficiency: 75 },
    { date: '2024-01-02', tasksCompleted: 8, timeLogged: 520, focusTime: 420, efficiency: 81 },
    { date: '2024-01-03', tasksCompleted: 6, timeLogged: 450, focusTime: 340, efficiency: 76 },
    { date: '2024-01-04', tasksCompleted: 10, timeLogged: 600, focusTime: 480, efficiency: 80 },
    { date: '2024-01-05', tasksCompleted: 7, timeLogged: 510, focusTime: 390, efficiency: 76 },
    { date: '2024-01-06', tasksCompleted: 9, timeLogged: 580, focusTime: 460, efficiency: 79 },
    { date: '2024-01-07', tasksCompleted: 11, timeLogged: 620, focusTime: 500, efficiency: 81 }
  ];

  const chartData = data || mockData;

  // Calculate metrics
  const avgTasksPerDay = chartData.reduce((sum, item) => sum + item.tasksCompleted, 0) / chartData.length;
  const avgTimePerDay = chartData.reduce((sum, item) => sum + item.timeLogged, 0) / chartData.length;
  const avgEfficiency = chartData.reduce((sum, item) => sum + item.efficiency, 0) / chartData.length;
  const totalTasks = chartData.reduce((sum, item) => sum + item.tasksCompleted, 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {
                entry.dataKey === 'timeLogged' || entry.dataKey === 'focusTime' 
                  ? formatTime(entry.value)
                  : entry.dataKey === 'efficiency'
                  ? `${entry.value}%`
                  : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Productivity Overview Cards */}
      {detailed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Tasks/Day</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {avgTasksPerDay.toFixed(1)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Time/Day</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(avgTimePerDay / 60)}h
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Efficiency</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {avgEfficiency.toFixed(0)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tasks Completed Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle>Tasks Completed Trend</CardTitle>
            </div>
            <Badge variant="outline">
              {totalTasks} total tasks
            </Badge>
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
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="tasksCompleted" 
                name="Tasks Completed"
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Time Tracking and Focus */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <CardTitle>Time Tracking & Focus</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `${Math.round(value / 60)}h`}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="timeLogged" 
                name="Time Logged"
                stackId="1"
                stroke="#10B981" 
                fill="#10B981"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="focusTime" 
                name="Focus Time"
                stackId="2"
                stroke="#8B5CF6" 
                fill="#8B5CF6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Efficiency Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle>Efficiency Trend</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                name="Efficiency"
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Average Efficiency:</span>
              <span className="font-medium text-purple-600">{avgEfficiency.toFixed(1)}%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${avgEfficiency}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}