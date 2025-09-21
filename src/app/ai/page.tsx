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
        <div className="bg-gradient-to-br from-zyra-surface to-zyra-background rounded-3xl p-8 mb-8 border border-zyra-border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-zyra-primary to-zyra-accent rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-zyra-text-primary mb-2">
                  AI Automation Hub
                </h1>
                <p className="text-lg text-zyra-text-secondary max-w-2xl">
                  Harness the power of Google Gemini 2.5 Flash for intelligent task management, 
                  predictive analytics, and automated workflow optimization.
                </p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-zyra-success/10 rounded-xl flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-zyra-success" />
                </div>
                <div className="text-sm font-medium text-zyra-text-primary">Smart</div>
                <div className="text-xs text-zyra-text-secondary">Automation</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-zyra-primary/10 rounded-xl flex items-center justify-center mb-2">
                  <Brain className="h-6 w-6 text-zyra-primary" />
                </div>
                <div className="text-sm font-medium text-zyra-text-primary">AI</div>
                <div className="text-xs text-zyra-text-secondary">Insights</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-zyra-accent/10 rounded-xl flex items-center justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-zyra-accent" />
                </div>
                <div className="text-sm font-medium text-zyra-text-primary">Learning</div>
                <div className="text-xs text-zyra-text-secondary">System</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick AI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-zyra-success/5 to-zyra-success/10 p-6 rounded-2xl border border-zyra-success/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zyra-text-primary">AI Efficiency</h3>
                <p className="text-3xl font-bold text-zyra-success">94%</p>
                <p className="text-sm text-zyra-text-secondary">Task optimization rate</p>
              </div>
              <div className="w-12 h-12 bg-zyra-success/10 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-zyra-success" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zyra-primary/5 to-zyra-primary/10 p-6 rounded-2xl border border-zyra-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zyra-text-primary">Time Saved</h3>
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