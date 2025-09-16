<template>
  <div class="center">
    <h1>Hey. How are you feeling today?</h1>
    <button @click="handleContinue">Thanks</button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e: 'next'): void }>()

const handleContinue = () => {
  emit('next')
}
</script>

<style scoped>
.center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  gap: 20px;
}
button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}
</style>
