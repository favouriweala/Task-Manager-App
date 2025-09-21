-- Analytics Database Schema
-- This extends the existing schema with comprehensive analytics and reporting features

-- Create task_analytics table for tracking task performance metrics
CREATE TABLE IF NOT EXISTS task_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Performance metrics
  completion_time_minutes INTEGER, -- Time from creation to completion
  estimated_vs_actual_ratio DECIMAL(5,2), -- actual_hours / estimated_hours
  priority_changes_count INTEGER DEFAULT 0,
  status_changes_count INTEGER DEFAULT 0,
  
  -- Engagement metrics
  comments_count INTEGER DEFAULT 0,
  attachments_count INTEGER DEFAULT 0,
  collaborators_count INTEGER DEFAULT 0,
  
  -- Quality metrics
  reopened_count INTEGER DEFAULT 0, -- How many times task was reopened
  blocked_time_minutes INTEGER DEFAULT 0, -- Time spent in blocked status
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(task_id)
);

-- Create user_activity_logs table for detailed user behavior tracking
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Activity details
  action_type TEXT NOT NULL CHECK (action_type IN (
    'task_created', 'task_updated', 'task_completed', 'task_deleted',
    'project_created', 'project_updated', 'project_deleted',
    'comment_added', 'attachment_uploaded', 'time_logged',
    'login', 'logout', 'dashboard_viewed', 'report_generated'
  )),
  resource_type TEXT CHECK (resource_type IN ('task', 'project', 'comment', 'attachment', 'time_entry', 'user')),
  resource_id UUID,
  
  -- Context data
  metadata JSONB DEFAULT '{}', -- Store additional context like old/new values
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_analytics table for project-level metrics
CREATE TABLE IF NOT EXISTS project_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  
  -- Date for daily aggregation
  date DATE NOT NULL,
  
  -- Task metrics
  tasks_created INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_in_progress INTEGER DEFAULT 0,
  tasks_overdue INTEGER DEFAULT 0,
  
  -- Time metrics
  total_time_logged_minutes INTEGER DEFAULT 0,
  average_completion_time_minutes DECIMAL(10,2),
  
  -- Team metrics
  active_users_count INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_attachments INTEGER DEFAULT 0,
  
  -- Performance metrics
  velocity DECIMAL(10,2), -- Tasks completed per day
  burndown_rate DECIMAL(10,2), -- Rate of task completion
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, date)
);

