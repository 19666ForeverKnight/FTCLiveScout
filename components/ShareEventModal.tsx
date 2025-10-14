'use client';

import { useState, useEffect } from 'react';
import { Event, shareEvent, unshareEvent, getEvent, UserRole, getUserRole, updateUserRole } from '@/lib/events';
import { createT } from '@/lib/simple-i18n';

const t = createT('components/ShareEventModal');

interface ShareEventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: t('Full access: manage event, share with others, edit/delete all data'),
  scouter: t('Can create and edit match/pit scouts'),
  driver: t('Can create and edit match/pit scouts'),
  engineer: t('Can create and edit match/pit scouts'),
  technician: t('Can create and edit match/pit scouts'),
  viewer: t('View only: cannot make any changes to data'),
};

const ROLE_ICONS: Record<UserRole, string> = {
  admin: '👑',
  scouter: '📊',
  driver: '🎮',
  engineer: '🔧',
  technician: '⚙️',
  viewer: '👁️',
};

export default function ShareEventModal({ event, isOpen, onClose, onUpdate }: ShareEventModalProps) {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('scouter');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentEvent, setCurrentEvent] = useState(event);
  const [editingRoleForUser, setEditingRoleForUser] = useState<string | null>(null);

  // Update currentEvent when event prop changes
  useEffect(() => {
    setCurrentEvent(event);
  }, [event]);

  if (!isOpen) return null;

  const refreshEventData = async () => {
    try {
      const updatedEvent = await getEvent(event.$id);
      setCurrentEvent(updatedEvent);
      onUpdate();
    } catch (err) {
      console.error('Failed to refresh event data:', err);
    }
  };

  const handleShare = async () => {
    if (!userId.trim() || !userName.trim()) {
      setError(t('Please enter both user ID and name'));
      return;
    }

    setIsSharing(true);
    setError('');
    setSuccess('');

    try {
      await shareEvent(event.$id, userId.trim(), userName.trim(), selectedRole);
      setSuccess(`${t('Event shared successfully with')} ${selectedRole} ${t('role')}!`);
      setUserId('');
      setUserName('');
      setSelectedRole('scouter');
      await refreshEventData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || t('Failed to share event'));
    } finally {
      setIsSharing(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    setError('');
    setSuccess('');

    try {
      await updateUserRole(event.$id, targetUserId, newRole);
      setSuccess(t('Role updated successfully!'));
      setEditingRoleForUser(null);
      await refreshEventData();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || t('Failed to update role'));
    }
  };

  const handleUnshare = async (targetUserId: string) => {
    setError('');
    setSuccess('');

    try {
      await unshareEvent(event.$id, targetUserId);
      setSuccess(t('Access removed successfully!'));
      await refreshEventData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || t('Failed to remove access'));
    }
  };

  const collaborators = currentEvent.sharedWith || [];
  const collaboratorNames = currentEvent.sharedWithNames || [];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-amber-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t('Share Event')}</h2>
              <p className="text-blue-50 mt-1">{currentEvent.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              title={t('Close')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Share Form */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('Share with User')}
            </label>
            <div className="space-y-3">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={t('Enter User ID')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={t('Enter User Name')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  {t('Select Role')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(ROLE_DESCRIPTIONS) as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${selectedRole === role
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{ROLE_ICONS[role]}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                          {role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {ROLE_DESCRIPTIONS[role]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full bg-gradient-to-r from-blue-600 to-amber-500 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSharing ? t('Sharing...') : `${t('Share Event as')} ${selectedRole}`}
              </button>
            </div>

            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>{t('Note')}:</strong> {t('To share an event, you need the other user\'s User ID. Users can find their ID in their profile page.')}
              </p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Collaborators List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t('Shared With')} ({collaborators.length})
            </h3>

            {collaborators.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm">{t('No collaborators yet')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((colabUserId, index) => {
                  const userRole = getUserRole(currentEvent, colabUserId) || 'scouter';
                  const isEditingRole = editingRoleForUser === colabUserId;

                  return (
                    <div
                      key={colabUserId}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {collaboratorNames[index]?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {collaboratorNames[index] || t('Unknown User')}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{colabUserId}</p>

                            {/* Role Display/Edit */}
                            {isEditingRole ? (
                              <div className="mt-2 grid grid-cols-3 gap-1">
                                {(Object.keys(ROLE_DESCRIPTIONS) as UserRole[]).map((role) => (
                                  <button
                                    key={role}
                                    onClick={() => handleRoleChange(colabUserId, role)}
                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${userRole === role
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                      }`}
                                  >
                                    {ROLE_ICONS[role]} {role}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingRoleForUser(colabUserId)}
                                className="mt-1 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                              >
                                <span>{ROLE_ICONS[userRole]}</span>
                                <span className="capitalize">{userRole}</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {isEditingRole && (
                            <button
                              onClick={() => setEditingRoleForUser(null)}
                              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                              title={t('Cancel')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleUnshare(colabUserId)}
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors text-sm font-medium"
                            title={t('Remove access')}
                          >
                            {t('Remove')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
