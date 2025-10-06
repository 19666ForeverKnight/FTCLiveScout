'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { CreateEventModal } from '@/components/CreateEventModal';
import ShareEventModal from '@/components/ShareEventModal';
import type { Event } from '@/lib/events';

export default function EventsPage() {
  const { user, loading, logout } = useAuth();
  const { events, currentEvent, setCurrentEvent, refreshEvents } = useEvent();
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [shareEventModal, setShareEventModal] = useState<Event | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleEventClick = (eventId: string) => {
    const event = events.find(e => e.$id === eventId);
    if (event) {
      setCurrentEvent(event);
      router.push('/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getUserInitial = () => {
    return user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-amber-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-amber-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header with Profile */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="relative group">
                <div className="absolute bg-gradient-to-r from-blue-600 to-amber-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <img 
                  src="/logo.png" 
                  alt="FTC Live Scout" 
                  className="relative h-12 w-auto sm:h-15 rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
            </div>

            {/* Profile Section */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-amber-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                  {getUserInitial()}
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">{user.name || 'User'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push('/profile');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Account Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Events
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select an event to start scouting, or create a new one
          </p>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-amber-100 dark:from-blue-900/20 dark:to-amber-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No events yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first event to start scouting</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {events.map((event) => (
                <div
                  key={event.$id}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 overflow-hidden"
                >
                  {/* Active Badge */}
                  {currentEvent?.$id === event.$id && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                        Active
                      </span>
                    </div>
                  )}

                  {/* Share Button - Only for event owner */}
                  {event.userId === user?.$id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareEventModal(event);
                      }}
                      className="absolute top-4 right-20 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      title="Share event"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  )}

                  {/* Clickable area */}
                  <button
                    onClick={() => handleEventClick(event.$id)}
                    className="w-full text-left"
                  >
                    {/* Event Icon */}
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-amber-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform">
                      📅
                    </div>

                    {/* Event Info */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mb-3">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </div>

                    {/* Collaborators Badge */}
                    {event.sharedWith && event.sharedWith.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mt-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Shared with {event.sharedWith.length} {event.sharedWith.length === 1 ? 'person' : 'people'}</span>
                      </div>
                    )}

                    {/* Shared Event Indicator */}
                    {event.userId !== user?.$id && (
                      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mt-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Shared event</span>
                      </div>
                    )}

                    {/* Hover Arrow */}
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </button>
                </div>
              ))}
              
              {/* Create New Event Card */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="group relative bg-gradient-to-br from-blue-50 to-amber-50 dark:from-blue-950/30 dark:to-amber-950/30 rounded-2xl p-6 shadow-md hover:shadow-2xl border-2 border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 overflow-hidden flex flex-col items-center justify-center text-center min-h-[200px]"
              >
                {/* Plus Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-amber-600 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300 shadow-lg">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>

                {/* Card Info */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Create New Event
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add a new competition or tournament
                </p>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Share Event Modal */}
      {shareEventModal && (
        <ShareEventModal
          event={shareEventModal}
          isOpen={true}
          onClose={() => setShareEventModal(null)}
          onUpdate={refreshEvents}
        />
      )}
    </div>
  );
}
