'use client'

import React, { useState } from 'react';
import { useTasksWithSupabase } from '@/hooks/useTasksWithSupabase';
import { Task, TaskFormData, TaskSortOptions, TaskStatus, TaskPriority, TaskFilters } from '@/types/task';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { AIInsights } from '@/components/AIInsights';
import { AdvancedSearch } from '@/components/search/AdvancedSearch';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { Timer } from '@/components/time-tracking/Timer';
import { TimeEntryList } from '@/components/time-tracking/TimeEntryList';
import { TimeReports } from '@/components/time-tracking/TimeReports';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  Timer as TimerIcon,
  BarChart3,
  Filter
} from 'lucide-react';
import { DashboardSkeleton } from '@/components/ui/skeleton';

const statusOptions: { value: TaskStatus; label: string; icon: React.ReactNode }[] = [
  { value: 'todo', label: 'To Do', icon: <Circle className="h-4 w-4" /> },
  { value: 'in_progress', label: 'In Progress', icon: <Clock className="h-4 w-4" /> },
  { value: 'review', label: 'Review', icon: <AlertCircle className="h-4 w-4" /> },
  { value: 'done', label: 'Done', icon: <CheckCircle2 className="h-4 w-4" /> },
];

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-zyra-success/10 text-zyra-success border-zyra-success/20' },
  { value: 'medium', label: 'Medium', color: 'bg-zyra-warning/10 text-zyra-warning border-zyra-warning/20' },
  { value: 'high', label: 'High', color: 'bg-zyra-warning/10 text-zyra-warning border-zyra-warning/20' },
  { value: 'urgent', label: 'Urgent', color: 'bg-zyra-danger/10 text-zyra-danger border-zyra-danger/20' },
];

const sortOptions = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
];

