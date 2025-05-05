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
      {{ strain.description || (strain as any).description || 'Aucune description disponible.' }}
    </div>
    <div class="info-box">
      <ul>
        <li>Durée de culture : {{ formatNumber((strain as any).seedToHarvest ?? strain.seed_to_harvest) }} semaines</li>
        <li>Type : {{ strain.type || (strain as any).type || 'N/A' }}</li>
        <li>Taux de THC : {{ formatNumber((strain as any).thcPercentage ?? strain.thc_percentage) }} %</li>
        <li>Rendement : {{ formatNumber((strain as any).averageYield ?? strain.average_yield) }}g</li>
      </ul>
    </div>
    <div class="info-table">
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
              <template v-if="log.pdf_path || log.pdfPath">
                <a :href="getPdfUrl(log)" 
                   target="_blank" 
                   download 
                   class="pdf-link"
                   @click="handlePdfClick(log)">
                  {{ log.name }}
                </a>
              </template>
              <template v-else>
                <span class="no-pdf">{{ log.name }}</span>
                <span class="pdf-missing">(PDF non disponible)</span>
              </template>
            </td>
            <td>{{ formatDate((log as any).startDate ?? log.start_date) }}</td>
            <td>{{ formatDate((log as any).endDate ?? log.end_date) }}</td>
            <td>{{ formatNumber((log as any).harvestAmount ?? log.harvest_amount) }}g</td>
            <td>{{ formatNumber((log as any).reviewRating ?? log.review_rating) }}/5</td>
          </tr>
          <tr v-if="!growLogs.length">
            <td colspan="5" class="text-center">Aucun log de culture pour cette variété</td>
          </tr>
        </tbody>
      </table>
      <div class="add-growlog-btn-container">
        <button class="button add-growlog" @click="showAddGrowLog = true">Ajouter un Grow Log</button>
      </div>
    </div>
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
              <input id="growlog-start" type="date" v-model="growLogForm.start_date" :class="{ error: errors.start_date }" required />
              <span v-if="errors.start_date" class="error-message">{{ errors.start_date }}</span>
            </div>
            <div class="form-group half">
              <label for="growlog-end">Date de fin *</label>
              <input id="growlog-end" type="date" v-model="growLogForm.end_date" :class="{ error: errors.end_date }" required />
              <span v-if="errors.end_date" class="error-message">{{ errors.end_date }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label for="growlog-harvest">Récolte (g) *</label>
              <input id="growlog-harvest" type="number" v-model="growLogForm.harvest_amount" :class="{ error: errors.harvest_amount }" min="0" step="0.01" required placeholder="Quantité récoltée" />
              <span v-if="errors.harvest_amount" class="error-message">{{ errors.harvest_amount }}</span>
            </div>
            <div class="form-group half">
              <label for="growlog-review" class="label-tooltip" data-tooltip="Note de la session (de 1 à 5)">Note *</label>
              <input id="growlog-review" type="number" v-model="growLogForm.review_rating" :class="{ error: errors.review_rating }" min="1" max="5" required placeholder="Note sur 5" />
              <span v-if="errors.review_rating" class="error-message">{{ errors.review_rating }}</span>
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
  </div>
  <div v-else class="right-container flex items-center justify-center">
    <p class="text-xl font-bold">Sélectionnez une variété pour voir les détails</p>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, onMounted, ref } from 'vue';
import type { Strain, GrowLog } from '@/stores/strain';
import api from '@/services/api';

const API_BASE = 'https://api.weedex-project.orb.local';

const props = defineProps<{
  strain: Strain | null;
  growLogs: GrowLog[];
}>();

defineEmits(['viewGrowLog']);

const showAddGrowLog = ref(false);
const growLogSuccess = ref(false);
const growLogForm = ref({
  name: '',
  pdf: null as File | null,
  pdfName: '',
  start_date: '',
  end_date: '',
  harvest_amount: '',
  review_rating: '',
});

