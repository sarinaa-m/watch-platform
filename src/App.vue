<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@infra/storage/authStore';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const showBar = computed(() => auth.isAuthenticated);

function handleLogout(): void {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="shell">
    <header v-if="showBar" class="topbar">
      <router-link to="/" class="brand">آروان واچ</router-link>
      <div class="topbar-right">
        <span class="identifier">{{ auth.identifier }}</span>
        <button class="focusable logout-btn" tabindex="0" @click="handleLogout">خروج</button>
      </div>
    </header>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(10, 46, 44, 0.75);
}

.brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.25rem;
  text-decoration: none;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.identifier {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.logout-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.logout-btn:hover,
.logout-btn:focus-visible {
  border-color: var(--color-pink);
  background: rgba(255, 22, 103, 0.08);
}

.content {
  flex: 1;
  padding: var(--space-5);
}

@media (max-width: 640px) {
  .topbar,
  .content {
    padding: var(--space-3);
  }
}
</style>
