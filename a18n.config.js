module.exports = {
  namespace: 'ftclivescout',
  defaultLocale: 'en',
  // Read locale from localStorage if available
  locale: typeof window !== 'undefined' 
    ? (localStorage.getItem('ftc-live-scout-locale') || 'en')
    : (process.env.A18N_LOCALE || 'en'),
  locales: ['en', 'zh-CN'],
  localesDirPath: './locales',
  localeKeys: [
    'app/layout',
    'app/page',
    'about/page',
    'analytics/page',
    'checklists/page',
    'dashboard/page',
    'events/page',
    'login/page',
    'match-scout/page',
    'matches/page',
    'pit-scout/page',
    'pits/page',
    'profile/page',
    'signup/page',
    'terms/page',
    'user-agreement/page',
  ],
  // Enable automatic key extraction
  extractKeyMode: 'auto',
  // Output format for locale files
  formatLocaleFile: true,
};
