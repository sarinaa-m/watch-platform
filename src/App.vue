<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@infra/state/authState';
import { useLocale } from '@infra/state/localeState';
import type { AppLocale } from '@infra/i18n';
import { initialsOf } from '@shared/utils/initials';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import SearchBox from '@presentation/components/SearchBox.vue';
import { useTopbarSearch } from '@presentation/composables/useTopbarSearch';
import { useHealthQuery } from '@application/usecases/healthUseCases';
import { useCurrentUserQuery } from '@application/usecases/authUseCases';
const auth = useAuth();
const route = useRoute();
const { t } = useI18n();
const locale = useLocale();

const {
  isPending: isHealthPending,
  isError: isHealthError,
  refetch: retryHealthCheck,
} = useHealthQuery();

const { data: currentUser } = useCurrentUserQuery();

const showChrome = computed(() => auth.isAuthenticated.value && !route.meta.hideChrome);

const navItems = computed(() => [
  { name: 'home', label: t('app.nav.home') },
  { name: 'continueWatching', label: t('app.nav.continueWatching') },
]);

const LOCALE_OPTIONS: Array<{ value: AppLocale; label: string }> = [
  { value: 'en', label: 'EN' },
  { value: 'fa', label: 'FA' },
];

const searchQuery = useTopbarSearch();

function handleLogout(): void {
  auth.logout();
}
</script>

<template>
  <div v-if="isHealthPending" class="boot-status">
    <p>{{ $t('health.checking') }}</p>
  </div>
  <div v-else-if="isHealthError" class="boot-status">
    <h1>{{ $t('health.unavailableTitle') }}</h1>
    <p>{{ $t('health.unavailableMessage') }}</p>
    <button class="focusable retry-btn" type="button" @click="() => retryHealthCheck()">
      {{ $t('health.retry') }}
    </button>
  </div>
  <template v-else>
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

        <SearchBox v-model="searchQuery" />

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
          <router-link :to="{ name: 'profile' }" class="focusable account-link" tabindex="0">
            <span class="avatar">{{
              initialsOf(currentUser?.identifier ?? auth.state.identifier)
            }}</span>
            <span class="account-name">{{ currentUser?.identifier ?? auth.state.identifier }}</span>
          </router-link>
        </div>
      </header>
      <main class="content" :class="{ 'content--full': !showChrome }">
        <router-view />
      </main>
    </div>
    <VueQueryDevtools />
  </template>
</template>

<style scoped>
.boot-status {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-muted);
}

.retry-btn {
  background: var(--color-accent);
  color: var(--color-text);
  border: none;
  padding: 12px 20px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.retry-btn:hover,
.retry-btn:focus-visible {
  filter: brightness(1.1);
}

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
  background: rgba(var(--color-bg-rgb), 0.72);
}

.brand {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.3rem;
  text-decoration: none;
  color: var(--color-accent-strong);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.nav-pills {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.pill {
  padding: 4px 0;
  font-size: 0.92rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  color: var(--color-text-muted);
  border-bottom: 2px solid transparent;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.pill:hover {
  color: var(--color-text);
}

.pill.active {
  color: var(--color-text);
  border-color: var(--color-accent-strong);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-inline-start: auto;
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
  background: rgba(var(--color-accent-rgb), 0.22);
  color: var(--color-text);
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

.account-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  color: var(--color-text);
  padding: 4px;
  border-radius: var(--radius-sm);
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
  color: var(--color-text);
}

.account-name {
  font-size: 0.85rem;
  font-weight: 600;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .account-name {
    display: none;
  }
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
