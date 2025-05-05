<template>
  <div class="weedex-container">
    <WeedexHeader :strainTitle="currentStrain ? `${currentStrain.name} - ${currentStrain.brand}` : ''" />
    <div class="scan-line"></div>
    <div class="weedex-content">
      <div class="left-section">
        <StrainList 
          :strains="strains" 
          :selectedId="currentStrainId"
          @selectStrain="selectStrain"
          @addStrain="showAddStrainForm = true"
          @sortStrains="sortStrains"
        />
      </div>
      <StrainDetail 
        :strain="currentStrain" 
        :growLogs="growLogs"
        @viewGrowLog="viewGrowLog"
      />
    </div>
    <div v-if="showAddStrainForm" class="modal-backdrop">
      <div class="modal-content">
        <AddStrainForm 
          @submit="addStrain" 
          @cancel="showAddStrainForm = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import WeedexHeader from '@/components/WeedexHeader.vue';
import StrainList from '@/components/StrainList.vue';
import StrainDetail from '@/components/StrainDetail.vue';
import AddStrainForm from '@/components/AddStrainForm.vue';
import api from '@/services/api';
import type { Strain, GrowLog } from '@/types';

const strains = ref<Strain[]>([]);
const currentStrain = ref<Strain | null>(null);
const currentStrainId = ref<number | null>(null);
const growLogs = ref<GrowLog[]>([]);
const showAddStrainForm = ref(false);

const fetchStrains = async () => {
  try {
    console.log('%c Fetching strains...', 'background: #222; color: #bada55; font-size: 20px;');
    const response = await api.get('/strains');
    console.log('%c API response:', 'background: #222; color: #bada55; font-size: 16px;', response.data);
    console.log('%c Number of strains received:', 'background: #222; color: #bada55; font-size: 16px;', response.data.strains.length);
    strains.value = response.data.strains;
    
    if (strains.value.length > 0) {
      console.log('%c First strain:', 'background: #222; color: #bada55; font-size: 16px;', strains.value[0]);
      await selectStrain(strains.value[0].id);
    } else {
      console.log('%c No strains found', 'background: #222; color: #bada55; font-size: 16px;');
    }
  } catch (error) {
    console.error('%c Error fetching strains:', 'background: #222; color: #ff0000; font-size: 16px;', error);
  }
};

const selectStrain = async (id: number) => {
  try {
    currentStrainId.value = id;
    const response = await api.get(`/strains/${id}`);
    currentStrain.value = response.data.strain;
    console.log('Selected strain:', currentStrain.value);
    
    const logsResponse = await api.get(`/strains/${id}/grow_logs`);
    growLogs.value = logsResponse.data.grow_logs;
  } catch (error) {
    console.error('Error selecting strain:', error);
  }
};

const sortStrains = (options: { type: 'id' | 'rating' | 'strainType', direction?: 'asc' | 'desc', value?: string }) => {
  switch (options.type) {
    case 'id':
      strains.value.sort((a, b) => {
        return options.direction === 'asc' ? a.id - b.id : b.id - a.id;
      });
      break;
    case 'rating':
      strains.value.sort((a, b) => {
        const ratingA = a.strainReview || 0;
        const ratingB = b.strainReview || 0;
        return options.direction === 'desc' ? ratingB - ratingA : ratingA - ratingB;
      });
      break;
    case 'strainType':
      const targetType = options.value?.toLowerCase();
      strains.value.sort((a, b) => {
        const typeA = (a.type || '').toLowerCase();
        const typeB = (b.type || '').toLowerCase();
        
        // Si les deux types correspondent au type cible
        if (typeA === targetType && typeB === targetType) {
          return a.id - b.id; // Tri secondaire par ID
        }
        
        // Si seul le premier type correspond
        if (typeA === targetType) return -1;
        
        // Si seul le second type correspond
        if (typeB === targetType) return 1;
        
        // Si aucun ne correspond, tri par ID
        return a.id - b.id;
      });
      break;
  }
};

const viewGrowLog = (id: number) => {
  // Navigation ou affichage d'un log de culture
  console.log('View grow log:', id);
};

const addStrain = async (formData: FormData) => {
  try {
    const response = await api.post('/strains', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });
    strains.value.push(response.data.strain);
    showAddStrainForm.value = false;
    await selectStrain(response.data.strain.id);
  } catch (error) {
    console.error('Error adding strain:', error);
  }
};

// Navigation au clavier (flèches haut/bas)
function handleKeyDown(event: KeyboardEvent) {
  if (!strains.value.length) return;
  if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
  const currentIndex = strains.value.findIndex(s => s.id === currentStrainId.value);
  if (event.key === 'ArrowDown') {
    if (currentIndex < strains.value.length - 1) {
      selectStrain(strains.value[currentIndex + 1].id);
      event.preventDefault();
    }
  } else if (event.key === 'ArrowUp') {
    if (currentIndex > 0) {
      selectStrain(strains.value[currentIndex - 1].id);
      event.preventDefault();
    }
  }
}

onMounted(() => {
  console.log('%c HomeView component mounted', 'background: #222; color: #bada55; font-size: 20px;');
  fetchStrains();
  window.addEventListener('keydown', handleKeyDown);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.weedex-container {
  width: 100vw;
  height: 100vh;
  background-color: #5cb85c;
  overflow: hidden;
  position: relative;
}
.scan-line {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background-color: rgba(255, 255, 255, 0.2);
  animation: scan 2s linear infinite;
  pointer-events: none;
  z-index: 1000;
}
@keyframes scan {
  0% { top: 0; }
  100% { top: 100%; }
}
.weedex-content {
  display: grid;
  grid-template-columns: 1fr 3fr;
  background-color: #43a047;
  position: relative;
  height: calc(100vh - 115px);
  overflow: hidden;
}
.left-section {
  display: flex;
  flex-direction: column;
  background-color: #43a047;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
  padding: 15px;
  position: relative;
  z-index: 1;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-family: 'Courier New', monospace;
}
.button {
  background-color: #dcedc8;
  border: none;
  padding: 10px 15px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  cursor: pointer;
  color: #333;
  font-weight: bold;
  transition: all 0.2s;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  border: 3px solid #333;
  box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.5);
}
.button:hover {
  background-color: #c5e1a5;
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
}
</style>