export default function TaskDashboard() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const {
    tasks,
    loading,
    error,
    filters,
    sort,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    updateFilters,
    updateSort,
    clearFilters,
    searchTasks,
  } = useTasksWithSupabase();

  // Handle search and filters
  const handleSearch = (query: string, searchFilters: TaskFilters) => {
    searchTasks(query);
    updateFilters(searchFilters);
  };

  const handleFiltersChange = (newFilters: TaskFilters) => {
    updateFilters(newFilters);
  };

  const handleSortChange = (newSort: TaskSortOptions) => {
    updateSort(newSort);
  };

  // Handle task operations
  const handleTaskSubmit = async (taskData: TaskFormData) => {
    if (editingTask) {
      try {
        await updateTask(editingTask.id, taskData);
        setShowTaskForm(false);
        setEditingTask(undefined);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    } else {
      try {
        await createTask(taskData);
        setShowTaskForm(false);
      } catch (error) {
        console.error('Error creating task:', error);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      await toggleTaskStatus(taskId);
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // Filter tasks by tab
  const getTasksByTab = (tab: string) => {
    switch (tab) {
      case 'todo':
        return tasks.filter(task => task.status === 'todo');
      case 'in_progress':
        return tasks.filter(task => task.status === 'in_progress');
      case 'review':
        return tasks.filter(task => task.status === 'review');
      case 'done':
        return tasks.filter(task => task.status === 'done');
      default:
        return tasks;
    }
  };

  // Get task statistics
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(task => task.status === 'todo').length,
    in_progress: tasks.filter(task => task.status === 'in_progress').length,
    review: tasks.filter(task => task.status === 'review').length,
    done: tasks.filter(task => task.status === 'done').length,
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-2">Error loading tasks</div>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with enhanced mobile-first responsive design */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 mobile-padding sm:p-6 lg:p-8 rounded-2xl border border-blue-100 dark:border-blue-900/30 mb-6 sm:mb-8 shadow-mobile">
        <div className="flex-mobile-col gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Task Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-responsive-sm sm:text-base lg:text-lg">
              Manage your tasks with AI-powered insights and real-time collaboration
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              variant="outline"
              className="btn-mobile flex items-center justify-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 shadow-mobile hover:shadow-mobile-lg transition-all duration-200 touch-manipulation"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-responsive-sm">{showFilterPanel ? 'Hide Filters' : 'Show Filters'}</span>
            </Button>
            
            <Button 
              onClick={() => setShowTaskForm(true)} 
              className="btn-mobile flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-mobile hover:shadow-mobile-lg transition-all duration-200 touch-manipulation"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-responsive-sm">New Task</span>
            </Button>
          </div>
        </div>
      </div>

      {/* AI Insights - Enhanced with mobile-first responsive design */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 mobile-padding sm:p-6 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-mobile">
        <AIInsights tasks={tasks} className="w-full" />
      </div>

      {/* Main Content Grid with improved mobile-first spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {/* Enhanced Filter Panel - Collapsible on mobile */}
        {showFilterPanel && (
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-mobile">
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </div>
        )}

        {/* Main Task Area */}
        <div className={`${showFilterPanel ? "lg:col-span-3" : "lg:col-span-4"} order-1 lg:order-2`}>
          {/* Enhanced Statistics Cards with mobile-first responsive grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950/30 dark:to-cyan-900/30 border-blue-200 dark:border-blue-800 hover:shadow-mobile-lg transition-all duration-200 touch-manipulation">
              <CardContent className="mobile-padding sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">To Do</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100">{taskStats.todo}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-200 dark:bg-blue-800 rounded-xl flex items-center justify-center">
                    <Circle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-950/30 dark:to-orange-900/30 border-yellow-200 dark:border-yellow-800 hover:shadow-mobile-lg transition-all duration-200 touch-manipulation">
              <CardContent className="mobile-padding sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-300">In Progress</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-900 dark:text-yellow-100">{taskStats.in_progress}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-200 dark:bg-yellow-800 rounded-xl flex items-center justify-center">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-800 hover:shadow-mobile-lg transition-all duration-200 touch-manipulation">
              <CardContent className="mobile-padding sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">Review</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900 dark:text-purple-100">{taskStats.review}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-200 dark:bg-purple-800 rounded-xl flex items-center justify-center">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800 hover:shadow-mobile-lg transition-all duration-200 touch-manipulation">
              <CardContent className="mobile-padding sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Done</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 dark:text-green-100">{taskStats.done}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-200 dark:bg-green-800 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Task Tabs with mobile-first responsive design */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-mobile overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-mobile rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 mobile-padding sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation"
                  >
                    <span className="hidden sm:inline">All Tasks</span>
                    <span className="sm:hidden">All</span>
                    <span className="ml-1 sm:ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                      {tasks.length}
                    </span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="todo" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-mobile rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 mobile-padding sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation"
                  >
                    <Circle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">To Do</span>
                    <span className="sm:hidden">Todo</span>
                    <span className="ml-1 sm:ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                      {taskStats.todo}
                    </span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="in_progress" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-mobile rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 mobile-padding sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation"
                  >
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">In Progress</span>
                    <span className="sm:hidden">Progress</span>
                    <span className="ml-1 sm:ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 rounded-full">
                      {taskStats.in_progress}
                    </span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="review" 
                    className="hidden sm:flex data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-mobile rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 px-4 py-3 text-sm font-medium transition-all duration-200 touch-manipulation"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Review
                    <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full">
                      {taskStats.review}
                    </span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="done" 
                    className="hidden sm:flex data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-mobile rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 px-4 py-3 text-sm font-medium transition-all duration-200 touch-manipulation"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Done
                    <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                      {taskStats.done}
                    </span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="timer" 
                    className="hidden sm:flex data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-mobile rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 px-4 py-3 text-sm font-medium transition-all duration-200 touch-manipulation"
                  >
                    <TimerIcon className="w-4 h-4 mr-2" />
                    Timer
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="reports" 
                    className="hidden sm:flex data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-mobile rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 px-4 py-3 text-sm font-medium transition-all duration-200 touch-manipulation"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Reports
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="all" className="mt-0">
                  <TaskList
                    tasks={getTasksByTab('all')}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </TabsContent>

                <TabsContent value="todo" className="mt-0">
                  <TaskList
                    tasks={getTasksByTab('todo')}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </TabsContent>

                <TabsContent value="in_progress" className="mt-0">
                  <TaskList
                    tasks={getTasksByTab('in_progress')}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </TabsContent>

                <TabsContent value="review" className="mt-0">
                  <TaskList
                    tasks={getTasksByTab('review')}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </TabsContent>

                <TabsContent value="done" className="mt-0">
                  <TaskList
                    tasks={getTasksByTab('done')}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </TabsContent>

                <TabsContent value="timer" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 mobile-padding sm:p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <Timer />
                    </div>
                    <div className="bg-white dark:bg-gray-900 mobile-padding sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <TimeEntryList />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reports" className="mt-0">
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 mobile-padding sm:p-6 rounded-xl border border-pink-200 dark:border-pink-800">
                    <TimeReports />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Task Form Modal with mobile-first responsive design */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(undefined);
          }}
          isOpen={showTaskForm}
        />
      )}
    </div>
  );
}