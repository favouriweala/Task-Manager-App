import { Metadata } from 'next'
import Link from 'next/link'
import AuthGuard from '@/components/auth/auth-guard'

export const metadata: Metadata = {
  title: 'Verify Email | Zyra',
  description: 'Verify your email address to complete registration',
}

export default function VerifyEmailPage() {
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
          
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Check Your Email
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
              </p>
              
              <div className="space-y-4">
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/auth/signup"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to Sign Up
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the email?{' '}
              <button className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Resend verification email
              </button>
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}