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
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 border-red-200' },
];

const sortOptions = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
];

export function TaskDashboard() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
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
  const handleCreateTask = async (taskData: TaskFormData) => {
    try {
      await createTask(taskData);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskData: TaskFormData) => {
    if (!editingTask) return;
    
    try {
      await updateTask(editingTask.id, taskData);
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Task Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and track your tasks efficiently</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      <AIInsights tasks={tasks} className="lg:col-span-2" />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Filters */}
        {showFilterPanel && (
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSortChange={handleSortChange}
              currentSort={sort}
              showSorting={true}
            />
          </div>
        )}

        {/* Main Content */}
        <div className={showFilterPanel ? "lg:col-span-3" : "lg:col-span-4"}>
          {/* Advanced Search */}
          <div className="mb-6">
            <AdvancedSearch
              onSearch={handleSearch}
              onFiltersChange={handleFiltersChange}
              currentFilters={filters}
            />
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
                  </div>
                  <Circle className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">To Do</p>
                    <p className="text-2xl font-bold text-blue-600">{taskStats.todo}</p>
                  </div>
                  <Circle className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-600">{taskStats.in_progress}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Review</p>
                    <p className="text-2xl font-bold text-orange-600">{taskStats.review}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Done</p>
                    <p className="text-2xl font-bold text-green-600">{taskStats.done}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Tabs with Time Tracking */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All ({taskStats.total})</TabsTrigger>
              <TabsTrigger value="todo">To Do ({taskStats.todo})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({taskStats.in_progress})</TabsTrigger>
              <TabsTrigger value="review">Review ({taskStats.review})</TabsTrigger>
              <TabsTrigger value="done">Done ({taskStats.done})</TabsTrigger>
              <TabsTrigger value="timer" className="flex items-center gap-1">
                <TimerIcon className="h-3 w-3" />
                Timer
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <TaskList
                tasks={getTasksByTab('all')}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            </TabsContent>

            <TabsContent value="todo" className="mt-6">
              <TaskList
                tasks={getTasksByTab('todo')}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            </TabsContent>

            <TabsContent value="in_progress" className="mt-6">
              <TaskList
                tasks={getTasksByTab('in_progress')}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            </TabsContent>

            <TabsContent value="review" className="mt-6">
              <TaskList
                tasks={getTasksByTab('review')}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            </TabsContent>

            <TabsContent value="done" className="mt-6">
              <TaskList
                tasks={getTasksByTab('done')}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            </TabsContent>

            <TabsContent value="timer" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Timer />
                <TimeEntryList />
              </div>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <TimeReports />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <TaskForm
              task={editingTask || undefined}
              isOpen={showTaskForm}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}