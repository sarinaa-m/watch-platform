import { reactive, readonly } from 'vue';
import { i18n, RTL_LOCALES, type AppLocale } from '@infra/i18n';

const STORAGE_KEY = 'arvan_locale';

function detectInitialLocale(): AppLocale {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'en' || stored === 'fa' ? stored : 'en';
}

const state = reactive<{ locale: AppLocale }>({
  locale: detectInitialLocale(),
});

function applyDocumentAttributes(locale: AppLocale): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
  document.title = i18n.global.t('app.brand');
}

function setLocale(locale: AppLocale): void {
  state.locale = locale;
  i18n.global.locale.value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  applyDocumentAttributes(locale);
}

setLocale(state.locale);

export function useLocale() {
  return {
    state: readonly(state),
    setLocale,
  };
}
