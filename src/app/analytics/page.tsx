import { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import { AppLayout } from '@/components/layout/AppLayout'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { BarChart3, TrendingUp, Brain, Target } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Analytics | Zyra',
  description: 'Advanced analytics and insights for data-driven task management and productivity optimization',
}

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        {/* Enhanced Header with Google Material Design */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Insights</h1>
                    <p className="text-gray-600 dark:text-gray-400">Data-driven insights to optimize your productivity</p>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Efficiency</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">+15%</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Insights</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Goals Met</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">8/10</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnalyticsDashboard />
        </div>
      </AppLayout>
    </AuthGuard>
  )
}