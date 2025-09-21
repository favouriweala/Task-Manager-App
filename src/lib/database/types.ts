export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin' | 'manager'
          preferences: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'manager'
          preferences?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'manager'
          preferences?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          owner_id: string
          status: 'active' | 'archived' | 'completed'
          settings: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          owner_id: string
          status?: 'active' | 'archived' | 'completed'
          settings?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          owner_id?: string
          status?: 'active' | 'archived' | 'completed'
          settings?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          completed_at: string | null
          project_id: string | null
          assignee_id: string | null
          created_by: string
          tags: string[]
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          completed_at?: string | null
          project_id?: string | null
          assignee_id?: string | null
          created_by: string
          tags?: string[]
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          completed_at?: string | null
          project_id?: string | null
          assignee_id?: string | null
          created_by?: string
          tags?: string[]
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          joined_at?: string
        }
      }
      task_comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      task_attachments: {
        Row: {
          id: string
          task_id: string
          file_name: string
          file_url: string
          file_size: number | null
          mime_type: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          file_name: string
          file_url: string
          file_size?: number | null
          mime_type?: string | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          file_name?: string
          file_url?: string
          file_size?: number | null
          mime_type?: string | null
          uploaded_by?: string
          created_at?: string
        }
      }
      task_embeddings: {
        Row: {
          id: string
          task_id: string
          content: string
          embedding: number[]
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          content: string
          embedding: number[]
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          content?: string
          embedding?: number[]
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
      ai_agents: {
        Row: {
          id: string
          name: string
          type: 'project_merger' | 'task_optimizer' | 'workflow_automator' | 'smart_scheduler' | 'similarity_analyzer' | 'duplicate_detector'
          description: string | null
          is_active: boolean
          configuration: Record<string, unknown>
          capabilities: Record<string, unknown>
          learning_data: Record<string, unknown>
          performance_metrics: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'project_merger' | 'task_optimizer' | 'workflow_automator' | 'smart_scheduler' | 'similarity_analyzer' | 'duplicate_detector'
          description?: string | null
          is_active?: boolean
          configuration?: Record<string, unknown>
          capabilities?: Record<string, unknown>
          learning_data?: Record<string, unknown>
          performance_metrics?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'project_merger' | 'task_optimizer' | 'workflow_automator' | 'smart_scheduler' | 'similarity_analyzer' | 'duplicate_detector'
          description?: string | null
          is_active?: boolean
          configuration?: Record<string, unknown>
          capabilities?: Record<string, unknown>
          learning_data?: Record<string, unknown>
          performance_metrics?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
      ai_agent_actions: {
        Row: {
          id: string
          agent_id: string
          user_id: string | null
          action_type: string
          target_type: 'task' | 'project' | 'user' | 'workflow'
          target_id: string | null
          suggestion: Record<string, unknown>
          confidence: number
          status: 'pending' | 'accepted' | 'rejected' | 'expired'
          user_feedback: string | null
          applied_at: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          user_id?: string | null
          action_type: string
          target_type: 'task' | 'project' | 'user' | 'workflow'
          target_id?: string | null
          suggestion: Record<string, unknown>
          confidence: number
          status?: 'pending' | 'accepted' | 'rejected' | 'expired'
          user_feedback?: string | null
          applied_at?: string | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          user_id?: string | null
          action_type?: string
          target_type?: 'task' | 'project' | 'user' | 'workflow'
          target_id?: string | null
          suggestion?: Record<string, unknown>
          confidence?: number
          status?: 'pending' | 'accepted' | 'rejected' | 'expired'
          user_feedback?: string | null
          applied_at?: string | null
          expires_at?: string
          created_at?: string
        }
      }
      project_similarities: {
        Row: {
          id: string
          project_a_id: string
          project_b_id: string
          similarity_score: number
          similarity_factors: Record<string, unknown>
          merge_recommendation: Record<string, unknown>
          analyzed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          project_a_id: string
          project_b_id: string
          similarity_score: number
          similarity_factors: Record<string, unknown>
          merge_recommendation: Record<string, unknown>
          analyzed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_a_id?: string
          project_b_id?: string
          similarity_score?: number
          similarity_factors?: Record<string, unknown>
          merge_recommendation?: Record<string, unknown>
          analyzed_at?: string
          created_at?: string
        }
      }
      email_queue: {
        Row: {
          id: string
          to_email: string
          subject: string
          html_content: string
          text_content: string | null
          template_id: string | null
          template_data: Record<string, unknown>
          status: 'pending' | 'sent' | 'failed' | 'cancelled'
          attempts: number
          max_attempts: number
          error_message: string | null
          scheduled_for: string
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          to_email: string
          subject: string
          html_content: string
          text_content?: string | null
          template_id?: string | null
          template_data?: Record<string, unknown>
          status?: 'pending' | 'sent' | 'failed' | 'cancelled'
          attempts?: number
          max_attempts?: number
          error_message?: string | null
          scheduled_for?: string
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          to_email?: string
          subject?: string
          html_content?: string
          text_content?: string | null
          template_id?: string | null
          template_data?: Record<string, unknown>
          status?: 'pending' | 'sent' | 'failed' | 'cancelled'
          attempts?: number
          max_attempts?: number
          error_message?: string | null
          scheduled_for?: string
          sent_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'task_assigned' | 'task_completed' | 'task_due_soon' | 'task_overdue' | 'comment_added' | 'project_invitation' | 'project_update' | 'ai_suggestion' | 'ai_merge_recommendation' | 'system_alert'
          title: string
          message: string
          data: Record<string, unknown>
          read: boolean
          email_sent: boolean
          priority: 'low' | 'normal' | 'high' | 'urgent'
          related_task_id: string | null
          related_project_id: string | null
          created_at: string
          expires_at: string | null
          action_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'task_assigned' | 'task_completed' | 'task_due_soon' | 'task_overdue' | 'comment_added' | 'project_invitation' | 'project_update' | 'ai_suggestion' | 'ai_merge_recommendation' | 'system_alert'
          title: string
          message: string
          data?: Record<string, unknown>
          read?: boolean
          email_sent?: boolean
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          related_task_id?: string | null
          related_project_id?: string | null
          created_at?: string
          expires_at?: string | null
          action_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'task_assigned' | 'task_completed' | 'task_due_soon' | 'task_overdue' | 'comment_added' | 'project_invitation' | 'project_update' | 'ai_suggestion' | 'ai_merge_recommendation' | 'system_alert'
          title?: string
          message?: string
          data?: Record<string, unknown>
          read?: boolean
          email_sent?: boolean
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          related_task_id?: string | null
          related_project_id?: string | null
          created_at?: string
          expires_at?: string | null
          action_url?: string | null
        }
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_enabled: boolean
          push_enabled: boolean
          preferences: Record<string, unknown>
          quiet_hours_start: string
          quiet_hours_end: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          push_enabled?: boolean
          preferences?: Record<string, unknown>
          quiet_hours_start?: string
          quiet_hours_end?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          push_enabled?: boolean
          preferences?: Record<string, unknown>
          quiet_hours_start?: string
          quiet_hours_end?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_task_embeddings: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          task_id: string
          content: string
          metadata: Record<string, unknown>
          similarity: number
        }[]
      }
      get_notification_stats: {
        Args: {
          user_uuid: string
        }
        Returns: {
          total_notifications: number
          unread_notifications: number
          high_priority_unread: number
          recent_notifications: number
        }[]
      }
      cleanup_expired_notifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type ProjectMember = Database['public']['Tables']['project_members']['Row']
export type TaskComment = Database['public']['Tables']['task_comments']['Row']
export type TaskAttachment = Database['public']['Tables']['task_attachments']['Row']
export type TaskEmbedding = Database['public']['Tables']['task_embeddings']['Row']
export type AIAgent = Database['public']['Tables']['ai_agents']['Row']
export type AIAgentAction = Database['public']['Tables']['ai_agent_actions']['Row']
export type ProjectSimilarity = Database['public']['Tables']['project_similarities']['Row']

export type InsertProfile = Database['public']['Tables']['profiles']['Insert']
export type InsertProject = Database['public']['Tables']['projects']['Insert']
export type InsertTask = Database['public']['Tables']['tasks']['Insert']
export type InsertProjectMember = Database['public']['Tables']['project_members']['Insert']
export type InsertTaskComment = Database['public']['Tables']['task_comments']['Insert']
export type InsertTaskAttachment = Database['public']['Tables']['task_attachments']['Insert']
export type InsertTaskEmbedding = Database['public']['Tables']['task_embeddings']['Insert']
export type InsertAIAgent = Database['public']['Tables']['ai_agents']['Insert']
export type InsertAIAgentAction = Database['public']['Tables']['ai_agent_actions']['Insert']
export type InsertProjectSimilarity = Database['public']['Tables']['project_similarities']['Insert']

export type UpdateProfile = Database['public']['Tables']['profiles']['Update']
export type UpdateProject = Database['public']['Tables']['projects']['Update']
export type UpdateTask = Database['public']['Tables']['tasks']['Update']
export type UpdateProjectMember = Database['public']['Tables']['project_members']['Update']
export type UpdateTaskComment = Database['public']['Tables']['task_comments']['Update']
export type UpdateTaskAttachment = Database['public']['Tables']['task_attachments']['Update']
export type UpdateTaskEmbedding = Database['public']['Tables']['task_embeddings']['Update']
export type UpdateAIAgent = Database['public']['Tables']['ai_agents']['Update']
export type UpdateAIAgentAction = Database['public']['Tables']['ai_agent_actions']['Update']
export type UpdateProjectSimilarity = Database['public']['Tables']['project_similarities']['Update']

// Helper types for new tables
export type EmailQueue = Database['public']['Tables']['email_queue']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationPreference = Database['public']['Tables']['notification_preferences']['Row']

export type InsertEmailQueue = Database['public']['Tables']['email_queue']['Insert']
export type InsertNotification = Database['public']['Tables']['notifications']['Insert']
export type InsertNotificationPreference = Database['public']['Tables']['notification_preferences']['Insert']

export type UpdateEmailQueue = Database['public']['Tables']['email_queue']['Update']
export type UpdateNotification = Database['public']['Tables']['notifications']['Update']
export type UpdateNotificationPreference = Database['public']['Tables']['notification_preferences']['Update']