<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { computePosterior, linspace } from '@/utils/gp';

const props = defineProps({
  points: Array,
  samples: Array,
  params: Object,
});

const emit = defineEmits(['add-point']);

// Canvas ref and context
const canvasRef = ref(null);
let ctx = null;
let width = 0;
let height = 0;

// Coordinate bounds
const bounds = { xMin: -3, xMax: 3, yMin: -2, yMax: 2 };
const numTest = 300;
const testX = linspace(bounds.xMin, bounds.xMax, numTest);

// Coordinate transforms
const toCanvasX = (x) => ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * width;
const toCanvasY = (y) => height - ((y - bounds.yMin) / (bounds.yMax - bounds.yMin)) * height;
const toDataX = (cx) => bounds.xMin + (cx / width) * (bounds.xMax - bounds.xMin);
const toDataY = (cy) => bounds.yMax - (cy / height) * (bounds.yMax - bounds.yMin);

// Drawing functions
function drawGrid() {
  if (!ctx) return;
  
  ctx.strokeStyle = '#1e1e2e';
  ctx.lineWidth = 1;

  for (let x = Math.ceil(bounds.xMin); x <= bounds.xMax; x++) {
    ctx.beginPath();
    ctx.moveTo(toCanvasX(x), 0);
    ctx.lineTo(toCanvasX(x), height);
    ctx.stroke();
  }
  for (let y = Math.ceil(bounds.yMin); y <= bounds.yMax; y++) {
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(y));
    ctx.lineTo(width, toCanvasY(y));
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = '#2a2a3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, toCanvasY(0));
  ctx.lineTo(width, toCanvasY(0));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(toCanvasX(0), 0);
  ctx.lineTo(toCanvasX(0), height);
  ctx.stroke();
}

function drawConfidenceBand(mean, variance) {
  if (!ctx) return;
  
  ctx.beginPath();
  for (let i = 0; i < testX.length; i++) {
    const x = toCanvasX(testX[i]);
    const y = toCanvasY(mean[i] + 2 * Math.sqrt(variance[i]));
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  for (let i = testX.length - 1; i >= 0; i--) {
    const x = toCanvasX(testX[i]);
    const y = toCanvasY(mean[i] - 2 * Math.sqrt(variance[i]));
    ctx.lineTo(x, y);
  }
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(124, 58, 237, 0.3)');
  grad.addColorStop(0.5, 'rgba(124, 58, 237, 0.15)');
  grad.addColorStop(1, 'rgba(124, 58, 237, 0.3)');
  ctx.fillStyle = grad;
  ctx.fill();
}

function drawMeanLine(mean) {
  if (!ctx) return;
  
  // Glow effect
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < testX.length; i++) {
    const x = toCanvasX(testX[i]);
    const y = toCanvasY(mean[i]);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Main line
  ctx.beginPath();
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 3;
  for (let i = 0; i < testX.length; i++) {
    const x = toCanvasX(testX[i]);
    const y = toCanvasY(mean[i]);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawSamples() {
  if (!ctx) return;
  
  const colors = [
    'rgba(255, 150, 150, 0.5)',
    'rgba(150, 255, 150, 0.5)',
    'rgba(150, 150, 255, 0.5)',
    'rgba(255, 255, 150, 0.5)',
    'rgba(255, 150, 255, 0.5)',
  ];
  
  props.samples.forEach((sample, s) => {
    ctx.beginPath();
    ctx.strokeStyle = colors[s % colors.length];
    ctx.lineWidth = 2;
    sample.x.forEach((xi, i) => {
      const x = toCanvasX(xi);
      const y = toCanvasY(sample.y[i]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  });
}

function drawPoints() {
  if (!ctx) return;
  
  props.points.forEach(pt => {
    const x = toCanvasX(pt.x);
    const y = toCanvasY(pt.y);

    // Outer glow
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 114, 182, 0.3)';
    ctx.fill();

    // Main dot
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f472b6';
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(x - 1.5, y - 1.5, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
  });
}

function render() {
  if (!ctx) return;

  ctx.fillStyle = '#0d0d12';
  ctx.fillRect(0, 0, width, height);

  drawGrid();
  drawSamples();

  const { mean, variance } = computePosterior(props.points, testX, props.params);
  drawConfidenceBand(mean, variance);
  drawMeanLine(mean);
  drawPoints();
}

function setupCanvas() {
  if (!canvasRef.value) return;
  
  const rect = canvasRef.value.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvasRef.value.width = rect.width * dpr;
  canvasRef.value.height = rect.height * dpr;
  ctx = canvasRef.value.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
  width = rect.width;
  height = rect.height;
  render();
}

function handleClick(e) {
  if (!canvasRef.value) return;
  
  const rect = canvasRef.value.getBoundingClientRect();
  const x = toDataX(e.clientX - rect.left);
  const y = toDataY(e.clientY - rect.top);
  emit('add-point', { x, y });
}

// Lifecycle
onMounted(() => {
  setupCanvas();
  window.addEventListener('resize', setupCanvas);
});

// Watch for changes
watch(() => props.points, render, { deep: true });
watch(() => props.samples, render, { deep: true });
watch(() => props.params, render, { deep: true });

// Computed for point count display
const pointCount = computed(() => props.points.length);
</script>

<template>
  <div class="canvas-wrapper">
    <div class="canvas-header">
      <div class="canvas-title">posterior_visualization.canvas</div>
      <div class="status">
        <div class="status-dot"></div>
        <span>Rendering</span>
      </div>
    </div>
    <canvas ref="canvasRef" @click="handleClick"></canvas>
    <div class="canvas-footer">
      <div class="point-count">Observations: <span>{{ pointCount }}</span></div>
      <div class="legend">
        <div class="legend-item">
          <div class="legend-line" style="background: #00d4ff;"></div>
          <span>Mean</span>
        </div>
        <div class="legend-item">
          <div class="legend-line" style="background: rgba(124, 58, 237, 0.4);"></div>
          <span>±2σ</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background: #f472b6;"></div>
          <span>Data</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  background: #12121a;
  border-radius: 16px;
  border: 1px solid #1e1e2e;
  overflow: hidden;
}

.canvas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #1e1e2e;
  background: #0d0d12;
}

.canvas-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #888;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #666;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

canvas {
  width: 100%;
  height: 500px;
  display: block;
  cursor: crosshair;
}

.canvas-footer {
  padding: 12px 20px;
  border-top: 1px solid #1e1e2e;
  background: #0d0d12;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.point-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #666;
}

.point-count span {
  color: #00d4ff;
}

.legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #888;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-line {
  width: 20px;
  height: 3px;
  border-radius: 2px;
}
</style>
