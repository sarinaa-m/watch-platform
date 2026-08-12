<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string;
    height?: string;
    radius?: string;
  }>(),
  { width: '100%', height: '1em', radius: 'var(--radius-sm)' }
);
</script>

<template>
  <span class="skeleton" :style="{ width, height, borderRadius: radius }" />
</template>

<style scoped>
.skeleton {
  display: block;
  background: linear-gradient(
    100deg,
    var(--color-surface) 30%,
    rgba(255, 255, 255, 0.08) 50%,
    var(--color-surface) 70%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
