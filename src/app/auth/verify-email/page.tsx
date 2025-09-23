import { Metadata } from 'next'
import Link from 'next/link'
import AuthGuard from '@/components/auth/auth-guard'
import { CheckCircle, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Verify Email | Zyra',
  description: 'Verify your email address to complete your Zyra account setup.',
}

export default function VerifyEmailPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="zyra-page-container max-w-md w-full">
          <div className="zyra-card p-8 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="zyra-icon-container-sm bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">Zyra</span>
              </Link>
            </div>

            {/* Success Icon */}
            <div className="zyra-icon-container mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>

            {/* Message */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Check your email
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              We&apos;ve sent a verification link to your email address. 
              Please click the link to verify your account and complete the setup.
            </p>
            {/* Back to signup link */}
            <Link 
              href="/auth/signup" 
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Back to sign up
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}