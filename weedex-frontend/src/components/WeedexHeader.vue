<template>
  <div class="svg-bar-container">
    <svg class="svg-bar" viewBox="0 0 1280 135" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M352.343 113H-18V-11H1297V47.0901H496.05C464.63 47.0901 415.698 113 352.343 113Z" stroke="black" stroke-width="3" shape-rendering="crispEdges"/>
    </svg>
    <div class="blue-orb"></div>
    <div class="led-container">
      <div class="small-led led-red"></div>
      <div class="small-led led-yellow"></div>
      <div class="small-led led-green"></div>
    </div>
    <h1 class="weedex-title">WEEDEX</h1>
    <div class="burger-menu-container">
      <div class="speaker-grills" :class="{ open: menuOpen }" @click="toggleMenu">
        <div class="speaker-grill"></div>
        <div class="speaker-grill"></div>
        <div class="speaker-grill"></div>
      </div>
      <div v-if="menuOpen" class="burger-dropdown">
        <button class="burger-btn" @click="loadSave">Charger sauvegarde</button>
        <button class="burger-btn" @click="saveData">Sauvegarder</button>
      </div>
    </div>
    <div class="strain-title">{{ strainTitle || 'Sélectionnez une variété' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

defineProps({
  strainTitle: String
});

const menuOpen = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

async function loadSave() {
  try {
    // Créer un input file caché
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('backup', file);

      const response = await axios.post('https://api.weedex-project.orb.local/api/load', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Sauvegarde chargée:', response.data);
      // TODO: Mettre à jour l'état de l'application avec les données chargées
      menuOpen.value = false;
    };

    input.click();
  } catch (error) {
    console.error('Erreur lors du chargement de la sauvegarde:', error);
    alert('Erreur lors du chargement de la sauvegarde');
  }
}

async function saveData() {
  try {
    const response = await axios.post('https://api.weedex-project.orb.local/api/save', {}, {
      responseType: 'blob'
    });

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `weedex-backup-${new Date().toISOString()}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    menuOpen.value = false;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    alert('Erreur lors de la sauvegarde');
  }
}
</script>

<style scoped>
.svg-bar-container {
  position: relative;
  width: 100%;
  height: 115px;
  background-color: #388e3c;
  z-index: 99999;
}

.svg-bar {
  width: 100%;
  height: 100%;
  position: relative;
  filter: drop-shadow(-5px 15px 7px #000000);
}

.svg-bar path {
  fill: #8bc34a;
  stroke: #000;
  stroke-width: 3px;
}

.strain-title {
  position: absolute;
  top: 80%;
  left: 200px;
  width: 100%;
  transform: translateY(-50%);
  color: white;
  padding: 10px 20px;
  font-size: 28px;
  text-align: center;
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
  font-weight: bold;
  z-index: 4;
}

.blue-orb {
  position: absolute;
  top: 10px;
  left: 20px;
  width: 75px;
  height: 75px;
  background: radial-gradient(circle at 30% 30%, #85c3ff, #0066cc);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 0, 255, 0.5), inset 0 0 15px white;
  border: 3px solid #333;
  z-index: 10;
}

.blue-orb:after {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  width: 20px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

.led-container {
  position: absolute;
  top: 15px;
  left: 100px;
  display: flex;
  z-index: 10;
}

.small-led {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid #333;
}

.led-red {
  background: radial-gradient(circle at 30% 30%, #ff5252, #d32f2f);
  animation: blink-red 4s infinite;
  box-shadow: 0 0 5px #ff5252;
}

.led-yellow {
  background: radial-gradient(circle at 30% 30%, #ffeb3b, #fbc02d);
  animation: blink-yellow 5s infinite;
  box-shadow: 0 0 5px #ffeb3b;
}

.led-green {
  background: radial-gradient(circle at 30% 30%, #b9f6ca, #00c853);
  animation: blink-green 6s infinite;
  box-shadow: 0 0 5px #b9f6ca;
}

.weedex-title {
  position: absolute;
  top: 40px;
  left: 150px;
  font-size: 32px;
  color: white;
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
  font-weight: bold;
  z-index: 10;
}

.burger-menu-container {
  position: absolute;
  top: 0px;
  right: 40px;
  z-index: 20;
}

.speaker-grills {
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition: transform .2s;
  position: relative; /* Ajouté pour un meilleur positionnement */
}

.speaker-grill {
  height: 6px;
  width: 100%;
  background: #333;
  border-radius: 3px;
  transition: all 0.3s;
  transform-origin: center; /* Ajouté pour une rotation plus précise */
}

/* Modification des transformations pour l'animation de la croix */
.speaker-grills.open .speaker-grill:nth-child(1) {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.speaker-grills.open .speaker-grill:nth-child(2) {
  opacity: 0;
}

.speaker-grills.open .speaker-grill:nth-child(3) {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) rotate(-45deg);
}

.burger-dropdown {
  position: absolute;
  top: 56px;
  right: 0;
  background: #c8e6c9;
  border: 3px solid #333;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 180px;
  z-index: 2100;
}

.burger-btn {
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
  border-radius: 6px;
  transition: all 0.2s;
}

.burger-btn:hover {
  background-color: #c5e1a5;
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
}

@keyframes blink-red {
  0%, 92%, 94%, 96%, 98%, 100% { opacity: 1; }
  93%, 95%, 97%, 99% { opacity: 0.3; }
}

@keyframes blink-yellow {
  0%, 89%, 91%, 93%, 95%, 97%, 99%, 100% { opacity: 1; }
  90%, 92%, 94%, 96%, 98% { opacity: 0.3; }
}

@keyframes blink-green {
  0%, 89%, 92%, 95%, 98%, 100% { opacity: 1; }
  90%, 93%, 96%, 99% { opacity: 0.3; }
}
</style>