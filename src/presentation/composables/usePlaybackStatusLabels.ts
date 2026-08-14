import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useI18n } from 'vue-i18n';

export function usePlaybackStatusLabels(
  progressPercent: MaybeRefOrGetter<number>,
  completed: MaybeRefOrGetter<boolean | undefined> = () => undefined
) {
  const { t } = useI18n();

  const statusLabel = computed(() => {
    const percent = toValue(progressPercent);
    if (toValue(completed)) return t('playbackStatus.watched');
    if (percent > 2) return t('playbackStatus.resumeFrom', { percent: Math.round(percent) });
    return t('playbackStatus.notWatched');
  });

  const playLabel = computed(() =>
    toValue(progressPercent) > 2
      ? t('playbackStatus.continueWatching')
      : t('playbackStatus.startWatching')
  );

  return { statusLabel, playLabel };
}
