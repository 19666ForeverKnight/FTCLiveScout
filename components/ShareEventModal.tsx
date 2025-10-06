'use client';

import { useState, useEffect } from 'react';
import { Event, shareEvent, unshareEvent, getEvent } from '@/lib/events';

interface ShareEventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ShareEventModal({ event, isOpen, onClose, onUpdate }: ShareEventModalProps) {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentEvent, setCurrentEvent] = useState(event);

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
      setError('Please enter both user ID and name');
      return;
    }

    setIsSharing(true);
    setError('');
    setSuccess('');

    try {
      await shareEvent(event.$id, userId.trim(), userName.trim());
      setSuccess('Event shared successfully!');
      setUserId('');
      setUserName('');
      await refreshEventData();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to share event');
    } finally {
      setIsSharing(false);
    }
  };

  const handleUnshare = async (targetUserId: string) => {
    setError('');
    setSuccess('');

    try {
      await unshareEvent(event.$id, targetUserId);
      setSuccess('Access removed successfully!');
      await refreshEventData();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove access');
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
              <h2 className="text-2xl font-bold">Share Event</h2>
              <p className="text-blue-50 mt-1">{currentEvent.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              title="Close"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Share with User
            </label>
            <div className="space-y-3">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter User Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full bg-gradient-to-r from-blue-600 to-amber-500 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSharing ? 'Sharing...' : 'Share Event'}
              </button>
            </div>

            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> To share an event, you need the other user's User ID. 
                Users can find their ID in their profile page.
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
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Shared With ({collaborators.length})
            </h3>
            
            {collaborators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm">No collaborators yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((colabUserId, index) => (
                  <div
                    key={colabUserId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                        {collaboratorNames[index]?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {collaboratorNames[index] || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">{colabUserId}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnshare(colabUserId)}
                      className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
