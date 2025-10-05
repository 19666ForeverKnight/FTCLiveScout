'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEvent } from '@/context/EventContext';

export function Navigation() {
  const pathname = usePathname();
  const { currentEvent } = useEvent();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-50">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/events" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">FTC Live Scout</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {currentEvent && (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl mr-3">🏠</span>
                  Dashboard
                </Link>
                <Link
                  href="/matches"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive('/matches')
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl mr-3">🏁</span>
                  Matches
                </Link>
                <Link
                  href="/pits"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive('/pits')
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl mr-3">🔧</span>
                  Pits
                </Link>
              </>
            )}
          </nav>

          {/* Version Number */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              FTC Live Scout v1.0
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      {currentEvent && (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-bottom">
          <div className="flex justify-around items-center h-16">
            <Link
              href="/dashboard"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation ${
                isActive('/dashboard')
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="text-2xl mb-1">🏠</span>
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link
              href="/matches"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation ${
                isActive('/matches')
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="text-2xl mb-1">🏁</span>
              <span className="text-xs font-medium">Matches</span>
            </Link>
            <Link
              href="/pits"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation ${
                isActive('/pits')
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="text-2xl mb-1">🔧</span>
              <span className="text-xs font-medium">Pits</span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
