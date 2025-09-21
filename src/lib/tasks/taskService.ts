import { supabase } from '@/lib/supabase/client';
import { Task, TaskFormData, TaskFilters, TaskSortOptions } from '@/types/task';

export class TaskService {
  /**
   * Create a new task
   */
  static async createTask(taskData: TaskFormData, userId: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'todo',
        priority: taskData.priority,
        project_id: taskData.project_id,
        assignee_id: taskData.assignee_id,
        created_by: userId,
        due_date: taskData.due_date,
        tags: taskData.tags || [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all tasks with optional filtering and sorting
   */
  static async getTasks(
    filters?: TaskFilters,
    sort?: TaskSortOptions,
    userId?: string
  ): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!assignee_id(id, full_name, email),
        created_by_user:profiles!created_by(id, full_name, email),
        project:projects(id, name)
      `);

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }
      if (filters.assignee_id) {
        query = query.eq('assignee_id', filters.assignee_id);
      }
      if (filters.project_id) {
        query = query.eq('project_id', filters.project_id);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }
    }

    // Apply user-based filtering (only show tasks user has access to)
    if (userId) {
      query = query.or(`assignee_id.eq.${userId},created_by.eq.${userId}`);
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single task by ID
   */
  static async getTaskById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!assignee_id(id, full_name, email),
        created_by_user:profiles!created_by(id, full_name, email),
        project:projects(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Task not found
      }
      throw new Error(`Failed to fetch task: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing task
   */
  static async updateTask(id: string, taskData: Partial<TaskFormData>): Promise<Task> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are provided
    if (taskData.title !== undefined) updateData.title = taskData.title;
    if (taskData.description !== undefined) updateData.description = taskData.description;
    if (taskData.status !== undefined) updateData.status = taskData.status;
    if (taskData.priority !== undefined) updateData.priority = taskData.priority;
    if (taskData.project_id !== undefined) updateData.project_id = taskData.project_id;
    if (taskData.assignee_id !== undefined) updateData.assignee_id = taskData.assignee_id;
    if (taskData.due_date !== undefined) updateData.due_date = taskData.due_date;
    if (taskData.tags !== undefined) updateData.tags = taskData.tags;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        assignee:profiles!assignee_id(id, full_name, email),
        created_by_user:profiles!created_by(id, full_name, email),
        project:projects(id, name)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a task
   */
  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  /**
   * Toggle task status between todo and done
   */
  static async toggleTaskStatus(id: string): Promise<Task> {
    // First get the current task
    const currentTask = await this.getTaskById(id);
    if (!currentTask) {
      throw new Error('Task not found');
    }

    // Toggle status
    const newStatus = currentTask.status === 'done' ? 'todo' : 'done';
    
    return this.updateTask(id, { status: newStatus });
  }

  /**
   * Get tasks by project
   */
  static async getTasksByProject(projectId: string, userId?: string): Promise<Task[]> {
    return this.getTasks({ project_id: projectId }, undefined, userId);
  }

  /**
   * Get tasks assigned to a user
   */
  static async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return this.getTasks({ assignee_id: assigneeId });
  }

  /**
   * Search tasks by text
   */
  static async searchTasks(searchTerm: string, userId?: string): Promise<Task[]> {
    return this.getTasks({ search: searchTerm }, undefined, userId);
  }

  /**
   * Get task statistics
   */
  static async getTaskStats(userId?: string): Promise<{
    total: number;
    todo: number;
    in_progress: number;
    review: number;
    done: number;
    overdue: number;
  }> {
    let query = supabase
      .from('tasks')
      .select('status, due_date');

    if (userId) {
      query = query.or(`assignee_id.eq.${userId},created_by.eq.${userId}`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch task statistics: ${error.message}`);
    }

    const stats = {
      total: data.length,
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
      overdue: 0,
    };

    const now = new Date();
    
    data.forEach(task => {
      stats[task.status as keyof typeof stats]++;
      
      // Check for overdue tasks
      if (task.due_date && task.status !== 'done') {
        const dueDate = new Date(task.due_date);
        if (dueDate < now) {
          stats.overdue++;
        }
      }
    });

    return stats;
  }
}