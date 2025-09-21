import { supabase } from '@/lib/supabase/client';
import type { 
  Team, 
  TeamMember, 
  TeamInvitation, 
  CreateTeamRequest, 
  UpdateTeamRequest,
  InviteTeamMemberRequest,
  UpdateTeamMemberRequest,
  TeamStats,
  ActivityLog
} from '../types/team';

export class TeamService {
  // Team CRUD operations
  static async createTeam(data: CreateTeamRequest): Promise<Team> {
    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        name: data.name,
        description: data.description,
        owner_id: (await supabase.auth.getUser()).data.user?.id,
        settings: {
          is_public: false,
          allow_member_invites: true,
          default_project_visibility: 'team',
          require_approval_for_join: false,
          ...data.settings
        }
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as owner to team_members
    await this.addTeamMember(team.id, {
      user_id: team.owner_id,
      role: 'owner'
    });

    // Log activity
    await this.logActivity('team_created', 'team', team.id, team.id);

    return team;
  }

  static async getTeam(id: string): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserTeams(): Promise<Team[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members!inner(user_id)
      `)
      .eq('team_members.user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateTeam(id: string, data: UpdateTeamRequest): Promise<Team> {
    const { data: team, error } = await supabase
      .from('teams')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await this.logActivity('team_updated', 'team', id, id);

    return team;
  }

  static async deleteTeam(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    await this.logActivity('team_deleted', 'team', id, id);
  }

  // Team member operations
  static async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:profiles(id, email, full_name, avatar_url)
      `)
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async addTeamMember(teamId: string, member: { user_id: string; role: string }): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: member.user_id,
        role: member.role,
        invited_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select(`
        *,
        user:profiles(id, email, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Log activity
    await this.logActivity('member_added', 'team_member', data.id, teamId);

    return data;
  }

  static async updateTeamMember(teamId: string, userId: string, data: UpdateTeamMemberRequest): Promise<TeamMember> {
    const { data: member, error } = await supabase
      .from('team_members')
      .update(data)
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select(`
        *,
        user:profiles(id, email, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Log activity
    await this.logActivity('member_role_updated', 'team_member', member.id, teamId);

    return member;
  }

  static async removeTeamMember(teamId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;

    // Log activity
    await this.logActivity('member_removed', 'team_member', userId, teamId);
  }

  // Team invitation operations
  static async inviteTeamMember(teamId: string, data: InviteTeamMemberRequest): Promise<TeamInvitation> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data: invitation, error } = await supabase
      .from('team_invitations')
      .insert({
        team_id: teamId,
        email: data.email,
        role: data.role,
        invited_by: (await supabase.auth.getUser()).data.user?.id,
        expires_at: expiresAt.toISOString()
      })
      .select(`
        *,
        team:teams(*),
        inviter:profiles!invited_by(id, full_name, email)
      `)
      .single();

    if (error) throw error;

    // Log activity
    await this.logActivity('member_invited', 'team_invitation', invitation.id, teamId);

    return invitation;
  }

  static async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    const { data, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        team:teams(*),
        inviter:profiles!invited_by(id, full_name, email)
      `)
      .eq('team_id', teamId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getUserInvitations(): Promise<TeamInvitation[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        team:teams(*),
        inviter:profiles!invited_by(id, full_name, email)
      `)
      .eq('email', user.user.email)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async acceptInvitation(invitationId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (inviteError) throw inviteError;

    // Add user to team
    await this.addTeamMember(invitation.team_id, {
      user_id: user.user.id,
      role: invitation.role
    });

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('team_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitationId);

    if (updateError) throw updateError;

    // Log activity
    await this.logActivity('invitation_accepted', 'team_invitation', invitationId, invitation.team_id);
  }

  static async declineInvitation(invitationId: string): Promise<void> {
    const { error } = await supabase
      .from('team_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) throw error;
  }

  // Team statistics
  static async getTeamStats(teamId: string): Promise<TeamStats> {
    // First get project IDs for this team
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('team_id', teamId);

    const projectIds = projects?.map(p => p.id) || [];

    const [membersResult, projectsResult, tasksResult] = await Promise.all([
      supabase
        .from('team_members')
        .select('id', { count: 'exact' })
        .eq('team_id', teamId),
      supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('team_id', teamId),
      projectIds.length > 0 ? supabase
        .from('tasks')
        .select('id, status', { count: 'exact' })
        .in('project_id', projectIds) : { data: [], count: 0 }
    ]);

    const totalMembers = membersResult.count || 0;
    const totalProjects = projectsResult.count || 0;
    const totalTasks = tasksResult.count || 0;
    
    const tasks = tasksResult.data || [];
    const activeTasks = tasks.filter(t => t.status !== 'completed').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    return {
      total_members: totalMembers,
      total_projects: totalProjects,
      total_tasks: totalTasks,
      active_tasks: activeTasks,
      completed_tasks: completedTasks
    };
  }

  // Activity logging
  static async getTeamActivity(teamId: string, limit = 50): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles!user_id(id, full_name, email, avatar_url),
        team:teams!team_id(id, name),
        project:projects!project_id(id, name)
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  private static async logActivity(
    action: string,
    resourceType: string,
    resourceId?: string,
    teamId?: string,
    projectId?: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    await supabase.rpc('log_activity', {
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_team_id: teamId,
      p_project_id: projectId,
      p_metadata: metadata
    });
  }
}