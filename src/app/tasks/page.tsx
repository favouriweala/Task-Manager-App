import type { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import { AppLayout } from '@/components/layout/AppLayout'
import TaskDashboard from '@/components/dashboard/TaskDashboard'

export const metadata: Metadata = {
  title: 'Tasks - Task Manager',
  description: 'Manage your tasks with AI-powered insights and real-time collaboration',
}

export default function TasksPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <TaskDashboard />
      </AppLayout>
    </AuthGuard>
  )
}