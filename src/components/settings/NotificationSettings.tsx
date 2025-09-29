'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Monitor, 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Globe, 
  Users, 
  Calendar, 
  Clock, 
  Zap,
  Volume2,
  VolumeX,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NotificationPreferences {
  email: {
    taskAssignments: boolean;
    projectUpdates: boolean;
    deadlineReminders: boolean;
    teamMentions: boolean;
    weeklyDigest: boolean;
    marketingEmails: boolean;
  };
  push: {
    taskAssignments: boolean;
    projectUpdates: boolean;
    deadlineReminders: boolean;
    teamMentions: boolean;
    directMessages: boolean;
  };
  inApp: {
    taskAssignments: boolean;
    projectUpdates: boolean;
    deadlineReminders: boolean;
    teamMentions: boolean;
    directMessages: boolean;
    systemUpdates: boolean;
  };
  schedule: {
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    weekends: boolean;
    timezone: string;
  };
}

interface PrivacySettings {
  profile: {
    showEmail: boolean;
    showLastActive: boolean;
    showWorkingHours: boolean;
    allowDirectMessages: boolean;
  };
  activity: {
    showOnlineStatus: boolean;
    shareTaskProgress: boolean;
    allowActivityTracking: boolean;
    showProjectParticipation: boolean;
  };
  data: {
    allowAnalytics: boolean;
    allowPersonalization: boolean;
    allowThirdPartyIntegrations: boolean;
    dataRetentionPeriod: string;
  };
}

