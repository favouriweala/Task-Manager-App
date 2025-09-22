import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Task validation schemas
export const TaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Title contains invalid characters'),
  
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']),
  
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed'),
  
  dueDate: z.string().datetime().optional(),
  
  estimatedHours: z.number().min(0).max(1000).optional(),
});

export const AIPromptSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt is required')
    .max(5000, 'Prompt must be less than 5000 characters'),
  
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3']).optional(),
  
  temperature: z.number().min(0).max(2).optional(),
  
  maxTokens: z.number().min(1).max(4000).optional(),
});

export const UserInputSchema = z.object({
  email: z.string().email('Invalid email format'),
  
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name contains invalid characters'),
  
  feedback: z.string()
    .max(1000, 'Feedback must be less than 1000 characters')
    .optional(),
});

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize text input by removing potentially dangerous characters
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Validate and sanitize task input
 */
export function validateTask(input: unknown): {
  success: boolean;
  data?: z.infer<typeof TaskSchema>;
  errors?: string[];
} {
  try {
    // First sanitize string fields
    if (typeof input === 'object' && input !== null) {
      const sanitizedInput = {
        ...input,
        title: typeof (input as any).title === 'string' 
          ? sanitizeText((input as any).title) 
          : (input as any).title,
        description: typeof (input as any).description === 'string' 
          ? sanitizeHtml((input as any).description) 
          : (input as any).description,
      };
      
      const result = TaskSchema.parse(sanitizedInput);
      return { success: true, data: result };
    }
    
    return { success: false, errors: ['Invalid input format'] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    
    return { success: false, errors: ['Validation failed'] };
  }
}

/**
 * Validate AI prompt input
 */
export function validateAIPrompt(input: unknown): {
  success: boolean;
  data?: z.infer<typeof AIPromptSchema>;
  errors?: string[];
} {
  try {
    if (typeof input === 'object' && input !== null) {
      const sanitizedInput = {
        ...input,
        prompt: typeof (input as any).prompt === 'string' 
          ? sanitizeText((input as any).prompt) 
          : (input as any).prompt,
      };
      
      const result = AIPromptSchema.parse(sanitizedInput);
      return { success: true, data: result };
    }
    
    return { success: false, errors: ['Invalid input format'] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    
    return { success: false, errors: ['Validation failed'] };
  }
}

/**
 * Rate limiting store
 */
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();
  
  isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.store.get(key);
    
    if (!record || now > record.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= limit) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

export const rateLimitStore = new RateLimitStore();

// Cleanup rate limit store every 5 minutes
setInterval(() => rateLimitStore.cleanup(), 5 * 60 * 1000);

/**
 * Check if content is safe using basic content filtering
 */
export function isContentSafe(content: string): {
  safe: boolean;
  reasons?: string[];
} {
  const reasons: string[] = [];
  
  // Check for common malicious patterns
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(content)) {
      reasons.push('Contains potentially malicious code');
      break;
    }
  }
  
  // Check for excessive length
  if (content.length > 10000) {
    reasons.push('Content exceeds maximum length');
  }
  
  // Check for suspicious URLs
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = content.match(urlPattern) || [];
  
  for (const url of urls) {
    if (url.includes('bit.ly') || url.includes('tinyurl') || url.includes('t.co')) {
      reasons.push('Contains shortened URLs');
      break;
    }
  }
  
  return {
    safe: reasons.length === 0,
    reasons: reasons.length > 0 ? reasons : undefined,
  };
}

/**
 * Middleware for validating API requests
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.body);
      req.validatedBody = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        });
      }
      
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}