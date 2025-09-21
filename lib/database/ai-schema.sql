-- AI Agent Pipeline Database Schema
-- This schema supports real-time AI processing, workflow automation, 
-- predictive analytics, smart notifications, and learning systems

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- AI Agent Types and Configurations
CREATE TABLE ai_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'project_merger', 
    'task_optimizer', 
    'workflow_automator', 
    'smart_scheduler',
    'notification_filter',
    'behavior_analyzer',
    'prediction_engine'
  )),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}',
  capabilities JSONB DEFAULT '[]',
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Agent Actions and Recommendations
CREATE TABLE ai_agent_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'merge_suggestion',
    'task_assignment',
    'priority_adjustment',
    'deadline_prediction',
    'workflow_optimization',
    'notification_filter',
    'user_recommendation'
  )),
  target_type TEXT NOT NULL CHECK (target_type IN (
    'task', 'project', 'user', 'team', 'workflow', 'notification'
  )),
  target_id UUID,
  suggestion JSONB NOT NULL,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT,
  user_feedback TEXT,
  feedback_score INTEGER CHECK (feedback_score >= -2 AND feedback_score <= 2),
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Behavior Tracking for Learning System
CREATE TABLE user_behavior_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'task_created', 'task_updated', 'task_completed', 'task_deleted',
    'project_created', 'project_updated', 'project_completed',
    'login', 'logout', 'page_view', 'search_query',
    'notification_clicked', 'notification_dismissed',
    'ai_suggestion_accepted', 'ai_suggestion_rejected'
  )),
  event_data JSONB DEFAULT '{}',
  context JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Patterns for Automation
CREATE TABLE workflow_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN (
    'task_sequence', 'project_template', 'assignment_rule', 'notification_preference'
  )),
  pattern_data JSONB NOT NULL,
  frequency_score FLOAT DEFAULT 0,
  success_rate FLOAT DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictive Analytics Models and Forecasts
CREATE TABLE prediction_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_type TEXT NOT NULL CHECK (model_type IN (
    'completion_time', 'priority_prediction', 'resource_allocation', 
    'deadline_risk', 'team_performance', 'user_engagement'
  )),
  model_version TEXT NOT NULL,
  model_data JSONB NOT NULL,
  accuracy_metrics JSONB DEFAULT '{}',
  training_data_size INTEGER DEFAULT 0,
  last_trained_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE prediction_forecasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID REFERENCES prediction_models(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('task', 'project', 'user', 'team')),
  target_id UUID NOT NULL,
  prediction_type TEXT NOT NULL,
  predicted_value JSONB NOT NULL,
  confidence_interval JSONB DEFAULT '{}',
  actual_value JSONB,
  accuracy_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  target_date TIMESTAMP WITH TIME ZONE
);

-- Smart Notification System
CREATE TABLE notification_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN (
    'priority_filter', 'time_filter', 'context_filter', 'frequency_limit'
  )),
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  effectiveness_score FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notification_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  context_score FLOAT,
  relevance_score FLOAT,
  user_feedback INTEGER CHECK (user_feedback >= -2 AND user_feedback <= 2)
);

-- AI Processing Queue for Real-time Operations
CREATE TABLE ai_processing_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  queue_type TEXT NOT NULL CHECK (queue_type IN (
    'immediate', 'batch', 'scheduled', 'background'
  )),
  agent_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'retrying'
  )),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences for AI Features
