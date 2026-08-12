<script setup lang="ts">
import { useRouter } from 'vue-router';
import VideoPlayer from '@presentation/components/VideoPlayer.vue';
import WatchPageSkeleton from '@presentation/components/skeletons/WatchPageSkeleton.vue';
import { useWatchPlayer } from '@presentation/composables/useWatchPlayer';
import { formatTime } from '@shared/utils/formatTime';

const props = defineProps<{
  id: string | number;
}>();

const router = useRouter();

const {
  playerRef,
  movie,
  isPending,
  error,
  startPosition,
  currentTime,
  duration,
  paused,
  muted,
  progressPercent,
  autoplayBlocked,
  handleTimeUpdate,
  handlePause,
  handleBlocked,
  togglePlay,
  unmute,
  seekBar,
} = useWatchPlayer(() => props.id);
</script>

<template>
  <div class="watch">
    <WatchPageSkeleton v-if="isPending" />
    <p v-else-if="error" class="status error">{{ error.message }}</p>

    <template v-else-if="movie">
      <VideoPlayer
        ref="playerRef"
        :src="movie.video_url"
        :start-position="startPosition"
        autoplay
        @timeupdate="handleTimeUpdate"
        @pause="handlePause"
        @blocked="handleBlocked"
      />

      <button v-if="autoplayBlocked" class="focusable unmute-banner" tabindex="0" @click="unmute">
        {{ $t('watch.unmuteBanner') }}
      </button>

      <div class="top-bar">
        <button
          class="focusable back-btn"
          tabindex="0"
          @click="router.push({ name: 'title', params: { id: props.id } })"
        >
          → {{ $t('common.back') }}
        </button>
        <div class="titles">
          <div class="title">{{ movie.title }}</div>
        </div>
      </div>

      <div class="bottom-bar">
        <div class="scrub">
          <span class="time">{{ formatTime(currentTime) }}</span>
          <div class="track" @click="seekBar">
            <div class="fill" :style="{ width: progressPercent + '%' }" />
          </div>
          <span class="time muted">{{ formatTime(duration) }}</span>
        </div>

        <div class="controls">
          <button class="focusable ctrl" tabindex="0" @click="playerRef?.seekBy(-10)">⟲ 10</button>
          <button class="focusable ctrl" tabindex="0" @click="togglePlay">
            {{ paused ? `▶ ${$t('watch.play')}` : `❚❚ ${$t('watch.pause')}` }}
          </button>
          <button class="focusable ctrl" tabindex="0" @click="playerRef?.seekBy(10)">10 ⟳</button>
          <button class="focusable ctrl" tabindex="0" @click="playerRef?.toggleMute()">
            {{ muted ? $t('watch.soundMuted') : $t('watch.soundOn') }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.watch {
  position: relative;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.status {
  padding: var(--space-5);
  color: var(--color-text-muted);
}

.status.error {
  color: #f87171;
}

.unmute-banner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  padding: 12px 22px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: var(--color-text);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.unmute-banner:hover,
.unmute-banner:focus-visible {
  background: rgba(0, 0, 0, 0.85);
}

.top-bar {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  left: var(--space-4);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  z-index: 2;
}

.back-btn {
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}

.back-btn:hover,
.back-btn:focus-visible {
  background: rgba(255, 255, 255, 0.16);
}

.titles {
  display: grid;
  gap: 4px;
}

.titles .title {
  font-size: 1.15rem;
  font-weight: 700;
}

.bottom-bar {
  position: absolute;
  bottom: var(--space-4);
  right: var(--space-4);
  left: var(--space-4);
  z-index: 2;
  display: grid;
  gap: var(--space-3);
}

.scrub {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.time {
  font-size: 0.85rem;
  color: #e5e7eb;
  font-variant-numeric: tabular-nums;
}

.time.muted {
  color: var(--color-text-muted);
}

.track {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.fill {
  position: absolute;
  inset: 0 auto 0 0;
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong));
}

.controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.ctrl {
  min-width: 44px;
  height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.ctrl:hover,
.ctrl:focus-visible {
  background: rgba(255, 255, 255, 0.16);
}

.watch::before,
.watch::after {
  content: '';
  position: absolute;
  right: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}

.watch::before {
  top: 0;
  height: 30%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
}

.watch::after {
  bottom: 0;
  height: 35%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0));
}
</style>
