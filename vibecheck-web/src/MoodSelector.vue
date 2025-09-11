<template>
  <div class="mood-selector">
    <h2>How are you feeling?</h2>
    <div class="moods">
      <button @click="vote('happy')">🔥 On Fire</button>
      <button @click="vote('meh')">🙂 Solid</button>
      <button @click="vote('sad')">😵‍💫 Meh</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'
import { submitVote } from './Firebase'

const emit = defineEmits(['voted'])

const vote = async (mood: string) => {
  await submitVote(mood)
  emit('voted')
}
</script>

<style scoped>
.mood-selector {
  text-align: center;
}
.moods {
  margin-top: 20px;
}
button {
  margin: 0 10px;
  font-size: 24px;
}
</style>