<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@infra/storage/authStore';
import type { ApiError } from '@infra/api/httpClient';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const step = ref<'identifier' | 'otp'>('identifier');
const identifier = ref('');
const otp = ref('');
const loading = ref(false);
const error = ref('');

async function submitIdentifier(): Promise<void> {
  error.value = '';
  loading.value = true;
  try {
    await auth.requestOtp(identifier.value);
    step.value = 'otp';
  } catch (err) {
    error.value = (err as Partial<ApiError>).message || 'مشکلی پیش آمد.';
  } finally {
    loading.value = false;
  }
}

async function submitOtp(): Promise<void> {
  error.value = '';
  loading.value = true;
  try {
    await auth.verifyOtp(otp.value);
    const redirect = route.query.redirect;
    router.push(typeof redirect === 'string' ? redirect : { name: 'home' });
  } catch (err) {
    error.value = (err as Partial<ApiError>).message || 'کد وارد شده نامعتبر است.';
  } finally {
    loading.value = false;
  }
}

function backToIdentifier(): void {
  step.value = 'identifier';
  otp.value = '';
  error.value = '';
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="title">آروان واچ</h1>
      <p class="subtitle">برای ادامه وارد حساب کاربری خود شوید</p>

      <form v-if="step === 'identifier'" class="form" @submit.prevent="submitIdentifier">
        <label class="field">
          <span class="field-label">ایمیل یا شماره موبایل</span>
          <input
            v-model="identifier"
            class="focusable input"
            type="text"
            autocomplete="username"
            required
            minlength="3"
            maxlength="254"
            placeholder="you@example.com"
          />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button class="focusable primary-btn" type="submit" :disabled="loading">
          {{ loading ? 'در حال ارسال...' : 'دریافت کد یکبار مصرف' }}
        </button>
      </form>

      <form v-else class="form" @submit.prevent="submitOtp">
        <p class="hint">
          کد یکبار مصرف برای <strong>{{ identifier }}</strong> ارسال شد.
        </p>
        <label class="field">
          <span class="field-label">کد تایید</span>
          <input
            v-model="otp"
            class="focusable input otp-input"
            type="text"
            inputmode="numeric"
            pattern="\d{6}"
            maxlength="6"
            required
            placeholder="000000"
            autofocus
          />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button class="focusable primary-btn" type="submit" :disabled="loading">
          {{ loading ? 'در حال ورود...' : 'تایید و ورود' }}
        </button>
        <button class="focusable ghost-btn" type="button" @click="backToIdentifier">بازگشت</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.45);
}

.title {
  font-size: 1.75rem;
  margin-bottom: var(--space-1);
}

.subtitle {
  margin-bottom: var(--space-4);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.field-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.input {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  font-size: 1rem;
}

.otp-input {
  letter-spacing: 0.4em;
  text-align: center;
  font-size: 1.4rem;
}

.hint {
  margin-bottom: var(--space-1);
}

.error {
  color: var(--color-pink);
  font-size: 0.9rem;
}

.primary-btn {
  background: var(--color-pink);
  color: #fff;
  border: none;
  padding: 12px 16px;
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

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ghost-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.ghost-btn:hover,
.ghost-btn:focus-visible {
  color: var(--color-text);
  border-color: var(--color-teal);
}
</style>
