import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zyra - Enterprise Task Manager',
  description: 'AI-powered task management with real-time collaboration',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            Zyra
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            AI-powered task management with real-time collaboration. 
            Streamline your workflow and boost productivity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Get Started
            </Link>
            <Link 
              href="/auth/login"
              className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border border-blue-600 transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Fast & Efficient
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Built with Next.js 15 and TypeScript for optimal performance and type safety.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Secure & Reliable
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enterprise-grade security with Supabase authentication and RLS policies.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Smart task suggestions and insights powered by Google Gemini AI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
