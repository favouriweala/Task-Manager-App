// Load test environment variables
require('dotenv').config({ path: '.env.test' });

// Mock environment variables for testing
process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY = 'test-api-key';
process.env.GOOGLE_AI_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';