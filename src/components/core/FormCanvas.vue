<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useFormBuilderStore } from "@/stores/formBuilder";
import { useDragAndDrop, type DropTarget } from "@/composables";
import FormElementRenderer from "./FormElementRenderer.vue";
import SpacerWrapper from "./SpacerWrapper.vue";
import DropZone from "./DropZone.vue";
import type { FieldsetElement } from "@/models/FormElement";
import { SvgIcon } from "@/components/common";

const formBuilderStore = useFormBuilderStore();
const { isDragging, registerCallbacks, handleDrop } = useDragAndDrop();

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
      (parentFieldset as FieldsetElement).children
    ) {
      searchList = (parentFieldset as FieldsetElement).children || [];
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
function onDrop(data: {
  position: "before" | "after";
  siblingId?: string;
  parentId?: string;
  elementId?: string;
  elementType?: string;
}) {
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

// Canvas drop handlers - make the entire canvas a drop target
const onCanvasDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (isDragging.value) {
    event.dataTransfer!.dropEffect = "copy";
  }
};

const onCanvasDrop = (event: DragEvent) => {
  event.preventDefault();

  if (!isDragging.value) {
    return;
  }

  // Check if the drop target is a specific DropZone - if so, let it handle the drop
  const target = event.target as HTMLElement;
  if (target.closest(".drop-zone-container, .spacer-wrapper")) {
    return; // Let the specific DropZone handle this
  }

  const elementType = event.dataTransfer?.getData("text/plain");
  const elementId = event.dataTransfer?.getData("application/x-element-id");

  // Only handle drops from external source (ElementPanel) to canvas background
  if (elementType && !elementId) {
    // Add element to the end of the list
    const dropData = {
      position: "after" as const,
      siblingId:
        elements.value.length > 0
          ? elements.value[elements.value.length - 1].dataId
          : undefined,
      parentId: undefined,
      elementId: undefined,
      elementType: elementType,
    };

    handleDrop(dropData);
  }
};

onMounted(() => {
  formBuilderStore.loadInitialForms().then(() => {
    const formIdToLoad = formBuilderStore.formList[0]?.id || null;
    if (formIdToLoad) {
      formBuilderStore.setActiveForm(formIdToLoad);
    }
  });
});
</script>

<template>
  <div class="canvas-container">
    <div
      class="form-canvas"
      :class="{ 'dragging-active': isDragging }"
      @dragover="onCanvasDragOver"
      @drop="onCanvasDrop"
    >
      <!-- Empty state -->
      <div v-if="elements.length === 0" class="form-canvas__empty">
        <DropZone position="before" class="empty-drop-zone" />
        <div class="empty-message">
          <SvgIcon name="plus-circle" :size="48" class="empty-icon" />
          <h3>Start building your form</h3>
          <p>Drag elements from the sidebar to create your form</p>
        </div>
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
  transition: all 0.2s ease;

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

    &::after {
      content: "Drop here to add element";
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      padding: 0.5rem 1rem;
      background: rgba(26, 188, 156, 0.2);
      border: 1px solid rgba(26, 188, 156, 0.5);
      border-radius: 4px;
      color: rgba(26, 188, 156, 1);
      font-size: 0.85rem;
      pointer-events: none;
      opacity: 0.8;
    }
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-drop-zone {
  position: absolute;
  inset: 0;
}

.empty-message {
  text-align: center;
  color: var(--theme-text-muted, #aaa);
  position: relative;
  z-index: 1;
  pointer-events: none;

  h3 {
    margin: 1rem 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--theme-text);
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }
}

.empty-icon {
  margin-bottom: 1rem;
  color: var(--theme-primary, #1abc9c);
  opacity: 0.6;
}
</style>
