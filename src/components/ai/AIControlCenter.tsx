'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  BarChart3, 
  Bell, 
  Zap, 
  TrendingUp, 
  Settings,
  Activity,
  Lightbulb,
  Target,
  Users
} from 'lucide-react';

// Import AI components
import { AIInsightsPanel } from './AIInsightsPanel';
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { SmartNotificationCenter } from './SmartNotificationCenter';
import LearningSystemDashboard from './LearningSystemDashboard';
import RealTimeProcessingMonitor from './RealTimeProcessingMonitor';

interface AIControlCenterProps {
  className?: string;
}

export default function AIControlCenter({ className }: AIControlCenterProps) {
  const [activeTab, setActiveTab] = useState('insights');

  const aiFeatures = [
    {
      id: 'insights',
      name: 'AI Insights',
      description: 'Smart recommendations and automation',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      component: AIInsightsPanel
    },
    {
      id: 'analytics',
      name: 'Predictive Analytics',
      description: 'Project forecasting and trends',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      component: PredictiveAnalytics
    },
    {
      id: 'notifications',
      name: 'Smart Notifications',
      description: 'Context-aware alerts',
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      component: SmartNotificationCenter
    },
    {
      id: 'learning',
      name: 'Learning System',
      description: 'Behavior analysis and personalization',
      icon: Lightbulb,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      component: LearningSystemDashboard
    },
    {
      id: 'processing',
      name: 'Real-Time Processing',
      description: 'AI pipeline monitoring',
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      component: RealTimeProcessingMonitor
    }
  ];

  const getFeatureStats = () => {
    return {
      totalFeatures: aiFeatures.length,
      activeFeatures: aiFeatures.length, // All features are active
      processingStatus: 'Active',
      lastUpdate: new Date().toLocaleTimeString()
    };
  };

  const stats = getFeatureStats();

  return (
    <div className={className}>
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="h-6 w-6 text-purple-600" />
                AI Control Center
              </CardTitle>
              <CardDescription className="text-base">
                Centralized hub for all AI-powered features and insights
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {stats.processingStatus}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Last Update</div>
                <div className="text-sm font-medium">{stats.lastUpdate}</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Feature Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {aiFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={feature.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    activeTab === feature.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setActiveTab(feature.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`p-3 rounded-full ${feature.bgColor}`}>
                        <IconComponent className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{feature.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {feature.description}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm font-medium">{stats.totalFeatures}</div>
                <div className="text-xs text-muted-foreground">AI Features</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Zap className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium">{stats.activeFeatures}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium">100%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-sm font-medium">Real-time</div>
                <div className="text-xs text-muted-foreground">Processing</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Feature Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {aiFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <TabsTrigger 
                key={feature.id} 
                value={feature.id}
                className="flex items-center gap-2"
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{feature.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {aiFeatures.map((feature) => {
          const FeatureComponent = feature.component;
          return (
            <TabsContent key={feature.id} value={feature.id} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    {feature.name}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
              </div>
              
              <FeatureComponent {...(feature.id === 'notifications' ? { userId: 'current-user' } : {})} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}