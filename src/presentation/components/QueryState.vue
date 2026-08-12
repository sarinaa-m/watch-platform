<script setup lang="ts">
withDefaults(
  defineProps<{
    pending: boolean;
    error?: { message: string } | null;
  }>(),
  { error: null }
);
</script>

<template>
  <template v-if="pending">
    <slot name="skeleton">
      <p class="status">{{ $t('common.loading') }}</p>
    </slot>
  </template>
  <p v-else-if="error" class="status error">{{ error.message }}</p>
  <slot v-else />
</template>

<style scoped>
.status {
  color: var(--color-text-muted);
}

.status.error {
  color: #f87171;
}
</style>
