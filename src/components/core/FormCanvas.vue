<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useFormBuilderStore } from "../../stores/formBuilder";
import { VueFlow, type Node, type XYPosition } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import type { FormElement } from "../../models/FormElement";

import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";

const formBuilderStore = useFormBuilderStore();
const nodes = ref<Node[]>([]);

// Define a type for node data if not already available
interface NodeData {
  element: FormElement;
  inPreview: boolean;
  onSelect: () => void;
}

// Register node types
const nodeTypes = {
  // Add your node types here
};

// Update nodes when store changes
onMounted(() => {
  updateNodes();

  // Watch for changes (simplified)
  setInterval(updateNodes, 1000);
});

// Function to update nodes from store
function updateNodes() {
  nodes.value = formBuilderStore.elements.map((element, index) => ({
    id: element.id,
    type: element.type,
    position: {
      x: element.x || 100,
      y: element.y || 100 + index * 150,
    } as XYPosition,
    data: {
      element,
      inPreview: false,
      onSelect: () => formBuilderStore.selectElement(element.id),
    } as NodeData,
  }));
}

// Handle dropping an element from the panel
const onDrop = (event: DragEvent) => {
  if (!event.dataTransfer) return;

  event.preventDefault();

  const elementType = event.dataTransfer.getData("elementType");
  if (!elementType) return;

  // Get drop coordinates (simplified)
  const x = event.clientX - 200;
  const y = event.clientY - 100;

  // Create a new element
  formBuilderStore.createAndAddElement(elementType, x, y);
};

// Prevent default behavior for dragover to allow dropping
const onDragOver = (event: DragEvent) => {
  event.preventDefault();
};
</script>

<template>
  <div class="form-canvas">
    <VueFlow
      class="form-canvas__flow"
      :nodes="nodes"
      :nodeTypes="nodeTypes"
      :defaultZoom="1"
      :minZoom="0.2"
      :maxZoom="4"
      :elementsSelectable="true"
      @dragover="onDragOver"
      @drop="onDrop"
      @nodesDragStop="updateNodes"
    >
      <Background :pattern-color="'var(--theme-border)'" :gap="8" />
      <Controls />
      <MiniMap />

      <div class="form-canvas__header">
        <h2>Form Canvas</h2>
      </div>

      <!-- Empty state -->
      <div v-if="nodes.length === 0" class="form-canvas__empty">
        <div>Drag and drop elements here to build your form</div>
      </div>
    </VueFlow>
  </div>
</template>

<style lang="scss">
/* Component-specific styles for FormCanvas */
.form-canvas {
  width: 100%;
  height: 100%;
  background-color: var(--theme-bg);

  &__flow {
    background-color: var(--theme-bg);
  }

  &__header {
    position: absolute;
    top: $spacing-md;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    background-color: var(--theme-bg-surface);
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius;
    box-shadow: 0 1px 3px 0 rgba(var(--theme-shadow-color-rgb), 0.1),
      0 1px 2px 0 rgba(var(--theme-shadow-color-rgb), 0.08);

    h2 {
      font-size: 1.125rem;
      font-weight: $font-weight-semibold;
      margin: 0;
      color: var(--theme-text);
    }
  }

  &__empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    background-color: var(--theme-bg-surface);
    padding: $spacing-xl;
    border-radius: $border-radius;
    box-shadow: 0 1px 3px 0 rgba(var(--theme-shadow-color-rgb), 0.1),
      0 1px 2px 0 rgba(var(--theme-shadow-color-rgb), 0.08);
    text-align: center;

    div {
      color: var(--theme-text-muted);
      padding: $spacing-lg 0;
      font-size: $font-size-base;
    }
  }
}

.vue-flow__node {
  border-radius: 4px;
  padding: 8px;
  min-width: 150px;
}

.vue-flow__node.selected {
  border: 2px solid var(--theme-primary);
}

// Ensure MiniMap is above other overlays
.vue-flow__minimap {
  z-index: 25; // Higher than property panel (10) and element panel (20)
  background-color: var(--theme-bg-alt);
  border: 1px solid var(--theme-border);
}
</style>
