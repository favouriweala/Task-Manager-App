import { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import { AppLayout } from '@/components/layout/AppLayout'
import { GoogleStyleAIAgentDashboard } from '@/components/ai/GoogleStyleAIAgentDashboard'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'AI Agents | Zyra - Intelligent Task Automation',
  description: 'Google-style AI agent management with advanced automation, smart insights, and predictive task optimization',
  keywords: ['AI', 'automation', 'agents', 'machine learning', 'productivity', 'smart insights'],
}

export default function AIAgentsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
          {/* Google-style AI Header */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shadow-lg dark:shadow-2xl">
            <div className="container-mobile sm:container-tablet lg:container-desktop mobile-padding sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                      AI Command Center
                    </h1>
                    <p className="text-purple-100 mt-2 text-base sm:text-lg lg:text-xl font-medium">
                      Intelligent automation with Google-scale AI capabilities
                    </p>
                  </div>
                </div>
                
                {/* AI Status Indicators */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <div className="relative">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <span className="text-sm font-medium text-white">Neural Network Active</span>
                  </div>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <svg className="w-5 h-5 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm font-medium text-white">Processing Insights</span>
                  </div>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-white rounded-full animate-pulse"></div>
                      <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-sm font-medium text-white">Learning Patterns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main AI Dashboard Content */}
          <div className="container-mobile sm:container-tablet lg:container-desktop mobile-padding sm:px-6 lg:px-8 py-8">
            <Suspense fallback={
              <div className="space-y-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
                    ))}
                  </div>
                </div>
              </div>
            }>
              <GoogleStyleAIAgentDashboard />
            </Suspense>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}