'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Calendar, 
  Users, 
  Target, 
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Filter,
  Search,
  Star,
  GitBranch,
  FileText,
  MessageSquare,
  Paperclip,
  Eye,
  CheckSquare,
} from 'lucide-react';  
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  startDate: string;
  endDate: string;
  team: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  }[];
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
}

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  comments: number;
  attachments: number;
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Mobile App Redesign',
      description: 'Complete overhaul of the mobile application UI/UX',
      status: 'active',
      priority: 'high',
      progress: 68,
      startDate: '2024-01-15',
      endDate: '2024-03-30',
      team: [
        { id: '1', name: 'Alice Johnson', avatar: '/avatars/alice.jpg', role: 'Lead Designer' },
        { id: '2', name: 'Bob Smith', avatar: '/avatars/bob.jpg', role: 'Developer' },
        { id: '3', name: 'Carol Davis', avatar: '/avatars/carol.jpg', role: 'QA Engineer' }
      ],
      tasks: { total: 24, completed: 16, inProgress: 5, pending: 3 },
      budget: { allocated: 50000, spent: 32000, currency: 'USD' }
    },
    {
      id: '2',
      name: 'API Integration',
      description: 'Integrate third-party APIs for enhanced functionality',
      status: 'planning',
      priority: 'medium',
      progress: 15,
      startDate: '2024-02-01',
      endDate: '2024-04-15',
      team: [
        { id: '4', name: 'David Wilson', avatar: '/avatars/david.jpg', role: 'Backend Developer' },
        { id: '5', name: 'Eva Brown', avatar: '/avatars/eva.jpg', role: 'DevOps Engineer' }
      ],
      tasks: { total: 18, completed: 2, inProgress: 3, pending: 13 }
    }
  ]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Design new login screen',
      status: 'done',
      priority: 'high',
      assignee: { name: 'Alice Johnson', avatar: '/avatars/alice.jpg' },
      dueDate: '2024-01-20',
      comments: 3,
      attachments: 2
    },
    {
      id: '2',
      title: 'Implement user authentication',
      status: 'in-progress',
      priority: 'high',
      assignee: { name: 'Bob Smith', avatar: '/avatars/bob.jpg' },
      dueDate: '2024-01-25',
      comments: 1,
      attachments: 0
    },
    {
      id: '3',
      title: 'Create onboarding flow',
      status: 'review',
      priority: 'medium',
      assignee: { name: 'Carol Davis', avatar: '/avatars/carol.jpg' },
      dueDate: '2024-01-30',
      comments: 5,
      attachments: 1
    }
  ];

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Header - Mobile-first responsive design */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start lg:items-center sm:space-y-0 gap-4">
        <div className="space-y-2">
          <h2 className="text-responsive-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            📁 Project Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-responsive-sm">Manage projects, track progress, and collaborate with your team</p>
        </div>
        <Button className="btn-mobile bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-mobile hover:shadow-mobile-lg transition-all duration-200 touch-manipulation">
          <Plus className="h-4 w-4 mr-2" />
          <span className="text-responsive-sm">✨ New Project</span>
        </Button>
      </div>

      {/* Enhanced Filters and Search - Mobile-first responsive design */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="🔍 Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 mobile-padding sm:p-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent touch-manipulation text-responsive-sm"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48 mobile-padding sm:p-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent touch-manipulation text-responsive-sm">
            <SelectValue placeholder="📊 Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectItem value="all" className="text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">📋 All Projects</SelectItem>
            <SelectItem value="planning" className="text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">📝 Planning</SelectItem>
            <SelectItem value="active" className="text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">🚀 Active</SelectItem>
            <SelectItem value="on-hold" className="text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">⏸️ On Hold</SelectItem>
            <SelectItem value="completed" className="text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">✅ Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Enhanced Projects List - Mobile-first responsive design */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-responsive-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            📂 Projects
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className={`cursor-pointer transition-all duration-200 shadow-mobile hover:shadow-mobile-lg touch-manipulation border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
                  selectedProject?.id === project.id 
                    ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-mobile-lg' 
                    : 'hover:shadow-mobile-lg'
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <CardContent className="mobile-padding sm:p-4">
                  <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-responsive-sm truncate">{project.name}</h4>
                      <p className="text-responsive-xs text-gray-600 dark:text-gray-400 line-clamp-2">{project.description}</p>
                    </div>
                    <Badge className={`ml-0 sm:ml-2 self-start ${getStatusColor(project.status)}`}>
                      {project.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-responsive-xs">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">📊 Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map((member) => (
                          <Avatar key={member.id} className="h-6 w-6 sm:h-7 sm:w-7 border-2 border-white dark:border-gray-800">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="text-xs">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        ))}
                        {project.team.length > 3 && (
                          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                            <span className="text-xs text-gray-600 dark:text-gray-400">+{project.team.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <Badge className={`self-start sm:self-auto ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced Project Details - Mobile-first responsive design */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <Card className="h-fit shadow-mobile border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="mobile-padding sm:p-6 pb-4">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-responsive-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                      {selectedProject.name}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-responsive-sm">{selectedProject.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="btn-mobile border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 touch-manipulation">
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="text-responsive-xs">⚙️ Settings</span>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="mobile-padding sm:p-6 space-y-4 sm:space-y-6">
                {/* Enhanced Project Stats - Mobile-first responsive design */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 mobile-padding sm:p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-responsive-xs text-blue-600 dark:text-blue-400 font-medium">🎯 Total Tasks</p>
                        <p className="text-responsive-lg font-bold text-blue-700 dark:text-blue-300">{selectedProject.tasks.total}</p>
                      </div>
                      <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 mobile-padding sm:p-4 rounded-lg border border-green-100 dark:border-green-800">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-responsive-xs text-green-600 dark:text-green-400 font-medium">✅ Completed</p>
                        <p className="text-responsive-lg font-bold text-green-700 dark:text-green-300">{selectedProject.tasks.completed}</p>
                      </div>
                      <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 mobile-padding sm:p-4 rounded-lg border border-yellow-100 dark:border-yellow-800">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-responsive-xs text-yellow-600 dark:text-yellow-400 font-medium">⏳ In Progress</p>
                        <p className="text-responsive-lg font-bold text-yellow-700 dark:text-yellow-300">{selectedProject.tasks.inProgress}</p>
                      </div>
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 mobile-padding sm:p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-responsive-xs text-purple-600 dark:text-purple-400 font-medium">👥 Team Size</p>
                        <p className="text-responsive-lg font-bold text-purple-700 dark:text-purple-300">{selectedProject.team.length}</p>
                      </div>
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Enhanced Project Timeline and Budget - Mobile-first responsive design */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 mobile-padding sm:p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-responsive-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      📅 Timeline
                    </h4>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between text-responsive-xs">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">🚀 Start Date</span>
                        <span className="text-gray-900 dark:text-white">{new Date(selectedProject.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between text-responsive-xs">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">🏁 End Date</span>
                        <span className="text-gray-900 dark:text-white">{new Date(selectedProject.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between text-responsive-xs">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">📊 Progress</span>
                        <span className="text-gray-900 dark:text-white font-semibold">{selectedProject.progress}%</span>
                      </div>
                    </div>
                  </div>

                  {selectedProject.budget && (
                    <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 mobile-padding sm:p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-responsive-sm flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        💰 Budget
                      </h4>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between text-responsive-xs">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">💵 Allocated</span>
                          <span className="text-gray-900 dark:text-white">
                            {selectedProject.budget.currency} {selectedProject.budget.allocated.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between text-responsive-xs">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">💸 Spent</span>
                          <span className="text-gray-900 dark:text-white">
                            {selectedProject.budget.currency} {selectedProject.budget.spent.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between text-responsive-xs">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">💚 Remaining</span>
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            {selectedProject.budget.currency} {(selectedProject.budget.allocated - selectedProject.budget.spent).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Team Members - Mobile-first responsive design */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-responsive-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    👥 Team Members
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {selectedProject.team.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3 mobile-padding sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors touch-manipulation">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-responsive-xs">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-responsive-xs truncate">{member.name}</p>
                          <p className="text-responsive-xs text-gray-600 dark:text-gray-400 truncate">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Recent Tasks - Mobile-first responsive design */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-responsive-sm flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      📋 Recent Tasks
                    </h4>
                    <Button variant="outline" size="sm" className="btn-mobile border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 touch-manipulation">
                      <Eye className="h-4 w-4 mr-2" />
                      <span className="text-responsive-xs">👀 View All</span>
                    </Button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {mockTasks.map((task) => (
                      <div key={task.id} className="flex flex-col space-y-3 mobile-padding sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors shadow-mobile bg-white dark:bg-gray-800 touch-manipulation">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-responsive-sm mb-1 line-clamp-2">{task.title}</h5>
                            <div className="flex flex-wrap gap-2 text-responsive-xs text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Avatar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0">
                                  <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                                  <AvatarFallback className="text-xs">{task.assignee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <span className="truncate">👤 {task.assignee.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={`${getTaskStatusColor(task.status)} flex-shrink-0 text-responsive-xs`}>
                            {task.status}
                          </Badge>
                        </div>
                        
                        {(task.comments > 0 || task.attachments > 0) && (
                          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                            {task.comments > 0 && (
                              <div className="flex items-center space-x-1 text-responsive-xs text-gray-600 dark:text-gray-400">
                                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span>💬 {task.comments} comments</span>
                              </div>
                            )}
                            {task.attachments > 0 && (
                              <div className="flex items-center space-x-1 text-responsive-xs text-gray-600 dark:text-gray-400">
                                <Paperclip className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span>📎 {task.attachments} files</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-96 flex items-center justify-center shadow-mobile border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="text-center mobile-padding sm:p-6">
                <FolderOpen className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-responsive-lg font-medium text-gray-900 dark:text-white mb-2">📂 No Project Selected</h3>
                <p className="text-gray-600 dark:text-gray-400 text-responsive-sm">Select a project from the list to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}