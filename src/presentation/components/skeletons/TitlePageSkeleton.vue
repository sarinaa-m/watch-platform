<script setup lang="ts">
import Skeleton from './Skeleton.vue';
</script>

<template>
  <div class="title-skeleton" aria-hidden="true">
    <div class="hero">
      <div class="hero-content">
        <Skeleton width="55%" height="1.9rem" />
        <Skeleton width="90%" height="1rem" />
        <Skeleton width="75%" height="1rem" />
        <Skeleton width="150px" height="44px" radius="var(--radius-sm)" />
      </div>
    </div>

    <div class="episodes">
      <Skeleton width="140px" height="1.15rem" />
      <div class="episode-row">
        <Skeleton width="20px" height="1.1rem" />
        <Skeleton height="100%" radius="var(--radius-sm)" />
        <div class="episode-meta">
          <Skeleton width="60%" height="1rem" />
          <Skeleton width="35%" height="0.85rem" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.hero {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  min-height: 300px;
  display: flex;
  align-items: flex-end;
  background: var(--color-bg-elevated);
}

.hero-content {
  padding: var(--space-5);
  display: grid;
  gap: var(--space-3);
  max-width: 640px;
  width: 100%;
}

.episodes {
  display: grid;
  gap: var(--space-2);
}

.episode-row {
  display: grid;
  grid-template-columns: 32px minmax(160px, 240px) 1fr;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: rgba(var(--color-text-rgb), 0.035);
  border: 1px solid var(--color-border);
}

.episode-row > :nth-child(2) {
  aspect-ratio: 16 / 9;
}

.episode-meta {
  display: grid;
  gap: var(--space-1);
}
</style>
