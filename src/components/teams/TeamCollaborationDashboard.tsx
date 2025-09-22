'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Activity, 
  Settings,
  Plus,
  Search,
  Filter,
  Bell,
  Video,
  Share2,
  Clock,
  TrendingUp,
  UserPlus,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import ProjectManagement from './ProjectManagement';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: 'online' | 'away' | 'offline';
  lastActive: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  dueDate: string;
  members: TeamMember[];
  status: 'active' | 'completed' | 'on-hold';
}

interface Activity {
  id: string;
  user: TeamMember;
  action: string;
  target: string;
  timestamp: string;
  type: 'task' | 'comment' | 'file' | 'meeting';
}

export function TeamCollaborationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - replace with real data from your API
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatar: '/avatars/alice.jpg',
      role: 'Team Lead',
      status: 'online',
      lastActive: '2 minutes ago'
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'Developer',
      status: 'away',
      lastActive: '15 minutes ago'
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol@example.com',
      role: 'Designer',
      status: 'online',
      lastActive: 'Just now'
    }
  ];

  const projects: Project[] = [
    {
      id: '1',
      name: 'Mobile App Redesign',
      description: 'Complete redesign of the mobile application',
      progress: 75,
      dueDate: '2024-02-15',
      members: teamMembers.slice(0, 2),
      status: 'active'
    },
    {
      id: '2',
      name: 'API Integration',
      description: 'Integrate third-party APIs',
      progress: 45,
      dueDate: '2024-02-28',
      members: teamMembers,
      status: 'active'
    }
  ];

  const recentActivities: Activity[] = [
    {
      id: '1',
      user: teamMembers[0],
      action: 'completed task',
      target: 'User Authentication Flow',
      timestamp: '5 minutes ago',
      type: 'task'
    },
    {
      id: '2',
      user: teamMembers[1],
      action: 'commented on',
      target: 'Mobile App Redesign',
      timestamp: '12 minutes ago',
      type: 'comment'
    },
    {
      id: '3',
      user: teamMembers[2],
      action: 'uploaded file to',
      target: 'Design Assets',
      timestamp: '1 hour ago',
      type: 'file'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Header - Mobile-first responsive design */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-mobile dark:shadow-mobile-dark safe-top">
        <div className="container-mobile sm:container-tablet lg:container-desktop mobile-padding sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col space-y-4 sm:space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Team Collaboration</h1>
                <p className="text-blue-100 mt-1 text-sm sm:text-base">Manage projects, communicate, and collaborate effectively</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Button 
                className="btn-mobile bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 shadow-mobile touch-manipulation transition-all duration-200"
                onClick={() => {
                  // Add meeting functionality here
                  console.log('Start Meeting clicked');
                }}
              >
                <Video className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Start Meeting</span>
              </Button>
              <Button 
                className="btn-mobile bg-white text-blue-600 hover:bg-blue-50 shadow-mobile touch-manipulation transition-all duration-200"
                onClick={() => {
                  // Add invite functionality here
                  console.log('Invite Members clicked');
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Invite Members</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-mobile sm:container-tablet lg:container-desktop mobile-padding sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Quick Stats - Mobile-first responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 shadow-mobile hover:shadow-mobile-lg transition-all duration-300 touch-manipulation">
            <CardContent className="mobile-padding sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Team Members</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{teamMembers.length}</p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">2 online now</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl sm:rounded-2xl">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 shadow-mobile hover:shadow-mobile-lg transition-all duration-300 touch-manipulation">
            <CardContent className="mobile-padding sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Projects</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100">{projects.length}</p>
                  <p className="text-xs text-green-500 dark:text-green-400 mt-1">75% avg progress</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/50 rounded-xl sm:rounded-2xl">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800 shadow-mobile hover:shadow-mobile-lg transition-all duration-300 touch-manipulation">
            <CardContent className="mobile-padding sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Messages Today</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">47</p>
                  <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">+12% from yesterday</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl sm:rounded-2xl">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800 shadow-mobile hover:shadow-mobile-lg transition-all duration-300 touch-manipulation">
            <CardContent className="mobile-padding sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Tasks Completed</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-100">23</p>
                  <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">This week</p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl sm:rounded-2xl">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs - Mobile-first responsive design */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl mobile-padding sm:p-6 shadow-mobile border border-gray-100 dark:border-gray-800">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-4 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg sm:rounded-xl">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md sm:rounded-lg text-sm sm:text-base touch-manipulation">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md sm:rounded-lg text-sm sm:text-base touch-manipulation">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base font-medium">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md sm:rounded-lg text-sm sm:text-base touch-manipulation">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base font-medium">Members</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md sm:rounded-lg text-sm sm:text-base touch-manipulation">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base font-medium">Activities</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <Input
                  placeholder="Search teams, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 text-sm touch-manipulation"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="btn-mobile shadow-mobile touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={() => {
                  // Add filter functionality here
                  console.log('Filter button clicked');
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Filters</span>
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Activity */}
              <Card className="shadow-mobile border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-t-xl mobile-padding sm:p-6">
                  <CardTitle className="flex items-center text-blue-900 dark:text-blue-100 text-lg sm:text-xl">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="text-responsive">Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="mobile-padding sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-300 touch-manipulation">
                        <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                            {activity.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            <span className="font-medium">{activity.user.name}</span>
                            {' '}{activity.action}{' '}
                            <span className="font-medium text-blue-600 dark:text-blue-400">{activity.target}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Team Performance */}
              <Card className="shadow-mobile border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-t-xl mobile-padding sm:p-6">
                  <CardTitle className="flex items-center text-green-900 dark:text-green-100 text-lg sm:text-xl">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="text-responsive">Team Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="mobile-padding sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tasks Completed</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Progress</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Collaboration</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">91%</span>
                      </div>
                      <Progress value={91} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <ProjectManagement />
          </TabsContent>

          <TabsContent value="members" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id} className="shadow-mobile border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-mobile-lg transition-all duration-300 touch-manipulation">
                  <CardContent className="mobile-padding sm:p-6">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="relative">
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(member.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">{member.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{member.lastActive}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1 btn-mobile shadow-mobile touch-manipulation">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="text-responsive-xs">Message</span>
                      </Button>
                      <Button size="sm" variant="outline" className="btn-mobile shadow-mobile touch-manipulation">
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 sm:space-y-6">
            <Card className="shadow-mobile border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-t-xl mobile-padding sm:p-6">
                <CardTitle className="flex items-center text-purple-900 dark:text-purple-100 text-lg sm:text-xl">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-responsive">Team Activity Feed</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="mobile-padding sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-300 touch-manipulation">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                          {activity.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            <span className="font-semibold">{activity.user.name}</span>
                            {' '}{activity.action}{' '}
                            <span className="font-medium text-blue-600 dark:text-blue-400">{activity.target}</span>
                          </p>
                          <Badge variant="outline" className="text-xs w-fit">
                            {activity.type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}