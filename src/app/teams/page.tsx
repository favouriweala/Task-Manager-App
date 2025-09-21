import { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import { AppLayout } from '@/components/layout/AppLayout'
import { Teams } from '@/components/Teams'

export const metadata: Metadata = {
  title: 'Teams | Zyra',
  description: 'Manage your teams and collaborate with others',
}

export default function TeamsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AppLayout>
        <Teams />
      </AppLayout>
    </AuthGuard>
  )
}