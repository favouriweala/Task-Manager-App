import type { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import { AppLayout } from '@/components/layout/AppLayout'
import { GoogleStyleTaskDashboard } from '@/components/tasks/GoogleStyleTaskDashboard'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Tasks | Zyra - Intelligent Task Management',
  description: 'Google-style task management with AI-powered insights, smart prioritization, and real-time collaboration',
  keywords: ['tasks', 'productivity', 'AI', 'collaboration', 'project management'],
}

export default function TasksPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Google-style Header with Dynamic Theming */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg dark:shadow-2xl">
            <div className="container-mobile sm:container-tablet lg:container-desktop mobile-padding sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                      Intelligent Tasks
                    </h1>
                    <p className="text-blue-100 mt-2 text-base sm:text-lg lg:text-xl font-medium">
                      AI-powered productivity with Google-style efficiency
                    </p>
                  </div>
                </div>
                
                {/* Quick Actions with Material Design */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-white">AI Assistant Active</span>
                  </div>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm font-medium text-white">Smart Insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content with Google-style Layout */}
          <div className="container-mobile sm:container-tablet lg:container-desktop mobile-padding sm:px-6 lg:px-8 py-8">
            <Suspense fallback={<DashboardSkeleton />}>
              <GoogleStyleTaskDashboard />
            </Suspense>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}