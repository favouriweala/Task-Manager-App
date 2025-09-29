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
  TrendingUp,
  Brain,
  Zap,
  Activity,
  DollarSign,
  Award,
  Lightbulb,
  ArrowRight,
  MoreHorizontal,
  Download,
  Share2,
  Bell
} from 'lucide-react';  
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProjectAnalyticsChart } from '@/components/analytics/ProjectAnalyticsChart';
import { AIInsightsPanel } from '@/components/ai/AIInsightsPanel';
import { PredictiveAnalytics } from '@/components/ai/PredictiveAnalytics';
import { ProjectAIInsights } from './ProjectAIInsights';
import { ProjectAdvancedAnalytics } from './ProjectAdvancedAnalytics';
import { TeamCollaboration } from './TeamCollaboration';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
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
  tags: string[];
  lastActivity: string;
  health: 'excellent' | 'good' | 'at-risk' | 'critical';
  aiScore: number;
}

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  dueDate: string;
  projectId: string;
  tags: string[];
  estimatedHours: number;
  actualHours: number;
}

export function EnhancedProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Zyra AI Enhancement',
        description: 'Implementing advanced AI features and machine learning capabilities',
        status: 'active',
        priority: 'high',
        progress: 75,
        startDate: '2024-01-15',
        endDate: '2024-03-30',
        budget: 150000,
        spent: 112500,
        team: [
          { id: '1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', role: 'Lead Developer' },
          { id: '2', name: 'Mike Johnson', avatar: '/avatars/mike.jpg', role: 'AI Specialist' },
          { id: '3', name: 'Emma Davis', avatar: '/avatars/emma.jpg', role: 'UX Designer' },
        ],
        tasks: { total: 45, completed: 34, inProgress: 8, pending: 3 },
        tags: ['AI', 'Machine Learning', 'Frontend', 'Backend'],
        lastActivity: '2 hours ago',
        health: 'good',
        aiScore: 8.7
      },
      {
        id: '2',
        name: 'Mobile App Development',
        description: 'Cross-platform mobile application for task management',
        status: 'active',
        priority: 'high',
        progress: 45,
        startDate: '2024-02-01',
        endDate: '2024-05-15',
        budget: 200000,
        spent: 90000,
        team: [
          { id: '4', name: 'Alex Rodriguez', avatar: '/avatars/alex.jpg', role: 'Mobile Lead' },
          { id: '5', name: 'Lisa Wang', avatar: '/avatars/lisa.jpg', role: 'Flutter Developer' },
        ],
        tasks: { total: 32, completed: 14, inProgress: 12, pending: 6 },
        tags: ['Mobile', 'Flutter', 'React Native', 'API'],
        lastActivity: '1 day ago',
        health: 'at-risk',
        aiScore: 6.8
      },
      {
        id: '3',
        name: 'Analytics Dashboard',
        description: 'Advanced analytics and reporting dashboard with real-time insights',
        status: 'planning',
        priority: 'medium',
        progress: 15,
        startDate: '2024-03-01',
        endDate: '2024-06-30',
        budget: 100000,
        spent: 15000,
        team: [
          { id: '6', name: 'David Kim', avatar: '/avatars/david.jpg', role: 'Data Engineer' },
          { id: '7', name: 'Rachel Green', avatar: '/avatars/rachel.jpg', role: 'Frontend Developer' },
        ],
        tasks: { total: 28, completed: 4, inProgress: 3, pending: 21 },
        tags: ['Analytics', 'Dashboard', 'Data Visualization', 'React'],
        lastActivity: '3 days ago',
        health: 'excellent',
        aiScore: 9.2
      }
    ];
    
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  // Filter projects based on search and filters
  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'at-risk': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 cursor-pointer"
          onClick={() => setSelectedProject(project)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {project.name}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {project.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(project.status)} border-0 font-medium`}>
              {project.status}
            </Badge>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Tasks Summary */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{project.tasks.total}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-bold text-green-700 dark:text-green-300">{project.tasks.completed}</div>
            <div className="text-xs text-green-600 dark:text-green-400">Done</div>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{project.tasks.inProgress}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Active</div>
          </div>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{project.tasks.pending}</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending</div>
          </div>
        </div>

        {/* Team & Budget */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {project.team.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="h-8 w-8 border-2 border-white dark:border-gray-800">
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.team.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    +{project.team.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Budget</div>
          </div>
        </div>

        {/* AI Score & Health */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Score</span>
            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
              {project.aiScore}/10
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Activity className={`h-4 w-4 ${getHealthColor(project.health)}`} />
            <span className={`text-sm font-medium ${getHealthColor(project.health)}`}>
              {project.health}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              +{project.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Projects</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {projects.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Completion Rate</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {Math.round((projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) || 0)}%
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Insights</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {projects.filter(p => p.aiScore > 8).length}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400">
              <Lightbulb className="h-4 w-4 mr-1" />
              <span>High-performing projects</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Team Members</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {new Set(projects.flatMap(p => p.team.map(t => t.id))).size}
                </p>
              </div>
              <div className="p-3 bg-orange-500 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600 dark:text-orange-400">
              <Users className="h-4 w-4 mr-1" />
              <span>Across all projects</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects, tags, or team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-white dark:bg-gray-900">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32 bg-white dark:bg-gray-900">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showAIInsights ? "default" : "outline"}
            onClick={() => setShowAIInsights(!showAIInsights)}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Insights
          </Button>
          
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* AI Insights Panel */}
      {showAIInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span>AI Project Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIInsightsPanel />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Predictive Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PredictiveAnalytics />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <Card className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first project'
              }
            </p>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="collaboration">Team</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <Card className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
              <CardContent>
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <FolderOpen className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No projects found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first project'
                  }
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="projects">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="ai-insights">
          <ProjectAIInsights />
        </TabsContent>
        
        <TabsContent value="analytics">
          <ProjectAdvancedAnalytics />
        </TabsContent>
        
        <TabsContent value="collaboration">
          <TeamCollaboration />
        </TabsContent>
      </Tabs>
    </div>
  );
}