CREATE TABLE user_ai_preferences (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  auto_task_assignment BOOLEAN DEFAULT false,
  auto_priority_adjustment BOOLEAN DEFAULT true,
  predictive_notifications BOOLEAN DEFAULT true,
  workflow_suggestions BOOLEAN DEFAULT true,
  learning_enabled BOOLEAN DEFAULT true,
  notification_intelligence BOOLEAN DEFAULT true,
  ai_confidence_threshold FLOAT DEFAULT 0.7,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_ai_agent_actions_agent_id ON ai_agent_actions(agent_id);
CREATE INDEX idx_ai_agent_actions_target ON ai_agent_actions(target_type, target_id);
CREATE INDEX idx_ai_agent_actions_applied ON ai_agent_actions(applied, created_at);
CREATE INDEX idx_user_behavior_events_user_id ON user_behavior_events(user_id, created_at);
CREATE INDEX idx_user_behavior_events_type ON user_behavior_events(event_type, created_at);
CREATE INDEX idx_workflow_patterns_user_id ON workflow_patterns(user_id, is_active);
CREATE INDEX idx_prediction_forecasts_target ON prediction_forecasts(target_type, target_id);
CREATE INDEX idx_notification_analytics_user_id ON notification_analytics(user_id, delivered_at);
CREATE INDEX idx_ai_processing_queue_status ON ai_processing_queue(status, priority, scheduled_for);

-- Functions for AI Operations
CREATE OR REPLACE FUNCTION update_ai_agent_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update agent performance metrics when actions receive feedback
  IF NEW.feedback_score IS NOT NULL AND OLD.feedback_score IS NULL THEN
    UPDATE ai_agents 
    SET performance_metrics = jsonb_set(
      performance_metrics,
      '{feedback_count}',
      COALESCE((performance_metrics->>'feedback_count')::int, 0) + 1
    ),
    performance_metrics = jsonb_set(
      performance_metrics,
      '{avg_feedback}',
      (
        COALESCE((performance_metrics->>'total_feedback')::float, 0) + NEW.feedback_score
      ) / (COALESCE((performance_metrics->>'feedback_count')::int, 0) + 1)
    ),
    performance_metrics = jsonb_set(
      performance_metrics,
      '{total_feedback}',
      COALESCE((performance_metrics->>'total_feedback')::float, 0) + NEW.feedback_score
    ),
    updated_at = NOW()
    WHERE id = NEW.agent_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_agent_performance
  AFTER UPDATE ON ai_agent_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_agent_performance();

-- Function to clean up old AI data
CREATE OR REPLACE FUNCTION cleanup_ai_data()
RETURNS void AS $$
BEGIN
  -- Clean up old behavior events (keep 6 months)
  DELETE FROM user_behavior_events 
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  -- Clean up old completed queue items (keep 1 month)
  DELETE FROM ai_processing_queue 
  WHERE status = 'completed' AND completed_at < NOW() - INTERVAL '1 month';
  
  -- Clean up old expired agent actions
  DELETE FROM ai_agent_actions 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  -- Clean up old notification analytics (keep 3 months)
  DELETE FROM notification_analytics 
  WHERE delivered_at < NOW() - INTERVAL '3 months';
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_preferences ENABLE ROW LEVEL SECURITY;

-- AI Agents are globally readable but only manageable by admins
CREATE POLICY "AI agents are viewable by authenticated users" ON ai_agents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only see their own behavior data and AI interactions
CREATE POLICY "Users can view their own AI agent actions" ON ai_agent_actions
  FOR SELECT USING (
    target_id IN (
      SELECT id FROM tasks WHERE assignee_id = auth.uid() OR reporter_id = auth.uid()
    ) OR
    target_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    ) OR
    target_id = auth.uid()
  );

CREATE POLICY "Users can view their own behavior events" ON user_behavior_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own workflow patterns" ON workflow_patterns
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view relevant predictions" ON prediction_forecasts
  FOR SELECT USING (
    target_id IN (
      SELECT id FROM tasks WHERE assignee_id = auth.uid() OR reporter_id = auth.uid()
    ) OR
    target_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    ) OR
    target_id = auth.uid()
  );

CREATE POLICY "Users can manage their own notification rules" ON notification_rules
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own notification analytics" ON notification_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own AI preferences" ON user_ai_preferences
  FOR ALL USING (user_id = auth.uid());

-- Insert default AI agents
INSERT INTO ai_agents (name, type, description, configuration, capabilities) VALUES
('Project Similarity Analyzer', 'project_merger', 'Analyzes project similarities and suggests merges', 
 '{"similarity_threshold": 0.8, "auto_suggest": true}',
 '[{"name": "semantic_analysis", "confidence": 0.9}, {"name": "merge_recommendation", "confidence": 0.85}]'),
 
('Task Priority Optimizer', 'task_optimizer', 'Optimizes task priorities based on deadlines and dependencies',
 '{"priority_weights": {"deadline": 0.4, "dependencies": 0.3, "user_preference": 0.3}}',
 '[{"name": "priority_prediction", "confidence": 0.8}, {"name": "deadline_analysis", "confidence": 0.75}]'),
 
('Workflow Automation Engine', 'workflow_automator', 'Automates repetitive workflows and task routing',
 '{"pattern_threshold": 0.7, "auto_apply": false}',
 '[{"name": "pattern_recognition", "confidence": 0.85}, {"name": "task_routing", "confidence": 0.8}]'),
 
('Smart Scheduler', 'smart_scheduler', 'Optimizes task scheduling and resource allocation',
 '{"scheduling_algorithm": "genetic", "optimization_target": "completion_time"}',
 '[{"name": "schedule_optimization", "confidence": 0.82}, {"name": "resource_allocation", "confidence": 0.78}]'),
 
('Notification Intelligence', 'notification_filter', 'Filters and prioritizes notifications based on context',
 '{"context_weight": 0.6, "urgency_weight": 0.4}',
 '[{"name": "context_analysis", "confidence": 0.88}, {"name": "urgency_detection", "confidence": 0.83}]'),
 
('Behavior Learning System', 'behavior_analyzer', 'Analyzes user behavior for personalized recommendations',
 '{"learning_rate": 0.1, "recommendation_count": 5}',
 '[{"name": "behavior_analysis", "confidence": 0.75}, {"name": "personalization", "confidence": 0.8}]'),
 
('Predictive Analytics Engine', 'prediction_engine', 'Forecasts project completion and identifies risks',
 '{"forecast_horizon": "30_days", "risk_threshold": 0.7}',
 '[{"name": "completion_prediction", "confidence": 0.85}, {"name": "risk_assessment", "confidence": 0.8}]');