<script setup lang="ts">
withDefaults(defineProps<{ image: string; size?: 'lg' | 'md' }>(), { size: 'lg' });
</script>

<template>
  <section
    class="backdrop"
    :class="`backdrop--${size}`"
    :style="{ backgroundImage: `url(${image})` }"
  >
    <div class="scrim" />
    <div class="backdrop-content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.backdrop {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: flex-end;
  background-size: cover;
  background-position: center;
}

.backdrop--lg {
  min-height: 440px;
  margin-bottom: var(--space-6);
}

.backdrop--md {
  min-height: 300px;
}

.scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    #0b111c 6%,
    rgba(11, 17, 28, 0.78) 45%,
    rgba(11, 17, 28, 0.3) 100%
  );
}

.backdrop-content {
  position: relative;
  padding: var(--space-5);
  display: grid;
  gap: var(--space-3);
  max-width: 640px;
}

@media (max-width: 640px) {
  .backdrop--lg {
    min-height: 340px;
  }
}
</style>
