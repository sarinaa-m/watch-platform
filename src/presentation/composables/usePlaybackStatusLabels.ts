import { computed, toValue, type MaybeRefOrGetter } from 'vue';

export function usePlaybackStatusLabels(progressPercent: MaybeRefOrGetter<number>) {
  const statusLabel = computed(() => {
    const percent = toValue(progressPercent);
    if (percent >= 98) return '✓ Watched';
    if (percent > 2) return `Resume from ${Math.round(percent)}%`;
    return 'Not watched';
  });

  const playLabel = computed(() =>
    toValue(progressPercent) > 2 ? '▶ Continue Watching' : '▶ Start Watching'
  );

  return { statusLabel, playLabel };
}
