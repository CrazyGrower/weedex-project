<template>
  <div v-if="showMetrics" class="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
    <h3 class="text-lg font-semibold mb-2">Performance Metrics</h3>
    <div class="space-y-2">
      <div v-for="(value, key) in metrics" :key="key" class="flex justify-between">
        <span class="font-medium">{{ formatMetricName(key) }}:</span>
        <span>{{ formatMetricValue(value) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MetricsService } from '../services/metrics'

const metrics = ref<Record<string, number>>({})
const showMetrics = ref(false)

const formatMetricName = (name: string): string => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

const formatMetricValue = (value: number): string => {
  if (value < 1000) {
    return `${value.toFixed(2)}ms`
  }
  return `${(value / 1000).toFixed(2)}s`
}

onMounted(() => {
  const metricsService = MetricsService.getInstance()
  metrics.value = metricsService.getMetrics()
  showMetrics.value = true
})
</script> 