<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

const props = withDefaults(
  defineProps<{
    itemSelector?: string;
  }>(),
  { itemSelector: '.focusable' }
);

const gridRef = ref<HTMLElement | null>(null);

function getItems(): HTMLElement[] {
  return Array.from(gridRef.value!.querySelectorAll<HTMLElement>(props.itemSelector));
}

function columnsInRow(items: HTMLElement[]): number {
  if (items.length < 2) return items.length;
  const firstTop = items[0].getBoundingClientRect().top;
  let count = 0;
  for (const el of items) {
    if (Math.abs(el.getBoundingClientRect().top - firstTop) < 4) count++;
    else break;
  }
  return count || 1;
}

function focusIndex(items: HTMLElement[], index: number): void {
  const clamped = Math.max(0, Math.min(items.length - 1, index));
  items.forEach((el, i) => el.setAttribute('tabindex', i === clamped ? '0' : '-1'));
  items[clamped]?.focus();
}

function handleKeydown(e: KeyboardEvent): void {
  const items = getItems();
  if (!items.length) return;
  const current = items.indexOf(document.activeElement as HTMLElement);
  if (current === -1) return;

  const cols = columnsInRow(items);
  let next = current;

  switch (e.key) {
    case 'ArrowRight':
      next = current + 1;
      break;
    case 'ArrowLeft':
      next = current - 1;
      break;
    case 'ArrowDown':
      next = current + cols;
      break;
    case 'ArrowUp':
      next = current - cols;
      break;
    default:
      return;
  }

  if (next >= 0 && next < items.length) {
    e.preventDefault();
    focusIndex(items, next);
  }
}

onMounted(async () => {
  await nextTick();
  const items = getItems();
  if (items.length) focusIndex(items, 0);
});

defineExpose({ handleKeydown });
</script>

<template>
  <div ref="gridRef" class="focusable-grid" @keydown="handleKeydown">
    <slot />
  </div>
</template>

<style scoped>
.focusable-grid {
  display: contents;
}
</style>
