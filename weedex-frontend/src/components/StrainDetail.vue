<template>
  <div class="right-container" v-if="strain">
    <div class="image-container">
      <div class="strain-image">
        <div class="image-title">{{ strain.name }} Plant</div>
        <img :src="getImageUrl(strain)" :alt="`${strain.name} Plant`">
        <div class="led-indicator"></div>
      </div>
    </div>
    <div class="strain-description">
      <div class="strain-description-header">DESCRIPTION</div>
      <div class="strain-description-content">
        {{ strain.description || 'Aucune description disponible.' }}
      </div>
    </div>
    <div class="info-box">
      <ul>
        <li>Durée de culture : {{ formatWeeks(strain.seedToHarvest) }}</li>
        <li>Type : {{ strain.type || 'N/A' }}</li>
        <li>Taux de THC : {{ formatPercentage(strain.thcPercentage) }}</li>
        <li>Rendement : {{ formatGrams(strain.averageYield) }}</li>
        <li class="rating-item">
          Note : 
          <div class="rating-stars">
            <span v-for="n in 5" :key="n" :class="{ filled: n <= getRatingStars((strain as any).strain_review || strain.strainReview) }">★</span>
          </div>
        </li>
      </ul>
    </div>
    <div class="info-table">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nom / PDF</th>
              <th>Début</th>
              <th>Fin</th>
              <th>Récolte (g)</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in growLogs" :key="log.id">
              <td>
                <span class="growlog-name" @click="openGrowLogDetails(log)">{{ log.name }}</span>
              </td>
              <td>{{ formatDate(log.startDate) }}</td>
              <td>{{ formatDate(log.endDate) }}</td>
              <td>{{ formatGrams(log.harvestAmount) }}</td>
              <td>
                <div class="rating-stars">
                  <span v-for="n in 5" :key="n" :class="{ filled: n <= getRatingStars(log.reviewRating) }">★</span>
                </div>
              </td>
            </tr>
            <tr v-if="!growLogs.length">
              <td colspan="5" class="text-center">Aucun log de culture pour cette variété</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="add-growlog-btn-container">
        <button class="button add-growlog" @click="showAddGrowLog = true">Ajouter un Grow Log</button>
        <button class="button edit-strain" @click="showEditStrain = true">Modifier la variété</button>
      </div>
    </div>

    <!-- Modal de modification de la variété -->
    <div v-if="showEditStrain" class="modal-backdrop">
      <div class="modal-content">
        <h2>Modifier la variété</h2>
        <form @submit.prevent="submitEditStrain">
          <div class="form-group">
            <label for="edit-name">Nom *</label>
            <input id="edit-name" v-model="editStrainForm.name" :class="{ error: editErrors.name }" required />
            <span v-if="editErrors.name" class="error-message">{{ editErrors.name }}</span>
          </div>
          
          <div class="form-group">
            <label for="edit-brand">Marque *</label>
            <input id="edit-brand" v-model="editStrainForm.brand" :class="{ error: editErrors.brand }" required />
            <span v-if="editErrors.brand" class="error-message">{{ editErrors.brand }}</span>
          </div>
          
          <div class="form-group">
            <label for="edit-description">Description *</label>
            <textarea id="edit-description" v-model="editStrainForm.description" :class="{ error: editErrors.description }" rows="4" required></textarea>
            <span v-if="editErrors.description" class="error-message">{{ editErrors.description }}</span>
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label for="edit-seedToHarvest">Durée de culture *</label>
              <input id="edit-seedToHarvest" type="number" v-model="editStrainForm.seedToHarvest" :class="{ error: editErrors.seedToHarvest }" min="0" step="1" required />
              <span v-if="editErrors.seedToHarvest" class="error-message">{{ editErrors.seedToHarvest }}</span>
            </div>
            
            <div class="form-group half">
              <label for="edit-type">Type *</label>
              <select id="edit-type" v-model="editStrainForm.type" :class="{ error: editErrors.type }" required>
                <option value="">Sélectionner...</option>
                <option value="Sativa">Sativa</option>
                <option value="Indica">Indica</option>
                <option value="Hybrid">Hybride</option>
              </select>
              <span v-if="editErrors.type" class="error-message">{{ editErrors.type }}</span>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label for="edit-thcPercentage">Taux de THC (%) *</label>
              <input id="edit-thcPercentage" type="number" v-model="editStrainForm.thcPercentage" :class="{ error: editErrors.thcPercentage }" step="0.01" min="0" max="100" required />
              <span v-if="editErrors.thcPercentage" class="error-message">{{ editErrors.thcPercentage }}</span>
            </div>
            
            <div class="form-group half">
              <label for="edit-averageYield">Rendement moyen (g) *</label>
              <input id="edit-averageYield" type="number" v-model="editStrainForm.averageYield" :class="{ error: editErrors.averageYield }" step="0.01" min="0" required />
              <span v-if="editErrors.averageYield" class="error-message">{{ editErrors.averageYield }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="edit-strainReview">Note de la variété (sur 5) *</label>
            <div class="rating-input">
              <input id="edit-strainReview" type="number" v-model="editStrainForm.strainReview" :class="{ error: editErrors.strainReview }" min="0" max="5" step="0.1" required />
              <div class="rating-stars">
                <span v-for="star in 5" :key="star" 
                      @click="editStrainForm.strainReview = star"
                      :class="{ 'active': star <= (editStrainForm.strainReview || 0) }">
                  ★
                </span>
              </div>
            </div>
            <span v-if="editErrors.strainReview" class="error-message">{{ editErrors.strainReview }}</span>
          </div>

          <div class="form-group">
            <label for="edit-image">Photo</label>
            <div class="image-upload">
              <input
                type="file"
                id="edit-image"
                accept="image/*"
                @change="handleEditImageUpload"
                ref="editFileInput"
              >
            </div>
            <div v-if="editPreviewImage" class="image-preview">
              <img :src="editPreviewImage" alt="Preview" style="max-width: 200px; display: block; margin-bottom: 8px;">
              <button type="button" class="remove-image" @click.stop="removeEditImage">×</button>
            </div>
            <span v-if="editErrors.image" class="error-message">{{ editErrors.image }}</span>
          </div>

          <div class="form-row buttons">
            <button type="button" class="button cancel" @click="closeEditStrainModal">Annuler</button>
            <button type="submit" class="button submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Envoi en cours...' : 'Enregistrer' }}
            </button>
            <button type="button" class="button delete" @click="confirmDeleteStrain">Supprimer la variété</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteConfirm" class="modal-backdrop">
      <div class="modal-content">
        <h2>Confirmer la suppression</h2>
        <p>Êtes-vous sûr de vouloir supprimer cette variété ? Cette action est irréversible.</p>
        <div class="form-row buttons">
          <button type="button" class="button cancel" @click="showDeleteConfirm = false">Annuler</button>
          <button type="button" class="button delete" @click="deleteStrain">Confirmer la suppression</button>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout de Grow Log -->
    <div v-if="showAddGrowLog" class="modal-backdrop">
      <div class="modal-content">
        <h2>Ajouter un Grow Log</h2>
        <form @submit.prevent="submitGrowLog">
          <div class="form-row">
            <div class="form-group half">
              <label for="growlog-name">Nom du log *</label>
              <input id="growlog-name" v-model="growLogForm.name" :class="{ error: errors.name }" required placeholder="Nom du log" />
              <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
            </div>
            <div class="form-group half">
              <label for="growlog-pdf">PDF *</label>
              <input id="growlog-pdf" type="file" accept="application/pdf" @change="handlePdfUpload" :class="{ error: errors.pdf }" required />
              <span v-if="growLogForm.pdfName">Fichier sélectionné : {{ growLogForm.pdfName }}</span>
              <span v-if="errors.pdf" class="error-message">{{ errors.pdf }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label for="growlog-start">Date de début *</label>
              <input id="growlog-start" type="date" v-model="growLogForm.startDate" :class="{ error: errors.startDate }" required />
              <span v-if="errors.startDate" class="error-message">{{ errors.startDate }}</span>
            </div>
            <div class="form-group half">
              <label for="growlog-end">Date de fin *</label>
              <input id="growlog-end" type="date" v-model="growLogForm.endDate" :class="{ error: errors.endDate }" required />
              <span v-if="errors.endDate" class="error-message">{{ errors.endDate }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label for="growlog-harvest">Récolte (g) *</label>
              <input id="growlog-harvest" type="number" v-model="growLogForm.harvestAmount" :class="{ error: errors.harvestAmount }" min="0" step="0.01" required placeholder="Quantité récoltée" />
              <span v-if="errors.harvestAmount" class="error-message">{{ errors.harvestAmount }}</span>
            </div>
            <div class="form-group half">
              <label for="growlog-review" class="label-tooltip" data-tooltip="Note de la session (de 1 à 5)">Note *</label>
              <input id="growlog-review" type="number" v-model="growLogForm.reviewRating" :class="{ error: errors.reviewRating }" min="1" max="5" required placeholder="Note sur 5" />
              <span v-if="errors.reviewRating" class="error-message">{{ errors.reviewRating }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="growlog-url">URL du Grow Log</label>
              <input id="growlog-url" type="url" v-model="growLogForm.growlogUrl" placeholder="https://..." />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="growlog-notes">Notes descriptives</label>
              <textarea id="growlog-notes" v-model="growLogForm.notes" rows="4" placeholder="Ajoutez des notes détaillées sur votre culture..."></textarea>
            </div>
          </div>
          <div class="form-row buttons">
            <button type="button" class="button cancel" @click="closeGrowLogModal">Annuler</button>
            <button type="submit" class="button submit">Ajouter</button>
          </div>
        </form>
        <div v-if="growLogSuccess" class="success-message">Grow log ajouté !</div>
      </div>
    </div>

    <!-- Modal de détails du Grow Log -->
    <div v-if="showGrowLogDetails && selectedGrowLog" class="modal-backdrop" @click="closeGrowLogDetails">
      <div class="modal-content" @click.stop>
        <h2>Détails du Grow Log</h2>
        <div class="growlog-details">
          <div class="detail-row">
            <h3>{{ selectedGrowLog.name }}</h3>
            <div class="rating-display">
              <div class="rating-stars">
                <span v-for="n in 5" :key="n" :class="{ filled: n <= getRatingStars(selectedGrowLog.reviewRating) }">★</span>
              </div>
            </div>
          </div>
          <div class="detail-info">
            <p><strong>Date de début:</strong> {{ formatDate(selectedGrowLog.startDate) }}</p>
            <p><strong>Date de fin:</strong> {{ formatDate(selectedGrowLog.endDate) }}</p>
            <p><strong>Récolte:</strong> {{ formatGrams(selectedGrowLog.harvestAmount) }}</p>
            <p v-if="selectedGrowLog.notes"><strong>Notes:</strong> {{ selectedGrowLog.notes }}</p>
          </div>
          <div class="detail-actions">
            <button v-if="selectedGrowLog.pdfPath" class="button" @click="downloadPdf(selectedGrowLog)">
              Télécharger PDF
            </button>
            <button v-if="selectedGrowLog.growlogUrl" class="button" @click="openGrowLogUrl(selectedGrowLog)">
              Voir le Grow Log
            </button>
            <button class="button cancel" @click="closeGrowLogDetails">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="right-container flex items-center justify-center">
    <p class="text-xl font-bold">Sélectionnez une variété pour voir les détails</p>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, onMounted, ref, watch } from 'vue';
import type { Strain, GrowLog } from '@/types';
import api from '@/services/api';

const API_BASE = 'https://api.weedex-project.orb.local';

const props = defineProps<{
  strain: Strain | null;
  growLogs: GrowLog[];
}>();

const emit = defineEmits<{
  (e: 'viewGrowLog', id: number): void;
  (e: 'strainDeleted', id: number): void;
}>();

const showAddGrowLog = ref(false);
const growLogSuccess = ref(false);
const showGrowLogDetails = ref(false);
const selectedGrowLog = ref<GrowLog | null>(null);
const showEditStrain = ref(false);
const showDeleteConfirm = ref(false);
const isSubmitting = ref(false);
const editFileInput = ref<HTMLInputElement | null>(null);
const editPreviewImage = ref<string>('/placeholder.jpg');

const growLogForm = ref({
  name: '',
  pdf: null as File | null,
  pdfName: '',
  startDate: '',
  endDate: '',
  harvestAmount: '',
  reviewRating: '',
  growlogUrl: '',
  notes: '',
});

const errors = ref({
  name: '',
  pdf: '',
  startDate: '',
  endDate: '',
  harvestAmount: '',
  reviewRating: '',
});

const editStrainForm = ref({
  name: '',
  brand: '',
  description: '',
  seedToHarvest: null as number | null,
  type: '',
  thcPercentage: null as number | null,
  averageYield: null as number | null,
  strainReview: null as number | null,
  image: null as File | null,
});

const editErrors = ref({
  name: '',
  brand: '',
  description: '',
  seedToHarvest: '',
  type: '',
  thcPercentage: '',
  averageYield: '',
  strainReview: '',
  image: '',
});

function handlePdfUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      alert('Le fichier doit être un PDF');
      return;
    }
    growLogForm.value.pdf = file;
    growLogForm.value.pdfName = file.name;
  }
}

