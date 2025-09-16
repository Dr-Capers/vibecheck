<template>
  <div class="mood-selector">
    <h2>How are you feeling?</h2>
    <div class="moods">
      <button
        v-for="option in moodOptions"
        :key="option.key"
        @click="vote(option.key)"
        :disabled="isSubmitting"
      >
        <span class="emoji">{{ option.emoji }}</span>
        <span class="label">{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref } from 'vue'
import { submitVote } from './Firebase'
import { lookupLocationFromIp } from './location'
import { MOOD_OPTIONS, type MoodKey } from './moods'

const emit = defineEmits(['voted'])

const moodOptions = MOOD_OPTIONS

const isSubmitting = ref(false)

const vote = async (mood: MoodKey) => {
  if (isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  try {
    const location = await lookupLocationFromIp()
    await submitVote(mood, location)
    emit('voted')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.mood-selector {
  text-align: center;
}
.moods {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 120px;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  background: #1f2933;
  color: #fff;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15);
}
button:active {
  transform: translateY(1px);
}
button:disabled {
  opacity: 0.6;
  cursor: progress;
  transform: none;
  box-shadow: none;
}
.emoji {
  font-size: 28px;
}
.label {
  font-weight: 600;
}
</style>
