'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Settings, 
  BarChart3, 
  Plus, 
  Trash2, 
  Edit, 
  Mail, 
  Smartphone, 
  Monitor,
  Clock,
  Filter,
  Zap,
  TrendingUp
} from 'lucide-react';
import { 
  smartNotificationService, 
  UserPreferences, 
  NotificationRule 
} from '@/lib/ai/smart-notifications';

interface SmartNotificationCenterProps {
  userId?: string;
}

export function SmartNotificationCenter({ userId = 'current-user' }: SmartNotificationCenterProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [showNewRule, setShowNewRule] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userPrefs, userRules, userAnalytics] = await Promise.all([
        smartNotificationService.getUserPreferences(userId),
        smartNotificationService.getUserNotificationRules(userId),
        smartNotificationService.getNotificationAnalytics(userId)
      ]);

      setPreferences(userPrefs);
      setRules(userRules);
      setAnalytics(userAnalytics);
    } catch (err) {
      setError('Failed to load notification settings');
      console.error('Notification center error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: UserPreferences) => {
    try {
      const success = await smartNotificationService.updateUserPreferences(newPreferences);
      if (success) {
        setPreferences(newPreferences);
      } else {
        setError('Failed to update preferences');
      }
    } catch (err) {
      setError('Failed to update preferences');
      console.error('Update preferences error:', err);
    }
  };

  const createRule = async (rule: Omit<NotificationRule, 'id' | 'createdAt'>) => {
    try {
      const newRule = await smartNotificationService.createNotificationRule(rule);
      if (newRule) {
        setRules([...rules, newRule]);
        setShowNewRule(false);
      } else {
        setError('Failed to create notification rule');
      }
    } catch (err) {
      setError('Failed to create notification rule');
      console.error('Create rule error:', err);
    }
  };

  const getChannelIcon = (channel: string): React.ReactNode => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'push': return <Smartphone className="h-4 w-4" />;
      case 'in_app': return <Monitor className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="shadow-mobile border-0 sm:border">
        <CardHeader className="mobile-padding">
          <CardTitle className="flex items-center gap-2 text-responsive-lg">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            🔔 Smart Notification Center
          </CardTitle>
        </CardHeader>
        <CardContent className="mobile-padding">
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-mobile border-0 sm:border">
        <CardHeader className="mobile-padding">
          <CardTitle className="flex items-center gap-2 text-responsive-lg">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            🔔 Smart Notification Center
          </CardTitle>
        </CardHeader>
        <CardContent className="mobile-padding">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <Bell className="h-4 w-4" />
            <AlertDescription className="text-responsive-sm">{error}</AlertDescription>
          </Alert>
          <Button onClick={loadData} className="mt-4 btn-mobile touch-manipulation">
            🔄 Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-mobile border-0 sm:border">
      <CardHeader className="mobile-padding">
        <CardTitle className="flex items-center gap-2 text-responsive-lg">
          <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
          🔔 Smart Notification Center
        </CardTitle>
        <CardDescription className="text-responsive-sm mt-2">
          AI-powered notification management with intelligent filtering
        </CardDescription>
      </CardHeader>
      <CardContent className="mobile-padding space-y-4 sm:space-y-6">
        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-0 h-auto sm:h-10 p-1 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="preferences" className="touch-manipulation btn-mobile text-responsive-xs flex-col sm:flex-row gap-1 sm:gap-2 py-3 sm:py-2">
              <Settings className="h-4 w-4" />
              <span>Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="touch-manipulation btn-mobile text-responsive-xs flex-col sm:flex-row gap-1 sm:gap-2 py-3 sm:py-2">
              <Filter className="h-4 w-4" />
              <span>Rules</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="touch-manipulation btn-mobile text-responsive-xs flex-col sm:flex-row gap-1 sm:gap-2 py-3 sm:py-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {preferences && (
              <div className="space-y-4 sm:space-y-6">
                {/* Channels */}
                <Card className="shadow-mobile border-0 sm:border">
                  <CardHeader className="pb-3 mobile-padding">
                    <CardTitle className="text-responsive-base flex items-center gap-2">
                      📱 Notification Channels
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 mobile-padding">
                    {(['email', 'push', 'in_app'] as const).map((channel) => (
                      <div key={channel} className="flex items-center justify-between p-3 sm:p-2 rounded-lg bg-gray-50 dark:bg-gray-800 touch-manipulation">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {getChannelIcon(channel)}
                          <span className="capitalize text-responsive-sm font-medium">{channel.replace('_', ' ')}</span>
                        </div>
                        <Switch
                          checked={preferences.enabledChannels.includes(channel)}
                          onCheckedChange={(checked) => {
                            const newChannels = checked
                              ? [...preferences.enabledChannels, channel]
                              : preferences.enabledChannels.filter(c => c !== channel);
                            updatePreferences({ ...preferences, enabledChannels: newChannels });
                          }}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Priority & Frequency */}
                <Card className="shadow-mobile border-0 sm:border">
                  <CardHeader className="pb-3 mobile-padding">
                    <CardTitle className="text-responsive-base flex items-center gap-2">
                      ⚙️ Delivery Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 mobile-padding">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="priority-threshold" className="text-responsive-sm font-medium">Priority Threshold</Label>
                        <Select
                          value={preferences.priorityThreshold}
                          onValueChange={(value: any) => 
                            updatePreferences({ ...preferences, priorityThreshold: value })
                          }
                        >
                          <SelectTrigger className="btn-mobile touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low" className="touch-manipulation">🟢 Low</SelectItem>
                            <SelectItem value="medium" className="touch-manipulation">🟡 Medium</SelectItem>
                            <SelectItem value="high" className="touch-manipulation">🟠 High</SelectItem>
                            <SelectItem value="urgent" className="touch-manipulation">🔴 Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="frequency" className="text-responsive-sm font-medium">Frequency</Label>
                        <Select
                          value={preferences.frequency}
                          onValueChange={(value: any) => 
                            updatePreferences({ ...preferences, frequency: value })
                          }
                        >
                          <SelectTrigger className="btn-mobile touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate" className="touch-manipulation">⚡ Immediate</SelectItem>
                            <SelectItem value="hourly" className="touch-manipulation">🕐 Hourly</SelectItem>
                            <SelectItem value="daily" className="touch-manipulation">📅 Daily</SelectItem>
                            <SelectItem value="weekly" className="touch-manipulation">📊 Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Filters */}
                <Card className="shadow-mobile border-0 sm:border">
                  <CardHeader className="pb-3 mobile-padding">
                    <CardTitle className="text-responsive-base flex items-center gap-2">
                      🏷️ Category Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 mobile-padding">
                    {Object.entries(preferences.categoryFilters).map(([category, enabled]) => (
                      <div key={category} className="flex items-center justify-between p-3 sm:p-2 rounded-lg bg-gray-50 dark:bg-gray-800 touch-manipulation">
                        <span className="capitalize text-responsive-sm font-medium">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => {
                            updatePreferences({
                              ...preferences,
                              categoryFilters: {
                                ...preferences.categoryFilters,
                                [category]: checked
                              }
                            });
                          }}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quiet Hours */}
                <Card className="shadow-mobile border-0 sm:border">
                  <CardHeader className="pb-3 mobile-padding">
                    <CardTitle className="text-responsive-base flex items-center gap-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                      🌙 Quiet Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 mobile-padding">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="quiet-start" className="text-responsive-sm font-medium">Start Time</Label>
                        <Input
                          id="quiet-start"
                          type="time"
                          className="btn-mobile touch-manipulation"
                          value={preferences.quietHours.start}
                          onChange={(e) => updatePreferences({
                            ...preferences,
                            quietHours: { ...preferences.quietHours, start: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quiet-end" className="text-responsive-sm font-medium">End Time</Label>
                        <Input
                          id="quiet-end"
                          type="time"
                          className="btn-mobile touch-manipulation"
                          value={preferences.quietHours.end}
                          onChange={(e) => updatePreferences({
                            ...preferences,
                            quietHours: { ...preferences.quietHours, end: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Working Hours */}
                <Card className="shadow-mobile border-0 sm:border">
                  <CardHeader className="pb-3 mobile-padding">
                    <CardTitle className="text-responsive-base flex items-center gap-2">
                      💼 Working Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 mobile-padding">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="work-start" className="text-responsive-sm font-medium">Start Time</Label>
                        <Input
                          id="work-start"
                          type="time"
                          className="btn-mobile touch-manipulation"
                          value={preferences.workingHours.start}
                          onChange={(e) => updatePreferences({
                            ...preferences,
                            workingHours: { ...preferences.workingHours, start: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="work-end" className="text-responsive-sm font-medium">End Time</Label>
                        <Input
                          id="work-end"
                          type="time"
                          className="btn-mobile touch-manipulation"
                          value={preferences.workingHours.end}
                          onChange={(e) => updatePreferences({
                            ...preferences,
                            workingHours: { ...preferences.workingHours, end: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rules" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mobile-padding">
              <h3 className="text-responsive-lg font-semibold flex items-center gap-2">
                📋 Notification Rules
              </h3>
              <Button onClick={() => setShowNewRule(true)} className="btn-mobile touch-manipulation w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {rules.map((rule) => (
                <Card key={rule.id} className="shadow-mobile border-0 sm:border">
                  <CardHeader className="pb-3 mobile-padding">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <CardTitle className="text-responsive-base">{rule.name}</CardTitle>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <Switch checked={rule.enabled} />
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="btn-mobile touch-manipulation">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="btn-mobile touch-manipulation">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="mobile-padding">
                    <div className="space-y-3 sm:space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {rule.conditions.priorities?.map((priority) => (
                          <Badge key={priority} className={getPriorityColor(priority)}>
                            {priority}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rule.actions.channels.map((channel) => (
                          <Badge key={channel} variant="outline" className="flex items-center gap-1 touch-manipulation">
                            {getChannelIcon(channel)}
                            <span className="text-responsive-xs">{channel}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {showNewRule && (
              <Card className="shadow-mobile border-0 sm:border">
                <CardHeader className="mobile-padding">
                  <CardTitle className="text-responsive-base">✨ Create New Rule</CardTitle>
                </CardHeader>
                <CardContent className="mobile-padding">
                  <NewRuleForm 
                    onSubmit={createRule}
                    onCancel={() => setShowNewRule(false)}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {analytics && (
              <div className="grid gap-4 sm:gap-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="shadow-mobile border-0 sm:border">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">{analytics.totalSent}</div>
                      <div className="text-responsive-xs text-gray-600 dark:text-gray-400">📤 Total Sent</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-mobile border-0 sm:border">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {Math.round(analytics.engagementRate * 100)}%
                      </div>
                      <div className="text-responsive-xs text-gray-600 dark:text-gray-400">📊 Engagement Rate</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-mobile border-0 sm:border">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">
                        {Object.keys(analytics.byChannel).length}
                      </div>
                      <div className="text-responsive-xs text-gray-600 dark:text-gray-400">📱 Active Channels</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-mobile border-0 sm:border">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-orange-600">
                        {analytics.optimalTimes.length}
                      </div>
                      <div className="text-responsive-xs text-gray-600 dark:text-gray-400">⏰ Peak Hours</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-mobile border-0 sm:border">
                  <CardHeader className="mobile-padding">
                    <CardTitle className="text-responsive-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      📈 Optimal Delivery Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="mobile-padding">
                    <div className="flex flex-wrap gap-2">
                      {analytics.optimalTimes.map((time: string) => (
                        <Badge key={time} variant="outline" className="touch-manipulation text-responsive-xs">
                          ⏰ {time}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="shadow-mobile border-0 sm:border">
                    <CardHeader className="mobile-padding">
                      <CardTitle className="text-responsive-base">📊 By Channel</CardTitle>
                    </CardHeader>
                    <CardContent className="mobile-padding">
                      <div className="space-y-3 sm:space-y-2">
                        {Object.entries(analytics.byChannel).map(([channel, count]) => (
                          <div key={channel} className="flex items-center justify-between p-2 sm:p-1 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-2">
                              {getChannelIcon(channel)}
                              <span className="capitalize text-responsive-sm">{channel}</span>
                            </div>
                                                        <Badge className="text-responsive-xs">{count as number}</Badge> 
                                                      
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-mobile border-0 sm:border">
                    <CardHeader className="mobile-padding">
                      <CardTitle className="text-responsive-base">🎯 By Priority</CardTitle>
                    </CardHeader>
                    <CardContent className="mobile-padding">
                      <div className="space-y-3 sm:space-y-2">
                                                {Object.entries(analytics.byPriority).map(([priority, count]) => (
                          <div key={priority} className="flex items-center justify-between p-2 sm:p-1 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <Badge className={`${getPriorityColor(priority)} touch-manipulation text-responsive-xs`}>
                              {priority}
                            </Badge>
                            <Badge className="text-responsive-xs">{count as number}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function NewRuleForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (rule: Omit<NotificationRule, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['in_app']);
  const [keywords, setKeywords] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      userId: '', // Will be set by the service
      name,
      conditions: {
        priorities: selectedPriorities.length > 0 ? selectedPriorities : undefined,
        keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined
      },
      actions: {
        channels: selectedChannels as ('email' | 'push' | 'in_app')[]
      },
      enabled: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <Label htmlFor="rule-name" className="text-responsive-sm">📝 Rule Name</Label>
        <Input
          id="rule-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter rule name"
          className="mt-1 touch-manipulation text-responsive-base"
          required
        />
      </div>

      <div>
        <Label className="text-responsive-sm">🔍 Keywords (comma-separated)</Label>
        <Textarea
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="urgent, deadline, important"
          className="mt-1 touch-manipulation text-responsive-base min-h-[80px] sm:min-h-[60px]"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="btn-mobile touch-manipulation text-responsive-sm order-2 sm:order-1"
        >
          ❌ Cancel
        </Button>
        <Button 
          type="submit"
          className="btn-mobile touch-manipulation text-responsive-sm order-1 sm:order-2"
        >
          ✨ Create Rule
        </Button>
      </div>
    </form>
  );
}