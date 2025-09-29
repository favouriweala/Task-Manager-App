import { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import { AppLayout } from '@/components/layout/AppLayout'
import { SettingsDashboard } from '@/components/settings/SettingsDashboard'
import { Settings, Shield, Brain, Users, Bell, Palette } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Settings | Zyra',
  description: 'Google-inspired settings and preferences for enterprise task management with AI-powered customization',
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Enhanced Header - Mobile-first responsive design */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-mobile dark:shadow-mobile-dark safe-top">
            <div className="container-mobile sm:container-tablet lg:container-desktop mobile-padding sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="flex flex-col space-y-4 sm:space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                    <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings & Preferences</h1>
                    <p className="text-blue-100 mt-1 text-sm sm:text-base">Customize your workspace with enterprise-grade controls</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <Shield className="h-4 h-4 sm:h-5 sm:w-5 text-white" />
                    <span className="text-xs sm:text-sm font-medium text-white">
                      Security
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <Brain className="h-4 h-4 sm:h-5 sm:w-5 text-white" />
                    <span className="text-xs sm:text-sm font-medium text-white">
                      AI Settings
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <Users className="h-4 h-4 sm:h-5 sm:w-5 text-white" />
                    <span className="text-xs sm:text-sm font-medium text-white">
                      Team
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Settings Dashboard */}
          <div className="container-mobile sm:container-tablet lg:container-desktop mobile-padding sm:px-6 lg:px-8 py-6 sm:py-8">
            <SettingsDashboard />
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}