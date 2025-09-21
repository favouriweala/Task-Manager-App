import React from 'react';
import { Users, Settings, UserPlus, MoreVertical, Calendar } from 'lucide-react';
import Image from 'next/image';
import type { Team, TeamStats } from '../../types/team';

interface TeamCardProps {
  team: Team;
  stats?: TeamStats;
  onEdit?: (team: Team) => void;
  onManageMembers?: (team: Team) => void;
  onClick?: (team: Team) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  stats,
  onEdit,
  onManageMembers,
  onClick
}) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(team);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {team.avatar_url ? (
            <Image
              src={team.avatar_url}
              alt={team.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
            {team.description && (
              <p className="text-sm text-gray-600 mt-1">{team.description}</p>
            )}
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {/* Dropdown menu would go here */}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total_members}</div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total_projects}</div>
            <div className="text-xs text-gray-500">Projects</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {team.settings.is_public && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Public
            </span>
          )}
        </div>
      </div>

      <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
        {onManageMembers && (
          <button
            onClick={(e) => handleActionClick(e, () => onManageMembers(team))}
            className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
          >
            <Users className="w-4 h-4" />
            <span>Members</span>
          </button>
        )}
        
        {onEdit && (
          <button
            onClick={(e) => handleActionClick(e, () => onEdit(team))}
            className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center space-x-1"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        )}
      </div>
    </div>
  );
};