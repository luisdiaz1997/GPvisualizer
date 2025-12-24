<script setup>
const emit = defineEmits(['add-random', 'sample-gp', 'clear-all']);
</script>

<template>
  <div class="panel">
    <div class="panel-header">
      <div class="panel-title">Actions</div>
    </div>
    <div class="panel-content">
      <div class="button-group">
        <button class="btn-primary" @click="emit('add-random')">
          <span>✦</span> Add Random Points
        </button>
        <button class="btn-secondary" @click="emit('sample-gp')">
          <span>〰</span> Sample GP
        </button>
        <button class="btn-danger" @click="emit('clear-all')">
          <span>✕</span> Clear All
        </button>
      </div>
    </div>
  </div>

  <div class="info-panel">
    <p><strong>Click</strong> on the canvas to add observations. The GP posterior updates in real-time.</p>
  </div>
</template>

<style scoped>
.panel {
  background: #12121a;
  border-radius: 16px;
  border: 1px solid #1e1e2e;
  overflow: hidden;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #1e1e2e;
  background: #0d0d12;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.panel-content {
  padding: 20px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

button {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
}

.btn-secondary {
  background: #1e1e2e;
  color: #888;
  border: 1px solid #2a2a3a;
}

.btn-secondary:hover {
  background: #2a2a3a;
  color: #fff;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.2);
}

.info-panel {
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.info-panel p {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.info-panel strong {
  color: #888;
}
</style>
