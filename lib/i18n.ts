import { getA18n } from 'a18n';

export type SupportedLocale = 'en' | 'zh-CN';

const LOCALE_STORAGE_KEY = 'ftc-live-scout-locale';

// Import locale resources statically
import zhCN from '../locales/zh-CN.json';

// Get a18n instance
const a18nInstance = getA18n('ftclivescout');

// CRITICAL: Load locale resources IMMEDIATELY when this module loads
// This MUST happen before any component calls getA18n()
function initializeA18nResources() {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    const locale = (stored === 'zh-CN') ? 'zh-CN' : 'en';

    console.log('[i18n] Initializing resources, locale:', locale);

    if (locale === 'zh-CN') {
        // Add resources FIRST for all modules
        Object.keys(zhCN).forEach((moduleName) => {
            const moduleA18n = getA18n('ftclivescout', moduleName);
            moduleA18n.addLocaleResource('zh-CN', (zhCN as any)[moduleName]);
            console.log(`[i18n] Added zh-CN resources for module: ${moduleName}`);
        });

        // THEN set locale for all modules
        Object.keys(zhCN).forEach((moduleName) => {
            const moduleA18n = getA18n('ftclivescout', moduleName);
            moduleA18n.setLocale('zh-CN');
        });

        // Also set base locale
        a18nInstance.setLocale('zh-CN');

        console.log('[i18n] Initialization complete, locale set to zh-CN');
    }
}

// Run initialization immediately
initializeA18nResources();

// Load locale resources
function loadLocaleResources(locale: SupportedLocale) {
    if (locale === 'en') {
        // English is the default, no need to load
        return;
    }

    let resources: any = null;

    if (locale === 'zh-CN') {
        resources = zhCN;
    }

    if (!resources) {
        console.error(`No resources found for locale: ${locale}`);
        return;
    }

    console.log('Loading locale resources for', locale);

    // Add resources for each module
    Object.keys(resources).forEach((moduleName) => {
        const moduleA18n = getA18n('ftclivescout', moduleName);

        // First add the locale resource
        moduleA18n.addLocaleResource(locale, resources[moduleName]);

        // Then set the locale
        moduleA18n.setLocale(locale);
    });

    // Also set the locale for the base instance
    a18nInstance.setLocale(locale);

    console.log('Locale setup complete for', locale);
}

/**
 * Get the current locale from localStorage or default to 'en'
 */
export function getCurrentLocale(): SupportedLocale {
    if (typeof window === 'undefined') {
        return 'en';
    }

    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'en' || stored === 'zh-CN') {
        return stored;
    }

    return 'en';
}

/**
 * Set the current locale and persist to localStorage
 * Updates a18n locale and reloads the page
 */
export function setLocale(locale: SupportedLocale): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem(LOCALE_STORAGE_KEY, locale);

    // Reload page to apply new locale across all components
    window.location.reload();
}

/**
 * Initialize locale on app start
 * This should be called early in the app lifecycle
 */
export function initializeLocale(): SupportedLocale {
    if (typeof window === 'undefined') {
        return 'en';
    }

    const locale = getCurrentLocale();
    console.log('Initializing locale:', locale);

    // Load locale resources (synchronous now)
    loadLocaleResources(locale);

    // Set the locale
    a18nInstance.setLocale(locale);

    console.log('Current a18n locale:', a18nInstance.getLocale());

    return locale;
}

/**
 * Get display name for a locale
 */
export function getLocaleName(locale: SupportedLocale): string {
    const names: Record<SupportedLocale, string> = {
        'en': 'English',
        'zh-CN': '简体中文',
    };
    return names[locale];
}
