import { Metadata } from 'next'
import Link from 'next/link'
import SignupForm from '@/components/auth/signup-form'
import AuthGuard from '@/components/auth/auth-guard'
import { Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sign Up | Zyra',
  description: 'Create your Zyra account to start using AI-powered task management.',
}

export default function SignupPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="zyra-page-container max-w-md w-full">
          <div className="zyra-card p-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="zyra-icon-container-sm bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">Zyra</span>
              </Link>
            </div>

            {/* Signup Form */}
            <SignupForm />

            {/* Sign in link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}