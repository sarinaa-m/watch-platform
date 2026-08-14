<script setup lang="ts">
import FocusableGrid from '@presentation/components/FocusableGrid.vue';

withDefaults(
  defineProps<{
    title: string;
    hint?: string;
    layout?: 'row' | 'grid';
  }>(),
  { hint: '', layout: 'row' }
);
</script>

<template>
  <section class="rail">
    <div class="rail-head">
      <h2 class="rail-title">{{ title }}</h2>
      <span v-if="hint" class="rail-hint">{{ hint }}</span>
    </div>
    <FocusableGrid>
      <div class="rail-row" :class="`rail-row--${layout}`">
        <slot />
      </div>
    </FocusableGrid>
  </section>
</template>

<style scoped>
.rail {
  margin-bottom: var(--space-6);
}

.rail-head {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.rail-title {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.rail-hint {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.rail-row--row {
  display: flex;
  gap: var(--space-3);
  overflow-x: auto;
  padding: var(--space-2);
}

.rail-row--row > :deep(*) {
  flex: 0 0 auto;
  width: var(--rail-item-width);
}

.rail-row--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--poster-min-width), 1fr));
  gap: var(--space-3);
  padding: var(--space-2);
}
</style>
