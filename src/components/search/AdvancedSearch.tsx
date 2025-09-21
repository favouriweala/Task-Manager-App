'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Save, History, X, Plus, Tag, Calendar, User, Folder } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { DatePickerWithRange } from '../ui/date-range-picker';
import { TaskFilters, TaskStatus, TaskPriority } from '../../types/task';
import { DateRange } from 'react-day-picker';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: TaskFilters;
  created_at: string;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: TaskFilters) => void;
  onFiltersChange: (filters: TaskFilters) => void;
  currentFilters: TaskFilters;
  className?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onFiltersChange,
  currentFilters,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load saved searches and history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('task-saved-searches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }

    const history = localStorage.getItem('task-search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Save searches to localStorage
  const saveSavedSearches = useCallback((searches: SavedSearch[]) => {
    localStorage.setItem('task-saved-searches', JSON.stringify(searches));
    setSavedSearches(searches);
  }, []);

  // Save search history
  const saveSearchHistory = useCallback((history: string[]) => {
    localStorage.setItem('task-search-history', JSON.stringify(history));
    setSearchHistory(history);
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string = searchQuery) => {
    if (query.trim()) {
      // Add to search history
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
      saveSearchHistory(newHistory);
    }

    onSearch(query, currentFilters);
  }, [searchQuery, currentFilters, onSearch, searchHistory, saveSearchHistory]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof TaskFilters, value: any) => {
    const newFilters = { ...currentFilters, [key]: value };
    onFiltersChange(newFilters);
  }, [currentFilters, onFiltersChange]);

  // Save current search
  const handleSaveSearch = useCallback(() => {
    if (!saveSearchName.trim()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: saveSearchName,
      query: searchQuery,
      filters: currentFilters,
      created_at: new Date().toISOString()
    };

    const newSavedSearches = [newSearch, ...savedSearches];
    saveSavedSearches(newSavedSearches);
    setSaveSearchName('');
    setShowSaveDialog(false);
  }, [saveSearchName, searchQuery, currentFilters, savedSearches, saveSavedSearches]);

  // Load saved search
  const handleLoadSearch = useCallback((search: SavedSearch) => {
    setSearchQuery(search.query);
    onFiltersChange(search.filters);
    onSearch(search.query, search.filters);
  }, [onSearch, onFiltersChange]);

  // Delete saved search
  const handleDeleteSearch = useCallback((searchId: string) => {
    const newSavedSearches = savedSearches.filter(s => s.id !== searchId);
    saveSavedSearches(newSavedSearches);
  }, [savedSearches, saveSavedSearches]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setDateRange(undefined);
    onFiltersChange({});
    onSearch('', {});
  }, [onSearch, onFiltersChange]);

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

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const hasActiveFilters = Object.keys(currentFilters).some(key => {
    const value = currentFilters[key as keyof TaskFilters];
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true);
  });

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks by title, description, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
              
              {/* Search History Dropdown */}
              {searchHistory.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <History className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700 px-2 py-1">Recent Searches</p>
                      {searchHistory.map((query, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            setSearchQuery(query);
                            handleSearch(query);
                          }}
                        >
                          {query}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            
            <Button onClick={() => handleSearch()}>
              Search
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {Object.keys(currentFilters).length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex flex-wrap gap-1">
                    {statusOptions.map(option => (
                      <Badge
                        key={option.value}
                        variant={currentFilters.status?.includes(option.value as TaskStatus) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = currentFilters.status || [];
                          const newStatus = current.includes(option.value as TaskStatus)
                            ? current.filter(s => s !== option.value)
                            : [...current, option.value as TaskStatus];
                          handleFilterChange('status', newStatus.length > 0 ? newStatus : undefined);
                        }}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <div className="flex flex-wrap gap-1">
                    {priorityOptions.map(option => (
                      <Badge
                        key={option.value}
                        variant={currentFilters.priority?.includes(option.value as TaskPriority) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = currentFilters.priority || [];
                          const newPriority = current.includes(option.value as TaskPriority)
                            ? current.filter(p => p !== option.value)
                            : [...current, option.value as TaskPriority];
                          handleFilterChange('priority', newPriority.length > 0 ? newPriority : undefined);
                        }}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <DatePickerWithRange
                    date={dateRange}
                    onDateChange={handleDateRangeChange}
                  />
                </div>
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  placeholder="Enter tags separated by commas"
                  value={currentFilters.tags?.join(', ') || ''}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                    handleFilterChange('tags', tags.length > 0 ? tags : undefined);
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Save className="h-3 w-3" />
                  Save Search
                </Button>
                
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="h-3 w-3" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-medium">Saved Searches</p>
              <div className="flex flex-wrap gap-2">
                {savedSearches.map(search => (
                  <div key={search.id} className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleLoadSearch(search)}
                    >
                      {search.name}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-gray-400 hover:text-red-600"
                      onClick={() => handleDeleteSearch(search.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Search Dialog */}
          {showSaveDialog && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Save Current Search</p>
              <Input
                placeholder="Enter search name"
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveSearch()}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveSearch}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveSearchName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};