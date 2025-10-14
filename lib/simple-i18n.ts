import enLocale from '../locales/en.json';
import zhCNLocale from '../locales/zh-CN.json';

export type SupportedLocale = 'en' | 'zh-CN';

const LOCALE_STORAGE_KEY = 'ftc-live-scout-locale';

// Locale resources
const localeResources: Record<SupportedLocale, any> = {
    'en': enLocale,
    'zh-CN': zhCNLocale,
};

// Current locale
let currentLocale: SupportedLocale = 'en';

// Initialize from localStorage
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'zh-CN') {
        currentLocale = 'zh-CN';
    }
}

/**
 * Get the current locale
 */
export function getCurrentLocale(): SupportedLocale {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
        if (stored === 'en' || stored === 'zh-CN') {
            currentLocale = stored;
            return stored;
        }
    }
    return currentLocale;
}

/**
 * Set the current locale
 */
export function setLocale(locale: SupportedLocale): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    currentLocale = locale;
    window.location.reload();
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

/**
 * Translate a text
 */
export function t(moduleName: string, text: string): string {
    const locale = getCurrentLocale();

    // For English, return the original text
    if (locale === 'en') {
        return text;
    }

    // Get the module resources
    const moduleResources = localeResources[locale]?.[moduleName];
    if (!moduleResources) {
        return text;
    }

    // Get the translation
    const translation = moduleResources[text];
    if (translation === null || translation === undefined) {
        return text;
    }

    return translation;
}

/**
 * Create a translation function for a specific module
 */
export function createT(moduleName: string) {
    return (text: string) => t(moduleName, text);
}
