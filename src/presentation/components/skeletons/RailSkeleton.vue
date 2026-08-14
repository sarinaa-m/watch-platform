<script setup lang="ts">
import Skeleton from './Skeleton.vue';
import VideoCardSkeleton from './VideoCardSkeleton.vue';

withDefaults(defineProps<{ count?: number }>(), { count: 5 });
</script>

<template>
  <section class="rail" aria-hidden="true">
    <div class="rail-head">
      <Skeleton width="180px" height="1.25rem" />
      <Skeleton width="120px" height="0.85rem" />
    </div>
    <div class="rail-row">
      <VideoCardSkeleton v-for="n in count" :key="n" />
    </div>
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

.rail-row {
  display: flex;
  gap: var(--space-3);
  overflow-x: auto;
  padding: var(--space-2);
}

.rail-row > :deep(*) {
  flex: 0 0 auto;
  width: var(--rail-item-width);
}
</style>
