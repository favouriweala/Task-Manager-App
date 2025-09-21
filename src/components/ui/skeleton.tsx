'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
      {...props}
    />
  );
}

// Specific skeleton components for common use cases
export function TaskSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* AI Insights skeleton */}
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-12 mt-2" />
          </div>
        ))}
      </div>

      {/* Task list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <TaskSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}