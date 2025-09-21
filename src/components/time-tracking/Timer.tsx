'use client';

import React, { useState } from 'react';
import { Play, Pause, Square, Clock, Edit3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/Input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/Textarea';
import { useTimeTracking } from '../../hooks/useTimeTracking';
import { Task } from '../../types/task';

interface TimerProps {
  task?: Task;
  onTaskSelect?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ task, onTaskSelect }) => {
  const {
    timerState,
    loading,
    error,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    updateTimeEntry,
    formattedElapsedTime,
    isTimerActive,
    clearError
  } = useTimeTracking();

  const [description, setDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState('');

  const handleStart = async () => {
    if (!task) {
      onTaskSelect?.();
      return;
    }
    
    await startTimer(task.id, description);
    setDescription('');
  };

  const handleStop = async () => {
    await stopTimer();
  };

  const handlePause = async () => {
    if (timerState.isPaused) {
      await resumeTimer();
    } else {
      await pauseTimer();
    }
  };

  const handleUpdateDescription = async () => {
    if (timerState.currentEntry) {
      await updateTimeEntry(timerState.currentEntry.id, {
        description: editDescription
      });
      setIsEditingDescription(false);
    }
  };

  const startEditingDescription = () => {
    setEditDescription(timerState.currentEntry?.description || '');
    setIsEditingDescription(true);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="mt-1 text-red-600 hover:text-red-700"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
            {formattedElapsedTime}
          </div>
          
          {task && (
            <div className="text-sm text-gray-600 mb-2">
              Tracking: <span className="font-medium">{task.title}</span>
            </div>
          )}

          {timerState.currentEntry && (
            <div className="text-xs text-gray-500">
              Started: {new Date(timerState.currentEntry.start_time).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Current Entry Description */}
        {timerState.currentEntry && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            {isEditingDescription ? (
              <div className="space-y-2">
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="What are you working on?"
                  className="min-h-[60px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdateDescription}
                    disabled={loading}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingDescription(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <p className="text-sm text-gray-600 flex-1 min-h-[20px]">
                  {timerState.currentEntry.description || 'No description'}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={startEditingDescription}
                  className="h-6 w-6 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Description Input for New Timer */}
        {!timerState.isRunning && (
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you be working on?"
              className="min-h-[60px]"
            />
          </div>
        )}

        {/* Timer Controls */}
        <div className="flex gap-2 justify-center">
          {!timerState.isRunning ? (
            <Button
              onClick={handleStart}
              disabled={loading}
              className="flex items-center gap-2"
              size="lg"
            >
              <Play className="h-4 w-4" />
              {task ? 'Start Timer' : 'Select Task'}
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePause}
                disabled={loading}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                {timerState.isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                onClick={handleStop}
                disabled={loading}
                variant="destructive"
                size="lg"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Task Selection Hint */}
        {!task && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Select a task to start tracking time
            </p>
            {onTaskSelect && (
              <Button
                variant="link"
                onClick={onTaskSelect}
                className="text-sm"
              >
                Choose Task
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};