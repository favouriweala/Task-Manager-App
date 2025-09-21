import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Task, TaskFormData, TaskFilters, TaskSortOptions } from '@/types/task';
import { TaskService } from '@/lib/tasks/taskService';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';

export function useTasksWithSupabase(
  initialFilters?: TaskFilters,
  initialSort?: TaskSortOptions
) {
  const user = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>(initialFilters || {});
  const [sort, setSort] = useState<TaskSortOptions>(
    initialSort || { field: 'created_at', direction: 'desc' }
  );
  
  // Use ref to track if initial load is complete
  const initialLoadComplete = useRef(false);
  const subscriptionRef = useRef<any>(null);

  // Memoize filters and sort to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)]);
  const memoizedSort = useMemo(() => sort, [JSON.stringify(sort)]);

  // Fetch tasks function with optimized loading states
  const fetchTasks = useCallback(async (showLoading = true) => {
    if (!user) return;
    
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const fetchedTasks = await TaskService.getTasks(memoizedFilters, memoizedSort, user.id);
      setTasks(fetchedTasks);
      initialLoadComplete.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user, memoizedFilters, memoizedSort]);

  // Initial fetch and setup real-time subscription
  useEffect(() => {
    if (!user) return;

    // Clean up previous subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    fetchTasks();

    // Set up real-time subscription with optimized handling
    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `or(assignee_id.eq.${user.id},created_by.eq.${user.id})`,
        },
        (payload) => {
          console.log('Real-time task change:', payload);
          
          // Only update if initial load is complete to avoid race conditions
          if (!initialLoadComplete.current) return;
          
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task;
            // Check if task matches current filters before adding
            if (shouldIncludeTask(newTask, memoizedFilters)) {
              setTasks(prev => [newTask, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as Task;
            setTasks(prev => 
              prev.map(task => 
                task.id === updatedTask.id ? updatedTask : task
              ).filter(task => shouldIncludeTask(task, memoizedFilters))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedTask = payload.old as Task;
            setTasks(prev => 
              prev.filter(task => task.id !== deletedTask.id)
            );
          }
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [fetchTasks, user, memoizedFilters]);

  // Helper function to check if task should be included based on filters
  const shouldIncludeTask = useCallback((task: Task, currentFilters: TaskFilters): boolean => {
    if (currentFilters.status && currentFilters.status.length > 0) {
      if (!currentFilters.status.includes(task.status)) return false;
    }
    if (currentFilters.priority && currentFilters.priority.length > 0) {
      if (!currentFilters.priority.includes(task.priority)) return false;
    }
    if (currentFilters.assignee_id && task.assignee_id !== currentFilters.assignee_id) {
      return false;
    }
    if (currentFilters.project_id && task.project_id !== currentFilters.project_id) {
      return false;
    }
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(searchLower) && 
          !task.description?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    return true;
  }, []);

  // CRUD operations
  const createTask = useCallback(async (taskData: TaskFormData): Promise<Task> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newTask = await TaskService.createTask(taskData, user.id);
      // Real-time subscription will handle adding to state
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user]);

  const updateTask = useCallback(async (id: string, taskData: Partial<TaskFormData>): Promise<Task> => {
    try {
      const updatedTask = await TaskService.updateTask(id, taskData);
      // Real-time subscription will handle updating state
      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      await TaskService.deleteTask(id);
      // Real-time subscription will handle removing from state
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const toggleTaskStatus = useCallback(async (id: string): Promise<Task> => {
    try {
      const updatedTask = await TaskService.toggleTaskStatus(id);
      // Real-time subscription will handle updating state
      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle task status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateTaskStatus = useCallback(async (id: string, status: Task['status']): Promise<Task> => {
    try {
      const updatedTask = await TaskService.updateTask(id, { status });
      // Real-time subscription will handle updating state
      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Filter and search operations with optimized re-fetching
  const updateFilters = useCallback((newFilters: TaskFilters) => {
    setFilters(newFilters);
    // Don't show loading for filter changes to improve UX
    if (initialLoadComplete.current) {
      fetchTasks(false);
    }
  }, [fetchTasks]);

  const updateSort = useCallback((newSort: TaskSortOptions) => {
    setSort(newSort);
    // Don't show loading for sort changes to improve UX
    if (initialLoadComplete.current) {
      fetchTasks(false);
    }
  }, [fetchTasks]);

  const clearFilters = useCallback(() => {
    setFilters({});
    if (initialLoadComplete.current) {
      fetchTasks(false);
    }
  }, [fetchTasks]);

  const searchTasks = useCallback(async (searchTerm: string) => {
    if (!user) return;
    
    try {
      setError(null);
      const searchResults = await TaskService.searchTasks(searchTerm, user.id);
      setTasks(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search tasks');
    }
  }, [user]);

  // Get filtered and sorted tasks (client-side filtering for real-time updates)
  const filteredTasks = tasks.filter(task => {
    if (filters.status && filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }
    if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }
    if (filters.assignee_id && task.assignee_id !== filters.assignee_id) {
      return false;
    }
    if (filters.project_id && task.project_id !== filters.project_id) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descriptionMatch = task.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descriptionMatch) {
        return false;
      }
    }
    if (filters.tags && filters.tags.length > 0) {
      const taskTags = task.tags || [];
      const hasMatchingTag = filters.tags.some(tag => taskTags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }
    return true;
  });

  // Sort filtered tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aValue = a[sort.field];
    const bValue = b[sort.field];
    
    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    if (aValue === bValue) return 0;
    
    const comparison = aValue < bValue ? -1 : 1;
    return sort.direction === 'asc' ? comparison : -comparison;
  });

  return {
    tasks: sortedTasks,
    loading,
    error,
    filters,
    sort,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    updateTaskStatus,
    updateFilters,
    updateSort,
    clearFilters,
    searchTasks,
    refetch: fetchTasks,
  };
}