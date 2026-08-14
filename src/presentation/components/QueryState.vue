<script setup lang="ts">
import { getApiErrorMessageKey } from '@shared/api/apiError';

defineProps<{
  pending: boolean;
  error?: unknown;
}>();
</script>

<template>
  <template v-if="pending">
    <slot name="skeleton">
      <p class="status">{{ $t('common.loading') }}</p>
    </slot>
  </template>
  <p v-else-if="error" class="status error">{{ $t(getApiErrorMessageKey(error)) }}</p>
  <slot v-else />
</template>

<style scoped>
.status {
  color: var(--color-text-muted);
}

.status.error {
  color: var(--color-error);
}
</style>
