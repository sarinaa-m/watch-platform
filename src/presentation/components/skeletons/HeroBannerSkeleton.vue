<script setup lang="ts">
import Skeleton from './Skeleton.vue';
</script>

<template>
  <div class="hero" aria-hidden="true">
    <Skeleton width="100%" height="100%" radius="0" />
    <div class="hero-content">
      <Skeleton width="40%" height="2.2rem" />
      <Skeleton width="90%" height="0.9rem" />
      <Skeleton width="70%" height="0.9rem" />
      <div class="actions">
        <Skeleton width="160px" height="48px" radius="var(--radius-sm)" />
        <Skeleton width="140px" height="48px" radius="var(--radius-sm)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  min-height: 440px;
  margin-bottom: var(--space-6);
}

.hero-content {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding: var(--space-5);
  display: grid;
  gap: var(--space-3);
  max-width: 640px;
}

.actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-1);
}

@media (max-width: 640px) {
  .hero {
    min-height: 340px;
  }
}
</style>
