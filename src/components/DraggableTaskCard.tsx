'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, isOverdue, getPriorityColor, cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Edit, 
  Trash2, 
  Clock, 
  AlertCircle, 
  User,
  GripVertical 
} from 'lucide-react';

interface DraggableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  isDragging?: boolean;
}

export function DraggableTaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  isDragging = false 
}: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isTaskOverdue = task.due_date && task.status !== 'done' && isOverdue(new Date(task.due_date));
  const isCompleted = task.status === 'done' || task.completed;
  const dragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 sm:p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing touch-manipulation",
        isTaskOverdue && "border-red-300 bg-red-50",
        isCompleted && "opacity-75",
        dragging && "shadow-lg z-50"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="mt-1 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing p-1 -m-1 touch-manipulation"
          >
            <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <button
            onClick={() => onToggleComplete(task.id)}
            className="mt-1 text-gray-500 hover:text-blue-600 transition-colors p-1 -m-1 touch-manipulation"
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-medium text-gray-900 text-sm sm:text-base",
              isCompleted && "line-through text-gray-500"
            )}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-1 sm:gap-2 mt-2 flex-wrap">
              <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                {task.priority}
              </Badge>
              
              {task.category && (
                <Badge variant="secondary" className="text-xs">
                  {task.category}
                </Badge>
              )}
              
              {task.assignee_id && (
                <div className="flex items-center text-xs text-gray-500">
                  <User className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Assigned</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500 flex-wrap">
              {task.due_date && (
                <div className={cn(
                  "flex items-center",
                  isTaskOverdue && "text-red-600"
                )}>
                  {isTaskOverdue ? (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <Calendar className="h-3 w-3 mr-1" />
                  )}
                  <span className="truncate">{formatDate(new Date(task.due_date))}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span className="truncate">{formatDate(new Date(task.created_at))}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-1 sm:ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="h-8 w-8 p-0 touch-manipulation"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 touch-manipulation"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}