<script setup lang="ts">
import VideoCardSkeleton from './VideoCardSkeleton.vue';

withDefaults(defineProps<{ count?: number }>(), { count: 8 });
</script>

<template>
  <div class="grid" aria-hidden="true">
    <VideoCardSkeleton v-for="n in count" :key="n" />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}
</style>
