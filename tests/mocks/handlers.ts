import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock AI API endpoints
  http.post('/api/ai/analyze', () => {
    return HttpResponse.json({
      category: 'development',
      priority: 'medium',
      estimatedTime: '2 hours',
      suggestions: ['Break down into smaller tasks', 'Add unit tests'],
      confidence: 0.85,
    });
  }),

  // Mock Supabase tasks endpoints
  http.get('/api/tasks', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Test Task',
        description: 'A test task',
        status: 'pending',
        priority: 'medium',
        created_at: new Date().toISOString(),
      },
    ]);
  }),

  http.post('/api/tasks', () => {
    return HttpResponse.json({
      id: '2',
      title: 'New Task',
      description: 'A new task',
      status: 'pending',
      priority: 'medium',
      created_at: new Date().toISOString(),
    });
  }),

  // Mock health check
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        ai: 'healthy',
        cache: 'healthy',
      },
    });
  }),

  // Mock moderation endpoint
  http.post('/api/ai/moderate', () => {
    return HttpResponse.json({
      flagged: false,
      categories: {},
      category_scores: {},
    });
  }),

  // Mock analytics endpoint
  http.post('/api/analytics', () => {
    return HttpResponse.json({
      success: true,
      event_id: 'test-event-id',
    });
  }),
];