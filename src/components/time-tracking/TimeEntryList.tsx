'use client';

import React, { useState } from 'react';
import { Clock, Edit3, Trash2, Play, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { useTimeTracking } from '../../hooks/useTimeTracking';
import { TimeEntry } from '../../types/task';
import { TimeTrackingService } from '../../lib/services/timeTrackingService';

interface TimeEntryListProps {
  entries?: TimeEntry[];
  showTaskInfo?: boolean;
  onStartTimer?: (taskId: string) => void;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({
  entries: propEntries,
  showTaskInfo = true,
  onStartTimer
}) => {
  const {
    timeEntries,
    loading,
    updateTimeEntry,
    deleteTimeEntry,
    totalMinutesToday
  } = useTimeTracking();

  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TimeEntry>>({});

  const entries = propEntries || timeEntries;

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry.id);
    setEditForm({
      description: entry.description || '',
      is_billable: entry.is_billable,
      hourly_rate: entry.hourly_rate || 0,
      duration_minutes: entry.duration_minutes || 0
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    await updateTimeEntry(editingEntry, editForm);
    setEditingEntry(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditForm({});
  };

  const handleDelete = async (entryId: string) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      await deleteTimeEntry(entryId);
    }
  };

  const formatDuration = (minutes: number) => {
    return TimeTrackingService.formatDuration(minutes);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      paused: 'secondary',
      completed: 'outline',
      cancelled: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateEarnings = (entry: TimeEntry) => {
    if (!entry.is_billable || !entry.hourly_rate || !entry.duration_minutes) {
      return 0;
    }
    return TimeTrackingService.calculateHourlyEarnings(entry.duration_minutes, entry.hourly_rate);
  };

  if (entries.length === 0) {
    return (
      <Card className="shadow-mobile border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardContent className="text-center py-8 mobile-padding sm:p-8">
          <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-responsive-base text-gray-500 dark:text-gray-400 font-medium">No time entries found</p>
          <p className="text-responsive-xs text-gray-400 dark:text-gray-500 mt-2">
            Start tracking time to see your entries here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Summary Card */}
      <Card className="shadow-mobile border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader className="mobile-padding sm:p-6">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-responsive-base font-semibold">📊 Today's Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="mobile-padding sm:p-6 pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg mobile-padding sm:p-3">
              <p className="text-responsive-xs text-gray-600 dark:text-gray-400 font-medium">Total Time</p>
              <p className="text-responsive-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{formatDuration(totalMinutesToday)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg mobile-padding sm:p-3">
              <p className="text-responsive-xs text-gray-600 dark:text-gray-400 font-medium">Entries</p>
              <p className="text-responsive-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{entries.length}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg mobile-padding sm:p-3">
              <p className="text-responsive-xs text-gray-600 dark:text-gray-400 font-medium">Billable</p>
              <p className="text-responsive-lg font-bold text-green-600 dark:text-green-400 mt-1">
                {formatDuration(
                  entries
                    .filter(e => e.is_billable)
                    .reduce((sum, e) => sum + (e.duration_minutes || 0), 0)
                )}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg mobile-padding sm:p-3">
              <p className="text-responsive-xs text-gray-600 dark:text-gray-400 font-medium">💰 Earnings</p>
              <p className="text-responsive-lg font-bold text-green-600 dark:text-green-400 mt-1">
                ${entries.reduce((sum, e) => sum + calculateEarnings(e), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Time Entries */}
      <div className="space-y-3 sm:space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="relative shadow-mobile border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="mobile-padding sm:p-4">
              {editingEntry === entry.id ? (
                // Enhanced Edit Mode
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-responsive-xs font-medium text-gray-900 dark:text-gray-100">Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={editForm.duration_minutes || 0}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          duration_minutes: parseInt(e.target.value) || 0
                        })}
                        className="mt-1 mobile-padding sm:p-3 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent touch-manipulation text-responsive-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-responsive-xs font-medium text-gray-900 dark:text-gray-100">Hourly Rate ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.hourly_rate || 0}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          hourly_rate: parseFloat(e.target.value) || 0
                        })}
                        className="mt-1 mobile-padding sm:p-3 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent touch-manipulation text-responsive-xs"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-responsive-xs font-medium text-gray-900 dark:text-gray-100">Description</Label>
                    <Textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        description: e.target.value
                      })}
                      placeholder="What did you work on?"
                      className="mt-1 min-h-[60px] sm:min-h-[80px] mobile-padding sm:p-3 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent touch-manipulation text-responsive-xs"
                    />
                  </div>

                  <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mobile-padding sm:p-3">
                    <Switch
                      checked={editForm.is_billable || false}
                      onCheckedChange={(checked) => setEditForm({
                        ...editForm,
                        is_billable: checked
                      })}
                      className="touch-manipulation"
                    />
                    <Label className="text-responsive-xs font-medium text-gray-900 dark:text-gray-100">💰 Billable</Label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleSaveEdit} 
                      disabled={loading}
                      className="btn-mobile bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white touch-manipulation"
                    >
                      <span className="text-responsive-sm font-medium">Save Changes</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      className="btn-mobile border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 touch-manipulation"
                    >
                      <span className="text-responsive-sm">Cancel</span>
                    </Button>
                  </div>
                </div>
              ) : (
                // Enhanced View Mode
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100">
                          ⏱️ {formatDuration(entry.duration_minutes || 0)}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {getStatusBadge(entry.status)}
                          {entry.is_billable && (
                            <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                              <DollarSign className="h-3 w-3 mr-1" />
                              ${calculateEarnings(entry).toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-responsive-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg mobile-padding sm:p-2">
                        <span className="font-medium">🕐 {formatTime(entry.start_time)}</span>
                        {entry.end_time && <span> - {formatTime(entry.end_time)}</span>}
                        <span className="mx-2">•</span>
                        <span>📅 {formatDate(entry.start_time)}</span>
                      </div>

                      {entry.description && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg mobile-padding sm:p-3 border-l-4 border-blue-200 dark:border-blue-700">
                          <p className="text-responsive-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                            💭 {entry.description}
                          </p>
                        </div>
                      )}

                      {showTaskInfo && entry.task_id && (
                        <div className="text-responsive-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg mobile-padding sm:p-2">
                          🎯 Task ID: {entry.task_id}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row sm:flex-col gap-2 sm:ml-4">
                      {onStartTimer && entry.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onStartTimer(entry.task_id)}
                          title="Start timer for this task"
                          className="btn-mobile text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 touch-manipulation"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(entry)}
                        title="Edit entry"
                        className="btn-mobile text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 touch-manipulation"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(entry.id)}
                        title="Delete entry"
                        className="btn-mobile text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};