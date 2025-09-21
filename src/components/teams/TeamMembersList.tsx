import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  MoreVertical, 
  Crown, 
  Shield, 
  User, 
  Eye,
  Trash2,
  Edit3
} from 'lucide-react';
import type { TeamMember, TeamRole, InviteTeamMemberRequest } from '../../types/team';
import { TEAM_PERMISSIONS } from '../../types/team';

interface TeamMembersListProps {
  members: TeamMember[];
  currentUserRole: TeamRole;
  teamId: string;
  onInviteMember: (data: InviteTeamMemberRequest) => Promise<void>;
  onUpdateMemberRole: (userId: string, role: TeamRole) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  isLoading?: boolean;
}

export const TeamMembersList: React.FC<TeamMembersListProps> = ({
  members,
  currentUserRole,
  teamId,
  onInviteMember,
  onUpdateMemberRole,
  onRemoveMember,
  isLoading = false
}) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'member' as TeamRole });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'member': return <User className="w-4 h-4 text-green-500" />;
      case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: TeamRole) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onInviteMember(inviteData);
      setInviteData({ email: '', role: 'member' });
      setShowInviteForm(false);
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const canManageMembers = TEAM_PERMISSIONS.canInviteMembers(currentUserRole, { allow_member_invites: true } as any);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Team Members ({members.length})
            </h3>
          </div>
          
          {canManageMembers && (
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1"
              disabled={isLoading}
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          )}
        </div>

        {showInviteForm && (
          <form onSubmit={handleInvite} className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value as TeamRole }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="member">Member</option>
                  {TEAM_PERMISSIONS.canManageTeam(currentUserRole) && (
                    <option value="admin">Admin</option>
                  )}
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {members.map((member) => (
          <div key={member.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {member.user?.avatar_url ? (
                <img
                  src={member.user.avatar_url}
                  alt={member.user.full_name || member.user.email}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
              )}
              
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {member.user?.full_name || member.user?.email}
                  </h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getRoleBadgeColor(member.role)}`}>
                    {getRoleIcon(member.role)}
                    <span className="capitalize">{member.role}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{member.user?.email}</p>
                <p className="text-xs text-gray-400">
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {TEAM_PERMISSIONS.canManageTeam(currentUserRole) && member.role !== 'owner' && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeDropdown === member.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      {TEAM_PERMISSIONS.canUpdateMemberRole(currentUserRole, member.role, 'admin') && (
                        <button
                          onClick={() => {
                            onUpdateMemberRole(member.user_id, member.role === 'admin' ? 'member' : 'admin');
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>{member.role === 'admin' ? 'Remove Admin' : 'Make Admin'}</span>
                        </button>
                      )}
                      
                      {TEAM_PERMISSIONS.canRemoveMembers(currentUserRole, member.role) && (
                        <button
                          onClick={() => {
                            onRemoveMember(member.user_id);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove Member</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No team members yet</p>
          <p className="text-sm">Invite members to start collaborating</p>
        </div>
      )}
    </div>
  );
};