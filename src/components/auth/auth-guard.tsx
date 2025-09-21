'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/login',
  fallback 
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo)
      } else if (!requireAuth && user) {
        router.push('/dashboard')
      }
    }
  }, [user, loading, requireAuth, redirectTo, router])

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Check authentication requirements
  if (requireAuth && !user) {
    return null // Will redirect in useEffect
  }

  if (!requireAuth && user) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}

// Higher-order component version
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}