'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  Zap, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { useAIAgent } from '@/lib/hooks/useAIAgent';

interface AIInsightsPanelProps {
  className?: string;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ className }) => {
  const { 
    state, 
    requestPersonalizedRecommendations, 
    requestPatternAnalysis,
    dismissRecommendation,
    toggleAutomationRule,
    clearError 
  } = useAIAgent();
  
  const [activeTab, setActiveTab] = useState('recommendations');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 0.8) return 'bg-green-100 text-green-800';
    if (impact >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const tabs = [
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden ${className}`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Insights</h2>
              <p className="text-blue-100">Powered by Google Gemini 2.5 Flash</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Live Analysis</span>
            </div>
            {state.isProcessing && (
              <RefreshCw className="h-5 w-5 animate-spin text-white" />
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={requestPersonalizedRecommendations}
              disabled={state.isProcessing}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-t-lg'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Enhanced Content */}
      <div className="p-6">
        {state.error && (
           <Alert className="mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
             <AlertTriangle className="h-4 w-4 text-red-600" />
             <AlertDescription className="flex items-center justify-between text-red-700 dark:text-red-300">
               {state.error}
               <Button variant="ghost" size="sm" onClick={clearError} className="text-red-600 hover:text-red-700">
                 <XCircle className="h-4 w-4" />
               </Button>
             </AlertDescription>
           </Alert>
         )}

         {/* Tab Content */}
         {activeTab === 'recommendations' && (
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Personalized Recommendations</h3>
               <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                 {state.recommendations.length} active
               </Badge>
             </div>

             {state.recommendations.length === 0 ? (
               <div className="text-center py-12 text-gray-500">
                 <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Lightbulb className="h-10 w-10 text-gray-400" />
                 </div>
                 <p className="text-lg font-medium mb-2">No recommendations available yet</p>
                 <p className="text-sm">Use the app more to get personalized insights!</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {state.recommendations.map((recommendation) => (
                   <div key={recommendation.id} className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                     <div className="flex items-start justify-between">
                       <div className="flex-1">
                         <div className="flex items-center space-x-3 mb-3">
                           <Badge variant="outline" className="capitalize bg-white dark:bg-gray-800">
                             {recommendation.type}
                           </Badge>
                           <Badge className={`${getImpactColor(recommendation.impact)} font-medium`}>
                             {Math.round(recommendation.impact * 100)}% impact
                           </Badge>
                           <span className={`text-sm font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                             {Math.round(recommendation.confidence * 100)}% confidence
                           </span>
                         </div>
                         <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{recommendation.title}</h4>
                         <p className="text-gray-600 dark:text-gray-300 mb-3">{recommendation.description}</p>
                         {recommendation.actionable && (
                           <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                             <CheckCircle className="h-3 w-3 mr-1" />
                             Actionable
                           </Badge>
                         )}
                       </div>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => dismissRecommendation(recommendation.id)}
                         className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                       >
                         <XCircle className="h-5 w-5" />
                       </Button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         )}

         {activeTab === 'predictions' && (
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Predictions</h3>
               <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                 {state.predictions.length} predictions
               </Badge>
             </div>

             {state.predictions.length === 0 ? (
               <div className="text-center py-12 text-gray-500">
                 <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                   <TrendingUp className="h-10 w-10 text-gray-400" />
                 </div>
                 <p className="text-lg font-medium mb-2">No predictions available yet</p>
                 <p className="text-sm">Create tasks and projects to get AI predictions!</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {state.predictions.map((prediction) => (
                   <div key={prediction.id} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                     <div className="flex items-center justify-between mb-4">
                       <Badge variant="outline" className="capitalize bg-white dark:bg-gray-800">
                         {prediction.type.replace('_', ' ')}
                       </Badge>
                       <span className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                         {Math.round(prediction.confidence * 100)}% confidence
                       </span>
                     </div>
                     
                     {prediction.type === 'task_priority' && (
                       <div>
                         <div className="flex items-center space-x-3 mb-3">
                           <Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                           <span className="font-semibold text-gray-900 dark:text-white">Priority:</span>
                           <Badge className={`${getPriorityColor(prediction.prediction.priority)} text-white`}>
                             {prediction.prediction.priority}
                           </Badge>
                         </div>
                         <p className="text-gray-600 dark:text-gray-300">{prediction.prediction.reasoning}</p>
                       </div>
                     )}

                     {prediction.type === 'project_completion' && (
                       <div>
                         <div className="flex items-center space-x-3 mb-3">
                           <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                           <span className="font-semibold text-gray-900 dark:text-white">Estimated Completion:</span>
                           <span className="text-gray-700 dark:text-gray-300">
                             {new Date(prediction.prediction.estimatedCompletion).toLocaleDateString()}
                           </span>
                         </div>
                         {prediction.prediction.risks.length > 0 && (
                           <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                             <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">Potential Risks:</p>
                             <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                               {prediction.prediction.risks.slice(0, 3).map((risk: string, index: number) => (
                                 <li key={index} className="flex items-start space-x-2">
                                   <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                                   <span>{risk}</span>
                                 </li>
                               ))}
                             </ul>
                           </div>
                         )}
                       </div>
                     )}

                     <div className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                       Generated: {new Date(prediction.createdAt).toLocaleString()}
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         )}

         {activeTab === 'automation' && (
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Automation Rules</h3>
               <div className="flex items-center space-x-3">
                 <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                   {state.automationRules.filter(rule => rule.status === 'active').length} active
                 </Badge>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={requestPatternAnalysis}
                   disabled={state.isProcessing}
                   className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none hover:from-orange-600 hover:to-red-600"
                 >
                   <Zap className="h-4 w-4 mr-2" />
                   Analyze Patterns
                 </Button>
               </div>
             </div>

             {state.automationRules.length === 0 ? (
               <div className="text-center py-12 text-gray-500">
                 <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Zap className="h-10 w-10 text-gray-400" />
                 </div>
                 <p className="text-lg font-medium mb-2">No automation rules detected yet</p>
                 <p className="text-sm">Keep using the app to discover automation opportunities!</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {state.automationRules.map((rule) => (
                   <div key={rule.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                     <div className="flex items-center justify-between">
                       <div className="flex-1">
                         <div className="flex items-center space-x-3 mb-3">
                           <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{rule.name}</h4>
                           <Badge variant={rule.status === 'active' ? 'default' : 'secondary'} 
                                  className={rule.status === 'active' ? 'bg-green-500 text-white' : ''}>
                             {rule.status}
                           </Badge>
                           <span className={`text-sm font-medium ${getConfidenceColor(rule.confidence)}`}>
                             {Math.round(rule.confidence * 100)}% confidence
                           </span>
                         </div>
                         <p className="text-gray-600 dark:text-gray-300">{rule.pattern}</p>
                       </div>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => toggleAutomationRule(rule.id)}
                         className="ml-4"
                       >
                         <Settings className="h-4 w-4" />
                       </Button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         )}

         {activeTab === 'analytics' && (
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Analytics</h3>
               <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                 Last updated: {state.lastProcessingTime ? 
                   new Date(state.lastProcessingTime).toLocaleString() : 'Never'
                 }
               </Badge>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                 <div className="flex items-center space-x-3 mb-4">
                   <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-xl flex items-center justify-center">
                     <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                   </div>
                   <span className="font-semibold text-lg text-gray-900 dark:text-white">AI Processing</span>
                 </div>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 dark:text-gray-400">Recommendations</span>
                     <span className="font-semibold text-gray-900 dark:text-white">{state.recommendations.length}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 dark:text-gray-400">Predictions</span>
                     <span className="font-semibold text-gray-900 dark:text-white">{state.predictions.length}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 dark:text-gray-400">Automation Rules</span>
                     <span className="font-semibold text-gray-900 dark:text-white">{state.automationRules.length}</span>
                   </div>
                 </div>
               </div>

               <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                 <div className="flex items-center space-x-3 mb-4">
                   <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-xl flex items-center justify-center">
                     <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                   </div>
                   <span className="font-semibold text-lg text-gray-900 dark:text-white">Performance</span>
                 </div>
                 <div className="space-y-4">
                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-gray-600 dark:text-gray-400">Average Confidence</span>
                       <span className="font-semibold text-gray-900 dark:text-white">
                         {state.recommendations.length > 0 
                           ? Math.round(
                               state.recommendations.reduce((acc, rec) => acc + rec.confidence, 0) / 
                               state.recommendations.length * 100
                             ) + '%'
                           : 'N/A'
                         }
                       </span>
                     </div>
                     <Progress 
                       value={
                         state.recommendations.length > 0 
                           ? state.recommendations.reduce((acc, rec) => acc + rec.confidence, 0) / 
                             state.recommendations.length * 100
                           : 0
                       } 
                       className="h-3 bg-gray-200 dark:bg-gray-700" 
                     />
                   </div>
                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-gray-600 dark:text-gray-400">High Impact Items</span>
                       <span className="font-semibold text-gray-900 dark:text-white">
                         {state.recommendations.filter(rec => rec.impact > 0.7).length}
                       </span>
                     </div>
                     <Progress 
                       value={
                         state.recommendations.length > 0 
                           ? (state.recommendations.filter(rec => rec.impact > 0.7).length / 
                              state.recommendations.length) * 100
                           : 0
                       } 
                       className="h-3 bg-gray-200 dark:bg-gray-700" 
                     />
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
  );
};

// ...existing code ...