<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, provide, inject } from "vue";
import { useFormBuilderStore } from "../../stores/formBuilder";
import FormElementRenderer from "./FormElementRenderer.vue";
import InsertionPoint from "./InsertionPoint.vue";
import { v4 as uuidv4 } from "uuid";
import type { FormElement } from "../../models/FormElement";

const formBuilderStore = useFormBuilderStore();

// Sorted elements for rendering
const elements = computed(() => {
  const elemsCopy = [...formBuilderStore.elements];
  elemsCopy.sort((a, b) => a.order - b.order);
  return elemsCopy;
});

const canvasRef = ref<HTMLElement | null>(null);

// Drag and drop state
const dragging = ref(false);
const draggedElementId = ref<string | null>(null);
const dropTargetIndex = ref(-1);
const externalDragType = ref<string | null>(null);

function handleElementClick(id: string) {
  formBuilderStore.selectElement(id);
}

function handleElementDragStart(id: string) {
  draggedElementId.value = id;
  dragging.value = true;
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();

  const index = getDropIndex(e.clientY);
  dropTargetIndex.value = index;

  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = draggedElementId.value ? "move" : "copy";
  }
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault();

  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = draggedElementId.value ? "move" : "copy";

    if (!dragging.value) {
      dragging.value = true;

      try {
        const elementType =
          e.dataTransfer.getData("text/plain") ||
          e.dataTransfer.getData("application/element-type");

        if (elementType) {
          externalDragType.value = elementType;
        }
      } catch (err) {
        // Browser security - ignore
      }
    }
  }
}

function handleDragEnd(event: DragEvent) {
  // Only reset if no successful drop occurred
  if (!event.defaultPrevented) {
    resetDragState();
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();

  const dropIndex = getDropIndex(e.clientY);
  dropTargetIndex.value = dropIndex;

  let elementProcessed = false;

  // Check for external element types from sidebar
  if (e.dataTransfer) {
    try {
      const elementType =
        e.dataTransfer.getData("text/plain") ||
        e.dataTransfer.getData("application/element-type");

      if (elementType && !draggedElementId.value) {
        if (
          [
            "input",
            "textarea",
            "checkbox",
            "select",
            "radio",
            "fieldset",
            "button",
            "date",
            "number",
          ].includes(elementType)
        ) {
          externalDragType.value = elementType;
        } else {
          draggedElementId.value = elementType;
        }
      }
    } catch (err) {
      console.error("Error reading drag data:", err);
    }
  }

  // Handle existing elements (internal moves)
  if (dragging.value && draggedElementId.value && dropIndex >= 0) {
    moveElement(draggedElementId.value, dropIndex);
    elementProcessed = true;
  }
  // Handle new elements from sidebar
  else if (dragging.value && externalDragType.value && dropIndex >= 0) {
    createAndAddElement(externalDragType.value, dropIndex);
    elementProcessed = true;
  }

  // Reset state after processing
  setTimeout(
    () => {
      resetDragState();
    },
    elementProcessed ? 50 : 10
  );
}

function resetDragState() {
  dragging.value = false;
  draggedElementId.value = null;
  dropTargetIndex.value = -1;
  externalDragType.value = null;
}

function getDropIndex(mouseY: number): number {
  if (!canvasRef.value) return -1;

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  const relativeY = mouseY - rect.top + canvas.scrollTop;

  const contentContainer = canvas.querySelector(".form-canvas__content");
  if (!contentContainer) return 0;

  // Only find direct children elements (not nested in fieldsets)
  const directChildren = Array.from(contentContainer.children).filter((child) =>
    child.classList.contains("element-card")
  );

  if (directChildren.length === 0) {
    return 0;
  }

  // Iterate through all direct children and check mouse position
  for (let i = 0; i < directChildren.length; i++) {
    const card = directChildren[i] as HTMLElement;
    const cardRect = card.getBoundingClientRect();
    const cardTop = cardRect.top - rect.top + canvas.scrollTop;
    const cardMiddle = cardTop + cardRect.height / 2;

    if (relativeY < cardMiddle) {
      return i;
    }
  }

  return directChildren.length;
}

function getDropIndicatorPosition(): number {
  if (!canvasRef.value || dropTargetIndex.value < 0) return 0;

  const canvas = canvasRef.value;

  const contentContainer = canvas.querySelector(".form-canvas__content");
  if (!contentContainer) return 20;

  const directChildren = Array.from(contentContainer.children).filter((child) =>
    child.classList.contains("element-card")
  );

  if (directChildren.length === 0) return 20;

  if (dropTargetIndex.value >= directChildren.length) {
    // After the last element
    const lastCard = directChildren[directChildren.length - 1] as HTMLElement;
    const lastRect = lastCard.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    return lastRect.bottom - canvasRect.top + canvas.scrollTop + 8;
  }

  // Before the indexed element
  const card = directChildren[dropTargetIndex.value] as HTMLElement;
  const cardRect = card.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  return cardRect.top - canvasRect.top + canvas.scrollTop - 8;
}

function moveElement(id: string, toIndex: number) {
  formBuilderStore.moveElementToPosition(id, toIndex, null);
}

function handleInsertPointClick({ index }: { index: number }) {
  const event = new CustomEvent("openCommandPalette", {
    detail: {
      insertPosition: index,
      mode: "insert",
    },
  });
  window.dispatchEvent(event);
}

function createAndAddElement(type: string, position: number) {
  const element = createElementByType(type, position);

  if (element) {
    formBuilderStore.addElementAtPosition(element, position, null);
    return element;
  }

  return null;
}

function createElementByType(
  type: string,
  position: number
): FormElement | null {
  const baseProps = {
    id: uuidv4(),
    label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    required: false,
    order: position,
    x: 0,
    y: 0,
    width: 250,
    height: 48,
  };

  switch (type) {
    case "input":
      return {
        ...baseProps,
        type: "input",
        placeholder: "Enter text",
      } as FormElement;
    case "textarea":
      return {
        ...baseProps,
        type: "textarea",
        placeholder: "Enter text",
        rows: 4,
        width: 300,
        height: 120,
      } as FormElement;
    case "checkbox":
      return {
        ...baseProps,
        type: "checkbox",
        checked: false,
        width: 200,
        height: 40,
      } as FormElement;
    case "select":
      return {
        ...baseProps,
        type: "select",
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ],
        width: 250,
        height: 48,
      } as FormElement;
    case "button":
      return {
        ...baseProps,
        type: "button",
        buttonType: "button",
        width: 150,
        height: 48,
      } as FormElement;
    case "fieldset":
      return {
        ...baseProps,
        type: "fieldset",
        children: [],
        width: 400,
        height: 200,
      } as FormElement;
    case "number":
      return {
        ...baseProps,
        type: "number",
        min: 0,
        max: 100,
        width: 150,
        height: 48,
      } as FormElement;
    case "date":
      return {
        ...baseProps,
        type: "date",
        width: 200,
        height: 48,
      } as FormElement;
    case "radio":
      return {
        ...baseProps,
        type: "radio",
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ],
        width: 250,
        height: 80,
      } as FormElement;
    default:
      console.warn(`Unknown element type: ${type}`);
      return null;
  }
}

