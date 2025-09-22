import { Metadata } from 'next'
import AuthGuard from '@/components/auth/auth-guard'
import { AppLayout } from '@/components/layout/AppLayout'
import TaskDashboard from '@/components/dashboard/TaskDashboard'

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
  Globe
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'AI Command Center | Zyra',
  description: 'Enterprise-grade AI-native task management with Google Gemini 2.5 Flash, predictive analytics, and intelligent automation',
}

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AppLayout>
        {/* AI Command Center Header */}
        <div className="zyra-section mb-12 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 -mx-4 sm:-mx-6 px-6 sm:px-8 py-12 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="zyra-icon-container">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="zyra-page-title text-3xl lg:text-4xl">
                    AI Command Center
                  </h1>
                  <p className="zyra-page-subtitle text-lg">
                    Enterprise-grade productivity with Google Gemini 2.5 Flash
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="zyra-badge-success">
                  <Activity className="w-3 h-3 mr-1" />
                  AI Agents Active
                </Badge>
                <Badge variant="secondary" className="zyra-badge-primary">
                  <Zap className="w-3 h-3 mr-1" />
                  Real-time Sync
                </Badge>
                <Badge variant="secondary" className="zyra-badge-secondary">
                  <Shield className="w-3 h-3 mr-1" />
                  Enterprise Security
                </Badge>
              </div>
            </div>
            
            {/* AI Performance Metrics */}
            <div className="zyra-section-grid zyra-grid-4">
              <Card className="zyra-card">
                <CardContent className="p-6 text-center">
                  <div className="zyra-icon-container-sm mb-2 mx-auto">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="zyra-metric-value">98.7%</div>
                  <div className="zyra-metric-label">AI Accuracy</div>
                </CardContent>
              </Card>
              
              <Card className="zyra-card">
                <CardContent className="p-6 text-center">
                  <div className="zyra-icon-container-sm mb-2 mx-auto">
                    <Rocket className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="zyra-metric-value">2.3x</div>
                  <div className="zyra-metric-label">Productivity</div>
                </CardContent>
              </Card>
              
              <Card className="zyra-card">
                <CardContent className="p-6 text-center">
                  <div className="zyra-icon-container-sm mb-2 mx-auto">
                    <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="zyra-metric-value">47</div>
                  <div className="zyra-metric-label">Auto Actions</div>
                </CardContent>
              </Card>
              
              <Card className="zyra-card">
                <CardContent className="p-6 text-center">
                  <div className="zyra-icon-container-sm mb-2 mx-auto">
                    <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="zyra-metric-value">12h</div>
                  <div className="zyra-metric-label">Time Saved</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* AI Agent Automation Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="lg:col-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                <Cpu className="w-5 h-5" />
                AI Agent Orchestration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Project Merger</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Active</Badge>
                  </div>
                  <Progress value={87} className="h-2 mb-2" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Analyzing 23 projects for optimization</p>
                </div>
                
                <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Task Optimizer</span>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Learning</Badge>
                  </div>
                  <Progress value={94} className="h-2 mb-2" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Optimizing 156 task assignments</p>
                </div>
                
                <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Smart Scheduler</span>
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Processing</Badge>
                  </div>
                  <Progress value={76} className="h-2 mb-2" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Predicting optimal timelines</p>
                </div>
                
                <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Workflow Automator</span>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">Standby</Badge>
                  </div>
                  <Progress value={45} className="h-2 mb-2" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Ready for pattern recognition</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                <Lightbulb className="w-5 h-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Resource Bottleneck</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Team Alpha overloaded by 23%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Merge Opportunity</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">3 similar projects detected</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Efficiency Boost</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Automate 12 recurring tasks</p>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                View All Insights
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-emerald-900 dark:text-emerald-100">Team Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">127%</div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">vs last sprint</p>
              <Progress value={85} className="h-1 mt-2" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-900 dark:text-blue-100">Predictive Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">94.2%</div>
              <p className="text-xs text-blue-700 dark:text-blue-300">delivery estimates</p>
              <Progress value={94} className="h-1 mt-2" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-violet-900 dark:text-violet-100">Automation Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900 dark:text-violet-100 mb-1">67%</div>
              <p className="text-xs text-violet-700 dark:text-violet-300">tasks automated</p>
              <Progress value={67} className="h-1 mt-2" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-rose-200 dark:border-rose-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-rose-900 dark:text-rose-100">Risk Mitigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-1">8.3%</div>
              <p className="text-xs text-rose-700 dark:text-rose-300">risk reduction</p>
              <Progress value={83} className="h-1 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Real-time Collaboration & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Network className="w-5 h-5" />
                Real-time Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Team Members</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <Users className="w-3 h-3 mr-1" />
                  12 Online
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Sarah Chen - Editing Project Alpha</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Mike Johnson - Code Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">AI Agent - Optimizing Tasks</span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span>Sync Status</span>
                  <span className="text-green-600 dark:text-green-400">Real-time</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <Database className="w-5 h-5" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>AI Processing</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Database Load</span>
                    <span>34%</span>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>API Response</span>
                    <span>156ms</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2 border-t border-amber-200 dark:border-amber-700">
                <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-700 dark:text-amber-300">Global CDN: 99.9% uptime</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <TaskDashboard />
      </AppLayout>
    </AuthGuard>
  )
}