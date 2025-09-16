<template>
  <div class="container">
    <Welcome v-if="state === 'welcome'" @next="goToVote" />
    <MoodSelector v-else-if="state === 'vote'" @voted="goToResults" />
    <Results
      v-else-if="state === 'results'"
      :counts="counts"
      :points="votePoints"
      :reset-timestamp="resetTimestamp"
      @refresh="refreshCounts"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Welcome from './Welcome.vue'
import MoodSelector from './MoodSelector.vue'
import Results from './Results.vue'
import {
  fetchRecentVotes,
  getVoteResetTimestamp,
  hasVotedToday,
  markVotedToday,
  type VotePoint
} from './Firebase'
import { createEmptyCounts, type MoodCounts } from './moods'

// App states: 'welcome' → 'vote' → 'results'
const state = ref<'welcome' | 'vote' | 'results'>('welcome')
const counts = ref<MoodCounts>(createEmptyCounts())
const votePoints = ref<VotePoint[]>([])
const resetTimestamp = ref<number | null>(getVoteResetTimestamp())

const goToVote = () => {
  localStorage.setItem('skipWelcome', 'true')
  resetTimestamp.value = null
  state.value = 'vote'
}

const goToResults = async () => {
  markVotedToday()
  resetTimestamp.value = getVoteResetTimestamp()
  await refreshCounts()
  state.value = 'results'
}

const refreshCounts = async () => {
  const data = await fetchRecentVotes()
  counts.value = data.counts
  votePoints.value = data.points
}

onMounted(async () => {
  const skipWelcome = localStorage.getItem('skipWelcome') === 'true'
  const voted = hasVotedToday()

  if (voted) {
    await refreshCounts()
    resetTimestamp.value = getVoteResetTimestamp()
    state.value = 'results'
    return
  }

  state.value = skipWelcome ? 'vote' : 'welcome'
})
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px;
}
</style>
