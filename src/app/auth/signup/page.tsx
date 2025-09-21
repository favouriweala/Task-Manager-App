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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                Zyra
              </h1>
            </Link>
          </div>
          
          <SignupForm />
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
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