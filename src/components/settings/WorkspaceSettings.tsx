'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Building, 
  Settings, 
  UserPlus, 
  Crown, 
  Shield, 
  Mail, 
  Calendar,
  Clock,
  Globe,
  Folder,
  Archive,
  Trash2,
  Edit3,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  lastActive: string;
}

interface WorkspaceSettings {
  name: string;
  description: string;
  domain: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  features: {
    aiInsights: boolean;
    timeTracking: boolean;
    projectTemplates: boolean;
    customFields: boolean;
    advancedReporting: boolean;
  };
}

export function WorkspaceSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [workspace, setWorkspace] = useState<WorkspaceSettings>({
    name: 'Acme Corporation',
    description: 'Enterprise task management workspace for product development teams',
    domain: 'acme-corp',
    timezone: 'America/Los_Angeles',
    workingHours: {
      start: '09:00',
      end: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
    features: {
      aiInsights: true,
      timeTracking: true,
      projectTemplates: true,
      customFields: false,
      advancedReporting: true,
    },
  });

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@acme.com',
      role: 'owner',
      status: 'active',
      joinedAt: '2023-01-15',
      lastActive: '2 minutes ago',
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@acme.com',
      role: 'admin',
      status: 'active',
      joinedAt: '2023-02-20',
      lastActive: '1 hour ago',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@acme.com',
      role: 'member',
      status: 'active',
      joinedAt: '2023-03-10',
      lastActive: '3 hours ago',
    },
    {
      id: '4',
      name: 'Emily Chen',
      email: 'emily.chen@acme.com',
      role: 'member',
      status: 'pending',
      joinedAt: '2024-01-15',
      lastActive: 'Never',
    },
  ]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Pending</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Inactive</Badge>;
      default:
        return null;
    }
  };

  const workingDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-500" />
                Workspace Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workspaceName">Workspace Name</Label>
                  <Input
                    id="workspaceName"
                    value={workspace.name}
                    onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspaceDomain">Domain</Label>
                  <div className="flex">
                    <Input
                      id="workspaceDomain"
                      value={workspace.domain}
                      onChange={(e) => setWorkspace({ ...workspace, domain: e.target.value })}
                      className="rounded-r-none"
                    />
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 border border-l-0 rounded-r-md text-sm text-gray-600 dark:text-gray-400">
                      .zyra.com
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspaceDescription">Description</Label>
                <Textarea
                  id="workspaceDescription"
                  rows={3}
                  value={workspace.description}
                  onChange={(e) => setWorkspace({ ...workspace, description: e.target.value })}
                  placeholder="Describe your workspace..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select
                  value={workspace.timezone}
                  onValueChange={(value) => setWorkspace({ ...workspace, timezone: value })}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Working Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={workspace.workingHours.start}
                    onChange={(e) => setWorkspace({
                      ...workspace,
                      workingHours: { ...workspace.workingHours, start: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={workspace.workingHours.end}
                    onChange={(e) => setWorkspace({
                      ...workspace,
                      workingHours: { ...workspace.workingHours, end: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="flex flex-wrap gap-2">
                  {workingDays.map((day) => (
                    <Button
                      key={day.value}
                      variant={workspace.workingHours.days.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const days = workspace.workingHours.days.includes(day.value)
                          ? workspace.workingHours.days.filter(d => d !== day.value)
                          : [...workspace.workingHours.days, day.value];
                        setWorkspace({
                          ...workspace,
                          workingHours: { ...workspace.workingHours, days }
                        });
                      }}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management */}
        <TabsContent value="team" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Team Members ({teamMembers.length})
                </CardTitle>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite Members
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600">
                        <div className="flex items-center justify-center h-full text-white text-sm font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Last active: {member.lastActive}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(member.status)}
                      <Select value={member.role}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                Workspace Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(workspace.features).map(([key, enabled]) => {
                const featureInfo = {
                  aiInsights: {
                    name: 'AI Insights & Analytics',
                    description: 'Enable AI-powered project insights and predictive analytics',
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                  },
                  timeTracking: {
                    name: 'Time Tracking',
                    description: 'Track time spent on tasks and projects',
                    icon: <Clock className="h-5 w-5 text-blue-500" />,
                  },
                  projectTemplates: {
                    name: 'Project Templates',
                    description: 'Create and use custom project templates',
                    icon: <Folder className="h-5 w-5 text-yellow-500" />,
                  },
                  customFields: {
                    name: 'Custom Fields',
                    description: 'Add custom fields to tasks and projects',
                    icon: <Edit3 className="h-5 w-5 text-purple-500" />,
                  },
                  advancedReporting: {
                    name: 'Advanced Reporting',
                    description: 'Generate detailed reports and analytics',
                    icon: <Calendar className="h-5 w-5 text-indigo-500" />,
                  },
                };

                const info = featureInfo[key as keyof typeof featureInfo];

                return (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {info.icon}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{info.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => setWorkspace({
                        ...workspace,
                        features: { ...workspace.features, [key]: checked }
                      })}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Subscription & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enterprise Plan</h3>
                    <p className="text-gray-600 dark:text-gray-400">Advanced features for large teams</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default">Active</Badge>
                      <span className="text-sm text-gray-500">Next billing: Jan 15, 2024</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">$29</div>
                    <div className="text-sm text-gray-500">per user/month</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Manage Subscription</div>
                    <div className="text-xs text-gray-500">Change plan or billing details</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Usage & Analytics</div>
                    <div className="text-xs text-gray-500">View detailed usage statistics</div>
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