function closeGrowLogModal() {
  showAddGrowLog.value = false;
  growLogSuccess.value = false;
  growLogForm.value = {
    name: '',
    pdf: null,
    pdfName: '',
    startDate: '',
    endDate: '',
    harvestAmount: '',
    reviewRating: '',
    growlogUrl: '',
    notes: '',
  };
}

async function fetchGrowLogs() {
  if (!props.strain) return;
  try {
    console.log('Fetching grow logs for strain:', props.strain.id);
    const response = await api.get(`/strains/${(props.strain as any).id || props.strain.id}/grow_logs`);
    console.log('Grow logs response:', JSON.stringify(response.data, null, 2));
    // @ts-ignore
    props.growLogs.splice(0, props.growLogs.length, ...response.data.grow_logs);
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des logs', error);
  }
}

function validateGrowLogForm() {
  let valid = true;
  errors.value = { name: '', pdf: '', startDate: '', endDate: '', harvestAmount: '', reviewRating: '' };
  if (!growLogForm.value.name) {
    errors.value.name = 'Le nom est requis';
    valid = false;
  }
  if (!growLogForm.value.pdf) {
    errors.value.pdf = 'Le PDF est requis';
    valid = false;
  }
  if (!growLogForm.value.startDate) {
    errors.value.startDate = 'La date de début est requise';
    valid = false;
  }
  if (!growLogForm.value.endDate) {
    errors.value.endDate = 'La date de fin est requise';
    valid = false;
  }
  if (!growLogForm.value.harvestAmount) {
    errors.value.harvestAmount = 'La quantité récoltée est requise';
    valid = false;
  }
  if (!growLogForm.value.reviewRating) {
    errors.value.reviewRating = 'La note est requise';
    valid = false;
  }
  return valid;
}

