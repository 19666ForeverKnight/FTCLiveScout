'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navigation } from '@/components/Navigation';
import { FloatingAddButton } from '@/components/FloatingAddButton';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user.name || 'Scout'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View your recent scouting activity and stats.
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Matches
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    0
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-2xl">
                  🎯
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pit Reports
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    0
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-2xl">
                  🔧
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Teams Scouted
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    0
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center text-2xl">
                  🏆
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  📋
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No scouting records yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Click the <span className="text-blue-600 dark:text-blue-400 font-semibold">+</span> button to create your first scout report
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingAddButton />
    </div>
  );
}
