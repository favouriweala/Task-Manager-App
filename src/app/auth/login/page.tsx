import { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/components/auth/login-form'
import AuthGuard from '@/components/auth/auth-guard'

export const metadata: Metadata = {
  title: 'Sign In | Zyra',
  description: 'Sign in to your Zyra account',
}

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-zyra-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold text-zyra-primary">
                Zyra
              </h1>
            </Link>
          </div>
          
          <LoginForm />
          
          <div className="text-center">
            <p className="text-sm text-zyra-text-secondary">
              Don&apos;t have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="font-medium text-zyra-primary hover:text-zyra-primary/80"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}