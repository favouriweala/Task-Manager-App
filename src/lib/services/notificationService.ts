import { createClient } from '@supabase/supabase-js';

// Create Supabase client without explicit typing to avoid type issues
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type NotificationType = 
  | 'task_assigned' 
  | 'task_completed' 
  | 'task_due_soon' 
  | 'task_overdue'
  | 'task_updated'
  | 'comment_added' 
  | 'project_invitation' 
  | 'project_update'
  | 'ai_suggestion' 
  | 'ai_merge_recommendation' 
  | 'system_alert';

type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
  actionUrl?: string;
  sendEmail?: boolean;
  relatedTaskId?: string;
  relatedProjectId?: string;
}

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  notification_types: NotificationType[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone?: string;
}

class NotificationService {
  async createNotification(data: CreateNotificationData) {
    try {
      // Get user profile for email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', data.userId)
        .single();

      // Insert notification
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          priority: data.priority || 'normal',
          metadata: data.metadata || {},
          action_url: data.actionUrl,
          read: false
        })
        .select()
        .single();

      if (notificationError) throw notificationError;

      // Send email if requested and user has email
      if (data.sendEmail && profile?.email) {
        await supabase
          .from('email_queue')
          .insert({
            to_email: profile.email,
            subject: data.title,
            html_content: `<p>${data.message}</p>`,
            template_id: 'notification',
            template_data: {
              title: data.title,
              message: data.message,
              actionUrl: data.actionUrl
            },
            status: 'pending'
          });
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getNotifications(userId: string, options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  } = {}) {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options.unreadOnly) {
        query = query.eq('read', false);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>) {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Real-time subscription methods
  subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  unsubscribeFromNotifications(subscription: any) {
    return supabase.removeChannel(subscription);
  }
}

export const notificationService = new NotificationService();
export default notificationService;