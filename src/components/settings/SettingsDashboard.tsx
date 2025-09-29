'use client';

import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Users, 
  Brain, 
  Palette, 
  Globe, 
  Zap,
  Settings,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileSettings } from './ProfileSettings';
import { WorkspaceSettings } from './WorkspaceSettings';
import { NotificationSettings } from './NotificationSettings';
import { SecuritySettings } from './SecuritySettings';
import { AISettings } from './AISettings';

interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  badge?: string;
  color: string;
}

const settingsCategories: SettingsCategory[] = [
  {
    id: 'profile',
    name: 'Profile & Account',
    description: 'Personal information, preferences, and account settings',
    icon: User,
    color: 'blue',
  },
  {
    id: 'workspace',
    name: 'Workspace & Teams',
    description: 'Team collaboration, project settings, and workspace preferences',
    icon: Users,
    badge: 'New',
    color: 'green',
  },
  {
    id: 'notifications',
    name: 'Notifications & Privacy',
    description: 'Notification preferences, privacy controls, and data settings',
    icon: Bell,
    color: 'yellow',
  },
  {
    id: 'security',
    name: 'Security & Access',
    description: 'Security & Integrations',
    icon: Shield,
    color: 'red',
  },
  {
    id: 'ai',
    name: 'AI & Automation',
    description: 'AI preferences, automation rules, and intelligent features',
    icon: Brain,
    badge: 'AI',
    color: 'purple',
  },
  {
    id: 'integrations',
    name: 'Apps & Integrations',
    description: 'Third-party connections, API settings, and external tools',
    icon: Globe,
    color: 'indigo',
  },
];

export function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = settingsCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      green: 'from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      yellow: 'from-yellow-500 to-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      red: 'from-red-500 to-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Overview
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Profile
          </TabsTrigger>
          <TabsTrigger value="workspace" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Workspace
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Security
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            AI & Apps
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Search and Filter */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search settings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const colorClasses = getColorClasses(category.color);
              
              return (
                <Card 
                  key={category.id}
                  className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => setActiveTab(category.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        {category.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {category.badge}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Export Data</div>
                    <div className="text-xs text-gray-500">Download your information</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Reset Preferences</div>
                    <div className="text-xs text-gray-500">Restore default settings</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Backup Settings</div>
                    <div className="text-xs text-gray-500">Save current configuration</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Get Support</div>
                    <div className="text-xs text-gray-500">Contact our team</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Settings Tabs */}
        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="workspace">
          <WorkspaceSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="ai">
          <AISettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}