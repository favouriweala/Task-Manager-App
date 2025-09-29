'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTasksWithSupabase } from '@/hooks/useTasksWithSupabase'
import { Task, TaskFormData, TaskStatus, TaskPriority, TaskFilters } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Plus, 
  Filter, 
  SortAsc, 
  Brain, 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Circle,
  TrendingUp,
  Calendar,
  Users,
  Target,
  Sparkles,
  MoreHorizontal,
  Star,
  Flag,
  Eye,
  MessageSquare,
  Paperclip,
  ArrowRight
} from 'lucide-react'
import { SmartTaskPrioritizer } from '@/components/ai/SmartTaskPrioritizer'
import { GoogleStyleSearch } from '@/components/search/GoogleStyleSearch'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

// Google-style color palette
const googleColors = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
  indigo: 'from-indigo-500 to-indigo-600',
}

// Smart priority suggestions based on AI analysis
const getSmartPriority = (task: Task): { suggestion: TaskPriority; confidence: number; reason: string } => {
  const now = new Date()
  const dueDate = task.due_date ? new Date(task.due_date) : null
  const daysToDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
  
  // AI-powered priority logic
  if (daysToDue && daysToDue <= 1) {
    return { suggestion: 'urgent', confidence: 95, reason: 'Due within 24 hours' }
  }
  if (daysToDue && daysToDue <= 3) {
    return { suggestion: 'high', confidence: 85, reason: 'Due within 3 days' }
  }
  if (task.title.toLowerCase().includes('urgent') || task.title.toLowerCase().includes('asap')) {
    return { suggestion: 'urgent', confidence: 90, reason: 'Contains urgent keywords' }
  }
  if (task.title.toLowerCase().includes('important') || task.title.toLowerCase().includes('critical')) {
    return { suggestion: 'high', confidence: 80, reason: 'Contains important keywords' }
  }
  
  return { suggestion: 'medium', confidence: 60, reason: 'Standard priority based on content analysis' }
}

// Google-style task card component
const GoogleTaskCard: React.FC<{
  task: Task
  onEdit: (task: Task) => void
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
}> = ({ task, onEdit, onToggle, onDelete }) => {
  const smartPriority = getSmartPriority(task)
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()
  
  const priorityColors = {
    low: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300',
    high: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300',
    urgent: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300',
  }

  const statusIcons = {
    todo: <Circle className="h-4 w-4" />,
    in_progress: <Clock className="h-4 w-4 text-blue-500" />,
    review: <AlertCircle className="h-4 w-4 text-orange-500" />,
    done: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  }

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
      task.status === 'done' && "opacity-75",
      isOverdue && task.status !== 'done' && "ring-2 ring-red-200 dark:ring-red-800"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <button
              onClick={() => onToggle(task.id)}
              className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              {statusIcons[task.status]}
            </button>
            <div className="flex-1 min-w-0">
              <CardTitle className={cn(
                "text-base font-semibold leading-tight",
                task.status === 'done' && "line-through text-gray-500"
              )}>
                {task.title}
              </CardTitle>
              {task.description && (
                <CardDescription className="mt-1 text-sm line-clamp-2">
                  {task.description}
                </CardDescription>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={cn("text-xs font-medium border", priorityColors[task.priority])}>
              {task.priority}
            </Badge>
            
            {smartPriority.suggestion !== task.priority && smartPriority.confidence > 75 && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 dark:bg-blue-950 rounded-full">
                <Brain className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  AI suggests: {smartPriority.suggestion}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {task.due_date && (
              <div className={cn(
                "flex items-center space-x-1",
                isOverdue && "text-red-500 font-medium"
              )}>
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-3 w-3" />
              <span>0</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Paperclip className="h-3 w-3" />
              <span>0</span>
            </div>
          </div>
        </div>
        
        {/* Progress indicator for in-progress tasks */}
        {task.status === 'in_progress' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>65%</span>
            </div>
            <Progress value={65} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Smart insights panel
const SmartInsightsPanel: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const insights = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'done').length
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    
    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      urgentTasks,
      completionRate,
      productivity: completionRate > 80 ? 'Excellent' : completionRate > 60 ? 'Good' : 'Needs Improvement'
    }
  }, [tasks])

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Insights</CardTitle>
            <CardDescription>Smart analysis of your productivity</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{insights.completionRate.toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{insights.productivity}</div>
            <div className="text-sm text-gray-600">Productivity</div>
          </div>
        </div>
        
        {insights.overdueTasks > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {insights.overdueTasks} overdue task{insights.overdueTasks > 1 ? 's' : ''} need attention
              </span>
            </div>
          </div>
        )}
        
        {insights.urgentTasks > 0 && (
          <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-2">
              <Flag className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                {insights.urgentTasks} urgent task{insights.urgentTasks > 1 ? 's' : ''} require immediate action
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function GoogleStyleTaskDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState('board')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all')

  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  } = useTasksWithSupabase()

  // Filter tasks based on search and status
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus)
    }

    return filtered
  }, [tasks, searchQuery, selectedStatus])

  // Group tasks by status for board view
  const tasksByStatus = useMemo(() => {
    const groups = {
      todo: filteredTasks.filter(t => t.status === 'todo'),
      in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
      review: filteredTasks.filter(t => t.status === 'review'),
      done: filteredTasks.filter(t => t.status === 'done'),
    }
    return groups
  }, [filteredTasks])

  const handleEditTask = (task: Task) => {
    // Implementation for editing task
    console.log('Edit task:', task)
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTaskStatus(taskId)
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-2">Error loading tasks</div>
        <p className="text-gray-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Google-style Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex-1">
          <GoogleStyleSearch
            onSearch={(query, filters) => {
              setSearchQuery(query)
              // Apply filters to task filtering logic
              console.log('Search:', query, 'Filters:', filters)
            }}
            onFilterChange={(filters) => {
              // Handle filter changes
              console.log('Filters changed:', filters)
            }}
            tasks={tasks}
            placeholder="Search tasks with AI-powered suggestions..."
            showAISuggestions={true}
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Smart AI-Powered Task Prioritization */}
      <SmartTaskPrioritizer tasks={tasks} />

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <TabsTrigger value="board" className="flex items-center space-x-2">
            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
              <div className="bg-current rounded-sm opacity-60"></div>
              <div className="bg-current rounded-sm opacity-60"></div>
              <div className="bg-current rounded-sm opacity-60"></div>
              <div className="bg-current rounded-sm opacity-60"></div>
            </div>
            <span>Board</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <div className="w-4 h-4 flex flex-col space-y-0.5">
              <div className="h-0.5 bg-current rounded opacity-60"></div>
              <div className="h-0.5 bg-current rounded opacity-60"></div>
              <div className="h-0.5 bg-current rounded opacity-60"></div>
            </div>
            <span>List</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
          </TabsTrigger>
        </TabsList>

        {/* Board View */}
        <TabsContent value="board" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                    {status.replace('_', ' ')} ({statusTasks.length})
                  </h3>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {statusTasks.map((task) => (
                    <GoogleTaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-6">
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <GoogleTaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-6">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Calendar View</h3>
            <p className="text-gray-500">Calendar integration coming soon with Google Calendar sync</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}