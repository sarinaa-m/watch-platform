<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const query = defineModel<string>({ default: '' });
</script>

<template>
  <form class="search-box" @submit.prevent>
    <input
      v-model="query"
      class="focusable search-input"
      type="text"
      :placeholder="t('search.placeholder')"
    />
  </form>
</template>

<style scoped>
.search-box {
  flex: 0 1 260px;
  min-width: 140px;
}

.search-input {
  width: 100%;
  padding: 8px 14px;
  font-size: 0.9rem;
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-input:focus-visible {
  border-color: var(--color-focus);
}
</style>
