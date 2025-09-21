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

export type InsertProfile = Database['public']['Tables']['profiles']['Insert']
export type InsertProject = Database['public']['Tables']['projects']['Insert']
export type InsertTask = Database['public']['Tables']['tasks']['Insert']
export type InsertProjectMember = Database['public']['Tables']['project_members']['Insert']
export type InsertTaskComment = Database['public']['Tables']['task_comments']['Insert']
export type InsertTaskAttachment = Database['public']['Tables']['task_attachments']['Insert']
export type InsertTaskEmbedding = Database['public']['Tables']['task_embeddings']['Insert']

export type UpdateProfile = Database['public']['Tables']['profiles']['Update']
export type UpdateProject = Database['public']['Tables']['projects']['Update']
export type UpdateTask = Database['public']['Tables']['tasks']['Update']
export type UpdateProjectMember = Database['public']['Tables']['project_members']['Update']
export type UpdateTaskComment = Database['public']['Tables']['task_comments']['Update']
export type UpdateTaskAttachment = Database['public']['Tables']['task_attachments']['Update']
export type UpdateTaskEmbedding = Database['public']['Tables']['task_embeddings']['Update']