async function submitGrowLog() {
  if (!props.strain) return;
  if (!validateGrowLogForm()) return;
  const formData = new FormData();
  formData.append('strainId', String(props.strain.id));
  formData.append('name', growLogForm.value.name);
  formData.append('startDate', growLogForm.value.startDate || '');
  formData.append('endDate', growLogForm.value.endDate || '');
  formData.append('harvestAmount', growLogForm.value.harvestAmount || '');
  formData.append('reviewRating', growLogForm.value.reviewRating || '');
  formData.append('notes', growLogForm.value.notes || '');
  formData.append('growlogUrl', growLogForm.value.growlogUrl || '');
  if (growLogForm.value.pdf) {
    formData.append('pdfPath', growLogForm.value.pdf, growLogForm.value.pdf.name);
  }
  try {
    await api.post('/grow_logs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });
    growLogSuccess.value = true;
    await fetchGrowLogs();
    setTimeout(() => {
      closeGrowLogModal();
    }, 1000);
  } catch (error) {
    alert('Erreur lors de l\'ajout du grow log');
    console.error(error);
  }
}

function handleEditImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      editErrors.value.image = 'Le fichier doit être une image';
      return;
    }
    editStrainForm.value.image = file;
    editPreviewImage.value = URL.createObjectURL(file);
    editErrors.value.image = '';
  }
}

