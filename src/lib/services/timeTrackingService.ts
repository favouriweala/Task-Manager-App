import { createClient } from '@supabase/supabase-js'
import { TimeEntry, TimeReport, TimeTrackingSettings, TimeTrackingSummary } from '../../types/task';

export class TimeTrackingService {
  // Time Entry Management
  static async createTimeEntry(entry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>): Promise<TimeEntry> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('time_entries')
      .insert([entry])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async startTimer(taskId: string, userId: string, description?: string): Promise<TimeEntry> {
    // Stop any active timers first
    await this.stopActiveTimers(userId);

    const entry = await this.createTimeEntry({
      task_id: taskId,
      user_id: userId,
      start_time: new Date().toISOString(),
      description,
      is_billable: false,
      status: 'active'
    });

    return entry;
  }

  static async stopTimer(entryId: string): Promise<TimeEntry> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const endTime = new Date().toISOString();
    
    // Get the entry to calculate duration
    const { data: entry, error: fetchError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', entryId)
      .single();

    if (fetchError) throw fetchError;

    const startTime = new Date(entry.start_time);
    const endTimeDate = new Date(endTime);
    const durationMinutes = Math.floor((endTimeDate.getTime() - startTime.getTime()) / (1000 * 60));

    const { data, error } = await supabase
      .from('time_entries')
      .update({
        end_time: endTime,
        duration_minutes: durationMinutes,
        status: 'completed'
      })
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async pauseTimer(entryId: string): Promise<TimeEntry> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('time_entries')
      .update({ status: 'paused' })
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async resumeTimer(entryId: string): Promise<TimeEntry> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('time_entries')
      .update({ status: 'active' })
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async stopActiveTimers(userId: string): Promise<void> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: activeEntries } = await supabase
      .from('time_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (activeEntries && activeEntries.length > 0) {
      for (const entry of activeEntries) {
        await this.stopTimer(entry.id);
      }
    }
  }

  static async getActiveTimer(userId: string): Promise<TimeEntry | null> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async getTimeEntries(userId: string, filters?: {
    taskId?: string;
    projectId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<TimeEntry[]> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId);

    if (filters?.taskId) query = query.eq('task_id', filters.taskId);
    if (filters?.projectId) query = query.eq('project_id', filters.projectId);
    if (filters?.startDate) query = query.gte('start_time', filters.startDate);
    if (filters?.endDate) query = query.lte('start_time', filters.endDate);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('start_time', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): Promise<TimeEntry> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTimeEntry(entryId: string): Promise<void> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
  }

  // Time Tracking Summary
  static async getTaskTimeSummary(taskId: string, userId: string): Promise<TimeTrackingSummary | null> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('task_time_summary')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async getUserTimeSummary(userId: string, dateRange?: { start: string; end: string }): Promise<TimeTrackingSummary[]> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    let query = supabase
      .from('task_time_summary')
      .select('*')
      .eq('user_id', userId);

    if (dateRange) {
      query = query
        .gte('first_entry', dateRange.start)
        .lte('last_entry', dateRange.end);
    }

    const { data, error } = await query.order('total_minutes', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Settings Management
  static async getTimeTrackingSettings(userId: string): Promise<TimeTrackingSettings | null> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('time_tracking_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async updateTimeTrackingSettings(userId: string, settings: Partial<TimeTrackingSettings>): Promise<TimeTrackingSettings> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('time_tracking_settings')
      .upsert({
        user_id: userId,
        ...settings
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Reporting
  static async generateTimeReport(userId: string, reportConfig: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    startDate?: string;
    endDate?: string;
    taskIds?: string[];
    projectIds?: string[];
  }): Promise<any> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase.rpc('generate_time_report', {
      p_user_id: userId,
      p_report_type: reportConfig.type,
      p_start_date: reportConfig.startDate,
      p_end_date: reportConfig.endDate,
      p_task_ids: reportConfig.taskIds,
      p_project_ids: reportConfig.projectIds
    });

    if (error) throw error;
    return data;
  }

  static async saveTimeReport(report: Omit<TimeReport, 'id' | 'created_at' | 'updated_at'>): Promise<TimeReport> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('time_reports')
      .insert([report])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getTimeReports(userId: string): Promise<TimeReport[]> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('time_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Utility functions
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  }

  static calculateHourlyEarnings(minutes: number, hourlyRate: number): number {
    return (minutes / 60) * hourlyRate;
  }

  static getTodayTimeEntries(userId: string): Promise<TimeEntry[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getTimeEntries(userId, {
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString()
    });
  }

  static getWeekTimeEntries(userId: string): Promise<TimeEntry[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return this.getTimeEntries(userId, {
      startDate: startOfWeek.toISOString(),
      endDate: endOfWeek.toISOString()
    });
  }
}