import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

interface PerformanceMetrics {
  cls: number;
  fid: number;
  fcp: number;
  lcp: number;
  ttfb: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface AIPerformanceMetrics {
  responseTime: number;
  tokenCount: number;
  cacheHit: boolean;
  model: string;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private aiMetrics: AIPerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeWebVitals();
    this.initializeResourceObserver();
    this.initializeLongTaskObserver();
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private initializeWebVitals(): void {
    const handleMetric = (metric: Metric) => {
      this.recordWebVital(metric);
      this.sendToAnalytics(metric);
    };

    getCLS(handleMetric);
    getFID(handleMetric);
    getFCP(handleMetric);
    getLCP(handleMetric);
    getTTFB(handleMetric);
  }

  /**
   * Initialize resource loading observer
   */
  private initializeResourceObserver(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.analyzeResourcePerformance(entry as PerformanceResourceTiming);
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    }
  }

  /**
   * Initialize long task observer
   */
  private initializeLongTaskObserver(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            this.handleLongTask(entry as PerformanceEntry);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch (e) {
        // Long task observer not supported
        console.warn('Long task observer not supported');
      }
    }
  }

  /**
   * Record web vital metric
   */
  private recordWebVital(metric: Metric): void {
    const existingMetric = this.metrics.find(m => m.url === window.location.href);
    
    if (existingMetric) {
      (existingMetric as any)[metric.name.toLowerCase()] = metric.value;
    } else {
      const newMetric: Partial<PerformanceMetrics> = {
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
      
      (newMetric as any)[metric.name.toLowerCase()] = metric.value;
      this.metrics.push(newMetric as PerformanceMetrics);
    }
  }

  /**
   * Analyze resource performance
   */
  private analyzeResourcePerformance(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.requestStart;
    
    // Flag slow resources
    if (duration > 1000) {
      console.warn(`Slow resource detected: ${entry.name} took ${duration}ms`);
      
      this.sendToAnalytics({
        type: 'slow_resource',
        name: entry.name,
        duration,
        size: entry.transferSize,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle long tasks
   */
  private handleLongTask(entry: PerformanceEntry): void {
    console.warn(`Long task detected: ${entry.duration}ms`);
    
    this.sendToAnalytics({
      type: 'long_task',
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: Date.now(),
    });
  }

  /**
   * Record AI performance metrics
   */
  recordAIPerformance(metrics: Omit<AIPerformanceMetrics, 'timestamp'>): void {
    const aiMetric: AIPerformanceMetrics = {
      ...metrics,
      timestamp: Date.now(),
    };
    
    this.aiMetrics.push(aiMetric);
    
    // Alert on slow AI responses
    if (metrics.responseTime > 5000) {
      console.warn(`Slow AI response: ${metrics.responseTime}ms for model ${metrics.model}`);
    }
    
    this.sendToAnalytics({
      type: 'ai_performance',
      ...aiMetric,
    });
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    webVitals: PerformanceMetrics[];
    aiMetrics: AIPerformanceMetrics[];
    averageAIResponseTime: number;
    cacheHitRate: number;
  } {
    const totalAIRequests = this.aiMetrics.length;
    const cacheHits = this.aiMetrics.filter(m => m.cacheHit).length;
    const totalResponseTime = this.aiMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    
    return {
      webVitals: this.metrics,
      aiMetrics: this.aiMetrics,
      averageAIResponseTime: totalAIRequests > 0 ? totalResponseTime / totalAIRequests : 0,
      cacheHitRate: totalAIRequests > 0 ? cacheHits / totalAIRequests : 0,
    };
  }

  /**
   * Send metrics to analytics service
   */
  private async sendToAnalytics(data: any): Promise<void> {
    try {
      // In production, this would send to your analytics service
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  /**
   * Start performance monitoring session
   */
  startSession(): void {
    // Mark the start of a performance monitoring session
    performance.mark('session-start');
    
    // Set up periodic reporting
    setInterval(() => {
      this.generatePerformanceReport();
    }, 30000); // Report every 30 seconds
  }

  /**
   * Generate performance report
   */
  private generatePerformanceReport(): void {
    const summary = this.getPerformanceSummary();
    
    // Log performance insights
    if (summary.averageAIResponseTime > 3000) {
      console.warn('AI response times are above optimal threshold');
    }
    
    if (summary.cacheHitRate < 0.5) {
      console.warn('AI cache hit rate is below 50%');
    }
    
    // Send comprehensive report
    this.sendToAnalytics({
      type: 'performance_report',
      summary,
      timestamp: Date.now(),
    });
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function to measure function execution time
export function measurePerformance<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  name: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    
    try {
      const result = await fn(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`${name} took ${duration.toFixed(2)}ms`);
      
      performanceMonitor.recordAIPerformance({
        responseTime: duration,
        tokenCount: 0, // Would be calculated based on actual response
        cacheHit: false, // Would be determined by cache layer
        model: name,
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`${name} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };
}