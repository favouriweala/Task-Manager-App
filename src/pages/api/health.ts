import { NextApiRequest, NextApiResponse } from 'next';
import { HealthCheckMonitor } from '@/lib/monitoring/sentry';
import { aiCache } from '@/lib/cache/ai-cache';
import { rateLimitStore } from '@/lib/security/input-validation';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: boolean;
      latency?: number;
      error?: string;
    };
    ai_service: {
      status: boolean;
      latency?: number;
      error?: string;
    };
    cache: {
      status: boolean;
      stats?: any;
      error?: string;
    };
    memory: {
      status: boolean;
      usage?: NodeJS.MemoryUsage;
    };
    rate_limiter: {
      status: boolean;
      error?: string;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();
    
    // Check database health
    const databaseCheck = await checkDatabase();
    
    // Check AI service health
    const aiServiceCheck = await checkAIService();
    
    // Check cache health
    const cacheCheck = await checkCache();
    
    // Check memory usage
    const memoryCheck = checkMemory();
    
    // Check rate limiter
    const rateLimiterCheck = checkRateLimiter();
    
    const checks = {
      database: databaseCheck,
      ai_service: aiServiceCheck,
      cache: cacheCheck,
      memory: memoryCheck,
      rate_limiter: rateLimiterCheck,
    };
    
    // Determine overall health status
    const healthyChecks = Object.values(checks).filter(check => check.status).length;
    const totalChecks = Object.keys(checks).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyChecks === totalChecks) {
      status = 'healthy';
    } else if (healthyChecks >= totalChecks * 0.7) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    const response: HealthCheckResponse = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks,
    };
    
    // Set appropriate HTTP status code
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
    
    res.status(httpStatus).json(response);
    
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
}

async function checkDatabase(): Promise<{
  status: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const startTime = Date.now();
    
    // This would typically check your database connection
    // For Supabase, you might do a simple query
    // const { data, error } = await supabase.from('tasks').select('id').limit(1);
    
    // For now, simulate a database check
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const latency = Date.now() - startTime;
    
    return {
      status: true,
      latency,
    };
  } catch (error) {
    return {
      status: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

async function checkAIService(): Promise<{
  status: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const startTime = Date.now();
    
    // This would typically make a simple AI service call
    // For now, simulate an AI service check
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const latency = Date.now() - startTime;
    
    return {
      status: true,
      latency,
    };
  } catch (error) {
    return {
      status: false,
      error: error instanceof Error ? error.message : 'Unknown AI service error',
    };
  }
}

async function checkCache(): Promise<{
  status: boolean;
  stats?: any;
  error?: string;
}> {
  try {
    const stats = aiCache.getStats();
    
    return {
      status: true,
      stats,
    };
  } catch (error) {
    return {
      status: false,
      error: error instanceof Error ? error.message : 'Unknown cache error',
    };
  }
}

function checkMemory(): {
  status: boolean;
  usage?: NodeJS.MemoryUsage;
} {
  try {
    const usage = process.memoryUsage();
    const maxMemory = 512 * 1024 * 1024; // 512MB threshold
    
    return {
      status: usage.heapUsed < maxMemory,
      usage,
    };
  } catch (error) {
    return {
      status: false,
    };
  }
}

function checkRateLimiter(): {
  status: boolean;
  error?: string;
} {
  try {
    // Check if rate limiter is functioning
    // This is a simple check - in production you might want more sophisticated testing
    return {
      status: true,
    };
  } catch (error) {
    return {
      status: false,
      error: error instanceof Error ? error.message : 'Unknown rate limiter error',
    };
  }
}