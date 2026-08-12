<script setup lang="ts">
import VideoCardSkeleton from './VideoCardSkeleton.vue';

withDefaults(defineProps<{ count?: number; variant?: 'rail' | 'poster' }>(), {
  count: 8,
  variant: 'rail',
});
</script>

<template>
  <div class="grid" :class="`grid--${variant}`" aria-hidden="true">
    <VideoCardSkeleton v-for="n in count" :key="n" :variant="variant" />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--rail-item-width), 1fr));
  gap: var(--space-4);
}

.grid--poster {
  grid-template-columns: repeat(auto-fill, minmax(var(--poster-min-width), 1fr));
}
</style>
