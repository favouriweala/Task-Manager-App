'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types/task';
import { DraggableTaskCard } from './DraggableTaskCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
}

export function KanbanColumn({
  status,
  label,
  color,
  tasks,
  onTaskEdit,
  onTaskDelete,
  onToggleComplete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col min-w-[280px] sm:min-w-[300px] max-w-[280px] sm:max-w-[300px]">
      <div className={cn(
        "rounded-lg p-2 sm:p-3 mb-3 sm:mb-4",
        color
      )}>
        <h3 className="font-semibold text-gray-800 flex items-center justify-between text-sm sm:text-base">
          {label}
          <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-colors touch-manipulation",
          isOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"
        )}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 sm:space-y-3">
            {tasks.map((task) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                onEdit={onTaskEdit}
                onDelete={onTaskDelete}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-xs sm:text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}