'use client';

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  arrayMove,
} from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types/task';
import { KanbanColumn } from '@/components/KanbanColumn';
import { DraggableTaskCard } from '@/components/DraggableTaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
}

const TASK_STATUSES: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'todo', label: 'To Do', color: 'bg-zyra-background dark:bg-zyra-card-dark' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-zyra-primary/10 dark:bg-zyra-primary/20' },
  { status: 'review', label: 'Review', color: 'bg-zyra-warning/10 dark:bg-zyra-warning/20' },
  { status: 'done', label: 'Done', color: 'bg-zyra-success/10 dark:bg-zyra-success/20' },
];

export function KanbanBoard({
  tasks,
  onTaskStatusChange,
  onTaskEdit,
  onTaskDelete,
  onToggleComplete,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    
    // Check if the task is being dropped on a different status column
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      onTaskStatusChange(taskId, newStatus);
    }

    setActiveTask(null);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto pb-4 sm:pb-6 min-h-[60vh] mobile-padding sm:px-0 touch-manipulation">
        {TASK_STATUSES.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          
          return (
            <KanbanColumn
              key={column.status}
              status={column.status}
              label={column.label}
              color={column.color}
              tasks={columnTasks}
              onTaskEdit={onTaskEdit}
              onTaskDelete={onTaskDelete}
              onToggleComplete={onToggleComplete}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 opacity-95 scale-105 shadow-2xl">
            <DraggableTaskCard
              task={activeTask}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
              onToggleComplete={onToggleComplete}
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}