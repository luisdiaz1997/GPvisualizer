<script setup>
import { ref } from 'vue';

const props = defineProps({
  params: Array,
});

const emit = defineEmits(['update-param', 'update-kernel']);

const selectedKernel = ref('rbf');

const kernels = [
  {
    key: 'rbf',
    name: 'RBF (Squared Exponential)',
    equation: "k(x, x') = \\sigma^2 \\exp\\left(-\\frac{\\|x-x'\\|^2}{2\\ell^2}\\right)"
  },
  {
    key: 'matern52',
    name: 'Matérn 5/2',
    equation: "k(x, x') = \\sigma^2 (1 + \\sqrt{5}r + \\frac{5r^2}{3}) \\exp(-\\sqrt{5}r)"
  },
  {
    key: 'matern32',
    name: 'Matérn 3/2',
    equation: "k(x, x') = \\sigma^2 (1 + \\sqrt{3}r) \\exp(-\\sqrt{3}r)"
  },
  {
    key: 'matern12',
    name: 'Matérn 1/2',
    equation: "k(x, x') = \\sigma^2 \\exp\\left(-\\frac{|x-x'|}{\\ell}\\right)"
  },
];


function updateParam(index, newValue) {
  emit('update-param', index, newValue);
}

function selectKernel(key) {
  selectedKernel.value = key;
  emit('update-kernel', key);
}
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <div class="panel-title">Kernel Parameters</div>
    </div>
    <div class="panel-content">
      <div class="control-group" v-for="(p, index) in props.params" :key="p.key">
        <div class="control-label">
          <span class="control-name">{{ p.label }}</span>
          <span class="control-value">{{ p.value.toFixed(2) }}</span>
        </div>
        <input
          type="range"
          :value="p.value"
          :min="p.min"
          :max="p.max"
          :step="p.step"
          @input="updateParam(index, parseFloat($event.target.value))"
        />
      </div>

      <div class="kernel-selector">
        <div class="kernel-selector-title">Kernel Function</div>
        <div class="kernel-options">
          <label 
            v-for="kernel in kernels" 
            :key="kernel.key"
            class="kernel-option"
            :class="{ active: selectedKernel === kernel.key }"
          >
            <input 
              type="radio" 
              name="kernel" 
              :value="kernel.key"
              :checked="selectedKernel === kernel.key"
              @change="selectKernel(kernel.key)"
            />
            <div class="kernel-option-content">
              <div class="kernel-name">{{ kernel.name }}</div>
              <div class="kernel-equation" v-katex="kernel.equation"></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Panel styles moved to assets/css/components.css */

.control-group {
  margin-bottom: 24px;
}

.control-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.control-name {
  font-size: 13px;
  color: #888;
}

.control-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
  padding: 4px 10px;
  border-radius: 6px;
}

input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #1e1e2e;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  cursor: pointer;
  border: 3px solid #12121a;
  transition: transform 0.2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.kernel-selector {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #1e1e2e;
}

.kernel-selector-title {
  font-size: 13px;
  color: #888;
  margin-bottom: 12px;
}

.kernel-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kernel-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #1a1a24;
  border: 1px solid #2a2a3a;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.kernel-option:hover {
  background: #1e1e2e;
  border-color: #3a3a4a;
}

.kernel-option.active {
  background: rgba(124, 58, 237, 0.1);
  border-color: #7c3aed;
}

.kernel-option input[type="radio"] {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: #7c3aed;
  cursor: pointer;
}

.kernel-option-content {
  flex: 1;
}

.kernel-name {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 4px;
}

.kernel-equation {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #7c3aed;
}
</style>
