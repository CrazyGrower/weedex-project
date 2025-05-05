<template>
  <form @submit.prevent="validateAndSubmit">
    <h2 class="modal-title">Ajouter une variété</h2>
    <div class="form-group">
      <label for="name">Nom *</label>
      <input 
        type="text" 
        id="name" 
        v-model="form.name" 
        :class="{ 'error': errors.name }"
        placeholder="Ex: Hulk Auto"
        required
      >
      <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
    </div>
    
    <div class="form-group">
      <label for="brand">Marque *</label>
      <input 
        type="text" 
        id="brand" 
        v-model="form.brand" 
        :class="{ 'error': errors.brand }"
        placeholder="Ex: RQS"
        required
      >
      <span v-if="errors.brand" class="error-message">{{ errors.brand }}</span>
    </div>
    
    <div class="form-group">
      <label for="description">Description *</label>
      <textarea 
        id="description" 
        v-model="form.description" 
        :class="{ 'error': errors.description }"
        rows="4"
        placeholder="Description de la variété..."
        required
      ></textarea>
      <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
    </div>
    
    <div class="form-row">
      <div class="form-group half">
        <label for="seed_to_harvest">Durée de culture *</label>
        <input 
          type="number" 
          id="seed_to_harvest" 
          v-model="form.seed_to_harvest" 
          :class="{ 'error': errors.seed_to_harvest }"
          min="1"
          required
        >
        <span v-if="errors.seed_to_harvest" class="error-message">{{ errors.seed_to_harvest }}</span>
      </div>
      
      <div class="form-group half">
        <label for="type">Type *</label>
        <select id="type" v-model="form.type" :class="{ 'error': errors.type }" required>
          <option value="">Sélectionner...</option>
          <option value="Sativa">Sativa</option>
          <option value="Indica">Indica</option>
          <option value="Hybrid">Hybride</option>
        </select>
        <span v-if="errors.type" class="error-message">{{ errors.type }}</span>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group half">
        <label for="thc_percentage">Taux de THC (%) *</label>
        <input 
          type="number" 
          id="thc_percentage" 
          v-model="form.thc_percentage" 
          :class="{ 'error': errors.thc_percentage }"
          step="0.1"
          min="0"
          max="35"
          required
        >
        <span v-if="errors.thc_percentage" class="error-message">{{ errors.thc_percentage }}</span>
      </div>
      
      <div class="form-group half">
        <label for="average_yield">Rendement moyen (g) *</label>
        <input 
          type="number" 
          id="average_yield" 
          v-model="form.average_yield" 
          :class="{ 'error': errors.average_yield }"
          step="0.1"
          min="0"
          required
        >
        <span v-if="errors.average_yield" class="error-message">{{ errors.average_yield }}</span>
      </div>
    </div>

    <div class="form-group">
      <label for="image">Photo *</label>
      <div class="image-upload">
        <input
          type="file"
          id="image"
          accept="image/*"
          @change="handleImageUpload"
          :class="{ 'error': errors.image }"
          ref="fileInput"
          required
        >
      </div>
      <div v-if="previewImage" class="image-preview">
        <img :src="previewImage" alt="Preview" style="max-width: 200px; display: block; margin-bottom: 8px;">
        <button type="button" class="remove-image" @click.stop="removeImage">×</button>
      </div>
      <span v-if="errors.image" class="error-message">{{ errors.image }}</span>
    </div>
    
    <div class="form-row buttons">
      <button type="button" class="button cancel" @click="cancelForm">Annuler</button>
      <button type="submit" class="button submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Envoi en cours...' : 'Ajouter' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { Strain } from '@/types';

const emit = defineEmits(['submit', 'cancel']);

const form = reactive({
  name: '',
  brand: '',
  description: '',
  seed_to_harvest: null as number | null,
  type: '',
  thc_percentage: null as number | null,
  average_yield: null as number | null,
  image: null as File | null,
});

const errors = reactive({
  name: '',
  brand: '',
  description: '',
  seed_to_harvest: '',
  type: '',
  thc_percentage: '',
  average_yield: '',
  image: '',
});

