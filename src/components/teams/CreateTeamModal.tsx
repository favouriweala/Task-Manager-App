import React, { useState } from 'react';
import { X, Users, Lock, Globe, UserPlus } from 'lucide-react';
import type { CreateTeamRequest, TeamSettings } from '../../types/team';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTeamRequest) => Promise<void>;
  isLoading?: boolean;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    settings: {
      is_public: false,
      allow_member_invites: true,
      default_project_visibility: 'team' as const,
      require_approval_for_join: false
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        settings: formData.settings
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        settings: {
          is_public: false,
          allow_member_invites: true,
          default_project_visibility: 'team',
          require_approval_for_join: false
        }
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to create team:', error);
      setErrors({ submit: 'Failed to create team. Please try again.' });
    }
  };

  const updateSettings = (key: keyof TeamSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Team</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Team Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter team name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your team's purpose (optional)"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Team Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.settings.is_public}
                  onChange={(e) => updateSettings('is_public', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Make team public</span>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.settings.allow_member_invites}
                  onChange={(e) => updateSettings('allow_member_invites', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Allow members to invite others</span>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.settings.require_approval_for_join}
                  onChange={(e) => updateSettings('require_approval_for_join', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Require approval to join</span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Project Visibility
              </label>
              <select
                value={formData.settings.default_project_visibility}
                onChange={(e) => updateSettings('default_project_visibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="private">Private</option>
                <option value="team">Team</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Create Team</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};