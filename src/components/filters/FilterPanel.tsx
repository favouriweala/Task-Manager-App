'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Calendar, Tag, User, Folder, Clock, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
    { value: 'todo', label: 'To Do', color: 'bg-zyra-text-secondary' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-zyra-primary' },
    { value: 'review', label: 'Review', color: 'bg-zyra-warning' },
    { value: 'done', label: 'Done', color: 'bg-zyra-success' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-zyra-success' },
    { value: 'medium', label: 'Medium', color: 'bg-zyra-warning' },
    { value: 'high', label: 'High', color: 'bg-zyra-warning' },
    { value: 'urgent', label: 'Urgent', color: 'bg-zyra-danger' }
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
    <Card className={`${className} shadow-mobile border-zyra-border bg-zyra-card`}>
      <CardHeader className="pb-3 mobile-padding sm:p-6">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-responsive-base font-semibold text-zyra-text-primary">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="btn-mobile text-zyra-text-secondary hover:text-zyra-text-primary hover:bg-zyra-background touch-manipulation"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-responsive-xs">Clear All</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 mobile-padding sm:p-6 pt-0">
        {/* Enhanced Sorting with mobile-first design */}
        {showSorting && onSortChange && (
          <div className="space-y-3 pb-4 border-b border-zyra-border">
            <h4 className="text-sm font-medium text-zyra-text-primary">Sort By</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={currentSort?.field || 'created_at'}
                onValueChange={(value: string) => onSortChange({
                  field: value as any,
                  direction: currentSort?.direction || 'desc'
                })}
              >
                <SelectTrigger className="flex-1 btn-mobile bg-zyra-card border-zyra-border text-zyra-text-primary touch-manipulation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zyra-card border-zyra-border">
                  {sortOptions.map(option => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-zyra-text-primary hover:bg-zyra-background"
                    >
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
                className="btn-mobile border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 touch-manipulation"
              >
                {currentSort?.direction === 'asc' ? (
                  <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-300" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Filter Sections with mobile-first design */}
        {sections.map(section => (
          <Collapsible
            key={section.id}
            open={section.isOpen}
            onOpenChange={() => toggleSection(section.id)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50 touch-manipulation mobile-padding sm:p-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400">{section.icon}</span>
                  <span className="text-responsive-sm font-medium">{section.title}</span>
                </div>
                {section.isOpen ? (
                  <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-3 pt-3 mobile-padding sm:px-2">
              {/* Enhanced Status Filter */}
              {section.id === 'status' && (
                <div className="space-y-3">
                  {statusOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 touch-manipulation">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={filters.status?.includes(option.value as TaskStatus) || false}
                        onCheckedChange={(checked) => 
                          handleArrayFilterChange('status', option.value, checked as boolean)
                        }
                        className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                      />
                      <label
                        htmlFor={`status-${option.value}`}
                        className="flex items-center gap-2 text-responsive-xs cursor-pointer flex-1 text-gray-700 dark:text-gray-300"
                      >
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Enhanced Priority Filter */}
              {section.id === 'priority' && (
                <div className="space-y-3">
                  {priorityOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 touch-manipulation">
                      <Checkbox
                        id={`priority-${option.value}`}
                        checked={filters.priority?.includes(option.value as TaskPriority) || false}
                        onCheckedChange={(checked) => 
                          handleArrayFilterChange('priority', option.value, checked as boolean)
                        }
                        className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                      />
                      <label
                        htmlFor={`priority-${option.value}`}
                        className="flex items-center gap-2 text-responsive-xs cursor-pointer flex-1 text-gray-700 dark:text-gray-300"
                      >
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Enhanced Date Range Filter */}
              {section.id === 'dates' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-responsive-xs font-medium mb-2 block text-gray-900 dark:text-gray-100">Date Range</label>
                    <DatePickerWithRange
                      date={dateRange}
                      onDateChange={handleDateRangeChange}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 touch-manipulation">
                    <Checkbox
                      id="overdue"
                      checked={filters.overdue || false}
                      onCheckedChange={(checked) => 
                        handleFilterChange('overdue', checked || undefined)
                      }
                      className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                    />
                    <label htmlFor="overdue" className="text-responsive-xs cursor-pointer flex-1 text-gray-700 dark:text-gray-300">
                      Show overdue tasks only
                    </label>
                  </div>
                </div>
              )}

              {/* Enhanced Time Tracking Filters */}
              {section.id === 'time' && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <label className="text-responsive-xs font-medium block text-gray-900 dark:text-gray-100">
                      Estimated Hours: {estimatedHoursRange[0]}h - {estimatedHoursRange[1]}h
                    </label>
                    <Slider
                      value={estimatedHoursRange}
                      onValueChange={handleEstimatedHoursChange}
                      max={40}
                      min={0}
                      step={0.5}
                      className="w-full touch-manipulation"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-responsive-xs font-medium block text-gray-900 dark:text-gray-100">
                      Actual Hours: {actualHoursRange[0]}h - {actualHoursRange[1]}h
                    </label>
                    <Slider
                      value={actualHoursRange}
                      onValueChange={handleActualHoursChange}
                      max={40}
                      min={0}
                      step={0.5}
                      className="w-full touch-manipulation"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 touch-manipulation">
                      <Checkbox
                        id="has-time-entries"
                        checked={filters.has_time_entries || false}
                        onCheckedChange={(checked) => 
                          handleFilterChange('has_time_entries', checked || undefined)
                        }
                        className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                      />
                      <label htmlFor="has-time-entries" className="text-responsive-xs cursor-pointer flex-1 text-gray-700 dark:text-gray-300">
                        Has time entries
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 touch-manipulation">
                      <Checkbox
                        id="active-timer"
                        checked={filters.active_timer || false}
                        onCheckedChange={(checked) => 
                          handleFilterChange('active_timer', checked || undefined)
                        }
                        className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                      />
                      <label htmlFor="active-timer" className="text-responsive-xs cursor-pointer flex-1 text-gray-700 dark:text-gray-300">
                        Has active timer
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Tags Filter */}
              {section.id === 'tags' && (
                <div className="space-y-3">
                  <label className="text-responsive-xs font-medium text-gray-900 dark:text-gray-100">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="w-full mobile-padding sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-responsive-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent touch-manipulation"
                    placeholder="Enter tags..."
                    value={filters.tags?.join(', ') || ''}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                      handleFilterChange('tags', tags.length > 0 ? tags : undefined);
                    }}
                  />
                </div>
              )}

              {/* Enhanced Assignee Filter */}
              {section.id === 'assignee' && (
                <div className="space-y-3">
                  <label className="text-responsive-xs font-medium text-gray-900 dark:text-gray-100">Assignee</label>
                  <Select
                    value={filters.assignee_id || ''}
                    onValueChange={(value: string) => 
                      handleFilterChange('assignee_id', value || undefined)
                    }
                  >
                    <SelectTrigger className="btn-mobile bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 touch-manipulation">
                      <SelectValue placeholder="Select assignee..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">All assignees</SelectItem>
                      <SelectItem value="unassigned" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Unassigned</SelectItem>
                      {/* Add dynamic assignee options here */}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Enhanced Project Filter */}
              {section.id === 'project' && (
                <div className="space-y-3">
                  <label className="text-responsive-xs font-medium text-gray-900 dark:text-gray-100">Project</label>
                  <Select
                    value={filters.project_id || ''}
                    onValueChange={(value: string) => 
                      handleFilterChange('project_id', value || undefined)
                    }
                  >
                    <SelectTrigger className="btn-mobile bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 touch-manipulation">
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">All projects</SelectItem>
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