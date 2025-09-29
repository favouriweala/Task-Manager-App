'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Globe, 
  Zap, 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  ExternalLink,
  Clock,
  MapPin,
  Monitor,
  Wifi,
  Database,
  FileText,
  Mail,
  MessageSquare,
  Calendar,
  Users,
  Github,
  Slack,
  Trello,
  Figma,
  Chrome,
  Copy,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface SecuritySettings {
  twoFactor: {
    enabled: boolean;
    method: 'app' | 'sms' | 'email';
    backupCodes: string[];
  };
  sessions: {
    requireReauth: boolean;
    sessionTimeout: number;
    maxConcurrentSessions: number;
  };
  apiKeys: {
    enabled: boolean;
    keys: Array<{
      id: string;
      name: string;
      key: string;
      permissions: string[];
      lastUsed: string;
      expiresAt: string;
    }>;
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
    includeIpAddresses: boolean;
  };
}

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'communication' | 'development' | 'analytics';
  status: 'connected' | 'disconnected' | 'error';
  icon: React.ReactNode;
  permissions: string[];
  lastSync: string;
  config?: Record<string, any>;
}

export function SecuritySettings() {
  const [activeTab, setActiveTab] = useState('security');
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [newApiKeyName, setNewApiKeyName] = useState('');

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactor: {
      enabled: true,
      method: 'app',
      backupCodes: ['ABC123', 'DEF456', 'GHI789', 'JKL012'],
    },
    sessions: {
      requireReauth: true,
      sessionTimeout: 480, // 8 hours
      maxConcurrentSessions: 3,
    },
    apiKeys: {
      enabled: true,
      keys: [
        {
          id: '1',
          name: 'Production API',
          key: 'zyra_sk_1234567890abcdef',
          permissions: ['read:tasks', 'write:tasks', 'read:projects'],
          lastUsed: '2 hours ago',
          expiresAt: '2024-12-31',
        },
        {
          id: '2',
          name: 'Development API',
          key: 'zyra_sk_abcdef1234567890',
          permissions: ['read:tasks', 'read:projects'],
          lastUsed: '1 day ago',
          expiresAt: '2024-06-30',
        },
      ],
    },
    audit: {
      enabled: true,
      retentionDays: 90,
      includeIpAddresses: true,
    },
  });

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and notifications',
      category: 'communication',
      status: 'connected',
      icon: <Slack className="h-5 w-5 text-purple-500" />,
      permissions: ['Send notifications', 'Read channels', 'Post messages'],
      lastSync: '5 minutes ago',
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Code repository integration',
      category: 'development',
      status: 'connected',
      icon: <Database className="h-5 w-5 text-gray-800 dark:text-white" />,
      permissions: ['Read repositories', 'Create issues', 'Read commits'],
      lastSync: '1 hour ago',
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Calendar and scheduling integration',
      category: 'productivity',
      status: 'disconnected',
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      permissions: ['Read events', 'Create events', 'Update events'],
      lastSync: 'Never',
    },
    {
      id: 'jira',
      name: 'Jira',
      description: 'Issue tracking and project management',
      category: 'development',
      status: 'error',
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
      permissions: ['Read issues', 'Create issues', 'Update issues'],
      lastSync: '2 days ago',
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Web analytics and insights',
      category: 'analytics',
      status: 'connected',
      icon: <Zap className="h-5 w-5 text-green-500" />,
      permissions: ['Read analytics data', 'Create reports'],
      lastSync: '30 minutes ago',
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Error</Badge>;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'communication':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'development':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'analytics':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const generateApiKey = () => {
    if (!newApiKeyName.trim()) return;
    
    const newKey = {
      id: Date.now().toString(),
      name: newApiKeyName,
      key: `zyra_sk_${Math.random().toString(36).substring(2, 18)}`,
      permissions: ['read:tasks'],
      lastUsed: 'Never',
      expiresAt: '2025-12-31',
    };

    setSecurity({
      ...security,
      apiKeys: {
        ...security.apiKeys,
        keys: [...security.apiKeys.keys, newKey],
      },
    });
    setNewApiKeyName('');
  };

  const deleteApiKey = (keyId: string) => {
    setSecurity({
      ...security,
      apiKeys: {
        ...security.apiKeys,
        keys: security.apiKeys.keys.filter(key => key.id !== keyId),
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Two-Factor Authentication */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">2FA Enabled</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">Your account is protected with two-factor authentication</p>
                  </div>
                </div>
                <Switch
                  checked={security.twoFactor.enabled}
                  onCheckedChange={(checked) => setSecurity({
                    ...security,
                    twoFactor: { ...security.twoFactor, enabled: checked }
                  })}
                />
              </div>

              {security.twoFactor.enabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Authentication Method</Label>
                    <Select
                      value={security.twoFactor.method}
                      onValueChange={(value: 'app' | 'sms' | 'email') => setSecurity({
                        ...security,
                        twoFactor: { ...security.twoFactor, method: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="app">Authenticator App</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Backup Codes</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {security.twoFactor.backupCodes.map((code, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">
                          <span>{code}</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(code)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate New Codes
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Management */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Session Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Require Re-authentication</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Require password for sensitive actions</p>
                </div>
                <Switch
                  checked={security.sessions.requireReauth}
                  onCheckedChange={(checked) => setSecurity({
                    ...security,
                    sessions: { ...security.sessions, requireReauth: checked }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Select
                  value={security.sessions.sessionTimeout.toString()}
                  onValueChange={(value) => setSecurity({
                    ...security,
                    sessions: { ...security.sessions, sessionTimeout: parseInt(value) }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                    <SelectItem value="720">12 hours</SelectItem>
                    <SelectItem value="1440">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Maximum Concurrent Sessions</Label>
                <Select
                  value={security.sessions.maxConcurrentSessions.toString()}
                  onValueChange={(value) => setSecurity({
                    ...security,
                    sessions: { ...security.sessions, maxConcurrentSessions: parseInt(value) }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 session</SelectItem>
                    <SelectItem value="3">3 sessions</SelectItem>
                    <SelectItem value="5">5 sessions</SelectItem>
                    <SelectItem value="10">10 sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-purple-500" />
                  API Keys
                </CardTitle>
                <Switch
                  checked={security.apiKeys.enabled}
                  onCheckedChange={(checked) => setSecurity({
                    ...security,
                    apiKeys: { ...security.apiKeys, enabled: checked }
                  })}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {security.apiKeys.enabled && (
                <>
                  <div className="flex gap-2">
                    <Input
                      placeholder="API Key Name"
                      value={newApiKeyName}
                      onChange={(e) => setNewApiKeyName(e.target.value)}
                    />
                    <Button onClick={generateApiKey}>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {security.apiKeys.keys.map((apiKey) => (
                      <div key={apiKey.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{apiKey.name}</h4>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                            >
                              {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(apiKey.key)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteApiKey(apiKey.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="font-mono text-sm bg-white dark:bg-gray-900 p-2 rounded border">
                            {showApiKey === apiKey.id ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {apiKey.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Last used: {apiKey.lastUsed}</span>
                            <span>Expires: {apiKey.expiresAt}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Connected Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {integration.icon}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                            <Badge variant="outline" className={getCategoryColor(integration.category)}>
                              {integration.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(integration.status)}
                        <Button variant="outline" size="sm">
                          {integration.status === 'connected' ? 'Configure' : 'Connect'}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {integration.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Last sync: {integration.lastSync}</span>
                        {integration.status === 'connected' && (
                          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Sync now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Integrations */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-500" />
                Available Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Microsoft Teams', category: 'communication', icon: <Users className="h-5 w-5 text-blue-500" /> },
                  { name: 'Trello', category: 'productivity', icon: <Database className="h-5 w-5 text-blue-600" /> },
                  { name: 'Zapier', category: 'productivity', icon: <Zap className="h-5 w-5 text-orange-500" /> },
                  { name: 'GitLab', category: 'development', icon: <Database className="h-5 w-5 text-orange-600" /> },
                  { name: 'Figma', category: 'development', icon: <Settings className="h-5 w-5 text-purple-500" /> },
                  { name: 'Notion', category: 'productivity', icon: <Database className="h-5 w-5 text-gray-800" /> },
                ].map((integration) => (
                  <div key={integration.name} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      {integration.icon}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                        <Badge variant="outline" className={getCategoryColor(integration.category) + ' text-xs'}>
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit & Logs Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-500" />
                Audit Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Enable Audit Logging</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track all user actions and system events</p>
                </div>
                <Switch
                  checked={security.audit.enabled}
                  onCheckedChange={(checked) => setSecurity({
                    ...security,
                    audit: { ...security.audit, enabled: checked }
                  })}
                />
              </div>

              {security.audit.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Log Retention Period (days)</Label>
                    <Select
                      value={security.audit.retentionDays.toString()}
                      onValueChange={(value) => setSecurity({
                        ...security,
                        audit: { ...security.audit, retentionDays: parseInt(value) }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="1095">3 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Include IP Addresses</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Log IP addresses for security analysis</p>
                    </div>
                    <Switch
                      checked={security.audit.includeIpAddresses}
                      onCheckedChange={(checked) => setSecurity({
                        ...security,
                        audit: { ...security.audit, includeIpAddresses: checked }
                      })}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Recent Security Events
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { event: 'User login', time: '2 minutes ago', status: 'success', ip: '192.168.1.100' },
                  { event: 'API key generated', time: '1 hour ago', status: 'success', ip: '192.168.1.100' },
                  { event: 'Failed login attempt', time: '3 hours ago', status: 'warning', ip: '203.0.113.42' },
                  { event: 'Password changed', time: '1 day ago', status: 'success', ip: '192.168.1.100' },
                  { event: '2FA enabled', time: '2 days ago', status: 'success', ip: '192.168.1.100' },
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : log.status === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{log.event}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">IP: {log.ip}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{log.time}</span>
                  </div>
                ))}
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