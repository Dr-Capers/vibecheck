<template>
  <div class="center">
    <h1>Hey. How are you feeling today?</h1>
    <button @click="$emit('done')">Thanks</button>
  </div>
</template>

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
