import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../resources/js/i18n/locales/en.json';

// Initialize i18next for testing
i18n
    .use(initReactI18next)
    .init({
        lng: 'en',
        fallbackLng: 'en',
        ns: ['translation'],
        defaultNS: 'translation',
        resources: {
            en: {
                translation: enTranslations,
            },
        },
        interpolation: {
            escapeValue: false, // not needed for react!!
        },
    });

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock IntersectionObserver
const IntersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
}));

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// Cleanup after each test
afterEach(() => {
    cleanup();
});
