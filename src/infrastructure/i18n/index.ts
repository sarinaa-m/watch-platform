import { createI18n } from 'vue-i18n';
import en from './locales/en';
import fa from './locales/fa';

export type AppLocale = 'en' | 'fa';

export const RTL_LOCALES: ReadonlySet<AppLocale> = new Set(['fa']);

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, fa },
});
