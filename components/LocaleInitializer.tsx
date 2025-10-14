'use client';

import { useEffect } from 'react';
import { initializeLocale } from '@/lib/i18n';

/**
 * Client component that initializes the locale on mount
 * Should be included in the root layout
 */
export default function LocaleInitializer({ children }: { children?: React.ReactNode }) {
    useEffect(() => {
        // Initialize locale synchronously on mount
        const locale = initializeLocale();
        console.log('LocaleInitializer: Locale initialized to:', locale);
    }, []);

    // Always render children immediately to avoid hydration mismatch
    return <>{children}</>;
}
