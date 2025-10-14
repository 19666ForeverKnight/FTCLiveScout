'use client';

import { createT } from '@/lib/simple-i18n';
const t = createT('pits/page')
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEvent } from '@/context/EventContext';
import { Navigation } from '@/components/Navigation';
import { getPitScouts, PitScout } from '@/lib/scouts';
import { canEditData } from '@/lib/events';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function PitsPage() {
  const { user, loading } = useRequireAuth();
  const { currentEvent } = useEvent();
  const router = useRouter();
  const [pits, setPits] = useState<PitScout[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && user && !currentEvent) {
      router.push('/events');
    }
  }, [user, loading, currentEvent, router]);

  useEffect(() => {
    if (currentEvent?.$id) {
      loadPits();
    }
  }, [currentEvent?.$id]);

  const loadPits = async () => {
    if (!currentEvent?.$id) return;

    try {
      setLoadingData(true);
      const data = await getPitScouts(currentEvent.$id);
      setPits(data);
    } catch (error) {
      console.error(t('Error loading pit scouts:'), error);
    } finally {
      setLoadingData(false);
    }
  };

  const filteredPits = pits.filter(pit => {
    const query = searchQuery.toLowerCase();
    return (
      pit.teamNumber.toLowerCase().includes(query) ||
      (pit.teamName?.toLowerCase().includes(query) || false) ||
      (pit.drivetrainType?.toLowerCase().includes(query) || false)
    );
  });

  if (loading || !user) {
    return (
      (<div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('Loading...')}</div>
      </div>)
    );
  }

  return (
    (<div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
              {t('Dashboard')}
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
                    {t('Pit Scouts')}
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {pits.length} {pits.length === 1 ? 'record' : 'records'}
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Title */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-amber-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
                  🔧
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t('Pit Scouts')}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {pits.length} {pits.length === 1 ? 'record' : 'records'} from {currentEvent?.name}
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
                placeholder={t('Search by team, name, or drivetrain...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Pits List */}
          {loadingData ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">{t('Loading pit scouts...')}</p>
            </div>
          ) : filteredPits.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔧</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? t('No pit scouts found') : t('No pit scouts yet')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery ? t('Try a different search term') : t('Click the + button to add your first pit scout')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPits.map((pit) => (
                <div
                  key={pit.$id}
                  onClick={() => router.push(`/pit-scout?id=${pit.$id}`)}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                        {pit.pitNumber ? (
                          <div className="text-center">
                            <div className="text-xs opacity-75">{t('Pit')}</div>
                            <div className="text-lg leading-none">{pit.pitNumber}</div>
                          </div>
                        ) : (
                          <div className="text-lg">{pit.teamNumber}</div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {t('Team')} {pit.teamNumber}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {pit.teamName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <span className="text-lg">⚙️</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('Drivetrain')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{pit.drivetrainType}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <span className="text-lg">💻</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('Programming')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{pit.programmingLanguage}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <span className="text-lg">⚖️</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('Weight')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{pit.robotWeight} lbs</p>
                      </div>
                    </div>
                  </div>

                  {(pit.strengths || pit.weaknesses) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                      {pit.strengths && (
                        <div>
                          <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">{t('💪 Strengths')}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{pit.strengths}</p>
                        </div>
                      )}
                      {pit.weaknesses && (
                        <div>
                          <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">{t('⚠️ Weaknesses')}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{pit.weaknesses}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Last Edited Info */}
                  {(pit.lastEditedByName || pit.createdByName) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {pit.lastEditedByName ? (
                          <>
                            <span className="font-medium">{t('Last edited by:')}</span> {pit.lastEditedByName}
                            {pit.lastEditedAt && (
                              <span className="ml-2">
                                {new Date(pit.lastEditedAt).toLocaleString()}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="font-medium">{t('Created by:')}</span> {pit.createdByName}
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {/* Floating Add Button - Only show if user can edit */}
      {currentEvent && canEditData(currentEvent, user.$id) && (
        <button
          onClick={() => router.push('/pit-scout')}
          className="fixed bottom-24 lg:bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 z-50 group"
        >
          <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>)
  );
}
