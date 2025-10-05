'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getUserInitial = () => {
    return user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  };

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: '🏠', mobileLabel: 'Home' },
    { name: 'Profile', href: '/profile', icon: 'avatar', mobileLabel: 'Profile' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-50">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">FTC Scout</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                isActive('/dashboard')
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-xl mr-3">🏠</span>
              Home
            </Link>
          </nav>

          {/* User Profile Section at Bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800">
            {/* Expandable Profile Menu */}
            <div className={`transition-all duration-300 ease-in-out ${
              isProfileOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            }`}>
              <div className="px-3 py-3">
                <Link
                  href="/profile"
                  className="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 rounded-lg transition-all duration-200"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <span className="group-hover:translate-x-0.5 transition-transform duration-200">Account Settings</span>
                </Link>
              </div>
            </div>

            {/* Profile Toggle Button */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="group w-full px-4 py-3.5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 dark:hover:from-gray-800 dark:hover:to-slate-800 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                      {getUserInitial()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  </div>
                  <div className="ml-3 overflow-hidden flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <svg
                    className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all duration-300 ${
                      isProfileOpen ? '' : 'rotate-180'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {/* Version Number */}
            <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              FTC Live Scout v1.0
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-bottom">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation ${
                isActive(item.href)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {item.icon === 'avatar' ? (
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1 ${
                  isActive(item.href) ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'
                }`}>
                  {getUserInitial()}
                </div>
              ) : (
                <span className="text-2xl mb-1">{item.icon}</span>
              )}
              <span className="text-xs font-medium">{item.mobileLabel}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
