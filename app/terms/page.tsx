'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-amber-950/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <img src="/logo.png" alt="FTC Live Scout" className="w-20 h-20 rounded-3xl shadow-xl" />
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 dark:from-blue-400 dark:to-amber-400 bg-clip-text text-transparent mb-2">
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            FTC Live Scout User Agreement
          </p>
        </div>

        {/* Agreement Content */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 p-8 mb-6">
          <div className="prose dark:prose-invert max-w-none">
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
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

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
