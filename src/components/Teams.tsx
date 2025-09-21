'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Settings } from 'lucide-react';
import { TeamCard } from '../components/teams/TeamCard';
import { CreateTeamModal } from '../components/teams/CreateTeamModal';
import { TeamMembersList } from '../components/teams/TeamMembersList';
import { TeamService } from '../services/teamService';
import { supabase } from '@/lib/supabase/client';
import type { Team, TeamStats, TeamMember, CreateTeamRequest, InviteTeamMemberRequest, TeamRole } from '../types/team';

export const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<Record<string, TeamStats>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<TeamRole>('member');

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id);
      loadTeamStats(selectedTeam.id);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const userTeams = await TeamService.getUserTeams();
      setTeams(userTeams);
      
      // Load stats for each team
      const stats: Record<string, TeamStats> = {};
      await Promise.all(
        userTeams.map(async (team) => {
          try {
            stats[team.id] = await TeamService.getTeamStats(team.id);
          } catch (error) {
            console.error(`Failed to load stats for team ${team.id}:`, error);
          }
        })
      );
      setTeamStats(stats);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const members = await TeamService.getTeamMembers(teamId);
      setTeamMembers(members);
      
      // Find current user's role
      const currentUser = await supabase.auth.getUser();
      const currentMember = members.find(m => m.user_id === currentUser.data.user?.id);
      if (currentMember) {
        setCurrentUserRole(currentMember.role);
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  const loadTeamStats = async (teamId: string) => {
    try {
      const stats = await TeamService.getTeamStats(teamId);
      setTeamStats(prev => ({ ...prev, [teamId]: stats }));
    } catch (error) {
      console.error('Failed to load team stats:', error);
    }
  };

  const handleCreateTeam = async (data: CreateTeamRequest) => {
    setIsCreating(true);
    try {
      const newTeam = await TeamService.createTeam(data);
      setTeams(prev => [newTeam, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create team:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleInviteMember = async (data: InviteTeamMemberRequest) => {
    if (!selectedTeam) return;
    
    try {
      await TeamService.inviteTeamMember(selectedTeam.id, data);
      // Reload members to show the invitation
      await loadTeamMembers(selectedTeam.id);
    } catch (error) {
      console.error('Failed to invite member:', error);
      throw error;
    }
  };

  const handleUpdateMemberRole = async (userId: string, role: TeamRole) => {
    if (!selectedTeam) return;
    
    try {
      await TeamService.updateTeamMember(selectedTeam.id, userId, { role });
      await loadTeamMembers(selectedTeam.id);
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw error;
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;
    
    try {
      await TeamService.removeTeamMember(selectedTeam.id, userId);
      await loadTeamMembers(selectedTeam.id);
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600">Manage your teams and collaborate with others</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Team</span>
        </button>
      </div>

      {!selectedTeam ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  stats={teamStats[team.id]}
                  onClick={setSelectedTeam}
                  onManageMembers={setSelectedTeam}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {teams.length === 0 ? 'No teams yet' : 'No teams found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {teams.length === 0 
                  ? 'Create your first team to start collaborating with others'
                  : 'Try adjusting your search criteria'
                }
              </p>
              {teams.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Team
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-blue-600 hover:text-blue-700"
              >
                ← Back to Teams
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedTeam.name}</h2>
                {selectedTeam.description && (
                  <p className="text-gray-600">{selectedTeam.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          <TeamMembersList
            members={teamMembers}
            currentUserRole={currentUserRole}
            teamId={selectedTeam.id}
            onInviteMember={handleInviteMember}
            onUpdateMemberRole={handleUpdateMemberRole}
            onRemoveMember={handleRemoveMember}
          />
        </div>
      )}

      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTeam}
        isLoading={isCreating}
      />
    </div>
  );
};

export default Teams;