import { useState, useEffect, useCallback, useRef } from 'react';
import { TimeEntry, TimerState } from '../types/task';
import { TimeTrackingService } from '../lib/services/timeTrackingService';
import { useAuth } from '../lib/auth/auth-context';

export const useTimeTracking = () => {
  const { user } = useAuth();
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    elapsedTime: 0
  });
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Load active timer on mount
  useEffect(() => {
    if (user) {
      loadActiveTimer();
      loadTimeEntries();
    }
  }, [user]);

  // Timer interval effect
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTimeRef.current!.getTime()) / 1000);
        setTimerState(prev => ({ ...prev, elapsedTime: elapsed }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.isPaused]);

  const loadActiveTimer = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const activeEntry = await TimeTrackingService.getActiveTimer(user.id);
      
      if (activeEntry) {
        const startTime = new Date(activeEntry.start_time);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        
        setTimerState({
          isRunning: true,
          isPaused: activeEntry.status === 'paused',
          currentEntry: activeEntry,
          elapsedTime: elapsed,
          startTime
        });
        
        startTimeRef.current = startTime;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active timer');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadTimeEntries = useCallback(async () => {
    if (!user) return;

    try {
      const entries = await TimeTrackingService.getTodayTimeEntries(user.id);
      setTimeEntries(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time entries');
    }
  }, [user]);

  const startTimer = useCallback(async (taskId: string, description?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const entry = await TimeTrackingService.startTimer(taskId, user.id, description);
      const startTime = new Date();
      
      setTimerState({
        isRunning: true,
        isPaused: false,
        currentEntry: entry,
        elapsedTime: 0,
        startTime
      });
      
      startTimeRef.current = startTime;
      await loadTimeEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start timer');
    } finally {
      setLoading(false);
    }
  }, [user, loadTimeEntries]);

  const stopTimer = useCallback(async () => {
    if (!timerState.currentEntry) return;

    try {
      setLoading(true);
      setError(null);
      
      await TimeTrackingService.stopTimer(timerState.currentEntry.id);
      
      setTimerState({
        isRunning: false,
        isPaused: false,
        elapsedTime: 0
      });
      
      startTimeRef.current = null;
      await loadTimeEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop timer');
    } finally {
      setLoading(false);
    }
  }, [timerState.currentEntry, loadTimeEntries]);

  const pauseTimer = useCallback(async () => {
    if (!timerState.currentEntry) return;

    try {
      setLoading(true);
      setError(null);
      
      await TimeTrackingService.pauseTimer(timerState.currentEntry.id);
      
      setTimerState(prev => ({
        ...prev,
        isPaused: true
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause timer');
    } finally {
      setLoading(false);
    }
  }, [timerState.currentEntry]);

  const resumeTimer = useCallback(async () => {
    if (!timerState.currentEntry) return;

    try {
      setLoading(true);
      setError(null);
      
      await TimeTrackingService.resumeTimer(timerState.currentEntry.id);
      
      setTimerState(prev => ({
        ...prev,
        isPaused: false
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume timer');
    } finally {
      setLoading(false);
    }
  }, [timerState.currentEntry]);

  const updateTimeEntry = useCallback(async (entryId: string, updates: Partial<TimeEntry>) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      await TimeTrackingService.updateTimeEntry(entryId, updates);
      await loadTimeEntries();
      
      // Update current entry if it's the one being updated
      if (timerState.currentEntry?.id === entryId) {
        setTimerState(prev => ({
          ...prev,
          currentEntry: prev.currentEntry ? { ...prev.currentEntry, ...updates } : undefined
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update time entry');
    } finally {
      setLoading(false);
    }
  }, [user, loadTimeEntries, timerState.currentEntry]);

  const deleteTimeEntry = useCallback(async (entryId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      await TimeTrackingService.deleteTimeEntry(entryId);
      await loadTimeEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete time entry');
    } finally {
      setLoading(false);
    }
  }, [user, loadTimeEntries]);

  const formatElapsedTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }, []);

  const getTotalTimeToday = useCallback(() => {
    return timeEntries.reduce((total, entry) => {
      return total + (entry.duration_minutes || 0);
    }, 0);
  }, [timeEntries]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    timerState,
    timeEntries,
    loading,
    error,
    
    // Actions
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    updateTimeEntry,
    deleteTimeEntry,
    loadTimeEntries,
    clearError,
    
    // Utilities
    formatElapsedTime,
    getTotalTimeToday,
    
    // Computed values
    isTimerActive: timerState.isRunning && !timerState.isPaused,
    currentTaskId: timerState.currentEntry?.task_id,
    formattedElapsedTime: formatElapsedTime(timerState.elapsedTime),
    totalMinutesToday: getTotalTimeToday()
  };
};