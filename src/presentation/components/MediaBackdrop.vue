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
  display: flex;
  align-items: flex-end;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
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
    var(--color-bg) 6%,
    rgba(var(--color-bg-rgb), 0.78) 45%,
    rgba(var(--color-bg-rgb), 0.3) 100%
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

  .backdrop-content {
    padding: var(--space-4);
  }
}
</style>
