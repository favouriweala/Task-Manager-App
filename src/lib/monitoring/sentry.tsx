import React from 'react';
import * as Sentry from '@sentry/nextjs';

// Add type definitions
interface User {
  id: string;
  email: string;
}

// Initialize Sentry
export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    integrations: [
      // Remove BrowserTracing and Replay as they're not available in this version
      // These integrations are automatically included in @sentry/nextjs
    ],
    
    // Filter out noise
    beforeSend(event: Sentry.ErrorEvent, hint: Sentry.EventHint) {
      // Filter out known issues
      if (event.exception) {
        const error = hint.originalException as Error;
        
        // Filter out network errors
        if (error && error.message && error.message.includes('NetworkError')) {
          return null;
        }
        
        // Filter out extension errors
        if (error && error.stack && error.stack.includes('extension://')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Custom tags
    initialScope: {
      tags: {
        component: 'task-manager',
      },
    },
  });
}

// Custom error boundary for React components
export class ErrorBoundary extends Sentry.ErrorBoundary {
  constructor(props: any) {
    super({
      ...props,
      fallback: ({ error, resetError }: { error: Error; resetError: () => void }) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
              <p className="mt-2 text-sm text-gray-500">
                We've been notified about this error and will fix it soon.
              </p>
              <div className="mt-4">
                <button
                  onClick={resetError}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      beforeCapture: (scope: Sentry.Scope, error: Error, hint: Sentry.EventHint) => {
        // Add additional context
        scope.setTag('errorBoundary', true);
        scope.setLevel('error');
        
        // Add user context if available
        const user = getCurrentUser();
        if (user) {
          scope.setUser({
            id: user.id,
            email: user.email,
          });
        }
        
        // Add additional context
        scope.setContext('error_boundary', {
          component: 'ErrorBoundary', // componentStack is not available in EventHint
          timestamp: new Date().toISOString(),
        });
      },
    });
  }
}

// AI-specific error tracking
export class AIErrorTracker {
  static trackAIError(error: Error, context: {
    model?: string;
    prompt?: string;
    responseTime?: number;
    tokenCount?: number;
  }) {
    Sentry.withScope((scope: Sentry.Scope) => {
      scope.setTag('error_type', 'ai_error');
      scope.setTag('ai_model', context.model || 'unknown');
      
      scope.setContext('ai_request', {
        model: context.model,
        prompt_length: context.prompt?.length || 0,
        response_time: context.responseTime,
        token_count: context.tokenCount,
        timestamp: new Date().toISOString(),
      });
      
      scope.setLevel('error');
      Sentry.captureException(error);
    });
  }
  
  static trackAIPerformance(metrics: {
    model: string;
    responseTime: number;
    tokenCount: number;
    cacheHit: boolean;
    success: boolean;
  }) {
    Sentry.addBreadcrumb({
      category: 'ai_performance',
      message: `AI request completed`,
      level: 'info',
      data: {
        model: metrics.model,
        response_time: metrics.responseTime,
        token_count: metrics.tokenCount,
        cache_hit: metrics.cacheHit,
        success: metrics.success,
      },
    });
    
    // Track slow AI responses
    if (metrics.responseTime > 5000) {
      Sentry.withScope((scope: Sentry.Scope) => {
        scope.setTag('performance_issue', 'slow_ai_response');
        scope.setLevel('warning');
        
        Sentry.captureMessage(`Slow AI response: ${metrics.responseTime}ms`, 'warning');
      });
    }
  }
}

// Performance monitoring utilities
export class PerformanceTracker {
  static startTransaction(name: string, op: string) {
    // Simple implementation without deprecated startTransaction
    // Just return a basic object for compatibility
    return {
      name,
      op,
      finish: () => {},
      setTag: () => {},
      setData: () => {},
    };
  }
  
  static trackWebVital(metric: {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
  }) {
    Sentry.withScope((scope: Sentry.Scope) => {
      scope.setTag('metric_type', 'web_vital');
      scope.setTag('metric_name', metric.name);
      scope.setTag('metric_rating', metric.rating);
      
      scope.setContext('web_vital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: new Date().toISOString(),
      });
      
      // Only alert on poor metrics
      if (metric.rating === 'poor') {
        Sentry.captureMessage(`Poor web vital: ${metric.name} = ${metric.value}`, 'warning');
      }
    });
  }
  
  static trackUserAction(action: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      category: 'user_action',
      message: action,
      level: 'info',
      data,
    });
  }
}

// Database error tracking
export class DatabaseErrorTracker {
  static trackDatabaseError(error: Error, context: {
    query?: string;
    table?: string;
    operation?: string;
    duration?: number;
  }) {
    Sentry.withScope((scope: Sentry.Scope) => {
      scope.setTag('error_type', 'database_error');
      scope.setTag('db_table', context.table || 'unknown');
      scope.setTag('db_operation', context.operation || 'unknown');
      
      scope.setContext('database_query', {
        table: context.table,
        operation: context.operation,
        duration: context.duration,
        query_hash: context.query ? hashString(context.query) : undefined,
        timestamp: new Date().toISOString(),
      });
      
      scope.setLevel('error');
      Sentry.captureException(error);
    });
  }
}

// Utility functions
function getCurrentUser(): User | null {
  // This would typically get user from your auth system
  // For now, return null
  return null;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Health check monitoring
export class HealthCheckMonitor {
  static async checkSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: string;
  }> {
    const checks = {
      database: await this.checkDatabase(),
      ai_service: await this.checkAIService(),
      cache: await this.checkCache(),
      external_apis: await this.checkExternalAPIs(),
    };
    
    const healthyCount = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyCount === totalChecks) {
      status = 'healthy';
    } else if (healthyCount >= totalChecks * 0.5) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    // Report unhealthy status to Sentry
    if (status === 'unhealthy') {
      Sentry.withScope((scope: Sentry.Scope) => {
        scope.setTag('health_check', 'failed');
        scope.setContext('health_status', {
          status,
          checks,
          timestamp: new Date().toISOString(),
        });
        
        Sentry.captureMessage('System health check failed', 'error');
      });
    }
    
    return {
      status,
      checks,
      timestamp: new Date().toISOString(),
    };
  }
  
  private static async checkDatabase(): Promise<boolean> {
    try {
      // This would check your database connection
      // For now, return true
      return true;
    } catch (error) {
      return false;
    }
  }
  
  private static async checkAIService(): Promise<boolean> {
    try {
      // This would check your AI service
      // For now, return true
      return true;
    } catch (error) {
      return false;
    }
  }
  
  private static async checkCache(): Promise<boolean> {
    try {
      // This would check your cache service
      // For now, return true
      return true;
    } catch (error) {
      return false;
    }
  }
  
  private static async checkExternalAPIs(): Promise<boolean> {
    try {
      // This would check external API dependencies
      // For now, return true
      return true;
    } catch (error) {
      return false;
    }
  }
}