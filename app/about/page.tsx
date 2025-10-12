'use client';

import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-amber-950/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo.png" alt="FTC Live Scout" className="w-20 h-20 rounded-3xl shadow-xl" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 dark:from-blue-400 dark:to-amber-400 bg-clip-text text-transparent mb-2">
            About FTC Live Scout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Version 1.0
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 p-8 space-y-8">

          {/* Mission Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              FTC Live Scout is designed to revolutionize the way teams scout and analyze FIRST Tech Challenge competitions.
              Our mission is to provide an intuitive, powerful, and accessible platform that helps teams make data-driven
              decisions and improve their competitive performance.
            </p>
          </section>

          {/* Features Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                <div className="text-3xl mb-3">🏁</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Match Scouting</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Collect real-time match data with our intuitive scouting interface. Track team performance,
                  scores, and key metrics during competitions.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800">
                <div className="text-3xl mb-3">🔧</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pit Scouting</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Document robot capabilities, team information, and strategic insights with comprehensive
                  pit scouting tools.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analytics</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Analyze team performance with advanced analytics and visualizations. Make informed
                  alliance selections and strategic decisions.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Team Collaboration</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Share events and data with your team members. Collaborate seamlessly during
                  competitions with real-time updates.
                </p>
              </div>
            </div>
          </section>

          {/* Technology Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Built With Modern Technology</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              FTC Live Scout is built using cutting-edge web technologies to ensure a fast, reliable,
              and responsive experience across all devices:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-2xl mb-2">⚛️</div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Next.js</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-2xl mb-2">📘</div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">TypeScript</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-2xl mb-2">🎨</div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Tailwind CSS</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-2xl mb-2">☁️</div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Appwrite</p>
              </div>
            </div>
          </section>

          {/* Created By Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Created By</h2>
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-amber-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-amber-900/20 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <img src="/FTC 19666 Logo.svg" alt="FTC Team 19666" className="w-32 h-32 md:w-40 md:h-40" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    FTC Team 19666 - Forever Knight Robotics
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    FTC Live Scout was created by Team 19666, Forever Knight Robotics. As an active FTC team,
                    we understand the challenges of scouting and data collection during competitions. We built
                    this platform to help teams like ours make better strategic decisions and improve their
                    competitive performance.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Our mission is to give back to the FTC community by providing free, powerful tools that
                    level the playing field and help all teams succeed, regardless of their resources.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* About FTC Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About FIRST Tech Challenge</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              FIRST Tech Challenge (FTC) is a robotics competition for students in grades 7-12. Teams design, build,
              program, and operate robots to compete in a head-to-head challenge in an alliance format. FTC combines
              the excitement of sport with the rigors of science and technology, inspiring young people to become
              science and technology leaders.
            </p>
          </section>

          {/* Contact & Support Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Support & Feedback</h2>
            <div className="bg-gradient-to-r from-blue-50 to-amber-50 dark:from-blue-900/20 dark:to-amber-900/20 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We're constantly working to improve FTC Live Scout and welcome your feedback. If you encounter
                any issues, have suggestions for new features, or need assistance, please don't hesitate to reach out.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/19666ForeverKnight/FTCLiveScout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  View on GitHub
                </a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p className="mb-2">© 2025 FTC Live Scout. All rights reserved.</p>
              <p className="mb-3">
                Made with ❤️ for the FIRST Tech Challenge community
              </p>
              <div className="flex items-center justify-center gap-2 text-xs">
                <img src="/FTC 19666 Logo.svg" alt="FTC Team 19666" className="w-6 h-6" />
                <span>Created by FTC Team 19666 - Forever Knight Robotics</span>
              </div>
            </div>
          </section>
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
