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
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Report Controls */}
      <Card className="shadow-mobile border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader className="mobile-padding sm:p-6">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-responsive-base font-semibold">📊 {getReportTitle()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="mobile-padding sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-end">
            <div className="space-y-2 w-full sm:w-auto">
              <label className="text-responsive-xs font-medium text-gray-900 dark:text-gray-100">Report Type</label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger className="w-full sm:w-40 mobile-padding sm:p-3 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent touch-manipulation text-responsive-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectItem value="daily" className="text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600">📅 Daily</SelectItem>
                  <SelectItem value="weekly" className="text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600">📊 Weekly</SelectItem>
                  <SelectItem value="monthly" className="text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600">📈 Monthly</SelectItem>
                  <SelectItem value="custom" className="text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600">🎯 Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'custom' && (
              <div className="space-y-2 w-full sm:w-auto">
                <label className="text-responsive-xs font-medium text-gray-900 dark:text-gray-100">📅 Date Range</label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                onClick={generateReport} 
                disabled={loading}
                className="btn-mobile bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white touch-manipulation"
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="text-responsive-sm font-medium">
                  {loading ? '⏳ Generating...' : '🔍 Generate Report'}
                </span>
              </Button>
              
              {reportData && (
                <Button 
                  variant="outline" 
                  onClick={exportReport}
                  className="btn-mobile border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 touch-manipulation"
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="text-responsive-sm">💾 Export CSV</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="shadow-mobile border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="mobile-padding sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-responsive-xs text-gray-600 dark:text-gray-400 font-medium">⏰ Total Hours</p>
                    <p className="text-responsive-xl font-bold text-blue-600 dark:text-blue-400 truncate">{reportData.totalHours.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-mobile border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="mobile-padding sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-responsive-xs text-gray-600 dark:text-gray-400 font-medium">💰 Total Earnings</p>
                    <p className="text-responsive-xl font-bold text-green-600 dark:text-green-400 truncate">${reportData.totalEarnings.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-mobile border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="mobile-padding sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-responsive-xs text-gray-600 dark:text-gray-400 font-medium">📝 Time Entries</p>
                    <p className="text-responsive-xl font-bold text-purple-600 dark:text-purple-400">{reportData.entriesCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-mobile border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="mobile-padding sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-responsive-xs text-gray-600 dark:text-gray-400 font-medium">📊 Avg Session</p>
                    <p className="text-responsive-xl font-bold text-orange-600 dark:text-orange-400 truncate">
                      {TimeTrackingService.formatDuration(reportData.averageSessionLength)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Daily Breakdown */}
          <Card className="shadow-mobile border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="mobile-padding sm:p-6">
              <CardTitle className="text-gray-900 dark:text-gray-100 text-responsive-base font-semibold">📅 Daily Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="mobile-padding sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {reportData.dailyBreakdown.map((day, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-responsive-sm">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-responsive-xs text-gray-600 dark:text-gray-400">📝 {day.entries} entries</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-responsive-sm">⏰ {day.hours.toFixed(1)}h</p>
                      {day.earnings > 0 && (
                        <p className="text-responsive-xs text-green-600 dark:text-green-400">💰 ${day.earnings.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Task Breakdown */}
          <Card className="shadow-mobile border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="mobile-padding sm:p-6">
              <CardTitle className="text-gray-900 dark:text-gray-100 text-responsive-base font-semibold">🎯 Task Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="mobile-padding sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {reportData.taskBreakdown.slice(0, 10).map((task, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex-1 min-w-0 mb-2 sm:mb-0 sm:mr-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-responsive-sm truncate">{task.taskTitle}</p>
                      <p className="text-responsive-xs text-gray-600 dark:text-gray-400">📝 {task.entries} entries</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-responsive-sm">⏰ {task.hours.toFixed(1)}h</p>
                      {task.earnings > 0 && (
                        <p className="text-responsive-xs text-green-600 dark:text-green-400">💰 ${task.earnings.toFixed(2)}</p>
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