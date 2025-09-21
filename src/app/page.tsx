import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowRight, Sparkles, Shield, Zap, Users, BarChart3, Brain } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Zyra - AI-Native Task Management',
  description: 'Enterprise-grade task management powered by Google AI. Streamline workflows, boost productivity, and collaborate seamlessly.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zyra-background dark:bg-zyra-dark-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-zyra-card/80 dark:bg-zyra-dark-card/80 backdrop-blur-md border-b border-zyra-border dark:border-zyra-dark-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-zyra-primary to-zyra-secondary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-zyra-text-primary dark:text-zyra-dark-text-primary">Zyra</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login"
                className="text-zyra-text-secondary dark:text-zyra-dark-text-secondary hover:text-zyra-text-primary dark:hover:text-zyra-dark-text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup"
                className="bg-zyra-primary hover:bg-zyra-primary/90 text-white px-4 py-2 rounded-full font-medium transition-all duration-200 hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-zyra-primary/10 dark:bg-zyra-primary/20 text-zyra-primary dark:text-zyra-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Google Gemini AI
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-zyra-text-primary dark:text-zyra-dark-text-primary mb-6 leading-tight">
              Task management
              <span className="block bg-gradient-to-r from-zyra-primary via-zyra-secondary to-zyra-accent bg-clip-text text-transparent">
                reimagined with AI
              </span>
            </h1>
            
            <p className="text-xl text-zyra-text-secondary dark:text-zyra-dark-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
              Zyra combines intelligent automation, real-time collaboration, and enterprise-grade security 
              to transform how teams manage work. Experience the future of productivity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/auth/signup"
                className="group bg-zyra-primary hover:bg-zyra-primary/90 text-white font-semibold py-4 px-8 rounded-full transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#demo"
                className="bg-zyra-surface hover:bg-zyra-surface/80 dark:bg-zyra-dark-surface dark:hover:bg-zyra-dark-surface/80 text-zyra-text-primary dark:text-zyra-dark-text-primary font-semibold py-4 px-8 rounded-full transition-all duration-200 hover:shadow-lg border border-zyra-border dark:border-zyra-dark-border"
              >
                Watch Demo
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                SOC 2 Compliant
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                10,000+ Teams
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                99.9% Uptime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From AI-powered insights to enterprise security, Zyra provides all the tools 
              your team needs to work smarter, not harder.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Intelligence */}
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                AI Intelligence
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Smart task prioritization, automated workflows, and predictive insights 
                powered by Google Gemini AI.
              </p>
            </div>

            {/* Real-time Collaboration */}
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Real-time Collaboration
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Live updates, instant messaging, and seamless team coordination 
                across all devices and platforms.
              </p>
            </div>

            {/* Advanced Analytics */}
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Advanced Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Comprehensive insights into team performance, project health, 
                and productivity trends with actionable recommendations.
              </p>
            </div>

            {/* Enterprise Security */}
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Enterprise Security
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Bank-level encryption, SOC 2 compliance, and granular permissions 
                to keep your data safe and secure.
              </p>
            </div>

            {/* Lightning Fast */}
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Built on Next.js 15 with edge computing for sub-second load times 
                and instant updates worldwide.
              </p>
            </div>

            {/* Seamless Integrations */}
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Smart Integrations
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Connect with Slack, Google Workspace, GitHub, and 100+ other tools 
                your team already uses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of teams already using Zyra to work smarter and achieve more.
          </p>
          <Link 
            href="/auth/signup"
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-200 hover:shadow-xl hover:scale-105 inline-flex items-center"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Zyra</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2024 Zyra. Built with ❤️ using Google AI technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
