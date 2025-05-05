<template>
  <div class="strain-list">
    <div>
      <div class="strain-item" 
           v-for="strain in strains" 
           :key="strain.id"
           :class="{ active: selectedId === strain.id }"
           @click="$emit('selectStrain', strain.id)">
        <div class="retro-arrow" v-if="selectedId === strain.id"></div>
        <div class="strain-number">{{ strain.number }}</div>
        <div class="strain-item-img">
          <img :src="getImageUrl(strain)" :alt="`${strain.name} Thumbnail`">
        </div>
        <span>{{ strain.name }}</span>
        <div class="strain-type">{{ strain.brand }}</div>
      </div>
    </div>
    <div class="buttons-container">
      <button class="button" @click="$emit('addStrain')">Ajouter une variété</button>
      <button class="button" @click="$emit('sortStrains')">Trier les variétés</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, onMounted } from 'vue';
import type { Strain } from '@/stores/strain';

const API_BASE = 'https://api.weedex-project.orb.local';

const props = defineProps<{
  strains: Strain[];
  selectedId?: number | null;
}>();

const emit = defineEmits(['selectStrain', 'addStrain', 'sortStrains']);

onMounted(() => {
  console.log('StrainList mounted with strains:', props.strains);
  // Debug image paths
  props.strains.forEach(strain => {
    console.log(`Strain ${strain.name} image path:`, strain.image_path);
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
  const path = (strain as any).imagePath || strain.image_path;
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
  max-height: 535px;
  padding: 10px;
  margin-bottom: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  flex-grow: 1;
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
}

.strain-item.active {
  background-color: #dcedc8;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
  border: 2px solid #333;
  padding-left: 20px;
  margin-left: 10px;
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

.strain-number {
  font-size: 12px;
  color: #333;
  font-weight: bold;
  margin-right: 10px;
}

.strain-type {
  font-size: 12px;
  color: #666;
  margin-left: auto;
  background-color: #c5e1a5;
  padding: 2px 5px;
  border: 1px solid #333;
}

.buttons-container {
  display: flex;
  gap: 15px;
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
</style>