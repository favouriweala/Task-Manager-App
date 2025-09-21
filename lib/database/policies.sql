-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view projects they own or are members of" ON projects
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Project owners can update their projects" ON projects
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Project owners can delete their projects" ON projects
  FOR DELETE USING (owner_id = auth.uid());

-- Project members policies
CREATE POLICY "Users can view project members for projects they have access to" ON project_members
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Project owners can manage project members" ON project_members
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Tasks policies
CREATE POLICY "Users can view tasks in projects they have access to" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    ) OR 
    assignee_id = auth.uid() OR 
    created_by = auth.uid()
  );

CREATE POLICY "Users can create tasks in projects they have access to" ON tasks
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND (
      project_id IN (
        SELECT id FROM projects 
        WHERE owner_id = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
      ) OR project_id IS NULL
    )
  );

CREATE POLICY "Users can update tasks they created or are assigned to" ON tasks
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    assignee_id = auth.uid() OR
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks they created" ON tasks
  FOR DELETE USING (
    created_by = auth.uid() OR
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Task comments policies
CREATE POLICY "Users can view comments on tasks they have access to" ON task_comments
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks 
      WHERE project_id IN (
        SELECT id FROM projects 
        WHERE owner_id = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
      ) OR 
      assignee_id = auth.uid() OR 
      created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on tasks they have access to" ON task_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    task_id IN (
      SELECT id FROM tasks 
      WHERE project_id IN (
        SELECT id FROM projects 
        WHERE owner_id = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
      ) OR 
      assignee_id = auth.uid() OR 
      created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments" ON task_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON task_comments
  FOR DELETE USING (user_id = auth.uid());

-- Task attachments policies
CREATE POLICY "Users can view attachments on tasks they have access to" ON task_attachments
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks 
      WHERE project_id IN (
        SELECT id FROM projects 
        WHERE owner_id = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
      ) OR 
      assignee_id = auth.uid() OR 
      created_by = auth.uid()
    )
  );

CREATE POLICY "Users can upload attachments to tasks they have access to" ON task_attachments
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    task_id IN (
      SELECT id FROM tasks 
      WHERE project_id IN (
        SELECT id FROM projects 
        WHERE owner_id = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
      ) OR 
      assignee_id = auth.uid() OR 
      created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments they uploaded" ON task_attachments
  FOR DELETE USING (uploaded_by = auth.uid());