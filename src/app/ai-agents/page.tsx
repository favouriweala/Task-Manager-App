import { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import { AppLayout } from '@/components/layout/AppLayout'
import { AIAgentDashboard } from '@/components/ai/AIAgentDashboard'

export const metadata: Metadata = {
  title: 'AI Agents | Zyra',
  description: 'Monitor and manage your AI agents and their suggestions',
}

export default function AIAgentsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AppLayout>
        <AIAgentDashboard />
      </AppLayout>
    </AuthGuard>
  )
}