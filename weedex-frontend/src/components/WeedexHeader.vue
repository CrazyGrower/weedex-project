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
    <div class="speaker-grills">
      <div class="speaker-grill"></div>
      <div class="speaker-grill"></div>
      <div class="speaker-grill"></div>
    </div>
    <div class="strain-title">{{ strainTitle || 'Sélectionnez une variété' }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  strainTitle: String
});
</script>

<style scoped>
.svg-bar-container {
  position: relative;
  width: 100%;
  height: 115px;
  overflow: hidden;
  filter: drop-shadow(0px 5px 5px rgba(0, 0, 0, 0.5));
  background-color: #388e3c;
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

.speaker-grills {
  position: absolute;
  top: 50px;
  right: 40px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 10;
}

.speaker-grill {
  width: 40px;
  height: 5px;
  background-color: #333;
  border-radius: 2px;
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