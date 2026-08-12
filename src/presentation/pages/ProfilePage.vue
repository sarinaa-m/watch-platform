<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { initialsOf } from '@shared/utils/initials';
import { useCurrentUserQuery } from '@application/usecases/authUseCases';

const router = useRouter();
const route = useRoute();
const { data: currentUser } = useCurrentUserQuery();
function select(): void {
  const redirect = route.query.redirect;
  router.push(typeof redirect === 'string' ? redirect : { name: 'home' });
}
</script>

<template>
  <div class="profile-page">
    <div class="heading">
      <h1 class="title">{{ $t('profile.title') }}</h1>
      <p class="subtitle">{{ $t('profile.subtitle') }}</p>
    </div>

    <button class="focusable profile-tile" tabindex="0" @click="select">
      <span class="avatar">{{ initialsOf(currentUser?.identifier) }}</span>
      <span class="name">{{ currentUser?.identifier }}</span>
    </button>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 82vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  padding: var(--space-6) var(--space-4);
  text-align: center;
}

.heading {
  display: grid;
  gap: var(--space-2);
  max-width: 480px;
}

.title {
  font-size: 1.9rem;
  font-weight: 700;
}

.profile-tile {
  display: grid;
  gap: var(--space-3);
  justify-items: center;
  padding: var(--space-3);
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
}

.avatar {
  width: 110px;
  height: 110px;
  border-radius: var(--radius-lg);
  background: linear-gradient(140deg, var(--color-accent-strong), var(--color-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  box-shadow: 0 16px 32px rgba(var(--color-shadow-rgb), 0.45);
  transition: box-shadow 0.15s ease;
}

.profile-tile:hover .avatar,
.profile-tile:focus-visible .avatar {
  box-shadow:
    0 16px 32px rgba(var(--color-shadow-rgb), 0.45),
    0 0 0 4px rgba(var(--color-accent-strong-rgb), 0.35);
}

.name {
  font-size: 1rem;
  font-weight: 600;
}
</style>
