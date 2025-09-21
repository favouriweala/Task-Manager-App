import { supabase } from '@/lib/supabase/client'
// Remove server import to avoid next/headers error in client components
// import { supabaseAdmin } from '@/lib/supabase/server'

export interface AuthError {
  message: string
  status?: number
}

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  password: string
}

// Client-side auth helpers
export const authHelpers = {
  async signUp({ email, password, fullName }: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  },

  async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message } }
    }
  },

  async resetPassword({ email }: ResetPasswordData) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message } }
    }
  },

  async updatePassword({ password }: UpdatePasswordData) {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message } }
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error

      return { user, error: null }
    } catch (error: any) {
      return { user: null, error: { message: error.message } }
    }
  },

  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error

      return { session, error: null }
    } catch (error: any) {
      return { session: null, error: { message: error.message } }
    }
  },

  async signInWithProvider(provider: 'google' | 'github' | 'discord') {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      throw new Error(error.message)
    }
  },
}

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}