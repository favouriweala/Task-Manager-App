export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project_id?: string;
  assignee_id?: string;
  created_by: string;
  due_date?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Time tracking fields
  estimated_hours?: number;
  actual_hours?: number;
  // Legacy support for existing components
  completed?: boolean;
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  category?: string;
}

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];

export interface TaskFormData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority: TaskPriority;
  project_id?: string;
  assignee_id?: string;
  due_date?: string;
  tags?: string[];
  // Legacy support
  dueDate?: Date;
  category?: string;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee_id?: string;
  project_id?: string;
  search?: string;
  tags?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  estimated_hours_range?: {
    min: number;
    max: number;
  };
  actual_hours_range?: {
    min: number;
    max: number;
  };
  has_time_entries?: boolean;
  active_timer?: boolean;
  overdue?: boolean;
}

export interface TaskSortOptions {
  field: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'title' | 'status' | 'actual_hours' | 'estimated_hours';
  direction: 'asc' | 'desc';
}

// Time Tracking Types
export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  project_id?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  description?: string;
  is_billable: boolean;
  hourly_rate?: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WorkSession {
  id: string;
  time_entry_id: string;
  user_id: string;
  session_start: string;
  session_end?: string;
  session_duration_minutes?: number;
  session_type: 'work' | 'break' | 'meeting' | 'research';
  activity_description?: string;
  productivity_score?: number;
  interruptions_count: number;
  created_at: string;
  updated_at: string;
}

export interface TimeReport {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom' | 'project';
  date_range_start?: string;
  date_range_end?: string;
  filters?: Record<string, unknown>;
  report_data?: Record<string, unknown>;
  last_generated_at?: string;
  is_public: boolean;
  auto_refresh: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeTrackingSettings {
  id: string;
  user_id: string;
  default_timer_duration: number;
  break_duration: number;
  long_break_duration: number;
  auto_start_breaks: boolean;
  track_idle_time: boolean;
  idle_timeout_minutes: number;
  require_description: boolean;
  default_billable: boolean;
  timer_notifications: boolean;
  daily_summary_email: boolean;
  weekly_report_email: boolean;
  time_format: '12h' | '24h';
  week_start_day: number;
  created_at: string;
  updated_at: string;
}

export interface TimeTrackingSummary {
  user_id: string;
  task_id: string;
  project_id?: string;
  task_title: string;
  project_name?: string;
  total_minutes: number;
  total_hours: number;
  entry_count: number;
  first_entry: string;
  last_entry: string;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentEntry?: TimeEntry;
  elapsedTime: number;
  startTime?: Date;
}

// Enhanced Task interface with time tracking
export interface TaskWithTimeTracking extends Task {
  estimated_hours?: number;
  actual_hours?: number;
  time_tracking_enabled?: boolean;
  active_time_entry?: TimeEntry;
  time_entries?: TimeEntry[];
  total_time_minutes?: number;
}