'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Download, Filter, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { DatePickerWithRange } from '../ui/date-range-picker';
import { Badge } from '../ui/badge';
import { TimeTrackingService } from '../../lib/services/timeTrackingService';
import { useAuth } from '../../lib/auth/auth-context';
import { TimeEntry, TimeTrackingSummary } from '../../types/task';
import { DateRange } from 'react-day-picker';

interface ReportData {
  totalHours: number;
  totalEarnings: number;
  entriesCount: number;
  averageSessionLength: number;
  dailyBreakdown: Array<{
    date: string;
    hours: number;
    earnings: number;
    entries: number;
  }>;
  taskBreakdown: Array<{
    taskId: string;
    taskTitle: string;
    hours: number;
    earnings: number;
    entries: number;
  }>;
}

export const TimeReports: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('weekly');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [summaries, setSummaries] = useState<TimeTrackingSummary[]>([]);

  useEffect(() => {
    if (user) {
      generateReport();
    }
  }, [user, reportType, dateRange]);

  const generateReport = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (reportType === 'custom' && dateRange?.from && dateRange?.to) {
        startDate = dateRange.from.toISOString();
        endDate = dateRange.to.toISOString();
      } else {
        const now = new Date();
        const start = new Date();
        
        switch (reportType) {
          case 'daily':
            start.setHours(0, 0, 0, 0);
            break;
          case 'weekly':
            start.setDate(now.getDate() - now.getDay());
            start.setHours(0, 0, 0, 0);
            break;
          case 'monthly':
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            break;
        }
        
        startDate = start.toISOString();
        endDate = now.toISOString();
      }

      // Get time entries for the period
      const entries = await TimeTrackingService.getTimeEntries(user.id, {
        startDate,
        endDate,
        status: 'completed'
      });

      // Get summaries
      const summaryData = await TimeTrackingService.getUserTimeSummary(user.id, {
        start: startDate!,
        end: endDate!
      });

      setTimeEntries(entries);
      setSummaries(summaryData);

      // Process data for report
      const processedData = processReportData(entries);
      setReportData(processedData);

    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (entries: TimeEntry[]): ReportData => {
    const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
    const totalHours = totalMinutes / 60;
    
    const totalEarnings = entries.reduce((sum, entry) => {
      if (entry.is_billable && entry.hourly_rate && entry.duration_minutes) {
        return sum + TimeTrackingService.calculateHourlyEarnings(entry.duration_minutes, entry.hourly_rate);
      }
      return sum;
    }, 0);

    const averageSessionLength = entries.length > 0 ? totalMinutes / entries.length : 0;

    // Daily breakdown
    const dailyMap = new Map<string, { hours: number; earnings: number; entries: number }>();
    entries.forEach(entry => {
      const date = new Date(entry.start_time).toDateString();
      const existing = dailyMap.get(date) || { hours: 0, earnings: 0, entries: 0 };
      
      existing.hours += (entry.duration_minutes || 0) / 60;
      existing.entries += 1;
      
      if (entry.is_billable && entry.hourly_rate && entry.duration_minutes) {
        existing.earnings += TimeTrackingService.calculateHourlyEarnings(entry.duration_minutes, entry.hourly_rate);
      }
      
      dailyMap.set(date, existing);
    });

    const dailyBreakdown = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      ...data
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Task breakdown
    const taskMap = new Map<string, { taskTitle: string; hours: number; earnings: number; entries: number }>();
    entries.forEach(entry => {
      const existing = taskMap.get(entry.task_id) || { 
        taskTitle: `Task ${entry.task_id.slice(0, 8)}`, 
        hours: 0, 
        earnings: 0, 
        entries: 0 
      };
      
      existing.hours += (entry.duration_minutes || 0) / 60;
      existing.entries += 1;
      
      if (entry.is_billable && entry.hourly_rate && entry.duration_minutes) {
        existing.earnings += TimeTrackingService.calculateHourlyEarnings(entry.duration_minutes, entry.hourly_rate);
      }
      
      taskMap.set(entry.task_id, existing);
    });

    const taskBreakdown = Array.from(taskMap.entries()).map(([taskId, data]) => ({
      taskId,
      ...data
    })).sort((a, b) => b.hours - a.hours);

    return {
      totalHours,
      totalEarnings,
      entriesCount: entries.length,
      averageSessionLength,
      dailyBreakdown,
      taskBreakdown
    };
  };

  const exportReport = () => {
    if (!reportData) return;

    const csvContent = [
      ['Date', 'Hours', 'Earnings', 'Entries'],
      ...reportData.dailyBreakdown.map(day => [
        day.date,
        day.hours.toFixed(2),
        day.earnings.toFixed(2),
        day.entries.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'daily': return 'Daily Report';
      case 'weekly': return 'Weekly Report';
      case 'monthly': return 'Monthly Report';
      case 'custom': return 'Custom Report';
      default: return 'Time Report';
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {getReportTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={generateReport} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
              
              {reportData && (
                <Button variant="outline" onClick={exportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold">{reportData.totalHours.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold">${reportData.totalEarnings.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Time Entries</p>
                    <p className="text-2xl font-bold">{reportData.entriesCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Session</p>
                    <p className="text-2xl font-bold">
                      {TimeTrackingService.formatDuration(reportData.averageSessionLength)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.dailyBreakdown.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">{day.entries} entries</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{day.hours.toFixed(1)}h</p>
                      {day.earnings > 0 && (
                        <p className="text-sm text-green-600">${day.earnings.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Task Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Task Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.taskBreakdown.slice(0, 10).map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium truncate">{task.taskTitle}</p>
                      <p className="text-sm text-gray-600">{task.entries} entries</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium">{task.hours.toFixed(1)}h</p>
                      {task.earnings > 0 && (
                        <p className="text-sm text-green-600">${task.earnings.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};