function removeEditImage() {
  editStrainForm.value.image = null;
  editPreviewImage.value = '/placeholder.jpg';
}

function closeEditStrainModal() {
  showEditStrain.value = false;
  editStrainForm.value = {
    name: '',
    brand: '',
    description: '',
    seedToHarvest: null,
    type: '',
    thcPercentage: null,
    averageYield: null,
    strainReview: null,
    image: null,
  };
  editPreviewImage.value = '/placeholder.jpg';
  editErrors.value = {
    name: '',
    brand: '',
    description: '',
    seedToHarvest: '',
    type: '',
    thcPercentage: '',
    averageYield: '',
    strainReview: '',
    image: '',
  };
}

function validateEditStrainForm() {
  let valid = true;
  editErrors.value = {
    name: '',
    brand: '',
    description: '',
    seedToHarvest: '',
    type: '',
    thcPercentage: '',
    averageYield: '',
    strainReview: '',
    image: '',
  };

  if (!editStrainForm.value.name) {
    editErrors.value.name = 'Le nom est requis';
    valid = false;
  }
  if (!editStrainForm.value.brand) {
    editErrors.value.brand = 'La marque est requise';
    valid = false;
  }
  if (!editStrainForm.value.description) {
    editErrors.value.description = 'La description est requise';
    valid = false;
  }
  if (!editStrainForm.value.seedToHarvest) {
    editErrors.value.seedToHarvest = 'La durée de culture est requise';
    valid = false;
  }
  if (!editStrainForm.value.type) {
    editErrors.value.type = 'Le type est requis';
    valid = false;
  }
  if (!editStrainForm.value.thcPercentage) {
    editErrors.value.thcPercentage = 'Le pourcentage de THC est requis';
    valid = false;
  }
  if (!editStrainForm.value.averageYield) {
    editErrors.value.averageYield = 'Le rendement moyen est requis';
    valid = false;
  }
  if (!editStrainForm.value.strainReview) {
    editErrors.value.strainReview = 'La note de la variété est requise';
    valid = false;
  }

  return valid;
}

