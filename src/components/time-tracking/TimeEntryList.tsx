'use client';

import React, { useState } from 'react';
import { Clock, Edit3, Trash2, Play, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/Input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/Textarea';
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
      <Card>
        <CardContent className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No time entries found</p>
          <p className="text-sm text-gray-400 mt-1">
            Start tracking time to see your entries here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Time</p>
              <p className="text-lg font-semibold">{formatDuration(totalMinutesToday)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Entries</p>
              <p className="text-lg font-semibold">{entries.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Billable</p>
              <p className="text-lg font-semibold">
                {formatDuration(
                  entries
                    .filter(e => e.is_billable)
                    .reduce((sum, e) => sum + (e.duration_minutes || 0), 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Earnings</p>
              <p className="text-lg font-semibold">
                ${entries.reduce((sum, e) => sum + calculateEarnings(e), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <Card key={entry.id} className="relative">
            <CardContent className="p-4">
              {editingEntry === entry.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={editForm.duration_minutes || 0}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          duration_minutes: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label>Hourly Rate ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.hourly_rate || 0}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          hourly_rate: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        description: e.target.value
                      })}
                      placeholder="What did you work on?"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editForm.is_billable || false}
                      onCheckedChange={(checked) => setEditForm({
                        ...editForm,
                        is_billable: checked
                      })}
                    />
                    <Label>Billable</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} disabled={loading}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-lg">
                          {formatDuration(entry.duration_minutes || 0)}
                        </span>
                        {getStatusBadge(entry.status)}
                        {entry.is_billable && (
                          <Badge variant="outline" className="text-green-600">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${calculateEarnings(entry).toFixed(2)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {formatTime(entry.start_time)}
                        {entry.end_time && ` - ${formatTime(entry.end_time)}`}
                        <span className="mx-2">•</span>
                        {formatDate(entry.start_time)}
                      </div>

                      {entry.description && (
                        <p className="text-sm text-gray-700 mt-2">
                          {entry.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1 ml-4">
                      {onStartTimer && entry.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onStartTimer(entry.task_id)}
                          title="Start timer for this task"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(entry)}
                        title="Edit entry"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(entry.id)}
                        title="Delete entry"
                        className="text-red-600 hover:text-red-700"
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