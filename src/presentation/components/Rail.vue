<script setup lang="ts">
import FocusableGrid from '@presentation/components/FocusableGrid.vue';

withDefaults(
  defineProps<{
    title: string;
    hint?: string;
  }>(),
  { hint: '' }
);
</script>

<template>
  <section class="rail">
    <div class="rail-head">
      <h2 class="rail-title">{{ title }}</h2>
      <span v-if="hint" class="rail-hint">{{ hint }}</span>
    </div>
    <FocusableGrid>
      <div class="rail-row">
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
  font-size: 1.25rem;
  font-weight: 700;
}

.rail-hint {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.rail-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-1);
  row-gap: var(--space-3);
  overflow-x: auto;
  padding: var(--space-2);
}

.rail-row > :deep(*) {
  flex: 0 0 auto;
  width: 260px;
}
</style>
