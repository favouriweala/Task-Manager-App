import React, { useRef, useEffect } from 'react';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, isOverdue, getPriorityColor, cn } from '@/lib/utils';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Edit, 
  Trash2, 
  Clock, 
  AlertCircle, 
  User 
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { attachGestures } = useSwipeGestures({
    onSwipeRight: () => onToggleComplete(task.id),
    onSwipeLeft: () => onDelete(task.id),
    onTap: () => onEdit(task),
    onLongPress: () => {
      // Show context menu or additional options
      if (navigator.vibrate) {
        navigator.vibrate(50); // Haptic feedback
      }
    },
    threshold: 80,
    longPressDelay: 600,
  });

  useEffect(() => {
    attachGestures(cardRef.current);
  }, [attachGestures]);
  const isTaskOverdue = task.due_date && task.status !== 'done' && isOverdue(new Date(task.due_date));
  const isCompleted = task.status === 'done' || task.completed;

  return (
    <div
      ref={cardRef}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 touch-manipulation select-none',
        'active:scale-[0.98] active:shadow-sm',
        isCompleted && 'opacity-75 bg-gray-50',
        isTaskOverdue && 'border-red-200 bg-red-50'
      )}
    >
      {/* Mobile swipe indicators */}
      <div className="flex items-center justify-between mb-2 sm:hidden">
        <div className="flex items-center text-xs text-gray-400">
          <span>← Delete</span>
        </div>
        <div className="flex items-center text-xs text-gray-400">
          <span>Complete →</span>
        </div>
      </div>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
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
              
              <Badge variant="outline" className="text-xs">
                {task.status}
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