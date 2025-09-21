import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// For server components
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// For API routes
export const createRouteHandlerSupabaseClient = () => {
  const cookieStore = cookies()
  return createRouteHandlerClient({ cookies: () => cookieStore })
}

// For server-side admin operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)