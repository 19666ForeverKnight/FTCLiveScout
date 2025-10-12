'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { Navigation } from '@/components/Navigation';
import { EditEventModal } from '@/components/EditEventModal';
import ShareEventModal from '@/components/ShareEventModal';
import { getMatchScouts, getPitScouts, getRecentActivity, RecentActivity } from '@/lib/scouts';
import { canEditData, getUserRole } from '@/lib/events';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { currentEvent, refreshEvents } = useEvent();
  const router = useRouter();
  const [stats, setStats] = useState({ matches: 0, pits: 0, teams: 0 });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !currentEvent) {
      // Redirect to events page if no event is selected
      router.push('/events');
    }
  }, [user, loading, currentEvent, router]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load event data
  useEffect(() => {
    if (currentEvent?.$id) {
      loadEventData();
    } else {
      setStats({ matches: 0, pits: 0, teams: 0 });
      setRecentActivity([]);
    }
  }, [currentEvent?.$id]);

  const loadEventData = async () => {
    if (!currentEvent?.$id) return;

    try {
      setLoadingData(true);
      const [activity, matchScouts, pitScouts] = await Promise.all([
        getRecentActivity(currentEvent.$id, 10),
        getMatchScouts(currentEvent.$id),
        getPitScouts(currentEvent.$id),
      ]);

      setRecentActivity(activity);

      // Calculate unique teams
      const uniqueTeams = new Set([
        ...matchScouts.map(m => m.teamNumber),
        ...pitScouts.map(p => p.teamNumber),
      ]);

      setStats({
        matches: matchScouts.length,
        pits: pitScouts.length,
        teams: uniqueTeams.size,
      });
    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />

      {/* Main Content with proper padding for sidebar and bottom nav */}
      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Modern Event Header with Back Button */}
          <div className="mb-8">
            {/* Desktop Back Button - Sleek pill design */}
            <button
              onClick={() => router.push('/events')}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all duration-200 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Events
            </button>

            {/* Mobile Back Button - Floating top bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center px-4 py-3">
                <button
                  onClick={() => router.push('/events')}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="ml-3 flex-1 min-w-0">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {currentEvent?.name}
                  </h1>
                  {currentEvent?.location && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {currentEvent.location}
                    </p>
                  )}
                </div>
                {currentEvent?.userId === user?.$id && (
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors ml-2"
                    title="Share Event"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                )}
                {currentEvent && canEditData(currentEvent, user?.$id || '') && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-2"
                    title="Edit Event"
                  >
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Event Info Card - Desktop Only */}
            <div className="hidden lg:flex items-center gap-6 p-6 bg-gradient-to-br from-blue-50 via-amber-50 to-blue-50 dark:from-blue-950/30 dark:via-amber-950/30 dark:to-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-amber-600 rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg">
                📅
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {currentEvent?.name}
                </h1>
                {currentEvent?.location && (
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {currentEvent.location}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {currentEvent?.userId === user?.$id && (
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                    title="Share Event"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                )}
                {currentEvent && canEditData(currentEvent, user?.$id || '') && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                    title="Edit Event"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Mobile spacing for fixed header */}
            <div className="lg:hidden h-16"></div>

            {/* Current Time Display */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 lg:p-6 border border-gray-200 dark:border-gray-800 shadow-sm mt-0 lg:mt-6">
              {/* Mobile Layout - Compact */}
              <div className="flex lg:hidden items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-amber-600 rounded-lg flex items-center justify-center text-xl shadow-md flex-shrink-0">
                    🕐
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Current Time</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                      {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Date</p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Desktop Layout - Horizontal */}
              <div className="hidden lg:flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-amber-600 rounded-xl flex items-center justify-center text-2xl shadow-md">
                    🕐
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                      {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => router.push('/matches')}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Matches
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {loadingData ? '...' : stats.matches}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    View all matches →
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🏁
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/pits')}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pit Reports
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {loadingData ? '...' : stats.pits}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    View all pits →
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-amber-100 dark:from-blue-900/20 dark:to-amber-900/20 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🔧
                </div>
              </div>
            </button>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Teams Scouted
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {loadingData ? '...' : stats.teams}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 opacity-0">
                    Placeholder text
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-amber-100 dark:from-blue-900/20 dark:to-amber-900/20 rounded-lg flex items-center justify-center text-2xl">
                  🏆
                </div>
              </div>
            </div>
          </div>

          {/* Checklists Quick Access - Only for admin, driver, engineer, technician */}
          {currentEvent && user && (() => {
            const role = getUserRole(currentEvent, user.$id);
            return role && ['admin', 'driver', 'engineer', 'technician'].includes(role);
          })() && (
              <button
                onClick={() => router.push('/checklists')}
                className="w-full bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg shadow-md p-6 border border-orange-200 dark:border-orange-800 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200 text-left group mb-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                      ✅
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {(() => {
                          const role = getUserRole(currentEvent, user.$id);
                          return role === 'admin' ? 'Event Checklists' : 'My Checklist';
                        })()}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(() => {
                          const role = getUserRole(currentEvent, user.$id);
                          return role === 'admin'
                            ? 'Manage all role checklists'
                            : 'Manage your personal pre-match checklist';
                        })()}
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:translate-x-1 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            )}

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              {loadingData ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400">Loading activity...</div>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    📋
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {currentEvent ? 'No scouting records yet' : 'Select an event to view activity'}
                  </p>
                  {currentEvent && (
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Go to <span className="text-green-600 dark:text-green-400 font-semibold">Matches</span> or <span className="text-blue-600 dark:text-blue-400 font-semibold">Pits</span> and click the <span className="text-blue-600 dark:text-blue-400 font-semibold">+</span> button to create your first scout report
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${activity.type === 'match'
                          ? 'bg-blue-100 dark:bg-blue-900/20'
                          : 'bg-green-100 dark:bg-green-900/20'
                          }`}>
                          {activity.type === 'match' ? '🎯' : '🔧'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activity.type === 'match' ? 'Match Scout' : 'Pit Scout'} - Team {activity.teamNumber}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.matchNumber && `Match ${activity.matchNumber} • `}
                            {new Date(activity.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${activity.type === 'match'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        }`}>
                        {activity.type === 'match' ? 'Match' : 'Pit'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Event Modal */}
      {currentEvent && (
        <EditEventModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          eventId={currentEvent.$id}
          initialData={{
            name: currentEvent.name,
            location: currentEvent.location,
            startDate: currentEvent.startDate,
            endDate: currentEvent.endDate,
          }}
        />
      )}

      {/* Share Event Modal */}
      {currentEvent && (
        <ShareEventModal
          event={currentEvent}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onUpdate={refreshEvents}
        />
      )}
    </div>
  );
}
