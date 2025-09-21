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
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp } from 'lucide-react';

interface TaskMetricsData {
  date: string;
  completed: number;
  created: number;
  inProgress: number;
  overdue: number;
}

interface TaskStatusData {
  name: string;
  value: number;
  color: string;
}

interface TaskMetricsChartProps {
  data?: TaskMetricsData[];
  timeRange: string;
  className?: string;
}

const COLORS = {
  completed: '#10B981',
  created: '#3B82F6',
  inProgress: '#F59E0B',
  overdue: '#EF4444'
};

const STATUS_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

export function TaskMetricsChart({ data, timeRange, className }: TaskMetricsChartProps) {
  // Mock data if none provided
  const mockData: TaskMetricsData[] = [
    { date: '2024-01-01', completed: 12, created: 15, inProgress: 8, overdue: 2 },
    { date: '2024-01-02', completed: 18, created: 12, inProgress: 10, overdue: 1 },
    { date: '2024-01-03', completed: 15, created: 20, inProgress: 12, overdue: 3 },
    { date: '2024-01-04', completed: 22, created: 18, inProgress: 9, overdue: 2 },
    { date: '2024-01-05', completed: 19, created: 16, inProgress: 11, overdue: 1 },
    { date: '2024-01-06', completed: 25, created: 22, inProgress: 14, overdue: 4 },
    { date: '2024-01-07', completed: 20, created: 19, inProgress: 13, overdue: 2 }
  ];

  const chartData = data || mockData;

  // Calculate status distribution for pie chart
  const statusData: TaskStatusData[] = [
    {
      name: 'Completed',
      value: chartData.reduce((sum, item) => sum + item.completed, 0),
      color: COLORS.completed
    },
    {
      name: 'In Progress',
      value: chartData.reduce((sum, item) => sum + item.inProgress, 0),
      color: COLORS.inProgress
    },
    {
      name: 'Created',
      value: chartData.reduce((sum, item) => sum + item.created, 0),
      color: COLORS.created
    },
    {
      name: 'Overdue',
      value: chartData.reduce((sum, item) => sum + item.overdue, 0),
      color: COLORS.overdue
    }
  ];

  const totalTasks = statusData.reduce((sum, item) => sum + item.value, 0);
  const completionRate = totalTasks > 0 ? Math.round((statusData[0].value / totalTasks) * 100) : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Task Metrics Bar Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <CardTitle>Task Activity</CardTitle>
            </div>
            <Badge variant="outline">
              <TrendingUp className="h-3 w-3 mr-1" />
              {completionRate}% completion rate
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="completed" 
                name="Completed"
                fill={COLORS.completed}
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="inProgress" 
                name="In Progress"
                fill={COLORS.inProgress}
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="created" 
                name="Created"
                fill={COLORS.created}
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="overdue" 
                name="Overdue"
                fill={COLORS.overdue}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Task Status Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Summary</h4>
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{item.value}</span>
                    <span className="text-xs text-gray-500">
                      ({totalTasks > 0 ? Math.round((item.value / totalTasks) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between font-medium">
                  <span>Total Tasks</span>
                  <span>{totalTasks}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}