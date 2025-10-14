/**
 * a18n locale configuration
 * This file sets up the locale before a18n initializes
 */

// Read locale from localStorage if in browser
if (typeof window !== 'undefined') {
    const storedLocale = localStorage.getItem('ftc-live-scout-locale');
    if (storedLocale) {
        // Set as environment variable for a18n to pick up
        if (typeof process !== 'undefined') {
            process.env.A18N_LOCALE = storedLocale;
        }
    }
}
