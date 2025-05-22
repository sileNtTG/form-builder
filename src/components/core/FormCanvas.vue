<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useFormBuilderStore } from "../../stores/formBuilder";
import FormElementRenderer from "./FormElementRenderer.vue";
import InsertionPoint from "./InsertionPoint.vue";
import { v4 as uuidv4 } from "uuid";
import type { FormElement } from "../../models/FormElement";

const formBuilderStore = useFormBuilderStore();
const elements = computed(() => formBuilderStore.elements);

// Drag state tracking
const isDragging = ref(false);
const dropPosition = ref({ index: -1, top: 0 });
const canvasRef = ref<HTMLElement | null>(null);

const selectElement = (id: string) => {
  formBuilderStore.selectElement(id);
};

const handleEdit = (e: Event, id: string) => {
  e.stopPropagation();
};

const handleDelete = (e: Event, id: string) => {
  e.stopPropagation();
  formBuilderStore.removeElement(id);
};

// Calculate drop position based on mouse Y position
function calculateDropPosition(mouseY: number) {
  if (!canvasRef.value) return { index: -1, top: 0 };

  const canvas = canvasRef.value;
  const canvasRect = canvas.getBoundingClientRect();
  const relativeY = mouseY - canvasRect.top + canvas.scrollTop;

  // Get all element cards in the canvas
  const cards = Array.from(canvas.querySelectorAll(".element-card"));

  if (cards.length === 0) {
    // If no cards, position at the top
    return { index: 0, top: 20 };
  }

  // Find where to insert the new element
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i] as HTMLElement;
    const cardRect = card.getBoundingClientRect();
    const cardTop = cardRect.top - canvasRect.top + canvas.scrollTop;
    const cardMiddle = cardTop + cardRect.height / 2;

    if (relativeY < cardMiddle) {
      // Insert before this element
      return { index: i, top: cardTop - 8 };
    }
  }

  // Insert after the last element
  const lastCard = cards[cards.length - 1] as HTMLElement;
  const lastRect = lastCard.getBoundingClientRect();
  const lastBottom = lastRect.bottom - canvasRect.top + canvas.scrollTop;
  return { index: cards.length, top: lastBottom + 8 };
}

// Canvas event handlers
const handleCanvasDragOver = (e: DragEvent) => {
  e.preventDefault();

  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "copy";
  }

  // Calculate drop position for visual indicator
  if (canvasRef.value) {
    const position = calculateDropPosition(e.clientY);
    dropPosition.value = position;
  }

  // Set dragging state
  isDragging.value = true;
};

const handleCanvasDragLeave = (e: DragEvent) => {
  // Check if we're really leaving the canvas and not entering a child
  const relatedTarget = e.relatedTarget as Node;
  if (!canvasRef.value?.contains(relatedTarget)) {
    isDragging.value = false;
  }
};

const handleCanvasDrop = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();

  // Reset dragging state
  isDragging.value = false;

  if (!e.dataTransfer) return;

  // Check if we're moving an existing element (by element-id)
  const elementId =
    e.dataTransfer.getData("application/element-id") ||
    e.dataTransfer.getData("text/plain");

  if (elementId && elementId.length > 0) {
    // We're moving an existing element
    moveElement(elementId, dropPosition.value.index);
    return;
  }

  // Otherwise, continue with creating a new element...
  // Try to get the element type from various formats
  let elementType = "";

  try {
    // Try all possible formats
    elementType =
      e.dataTransfer.getData("application/element-type") ||
      e.dataTransfer.getData("text/plain") ||
      e.dataTransfer.getData("text");
  } catch (error) {
    console.error("Error reading drag data:", error);
    return;
  }

  if (!elementType) {
    console.warn("No element type found in drop event");
    return;
  }

  console.log("Element type found:", elementType);

  const { index } = dropPosition.value;
  if (index === -1) return;

  // Create element properties
  const baseElementProps = {
    id: uuidv4(),
    label: `New ${elementType.charAt(0).toUpperCase() + elementType.slice(1)}`,
    required: false,
    order: 0,
    x: 20,
    y: 0,
  };

  // Create element based on type
  let newElement: FormElement | null = null;

  switch (elementType) {
    case "input":
      newElement = {
        ...baseElementProps,
        type: "input",
        placeholder: "Enter text",
        width: 250,
        height: 48,
      } as FormElement;
      break;
    case "textarea":
      newElement = {
        ...baseElementProps,
        type: "textarea",
        placeholder: "Enter text",
        rows: 4,
        width: 300,
        height: 120,
      } as FormElement;
      break;
    case "checkbox":
      newElement = {
        ...baseElementProps,
        type: "checkbox",
        checked: false,
        width: 200,
        height: 40,
      } as FormElement;
      break;
    case "select":
      newElement = {
        ...baseElementProps,
        type: "select",
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ],
        multiple: false,
        width: 250,
        height: 48,
      } as FormElement;
      break;
    case "radio":
      newElement = {
        ...baseElementProps,
        type: "radio",
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ],
        defaultValue: "option1",
        width: 250,
        height: 80,
      } as FormElement;
      break;
    case "fieldset":
      newElement = {
        ...baseElementProps,
        type: "fieldset",
        children: [],
        width: 400,
        height: 200,
      } as FormElement;
      break;
    case "button":
      newElement = {
        ...baseElementProps,
        type: "button",
        buttonType: "button",
        width: 150,
        height: 48,
      } as FormElement;
      break;
    default:
      newElement = {
        ...baseElementProps,
        type: elementType as any,
        width: 250,
        height: 48,
      } as FormElement;
  }

  if (newElement) {
    // Insert the element at the correct position
    const elementsCopy = [...formBuilderStore.elements];
    elementsCopy.splice(index, 0, newElement);
    formBuilderStore.setFormElements(elementsCopy);
    formBuilderStore.selectElement(newElement.id);
  }

  // Reset drop position
  dropPosition.value = { index: -1, top: 0 };
};