function handleDragLeave(e: DragEvent) {
  // Check if we're truly leaving the canvas, not just entering a child
  const related = e.relatedTarget as HTMLElement;

  if (!canvasRef.value?.contains(related)) {
    resetDragState();
  }
}

onMounted(() => {
  document.addEventListener("dragend", handleDragEnd, { capture: true });
});

onUnmounted(() => {
  document.removeEventListener("dragend", handleDragEnd, { capture: true });

  if (canvasRef.value) {
    canvasRef.value.removeEventListener("drop", () => {});
    canvasRef.value.removeEventListener("dragover", () => {});
    canvasRef.value.removeEventListener("dragleave", () => {});
    canvasRef.value.removeEventListener("dragenter", () => {});
  }
});
</script>

<template>
  <div class="canvas-container">
    <div
      class="form-canvas"
      :class="{ 'dragging-active': dragging }"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      ref="canvasRef"
    >
      <!-- Debug Info -->
      <div v-if="dragging" class="debug-info">
        <template v-if="draggedElementId">
          Moving: {{ draggedElementId }} → {{ dropTargetIndex }}
        </template>
        <template v-else-if="externalDragType">
          New Element: {{ externalDragType }}
        </template>
        <template v-else> Waiting for element... </template>
      </div>

      <!-- Leerer Zustand -->
      <div v-if="elements.length === 0" class="form-canvas__empty">
        Ziehe Elemente aus der Seitenleiste hierher, um dein Formular zu
        erstellen
      </div>

      <!-- Drop-Indikator -->
      <div
        v-if="dragging && dropTargetIndex >= 0"
        class="drop-indicator"
        :style="{ top: `${getDropIndicatorPosition()}px` }"
      ></div>

      <div class="form-canvas__content">
        <template v-if="elements.length > 0">
          <!-- Einfügepunkt am Anfang -->
          <InsertionPoint :index="0" @insert="handleInsertPointClick" />

          <!-- Elemente mit Einfügepunkten dazwischen -->
          <template v-for="(element, index) in elements" :key="element.id">
            <FormElementRenderer
              :element="element"
              @drag-start="handleElementDragStart"
              @click="() => handleElementClick(element.id)"
            />
            <InsertionPoint
              :index="index + 1"
              @insert="handleInsertPointClick"
            />
          </template>
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

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  &.dragging-active {
    background-color: rgba(26, 188, 156, 0.05);
    border: 2px dashed rgba(26, 188, 156, 0.7);
  }
}

.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #ff0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 9999;
  pointer-events: none;
}

.drop-indicator {
  position: absolute;
  left: 10px;
  right: 10px;
  height: 3px;
  background-color: var(--theme-primary, #1abc9c);
  border-radius: 2px;
  z-index: 100;
  box-shadow: 0 0 8px 1px rgba(26, 188, 156, 0.6);
  animation: pulse 1.5s infinite;

  &:before,
  &:after {
    content: "";
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--theme-primary, #1abc9c);
    top: -2.5px;
    box-shadow: 0 0 6px 1px rgba(26, 188, 156, 0.6);
  }

  &:before {
    left: 0;
  }

  &:after {
    right: 0;
  }
}

@keyframes pulse {
  0% {
    opacity: 0.7;
    transform: scaleY(1);
  }
  50% {
    opacity: 1;
    transform: scaleY(1.5);
  }
  100% {
    opacity: 0.7;
    transform: scaleY(1);
  }
}

.form-canvas__empty {
  text-align: center;
  padding: 3rem;
  color: var(--theme-text-muted, #aaa);
  font-style: italic;
  font-size: 0.9em;
}
</style>
