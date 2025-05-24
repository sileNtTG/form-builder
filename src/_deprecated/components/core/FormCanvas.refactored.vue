<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useFormBuilderStore } from "@/stores/formBuilder";
import { useDragAndDrop } from "@/composables/useDragAndDrop";
import FormElementRenderer from "./FormElementRenderer.vue";
import DropZone from "./DropZone.vue";
import type { DropTarget } from "@/composables/useDragAndDrop";

const formBuilderStore = useFormBuilderStore();
const { isDragging, registerCallbacks } = useDragAndDrop();

// Simple computed for sorted elements
const elements = computed(() => {
  return [...formBuilderStore.elements].sort((a, b) => a.order - b.order);
});

function calculateTargetIndex(target: DropTarget): number {
  // Simple index calculation based on target
  if (target.siblingId) {
    const siblingIndex = elements.value.findIndex(
      (el) => el.dataId === target.siblingId
    );
    return target.position === "before" ? siblingIndex : siblingIndex + 1;
  }
  return elements.value.length;
}

// Register drag and drop handlers once
registerCallbacks({
  onMove: (elementId: string, target: DropTarget) => {
    // Use existing store method with proper parameters
    const targetIndex = calculateTargetIndex(target);
    formBuilderStore.moveElementToPosition(
      elementId,
      targetIndex,
      target.parentId || null
    );
  },
  onCreate: (elementType: string, target: DropTarget) => {
    // Use existing store methods
    const newElement = formBuilderStore.createElement(elementType);
    if (newElement) {
      const targetIndex = calculateTargetIndex(target);
      formBuilderStore.addElementAtPosition(
        newElement,
        targetIndex,
        target.parentId || null
      );
    }
  },
});

function handleElementClick(id: string) {
  formBuilderStore.selectElement(id);
}

onMounted(() => {
  formBuilderStore.loadInitialForms();
});
</script>

<template>
  <div class="form-canvas" :class="{ 'dragging-active': isDragging }">
    <!-- Empty state -->
    <div v-if="elements.length === 0" class="form-canvas__empty">
      <DropZone position="before" class="empty-drop-zone" />
      <p>Drag elements here to create your form</p>
    </div>

    <!-- Elements with drop zones -->
    <div v-else class="form-canvas__content">
      <DropZone position="before" />

      <template v-for="(element, index) in elements" :key="element.dataId">
        <FormElementRenderer
          :element="element"
          @click="() => handleElementClick(element.dataId)"
        />
        <DropZone position="after" :sibling-id="element.dataId" />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-canvas {
  max-width: 850px;
  margin: 0 auto;
  min-height: 400px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;

  &.dragging-active {
    border-color: #1abc9c;
    background-color: rgba(26, 188, 156, 0.05);
  }
}

.form-canvas__empty {
  text-align: center;
  position: relative;
  min-height: 200px;
}

.empty-drop-zone {
  position: absolute;
  inset: 0;
}

.form-canvas__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