export function NotificationSettings() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState([75]);

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: {
      taskAssignments: true,
      projectUpdates: true,
      deadlineReminders: true,
      teamMentions: true,
      weeklyDigest: true,
      marketingEmails: false,
    },
    push: {
      taskAssignments: true,
      projectUpdates: false,
      deadlineReminders: true,
      teamMentions: true,
      directMessages: true,
    },
    inApp: {
      taskAssignments: true,
      projectUpdates: true,
      deadlineReminders: true,
      teamMentions: true,
      directMessages: true,
      systemUpdates: true,
    },
    schedule: {
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
      },
      weekends: false,
      timezone: 'America/Los_Angeles',
    },
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile: {
      showEmail: false,
      showLastActive: true,
      showWorkingHours: true,
      allowDirectMessages: true,
    },
    activity: {
      showOnlineStatus: true,
      shareTaskProgress: true,
      allowActivityTracking: true,
      showProjectParticipation: true,
    },
    data: {
      allowAnalytics: true,
      allowPersonalization: true,
      allowThirdPartyIntegrations: true,
      dataRetentionPeriod: '2-years',
    },
  });

  const notificationTypes = [
    {
      key: 'taskAssignments',
      name: 'Task Assignments',
      description: 'When you are assigned to a new task',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      priority: 'high',
    },
    {
      key: 'projectUpdates',
      name: 'Project Updates',
      description: 'Updates on projects you are following',
      icon: <Info className="h-5 w-5 text-blue-500" />,
      priority: 'medium',
    },
    {
      key: 'deadlineReminders',
      name: 'Deadline Reminders',
      description: 'Reminders for upcoming task deadlines',
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
      priority: 'high',
    },
    {
      key: 'teamMentions',
      name: 'Team Mentions',
      description: 'When someone mentions you in comments',
      icon: <Users className="h-5 w-5 text-purple-500" />,
      priority: 'high',
    },
    {
      key: 'directMessages',
      name: 'Direct Messages',
      description: 'Personal messages from team members',
      icon: <MessageSquare className="h-5 w-5 text-indigo-500" />,
      priority: 'high',
    },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Channels */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationTypes.map((type) => (
                <div key={type.key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {type.icon}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{type.name}</h4>
                          {getPriorityBadge(type.priority)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 ml-8">
                    {/* Email */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Email</span>
                      </div>
                      <Switch
                        checked={notifications.email[type.key as keyof typeof notifications.email] || false}
                        onCheckedChange={(checked) => setNotifications({
                          ...notifications,
                          email: { ...notifications.email, [type.key]: checked }
                        })}
                      />
                    </div>

                    {/* Push */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Push</span>
                      </div>
                      <Switch
                        checked={notifications.push[type.key as keyof typeof notifications.push] || false}
                        onCheckedChange={(checked) => setNotifications({
                          ...notifications,
                          push: { ...notifications.push, [type.key]: checked }
                        })}
                      />
                    </div>

                    {/* In-App */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">In-App</span>
                      </div>
                      <Switch
                        checked={notifications.inApp[type.key as keyof typeof notifications.inApp] || false}
                        onCheckedChange={(checked) => setNotifications({
                          ...notifications,
                          inApp: { ...notifications.inApp, [type.key]: checked }
                        })}
                      />
                    </div>
                  </div>

                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Schedule & Timing */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Schedule & Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quiet Hours */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Quiet Hours</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pause notifications during specified hours</p>
                  </div>
                  <Switch
                    checked={notifications.schedule.quietHours.enabled}
                    onCheckedChange={(checked) => setNotifications({
                      ...notifications,
                      schedule: {
                        ...notifications.schedule,
                        quietHours: { ...notifications.schedule.quietHours, enabled: checked }
                      }
                    })}
                  />
                </div>

                {notifications.schedule.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 ml-4">
                    <div className="space-y-2">
                      <Label htmlFor="quietStart">Start Time</Label>
                      <input
                        id="quietStart"
                        type="time"
                        value={notifications.schedule.quietHours.start}
                        onChange={(e) => setNotifications({
                          ...notifications,
                          schedule: {
                            ...notifications.schedule,
                            quietHours: { ...notifications.schedule.quietHours, start: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quietEnd">End Time</Label>
                      <input
                        id="quietEnd"
                        type="time"
                        value={notifications.schedule.quietHours.end}
                        onChange={(e) => setNotifications({
                          ...notifications,
                          schedule: {
                            ...notifications.schedule,
                            quietHours: { ...notifications.schedule.quietHours, end: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Weekend Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Weekend Notifications</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications on weekends</p>
                </div>
                <Switch
                  checked={notifications.schedule.weekends}
                  onCheckedChange={(checked) => setNotifications({
                    ...notifications,
                    schedule: { ...notifications.schedule, weekends: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          {/* Profile Privacy */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Profile Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(privacy.profile).map(([key, value]) => {
                const profileSettings = {
                  showEmail: {
                    name: 'Show Email Address',
                    description: 'Allow team members to see your email address',
                    icon: <Mail className="h-4 w-4 text-gray-500" />,
                  },
                  showLastActive: {
                    name: 'Show Last Active',
                    description: 'Display when you were last active',
                    icon: <Clock className="h-4 w-4 text-gray-500" />,
                  },
                  showWorkingHours: {
                    name: 'Show Working Hours',
                    description: 'Display your working hours to team members',
                    icon: <Calendar className="h-4 w-4 text-gray-500" />,
                  },
                  allowDirectMessages: {
                    name: 'Allow Direct Messages',
                    description: 'Let team members send you direct messages',
                    icon: <MessageSquare className="h-4 w-4 text-gray-500" />,
                  },
                };

                const setting = profileSettings[key as keyof typeof profileSettings];

                return (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {setting.icon}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{setting.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => setPrivacy({
                        ...privacy,
                        profile: { ...privacy.profile, [key]: checked }
                      })}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Activity Privacy */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-500" />
                Activity Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(privacy.activity).map(([key, value]) => {
                const activitySettings = {
                  showOnlineStatus: {
                    name: 'Show Online Status',
                    description: 'Display when you are online or offline',
                    icon: <Globe className="h-4 w-4 text-gray-500" />,
                  },
                  shareTaskProgress: {
                    name: 'Share Task Progress',
                    description: 'Allow others to see your task completion progress',
                    icon: <CheckCircle className="h-4 w-4 text-gray-500" />,
                  },
                  allowActivityTracking: {
                    name: 'Activity Tracking',
                    description: 'Track your activity for productivity insights',
                    icon: <Zap className="h-4 w-4 text-gray-500" />,
                  },
                  showProjectParticipation: {
                    name: 'Show Project Participation',
                    description: 'Display which projects you are involved in',
                    icon: <Users className="h-4 w-4 text-gray-500" />,
                  },
                };

                const setting = activitySettings[key as keyof typeof activitySettings];

                return (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {setting.icon}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{setting.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => setPrivacy({
                        ...privacy,
                        activity: { ...privacy.activity, [key]: checked }
                      })}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Data Privacy */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-500" />
                Data Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Allow Analytics</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Help improve Zyra with usage analytics</p>
                    </div>
                  </div>
                  <Switch
                    checked={privacy.data.allowAnalytics}
                    onCheckedChange={(checked) => setPrivacy({
                      ...privacy,
                      data: { ...privacy.data, allowAnalytics: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-gray-500" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Personalization</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Personalize your experience based on usage</p>
                    </div>
                  </div>
                  <Switch
                    checked={privacy.data.allowPersonalization}
                    onCheckedChange={(checked) => setPrivacy({
                      ...privacy,
                      data: { ...privacy.data, allowPersonalization: checked }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention Period</Label>
                  <Select
                    value={privacy.data.dataRetentionPeriod}
                    onValueChange={(value) => setPrivacy({
                      ...privacy,
                      data: { ...privacy.data, dataRetentionPeriod: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6-months">6 Months</SelectItem>
                      <SelectItem value="1-year">1 Year</SelectItem>
                      <SelectItem value="2-years">2 Years</SelectItem>
                      <SelectItem value="5-years">5 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          {/* Sound Settings */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="h-5 w-5 text-blue-500" /> : <VolumeX className="h-5 w-5 text-gray-400" />}
                Sound Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Enable Notification Sounds</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Play sounds for notifications</p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              {soundEnabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Volume Level</Label>
                    <div className="flex items-center gap-4">
                      <VolumeX className="h-4 w-4 text-gray-400" />
                      <Slider
                        value={soundVolume}
                        onValueChange={setSoundVolume}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <Volume2 className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-10">{soundVolume[0]}%</span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    Test Sound
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Reset to Defaults</div>
                    <div className="text-xs text-gray-500">Restore default notification settings</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Export Settings</div>
                    <div className="text-xs text-gray-500">Download your notification preferences</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Changes */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}