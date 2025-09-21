import { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import { AppLayout } from '@/components/layout/AppLayout'
import { TaskDashboard } from '@/components/dashboard/TaskDashboard'

export const metadata: Metadata = {
  title: 'Dashboard | Zyra',
  description: 'Your task management dashboard with filtering, sorting, and real-time updates',
}

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AppLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Task Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your tasks with filtering, sorting, and real-time updates
          </p>
        </div>
        
        <TaskDashboard />
      </AppLayout>
    </AuthGuard>
  )
}