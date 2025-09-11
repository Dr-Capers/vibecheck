<template>
  <div class="container">
    <Welcome v-if="state === 'welcome'" @next="goToVote" />
    <MoodSelector v-else-if="state === 'vote'" @voted="goToResults" />
    <Results v-else-if="state === 'results'" :counts="counts" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Welcome from './Welcome.vue'
import MoodSelector from './MoodSelector.vue'
import Results from './Results.vue'
import { fetchRecentVotes, hasVotedToday } from './Firebase'

// App states: 'welcome' → 'vote' → 'results'
const state = ref<'welcome' | 'vote' | 'results'>('welcome')
const counts = ref<{ [key: string]: number }>({})

const goToVote = () => {
  localStorage.setItem('skipWelcome', 'true')
  state.value = 'vote'
}

const goToResults = async () => {
  localStorage.setItem('hasVoted', 'true')
  counts.value = await fetchRecentVotes()
  state.value = 'results'
}

onMounted(async () => {
  const skipWelcome = localStorage.getItem('skipWelcome') === 'true'
  const voted = await hasVotedToday()

  if (voted) {
    state.value = 'results'
    counts.value = await fetchRecentVotes()
  } else if (skipWelcome) {
    state.value = 'vote'
  } else {
    state.value = 'welcome'
  }
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