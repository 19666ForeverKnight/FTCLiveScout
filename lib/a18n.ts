// Import the i18n setup to ensure locale is configured before getA18n is called
import '@/lib/i18n';

// Re-export everything from a18n
export * from 'a18n';
export { getA18n } from 'a18n';
