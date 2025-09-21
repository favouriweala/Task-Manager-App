-- Row Level Security Policies for Team Management

-- Enable RLS on all team management tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can view teams they are members of" ON teams
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM team_members WHERE team_id = teams.id
    )
  );

CREATE POLICY "Team owners can update their teams" ON teams
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Team owners and admins can delete their teams" ON teams
  FOR DELETE USING (
    auth.uid() = owner_id OR
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE team_id = teams.id AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Authenticated users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Team members policies
CREATE POLICY "Users can view team members of teams they belong to" ON team_members
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT tm.user_id FROM team_members tm WHERE tm.team_id = team_members.team_id
    )
  );

CREATE POLICY "Team owners and admins can manage team members" ON team_members
  FOR ALL USING (
    auth.uid() IN (
      SELECT tm.user_id FROM team_members tm 
      WHERE tm.team_id = team_members.team_id 
      AND tm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can leave teams (delete their own membership)" ON team_members
  FOR DELETE USING (auth.uid() = user_id);

-- Team invitations policies
CREATE POLICY "Users can view invitations for teams they can manage" ON team_invitations
  FOR SELECT USING (
    auth.uid() = invited_by OR
    auth.uid() IN (
      SELECT tm.user_id FROM team_members tm 
      WHERE tm.team_id = team_invitations.team_id 
      AND tm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners and admins can create invitations" ON team_invitations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT tm.user_id FROM team_members tm 
      WHERE tm.team_id = team_invitations.team_id 
      AND tm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners and admins can update invitations" ON team_invitations
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT tm.user_id FROM team_members tm 
      WHERE tm.team_id = team_invitations.team_id 
      AND tm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners and admins can delete invitations" ON team_invitations
  FOR DELETE USING (
    auth.uid() IN (
      SELECT tm.user_id FROM team_members tm 
      WHERE tm.team_id = team_invitations.team_id 
      AND tm.role IN ('owner', 'admin')
    )
  );

-- User preferences policies
CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Activity logs policies
CREATE POLICY "Users can view their own activity logs" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view activity logs for teams they belong to" ON activity_logs
  FOR SELECT USING (
    team_id IS NOT NULL AND
    auth.uid() IN (
      SELECT tm.user_id FROM team_members tm WHERE tm.team_id = activity_logs.team_id
    )
  );

CREATE POLICY "Users can view activity logs for projects they have access to" ON activity_logs
  FOR SELECT USING (
    project_id IS NOT NULL AND
    auth.uid() IN (
      SELECT pm.user_id FROM project_members pm WHERE pm.project_id = activity_logs.project_id
      UNION
      SELECT p.owner_id FROM projects p WHERE p.id = activity_logs.project_id
    )
  );

CREATE POLICY "System can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- Update existing project policies to include team-based access
DROP POLICY IF EXISTS "Users can view projects they own or are members of" ON projects;
CREATE POLICY "Users can view projects they own or are members of" ON projects
  FOR SELECT USING (
    auth.uid() = owner_id OR
    auth.uid() IN (
      SELECT user_id FROM project_members WHERE project_id = projects.id
    ) OR
    (team_id IS NOT NULL AND auth.uid() IN (
      SELECT user_id FROM team_members WHERE team_id = projects.team_id
    ))
  );

DROP POLICY IF EXISTS "Project owners can update their projects" ON projects;
CREATE POLICY "Project owners and team admins can update projects" ON projects
  FOR UPDATE USING (
    auth.uid() = owner_id OR
    (team_id IS NOT NULL AND auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE team_id = projects.team_id AND role IN ('owner', 'admin')
    ))
  );

-- Update task policies to include team-based access
DROP POLICY IF EXISTS "Users can view tasks in projects they have access to" ON tasks;
CREATE POLICY "Users can view tasks in projects they have access to" ON tasks
  FOR SELECT USING (
    auth.uid() = created_by OR
    auth.uid() = assignee_id OR
    project_id IN (
      SELECT p.id FROM projects p 
      WHERE p.owner_id = auth.uid() OR
      p.id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()) OR
      (p.team_id IS NOT NULL AND p.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      ))
    )
  );

-- Create function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_team_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO activity_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    team_id,
    project_id,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_team_id,
    p_project_id,
    p_metadata
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;