<template>
  <div class="map" ref="mapContainer"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L, { type Map, type CircleMarker } from 'leaflet'
import type { VotePoint } from './Firebase'
import { MOOD_OPTIONS } from './moods'

const props = defineProps<{ points: VotePoint[] }>()

const mapContainer = ref<HTMLDivElement | null>(null)
let mapInstance: Map | null = null
let markers: CircleMarker[] = []

const moodColors: Record<string, string> = {
  happy: '#f97316',
  meh: '#22c55e',
  sad: '#3b82f6'
}

const createMarker = (point: VotePoint) => {
  const color = moodColors[point.mood] ?? '#6366f1'
  const marker = L.circleMarker([point.latitude, point.longitude], {
    radius: 6,
    color,
    fillColor: color,
    fillOpacity: 0.85,
    weight: 1
  })

  const mood = MOOD_OPTIONS.find((option) => option.key === point.mood)
  const label = [
    mood ? `${mood.emoji} ${mood.label}` : point.mood,
    point.city,
    point.region,
    point.country
  ]
    .filter(Boolean)
    .join(' · ')

  marker.bindPopup(label)
  return marker
}

const updateMarkers = () => {
  if (!mapInstance) return

  markers.forEach((marker) => marker.remove())
  markers = []

  props.points.forEach((point) => {
    const marker = createMarker(point)
    marker.addTo(mapInstance as Map)
    markers.push(marker)
  })
}

onMounted(() => {
  if (!mapContainer.value) return

  mapInstance = L.map(mapContainer.value, {
    center: [20, 0],
    zoom: 2,
    minZoom: 1,
    maxZoom: 18,
    worldCopyJump: true
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance)

  updateMarkers()
})

watch(
  () => props.points,
  () => {
    updateMarkers()
  }
)

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<style scoped>
.map {
  width: 100%;
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.25);
}
</style>
