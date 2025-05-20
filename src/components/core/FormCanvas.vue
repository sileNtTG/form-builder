<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue";
import { useFormBuilderStore } from "../../stores/formBuilder";
import {
  VueFlow,
  type Node,
  type XYPosition,
  type NodeComponent,
} from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import type { FormElement } from "../../models/FormElement";
import TextInputNode from "../elements/TextInput.vue";
import FieldsetNode from "../nodes/FieldsetNode.vue";
import ButtonNode from "../nodes/ButtonNode.vue";
import TextareaNode from "../nodes/TextareaNode.vue";
import CheckboxNode from "../nodes/CheckboxNode.vue";
import SelectNode from "../nodes/SelectNode.vue";
import RadioNode from "../nodes/RadioNode.vue";

import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";

const formBuilderStore = useFormBuilderStore();
const nodes = ref<Node[]>([]);
const isDraggingOver = ref(false);

interface NodeData {
  element: FormElement;
  inPreview: boolean;
  onSelect: () => void;
}
const nodeTypes = {
  input: TextInputNode as NodeComponent,
  fieldset: FieldsetNode as NodeComponent,
  button: ButtonNode as NodeComponent,
  textarea: TextareaNode as NodeComponent,
  checkbox: CheckboxNode as NodeComponent,
  select: SelectNode as NodeComponent,
  radio: RadioNode as NodeComponent,
  // Add other types here as their components are created/adapted
};

onMounted(() => {
  watchEffect(() => {
    updateNodes();
  });
});

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
      label: element.label,
      width: element.width,
      height: element.height,
    } as NodeData,
    parentNode: element.parentNode,
  }));
}

const onDrop = (event: DragEvent) => {
  isDraggingOver.value = false;
  if (!event.dataTransfer) return;

  event.preventDefault();

  const elementType = event.dataTransfer.getData("elementType");
  if (!elementType) return;

  // TODO: Review offset calculation. These are likely rough estimates
  // to account for UI elements like sidebar/header or mouse pointer position.
  // A more robust method would transform clientX/clientY to VueFlow viewport coordinates.
  const x = event.clientX - 200;
  const y = event.clientY - 100;

  formBuilderStore.createAndAddElement(elementType, x, y);
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    isDraggingOver.value = true;
    event.dataTransfer.dropEffect = "copy";
  }
};

const onDragLeave = (event: DragEvent) => {
  const flowHostElement = event.currentTarget as HTMLElement;
  if (
    event.relatedTarget === null ||
    (event.relatedTarget instanceof Node &&
      !flowHostElement.contains(event.relatedTarget))
  ) {
    isDraggingOver.value = false;
  }
};

const handleNodesDragStop = ({ nodes: draggedNodes }: { nodes: Node[] }) => {
  draggedNodes.forEach((node) => {
    if (
      node.position &&
      typeof node.position.x === "number" &&
      typeof node.position.y === "number"
    ) {
      formBuilderStore.updateElementPosition(
        node.id,
        node.position.x,
        node.position.y
      );
    }
  });
};
</script>

<template>
  <div class="form-canvas">
    <VueFlow
      class="form-canvas__flow"
      :class="{ 'drag-over': isDraggingOver }"
      :nodes="nodes"
      :nodeTypes="nodeTypes"
      :defaultZoom="1"
      :minZoom="0.2"
      :maxZoom="4"
      :elementsSelectable="true"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @nodes-drag-stop="handleNodesDragStop"
    >
      <Background :pattern-color="'var(--theme-border)'" :gap="8" />
      <Controls />
      <MiniMap />

      <div class="form-canvas__header">
        <h2>Form Canvas</h2>
      </div>

      <!-- Empty state -->
      <div v-if="nodes.length === 0" class="form-canvas__empty">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 3h7v7H3z" />
          <path d="M14 3h7v7h-7z" />
          <path d="M14 14h7v7h-7z" />
          <path d="M3 14h7v7H3z" />
        </svg>
        <div>Drag and drop elements here to build your form</div>
      </div>
    </VueFlow>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/abstracts" as *; // Added for SCSS variables

/* Component-specific styles for FormCanvas */
.form-canvas {
  width: 100%;
  height: 100%;
  background-color: var(--theme-bg);

  &__flow {
    background-color: var(--theme-bg);
    position: relative;

    &.drag-over {
      .vue-flow__viewport {
        outline: 2px dashed var(--theme-primary);
        outline-offset: -2px;
      }
    }
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    svg {
      width: 4rem;
      height: 4rem;
      margin-bottom: $spacing-lg;
      color: var(--theme-primary);
    }

    div {
      color: var(--theme-text-muted);
      padding: $spacing-sm 0;
      font-size: $font-size-base;
    }
  }
}

.vue-flow__node {
  /* Let the custom node component define its entire appearance */
  background-color: transparent;
  border: none; /* Border will be handled by the custom node if needed, or by selection outline */
  padding: 0; /* Custom node will handle its own padding */
  min-width: auto; /* Allow custom node to dictate its own min-width if necessary */
  /* border-radius: 4px; // Handled by custom node */
  /* min-width: 150px; // Handled by custom node or its content */
}

.vue-flow__node.selected {
  /* VueFlow default selection style might be okay, or we can customize */
  /* For now, let custom node handle its own selected appearance if needed, 
     or rely on VueFlow's default. Let's ensure VueFlow default is visible. */
  /* border: 2px solid var(--theme-primary); // This is a good default selection indicator */
  outline: 2px solid var(--theme-primary, #007bff); /* Use outline to avoid layout shifts */
  outline-offset: 2px;
}

// Ensure MiniMap is above other overlays
.vue-flow__minimap {
  z-index: 25; // Higher than property panel (10) and element panel (20)
  background-color: var(--theme-bg-alt);
  border: 1px solid var(--theme-border);
}
</style>
