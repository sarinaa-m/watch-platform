<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Hls from 'hls.js';

const props = withDefaults(
  defineProps<{
    src: string;
    startPosition?: number;
  }>(),
  { startPosition: 0 }
);

const emit = defineEmits<{
  timeupdate: [time: number];
  pause: [time: number];
  ready: [];
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
let hls: Hls | null = null;

function loadSource(): void {
  const video = videoRef.value;
  if (!video) return;

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(props.src);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (props.startPosition > 0) video.currentTime = props.startPosition;
      emit('ready');
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Native HLS support (Safari)
    video.src = props.src;
    video.addEventListener(
      'loadedmetadata',
      () => {
        if (props.startPosition > 0) video.currentTime = props.startPosition;
        emit('ready');
      },
      { once: true }
    );
  }
}

function destroyHls(): void {
  if (hls) {
    hls.destroy();
    hls = null;
  }
}

function handleTimeUpdate(): void {
  const video = videoRef.value;
  if (!video) return;
  emit('timeupdate', video.currentTime);
}

function handlePause(): void {
  const video = videoRef.value;
  if (!video) return;
  emit('pause', video.currentTime);
}

// Keyboard shortcuts: space/enter play-pause, left/right seek 10s.
// These work alongside the browser's native <video> controls.
function handleKeydown(e: KeyboardEvent): void {
  const video = videoRef.value;
  if (!video) return;
  switch (e.key) {
    case ' ':
    case 'Enter':
      e.preventDefault();
      if (video.paused) video.play();
      else video.pause();
      break;
    case 'ArrowRight':
      e.preventDefault();
      video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 10);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      video.currentTime = Math.max(0, video.currentTime - 10);
      break;
  }
}

onMounted(loadSource);
onBeforeUnmount(destroyHls);

watch(
  () => props.src,
  () => {
    destroyHls();
    loadSource();
  }
);

defineExpose({ videoRef });
</script>

<template>
  <video
    ref="videoRef"
    class="focusable player"
    controls
    tabindex="0"
    @timeupdate="handleTimeUpdate"
    @pause="handlePause"
    @keydown="handleKeydown"
  />
</template>

<style scoped>
.player {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: var(--radius-md);
  display: block;
}
</style>
