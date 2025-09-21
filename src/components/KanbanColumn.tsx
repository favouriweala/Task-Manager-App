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
    <div className="flex flex-col min-w-[260px] sm:min-w-[280px] lg:min-w-[300px] max-w-[260px] sm:max-w-[280px] lg:max-w-[300px]">
      <div className={cn(
        "rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 shadow-mobile",
        color
      )}>
        <h3 className="font-semibold text-zyra-text-primary flex items-center justify-between text-sm sm:text-base">
          {label}
          <span className="bg-zyra-card text-zyra-text-secondary text-xs px-2 py-1 rounded-full shadow-sm">
            {tasks.length}
          </span>
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[200px] sm:min-h-[250px] p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-dashed transition-all duration-300 touch-manipulation",
          isOver 
            ? "border-zyra-primary bg-zyra-primary/10 shadow-mobile-lg" 
            : "border-zyra-border bg-zyra-background hover:bg-zyra-background"
        )}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 sm:space-y-4">
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
          <div className="flex items-center justify-center h-32 sm:h-40 text-zyra-text-secondary text-xs sm:text-sm">
            <div className="text-center">
              <div className="mb-2 opacity-50">📋</div>
              <div>Drop tasks here</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}