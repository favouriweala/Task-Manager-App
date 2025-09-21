import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TaskPriority } from "@/types/task"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function isOverdue(dueDate: Date): boolean {
  return dueDate < new Date()
}

export function getPriorityColor(priority: TaskPriority): "default" | "secondary" | "destructive" | "outline" {
  switch (priority) {
    case 'urgent':
      return 'destructive'
    case 'high':
      return 'destructive'
    case 'medium':
      return 'secondary'
    case 'low':
      return 'outline'
    default:
      return 'default'
  }
}
