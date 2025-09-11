<template>
  <div class="centered">
    <h1>🌍 The World is Vibing</h1>
    <p>Reflects votes cast in the last 24 hours</p>
    <div class="stats">
      <p>🔥 {{ stats['🔥'] ?? 0 }}</p>
      <p>🙂 {{ stats['🙂'] ?? 0 }}</p>
      <p>😵‍💫 {{ stats['😵‍💫'] ?? 0 }}</p>
    </div>
    <button @click="fetchStats">🔄 Refresh</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchRecentVotes } from './Firebase'

const stats = ref<{ [key: string]: number }>({})

const fetchStats = async () => {
  stats.value = await fetchRecentVotes()
}

onMounted(fetchStats)
</script>

<style scoped>
.centered {
  text-align: center;
  padding-top: 40px;
}
.stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 1.5rem;
  margin: 20px 0;
}
button {
  font-size: 1rem;
  padding: 8px 16px;
  border-radius: 6px;
  background-color: #eee;
  cursor: pointer;
  border: none;
}
button:hover {
  background-color: #ddd;
}
</style>