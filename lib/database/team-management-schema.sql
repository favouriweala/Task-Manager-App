-- Enhanced Team Management Schema
-- This extends the existing schema with additional team management features

-- Create teams table for organization-level teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table for team membership
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(team_id, user_id)
);

-- Create team_invitations table for pending invitations
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invited_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, email)
);

-- Update projects table to link with teams (add team_id column if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='team_id') THEN
    ALTER TABLE projects ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create user_preferences table for enhanced user settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  notifications JSONB DEFAULT '{
    "email": true,
    "push": true,
    "task_assigned": true,
    "task_due": true,
    "team_invites": true,
    "project_updates": true
  }',
  dashboard_layout JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table for audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_team_id ON activity_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Add triggers for updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate team slug
CREATE OR REPLACE FUNCTION generate_team_slug(team_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase and replace spaces/special chars with hyphens
  base_slug := lower(regexp_replace(team_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'team';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM teams WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create function to check team membership
CREATE OR REPLACE FUNCTION is_team_member(user_uuid UUID, team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = user_uuid AND team_id = team_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user teams
CREATE OR REPLACE FUNCTION get_user_teams(user_uuid UUID)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  team_slug TEXT,
  user_role TEXT,
  joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.slug,
    tm.role,
    tm.joined_at
  FROM teams t
  JOIN team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = user_uuid
  ORDER BY tm.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;