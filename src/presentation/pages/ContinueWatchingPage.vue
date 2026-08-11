<script setup lang="ts">
import { useRouter } from 'vue-router';
import VideoCard from '@presentation/components/VideoCard.vue';
import FocusableGrid from '@presentation/components/FocusableGrid.vue';
import QueryState from '@presentation/components/QueryState.vue';
import { useContinueWatchingMovies } from '@application/usecases/continueWatchingUseCases';

const router = useRouter();
const { items: continueWatchingMovies, isPending, error } = useContinueWatchingMovies();

function resume(id: number): void {
  router.push({ name: 'watch', params: { id } });
}
</script>

<template>
  <div class="continue-page">
    <div class="heading">
      <h1 class="title">ادامه تماشا</h1>
      <p class="subtitle">
        وضعیت تماشای شما روی سرور ذخیره شده است؛ از همان‌جایی که رها کردید ادامه دهید.
      </p>
    </div>

    <QueryState :pending="isPending" :error="error">
      <p v-if="!continueWatchingMovies.length" class="status">چیزی برای ادامه تماشا نیست.</p>

      <FocusableGrid v-else>
        <div class="grid">
          <VideoCard
            v-for="item in continueWatchingMovies"
            :key="item.movie.id"
            :movie="item.movie"
            :progress-percent="item.progressPercent"
            @select="resume"
          />
        </div>
      </FocusableGrid>
    </QueryState>
  </div>
</template>

<style scoped>
.continue-page {
  max-width: 1200px;
  margin: 0 auto;
}

.heading {
  display: grid;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}

.status {
  color: var(--color-text-muted);
}
</style>
