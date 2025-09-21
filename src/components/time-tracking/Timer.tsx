'use client';

import React, { useState } from 'react';
import { Play, Pause, Square, Clock, Edit3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
    <Card className="w-full max-w-md shadow-mobile border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="mobile-padding sm:p-6">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-responsive-base font-semibold">Timer</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 mobile-padding sm:p-6 pt-0">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mobile-padding sm:p-3">
            <p className="text-responsive-xs text-red-600 dark:text-red-400">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 btn-mobile touch-manipulation"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Enhanced Timer Display */}
        <div className="text-center space-y-3">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-gray-900 dark:text-gray-100 tracking-wider">
            {formattedElapsedTime}
          </div>
          
          {task && (
            <div className="text-responsive-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg mobile-padding sm:p-2">
              <span className="text-gray-500 dark:text-gray-500">Tracking:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">{task.title}</span>
            </div>
          )}

          {timerState.currentEntry && (
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg mobile-padding sm:p-2">
              <Clock className="inline h-3 w-3 mr-1" />
              Started: {new Date(timerState.currentEntry.start_time).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Enhanced Current Entry Description */}
        {timerState.currentEntry && (
          <div className="space-y-3">
            <Label className="text-responsive-xs font-medium text-gray-900 dark:text-gray-100">Description</Label>
            {isEditingDescription ? (
              <div className="space-y-3">
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="What are you working on?"
                  className="min-h-[60px] sm:min-h-[80px] mobile-padding sm:p-3 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent touch-manipulation text-responsive-xs"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdateDescription}
                    disabled={loading}
                    className="btn-mobile bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white touch-manipulation"
                  >
                    <span className="text-responsive-xs">Save</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingDescription(false)}
                    className="btn-mobile border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 touch-manipulation"
                  >
                    <span className="text-responsive-xs">Cancel</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg mobile-padding sm:p-3 flex-1">
                  <p className="text-responsive-xs text-gray-700 dark:text-gray-300 min-h-[20px]">
                    {timerState.currentEntry.description || 'No description'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={startEditingDescription}
                  className="h-8 w-8 p-0 btn-mobile text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 touch-manipulation"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Description Input for New Timer */}
        {!timerState.isRunning && (
          <div className="space-y-3">
            <Label htmlFor="description" className="text-responsive-xs font-medium text-gray-900 dark:text-gray-100">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you be working on?"
              className="min-h-[60px] sm:min-h-[80px] mobile-padding sm:p-3 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent touch-manipulation text-responsive-xs"
            />
          </div>
        )}

        {/* Enhanced Timer Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!timerState.isRunning ? (
            <Button
              onClick={handleStart}
              disabled={loading}
              className="flex items-center justify-center gap-2 btn-mobile bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white touch-manipulation"
              size="lg"
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-responsive-sm font-medium">
                {task ? 'Start Timer' : 'Select Task'}
              </span>
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePause}
                disabled={loading}
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 btn-mobile border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 touch-manipulation"
              >
                <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-responsive-sm font-medium">
                  {timerState.isPaused ? 'Resume' : 'Pause'}
                </span>
              </Button>
              <Button
                onClick={handleStop}
                disabled={loading}
                variant="destructive"
                size="lg"
                className="flex items-center justify-center gap-2 btn-mobile bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white touch-manipulation"
              >
                <Square className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-responsive-sm font-medium">Stop</span>
              </Button>
            </>
          )}
        </div>

        {/* Enhanced Task Selection Hint */}
        {!task && (
          <div className="text-center space-y-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mobile-padding sm:p-4">
            <p className="text-responsive-xs text-gray-500 dark:text-gray-400">
              Select a task to start tracking time
            </p>
            {onTaskSelect && (
              <Button
                variant="link"
                onClick={onTaskSelect}
                className="text-responsive-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 touch-manipulation"
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