const errors = ref({
  name: '',
  pdf: '',
  start_date: '',
  end_date: '',
  harvest_amount: '',
  review_rating: '',
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
    start_date: '',
    end_date: '',
    harvest_amount: '',
    review_rating: '',
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
  errors.value = { name: '', pdf: '', start_date: '', end_date: '', harvest_amount: '', review_rating: '' };
  if (!growLogForm.value.name) {
    errors.value.name = 'Le nom est requis';
    valid = false;
  }
  if (!growLogForm.value.pdf) {
    errors.value.pdf = 'Le PDF est requis';
    valid = false;
  }
  if (!growLogForm.value.start_date) {
    errors.value.start_date = 'La date de début est requise';
    valid = false;
  }
  if (!growLogForm.value.end_date) {
    errors.value.end_date = 'La date de fin est requise';
    valid = false;
  }
  if (!growLogForm.value.harvest_amount) {
    errors.value.harvest_amount = 'La quantité récoltée est requise';
    valid = false;
  }
  if (!growLogForm.value.review_rating) {
    errors.value.review_rating = 'La note est requise';
    valid = false;
  }
  return valid;
}

async function submitGrowLog() {
  if (!props.strain) return;
  if (!validateGrowLogForm()) return;
  const formData = new FormData();
  formData.append('strain_id', String((props.strain as any).id || props.strain.id));
  formData.append('name', growLogForm.value.name);
  formData.append('start_date', growLogForm.value.start_date || '');
  formData.append('end_date', growLogForm.value.end_date || '');
  formData.append('harvest_amount', growLogForm.value.harvest_amount || '');
  formData.append('review_rating', growLogForm.value.review_rating || '');
  if (growLogForm.value.pdf) {
    formData.append('pdf_path', growLogForm.value.pdf, growLogForm.value.pdf.name);
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
    console.log('Image path:', props.strain.image_path);
  } else {
    console.log('Strain is null');
  }
});

function formatDate(val: any): string {
  if (!val) return 'N/A';
  const date = new Date(val);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
}

function formatNumber(val: any): string {
  if (val === null || val === undefined || val === '') return 'N/A';
  const num = Number(val);
  if (isNaN(num)) return 'N/A';
  return num.toString();
}

function handlePdfClick(log: any) {
  const url = getPdfUrl(log);
  console.log('PDF Click - Log object:', log);
  console.log('PDF Click - Generated URL:', url);
  
  if (!url) {
    console.error('PDF Click - No URL available');
    return;
  }
  
  // Vérifier si l'URL est accessible
  fetch(url)
    .then(response => {
      console.log('PDF Click - Response status:', response.status);
      console.log('PDF Click - Response headers:', response.headers);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.blob();
    })
    .then(blob => {
      console.log('PDF Click - Blob type:', blob.type);
      console.log('PDF Click - Blob size:', blob.size);
    })
    .catch(error => {
      console.error('PDF Click - Error:', error);
    });
}

function getPdfUrl(log: any): string | undefined {
  console.log('getPdfUrl - Input log:', JSON.stringify(log, null, 2));
  const pdf = log.pdf_path || log.pdfPath;
  console.log('getPdfUrl - PDF path:', pdf);
  
  if (!pdf) {
    console.log('getPdfUrl - No PDF path found');
    return undefined;
  }
  
  // Si le chemin est déjà une URL complète, le retourner tel quel
  if (pdf.startsWith('http')) {
    console.log('getPdfUrl - Full URL detected:', pdf);
    return pdf;
  }
  
  const filename = pdf.split('/').pop();
  const url = `${API_BASE}/api/uploads/growlogs-${filename}`;
  console.log('getPdfUrl - Constructed URL:', url);
  return url;
}

function getImageUrl(strain: Strain | null) {
  if (!strain) {
    return '/placeholder.jpg';
  }
  const path = (strain as any).imagePath || strain.image_path;
  if (path) {
    const filename = path.split('/').pop();
    return `${API_BASE}/api/uploads/strains-${filename}`;
  }
  const thumb = (strain as any).thumbnailPath || strain.thumbnail_path;
  if (thumb) {
    const filename = thumb.split('/').pop();
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
  content: "GENERAL INFO";
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
  content: "STRAIN DATA";
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
}

.info-table::before {
  content: "GROWTH RECORDS";
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

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 2px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  color: #333;
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
  margin-top: 10px;
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
.pdf-link {
  text-decoration: underline;
  color: #388e3c;
  cursor: pointer;
  display: inline-block;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.pdf-link:hover {
  background-color: #c8e6c9;
  color: #1b5e20;
}

.no-pdf {
  color: #666;
  font-style: italic;
}

.pdf-missing {
  font-size: 0.8em;
  color: #f44336;
  margin-left: 8px;
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
</style>