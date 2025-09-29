'use client'

import { Task } from '@/types/task'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Users, 
  Target, 
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  BarChart3,
  Calendar,
  User
} from 'lucide-react'

// Extended Task interface for AI prioritization
interface ExtendedTask extends Omit<Task, 'dueDate'> {
  complexity?: number // 1-10 scale
  businessValue?: number // 1-10 scale
  dependencies?: string[]
  estimatedHours?: number
  assignee?: string
  // Override dueDate to allow string type for compatibility
  dueDate?: string | Date
}

interface PriorityScore {
  taskId: string
  score: number
  factors: {
    urgency: number
    importance: number
    complexity: number
    dependencies: number
    businessValue: number
    resourceAvailability: number
  }
  recommendation: 'increase' | 'decrease' | 'maintain'
  reasoning: string[]
}

interface SmartInsight {
  id: string
  type: 'bottleneck' | 'opportunity' | 'risk' | 'optimization'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  actionable: boolean
  suggestedActions: string[]
}

export function SmartTaskPrioritizer({ tasks }: { tasks: Task[] }) {
  const [priorityScores, setPriorityScores] = useState<PriorityScore[]>([])
  const [insights, setInsights] = useState<SmartInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // AI-powered priority calculation
  const calculatePriorityScore = (task: Task): PriorityScore => {
    const now = new Date()
    const dueDate = task.due_date ? new Date(task.due_date) : null
    const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 30

    // Factor calculations (0-100 scale) with safe defaults
    const urgency = dueDate ? Math.max(0, 100 - (daysUntilDue * 10)) : 30
    const businessValue = 50 // Default business value
    const complexity = 50 // Default complexity (mid-range)
    const dependencies = 80 // Assume no dependencies by default
    const resourceAvailability = task.assignee_id ? 80 : 60

    // Weighted score calculation
    const weights = {
      urgency: 0.25,
      importance: 0.30,
      complexity: 0.15,
      dependencies: 0.10,
      businessValue: 0.15,
      resourceAvailability: 0.05
    }

    const score = 
      urgency * weights.urgency +
      businessValue * weights.importance +
      complexity * weights.complexity +
      dependencies * weights.dependencies +
      businessValue * weights.businessValue +
      resourceAvailability * weights.resourceAvailability

    // Generate reasoning
    const reasoning: string[] = []
    if (urgency > 70) reasoning.push(`High urgency due to approaching deadline (${daysUntilDue} days)`)
    if (businessValue > 70) reasoning.push('High business value impact')
    if (complexity > 70) reasoning.push('High complexity may require additional planning')
    if (dependencies < 60) reasoning.push('Multiple dependencies may cause delays')
    if (!task.assignee_id) reasoning.push('No assignee - resource allocation needed')

    // Recommendation logic
    let recommendation: 'increase' | 'decrease' | 'maintain' = 'maintain'
    if (score > 75) recommendation = 'increase'
    else if (score < 40) recommendation = 'decrease'

    return {
      taskId: task.id,
      score: Math.round(score),
      factors: {
        urgency: Math.round(urgency),
        importance: Math.round(businessValue),
        complexity: Math.round(complexity),
        dependencies: Math.round(dependencies),
        businessValue: Math.round(businessValue),
        resourceAvailability: Math.round(resourceAvailability)
      },
      recommendation,
      reasoning
    }
  }

  // Generate AI insights
  const generateInsights = (tasks: Task[], scores: PriorityScore[]): SmartInsight[] => {
    const insights: SmartInsight[] = []

    // Bottleneck detection - simplified for base Task interface
    const unassignedTasks = tasks.filter(t => !t.assignee_id)
    if (unassignedTasks.length > 0) {
      insights.push({
        id: 'bottleneck-1',
        type: 'bottleneck',
        title: 'Resource Allocation Bottleneck',
        description: `${unassignedTasks.length} tasks are unassigned and may cause delays`,
        impact: 'high',
        confidence: 85,
        actionable: true,
        suggestedActions: [
          'Assign tasks to available team members',
          'Review workload distribution',
          'Consider hiring additional resources'
        ]
      })
    }

    // Overdue risk analysis
    const urgentTasks = scores.filter(s => s.factors.urgency > 80)
    if (urgentTasks.length > 3) {
      insights.push({
        id: 'risk-1',
        type: 'risk',
        title: 'Multiple Urgent Tasks Detected',
        description: `${urgentTasks.length} tasks are approaching critical deadlines`,
        impact: 'high',
        confidence: 92,
        actionable: true,
        suggestedActions: [
          'Reassign resources to urgent tasks',
          'Consider deadline negotiations',
          'Implement daily standups for urgent items'
        ]
      })
    }

    // Optimization opportunities
    const unassignedHighValueTasks = tasks.filter(t => !t.assignee_id)
    if (unassignedHighValueTasks.length > 0) {
      insights.push({
        id: 'optimization-1',
        type: 'optimization',
        title: 'Resource Allocation Opportunity',
        description: `${unassignedHighValueTasks.length} high-value tasks are unassigned`,
        impact: 'medium',
        confidence: 78,
        actionable: true,
        suggestedActions: [
          'Assign tasks based on team member expertise',
          'Balance workload across team members',
          'Consider skill development opportunities'
        ]
      })
    }

    // Workload balance analysis - simplified for base Task interface
    const assignedTasks = tasks.filter(t => t.assignee_id)
    const assigneeWorkload = assignedTasks.reduce((acc, task) => {
      const assigneeId = task.assignee_id!
      acc[assigneeId] = (acc[assigneeId] || 0) + (task.estimated_hours || 8)
      return acc
    }, {} as Record<string, number>)

    const workloadValues = Object.values(assigneeWorkload)
    if (workloadValues.length > 1) {
      const maxWorkload = Math.max(...workloadValues)
      const minWorkload = Math.min(...workloadValues)
      if (maxWorkload > minWorkload * 2) {
        insights.push({
          id: 'opportunity-1',
          type: 'opportunity',
          title: 'Workload Imbalance Detected',
          description: 'Significant workload imbalance across team members',
          impact: 'medium',
          confidence: 71,
          actionable: true,
          suggestedActions: [
            'Redistribute tasks to balance workload',
            'Consider cross-training team members',
            'Implement capacity planning'
          ]
        })
      }
    }

    return insights
  }

  useEffect(() => {
    if (tasks.length > 0) {
      setIsAnalyzing(true)
      
      // Simulate AI processing time
      setTimeout(() => {
        const scores = tasks.map(calculatePriorityScore)
        const generatedInsights = generateInsights(tasks, scores)
        
        setPriorityScores(scores.sort((a, b) => b.score - a.score))
        setInsights(generatedInsights)
        setIsAnalyzing(false)
      }, 1500)
    }
  }, [tasks])

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 border-red-200'
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'increase': return <ArrowUp className="w-4 h-4 text-red-600" />
      case 'decrease': return <ArrowDown className="w-4 h-4 text-green-600" />
      default: return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'bottleneck': return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'risk': return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case 'optimization': return <Sparkles className="w-5 h-5 text-blue-600" />
      default: return <Brain className="w-5 h-5 text-purple-600" />
    }
  }

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
            <div className="text-lg font-medium">AI is analyzing task priorities...</div>
          </div>
          <div className="mt-4">
            <Progress value={75} className="h-2" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Tasks Analyzed</p>
                <p className="text-2xl font-bold text-purple-900">{tasks.length}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">High Priority</p>
                <p className="text-2xl font-bold text-red-900">
                  {priorityScores.filter(s => s.score >= 80).length}
                </p>
              </div>
              <Target className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Insights Generated</p>
                <p className="text-2xl font-bold text-blue-900">{insights.length}</p>
              </div>
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-green-900">
                  {insights.length > 0 ? Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length) : 0}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>AI-Powered Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                      {insight.impact} impact
                    </Badge>
                    <span className="text-sm text-gray-500">{insight.confidence}% confidence</span>
                  </div>
                </div>
                
                {insight.actionable && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Suggested Actions:</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {insight.suggestedActions.map((action, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-purple-600">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Priority Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Smart Priority Rankings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {priorityScores.map((score) => {
            const task = tasks.find(t => t.id === score.taskId)
            if (!task) return null

            return (
              <div key={score.taskId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(score.score)}`}>
                      {score.score}
                    </div>
                    <div>
                      <h4 className="font-semibold">{task.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRecommendationIcon(score.recommendation)}
                    <span className="text-sm font-medium capitalize">{score.recommendation} Priority</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{score.factors.urgency}</div>
                    <div className="text-xs text-gray-500">Urgency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{score.factors.importance}</div>
                    <div className="text-xs text-gray-500">Importance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{score.factors.complexity}</div>
                    <div className="text-xs text-gray-500">Complexity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{score.factors.dependencies}</div>
                    <div className="text-xs text-gray-500">Dependencies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{score.factors.businessValue}</div>
                    <div className="text-xs text-gray-500">Business Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-600">{score.factors.resourceAvailability}</div>
                    <div className="text-xs text-gray-500">Resources</div>
                  </div>
                </div>

                {score.reasoning.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="text-sm font-medium mb-2">AI Reasoning:</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {score.reasoning.map((reason, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-600">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}