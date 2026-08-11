<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Hls from 'hls.js';

const props = withDefaults(
  defineProps<{
    src: string;
    startPosition?: number;
    autoplay?: boolean;
  }>(),
  { startPosition: 0, autoplay: false }
);

const emit = defineEmits<{
  timeupdate: [time: number];
  pause: [time: number];
  ready: [];
  blocked: [];
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const currentTime = ref(0);
const duration = ref(0);
const paused = ref(true);
const muted = ref(false);
let hls: Hls | null = null;
// Tracks whether the resume seek has been applied for the current source, so a
// startPosition that resolves after the manifest still gets honoured once.
let seekApplied = false;

function handleReady(): void {
  if (props.startPosition > 0) seekTo(props.startPosition);
  seekApplied = true;
  emit('ready');
  if (props.autoplay) void attemptAutoplay();
}

function loadSource(): void {
  const video = videoRef.value;
  if (!video) return;

  seekApplied = false;

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(props.src);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, handleReady);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Native HLS support (Safari)
    video.src = props.src;
    video.addEventListener('loadedmetadata', handleReady, { once: true });
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
  currentTime.value = video.currentTime;
  emit('timeupdate', video.currentTime);
}

function handleDurationChange(): void {
  const video = videoRef.value;
  if (!video) return;
  duration.value = video.duration || 0;
}

function handlePlayState(): void {
  const video = videoRef.value;
  if (!video) return;
  paused.value = video.paused;
}

function handlePause(): void {
  const video = videoRef.value;
  if (!video) return;
  paused.value = true;
  emit('pause', video.currentTime);
}

function handleVolumeChange(): void {
  const video = videoRef.value;
  if (!video) return;
  muted.value = video.muted;
}

// Keyboard shortcuts: space/enter play-pause, left/right seek 10s.
// These work alongside the custom control chrome the parent renders.
function handleKeydown(e: KeyboardEvent): void {
  const video = videoRef.value;
  if (!video) return;
  switch (e.key) {
    case ' ':
    case 'Enter':
      e.preventDefault();
      // Same muted fallback as the on-screen play button, so a blocked
      // keyboard start doesn't fail as a silent unhandled rejection.
      if (video.paused) void attemptAutoplay();
      else video.pause();
      break;
    case 'ArrowRight':
      e.preventDefault();
      seekBy(10);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      seekBy(-10);
      break;
  }
}

/**
 * Returns the underlying play() promise so callers can react to a rejection.
 * Chrome/Safari reject with NotAllowedError when playback starts without a
 * user gesture, and a bare `video.play()` turns that into an unhandled
 * rejection — the "nothing happens, no error" symptom.
 */
function play(): Promise<void> {
  const video = videoRef.value;
  if (!video) return Promise.resolve();
  return video.play() ?? Promise.resolve();
}

/**
 * Autoplay with sound is blocked unless the user has already interacted with
 * the document. Muted playback is always allowed, so on NotAllowedError we
 * retry muted and tell the parent, which can offer an unmute affordance —
 * that click is itself the gesture that authorizes audio.
 */
async function attemptAutoplay(): Promise<void> {
  const video = videoRef.value;
  if (!video) return;
  try {
    await play();
  } catch (err) {
    if ((err as DOMException)?.name !== 'NotAllowedError') return;
    video.muted = true;
    muted.value = true;
    try {
      await play();
      emit('blocked');
    } catch {
      // Even muted playback was refused; leave the poster/controls visible.
      emit('blocked');
    }
  }
}

function pause(): void {
  videoRef.value?.pause();
}

function seekBy(seconds: number): void {
  const video = videoRef.value;
  if (!video) return;
  video.currentTime = Math.max(
    0,
    Math.min(video.duration || Infinity, video.currentTime + seconds)
  );
}

function seekTo(seconds: number): void {
  const video = videoRef.value;
  if (!video) return;
  video.currentTime = Math.max(0, Math.min(video.duration || Infinity, seconds));
}

function toggleMute(): void {
  const video = videoRef.value;
  if (!video) return;
  video.muted = !video.muted;
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

// continue-watching resolves independently of the manifest, so startPosition is
// often still 0 when the video becomes seekable. Apply it when it lands.
watch(
  () => props.startPosition,
  (position) => {
    if (seekApplied || position <= 0) return;
    const video = videoRef.value;
    if (!video || !video.duration) return;
    seekTo(position);
    seekApplied = true;
  }
);

defineExpose({
  videoRef,
  play,
  attemptAutoplay,
  pause,
  seekBy,
  seekTo,
  toggleMute,
  currentTime,
  duration,
  paused,
  muted,
});
</script>

<template>
  <video
    ref="videoRef"
    class="focusable player"
    playsinline
    tabindex="0"
    @timeupdate="handleTimeUpdate"
    @durationchange="handleDurationChange"
    @play="handlePlayState"
    @pause="handlePause"
    @volumechange="handleVolumeChange"
    @keydown="handleKeydown"
  />
</template>

<style scoped>
.player {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #000;
}
</style>
