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
        "zyra-card p-4 sm:p-5 shadow-zyra-card hover:shadow-zyra-card-hover transition-all duration-300 cursor-grab active:cursor-grabbing touch-manipulation",
        isTaskOverdue && "border-zyra-danger/30 bg-red-50 dark:bg-red-950/20",
        isCompleted && "opacity-75",
        dragging && "shadow-2xl z-50 scale-105 rotate-2"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
          {/* Enhanced drag handle with better touch target */}
          <div
            {...attributes}
            {...listeners}
            className="mt-1 text-zyra-text-secondary dark:text-zyra-text-secondary-dark hover:text-zyra-primary transition-colors cursor-grab active:cursor-grabbing p-2 -m-1 touch-manipulation rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          {/* Enhanced completion toggle with better touch target */}
          <button
            onClick={() => onToggleComplete(task.id)}
            className="mt-1 text-zyra-text-secondary dark:text-zyra-text-secondary-dark hover:text-zyra-primary transition-colors p-2 -m-1 touch-manipulation rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-zyra-success" />
            ) : (
              <Circle className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-zyra-text-primary dark:text-zyra-text-primary-dark text-sm sm:text-base leading-tight",
              isCompleted && "line-through text-zyra-text-secondary dark:text-zyra-text-secondary-dark"
            )}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-xs sm:text-sm text-zyra-text-secondary dark:text-zyra-text-secondary-dark mt-1 sm:mt-2 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
              <Badge variant={getPriorityColor(task.priority)} className="text-xs font-medium">
                {task.priority}
              </Badge>
              
              {task.category && (
                <Badge variant="secondary" className="text-xs">
                  {task.category}
                </Badge>
              )}
              
              {task.assignee_id && (
                <div className="flex items-center text-xs text-zyra-text-secondary bg-zyra-background px-2 py-1 rounded-full">
                  <User className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Assigned</span>
                  <span className="sm:hidden">👤</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs text-zyra-text-secondary dark:text-zyra-text-secondary-dark flex-wrap">
              {task.due_date && (
                <div className={cn(
                  "flex items-center bg-zyra-background px-2 py-1 rounded-full",
                  isTaskOverdue && "bg-red-100 dark:bg-red-900/30 text-zyra-danger"
                )}>
                  {isTaskOverdue ? (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <Calendar className="h-3 w-3 mr-1" />
                  )}
                  <span className="truncate font-medium">{formatDate(new Date(task.due_date))}</span>
                </div>
              )}
              
              <div className="flex items-center bg-zyra-background px-2 py-1 rounded-full">
                <Clock className="h-3 w-3 mr-1" />
                <span className="truncate">{formatDate(new Date(task.created_at))}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 ml-1 sm:ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation hover:bg-blue-100 dark:hover:bg-blue-900/50 text-zyra-primary"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-zyra-danger hover:text-zyra-danger hover:bg-red-100 dark:hover:bg-red-900/50 touch-manipulation"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}