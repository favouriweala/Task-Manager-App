'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Zap, 
  BarChart3,
  RefreshCw,
  Pause,
  Play,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { 
  realTimeProcessor, 
  type RealTimeProcessingRequest,
  type ProcessingQueueItem 
} from '@/lib/ai/realtime-processor';
import { useAuth } from '@/lib/hooks/useAuth';

interface RealTimeProcessingMonitorProps {
  className?: string;
}

export default function RealTimeProcessingMonitor({ className }: RealTimeProcessingMonitorProps) {
  const { user } = useAuth();
  const [queueStatus, setQueueStatus] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    total: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [processingHistory, setProcessingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQueueStatus = useCallback(() => {
    try {
      const status = realTimeProcessor.getQueueStatus();
      setQueueStatus(status);
      setError(null);
    } catch (err) {
      console.error('Error updating queue status:', err);
      setError('Failed to update queue status');
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMonitoring) {
      // Update queue status every 2 seconds
      interval = setInterval(() => {
        updateQueueStatus();
      }, 2000);

      // Initial update
      updateQueueStatus();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMonitoring, updateQueueStatus]);

  const handleTestProcessing = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Queue a test processing request
      const testRequest: RealTimeProcessingRequest = {
        type: 'pattern_analysis',
        userId: user.id,
        data: {
          events: [
            {
              eventType: 'task_created',
              timestamp: new Date(),
              metadata: { test: true }
            }
          ],
          timeframe: '1_day'
        },
        priority: 'low',
        metadata: { source: 'test_monitor' }
      };

      const requestId = await realTimeProcessor.queueProcessingRequest(testRequest);
      
      // Add to processing history
      setProcessingHistory(prev => [{
        id: requestId,
        type: testRequest.type,
        status: 'queued',
        timestamp: new Date(),
        priority: testRequest.priority
      }, ...prev.slice(0, 9)]); // Keep last 10 items

    } catch (err) {
      console.error('Error testing processing:', err);
      setError('Failed to queue test processing request');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCompleted = () => {
    try {
      realTimeProcessor.clearCompletedRequests();
      updateQueueStatus();
    } catch (err) {
      console.error('Error clearing completed requests:', err);
      setError('Failed to clear completed requests');
    }
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const totalProcessed = queueStatus.completed + queueStatus.failed;
  const successRate = totalProcessed > 0 ? (queueStatus.completed / totalProcessed) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-Time AI Processing Monitor
            </CardTitle>
            <CardDescription>
              Monitor AI processing queue and performance metrics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleMonitoring}
              variant="outline"
              size="sm"
            >
              {isMonitoring ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </>
              )}
            </Button>
            <Button
              onClick={handleTestProcessing}
              variant="outline"
              size="sm"
              disabled={loading || !user?.id}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Zap className="h-4 w-4 mr-1" />
              )}
              Test Processing
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Queue Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{queueStatus.pending}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor('pending')}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold">{queueStatus.processing}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor('processing')}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{queueStatus.completed}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor('completed')}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">{queueStatus.failed}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor('failed')}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{queueStatus.total}</p>
                </div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span className="font-medium">{successRate.toFixed(1)}%</span>
                </div>
                <Progress value={successRate} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {queueStatus.completed} successful out of {totalProcessed} processed
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Queue Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant={queueStatus.pending > 10 ? 'destructive' : 'default'}>
                    {queueStatus.pending > 10 ? 'Overloaded' : 
                     queueStatus.processing > 0 ? 'Active' : 'Idle'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Monitoring</span>
                  <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                    {isMonitoring ? 'Active' : 'Paused'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Update</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processing History */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Processing Activity</CardTitle>
              <Button
                onClick={handleClearCompleted}
                variant="outline"
                size="sm"
                disabled={queueStatus.completed === 0 && queueStatus.failed === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Completed
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {processingHistory.length > 0 ? (
              <div className="space-y-2">
                {processingHistory.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="text-sm font-medium">{item.type.replace('_', ' ')}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityBadgeVariant(item.priority)}>
                        {item.priority}
                      </Badge>
                      <Badge variant="outline">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent processing activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Queue Visualization */}
        {queueStatus.total > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Queue Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex text-xs text-muted-foreground">
                  <span className="w-20">Pending</span>
                  <span className="w-20">Processing</span>
                  <span className="w-20">Completed</span>
                  <span className="w-20">Failed</span>
                </div>
                <div className="flex h-4 rounded-lg overflow-hidden bg-muted">
                  {queueStatus.pending > 0 && (
                    <div 
                      className="bg-yellow-500" 
                      style={{ width: `${(queueStatus.pending / queueStatus.total) * 100}%` }}
                    />
                  )}
                  {queueStatus.processing > 0 && (
                    <div 
                      className="bg-blue-500" 
                      style={{ width: `${(queueStatus.processing / queueStatus.total) * 100}%` }}
                    />
                  )}
                  {queueStatus.completed > 0 && (
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${(queueStatus.completed / queueStatus.total) * 100}%` }}
                    />
                  )}
                  {queueStatus.failed > 0 && (
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${(queueStatus.failed / queueStatus.total) * 100}%` }}
                    />
                  )}
                </div>
                <div className="flex text-xs">
                  <span className="w-20">{queueStatus.pending}</span>
                  <span className="w-20">{queueStatus.processing}</span>
                  <span className="w-20">{queueStatus.completed}</span>
                  <span className="w-20">{queueStatus.failed}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}