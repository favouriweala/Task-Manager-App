import { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import { AppLayout } from '@/components/layout/AppLayout'
import { TaskDashboard } from '@/components/dashboard/TaskDashboard'
import { Sparkles, BarChart3, Brain, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard | Zyra',
  description: 'AI-powered task management dashboard with intelligent insights and real-time collaboration',
}

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AppLayout>
        {/* Enhanced Header with Mobile-First Design */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 sm:py-8 rounded-xl sm:rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-mobile">
          <div className="flex-mobile-col lg:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-responsive-xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    Welcome back
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-responsive-base">
                    Your AI-powered productivity command center
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Stats Cards - Mobile Optimized */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 w-full sm:w-auto">
              <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-mobile border border-gray-200 dark:border-gray-700 text-center touch-manipulation">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md sm:rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">94%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Efficiency</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-mobile border border-gray-200 dark:border-gray-700 text-center touch-manipulation">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 dark:bg-purple-900/30 rounded-md sm:rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">12</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">AI Insights</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-mobile border border-gray-200 dark:border-gray-700 text-center touch-manipulation">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900/30 rounded-md sm:rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">5</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Team Active</div>
              </div>
            </div>
          </div>
        </div>
        
        <TaskDashboard />
      </AppLayout>
    </AuthGuard>
  )
}