-- Enable necessary extensions for notifications and AI
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'task_assigned', 'task_completed', 'task_due_soon', 'task_overdue',
    'comment_added', 'project_invitation', 'project_update',
    'ai_suggestion', 'ai_merge_recommendation', 'system_alert'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Additional context data
  read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  related_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  related_project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT -- URL for notification action
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  preferences JSONB DEFAULT '{
    "task_assigned": {"email": true, "push": true},
    "task_completed": {"email": false, "push": true},
    "task_due_soon": {"email": true, "push": true},
    "task_overdue": {"email": true, "push": true},
    "comment_added": {"email": false, "push": true},
    "project_invitation": {"email": true, "push": true},
    "project_update": {"email": false, "push": true},
    "ai_suggestion": {"email": false, "push": true},
    "ai_merge_recommendation": {"email": true, "push": true},
    "system_alert": {"email": true, "push": true}
  }',
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email queue table for reliable email delivery
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_id TEXT,
  template_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI agents table
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'project_merger', 'task_optimizer', 'workflow_automator', 
    'smart_scheduler', 'similarity_analyzer', 'duplicate_detector'
  )),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  configuration JSONB DEFAULT '{}',
  capabilities JSONB DEFAULT '[]',
  learning_data JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI agent actions table for tracking AI recommendations
CREATE TABLE IF NOT EXISTS ai_agent_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('task', 'project', 'user', 'workflow')),
  target_id UUID,
  suggestion JSONB NOT NULL,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  user_feedback TEXT,
  applied_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project similarity analysis table
CREATE TABLE IF NOT EXISTS project_similarities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_a_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  project_b_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  similarity_score FLOAT CHECK (similarity_score >= 0 AND similarity_score <= 1),
  similarity_factors JSONB DEFAULT '{}', -- What makes them similar
  merge_recommendation JSONB DEFAULT '{}',
  embedding_similarity FLOAT,
  content_similarity FLOAT,
  structure_similarity FLOAT,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_a_id, project_b_id),
  CHECK (project_a_id != project_b_id)
);

-- Create project embeddings table for AI similarity matching
CREATE TABLE IF NOT EXISTS project_embeddings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL UNIQUE,
  content TEXT NOT NULL, -- Combined project name, description, and task summaries
  embedding vector(768), -- Google AI embeddings
  metadata JSONB DEFAULT '{}',
  task_count INTEGER DEFAULT 0,
  completion_rate FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow patterns table for AI learning
CREATE TABLE IF NOT EXISTS workflow_patterns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  frequency INTEGER DEFAULT 1,
  success_rate FLOAT DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_for ON email_queue(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_ai_agent_actions_agent_id ON ai_agent_actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_actions_user_id ON ai_agent_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_actions_status ON ai_agent_actions(status);
CREATE INDEX IF NOT EXISTS idx_ai_agent_actions_target ON ai_agent_actions(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_project_similarities_project_a ON project_similarities(project_a_id);
CREATE INDEX IF NOT EXISTS idx_project_similarities_project_b ON project_similarities(project_b_id);
CREATE INDEX IF NOT EXISTS idx_project_similarities_score ON project_similarities(similarity_score);

CREATE INDEX IF NOT EXISTS idx_project_embeddings_embedding ON project_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_project_embeddings_project_id ON project_embeddings(project_id);

CREATE INDEX IF NOT EXISTS idx_workflow_patterns_user_id ON workflow_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_patterns_type ON workflow_patterns(pattern_type);

-- Create functions for AI similarity search
CREATE OR REPLACE FUNCTION search_similar_projects(
  query_embedding vector(768),
  exclude_project_id UUID DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  project_id UUID,
  project_name TEXT,
  content TEXT,
  similarity float,
  metadata JSONB
)
LANGUAGE sql STABLE
AS $$
  SELECT
    pe.project_id,
    p.name as project_name,
    pe.content,
    1 - (pe.embedding <=> query_embedding) AS similarity,
    pe.metadata
  FROM project_embeddings pe
  JOIN projects p ON pe.project_id = p.id
  WHERE 
    (exclude_project_id IS NULL OR pe.project_id != exclude_project_id)
    AND 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Create function to get notification statistics
CREATE OR REPLACE FUNCTION get_notification_stats(user_uuid UUID)
RETURNS TABLE (
  total_notifications INTEGER,
  unread_notifications INTEGER,
  high_priority_unread INTEGER,
  recent_notifications INTEGER
)
LANGUAGE sql STABLE
AS $$
  SELECT
    COUNT(*)::INTEGER as total_notifications,
    COUNT(CASE WHEN NOT read THEN 1 END)::INTEGER as unread_notifications,
    COUNT(CASE WHEN NOT read AND priority IN ('high', 'urgent') THEN 1 END)::INTEGER as high_priority_unread,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END)::INTEGER as recent_notifications
  FROM notifications
  WHERE user_id = user_uuid;
$$;

-- Create function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create triggers for updated_at columns
CREATE TRIGGER update_notification_preferences_updated_at 
  BEFORE UPDATE ON notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at 
  BEFORE UPDATE ON ai_agents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_embeddings_updated_at 
  BEFORE UPDATE ON project_embeddings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default AI agents
INSERT INTO ai_agents (name, type, description, configuration, capabilities) VALUES
(
  'Project Similarity Analyzer',
  'similarity_analyzer',
  'Analyzes projects for similarity and suggests potential merges',
  '{"similarity_threshold": 0.8, "analysis_frequency": "daily"}',
  '["semantic_analysis", "structure_comparison", "task_overlap_detection"]'
),
(
  'Smart Project Merger',
  'project_merger',
  'Provides intelligent recommendations for merging similar projects',
  '{"confidence_threshold": 0.75, "auto_suggest": true}',
  '["merge_planning", "conflict_resolution", "data_consolidation"]'
),
(
  'Task Optimizer',
  'task_optimizer',
  'Optimizes task assignments and scheduling for better productivity',
  '{"optimization_algorithm": "genetic", "consider_workload": true}',
  '["workload_balancing", "skill_matching", "deadline_optimization"]'
),
(
  'Workflow Automator',
  'workflow_automator',
  'Learns user patterns and automates repetitive workflows',
  '{"learning_window": "30d", "automation_threshold": 0.9}',
  '["pattern_recognition", "workflow_automation", "predictive_scheduling"]'
)
ON CONFLICT DO NOTHING;

-- Create RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_actions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own notification preferences
CREATE POLICY "Users can manage own notification preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Users can view AI agent actions related to them
CREATE POLICY "Users can view related AI agent actions" ON ai_agent_actions
  FOR SELECT USING (auth.uid() = user_id OR target_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  ));

-- AI agents and similarities are readable by all authenticated users
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_similarities ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view AI agents" ON ai_agents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view project similarities for their projects" ON project_similarities
  FOR SELECT USING (
    project_a_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()) OR
    project_b_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can view embeddings for their projects" ON project_embeddings
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );