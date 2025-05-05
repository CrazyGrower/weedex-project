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
      {{ strain.description || 'Aucune description disponible.' }}
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
import { defineProps, defineEmits, onMounted, ref } from 'vue';
import type { Strain, GrowLog } from '@/types';
import api from '@/services/api';

const API_BASE = 'https://api.weedex-project.orb.local';

const props = defineProps<{
  strain: Strain | null;
  growLogs: GrowLog[];
}>();

defineEmits(['viewGrowLog']);

const showAddGrowLog = ref(false);
const growLogSuccess = ref(false);
const showGrowLogDetails = ref(false);
const selectedGrowLog = ref<GrowLog | null>(null);

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

function getImageUrl(strain: Strain | null) {
  if (!strain) {
    return '/placeholder.jpg';
  }
  const path = strain.imagePath;
  if (path) {
    const filename = path.split('/').pop();
    return `${API_BASE}/api/uploads/strains-${filename}`;
  }
  return '/placeholder.jpg';
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
  padding: 15px;
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
}

.strain-description::before {
  content: "DESCRIPTION";
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
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border: 3px solid #333;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.modal-content h2 {
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
.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}
.form-group {
  flex: 1;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
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