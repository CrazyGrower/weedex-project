<template>
  <div class="strain-list">
    <div class="strains-container">
      <div class="strain-item" 
           v-for="strain in strains" 
           :key="strain.id"
           :class="{ 
             active: selectedId === strain.id,
             'type-sativa': strain.type.toLowerCase() === 'sativa',
             'type-indica': strain.type.toLowerCase() === 'indica',
             'type-hybrid': strain.type.toLowerCase() === 'hybrid'
           }"
           @click="$emit('selectStrain', strain.id)">
        <div class="retro-arrow" v-if="selectedId === strain.id"></div>
        <div class="strain-number">#{{ String(strain.id).padStart(3, '0') }}</div>
        <div class="strain-item-img">
          <img :src="getImageUrl(strain)" :alt="`${strain.name} Thumbnail`">
        </div>
        <span>{{ strain.name }}</span>
        <div class="strain-type">{{ strain.brand }}</div>
      </div>
    </div>
    <div class="buttons-container">
      <button class="button" @click="$emit('addStrain')">Ajouter une variété</button>
      <div class="sort-container">
        <button class="button" @click="toggleSortMenu">Trier les variétés</button>
        <div v-if="showSortMenu" class="sort-menu">
          <div class="sort-section">
            <div class="sort-title">Par ID</div>
            <button @click="sortById('asc')">Du plus petit au plus grand</button>
            <button @click="sortById('desc')">Du plus grand au plus petit</button>
          </div>
          <div class="sort-section">
            <div class="sort-title">Par note</div>
            <button @click="sortByRating('desc')">De la meilleure à la moins bonne</button>
            <button @click="sortByRating('asc')">De la moins bonne à la meilleure</button>
          </div>
          <div class="sort-section">
            <div class="sort-title">Par type</div>
            <button @click="sortByType('sativa')">Sativa</button>
            <button @click="sortByType('indica')">Indica</button>
            <button @click="sortByType('hybrid')">Hybrid</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Légende des types -->
    <div class="type-legend">
      <div class="legend-item">
        <div class="legend-color type-sativa"></div>
        <div class="legend-text">Sativa</div>
      </div>
      <div class="legend-item">
        <div class="legend-color type-indica"></div>
        <div class="legend-text">Indica</div>
      </div>
      <div class="legend-item">
        <div class="legend-color type-hybrid"></div>
        <div class="legend-text">Hybrid</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, onMounted, ref } from 'vue';
import type { Strain } from '@/types';

const API_BASE = 'https://api.weedex-project.orb.local';

const props = defineProps<{
  strains: Strain[];
  selectedId?: number | null;
}>();

const emit = defineEmits(['selectStrain', 'addStrain', 'sortStrains']);

const showSortMenu = ref(false);

function toggleSortMenu() {
  showSortMenu.value = !showSortMenu.value;
}

function sortById(direction: 'asc' | 'desc') {
  emit('sortStrains', { type: 'id', direction });
  showSortMenu.value = false;
}

function sortByRating(direction: 'asc' | 'desc') {
  emit('sortStrains', { type: 'rating', direction });
  showSortMenu.value = false;
}

function sortByType(type: 'sativa' | 'indica' | 'hybrid') {
  emit('sortStrains', { type: 'type', value: type });
  showSortMenu.value = false;
}

onMounted(() => {
  console.log('StrainList mounted with strains:', props.strains);
  // Debug image paths
  props.strains.forEach(strain => {
    console.log(`Strain ${strain.name} image path:`, strain.imagePath);
    console.log(`Constructed image URL:`, getImageUrl(strain));
  });
});

// Improved function to extract the filename from a path
function getFilenameFromPath(path: string | undefined | null): string {
  if (!path) return '';
  
  // Check if it's already a filename without a path
  if (!path.includes('/')) return path;
  
  const parts = path.split('/');
  return parts[parts.length - 1];
}

