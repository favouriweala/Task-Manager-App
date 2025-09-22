import { Metadata } from 'next';
import { Brain, Sparkles, Zap } from 'lucide-react';
import AuthGuard from '@/components/auth/auth-guard';
import { AppLayout } from '@/components/layout/AppLayout';
import { SmartAutomationPanel } from '@/components/ai/SmartAutomationPanel';
import { AIInsightsPanel } from '@/components/ai/AIInsightsPanel';
import LearningSystemDashboard from '@/components/ai/LearningSystemDashboard';

export const metadata: Metadata = {
  title: 'AI Automation Hub - Zyra',
  description: 'Intelligent automation and AI-powered insights for enhanced productivity and smart task management',
};

export default function AIPage() {
  return (
    <AuthGuard>
      <AppLayout>
        {/* Enhanced Header */}
        <div className="zyra-section bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-3xl p-8 mb-8 border border-blue-200 dark:border-blue-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="zyra-icon-container w-16 h-16">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="zyra-page-title text-4xl mb-2">
                  AI Automation Hub
                </h1>
                <p className="zyra-page-subtitle text-lg max-w-2xl">
                  Harness the power of Google Gemini 2.5 Flash for intelligent task management, 
                  predictive analytics, and automated workflow optimization.
                </p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-center">
                <div className="zyra-icon-container-sm mb-2">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Smart</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Automation</div>
              </div>
              <div className="text-center">
                <div className="zyra-icon-container-sm mb-2">
                  <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">AI</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Insights</div>
              </div>
              <div className="text-center">
                <div className="zyra-icon-container-sm mb-2">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Learning</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">System</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick AI Stats */}
        <div className="zyra-section-grid zyra-grid-3 mb-8">
          <div className="zyra-card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Efficiency</h3>
                <p className="zyra-metric-value text-green-600 dark:text-green-400">94%</p>
                <p className="zyra-metric-label">Task optimization rate</p>
              </div>
              <div className="zyra-icon-container-sm">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="zyra-card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Time Saved</h3>
                <p className="text-3xl font-bold text-zyra-primary">12.5h</p>
                <p className="text-sm text-zyra-text-secondary">This week</p>
              </div>
              <div className="w-12 h-12 bg-zyra-primary/10 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-zyra-primary" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zyra-accent/5 to-zyra-accent/10 p-6 rounded-2xl border border-zyra-accent/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zyra-text-primary">Insights Generated</h3>
                <p className="text-3xl font-bold text-zyra-accent">47</p>
                <p className="text-sm text-zyra-text-secondary">Actionable recommendations</p>
              </div>
              <div className="w-12 h-12 bg-zyra-accent/10 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-zyra-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Main AI Components */}
        <div className="space-y-8">
          {/* Smart Automation Panel */}
          <SmartAutomationPanel />
          
          {/* AI Insights Panel */}
          <AIInsightsPanel />
          
          {/* Learning System Dashboard */}
          <LearningSystemDashboard />
        </div>
      </AppLayout>
    </AuthGuard>
  );
}