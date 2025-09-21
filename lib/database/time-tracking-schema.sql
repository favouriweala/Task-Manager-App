-- Time Tracking Database Schema
-- This extends the existing schema with comprehensive time tracking features

-- Create time_entries table for tracking work sessions
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Time tracking fields
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER, -- Calculated field for completed entries
  
  -- Entry details
  description TEXT,
  is_billable BOOLEAN DEFAULT false,
  hourly_rate DECIMAL(10,2), -- For billing calculations
  
  -- Entry status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_sessions table for detailed session tracking
CREATE TABLE IF NOT EXISTS work_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  time_entry_id UUID REFERENCES time_entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Session details
  session_start TIMESTAMP WITH TIME ZONE NOT NULL,
  session_end TIMESTAMP WITH TIME ZONE,
  session_duration_minutes INTEGER,
  
  -- Session type and context
  session_type TEXT DEFAULT 'work' CHECK (session_type IN ('work', 'break', 'meeting', 'research')),
  activity_description TEXT,
  
  -- Productivity metrics
  productivity_score INTEGER CHECK (productivity_score >= 1 AND productivity_score <= 5),
  interruptions_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_reports table for saved reports and analytics
CREATE TABLE IF NOT EXISTS time_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Report details
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT DEFAULT 'custom' CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom', 'project')),
  
  -- Report configuration
  date_range_start DATE,
  date_range_end DATE,
  filters JSONB DEFAULT '{}', -- Store filter criteria
  
  -- Report data (cached for performance)
  report_data JSONB DEFAULT '{}',
  last_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Settings
  is_public BOOLEAN DEFAULT false,
  auto_refresh BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_tracking_settings table for user preferences
CREATE TABLE IF NOT EXISTS time_tracking_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Timer settings
  default_timer_duration INTEGER DEFAULT 25, -- Pomodoro default
  break_duration INTEGER DEFAULT 5,
  long_break_duration INTEGER DEFAULT 15,
  auto_start_breaks BOOLEAN DEFAULT false,
  
  -- Tracking preferences
  track_idle_time BOOLEAN DEFAULT true,
  idle_timeout_minutes INTEGER DEFAULT 5,
  require_description BOOLEAN DEFAULT false,
  default_billable BOOLEAN DEFAULT false,
  
  -- Notification settings
  timer_notifications BOOLEAN DEFAULT true,
  daily_summary_email BOOLEAN DEFAULT false,
  weekly_report_email BOOLEAN DEFAULT false,
  
  -- Display preferences
  time_format TEXT DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  week_start_day INTEGER DEFAULT 1 CHECK (week_start_day >= 0 AND week_start_day <= 6), -- 0 = Sunday
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add time tracking fields to existing tasks table
DO $$ 
BEGIN
  -- Add estimated and actual hours if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='estimated_hours') THEN
    ALTER TABLE tasks ADD COLUMN estimated_hours DECIMAL(5,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='actual_hours') THEN
    ALTER TABLE tasks ADD COLUMN actual_hours DECIMAL(5,2);
  END IF;
  
  -- Add time tracking status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='time_tracking_enabled') THEN
    ALTER TABLE tasks ADD COLUMN time_tracking_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
CREATE INDEX IF NOT EXISTS idx_work_sessions_time_entry_id ON work_sessions(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_user_id ON work_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_session_start ON work_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_time_reports_user_id ON time_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_time_reports_report_type ON time_reports(report_type);

-- Create functions for time tracking calculations
CREATE OR REPLACE FUNCTION calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate duration when end_time is set
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
    NEW.status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_work_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate session duration when session_end is set
  IF NEW.session_end IS NOT NULL AND NEW.session_start IS NOT NULL THEN
    NEW.session_duration_minutes = EXTRACT(EPOCH FROM (NEW.session_end - NEW.session_start)) / 60;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update task actual hours
CREATE OR REPLACE FUNCTION update_task_actual_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Update task actual hours when time entry is completed
  IF NEW.status = 'completed' AND NEW.duration_minutes IS NOT NULL THEN
    UPDATE tasks 
    SET actual_hours = COALESCE(actual_hours, 0) + (NEW.duration_minutes / 60.0)
    WHERE id = NEW.task_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER calculate_time_entry_duration_trigger
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_time_entry_duration();

CREATE TRIGGER calculate_work_session_duration_trigger
  BEFORE UPDATE ON work_sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_work_session_duration();

CREATE TRIGGER update_task_actual_hours_trigger
  AFTER UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_task_actual_hours();

-- Add updated_at triggers for new tables
CREATE TRIGGER update_time_entries_updated_at 
  BEFORE UPDATE ON time_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_sessions_updated_at 
  BEFORE UPDATE ON work_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_reports_updated_at 
  BEFORE UPDATE ON time_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_tracking_settings_updated_at 
  BEFORE UPDATE ON time_tracking_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW time_tracking_summary AS
SELECT 
  te.user_id,
  te.task_id,
  te.project_id,
  t.title as task_title,
  p.name as project_name,
  SUM(te.duration_minutes) as total_minutes,
  SUM(te.duration_minutes) / 60.0 as total_hours,
  COUNT(te.id) as entry_count,
  MIN(te.start_time) as first_entry,
  MAX(te.end_time) as last_entry
FROM time_entries te
LEFT JOIN tasks t ON te.task_id = t.id
LEFT JOIN projects p ON te.project_id = p.id
WHERE te.status = 'completed'
GROUP BY te.user_id, te.task_id, te.project_id, t.title, p.name;

-- Create RLS policies for time tracking tables
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_settings ENABLE ROW LEVEL SECURITY;

-- Time entries policies
CREATE POLICY "Users can view their own time entries" ON time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" ON time_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries" ON time_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Work sessions policies
CREATE POLICY "Users can view their own work sessions" ON work_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work sessions" ON work_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work sessions" ON work_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Time reports policies
CREATE POLICY "Users can view their own time reports" ON time_reports
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage their own time reports" ON time_reports
  FOR ALL USING (auth.uid() = user_id);

-- Time tracking settings policies
CREATE POLICY "Users can manage their own time tracking settings" ON time_tracking_settings
  FOR ALL USING (auth.uid() = user_id);