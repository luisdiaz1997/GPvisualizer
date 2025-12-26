<script setup>
import { reactive, computed, ref } from 'vue';
import GPCanvas from '@/components/GPCanvas.vue';
import KernelParameters from '@/components/KernelParameters.vue';
import ActionsPanel from '@/components/ActionsPanel.vue';

// Canvas ref to call sampleGP method
const canvasRef = ref(null);

// Bounds for coordinates (for random point generation)
const bounds = { xMin: -3, xMax: 3, yMin: -2, yMax: 2 };

// Reactive state
const points = reactive([]);
const selectedKernel = ref('rbf');

const params = reactive([
  { key: 'lengthScale', label: 'Length Scale (ℓ)', value: 1.0, min: 0.1, max: 3, step: 0.05 },
  { key: 'signalVariance', label: 'Signal Variance (σ²)', value: 1.0, min: 0.1, max: 3, step: 0.05 },
  { key: 'noiseLevel', label: 'Noise Level (σₙ)', value: 0.1, min: 0.01, max: 0.5, step: 0.01 },
]);

// Computed GP params - reactive to changes
const gpParams = computed(() => ({
  lengthScale: params.find(p => p.key === 'lengthScale').value,
  signalVariance: params.find(p => p.key === 'signalVariance').value,
  noiseLevel: params.find(p => p.key === 'noiseLevel').value,
  kernel: selectedKernel.value,
}));

// Event handlers
function addPoint(point) {
  points.push(point);
}

function addRandomPoints() {
  for (let i = 0; i < 5; i++) {
    const x = bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin);
    const y = bounds.yMin + Math.random() * (bounds.yMax - bounds.yMin);
    points.push({ x, y });
  }
}

function sampleGP() {
  canvasRef.value?.sampleGP();
}

function clearAll() {
  points.length = 0;
}

function updateParamValue(index, value) {
  params[index].value = value;
}

function updateKernel(kernel) {
  selectedKernel.value = kernel;
}
</script>

<template>
  <div class="container">
    <header>
      <div class="logo">𝒢</div>
      <div>
        <h1>Gaussian Process Visualizer</h1>
        <div class="subtitle">Interactive posterior inference</div>
      </div>
    </header>

    <div class="main-grid">
      <div class="canvas-area">
        <GPCanvas
          ref="canvasRef"
          :points="points"
          :params="gpParams"
          @add-point="addPoint"
        />
        <ActionsPanel
          @add-random="addRandomPoints"
          @sample-gp="sampleGP"
          @clear-all="clearAll"
        />
        <div class="info-message">
          Click on the canvas to add observations. The GP posterior updates in real-time.
        </div>
      </div>

      <div class="sidebar">
        <KernelParameters
          :params="params"
          @update-param="updateParamValue"
          @update-kernel="updateKernel"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.canvas-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-message {
  font-size: 13px;
  color: #666;
  text-align: center;
  padding: 12px;
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.1);
  border-radius: 12px;
}
</style>
