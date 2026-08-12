<script setup lang="ts">
withDefaults(defineProps<{ percent: number; rounded?: boolean; trackColor?: string }>(), {
  rounded: true,
  trackColor: 'rgba(255, 255, 255, 0.18)',
});
</script>

<template>
  <div
    v-if="percent > 0"
    class="progress-track"
    :class="{ 'progress-track--rounded': rounded }"
    :style="{ background: trackColor }"
  >
    <div class="progress-fill" :style="{ width: Math.min(100, percent) + '%' }" />
  </div>
</template>

<style scoped>
.progress-track {
  width: 100%;
  height: 4px;
  overflow: hidden;
}

.progress-track--rounded {
  border-radius: 999px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong));
}
</style>
