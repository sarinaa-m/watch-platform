<script setup lang="ts">
import { useRouter } from 'vue-router';
import VideoPlayer from '@presentation/components/VideoPlayer.vue';
import WatchPageSkeleton from '@presentation/components/skeletons/WatchPageSkeleton.vue';
import { useWatchPlayer } from '@presentation/composables/useWatchPlayer';
import { formatTime } from '@shared/utils/formatTime';
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-vue-next';

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
          <button class="focusable ctrl" tabindex="0" @click="playerRef?.seekBy(-10)">
            <RotateCcw :size="14" /> <span>{{ 10 }}</span>
          </button>
          <button class="focusable ctrl" tabindex="0" @click="togglePlay">
            <template v-if="paused"
              ><Play :size="16" />
              <span>
                {{ $t('watch.play') }}
              </span></template
            >
            <template v-else
              ><Pause :size="16" /> <span>{{ $t('watch.pause') }}</span></template
            >
          </button>
          <button class="focusable ctrl" tabindex="0" @click="playerRef?.seekBy(10)">
            <span>{{ 10 }}</span> <RotateCw :size="14" />
          </button>
          <button class="focusable ctrl" tabindex="0" @click="playerRef?.toggleMute()">
            <span>{{ muted ? $t('watch.soundMuted') : $t('watch.soundOn') }}</span>
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
  background: var(--color-black);
  overflow: hidden;
}

.status {
  padding: var(--space-5);
  color: var(--color-text-muted);
}

.status.error {
  color: var(--color-error);
}

.unmute-banner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  padding: 12px 22px;
  border-radius: 999px;
  background: rgba(var(--color-shadow-rgb), 0.72);
  border: 1px solid rgba(var(--color-text-rgb), 0.28);
  color: var(--color-text);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.unmute-banner:hover,
.unmute-banner:focus-visible {
  background: rgba(var(--color-shadow-rgb), 0.85);
}

.top-bar {
  position: absolute;
  top: var(--space-4);
  inset-inline: var(--space-4);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  z-index: 2;
}

.back-btn {
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(var(--color-text-rgb), 0.1);
  border: 1px solid rgba(var(--color-text-rgb), 0.18);
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}

.back-btn:hover,
.back-btn:focus-visible {
  background: rgba(var(--color-text-rgb), 0.16);
}

.titles {
  display: grid;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.titles .title {
  font-size: 1.15rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom-bar {
  position: absolute;
  bottom: var(--space-4);
  inset-inline: var(--space-4);
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
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.time.muted {
  color: var(--color-text-muted);
}

.track {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: rgba(var(--color-text-rgb), 0.22);
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
  background: rgba(var(--color-text-rgb), 0.08);
  border: 1px solid rgba(var(--color-text-rgb), 0.16);
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.ctrl:hover,
.ctrl:focus-visible {
  background: rgba(var(--color-text-rgb), 0.16);
}

.watch::before,
.watch::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  z-index: 1;
  pointer-events: none;
}

.watch::before {
  top: 0;
  height: 30%;
  background: linear-gradient(
    to bottom,
    rgba(var(--color-shadow-rgb), 0.7),
    rgba(var(--color-shadow-rgb), 0)
  );
}

.watch::after {
  bottom: 0;
  height: 35%;
  background: linear-gradient(
    to top,
    rgba(var(--color-shadow-rgb), 0.85),
    rgba(var(--color-shadow-rgb), 0)
  );
}

@media (max-width: 640px) {
  .top-bar,
  .bottom-bar {
    inset-inline: var(--space-3);
  }

  .controls {
    flex-wrap: wrap;
    row-gap: var(--space-2);
  }

  .ctrl {
    padding: 0 12px;
    font-size: 0.8rem;
  }
}
</style>
