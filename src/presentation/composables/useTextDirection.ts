import { computed } from 'vue';
import { useLocale } from '@infra/state/localeState';
import { RTL_LOCALES } from '@infra/i18n';

export function useTextDirection() {
  const { state } = useLocale();

  const isRtl = computed(() => RTL_LOCALES.has(state.locale));
  const dir = computed(() => (isRtl.value ? 'rtl' : 'ltr'));

  return { isRtl, dir };
}
