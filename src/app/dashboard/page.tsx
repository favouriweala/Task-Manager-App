import type { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import { AppLayout } from '@/components/layout/AppLayout'
import TaskDashboard from '@/components/dashboard/TaskDashboard'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/ui/skeleton'

import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target, 
  Clock, 
  Activity,
  Shield,
  Rocket,
  Cpu,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Network,
  Users,
  Database,
  Globe,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Dashboard | Zyra - Intelligent Task Management',
  description: 'Google-style AI dashboard with enterprise-grade task management, predictive analytics, and intelligent automation',
  keywords: ['dashboard', 'AI', 'productivity', 'analytics', 'task management'],
}

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Google-style Header with Dynamic Theming */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg dark:shadow-2xl">
            <div className="container-mobile sm:container-tablet lg:container-desktop mobile-padding sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                    <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                      AI Command Center
                    </h1>
                    <p className="text-blue-100 mt-2 text-base sm:text-lg lg:text-xl font-medium">
                      Enterprise-grade productivity with Google Gemini 2.5 Flash
                    </p>
                  </div>
                </div>
                
                {/* Quick Actions with Material Design */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-white">AI Agents Active</span>
                  </div>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                    <span className="text-sm font-medium text-white">Real-time Sync</span>
                  </div>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                    <span className="text-sm font-medium text-white">Enterprise Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content with Google-style Layout */}
          <div className="container-mobile sm:container-tablet lg:container-desktop mobile-padding sm:px-6 lg:px-8 py-8">
            {/* AI Performance Metrics - Google Cards Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 dark:bg-gray-800/80">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">98.7%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">AI Accuracy</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 dark:bg-gray-800/80">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">2.3x</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Productivity</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 dark:bg-gray-800/80">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">47</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Auto Actions</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 dark:bg-gray-800/80">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">12h</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Time Saved</div>
                </CardContent>
              </Card>
            </div>
            {/* AI Agent Automation Panel - Google Cards Style */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800/80">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Cpu className="w-5 h-5 text-white" />
                    </div>
                    AI Agent Orchestration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-2xl border border-green-100 dark:border-green-800/30 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Project Merger</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-0 shadow-sm">Active</Badge>
                      </div>
                      <Progress value={87} className="h-2 mb-3 bg-green-100 dark:bg-green-900/30" />
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Analyzing 23 projects for optimization</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Task Optimizer</span>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0 shadow-sm">Learning</Badge>
                      </div>
                      <Progress value={94} className="h-2 mb-3 bg-blue-100 dark:bg-blue-900/30" />
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Optimizing 156 task assignments</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 p-6 rounded-2xl border border-purple-100 dark:border-purple-800/30 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Smart Scheduler</span>
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-0 shadow-sm">Processing</Badge>
                      </div>
                      <Progress value={76} className="h-2 mb-3 bg-purple-100 dark:bg-purple-900/30" />
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Balancing 89 team schedules</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-2xl border border-orange-100 dark:border-orange-800/30 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Priority Engine</span>
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-0 shadow-sm">Optimizing</Badge>
                      </div>
                      <Progress value={91} className="h-2 mb-3 bg-orange-100 dark:bg-orange-900/30" />
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Rebalancing task priorities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights Panel */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800/80">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-100 dark:border-blue-800/30">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <TrendingUp className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Productivity Surge</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Team velocity increased 23% this week</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-100 dark:border-green-800/30">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Goal Achievement</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">87% of weekly targets completed</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl border border-orange-100 dark:border-orange-800/30">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertTriangle className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Attention Needed</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">3 high-priority tasks due tomorrow</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Content */}
            <Suspense fallback={<DashboardSkeleton />}>
              <TaskDashboard />
            </Suspense>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}