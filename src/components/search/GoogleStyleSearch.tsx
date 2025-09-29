'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  Target,
  Sparkles,
  TrendingUp,
  History,
  ArrowRight,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react'

interface SearchFilters {
  status: string[]
  priority: string[]
  assignee: string[]
  tags: string[]
  dateRange: {
    start?: string
    end?: string
  }
}

interface SearchSuggestion {
  id: string
  type: 'task' | 'filter' | 'ai_suggestion' | 'recent'
  title: string
  description?: string
  icon?: React.ReactNode
  action?: () => void
  confidence?: number
}

interface GoogleStyleSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void
  onFilterChange: (filters: SearchFilters) => void
  tasks: any[]
  placeholder?: string
  showAISuggestions?: boolean
}

export function GoogleStyleSearch({ 
  onSearch, 
  onFilterChange, 
  tasks, 
  placeholder = "Search tasks with AI-powered suggestions...",
  showAISuggestions = true 
}: GoogleStyleSearchProps) {
  const [query, setQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    status: [],
    priority: [],
    assignee: [],
    tags: [],
    dateRange: {}
  })
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Generate AI-powered suggestions
  const generateAISuggestions = useMemo(() => {
    if (!showAISuggestions || !tasks.length) return []

    const suggestions: SearchSuggestion[] = []
    
    // Analyze task patterns
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done')
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done')
    const unassignedTasks = tasks.filter(t => !t.assignee && t.status !== 'done')
    
    // Smart suggestions based on task analysis
    if (overdueTasks.length > 0) {
      suggestions.push({
        id: 'overdue-tasks',
        type: 'ai_suggestion',
        title: `${overdueTasks.length} overdue tasks`,
        description: 'Tasks that need immediate attention',
        icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
        confidence: 95,
        action: () => {
          setFilters(prev => ({ ...prev, status: ['overdue'] }))
          setQuery('overdue')
        }
      })
    }

    if (urgentTasks.length > 0) {
      suggestions.push({
        id: 'urgent-tasks',
        type: 'ai_suggestion',
        title: `${urgentTasks.length} urgent tasks`,
        description: 'High priority items requiring focus',
        icon: <Target className="w-4 h-4 text-orange-500" />,
        confidence: 88,
        action: () => {
          setFilters(prev => ({ ...prev, priority: ['urgent'] }))
          setQuery('priority:urgent')
        }
      })
    }

    if (unassignedTasks.length > 0) {
      suggestions.push({
        id: 'unassigned-tasks',
        type: 'ai_suggestion',
        title: `${unassignedTasks.length} unassigned tasks`,
        description: 'Tasks that need team member assignment',
        icon: <User className="w-4 h-4 text-blue-500" />,
        confidence: 76,
        action: () => {
          setFilters(prev => ({ ...prev, assignee: ['unassigned'] }))
          setQuery('unassigned')
        }
      })
    }

    // Trending searches based on task content
    const commonTags = tasks.reduce((acc, task) => {
      if (task.tags) {
        task.tags.forEach((tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1
        })
      }
      return acc
    }, {} as Record<string, number>)

    const topTags = Object.entries(commonTags)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([tag, count]) => ({
        id: `tag-${tag}`,
        type: 'ai_suggestion' as const,
        title: `#${tag}`,
        description: `${count} tasks with this tag`,
        icon: <Tag className="w-4 h-4 text-purple-500" />,
        confidence: Math.min(90, (count as number) * 10),
        action: () => {
          setFilters(prev => ({ ...prev, tags: [tag] }))
          setQuery(`#${tag}`)
        }
      }))

    suggestions.push(...topTags)

    return suggestions.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
  }, [tasks, showAISuggestions])

  // Generate search suggestions based on query
  const getSearchSuggestions = useMemo(() => {
    if (!query.trim()) {
      const suggestions: SearchSuggestion[] = []
      
      // Recent searches
      recentSearches.slice(0, 3).forEach(search => {
        suggestions.push({
          id: `recent-${search}`,
          type: 'recent',
          title: search,
          icon: <History className="w-4 h-4 text-gray-400" />,
          action: () => setQuery(search)
        })
      })

      // AI suggestions
      suggestions.push(...generateAISuggestions.slice(0, 5))

      return suggestions
    }

    const suggestions: SearchSuggestion[] = []
    const lowerQuery = query.toLowerCase()

    // Task matches
    tasks
      .filter(task => 
        task.title?.toLowerCase().includes(lowerQuery) ||
        task.description?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .forEach(task => {
        suggestions.push({
          id: `task-${task.id}`,
          type: 'task',
          title: task.title,
          description: task.description,
          icon: task.status === 'done' ? 
            <CheckCircle className="w-4 h-4 text-green-500" /> :
            <Clock className="w-4 h-4 text-blue-500" />,
          action: () => {
            // Navigate to task or select it
            console.log('Navigate to task:', task.id)
          }
        })
      })

    // Filter suggestions
    const filterSuggestions = [
      { key: 'status:todo', label: 'To Do tasks', icon: <Clock className="w-4 h-4 text-blue-500" /> },
      { key: 'status:in_progress', label: 'In Progress tasks', icon: <TrendingUp className="w-4 h-4 text-orange-500" /> },
      { key: 'status:done', label: 'Completed tasks', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
      { key: 'priority:high', label: 'High priority', icon: <Star className="w-4 h-4 text-red-500" /> },
      { key: 'priority:urgent', label: 'Urgent tasks', icon: <AlertTriangle className="w-4 h-4 text-red-600" /> },
      { key: 'due:today', label: 'Due today', icon: <Calendar className="w-4 h-4 text-purple-500" /> },
      { key: 'due:overdue', label: 'Overdue tasks', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> }
    ]

    filterSuggestions
      .filter(filter => filter.key.includes(lowerQuery) || filter.label.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .forEach(filter => {
        suggestions.push({
          id: `filter-${filter.key}`,
          type: 'filter',
          title: filter.key,
          description: filter.label,
          icon: filter.icon,
          action: () => setQuery(filter.key)
        })
      })

    return suggestions
  }, [query, tasks, recentSearches, generateAISuggestions])

  // Handle search
  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 10)
        localStorage.setItem('recentSearches', JSON.stringify(updated))
        return updated
      })
    }
    
    onSearch(searchQuery, filters)
    setShowSuggestions(false)
  }

  // Handle filter changes
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setIsExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasActiveFilters = Object.values(filters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : Object.keys(filter).length > 0
  )

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl">
      {/* Main Search Input */}
      <div className={`relative transition-all duration-200 ${isExpanded ? 'shadow-2xl' : 'shadow-sm hover:shadow-md'}`}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsExpanded(true)
              setShowSuggestions(true)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              } else if (e.key === 'Escape') {
                setShowSuggestions(false)
                setIsExpanded(false)
                inputRef.current?.blur()
              }
            }}
            placeholder={placeholder}
            className={`pl-12 pr-20 h-14 text-base bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl transition-all duration-200 ${
              isExpanded ? 'rounded-b-none border-b-0' : ''
            }`}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {Object.values(filters).flat().length} filters
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery('')
                  handleSearch('')
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (isExpanded || query) && (
          <Card className="absolute top-full left-0 right-0 z-50 border-t-0 rounded-t-none rounded-b-2xl shadow-2xl bg-white dark:bg-gray-800">
            <CardContent className="p-0">
              {getSearchSuggestions.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {/* AI Suggestions Section */}
                  {!query && generateAISuggestions.length > 0 && (
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-2 mb-3">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Suggestions</span>
                      </div>
                      <div className="space-y-2">
                        {generateAISuggestions.slice(0, 3).map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={suggestion.action}
                            className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            {suggestion.icon}
                            <div className="flex-1">
                              <div className="font-medium text-sm">{suggestion.title}</div>
                              {suggestion.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">{suggestion.description}</div>
                              )}
                            </div>
                            {suggestion.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {suggestion.confidence}%
                              </Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Results */}
                  <div className="p-2">
                    {getSearchSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={suggestion.action}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        {suggestion.icon}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{suggestion.title}</div>
                          {suggestion.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{suggestion.description}</div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No suggestions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <Card className="mt-2 shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Status</label>
                <div className="space-y-2">
                  {['todo', 'in_progress', 'done'].map((status) => (
                    <label key={status} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? [...filters.status, status]
                            : filters.status.filter(s => s !== status)
                          updateFilters({ status: newStatus })
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Priority</label>
                <div className="space-y-2">
                  {['low', 'medium', 'high', 'urgent'].map((priority) => (
                    <label key={priority} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={(e) => {
                          const newPriority = e.target.checked
                            ? [...filters.priority, priority]
                            : filters.priority.filter(p => p !== priority)
                          updateFilters({ priority: newPriority })
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Due Date</label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={filters.dateRange.start || ''}
                    onChange={(e) => updateFilters({ 
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                    className="text-sm"
                    placeholder="Start date"
                  />
                  <Input
                    type="date"
                    value={filters.dateRange.end || ''}
                    onChange={(e) => updateFilters({ 
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                    className="text-sm"
                    placeholder="End date"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Quick Filters</label>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery('due:today')
                      handleSearch('due:today')
                    }}
                    className="w-full justify-start text-sm"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Due Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery('overdue')
                      handleSearch('overdue')
                    }}
                    className="w-full justify-start text-sm"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Overdue
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery('priority:urgent')
                      handleSearch('priority:urgent')
                    }}
                    className="w-full justify-start text-sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Urgent
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters({
                    status: [],
                    priority: [],
                    assignee: [],
                    tags: [],
                    dateRange: {}
                  })
                  setQuery('')
                  handleSearch('')
                }}
              >
                Clear All
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSearch()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}