import { rest } from 'msw';

export const handlers = [
  // Mock AI API endpoints
  rest.post('/api/ai/analyze', (req, res, ctx) => {
    return res(
      ctx.json({
        category: 'development',
        priority: 'medium',
        estimatedTime: '2 hours',
        suggestions: ['Break down into smaller tasks', 'Add unit tests'],
        confidence: 0.85,
      })
    );
  }),

  // Mock Supabase tasks endpoints
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          title: 'Test Task',
          description: 'A test task',
          status: 'pending',
          priority: 'medium',
          created_at: new Date().toISOString(),
        },
      ])
    );
  }),

  rest.post('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.json({
        id: '2',
        title: 'New Task',
        description: 'A new task',
        status: 'pending',
        priority: 'medium',
        created_at: new Date().toISOString(),
      })
    );
  }),

  // Mock health check
  rest.get('/api/health', (req, res, ctx) => {
    return res(
      ctx.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'healthy',
          ai: 'healthy',
          cache: 'healthy',
        },
      })
    );
  }),

  // Mock moderation endpoint
  rest.post('/api/ai/moderate', (req, res, ctx) => {
    return res(
      ctx.json({
        flagged: false,
        categories: {},
        category_scores: {},
      })
    );
  }),

  // Mock analytics endpoint
  rest.post('/api/analytics', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        event_id: 'test-event-id',
      })
    );
  }),
];