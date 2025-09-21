'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Calendar, Tag, User, Folder, Clock, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { DatePickerWithRange } from '../ui/date-range-picker';
import { TaskFilters, TaskStatus, TaskPriority, TaskSortOptions } from '../../types/task';
import { DateRange } from 'react-day-picker';

interface FilterPanelProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  onSortChange?: (sort: TaskSortOptions) => void;
  currentSort?: TaskSortOptions;
  className?: string;
  showSorting?: boolean;
}

interface FilterSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onSortChange,
  currentSort,
  className,
  showSorting = true
}) => {
  const [sections, setSections] = useState<FilterSection[]>([
    { id: 'status', title: 'Status', icon: <Filter className="h-4 w-4" />, isOpen: true },
    { id: 'priority', title: 'Priority', icon: <Star className="h-4 w-4" />, isOpen: true },
    { id: 'dates', title: 'Dates', icon: <Calendar className="h-4 w-4" />, isOpen: false },
    { id: 'tags', title: 'Tags', icon: <Tag className="h-4 w-4" />, isOpen: false },
    { id: 'assignee', title: 'Assignee', icon: <User className="h-4 w-4" />, isOpen: false },
    { id: 'project', title: 'Project', icon: <Folder className="h-4 w-4" />, isOpen: false },
    { id: 'time', title: 'Time Tracking', icon: <Clock className="h-4 w-4" />, isOpen: false }
  ]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [estimatedHoursRange, setEstimatedHoursRange] = useState<[number, number]>([0, 40]);
  const [actualHoursRange, setActualHoursRange] = useState<[number, number]>([0, 40]);

  // Toggle section open/closed
  const toggleSection = useCallback((sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isOpen: !section.isOpen }
        : section
    ));
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof TaskFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  // Handle array filter changes (status, priority, tags)
  const handleArrayFilterChange = useCallback((
    key: keyof TaskFilters, 
    value: string, 
    checked: boolean
  ) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    handleFilterChange(key, newArray.length > 0 ? newArray : undefined);
  }, [filters, handleFilterChange]);

  // Handle date range change
  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      handleFilterChange('date_range', {
        start: range.from.toISOString(),
        end: range.to.toISOString()
      });
    } else {
      handleFilterChange('date_range', undefined);
    }
  }, [handleFilterChange]);

  // Handle estimated hours range change
  const handleEstimatedHoursChange = useCallback((value: [number, number]) => {
    setEstimatedHoursRange(value);
    handleFilterChange('estimated_hours_range', {
      min: value[0],
      max: value[1]
    });
  }, [handleFilterChange]);

  // Handle actual hours range change
  const handleActualHoursChange = useCallback((value: [number, number]) => {
    setActualHoursRange(value);
    handleFilterChange('actual_hours_range', {
      min: value[0],
      max: value[1]
    });
  }, [handleFilterChange]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setDateRange(undefined);
    setEstimatedHoursRange([0, 40]);
    setActualHoursRange([0, 40]);
    onFiltersChange({});
  }, [onFiltersChange]);

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof TaskFilters];
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  const statusOptions = [
    { value: 'todo', label: 'To Do', color: 'bg-gray-500' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'review', label: 'Review', color: 'bg-yellow-500' },
    { value: 'done', label: 'Done', color: 'bg-green-500' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Updated Date' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
    { value: 'title', label: 'Title' },
    { value: 'estimated_hours', label: 'Estimated Hours' },
    { value: 'actual_hours', label: 'Actual Hours' }
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Sorting */}
        {showSorting && onSortChange && (
          <div className="space-y-3 pb-4 border-b">
            <h4 className="text-sm font-medium">Sort By</h4>
            <div className="flex gap-2">
              <Select
                value={currentSort?.field || 'created_at'}
                onValueChange={(value) => onSortChange({
                  field: value as any,
                  direction: currentSort?.direction || 'desc'
                })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSortChange({
                  field: currentSort?.field || 'created_at',
                  direction: currentSort?.direction === 'asc' ? 'desc' : 'asc'
                })}
              >
                {currentSort?.direction === 'asc' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Filter Sections */}
        {sections.map(section => (
          <Collapsible
            key={section.id}
            open={section.isOpen}
            onOpenChange={() => toggleSection(section.id)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto font-medium"
              >
                <div className="flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </div>
                {section.isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-3 pt-3">
              {/* Status Filter */}
              {section.id === 'status' && (
                <div className="space-y-2">
                  {statusOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={filters.status?.includes(option.value as TaskStatus) || false}
                        onCheckedChange={(checked) => 
                          handleArrayFilterChange('status', option.value, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`status-${option.value}`}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Priority Filter */}
              {section.id === 'priority' && (
                <div className="space-y-2">
                  {priorityOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${option.value}`}
                        checked={filters.priority?.includes(option.value as TaskPriority) || false}
                        onCheckedChange={(checked) => 
                          handleArrayFilterChange('priority', option.value, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`priority-${option.value}`}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Date Range Filter */}
              {section.id === 'dates' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <DatePickerWithRange
                      date={dateRange}
                      onDateChange={handleDateRangeChange}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="overdue"
                      checked={filters.overdue || false}
                      onCheckedChange={(checked) => 
                        handleFilterChange('overdue', checked || undefined)
                      }
                    />
                    <label htmlFor="overdue" className="text-sm cursor-pointer">
                      Show overdue tasks only
                    </label>
                  </div>
                </div>
              )}

              {/* Time Tracking Filters */}
              {section.id === 'time' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Estimated Hours: {estimatedHoursRange[0]}h - {estimatedHoursRange[1]}h
                    </label>
                    <Slider
                      value={estimatedHoursRange}
                      onValueChange={handleEstimatedHoursChange}
                      max={40}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Actual Hours: {actualHoursRange[0]}h - {actualHoursRange[1]}h
                    </label>
                    <Slider
                      value={actualHoursRange}
                      onValueChange={handleActualHoursChange}
                      max={40}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has-time-entries"
                        checked={filters.has_time_entries || false}
                        onCheckedChange={(checked) => 
                          handleFilterChange('has_time_entries', checked || undefined)
                        }
                      />
                      <label htmlFor="has-time-entries" className="text-sm cursor-pointer">
                        Has time entries
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="active-timer"
                        checked={filters.active_timer || false}
                        onCheckedChange={(checked) => 
                          handleFilterChange('active_timer', checked || undefined)
                        }
                      />
                      <label htmlFor="active-timer" className="text-sm cursor-pointer">
                        Has active timer
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags Filter */}
              {section.id === 'tags' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Enter tags..."
                    value={filters.tags?.join(', ') || ''}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                      handleFilterChange('tags', tags.length > 0 ? tags : undefined);
                    }}
                  />
                </div>
              )}

              {/* Assignee Filter */}
              {section.id === 'assignee' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assignee</label>
                  <Select
                    value={filters.assignee_id || ''}
                    onValueChange={(value) => 
                      handleFilterChange('assignee_id', value || undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All assignees</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {/* Add dynamic assignee options here */}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Project Filter */}
              {section.id === 'project' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select
                    value={filters.project_id || ''}
                    onValueChange={(value) => 
                      handleFilterChange('project_id', value || undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All projects</SelectItem>
                      {/* Add dynamic project options here */}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};