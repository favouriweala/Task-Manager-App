import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskFormData, TaskPriority, TaskStatus } from '../types/task';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useAI } from '../hooks/useAI';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, isOpen }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    category: '',
    status: 'todo'
  });

  const [aiSuggestions, setAiSuggestions] = useState<{
    category?: string;
    priority?: TaskPriority;
    suggestedTitle?: string;
    suggestedDescription?: string;
  } | null>(null);

  const { analyzeTaskAI, isAnalyzing, aiAvailable, error: aiError } = useAI();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        category: task.category || '',
        status: task.status
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        category: '',
        status: 'todo'
      });
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      const submitData: TaskFormData = {
        ...formData,
        due_date: formData.due_date || undefined
      };
      onSubmit(submitData);
    }
  };

  const handleChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear AI suggestions when user manually changes category or priority
    if (field === 'category' || field === 'priority') {
      setAiSuggestions(null);
    }
  };

  const handleAIAnalysis = useCallback(async () => {
    if (!formData.title.trim() || !aiAvailable) return;

    const analysis = await analyzeTaskAI(formData.title, formData.description);
    if (analysis) {
      setAiSuggestions({
        category: analysis.category,
        priority: analysis.priority,
        suggestedTitle: analysis.reasoning, // Using reasoning as suggested improvement
        suggestedDescription: analysis.reasoning, // Using reasoning as suggested improvement
      });
    }
  }, [formData.title, formData.description, analyzeTaskAI, aiAvailable]);

  const applySuggestion = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setAiSuggestions(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              {aiAvailable && formData.title.trim() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  AI Analyze
                </Button>
              )}
            </div>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter task title"
              required
              data-testid="task-title-input"
            />
            {aiSuggestions?.suggestedTitle && aiSuggestions.suggestedTitle !== formData.title && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-700 font-medium">AI Suggestion:</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applySuggestion('title', aiSuggestions.suggestedTitle!)}
                    className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                  >
                    Apply
                  </Button>
                </div>
                <p className="text-sm text-blue-800 mt-1">{aiSuggestions.suggestedTitle}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter task description"
              rows={3}
              data-testid="task-description-input"
            />
            {aiSuggestions?.suggestedDescription && aiSuggestions.suggestedDescription !== formData.description && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-700 font-medium">AI Suggestion:</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applySuggestion('description', aiSuggestions.suggestedDescription!)}
                    className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                  >
                    Apply
                  </Button>
                </div>
                <p className="text-sm text-blue-800 mt-1">{aiSuggestions.suggestedDescription}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                {aiSuggestions?.priority && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applySuggestion('priority', aiSuggestions.priority!)}
                    className="h-6 px-2 text-xs text-green-600 hover:text-green-700"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Use AI: {aiSuggestions.priority}
                  </Button>
                )}
              </div>
              <Select value={formData.priority} onValueChange={(value: string) => handleChange('priority', value as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select value={formData.status} onValueChange={(value: string) => handleChange('status', value as TaskStatus)}>
                <SelectTrigger data-testid="task-status-select">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress" data-testid="status-in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              {aiSuggestions?.category && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applySuggestion('category', aiSuggestions.category!)}
                  className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Use AI: {aiSuggestions.category}
                </Button>
              )}
            </div>
            <Input
              type="text"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="Enter category (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="submit-task-button">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
          
          {aiError && (
            <div className="mt-2 p-2 bg-red-50 rounded-md border border-red-200">
              <p className="text-sm text-red-600">{aiError}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}