const previewImage = ref<string | null>(null);
const isSubmitting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      errors.image = 'Le fichier doit être une image';
      return;
    }
    form.image = file;
    previewImage.value = URL.createObjectURL(file);
    errors.image = '';
  }
}

function removeImage() {
  form.image = null;
  previewImage.value = null;
}

function validateForm() {
  let isValid = true;
  const requiredFields = {
    name: 'Le nom est requis',
    brand: 'La marque est requise',
    description: 'La description est requise',
    seed_to_harvest: 'La durée de culture est requise',
    type: 'Le type est requis',
    thc_percentage: 'Le pourcentage de THC est requis',
    average_yield: 'Le rendement moyen est requis',
    image: 'Une photo est requise',
  };

  Object.entries(requiredFields).forEach(([field, message]) => {
    if (!form[field as keyof typeof form]) {
      errors[field as keyof typeof errors] = message;
      isValid = false;
    } else {
      errors[field as keyof typeof errors] = '';
    }
  });

  return isValid;
}

async function validateAndSubmit() {
  if (!validateForm()) return;

  isSubmitting.value = true;
  try {
    const formData = new FormData();
    
    // Ajouter les champs textuels
    formData.append('name', form.name);
    formData.append('brand', form.brand);
    formData.append('description', form.description);
    formData.append('seed_to_harvest', form.seed_to_harvest?.toString() || '');
    formData.append('type', form.type);
    formData.append('thc_percentage', form.thc_percentage?.toString() || '');
    formData.append('average_yield', form.average_yield?.toString() || '');
    
    // Ajouter l'image si elle existe
    if (form.image) {
      formData.append('image', form.image);
    }

    emit('submit', formData);
  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
  } finally {
    isSubmitting.value = false;
  }
}

function cancelForm() {
  if (previewImage.value) {
    URL.revokeObjectURL(previewImage.value);
  }
  emit('cancel');
}

function triggerFileInput() {
  fileInput.value?.click();
}
</script>

<style scoped>
form {
  font-family: 'Courier New', monospace;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.half {
  width: 50%;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

input, select, textarea {
  width: 100%;
  padding: 8px;
  border: 2px solid #333;
  background-color: #e8f5e9;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  border-radius: 4px;
}

.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.image-upload {
  margin-top: 8px;
  border: 2px dashed #333;
  padding: 20px;
  text-align: center;
  background-color: #e8f5e9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-upload:hover {
  background-color: #c8e6c9;
  border-color: #43a047;
}

.image-upload input[type="file"] {
  width: 100%;
  padding: 8px;
  cursor: pointer;
}

.image-upload label {
  display: block;
  cursor: pointer;
  color: #333;
  font-weight: normal;
}

.image-upload label::before {
  content: '📷';
  font-size: 24px;
  margin-right: 8px;
}

.image-preview {
  position: relative;
  margin-top: 10px;
  max-width: 200px;
  margin: 10px auto;
}

.image-preview img {
  width: 100%;
  border-radius: 4px;
  border: 2px solid #333;
}

.remove-image {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.buttons {
  margin-top: 20px;
  justify-content: flex-end;
}

.button {
  background-color: #dcedc8;
  padding: 10px 15px;
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  color: #333;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  border: 3px solid #333;
  box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.5);
}

.cancel {
  background-color: #ffcdd2;
}

.submit {
  background-color: #c8e6c9;
}

.button:hover {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.label-tooltip {
  border-bottom: 1px dotted #333;
  cursor: help;
  position: relative;
}
.label-tooltip:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 0;
  top: 120%;
  background: #333;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  white-space: pre-line;
  font-size: 13px;
  z-index: 10;
  min-width: 180px;
  max-width: 260px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.modal-title {
  margin-top: 0;
  margin-bottom: 24px;
  color: #333;
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  background-color: #81c784;
  padding: 12px 0 10px 0;
  border-bottom: 2px solid #333;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  letter-spacing: 1px;
  text-shadow: 1px 1px 0px rgba(255,255,255,0.3);
}
</style>