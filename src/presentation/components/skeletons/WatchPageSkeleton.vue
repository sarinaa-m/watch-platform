<script setup lang="ts">
import Skeleton from './Skeleton.vue';
</script>

<template>
  <div class="watch-skeleton" aria-hidden="true">
    <Skeleton width="100%" height="100%" radius="0" />
    <div class="play-hint">
      <Skeleton width="72px" height="72px" radius="999px" />
    </div>
  </div>
</template>

<style scoped>
.watch-skeleton {
  position: absolute;
  inset: 0;
  background: #000;
}

.play-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
