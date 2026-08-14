<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Compass } from 'lucide-vue-next';

const router = useRouter();

function goHome(): void {
  router.push({ name: 'home' });
}
</script>

<template>
  <div class="not-found-page">
    <div class="icon-badge">
      <Compass :size="32" />
    </div>
    <p class="code">404</p>
    <h1 class="title">{{ $t('notFound.title') }}</h1>
    <p class="message">{{ $t('notFound.message') }}</p>
    <button class="focusable primary-btn" type="button" @click="goHome">
      {{ $t('notFound.backHome') }}
    </button>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  text-align: center;
}

.icon-badge {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(140deg, var(--color-accent-strong), var(--color-accent));
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.code {
  font-family: var(--font-display);
  font-size: 4rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.title {
  font-size: 1.5rem;
}

.message {
  max-width: 380px;
  margin-bottom: var(--space-2);
}

.primary-btn {
  background: var(--color-accent);
  color: var(--color-text);
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition:
    filter 0.15s ease,
    transform 0.1s ease;
}

.primary-btn:hover:not(:disabled),
.primary-btn:focus-visible {
  filter: brightness(1.1);
}

.primary-btn:active {
  transform: scale(0.98);
}
</style>
