-- TaskFlow Database Setup Script
-- This script sets up the complete database schema and security policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_members table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create task_comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_attachments table
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON public.task_attachments(task_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_comments_updated_at ON public.task_comments;
CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
DROP POLICY IF EXISTS "Users can view projects they own or are members of" ON public.projects;
CREATE POLICY "Users can view projects they own or are members of" ON public.projects
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Project owners can update their projects" ON public.projects;
CREATE POLICY "Project owners can update their projects" ON public.projects
  FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Project owners can delete their projects" ON public.projects;
CREATE POLICY "Project owners can delete their projects" ON public.projects
  FOR DELETE USING (owner_id = auth.uid());

-- Tasks policies
DROP POLICY IF EXISTS "Users can view tasks in their projects" ON public.tasks;
CREATE POLICY "Users can view tasks in their projects" ON public.tasks
  FOR SELECT USING (
    created_by = auth.uid() OR
    assigned_to = auth.uid() OR
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create tasks in their projects" ON public.tasks;
CREATE POLICY "Users can create tasks in their projects" ON public.tasks
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND (
      project_id IN (
        SELECT id FROM public.projects 
        WHERE owner_id = auth.uid()
      ) OR
      project_id IN (
        SELECT project_id FROM public.project_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
      )
    )
  );

DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON public.tasks;
CREATE POLICY "Users can update tasks they created or are assigned to" ON public.tasks
  FOR UPDATE USING (
    created_by = auth.uid() OR
    assigned_to = auth.uid() OR
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can delete tasks they created" ON public.tasks;
CREATE POLICY "Users can delete tasks they created" ON public.tasks
  FOR DELETE USING (
    created_by = auth.uid() OR
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid()
    )
  );

-- Project members policies
DROP POLICY IF EXISTS "Users can view project members for their projects" ON public.project_members;
CREATE POLICY "Users can view project members for their projects" ON public.project_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Project owners can manage project members" ON public.project_members;
CREATE POLICY "Project owners can manage project members" ON public.project_members
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid()
    )
  );

-- Task comments policies
DROP POLICY IF EXISTS "Users can view comments on tasks they have access to" ON public.task_comments;
CREATE POLICY "Users can view comments on tasks they have access to" ON public.task_comments
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE created_by = auth.uid() OR
            assigned_to = auth.uid() OR
            project_id IN (
              SELECT id FROM public.projects 
              WHERE owner_id = auth.uid()
            ) OR
            project_id IN (
              SELECT project_id FROM public.project_members 
              WHERE user_id = auth.uid()
            )
    )
  );

DROP POLICY IF EXISTS "Users can create comments on tasks they have access to" ON public.task_comments;
CREATE POLICY "Users can create comments on tasks they have access to" ON public.task_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    task_id IN (
      SELECT id FROM public.tasks
      WHERE created_by = auth.uid() OR
            assigned_to = auth.uid() OR
            project_id IN (
              SELECT id FROM public.projects 
              WHERE owner_id = auth.uid()
            ) OR
            project_id IN (
              SELECT project_id FROM public.project_members 
              WHERE user_id = auth.uid()
            )
    )
  );

DROP POLICY IF EXISTS "Users can update their own comments" ON public.task_comments;
CREATE POLICY "Users can update their own comments" ON public.task_comments
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.task_comments;
CREATE POLICY "Users can delete their own comments" ON public.task_comments
  FOR DELETE USING (user_id = auth.uid());

-- Task attachments policies
DROP POLICY IF EXISTS "Users can view attachments on tasks they have access to" ON public.task_attachments;
CREATE POLICY "Users can view attachments on tasks they have access to" ON public.task_attachments
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM public.tasks
      WHERE created_by = auth.uid() OR
            assigned_to = auth.uid() OR
            project_id IN (
              SELECT id FROM public.projects 
              WHERE owner_id = auth.uid()
            ) OR
            project_id IN (
              SELECT project_id FROM public.project_members 
              WHERE user_id = auth.uid()
            )
    )
  );

DROP POLICY IF EXISTS "Users can upload attachments to tasks they have access to" ON public.task_attachments;
CREATE POLICY "Users can upload attachments to tasks they have access to" ON public.task_attachments
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    task_id IN (
      SELECT id FROM public.tasks
      WHERE created_by = auth.uid() OR
            assigned_to = auth.uid() OR
            project_id IN (
              SELECT id FROM public.projects 
              WHERE owner_id = auth.uid()
            ) OR
            project_id IN (
              SELECT project_id FROM public.project_members 
              WHERE user_id = auth.uid()
            )
    )
  );

DROP POLICY IF EXISTS "Users can delete attachments they uploaded" ON public.task_attachments;
CREATE POLICY "Users can delete attachments they uploaded" ON public.task_attachments
  FOR DELETE USING (uploaded_by = auth.uid());

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;