function getImageUrl(strain: Strain): string {
  const path = strain.imagePath;
  if (path) {
    const filename = getFilenameFromPath(path);
    return `${API_BASE}/api/uploads/strains-${filename}`;
  }
  return '/placeholder.jpg';
}
</script>

<style scoped>
.strain-list {
  background-color: #a5d6a7;
  border-radius: 8px;
  border: 4px solid #333;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.2);
  font-family: 'Courier New', monospace;
  color: #333;
  font-weight: bold;
  position: relative;
  height: 632px;
  padding: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.strains-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  padding-right: 5px;
}

.strains-container::-webkit-scrollbar {
  width: 12px;
}

.strains-container::-webkit-scrollbar-track {
  background: #81c784;
  border-radius: 4px;
}

.strains-container::-webkit-scrollbar-thumb {
  background: #388e3c;
  border-radius: 4px;
  border: 2px solid #333;
}

.strains-container::-webkit-scrollbar-thumb:hover {
  background: #2e7d32;
}

.strain-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  background-color: #aed581;
  padding: 8px;
  cursor: pointer;
  position: relative;
  border: 2px solid #333;
  height: 46px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.strain-item.type-sativa {
  border: 2px solid #f44336;
}

.strain-item.type-indica {
  border: 2px solid #3f51b5;
}

.strain-item.type-hybrid {
  border: 2px solid #9c27b0;
}

.strain-item.active {
  background-color: #dcedc8;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
  padding-left: 20px;
  margin-left: 10px;
}

.strain-item.active.type-sativa {
  border: 2px solid #f44336;
}

.strain-item.active.type-indica {
  border: 2px solid #3f51b5;
}

.strain-item.active.type-hybrid {
  border: 2px solid #9c27b0;
}

.retro-arrow {
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 12px solid #333;
  animation: arrow-pulse 1s infinite;
  filter: drop-shadow(1px 1px 0 rgba(255, 255, 255, 0.5));
}

@keyframes arrow-pulse {
  0%, 100% {
    left: -10px;
  }
  50% {
    left: -6px;
  }
}

.strain-item-img {
  width: 30px;
  height: 30px;
  background-color: #333;
  margin-right: 15px;
  position: relative;
  overflow: hidden;
}

.strain-item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.strain-type {
  font-size: 12px;
  color: #333;
  margin-left: auto;
  padding: 2px 8px;
  border: 1px solid #333;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.strain-item.type-sativa .strain-type {
  background: #ffebee;
  border-color: #f44336;
  color: #d32f2f;
}

.strain-item.type-indica .strain-type {
  background: #e8eaf6;
  border-color: #3f51b5;
  color: #283593;
}

.strain-item.type-hybrid .strain-type {
  background: #f3e5f5;
  border-color: #9c27b0;
  color: #6a1b9a;
}

.buttons-container {
  display: flex;
  gap: 15px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 2px solid #333;
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
  flex-grow: 1;
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

.strain-number {
  font-size: 12px;
  color: #333;
  font-weight: bold;
  margin-right: 10px;
}

.sort-container {
  position: relative;
  flex-grow: 1;
}

.sort-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 10px;
  background-color: #dcedc8;
  border: 3px solid #333;
  border-radius: 4px;
  padding: 10px;
  min-width: 250px;
  box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.sort-section {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #333;
}

.sort-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.sort-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1px;
}

.sort-menu button {
  display: block;
  width: 100%;
  padding: 8px;
  margin: 5px 0;
  background-color: #c8e6c9;
  border: 2px solid #333;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.sort-menu button:hover {
  background-color: #a5d6a7;
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
}

/* Légende des types */
.type-legend {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 2px solid #333;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0 10px;
}

.legend-color {
  width: 16px;
  height: 16px;
  margin-right: 5px;
  border-radius: 3px;
  border: 2px solid;
}

.legend-color.type-sativa {
  border-color: #f44336;
}

.legend-color.type-indica {
  border-color: #3f51b5;
}

.legend-color.type-hybrid {
  border-color: #9c27b0;
}

.legend-text {
  font-size: 12px;
  font-weight: bold;
}
</style>