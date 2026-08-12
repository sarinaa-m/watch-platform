<script setup lang="ts">
import Skeleton from './Skeleton.vue';
</script>

<template>
  <div class="card" aria-hidden="true">
    <div class="thumb-wrap">
      <Skeleton width="100%" height="100%" radius="0" />
    </div>
    <div class="meta">
      <Skeleton width="70%" height="1rem" />
      <Skeleton width="100%" height="0.8rem" />
      <Skeleton width="85%" height="0.8rem" />
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.thumb-wrap {
  aspect-ratio: 16 / 9;
  flex: 0 0 auto;
}

.meta {
  padding: var(--space-3);
  display: grid;
  gap: var(--space-2);
}
</style>
