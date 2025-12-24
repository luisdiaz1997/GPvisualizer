import { ref, computed } from 'vue';

export function useViewport(initialBounds = { xMin: -3, xMax: 3, yMin: -2, yMax: 2 }) {
  // Config
  const MAX_SCALE_FACTOR = 5;
  const MIN_ZOOM = 1 / MAX_SCALE_FACTOR;
  const MAX_ZOOM = 3.0;

  // State
  const bounds = ref({ ...initialBounds });
  const zoomLevel = ref(1.0);
  const panOffset = ref({ x: 0, y: 0 });
  
  // Interaction state
  const isDragging = ref(false);
  const hasDragged = ref(false);
  const lastMousePos = ref({ x: 0, y: 0 });
  const initialTouchDistance = ref(0);

  // Computed methods dependent on canvas dimensions (width, height)
  // These need to be called with current dimensions
  
  const toCanvasX = (x, width) => 
    ((x - bounds.value.xMin) / (bounds.value.xMax - bounds.value.xMin)) * width;

  const toCanvasY = (y, height) => 
    height - ((y - bounds.value.yMin) / (bounds.value.yMax - bounds.value.yMin)) * height;

  const toDataX = (cx, width) => 
    bounds.value.xMin + (cx / width) * (bounds.value.xMax - bounds.value.xMin);

  const toDataY = (cy, height) => 
    bounds.value.yMax - (cy / height) * (bounds.value.yMax - bounds.value.yMin);

  // Logic
  function clampPanOffset(offset) {
    const worldWidth = (initialBounds.xMax - initialBounds.xMin) * MAX_SCALE_FACTOR;
    const worldHeight = (initialBounds.yMax - initialBounds.yMin) * MAX_SCALE_FACTOR;
    
    const viewWidth = (initialBounds.xMax - initialBounds.xMin) / zoomLevel.value;
    const viewHeight = (initialBounds.yMax - initialBounds.yMin) / zoomLevel.value;

    const maxPanX = Math.max(0, (worldWidth - viewWidth) / 2);
    const maxPanY = Math.max(0, (worldHeight - viewHeight) / 2);
    
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, offset.x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, offset.y))
    };
  }

  function updateBounds() {
    const centerX = (initialBounds.xMin + initialBounds.xMax) / 2 + panOffset.value.x;
    const centerY = (initialBounds.yMin + initialBounds.yMax) / 2 + panOffset.value.y;

    const rangeX = (initialBounds.xMax - initialBounds.xMin) / (2 * zoomLevel.value);
    const rangeY = (initialBounds.yMax - initialBounds.yMin) / (2 * zoomLevel.value);

    bounds.value = {
      xMin: centerX - rangeX,
      xMax: centerX + rangeX,
      yMin: centerY - rangeY,
      yMax: centerY + rangeY
    };
  }

  // Event Handlers
  function handleWheel(e, canvasRect) {
    if (!canvasRect) return false;
    
    e.preventDefault();
    const width = canvasRect.width;
    const height = canvasRect.height; // Unused but consistent API
    
    // We need offset relative to the canvas
    // e.clientX is viewport, rect is viewport
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    const worldX = toDataX(mouseX, width);
    const worldY = toDataY(mouseY, canvasRect.height);

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel.value * zoomFactor));

    if (newZoom !== zoomLevel.value) {
      zoomLevel.value = newZoom;

      const centerX = (initialBounds.xMin + initialBounds.xMax) / 2 + panOffset.value.x;
      const centerY = (initialBounds.yMin + initialBounds.yMax) / 2 + panOffset.value.y;

      panOffset.value.x += (worldX - centerX) * (1 - zoomFactor);
      panOffset.value.y += (worldY - centerY) * (1 - zoomFactor);
      
      panOffset.value = clampPanOffset(panOffset.value);
      updateBounds();
      return true; // Indicates update needed
    }
    return false;
  }

  function handleMouseDown(e) {
    if (e.detail === 2) return;
    isDragging.value = true;
    hasDragged.value = false;
    lastMousePos.value = { x: e.offsetX, y: e.offsetY };
    return true; // Cursor update needed
  }

  function handleMouseMove(e, width, height) {
    if (!isDragging.value) return false;

    const deltaX = e.offsetX - lastMousePos.value.x;
    const deltaY = e.offsetY - lastMousePos.value.y;

    if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
      hasDragged.value = true;
    }

    panOffset.value.x -= (deltaX / width) * (bounds.value.xMax - bounds.value.xMin);
    panOffset.value.y += (deltaY / height) * (bounds.value.yMax - bounds.value.yMin);
    
    panOffset.value = clampPanOffset(panOffset.value);

    lastMousePos.value = { x: e.offsetX, y: e.offsetY };
    updateBounds();
    return true;
  }

  function handleMouseUp() {
    const wasDragging = isDragging.value;
    isDragging.value = false;
    return wasDragging; // Cursor update needed
  }

  function handleDoubleClick() {
    zoomLevel.value = 1.0;
    panOffset.value = { x: 0, y: 0 };
    updateBounds();
    return true;
  }

  // Touch Handlers (simplified for brevity, main logic same)
  function handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      isDragging.value = true;
      lastMousePos.value = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialTouchDistance.value = Math.sqrt(dx * dx + dy * dy);
    }
  }

  function handleTouchMove(e, width, height) {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging.value) {
      const deltaX = e.touches[0].clientX - lastMousePos.value.x;
      const deltaY = e.touches[0].clientY - lastMousePos.value.y;

      panOffset.value.x -= (deltaX / width) * (bounds.value.xMax - bounds.value.xMin);
      panOffset.value.y += (deltaY / height) * (bounds.value.yMax - bounds.value.yMin);
      
      panOffset.value = clampPanOffset(panOffset.value);
      lastMousePos.value = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      updateBounds();
      return true;
    } else if (e.touches.length === 2 && initialTouchDistance.value > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);

      const zoomFactor = currentDistance / initialTouchDistance.value;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel.value * zoomFactor));

      if (newZoom !== zoomLevel.value) {
        zoomLevel.value = newZoom;
        initialTouchDistance.value = currentDistance;
        updateBounds();
        return true;
      }
    }
    return false;
  }

  function handleTouchEnd() {
    isDragging.value = false;
    initialTouchDistance.value = 0;
  }

  return {
    bounds,
    zoomLevel,
    isDragging,
    hasDragged,
    toCanvasX,
    toCanvasY,
    toDataX,
    toDataY,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}
