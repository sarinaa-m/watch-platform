import { computed, toValue, type MaybeRefOrGetter } from 'vue';

export function usePlaybackStatusLabels(progressPercent: MaybeRefOrGetter<number>) {
  const statusLabel = computed(() => {
    const percent = toValue(progressPercent);
    if (percent >= 98) return '✓ دیده‌شده';
    if (percent > 2) return `ادامه از ${Math.round(percent)}٪`;
    return 'تماشا نشده';
  });

  const playLabel = computed(() =>
    toValue(progressPercent) > 2 ? '▶ ادامه تماشا' : '▶ شروع تماشا'
  );

  return { statusLabel, playLabel };
}
