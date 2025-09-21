export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  avatar_url?: string;
  settings: TeamSettings;
  created_at: string;
  updated_at: string;
}

export interface TeamSettings {
  is_public: boolean;
  allow_member_invites: boolean;
  default_project_visibility: 'private' | 'team' | 'public';
  require_approval_for_join: boolean;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  invited_by?: string;
  // Populated from profiles table
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  invited_by: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  // Populated fields
  team?: Team;
  inviter?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  task_assignments: boolean;
  task_updates: boolean;
  team_invitations: boolean;
  project_updates: boolean;
  due_date_reminders: boolean;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  team_id?: string;
  project_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  // Populated fields
  user?: {
    id: string;
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
  team?: Team;
  project?: {
    id: string;
    name: string;
  };
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  settings?: Partial<TeamSettings>;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  avatar_url?: string;
  settings?: Partial<TeamSettings>;
}

export interface InviteTeamMemberRequest {
  email: string;
  role: TeamRole;
}

export interface UpdateTeamMemberRequest {
  role: TeamRole;
}

export interface TeamStats {
  total_members: number;
  total_projects: number;
  total_tasks: number;
  active_tasks: number;
  completed_tasks: number;
}

// Permission helpers
export const TEAM_PERMISSIONS = {
  canManageTeam: (role: TeamRole) => ['owner', 'admin'].includes(role),
  canInviteMembers: (role: TeamRole, settings: TeamSettings) => 
    ['owner', 'admin'].includes(role) || 
    (settings.allow_member_invites && role === 'member'),
  canManageProjects: (role: TeamRole) => ['owner', 'admin', 'member'].includes(role),
  canViewTeam: (role: TeamRole) => ['owner', 'admin', 'member', 'viewer'].includes(role),
  canDeleteTeam: (role: TeamRole) => role === 'owner',
  canRemoveMembers: (role: TeamRole, targetRole: TeamRole) => {
    if (role === 'owner') return true;
    if (role === 'admin' && !['owner', 'admin'].includes(targetRole)) return true;
    return false;
  },
  canUpdateMemberRole: (role: TeamRole, targetRole: TeamRole, newRole: TeamRole) => {
    if (role === 'owner') return true;
    if (role === 'admin' && !['owner'].includes(targetRole) && newRole !== 'owner') return true;
    return false;
  }
} as const;