async function submitEditStrain() {
  if (!props.strain || !validateEditStrainForm()) return;
  
  isSubmitting.value = true;
  const formData = new FormData();
  
  formData.append('name', editStrainForm.value.name);
  formData.append('brand', editStrainForm.value.brand);
  formData.append('description', editStrainForm.value.description);
  formData.append('seedToHarvest', String(editStrainForm.value.seedToHarvest));
  formData.append('type', editStrainForm.value.type);
  formData.append('thcPercentage', String(editStrainForm.value.thcPercentage));
  formData.append('averageYield', String(editStrainForm.value.averageYield));
  formData.append('strainReview', String(editStrainForm.value.strainReview));
  
  if (editStrainForm.value.image) {
    formData.append('image', editStrainForm.value.image);
  }

  try {
    const response = await api.put(`/strains/${props.strain.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });
    
    // Mettre à jour les données locales
    Object.assign(props.strain, response.data.strain);
    closeEditStrainModal();
  } catch (error) {
    console.error('Erreur lors de la modification de la variété:', error);
    alert('Erreur lors de la modification de la variété');
  } finally {
    isSubmitting.value = false;
  }
}

function confirmDeleteStrain() {
  showDeleteConfirm.value = true;
}

async function deleteStrain() {
  if (!props.strain) return;
  
  try {
    await api.delete(`/strains/${props.strain.id}`);
    showDeleteConfirm.value = false;
    closeEditStrainModal();
    // Émettre un événement pour informer le composant parent
    emit('strainDeleted', props.strain.id);
  } catch (error) {
    console.error('Erreur lors de la suppression de la variété:', error);
    alert('Erreur lors de la suppression de la variété');
  }
}

// Initialiser le formulaire d'édition avec les données de la variété
watch(() => props.strain, (newStrain) => {
  if (newStrain) {
    editStrainForm.value = {
      name: newStrain.name || '',
      brand: newStrain.brand || '',
      description: newStrain.description || '',
      seedToHarvest: newStrain.seedToHarvest,
      type: newStrain.type || '',
      thcPercentage: newStrain.thcPercentage,
      averageYield: newStrain.averageYield,
      strainReview: (newStrain as any).strain_review || newStrain.strainReview,
      image: null,
    };
    editPreviewImage.value = getImageUrl(newStrain);
  } else {
    editPreviewImage.value = '/placeholder.jpg';
  }
}, { immediate: true });

onMounted(() => {
  console.log('Component mounted');
  if (props.strain) {
    console.log('Strain object:', JSON.stringify(props.strain));
    console.log('Image path:', props.strain.imagePath);
  } else {
    console.log('Strain is null');
  }
});

function formatDate(date: string | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('fr-FR');
}

function formatWeeks(value: number | string | null): string {
  if (value === null || value === '') return 'N/A';
  const numValue = Number(value);
  if (isNaN(numValue)) return 'N/A';
  return `${numValue} semaines`;
}

function formatPercentage(value: number | string | null): string {
  if (value === null || value === '') return 'N/A';
  const numValue = Number(value);
  if (isNaN(numValue)) return 'N/A';
  return `${numValue.toFixed(2)}%`;
}

function formatGrams(value: number | string | null): string {
  if (value === null || value === '') return 'N/A';
  const numValue = Number(value);
  if (isNaN(numValue)) return 'N/A';
  return `${numValue.toFixed(2)}g`;
}

function formatRating(value: number | string | null): string {
  if (value === null || value === '') return 'N/A';
  const numValue = Number(value);
  if (isNaN(numValue)) return 'N/A';
  return `${numValue}/5`;
}

function getRatingStars(rating: number | string | null): number {
  if (rating === null || rating === undefined || rating === '') return 0;
  const numRating = Number(rating);
  if (isNaN(numRating)) return 0;
  return Math.round(numRating);
}

function openGrowLogDetails(log: GrowLog) {
  selectedGrowLog.value = log;
  showGrowLogDetails.value = true;
}

function closeGrowLogDetails() {
  showGrowLogDetails.value = false;
  selectedGrowLog.value = null;
}

function downloadPdf(log: GrowLog) {
  if (log.pdfPath) {
    window.open(`${API_BASE}${log.pdfPath}`, '_blank');
  }
}

function openGrowLogUrl(log: GrowLog) {
  if (log.growlogUrl) {
    window.open(log.growlogUrl, '_blank');
  }
}

function getImageUrl(strain: Strain | null): string {
  const defaultImage = '/placeholder.jpg' as const;
  
  if (!strain) {
    return defaultImage;
  }
  
  const path = strain.imagePath;
  if (!path) {
    return defaultImage;
  }
  
  const filename = path.split('/').pop();
  if (!filename) {
    return defaultImage;
  }
  
  const imageUrl = `${API_BASE}/api/uploads/strains-${filename}`;
  return imageUrl || defaultImage;
}
</script>

<style scoped>
.right-container {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr;
  gap: 20px;
  padding: 20px;
  background-color: #388e3c;
  position: relative;
  z-index: 1;
  height: inherit;
}

.image-container {
  grid-column: 1;
  grid-row: 1;
}

.strain-image {
  width: 240px;
  height: 240px;
  background-color: #c8e6c9;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 4px solid #333;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.3);
}

.image-title {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 8px;
  color: white;
  width: 100%;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 1px;
}

.strain-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.led-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle at 30% 30%, #f44336, #b71c1c);
  border-radius: 50%;
  border: 2px solid #333;
  box-shadow: 0 0 5px #f44336;
  animation: blink-red 3s infinite;
}

.info-box {
  background-color: #c8e6c9;
  border-radius: 10px;
  padding: 15px;
  grid-column: 1;
  grid-row: 2;
  border: 4px solid #333;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.2);
  position: relative;
}

.info-box::before {
  content: "INFORMATIONS GÉNÉRALES";
  display: block;
  background-color: #81c784;
  margin: -15px -15px 10px -15px;
  padding: 8px 15px;
  font-weight: bold;
  border-bottom: 2px solid #333;
  color: #333;
  text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
}

.info-box ul {
  list-style-type: square;
  margin-left: 20px;
  color: #333;
  font-weight: bold;
}

.info-box li {
  margin-bottom: 5px;
}

.strain-description {
  background-color: #a5d6a7;
  border-radius: 10px;
  padding: 0 15px 15px 15px;
  grid-column: 2;
  grid-row: 1;
  color: #333;
  max-height: 240px;
  border: 4px solid #333;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.2);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
  overflow: hidden;
}

.strain-description-header {
  background-color: #81c784;
  margin: -15px -15px 0 -15px;
  padding: 15px 15px 8px 15px;
  font-weight: bold;
  border-bottom: 2px solid #333;
  color: #333;
  text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
  position: relative;
  z-index: 2;
  font-size: 1.2em;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.strain-description-content {
  max-height: 180px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 8px;
}

.strain-description-content::-webkit-scrollbar {
  width: 12px;
}

.strain-description-content::-webkit-scrollbar-track {
  background: #81c784;
  border-radius: 4px;
}

.strain-description-content::-webkit-scrollbar-thumb {
  background: #388e3c;
  border-radius: 4px;
  border: 2px solid #333;
}

.strain-description-content::-webkit-scrollbar-thumb:hover {
  background: #2e7d32;
}

.info-table {
  background-color: #a5d6a7;
  border-radius: 10px;
  padding: 15px;
  grid-column: 2;
  grid-row: 2;
  border: 4px solid #333;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.2);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.info-table::before {
  content: "JOURNAUX DE CULTURE";
  display: block;
  background-color: #81c784;
  margin: -15px -15px 10px -15px;
  padding: 8px 15px;
  font-weight: bold;
  border-bottom: 2px solid #333;
  color: #333;
  text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
  position: sticky;
  top: 0;
  z-index: 2;
}

.strain-description::after,
.info-table::after,
.info-box::after,
.strain-image::after {
  content: '';
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 10px;
  height: 10px;
  background-color: #333;
  z-index: 2;
}

.table-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  border: 2px solid #333;
  border-radius: 4px;
  background-color: #c8e6c9;
  position: relative;
}

.table-container::-webkit-scrollbar {
  width: 12px;
}

.table-container::-webkit-scrollbar-track {
  background: #81c784;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #388e3c;
  border-radius: 4px;
  border: 2px solid #333;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #2e7d32;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 2px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  color: #333;
  flex: 1;
  overflow-y: auto;
}

th, td {
  padding: 8px;
  text-align: center;
  border: 2px solid #333;
  background-color: #c8e6c9;
}

th {
  background-color: #81c784;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1px;
  color: #333;
  text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.3);
  position: sticky;
  top: 0;
  z-index: 2;
}

tr:nth-child(even) td {
  background-color: #dcedc8;
}

td {
  position: relative;
}

td:first-child {
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
}

tr:hover td {
  background-color: #9ccc65;
  transition: background-color 0.2s;
}

@keyframes blink-red {
  0%, 92%, 94%, 96%, 98%, 100% { opacity: 1; }
  93%, 95%, 97%, 99% { opacity: 0.3; }
}

.add-growlog-btn-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 2px solid #333;
}

.button.add-growlog {
  background-color: #dcedc8;
  border: none;
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
  transition: all 0.2s;
}

.button.add-growlog:hover {
  background-color: #c5e1a5;
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
}

.button.edit-strain {
  background-color: #dcedc8;
  border: none;
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
  transition: all 0.2s;
}

.button.edit-strain:hover {
  background-color: #c5e1a5;
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
}

.button.delete {
  background-color: #ffcdd2;
  color: #c62828;
}

.button.delete:hover {
  background-color: #ef9a9a;
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-input input {
  width: 80px;
}

.rating-input .rating-stars {
  display: flex;
  gap: 4px;
  font-size: 24px;
  line-height: 1;
}

.rating-input .rating-stars span {
  cursor: pointer;
  color: #808080;
  transition: color 0.2s;
}

.rating-input .rating-stars span.active {
  color: #DAA520;
}

.image-upload {
  margin-bottom: 10px;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.remove-image {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f44336;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.remove-image:hover {
  background-color: #d32f2f;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: #e8f5e9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 3px solid #333;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 60px;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  background-color: #81c784;
  padding: 10px 0;
  border-bottom: 2px solid #333;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  letter-spacing: 1px;
  text-shadow: 1px 1px 0px rgba(255,255,255,0.3);
}

.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.form-group {
  flex: 1;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 4px;
  color: #333;
  font-size: 0.9rem;
}

input, select, textarea {
  width: 100%;
  padding: 6px;
  border: 2px solid #333;
  background-color: #e8f5e9;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  border-radius: 4px;
}

textarea {
  min-height: 80px;
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

.form-row.buttons {
  display: flex;
  gap: 15px;
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
  transition: all 0.2s;
  min-width: 120px;
}

.button:hover {
  background-color: #c5e1a5;
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
}

.button.cancel {
  background-color: #ffcdd2;
}

.button.submit {
  background-color: #c8e6c9;
}

.success-message {
  color: #388e3c;
  font-weight: bold;
  margin-top: 10px;
  text-align: right;
}

.growlog-name {
  cursor: pointer;
  color: #388e3c;
  text-decoration: underline;
}

.growlog-name:hover {
  color: #1b5e20;
}

.growlog-details {
  padding: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-row h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.rating-display {
  display: flex;
  gap: 2px;
}

.rating-display span {
  color: #ccc;
  font-size: 20px;
}

.rating-display span.filled {
  color: #DAA520;
}

.detail-info {
  background-color: #e8f5e9;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 2px solid #333;
}

.detail-info p {
  margin: 8px 0;
  color: #333;
}

.detail-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.detail-actions .button {
  flex: 1;
}

.detail-actions .button.cancel {
  background-color: #ffcdd2;
}

.detail-actions .button.cancel:hover {
  background-color: #ef9a9a;
}

textarea {
  width: 100%;
  padding: 8px;
  border: 2px solid #333;
  background-color: #e8f5e9;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  border-radius: 4px;
  resize: vertical;
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

.rating-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-stars {
  display: flex;
  gap: 4px;
  font-size: 32px;
  line-height: 1;
  font-family: 'Press Start 2P', 'Courier New', monospace;
  image-rendering: pixelated;
  transform: scale(0.8);
  transform-origin: left center;
}

.rating-stars span {
  color: #808080;
  text-shadow: 
    2px 0 0 #000,
    -2px 0 0 #000,
    0 2px 0 #000,
    0 -2px 0 #000,
    2px 2px 0 #000,
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
}

.rating-stars span.filled {
  color: #DAA520;
  text-shadow: 
    2px 0 0 #8B4513,
    -2px 0 0 #8B4513,
    0 2px 0 #8B4513,
    0 -2px 0 #8B4513,
    2px 2px 0 #8B4513,
    -2px -2px 0 #8B4513,
    2px -2px 0 #8B4513,
    -2px 2px 0 #8B4513;
  animation: star-pulse 2s infinite;
}

@keyframes star-pulse {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.05);
    filter: brightness(1.1);
  }
}

.info-table .rating-stars {
  font-size: 24px;
  justify-content: center;
  transform: scale(0.7);
}

.growlog-details .rating-stars {
  font-size: 40px;
  transform: scale(0.9);
}

.info-box .rating-stars {
  font-size: 32px;
  transform: scale(0.8);
}

.rating-stars span::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
}
</style>