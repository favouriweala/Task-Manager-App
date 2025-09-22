import { createClient } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealTimeProcessingRequest {
  type: 'pattern_analysis' | 'priority_prediction' | 'completion_forecast' | 'notification_context' | 'recommendation_generation';
  userId: string;
  data: any;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface RealTimeProcessingResult {
  requestId: string;
  type: string;
  userId: string;
  result: any;
  processingTime: number;
  timestamp: Date;
  status: 'completed' | 'failed';
  error?: string;
}

export interface ProcessingQueueItem {
  id: string;
  request: RealTimeProcessingRequest;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  result?: any;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

class RealTimeProcessorService {
  private processingQueue: Map<string, ProcessingQueueItem> = new Map();
  private realtimeChannel: RealtimeChannel | null = null;
  private isProcessing = false;
  private readonly MAX_CONCURRENT_REQUESTS = 5;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  private readonly BATCH_SIZE = 10;
  private processingCallbacks: Map<string, (result: RealTimeProcessingResult) => void> = new Map();
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  constructor() {
    this.initializeRealtimeConnection();
    this.startProcessingLoop();
  }

  private initializeRealtimeConnection(): void {
    try {
      // Subscribe to real-time notifications
      this.realtimeChannel = this.supabase
        .channel('ai-processing-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'real_time_notifications'
          },
          (payload) => {
            this.handleRealtimeNotification(payload.new);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'ai_processing_logs'
          },
          (payload) => {
            this.handleProcessingUpdate(payload.new);
          }
        )
        .subscribe();

      console.log('Real-time AI processing connection established');
    } catch (error) {
      console.error('Failed to initialize real-time connection:', error);
    }
  }

  async queueProcessingRequest(request: RealTimeProcessingRequest): Promise<string> {
    const requestId = crypto.randomUUID();
    
    const queueItem: ProcessingQueueItem = {
      id: requestId,
      request,
      status: 'pending',
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: this.MAX_RETRIES
    };

    this.processingQueue.set(requestId, queueItem);

    // Log the queued request
    await this.logQueuedRequest(queueItem);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return requestId;
  }

    async processRequest(request: RealTimeProcessingRequest): Promise<RealTimeProcessingResult> {
    return new Promise(async (resolve, reject) => {
      const requestId = await this.queueProcessingRequest(request);
      
      // Set up callback for when processing completes
      this.processingCallbacks.set(requestId, (result: RealTimeProcessingResult) => {
        if (result.status === 'completed') {
          resolve(result);
        } else {
          reject(new Error(result.error || 'Processing failed'));
        }
      });

      // Set timeout for the request
      setTimeout(() => {
        if (this.processingCallbacks.has(requestId)) {
          this.processingCallbacks.delete(requestId);
          reject(new Error('Processing timeout'));
        }
      }, 30000); // 30 second timeout
    });
  }
  async batchProcessRequests(requests: RealTimeProcessingRequest[]): Promise<RealTimeProcessingResult[]> {
    const promises = requests.map(request => this.processRequest(request));
    
    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('Batch processing failed:', error);
      throw error;
    }
  }

  getQueueStatus(): {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  } {
    const items = Array.from(this.processingQueue.values());
    
    return {
      pending: items.filter(item => item.status === 'pending').length,
      processing: items.filter(item => item.status === 'processing').length,
      completed: items.filter(item => item.status === 'completed').length,
      failed: items.filter(item => item.status === 'failed').length,
      total: items.length
    };
  }

  clearCompletedRequests(): void {
    const completedIds: string[] = [];
    
    this.processingQueue.forEach((item, id) => {
      if (item.status === 'completed' || item.status === 'failed') {
        const ageInMinutes = (Date.now() - item.createdAt.getTime()) / (1000 * 60);
        if (ageInMinutes > 10) { // Clear items older than 10 minutes
          completedIds.push(id);
        }
      }
    });

    completedIds.forEach(id => {
      this.processingQueue.delete(id);
      this.processingCallbacks.delete(id);
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    try {
      while (this.hasUnprocessedItems()) {
        const pendingItems = this.getPendingItems();
        const batch = pendingItems.slice(0, Math.min(this.MAX_CONCURRENT_REQUESTS, this.BATCH_SIZE));

        if (batch.length === 0) {
          await this.sleep(1000); // Wait 1 second before checking again
          continue;
        }

        // Process batch concurrently
        const processingPromises = batch.map(item => this.processQueueItem(item));
        await Promise.allSettled(processingPromises);

        // Clean up old completed requests
        this.clearCompletedRequests();
      }
    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processQueueItem(item: ProcessingQueueItem): Promise<void> {
    try {
      // Update status to processing
      item.status = 'processing';
      this.processingQueue.set(item.id, item);

      // Call the Supabase Edge Function
      const response = await this.supabase.functions.invoke('ai-processing', {
        body: {
          type: item.request.type,
          userId: item.request.userId,
          data: item.request.data,
          priority: item.request.priority,
          metadata: {
            ...item.request.metadata,
            requestId: item.id,
            queuedAt: item.createdAt.toISOString()
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Edge function error');
      }

      const result: RealTimeProcessingResult = {
        requestId: item.id,
        type: item.request.type,
        userId: item.request.userId,
        result: response.data.result,
        processingTime: response.data.processingTime,
        timestamp: new Date(),
        status: 'completed'
      };

      // Update queue item
      item.status = 'completed';
      item.processedAt = new Date();
      item.result = result.result;
      this.processingQueue.set(item.id, item);

      // Trigger callback if exists
      const callback = this.processingCallbacks.get(item.id);
      if (callback) {
        callback(result);
        this.processingCallbacks.delete(item.id);
      }

      // Log successful processing
      await this.logProcessingResult(item, result);

    } catch (error) {
      console.error(`Processing failed for request ${item.id}:`, error);

      item.retryCount++;
      
      if (item.retryCount < item.maxRetries) {
        // Retry after delay
        item.status = 'pending';
        setTimeout(() => {
          // Re-queue for retry
          this.processingQueue.set(item.id, item);
        }, this.RETRY_DELAY * item.retryCount);
      } else {
        // Max retries reached, mark as failed
        item.status = 'failed';
        item.error = error instanceof Error ? error.message : 'Unknown error';
        item.processedAt = new Date();

        const failedResult: RealTimeProcessingResult = {
          requestId: item.id,
          type: item.request.type,
          userId: item.request.userId,
          result: null,
          processingTime: 0,
          timestamp: new Date(),
          status: 'failed',
          error: item.error
        };

        // Trigger callback if exists
        const callback = this.processingCallbacks.get(item.id);
        if (callback) {
          callback(failedResult);
          this.processingCallbacks.delete(item.id);
        }

        // Log failed processing
        await this.logProcessingResult(item, failedResult);
      }

      this.processingQueue.set(item.id, item);
    }
  }

  private startProcessingLoop(): void {
    // Start the processing loop
    setInterval(() => {
      if (!this.isProcessing && this.hasUnprocessedItems()) {
        this.processQueue();
      }
    }, 5000); // Check every 5 seconds
  }

  private hasUnprocessedItems(): boolean {
    return Array.from(this.processingQueue.values()).some(
      item => item.status === 'pending'
    );
  }

  private getPendingItems(): ProcessingQueueItem[] {
    return Array.from(this.processingQueue.values())
      .filter(item => item.status === 'pending')
      .sort((a, b) => {
        // Sort by priority first, then by creation time
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.request.priority];
        const bPriority = priorityOrder[b.request.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }
        
        return a.createdAt.getTime() - b.createdAt.getTime(); // Earlier first
      });
  }

  private handleRealtimeNotification(notification: any): void {
    console.log('Received real-time AI notification:', notification);
    
    // Handle different types of real-time notifications
    if (notification.type?.startsWith('ai_')) {
      // This is an AI processing completion notification
      const requestId = notification.payload?.requestId;
      if (requestId && this.processingCallbacks.has(requestId)) {
        const callback = this.processingCallbacks.get(requestId);
        if (callback) {
          const result: RealTimeProcessingResult = {
            requestId,
            type: notification.payload.processingType,
            userId: notification.user_id,
            result: notification.payload.result,
            processingTime: 0,
            timestamp: new Date(notification.payload.timestamp),
            status: 'completed'
          };
          callback(result);
          this.processingCallbacks.delete(requestId);
        }
      }
    }
  }

  private handleProcessingUpdate(update: any): void {
    const requestId = update.request_id;
    const queueItem = this.processingQueue.get(requestId);
    
    if (queueItem) {
      if (update.status === 'completed') {
        queueItem.status = 'completed';
        queueItem.processedAt = new Date(update.completed_at);
        queueItem.result = update.result;
      } else if (update.status === 'failed') {
        queueItem.status = 'failed';
        queueItem.error = update.error;
        queueItem.processedAt = new Date();
      }
      
      this.processingQueue.set(requestId, queueItem);
    }
  }

  private async logQueuedRequest(item: ProcessingQueueItem): Promise<void> {
    try {
      await this.supabase
        .from('ai_processing_queue')
        .insert({
          request_id: item.id,
          user_id: item.request.userId,
          processing_type: item.request.type,
          priority: item.request.priority,
          status: item.status,
          data: item.request.data,
          metadata: item.request.metadata,
          created_at: item.createdAt.toISOString()
        });
    } catch (error) {
      console.error('Failed to log queued request:', error);
    }
  }

  private async logProcessingResult(item: ProcessingQueueItem, result: RealTimeProcessingResult): Promise<void> {
    try {
      await this.supabase
        .from('ai_processing_queue')
        .update({
          status: item.status,
          processed_at: item.processedAt?.toISOString(),
          result: item.result,
          error: item.error,
          retry_count: item.retryCount,
          processing_time_ms: result.processingTime
        })
        .eq('request_id', item.id);
    } catch (error) {
      console.error('Failed to log processing result:', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup method
  destroy(): void {
    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
      this.realtimeChannel = null;
    }
    
    this.processingQueue.clear();
    this.processingCallbacks.clear();
    this.isProcessing = false;
  }
}

// Singleton instance
export const realTimeProcessor = new RealTimeProcessorService();

// Helper functions for common processing requests
export const AIProcessingHelpers = {
  async analyzeUserBehavior(userId: string, events: any[], timeframe: string = '30_days') {
    return realTimeProcessor.processRequest({
      type: 'pattern_analysis',
      userId,
      data: { events, timeframe },
      priority: 'medium',
      metadata: { source: 'behavior_analysis' }
    });
  },

  async predictTaskPriority(userId: string, task: any, context: any) {
    return realTimeProcessor.processRequest({
      type: 'priority_prediction',
      userId,
      data: { task, userContext: context, historicalData: {} },
      priority: 'high',
      metadata: { source: 'task_creation' }
    });
  },

  async forecastProjectCompletion(userId: string, project: any, tasks: any[], teamData: any) {
    return realTimeProcessor.processRequest({
      type: 'completion_forecast',
      userId,
      data: { project, tasks, teamData, historicalPerformance: {} },
      priority: 'medium',
      metadata: { source: 'project_planning' }
    });
  },

  async analyzeNotificationContext(userId: string, notification: any, userContext: any) {
    return realTimeProcessor.processRequest({
      type: 'notification_context',
      userId,
      data: { 
        notification, 
        userContext, 
        userPreferences: {}, 
        currentActivity: {} 
      },
      priority: 'high',
      metadata: { source: 'notification_system' }
    });
  },

  async generatePersonalizedRecommendations(userId: string, userProfile: any, behaviorPatterns: any[]) {
    return realTimeProcessor.processRequest({
      type: 'recommendation_generation',
      userId,
      data: {
        userProfile,
        behaviorPatterns,
        performanceMetrics: {},
        currentGoals: {},
        context: 'productivity_optimization'
      },
      priority: 'low',
      metadata: { source: 'recommendation_engine' }
    });
  }
};