// Function to move an element to a new position
function moveElement(elementId: string, newIndex: number) {
  // Find the element in the store
  const elements = formBuilderStore.elements;
  const currentIndex = elements.findIndex((el) => el.id === elementId);

  if (currentIndex === -1 || newIndex === -1) return;

  // Don't do anything if dropping at the same position or right after itself
  if (newIndex === currentIndex || newIndex === currentIndex + 1) return;

  // Create a copy of the elements
  const elementsCopy = [...elements];

  // Remove the element from its current position
  const [elementToMove] = elementsCopy.splice(currentIndex, 1);

  // Adjust the target index if needed (when moving an item down)
  const adjustedIndex = currentIndex < newIndex ? newIndex - 1 : newIndex;

  // Insert the element at the new position
  elementsCopy.splice(adjustedIndex, 0, elementToMove);

  // Update the store
  formBuilderStore.setFormElements(elementsCopy);
  formBuilderStore.selectElement(elementId);
}

// Handle fieldset element drop
function handleElementDrop({
  fieldsetId,
  elementType,
  elementId,
  position = 0,
  isMove = false,
}: {
  fieldsetId: string;
  elementType?: string;
  elementId?: string;
  position?: number;
  isMove?: boolean;
}) {
  if (!fieldsetId) return;

  // Check if we're moving an existing element
  if (isMove && elementId) {
    moveElementToFieldset(elementId, fieldsetId, position);
    return;
  }

  // Otherwise continue with creating a new element
  if (!elementType) return;

  // Create a new element for the fieldset
  const baseElementProps = {
    id: uuidv4(),
    label: `New ${elementType.charAt(0).toUpperCase() + elementType.slice(1)}`,
    required: false,
    order: 0,
    x: 0,
    y: 0,
  };

  let newElement: FormElement | null = null;

  // Create element based on type
  switch (elementType) {
    case "input":
      newElement = {
        ...baseElementProps,
        type: "input",
        placeholder: "Enter text",
        width: 250,
        height: 48,
      } as FormElement;
      break;
    case "textarea":
      newElement = {
        ...baseElementProps,
        type: "textarea",
        placeholder: "Enter text",
        rows: 4,
        width: 300,
        height: 120,
      } as FormElement;
      break;
    case "checkbox":
      newElement = {
        ...baseElementProps,
        type: "checkbox",
        checked: false,
        width: 200,
        height: 40,
      } as FormElement;
      break;
    case "fieldset":
      newElement = {
        ...baseElementProps,
        type: "fieldset",
        children: [],
        width: 400,
        height: 200,
      } as FormElement;
      break;
    case "button":
      newElement = {
        ...baseElementProps,
        type: "button",
        buttonType: "button",
        width: 150,
        height: 48,
      } as FormElement;
      break;
    default:
      newElement = {
        ...baseElementProps,
        type: elementType as any,
        width: 250,
        height: 48,
      } as FormElement;
  }

  if (newElement) {
    // Add the element to the fieldset at the specified position
    formBuilderStore.addElementToFieldset(fieldsetId, newElement, position);
  }
}

