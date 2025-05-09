<template>
  <form @submit.prevent="handleSubmit" class="add-growlog-form">
    <div class="form-group">
      <label for="name">Nom du grow log</label>
      <input type="text" id="name" v-model="form.name" required>
    </div>

    <div class="form-group">
      <label for="startDate">Date de début</label>
      <input type="date" id="startDate" v-model="form.startDate" required>
    </div>

    <div class="form-group">
      <label for="endDate">Date de fin</label>
      <input type="date" id="endDate" v-model="form.endDate">
    </div>

    <div class="form-group">
      <label for="harvestAmount">Quantité récoltée (g)</label>
      <input type="number" id="harvestAmount" v-model="form.harvestAmount" min="0" step="0.01">
    </div>

    <div class="form-group">
      <label for="reviewRating">Note (sur 5)</label>
      <input type="number" id="reviewRating" v-model="form.reviewRating" min="0" max="5" step="0.1">
    </div>

    <div class="form-group">
      <label for="notes">Notes</label>
      <textarea id="notes" v-model="form.notes" rows="4"></textarea>
    </div>

    <div class="form-group">
      <label for="growlogUrl">URL du grow log</label>
      <input type="url" id="growlogUrl" v-model="form.growlogUrl">
    </div>

    <div class="form-group">
      <label for="pdfPath">PDF</label>
      <input type="file" id="pdfPath" @change="handlePdfChange" accept=".pdf">
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('close')" class="cancel-btn">Annuler</button>
      <button type="submit" class="submit-btn">Ajouter</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { GrowLog } from '../types'

const props = defineProps<{
  strainId: number
}>()

const emit = defineEmits(['close', 'growlog-added'])

const form = ref({
  name: '',
  startDate: '',
  endDate: '',
  harvestAmount: null as number | null,
  reviewRating: null as number | null,
  notes: '',
  growlogUrl: '',
  pdfPath: null as File | null
})

const handlePdfChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    form.value.pdfPath = input.files[0]
  }
}

const handleSubmit = async () => {
  try {
    const formData = new FormData()
    formData.append('strainId', props.strainId.toString())
    formData.append('name', form.value.name)
    formData.append('startDate', form.value.startDate)
    formData.append('endDate', form.value.endDate)
    formData.append('harvestAmount', form.value.harvestAmount?.toString() || '')
    formData.append('reviewRating', form.value.reviewRating?.toString() || '')
    formData.append('notes', form.value.notes)
    formData.append('growlogUrl', form.value.growlogUrl)
    if (form.value.pdfPath) {
      formData.append('pdfPath', form.value.pdfPath)
    }

    const response = await fetch('http://localhost:3333/api/grow-logs', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Erreur lors de l\'ajout du grow log')
    }

    const data = await response.json()
    emit('growlog-added', data.grow_log)
    emit('close')
  } catch (error) {
    console.error('Erreur:', error)
    alert('Une erreur est survenue lors de l\'ajout du grow log')
  }
}
</script> 