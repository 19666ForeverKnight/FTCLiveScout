import { getA18n } from 'a18n';

/**
 * Get a18n instance for a specific module
 * This should be called at render time, not at module load time
 */
export function useA18n(moduleName: string) {
    return getA18n('ftclivescout', moduleName);
}

/**
 * Translate function that can be used in components
 * Gets the a18n instance fresh each time to pick up locale changes
 */
export function createA18n(moduleName: string) {
    return function translate(text: string | TemplateStringsArray, ...values: any[]): string {
        const a18n = getA18n('ftclivescout', moduleName);
        if (typeof text === 'string') {
            return a18n(text);
        } else {
            return a18n(text, ...values);
        }
    };
}
