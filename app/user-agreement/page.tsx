'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function UserAgreementPage() {
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-amber-950/20">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleAccept = () => {
    if (accepted) {
      // Store acceptance in localStorage or user preferences
      localStorage.setItem('userAgreementAccepted', 'true');
      router.push('/events');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-amber-950/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo.png" alt="FTC Live Scout" className="w-20 h-20 rounded-3xl shadow-xl" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 dark:from-blue-400 dark:to-amber-400 bg-clip-text text-transparent mb-2">
            User Agreement
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please review and accept our terms to continue
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            <a href="/terms" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">
              View full terms in a new tab
            </a>
          </p>
        </div>

        {/* Agreement Content */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 p-8 mb-6">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h2>
            
            <div className="space-y-6 text-gray-700 dark:text-gray-300 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">1. Acceptance of Terms</h3>
                <p>
                  By accessing and using FTC Live Scout, you accept and agree to be bound by the terms and provisions of this agreement. 
                  If you do not agree to these terms, please do not use this service.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">2. Description of Service</h3>
                <p>
                  FTC Live Scout is a scouting application designed for FIRST Tech Challenge (FTC) competitions. 
                  The service allows users to create events, scout matches, collect pit data, and analyze team performance.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">3. User Accounts</h3>
                <p>
                  You are responsible for maintaining the confidentiality of your account and password. 
                  You agree to accept responsibility for all activities that occur under your account.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for keeping your password secure</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">4. Data Collection and Privacy</h3>
                <p>
                  We collect and store data necessary for the operation of the service, including:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>User account information (name, email)</li>
                  <li>Event data created by users</li>
                  <li>Scouting data and analytics</li>
                  <li>Usage statistics</li>
                </ul>
                <p className="mt-2">
                  Your data is stored securely and will not be shared with third parties without your consent, 
                  except as required by law.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">5. User Conduct</h3>
                <p>
                  You agree to use FTC Live Scout only for lawful purposes and in accordance with these terms. You agree not to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Use the service in any way that violates any applicable laws or regulations</li>
                  <li>Impersonate or attempt to impersonate another user</li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Attempt to gain unauthorized access to any portion of the service</li>
                  <li>Upload malicious code or harmful content</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">6. Intellectual Property</h3>
                <p>
                  The service and its original content, features, and functionality are owned by FTC Live Scout 
                  and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">7. Data Ownership</h3>
                <p>
                  You retain ownership of all data you create using FTC Live Scout. By using the service, 
                  you grant us a license to use, store, and display your data solely for the purpose of providing 
                  and improving the service.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">8. Service Availability</h3>
                <p>
                  We strive to provide reliable service but do not guarantee that the service will be uninterrupted 
                  or error-free. We reserve the right to modify or discontinue the service at any time without notice.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">9. Limitation of Liability</h3>
                <p>
                  FTC Live Scout is provided "as is" without warranties of any kind. We shall not be liable for any 
                  indirect, incidental, special, consequential, or punitive damages resulting from your use of or 
                  inability to use the service.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">10. Changes to Terms</h3>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any material changes 
                  by posting the new terms on this page. Your continued use of the service after such modifications 
                  constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">11. Termination</h3>
                <p>
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason, 
                  including if you breach these terms. Upon termination, your right to use the service will cease immediately.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">12. Contact Information</h3>
                <p>
                  If you have any questions about these Terms, please contact us through the app's support channels.
                </p>
              </section>

              <section className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: October 7, 2025
                </p>
              </section>
            </div>
          </div>
        </div>

        {/* Accept Section */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center h-6">
              <input
                id="accept-terms"
                name="accept-terms"
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />
            </div>
            <label htmlFor="accept-terms" className="flex-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              I have read and agree to the Terms of Service and understand how my data will be used in FTC Live Scout.
            </label>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => router.push('/login')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all duration-200"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={!accepted}
              className="flex-1 bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