-- Create dashboard_metrics table for real-time dashboard data
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Date for daily aggregation
  date DATE NOT NULL,
  
  -- Personal productivity metrics
  tasks_completed INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,
  time_logged_minutes INTEGER DEFAULT 0,
  focus_time_minutes INTEGER DEFAULT 0, -- Time without interruptions
  
  -- Engagement metrics
  comments_made INTEGER DEFAULT 0,
  files_uploaded INTEGER DEFAULT 0,
  projects_accessed INTEGER DEFAULT 0,
  
  -- Efficiency metrics
  average_task_completion_time DECIMAL(10,2),
  on_time_completion_rate DECIMAL(5,2), -- Percentage of tasks completed on time
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Create analytics_reports table for saved custom reports
CREATE TABLE IF NOT EXISTS analytics_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Report details
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT DEFAULT 'custom' CHECK (report_type IN (
    'productivity', 'project_summary', 'team_performance', 
    'time_tracking', 'task_analysis', 'custom'
  )),
  
  -- Report configuration
  filters JSONB DEFAULT '{}', -- Date ranges, project filters, etc.
  chart_config JSONB DEFAULT '{}', -- Chart types, colors, etc.
  
  -- Report data (cached for performance)
  report_data JSONB DEFAULT '{}',
  last_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Sharing settings
  is_public BOOLEAN DEFAULT false,
  shared_with TEXT[] DEFAULT '{}', -- User IDs who can access this report
  
  -- Auto-refresh settings
  auto_refresh BOOLEAN DEFAULT false,
  refresh_frequency TEXT CHECK (refresh_frequency IN ('daily', 'weekly', 'monthly')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance_benchmarks table for tracking KPIs
CREATE TABLE IF NOT EXISTS performance_benchmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Benchmark details
  metric_name TEXT NOT NULL,
  metric_type TEXT CHECK (metric_type IN ('user', 'project', 'team', 'system')),
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2),
  
  -- Context
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'missed', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_analytics_task_id ON task_analytics(task_id);
CREATE INDEX IF NOT EXISTS idx_task_analytics_user_id ON task_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_task_analytics_project_id ON task_analytics(project_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action_type ON user_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_resource ON user_activity_logs(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_project_analytics_project_id ON project_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_project_analytics_date ON project_analytics(date);

CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_user_id ON dashboard_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_date ON dashboard_metrics(date);

CREATE INDEX IF NOT EXISTS idx_analytics_reports_user_id ON analytics_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_type ON analytics_reports(report_type);

CREATE INDEX IF NOT EXISTS idx_performance_benchmarks_user_id ON performance_benchmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_benchmarks_project_id ON performance_benchmarks(project_id);
CREATE INDEX IF NOT EXISTS idx_performance_benchmarks_period ON performance_benchmarks(period_start, period_end);

-- Create functions for analytics calculations
CREATE OR REPLACE FUNCTION update_task_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert task analytics when task is modified
  INSERT INTO task_analytics (
    task_id, user_id, project_id, 
    completion_time_minutes, status_changes_count
  )
  VALUES (
    NEW.id, NEW.created_by, NEW.project_id,
    CASE 
      WHEN NEW.status = 'completed' AND OLD.status != 'completed' THEN
        EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 60
      ELSE NULL
    END,
    CASE WHEN OLD.status IS NULL THEN 0 ELSE 1 END
  )
  ON CONFLICT (task_id) DO UPDATE SET
    completion_time_minutes = CASE 
      WHEN NEW.status = 'completed' AND OLD.status != 'completed' THEN
        EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 60
      ELSE task_analytics.completion_time_minutes
    END,
    status_changes_count = task_analytics.status_changes_count + 1,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action_type TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO user_activity_logs (
    user_id, action_type, resource_type, resource_id, metadata
  )
  VALUES (
    p_user_id, p_action_type, p_resource_type, p_resource_id, p_metadata
  )
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update daily metrics
CREATE OR REPLACE FUNCTION update_daily_metrics()
RETURNS void AS $$
BEGIN
  -- Update dashboard metrics for today
  INSERT INTO dashboard_metrics (user_id, date, tasks_completed, tasks_created, time_logged_minutes)
  SELECT 
    t.created_by as user_id,
    CURRENT_DATE as date,
    COUNT(CASE WHEN t.status = 'completed' AND t.completed_at::date = CURRENT_DATE THEN 1 END) as tasks_completed,
    COUNT(CASE WHEN t.created_at::date = CURRENT_DATE THEN 1 END) as tasks_created,
    COALESCE(SUM(te.duration_minutes), 0) as time_logged_minutes
  FROM tasks t
  LEFT JOIN time_entries te ON t.id = te.task_id AND te.start_time::date = CURRENT_DATE
  WHERE t.created_at::date = CURRENT_DATE OR t.completed_at::date = CURRENT_DATE
  GROUP BY t.created_by
  ON CONFLICT (user_id, date) DO UPDATE SET
    tasks_completed = EXCLUDED.tasks_completed,
    tasks_created = EXCLUDED.tasks_created,
    time_logged_minutes = EXCLUDED.time_logged_minutes,
    updated_at = NOW();
    
  -- Update project analytics for today
  INSERT INTO project_analytics (project_id, date, tasks_created, tasks_completed, total_time_logged_minutes)
  SELECT 
    t.project_id,
    CURRENT_DATE as date,
    COUNT(CASE WHEN t.created_at::date = CURRENT_DATE THEN 1 END) as tasks_created,
    COUNT(CASE WHEN t.status = 'completed' AND t.completed_at::date = CURRENT_DATE THEN 1 END) as tasks_completed,
    COALESCE(SUM(te.duration_minutes), 0) as total_time_logged_minutes
  FROM tasks t
  LEFT JOIN time_entries te ON t.id = te.task_id AND te.start_time::date = CURRENT_DATE
  WHERE t.project_id IS NOT NULL 
    AND (t.created_at::date = CURRENT_DATE OR t.completed_at::date = CURRENT_DATE)
  GROUP BY t.project_id
  ON CONFLICT (project_id, date) DO UPDATE SET
    tasks_created = EXCLUDED.tasks_created,
    tasks_completed = EXCLUDED.tasks_completed,
    total_time_logged_minutes = EXCLUDED.total_time_logged_minutes,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_task_analytics_trigger
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_task_analytics();

-- Add updated_at triggers for analytics tables
CREATE TRIGGER update_task_analytics_updated_at 
  BEFORE UPDATE ON task_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_analytics_updated_at 
  BEFORE UPDATE ON project_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_metrics_updated_at 
  BEFORE UPDATE ON dashboard_metrics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_reports_updated_at 
  BEFORE UPDATE ON analytics_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_benchmarks_updated_at 
  BEFORE UPDATE ON performance_benchmarks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common analytics queries
CREATE OR REPLACE VIEW user_productivity_summary AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.email,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN t.due_date < NOW() AND t.status != 'completed' THEN 1 END) as overdue_tasks,
  AVG(CASE WHEN t.status = 'completed' THEN ta.completion_time_minutes END) as avg_completion_time,
  COALESCE(SUM(te.duration_minutes), 0) as total_time_logged
FROM profiles p
LEFT JOIN tasks t ON p.id = t.created_by
LEFT JOIN task_analytics ta ON t.id = ta.task_id
LEFT JOIN time_entries te ON t.id = te.task_id
GROUP BY p.id, p.full_name, p.email;

CREATE OR REPLACE VIEW project_performance_summary AS
SELECT 
  pr.id as project_id,
  pr.name as project_name,
  pr.status as project_status,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
  COUNT(CASE WHEN t.due_date < NOW() AND t.status != 'completed' THEN 1 END) as overdue_tasks,
  AVG(CASE WHEN t.status = 'completed' THEN ta.completion_time_minutes END) as avg_completion_time,
  COALESCE(SUM(te.duration_minutes), 0) as total_time_logged
FROM projects pr
LEFT JOIN tasks t ON pr.id = t.project_id
LEFT JOIN task_analytics ta ON t.id = ta.task_id
LEFT JOIN time_entries te ON t.id = te.task_id
GROUP BY pr.id, pr.name, pr.status;

-- Enable RLS for analytics tables
ALTER TABLE task_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_benchmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only see their own analytics data)
CREATE POLICY "Users can view their own task analytics" ON task_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own activity logs" ON user_activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view project analytics for their projects" ON project_analytics
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own dashboard metrics" ON dashboard_metrics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own analytics reports" ON analytics_reports
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own performance benchmarks" ON performance_benchmarks
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);