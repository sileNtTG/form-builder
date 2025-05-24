<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useFormBuilderStore } from "@/stores/formBuilder";
import { useDragAndDrop } from "@/composables/useDragAndDrop";
import FormElementRenderer from "./FormElementRenderer.vue";
import SpacerWrapper from "./SpacerWrapper.vue";
import DropZone from "./DropZone.vue";
import type { DropTarget } from "@/composables/useDragAndDrop";

const formBuilderStore = useFormBuilderStore();
const { isDragging, registerCallbacks } = useDragAndDrop();

// Simple computed for sorted elements
const elements = computed(() => {
  return [...formBuilderStore.elements].sort((a, b) => a.order - b.order);
});

function calculateTargetIndex(target: DropTarget): number {
  // Determine which list to search in
  let searchList = elements.value;
  if (target.parentId) {
    // Find the parent fieldset and use its children
    const parentFieldset = elements.value.find(
      (el) => el.dataId === target.parentId
    );
    if (
      parentFieldset &&
      parentFieldset.type === "fieldset" &&
      (parentFieldset as any).children
    ) {
      searchList = (parentFieldset as any).children;
    } else {
      return 0;
    }
  }

  if (target.siblingId) {
    const siblingIndex = searchList.findIndex(
      (el) => el.dataId === target.siblingId
    );

    if (siblingIndex === -1) {
      return 0;
    }

    const calculatedIndex =
      target.position === "before" ? siblingIndex : siblingIndex + 1;
    return calculatedIndex;
  }

  // No siblingId - position at start or end
  if (target.position === "before") {
    return 0;
  } else {
    return searchList.length;
  }
}

// Register drag and drop handlers once
registerCallbacks({
  onMove: (elementId: string, target: DropTarget) => {
    // Prevent moving an element into itself
    if (elementId === target.parentId) {
      return;
    }

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

// Handle drop events from SpacerWrapper
function onDrop(data: any) {
  // The existing drag and drop logic will handle this via the registerCallbacks
}

// Handle insert events from SpacerWrapper - Open Command Palette
function onInsert(data: { index: number; fieldsetId?: string }) {
  const event = new CustomEvent("openCommandPalette", {
    detail: {
      insertPosition: data.index,
      mode: "insert",
      fieldsetId: data.fieldsetId,
    },
  });
  window.dispatchEvent(event);
}

onMounted(() => {
  formBuilderStore.loadInitialForms();
  const formIdToLoad = formBuilderStore.formList[0]?.id || null;
  if (formIdToLoad) {
    formBuilderStore.setActiveForm(formIdToLoad);
  }
});
</script>

<template>
  <div class="canvas-container">
    <div class="form-canvas" :class="{ 'dragging-active': isDragging }">
      <!-- Empty state -->
      <div v-if="elements.length === 0" class="form-canvas__empty">
        <DropZone position="before" class="empty-drop-zone" />
        Drag elements from the sidebar here to create your form
      </div>

      <!-- Elements with spacer wrappers -->
      <div v-else class="form-canvas__content">
        <!-- First spacer (before all elements) -->
        <SpacerWrapper
          :index="0"
          :is-dragging="isDragging"
          position="before"
          :sibling-id="elements[0]?.dataId"
          @drop="onDrop"
          @insert="onInsert"
        />
        <template v-for="(element, index) in elements" :key="element.dataId">
          <FormElementRenderer
            :element="element"
            :is-dragging="isDragging"
            class="form-canvas-element"
            @click="() => handleElementClick(element.dataId)"
            @fieldset-drop="onDrop"
            @insert="onInsert"
          />
          <!-- Spacer after each element -->
          <SpacerWrapper
            :index="index + 1"
            :is-dragging="isDragging"
            position="after"
            :sibling-id="element.dataId"
            @drop="onDrop"
            @insert="onInsert"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.canvas-container {
  padding: 0.8rem;
  flex: 1;
  overflow: auto;
}

.form-canvas {
  max-width: 850px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  min-height: calc(100vh - 160px);
  border: 2px dashed #3a3f4a;
  border-radius: 8px;
  padding: 1.5rem;
  background: var(--theme-bg-surface, #1a1e29);

  &__content {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    min-height: 200px;
    position: relative;
  }

  &.dragging-active {
    background-color: rgba(26, 188, 156, 0.05);
    border: 2px dashed rgba(26, 188, 156, 0.7);
  }
}

.form-canvas__empty {
  text-align: center;
  padding: 3rem;
  color: var(--theme-text-muted, #aaa);
  font-style: italic;
  font-size: 0.9em;
  position: relative;
  min-height: 200px;
}

.empty-drop-zone {
  position: absolute;
  inset: 0;
}
</style>
