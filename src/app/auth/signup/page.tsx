import { Metadata } from 'next'
import Link from 'next/link'
import SignupForm from '@/components/auth/signup-form'
import AuthGuard from '@/components/auth/auth-guard'

export const metadata: Metadata = {
  title: 'Sign Up | Zyra',
  description: 'Create your Zyra account',
}

export default function SignupPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-zyra-background to-zyra-surface flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold text-zyra-primary">
                Zyra
              </h1>
            </Link>
          </div>
          
          <SignupForm />
          
          <div className="text-center">
            <p className="text-sm text-zyra-text-secondary">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="font-medium text-zyra-primary hover:text-zyra-primary/80"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}