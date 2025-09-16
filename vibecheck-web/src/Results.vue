<template>
  <div class="centered">
    <div class="results-card">
      <header class="card-header">
        <h1>🌍 The World is Vibing</h1>
        <p v-if="countdownLabel" class="reset">
          Your vote resets in {{ countdownLabel }}
        </p>
        <p class="subtitle">Reflects votes cast in the last 24 hours</p>
      </header>

      <section class="stats">
        <div v-for="option in moodOptions" :key="option.key" class="stat">
          <span class="emoji">{{ option.emoji }}</span>
          <span class="count">{{ stats[option.key] ?? 0 }}</span>
          <span class="label">{{ option.label }}</span>
        </div>
      </section>

      <section class="meta">
        <p class="total">Total votes: {{ totalVotes }}</p>
      </section>

      <section class="map-section">
        <WorldMap v-if="mappedPoints.length" :points="mappedPoints" />
        <p v-else class="no-data">Map updates once votes include location.</p>
      </section>

      <footer class="card-footer">
        <button @click="handleRefresh">🔄 Refresh</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  MOOD_OPTIONS,
  createEmptyCounts,
  type MoodCounts
} from './moods'
import { type VotePoint } from './Firebase'
import WorldMap from './WorldMap.vue'

const props = defineProps<{
  counts: MoodCounts
  points: VotePoint[]
  resetTimestamp: number | null
}>()
const emit = defineEmits<{ (e: 'refresh'): void }>()

const moodOptions = MOOD_OPTIONS
const stats = ref<MoodCounts>(createEmptyCounts())
const mappedPoints = computed(() => props.points ?? [])
const countdownLabel = ref<string | null>(null)
let countdownTimer: number | null = null

watch(
  () => props.counts,
  (newCounts) => {
    stats.value = { ...createEmptyCounts(), ...newCounts }
  },
  { immediate: true }
)

const totalVotes = computed(() =>
  Object.values(stats.value).reduce((sum, count) => sum + count, 0)
)

const handleRefresh = () => {
  emit('refresh')
}

const updateCountdown = () => {
  const target = props.resetTimestamp
  if (!target) {
    countdownLabel.value = null
    return
  }

  const diff = Math.max(target - Date.now(), 0)
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const pad = (value: number) => value.toString().padStart(2, '0')
  countdownLabel.value = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  if (diff === 0 && countdownTimer !== null) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const ensureTimer = () => {
  if (!props.resetTimestamp) {
    if (countdownTimer !== null) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    countdownLabel.value = null
    return
  }

  if (countdownTimer !== null) {
    return
  }

  countdownTimer = window.setInterval(updateCountdown, 1000)
}

watch(
  () => props.resetTimestamp,
  () => {
    if (countdownTimer !== null) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    updateCountdown()
    ensureTimer()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.centered {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 64px 20px 96px;
}

.results-card {
  width: min(860px, 100%);
  background: rgba(15, 23, 42, 0.65);
  border-radius: 24px;
  padding: 48px 60px;
  display: grid;
  gap: 36px;
  backdrop-filter: blur(18px);
  box-shadow: 0 40px 80px rgba(2, 6, 23, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.card-header {
  text-align: center;
  display: grid;
  gap: 12px;
}

.card-header h1 {
  margin: 0;
  font-size: clamp(1.8rem, 2.4vw, 2.6rem);
  letter-spacing: 0.02em;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: nowrap;
}

.stat {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
  border-radius: 20px;
  padding: 24px;
  display: grid;
  justify-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.emoji {
  font-size: 34px;
}

.count {
  font-size: 2rem;
  font-weight: 700;
}

.label {
  font-size: 0.95rem;
  opacity: 0.85;
}

.meta {
  text-align: center;
}

.total {
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.015em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.9);
}

.reset {
  margin: 12px 0 4px;
  font-weight: 600;
  color: #f97066;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.88rem;
}

.subtitle {
  margin: 0;
  opacity: 0.7;
  font-size: 0.95rem;
}

.map-section {
  border-radius: 20px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.no-data {
  margin: 0;
  padding: 32px;
  text-align: center;
  opacity: 0.7;
  font-size: 0.95rem;
}

.card-footer {
  display: flex;
  justify-content: center;
}

.card-footer button {
  font-size: 1rem;
  padding: 12px 32px;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: #fff;
  cursor: pointer;
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.card-footer button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.35);
}

.card-footer button:active {
  transform: translateY(0);
  box-shadow: none;
}

@media (max-width: 860px) {
  .results-card {
    padding: 40px 36px;
  }
  .stats {
    flex-wrap: wrap;
  }
  .stat {
    flex: 1 1 220px;
  }
}
</style>
