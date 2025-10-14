'use client';

import { createT } from '@/lib/simple-i18n';
const t = createT('app/page')
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to events page
  useEffect(() => {
    if (!loading && user) {
      router.push('/events');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-amber-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('Loading...')}</div>
      </div>)
    );
  }

  return (
    (<div className="min-h-screen bg-gradient-to-br from-blue-50 via-amber-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Navigation Bar */}
        <nav className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt={t('FTC Live Scout')} width={48} height={48} className="rounded-xl shadow-lg" priority />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 dark:from-blue-400 dark:to-amber-400 bg-clip-text text-transparent">
                  {t('FTC Live Scout')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <Link
                  href="/login"
                  className="px-6 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold transition-all"
                >
                  {t('Sign In')}
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {t('Get Started')}
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {t('Elevate Your')} <span className="bg-gradient-to-r from-blue-600 to-amber-600 dark:from-blue-400 dark:to-amber-400 bg-clip-text text-transparent">{t('FTC Scouting')}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t(
                'The ultimate live scouting platform for FIRST Tech Challenge teams.\n              Collect data, analyze performance, and make winning alliance selections.'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white text-lg font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('Start Scouting Free')}
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 text-gray-900 dark:text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('Learn More')}
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('Everything You Need to Scout')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('Powerful features designed specifically for FTC competitions')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg">
                🏁
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('Match Scouting')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t(
                  'Real-time match data collection with intuitive forms and instant insights.'
                )}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg">
                🔧
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('Pit Scouting')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('Document robot capabilities and gather strategic intel from the pits.')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg">
                📊
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('Advanced Analytics')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('Analyze performance trends and make data-driven alliance selections.')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg">
                🤝
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('Team Collaboration')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('Share events and collaborate with your team in real-time.')}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* DECODE Season Banner */}
      <div className="py-16 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {t('Ready for DECODE Season 2025-2026')}
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {t(
                'FTC Live Scout is fully prepared for the DECODE presented by RTX challenge!'
              )}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-2 shadow-2xl">
              <Image
                src="/ftc_decode_1240x860.png"
                alt={t('FTC DECODE Season 2024-2025')}
                width={1240}
                height={860}
                className="w-full h-auto rounded-2xl shadow-xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Benefits Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {t('Why Choose FTC Live Scout?')}
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('Lightning Fast')}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{t('Built with modern web technology for instant data access and updates.')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('Mobile Friendly')}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{t('Scout from any device - phones, tablets, or laptops.')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('Secure & Reliable')}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{t('Your data is protected with enterprise-grade security.')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-amber-500 rounded-3xl p-1 shadow-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8">
                  <div className="aspect-square flex items-center justify-center">
                    <Image src="/logo.png" alt={t('FTC Live Scout')} width={256} height={256} className="rounded-3xl shadow-2xl" loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-amber-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            {t('Ready to Transform Your Scouting?')}
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            {t('Join teams already using FTC Live Scout to gain a competitive edge.')}
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 text-xl font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {t('Create Free Account')}
          </Link>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt={t('FTC Live Scout')} width={40} height={40} className="rounded-lg" loading="lazy" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">{t('FTC Live Scout')}</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('About')}</Link>
              <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('Terms')}</Link>
              <a href="https://github.com/19666ForeverKnight/FTCLiveScout" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">GitHub</a>
            </div>

            {/* Team 19666 Credit */}
            <div className="flex flex-col items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 w-full max-w-md">
              <div className="flex items-center gap-3">
                <Image src={t('/FTC 19666 Logo.svg')} alt={t('FTC Team 19666')} width={48} height={48} loading="lazy" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('Created by FTC Team 19666')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {t('Forever Knight Robotics')}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('© 2025 FTC Live Scout. Made with ❤️ for FTC')}
            </p>
          </div>
        </div>
      </footer>
    </div>)
  );
}
