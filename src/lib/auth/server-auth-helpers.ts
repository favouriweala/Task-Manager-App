import { supabaseAdmin } from '@/lib/supabase/server'

export interface AuthError {
  message: string
  status?: number
}

// Server-side a auth helpers (only for API routes and server components)
export const serverAuthHelpers = {
  async createUser(email: string, password: string, metadata?: Record<string, any>) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: metadata,
        email_confirm: true,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  },

  async deleteUser(userId: string) {
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message } }
    }
  },

  async updateUserMetadata(userId: string, metadata: Record<string, any>) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          user_metadata: metadata,
        }
      )

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  },

  async listUsers(page = 1, perPage = 50) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  },
}