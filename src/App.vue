<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@infra/state/authState';
import { useLocale } from '@infra/state/localeState';
import type { AppLocale } from '@infra/i18n';
import { initialsOf } from '@shared/utils/initials';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
const auth = useAuth();
const route = useRoute();
const { t } = useI18n();
const locale = useLocale();

const HIDDEN_CHROME_ROUTES = new Set(['login', 'profile', 'watch']);
const showChrome = computed(
  () => auth.isAuthenticated.value && !HIDDEN_CHROME_ROUTES.has(String(route.name))
);

const navItems = computed(() => [
  { name: 'home', label: t('app.nav.home') },
  { name: 'continueWatching', label: t('app.nav.continueWatching') },
  { name: 'search', label: t('app.nav.search') },
]);

const LOCALE_OPTIONS: Array<{ value: AppLocale; label: string }> = [
  { value: 'en', label: 'EN' },
  { value: 'fa', label: 'FA' },
];

function handleLogout(): void {
  auth.logout();
}
</script>

<template>
  <div class="shell">
    <header v-if="showChrome" class="topbar">
      <router-link :to="{ name: 'home' }" class="brand">{{ t('app.brand') }}</router-link>

      <nav class="nav-pills">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="focusable pill"
          :class="{ active: route.name === item.name }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="topbar-right">
        <div class="locale-switch">
          <button
            v-for="option in LOCALE_OPTIONS"
            :key="option.value"
            class="focusable locale-btn"
            :class="{ active: locale.state.locale === option.value }"
            tabindex="0"
            type="button"
            @click="locale.setLocale(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
        <button class="focusable logout-btn" tabindex="0" @click="handleLogout">
          {{ t('app.logout') }}
        </button>
        <router-link :to="{ name: 'profile' }" class="focusable avatar" tabindex="0">
          {{ initialsOf(auth.state.identifier) }}
        </router-link>
      </div>
    </header>
    <main class="content" :class="{ 'content--full': !showChrome }">
      <router-view />
    </main>
  </div>
  <VueQueryDevtools />
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
  flex-wrap: wrap;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(14px);
  background: rgba(11, 17, 28, 0.72);
}

.brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.15rem;
  text-decoration: none;
  color: var(--color-text);
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.nav-pills {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.pill {
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.9rem;
  text-decoration: none;
  white-space: nowrap;
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.pill:hover {
  color: var(--color-text);
}

.pill.active {
  background: rgba(42, 111, 219, 0.22);
  color: #fff;
  border-color: rgba(90, 127, 255, 0.55);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-right: auto;
}

.locale-switch {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.locale-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  padding: 6px 10px;
  border-radius: calc(var(--radius-sm) - 2px);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.locale-btn:hover,
.locale-btn:focus-visible {
  color: var(--color-text);
}

.locale-btn.active {
  background: rgba(42, 111, 219, 0.22);
  color: #fff;
}

.logout-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.logout-btn:hover,
.logout-btn:focus-visible {
  border-color: var(--color-accent);
  color: var(--color-text);
}

.avatar {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(140deg, var(--color-accent-strong), var(--color-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  color: #fff;
}

.content {
  flex: 1;
  padding: var(--space-5);
}

.content--full {
  padding: 0;
}

@media (max-width: 640px) {
  .topbar,
  .content {
    padding: var(--space-3);
  }
  .content--full {
    padding: 0;
  }
}
</style>
