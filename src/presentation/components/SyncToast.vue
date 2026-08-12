<script setup lang="ts">
defineProps<{ detail: string }>();
</script>

<template>
  <div class="sync-toast">
    <span class="check">✓</span>
    <div class="text">
      <div class="title">Watch status saved</div>
      <div class="detail">{{ detail }}</div>
    </div>
  </div>
</template>

<style scoped>
.sync-toast {
  position: fixed;
  bottom: 56px;
  right: 32px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  background: rgba(17, 41, 32, 0.94);
  border: 1px solid rgba(31, 138, 91, 0.5);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
  animation: rise-in 0.2s ease both;
}

.check {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #fff;
}

.text {
  display: grid;
  gap: 2px;
}

.title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ddfaef;
}

.detail {
  font-size: 0.75rem;
  color: #96e8c7;
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
