'use client';

import { useEffect, useState } from 'react';
import { initializeLocale } from '@/lib/i18n';

/**
 * Client component that initializes the locale on mount and forces re-render
 */
export default function LocaleInitializer({ children }: { children?: React.ReactNode }) {
    const [isLocaleLoaded, setIsLocaleLoaded] = useState(false);

    useEffect(() => {
        // Initialize locale before first render (synchronous)
        const loadedLocale = initializeLocale();
        console.log('LocaleInitializer: Locale initialized to:', loadedLocale);
        setIsLocaleLoaded(true);
    }, []);

    // Don't render children until locale is loaded
    // This prevents a18n from being called before translations are ready
    if (!isLocaleLoaded) {
        // Return null on first render to avoid hydration mismatch
        // The page will appear blank for a moment but this is necessary
        return null;
    }

    return <>{children}</>;
}