// Function to move an element to a fieldset
function moveElementToFieldset(
  elementId: string,
  fieldsetId: string,
  position: number
) {
  // Find the element in the main elements array
  const elements = formBuilderStore.elements;
  const elementIndex = elements.findIndex((el) => el.id === elementId);

  if (elementIndex === -1) {
    // Element not found in main array, check if it's in another fieldset
    let found = false;

    // Search through all fieldsets
    for (const element of elements) {
      if (element.type === "fieldset") {
        const fieldset =
          element as import("../../models/FormElement").FieldsetElement;
        if (fieldset.children && Array.isArray(fieldset.children)) {
          const childIndex = fieldset.children.findIndex(
            (child) => child.id === elementId
          );

          if (childIndex !== -1) {
            // Found the element in this fieldset
            const elementToMove = { ...fieldset.children[childIndex] };

            // Remove from current fieldset
            const updatedChildren = [...fieldset.children];
            updatedChildren.splice(childIndex, 1);

            // Update the original fieldset by removing the element
            formBuilderStore.updateElement(fieldset.id, {
              ...fieldset,
              children: updatedChildren,
            });

            // Add to the target fieldset
            formBuilderStore.addElementToFieldset(
              fieldsetId,
              elementToMove,
              position
            );
            formBuilderStore.selectElement(elementId);

            found = true;
            break;
          }
        }
      }
    }

    if (!found) {
      console.warn(`Element with ID ${elementId} not found`);
    }

    return;
  }

  // Element is in the main array, move it to the fieldset
  const elementToMove = { ...elements[elementIndex] };

  // Create a copy of the elements
  const elementsCopy = [...elements];

  // Remove the element from the main array
  elementsCopy.splice(elementIndex, 1);

  // Update the main store
  formBuilderStore.setFormElements(elementsCopy);

  // Add to the fieldset
  formBuilderStore.addElementToFieldset(fieldsetId, elementToMove, position);
  formBuilderStore.selectElement(elementId);
}

// Handle insertion point clicks
function handleInsertPointClick({
  index,
}: {
  index: number;
  fieldsetId?: string;
}) {
  openInsertMenu(index);
}

// Open insert menu at specific position
function openInsertMenu(index: number) {
  console.log(`Opening insert menu at position ${index}`);

  // Dispatch a custom event that will be listened to by the CommandPalette component
  const event = new CustomEvent("openCommandPalette", {
    detail: {
      insertPosition: index,
      mode: "insert",
    },
  });

  window.dispatchEvent(event);
}

// Clean up any drag state when component is unmounted
onMounted(() => {
  document.addEventListener("dragend", () => {
    isDragging.value = false;
  });
});
</script>

<template>
  <div class="canvas-container">
    <div
      class="canvas-stack"
      @dragover="handleCanvasDragOver"
      @dragleave="handleCanvasDragLeave"
      @drop="handleCanvasDrop"
      ref="canvasRef"
    >
      <!-- Empty state message -->
      <div v-if="elements.length === 0" class="form-canvas__empty">
        Drag and drop elements here to build your form or click on elements in
        the sidebar
      </div>

      <!-- Drop indicator when dragging -->
      <div
        v-if="isDragging && dropPosition.index >= 0"
        class="drop-indicator"
        :style="{ top: `${dropPosition.top}px` }"
      ></div>

      <template v-if="elements.length > 0">
        <!-- Einfügepunkt am Anfang -->
        <InsertionPoint :index="0" @insert="handleInsertPointClick" />

        <!-- Elemente mit Einfügepunkten dazwischen -->
        <template v-for="(element, index) in elements" :key="element.id">
          <FormElementRenderer
            :element="element"
            @element-drop="handleElementDrop"
          />
          <InsertionPoint :index="index + 1" @insert="handleInsertPointClick" />
        </template>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.canvas-container {
  padding: 0.3rem;
  flex: 1;
  overflow: auto;
}

.canvas-stack {
  max-width: 850px;
  width: 100%;
  margin: 1rem auto;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  position: relative;
  min-height: 200px;

  &.two-column-layout {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }
}

/* Drop indicator styling */
.drop-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--theme-primary, #1abc9c);
  border-radius: 2px;
  z-index: 100;
  box-shadow: 0 0 8px 1px rgba(26, 188, 156, 0.6);
  animation: pulse 1.5s infinite;
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
  padding: 2rem;
  border: 2px dashed var(--theme-border, #444);
  border-radius: 8px;
  color: var(--theme-text-muted, #aaa);
  font-style: italic;
  font-size: 0.9em;
}
</style>
