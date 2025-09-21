import { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import { AppLayout } from '@/components/layout/AppLayout'
import { TeamCollaborationDashboard } from '@/components/teams/TeamCollaborationDashboard'

export const metadata: Metadata = {
  title: 'Team Collaboration - Task Manager',
  description: 'Collaborate with your team, manage projects, and track progress together.',
}

export default function TeamsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AppLayout>
        <TeamCollaborationDashboard />
      </AppLayout>
    </AuthGuard>
  )
}