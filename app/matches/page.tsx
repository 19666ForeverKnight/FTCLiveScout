'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { Navigation } from '@/components/Navigation';
import { getMatchScouts } from '@/lib/scouts';

interface MatchScout {
  $id: string;
  teamNumber: number;
  matchNumber: number;
  alliance: 'red' | 'blue';
  autoScore: number;
  teleopScore: number;
  endgameScore: number;
  fouls: number;
  defense: number;
  notes: string;
  $createdAt: string;
}

export default function MatchesPage() {
  const { user, loading } = useAuth();
  const { currentEvent } = useEvent();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchScout[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !currentEvent) {
      router.push('/events');
    }
  }, [user, loading, currentEvent, router]);

  useEffect(() => {
    if (currentEvent?.$id) {
      loadMatches();
    }
  }, [currentEvent?.$id]);

  const loadMatches = async () => {
    if (!currentEvent?.$id) return;

    try {
      setLoadingData(true);
      const data = await getMatchScouts(currentEvent.$id);
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const filteredMatches = matches.filter(match => {
    const query = searchQuery.toLowerCase();
    return (
      match.teamNumber.toString().includes(query) ||
      match.matchNumber.toString().includes(query) ||
      match.alliance.toLowerCase().includes(query)
    );
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />

      {/* Main Content */}
      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            {/* Desktop Back Button */}
            <button
              onClick={() => router.push('/dashboard')}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all duration-200 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </button>

            {/* Mobile Header Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center px-4 py-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="ml-3 flex-1">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Match Scouts
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {matches.length} {matches.length === 1 ? 'record' : 'records'}
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Title */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
                  🏁
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Match Scouts
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {matches.length} {matches.length === 1 ? 'record' : 'records'} from {currentEvent?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile spacing for fixed header */}
            <div className="lg:hidden h-20"></div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by team, match, or alliance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Matches List */}
          {loadingData ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading matches...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏁</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No matches found' : 'No match scouts yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery ? 'Try a different search term' : 'Click the + button to add your first match scout'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMatches.map((match) => (
                <div
                  key={match.$id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                  onClick={() => router.push(`/match-scout?id=${match.$id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${
                        match.alliance === 'red' 
                          ? 'bg-gradient-to-br from-red-500 to-rose-600' 
                          : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      }`}>
                        {match.teamNumber}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Team {match.teamNumber}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Match {match.matchNumber} • {match.alliance === 'red' ? 'Red' : 'Blue'} Alliance
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {match.autoScore + match.teleopScore + match.endgameScore}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Points</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Auto</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{match.autoScore}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Teleop</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{match.teleopScore}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Endgame</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{match.endgameScore}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{match.fouls} Fouls</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🛡️</span>
                      <span>Defense: {match.defense}/5</span>
                    </div>
                  </div>

                  {match.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {match.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => router.push('/match-scout')}
        className="fixed bottom-24 lg:bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 z-50 group"
      >
        <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
