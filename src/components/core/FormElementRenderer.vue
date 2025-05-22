<script setup lang="ts">
import type { FormElement } from "../../models/FormElement";
import { ref, computed, inject, provide } from "vue";
import { useFormBuilderStore } from "../../stores/formBuilder";
import InsertionPoint from "./InsertionPoint.vue";

// Set up drag state that can be shared globally
const currentDraggedElementId = inject(
  "currentDraggedElementId",
  ref<string | null>(null)
);
provide("currentDraggedElementId", currentDraggedElementId);

const formBuilderStore = useFormBuilderStore();
const props = defineProps<{ element: FormElement }>();
const emit = defineEmits(["element-drop"]);

// Add selection and actions
function selectElement(id: string, event: Event) {
  // Stop propagation to prevent parent elements from being selected
  event.stopPropagation();
  formBuilderStore.selectElement(id);
}

function handleEdit(e: Event, id: string) {
  e.stopPropagation();
  formBuilderStore.selectElement(id);
}

function handleDelete(e: Event, id: string) {
  e.stopPropagation();
  formBuilderStore.removeElement(id);
}

// Track if we're in the middle of a drag operation on this fieldset
const isFieldsetDragTarget = ref(false);
const dropPosition = ref({ index: 0, top: 0 });
const isDragging = ref(false);

// Handle drag start
function handleDragStart(e: DragEvent) {
  if (!e.dataTransfer || !props.element.id) return;

  console.log("Drag started for element:", props.element.id);

  // Store the ID globally for better cross-browser support
  currentDraggedElementId.value = props.element.id;

  // Mark that we're dragging this element
  isDragging.value = true;

  // Set the element ID as data to be transferred - try multiple formats for compatibility
  try {
    e.dataTransfer.setData("application/element-id", props.element.id);
    e.dataTransfer.setData("text/plain", props.element.id);
    e.dataTransfer.setData("text/uri-list", props.element.id);
    e.dataTransfer.setData("text/html", props.element.id);
  } catch (err) {
    console.error("Error setting drag data:", err);
  }

  // Make sure a ghost image is created correctly
  const ghostEl = document.createElement("div");
  ghostEl.textContent = props.element.type;
  ghostEl.style.padding = "10px";
  ghostEl.style.background = "rgba(26, 188, 156, 0.3)";
  ghostEl.style.border = "1px solid #1abc9c";
  ghostEl.style.borderRadius = "4px";
  ghostEl.style.position = "absolute";
  ghostEl.style.top = "-1000px";
  document.body.appendChild(ghostEl);

  try {
    e.dataTransfer.setDragImage(ghostEl, 0, 0);
  } catch (err) {
    console.warn("Could not set drag image:", err);
  }

  // Set the drag effect to move
  e.dataTransfer.effectAllowed = "move";

  // Add a class to the element being dragged for visual feedback
  if (e.target instanceof HTMLElement) {
    e.target.classList.add("dragging");
  }

  // Clean up the ghost element
  setTimeout(() => {
    document.body.removeChild(ghostEl);
  }, 0);
}

// Handle drag end
function handleDragEnd(e: DragEvent) {
  console.log("Drag ended for element:", props.element.id);
  isDragging.value = false;

  // Clear the global reference
  currentDraggedElementId.value = null;

  // Remove visual feedback
  if (e.target instanceof HTMLElement) {
    e.target.classList.remove("dragging");
  }
}

// Calculate the drop position inside the fieldset
function calculateDropPosition(fieldsetEl: HTMLElement, mouseY: number) {
  const fieldsetRect = fieldsetEl.getBoundingClientRect();
  const relativeY = mouseY - fieldsetRect.top;

  // Get all child element cards within this fieldset
  const cards = Array.from(fieldsetEl.querySelectorAll(".element-card"));

  if (
    cards.length === 0 ||
    !props.element.type ||
    props.element.type !== "fieldset" ||
    !("children" in props.element) ||
    !props.element.children ||
    props.element.children.length === 0
  ) {
    // If no cards, position at the top
    return { index: 0, top: 16 };
  }

  // Find where to insert the new element
  for (let i = 0; i < cards.length; i++) {
    const rect = cards[i].getBoundingClientRect();
    const cardTop = rect.top - fieldsetRect.top;
    const cardMiddle = cardTop + rect.height / 2;

    if (relativeY < cardMiddle) {
      // Insert before this element
      return { index: i, top: cardTop - 6 };
    }
  }

  // Insert after the last element
  const lastRect = cards[cards.length - 1].getBoundingClientRect();
  const lastBottom = lastRect.bottom - fieldsetRect.top;
  return { index: cards.length, top: lastBottom + 8 };
}

function handleFieldsetDragOver(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation(); // Prevent parent handlers

  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "copy";
  }

  isFieldsetDragTarget.value = true;

  // Update drop position
  if (e.currentTarget) {
    dropPosition.value = calculateDropPosition(
      e.currentTarget as HTMLElement,
      e.clientY
    );
  }
}

function handleFieldsetDragLeave(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();

  // Check if we're really leaving the fieldset or just entering a child
  const relatedTarget = e.relatedTarget as HTMLElement;
  const currentTarget = e.currentTarget as HTMLElement;

  if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
    isFieldsetDragTarget.value = false;
  }
}

function handleFieldsetDrop(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation(); // Critical to prevent event bubbling

  isFieldsetDragTarget.value = false;

  // Safety check to prevent errors
  if (!e.dataTransfer || !props.element.id) {
    return;
  }

  // First try to get the element ID from dataTransfer
  let elementId = "";
  try {
    elementId =
      e.dataTransfer.getData("application/element-id") ||
      e.dataTransfer.getData("text/plain");
  } catch (err) {
    console.warn("Error reading dataTransfer in fieldset:", err);
  }

  // If dataTransfer failed, use the global variable as fallback
  if (!elementId && currentDraggedElementId.value) {
    console.log(
      "Fieldset using global dragged element ID:",
      currentDraggedElementId.value
    );
    elementId = currentDraggedElementId.value;
  }

  console.log("Fieldset drop detected, element ID:", elementId);

  if (elementId && elementId.length > 0) {
    // We're moving an existing element into the fieldset
    const position = dropPosition.value.index;

    console.log(
      `Moving element ${elementId} to fieldset ${props.element.id} at position ${position}`
    );

    emit("element-drop", {
      fieldsetId: props.element.id,
      elementId: elementId,
      position: position,
      isMove: true,
    });

    // Reset the global drag state
    currentDraggedElementId.value = null;

    // Reset the drop position
    dropPosition.value = { index: 0, top: 0 };
    return;
  }

  // Otherwise, continue with the original code for adding new elements
  const elementType = e.dataTransfer.getData("application/element-type");
  if (!elementType) {
    return;
  }

  // Use the calculated drop position
  const position = dropPosition.value.index;

  // Emit event with fieldset id and element type
  emit("element-drop", {
    fieldsetId: props.element.id,
    elementType: elementType,
    position: position,
  });

  // Reset the drop position
  dropPosition.value = { index: 0, top: 0 };
}

// Handle nested element drop events from child components
function handleNestedElementDrop(event: {
  fieldsetId: string;
  elementType: string;
}) {
  // Just forward the event up, don't modify it
  emit("element-drop", event);
}

// Prevent click propagation on all form elements
function stopPropagation(e: Event) {
  e.stopPropagation();
}

// Handle insertion point click within fieldset
function handleInsertPointClick({
  index,
  fieldsetId,
}: {
  index: number;
  fieldsetId?: string;
}) {
  if (!props.element.id) return;

  // Create a custom event to open the command palette
  const event = new CustomEvent("openCommandPalette", {
    detail: {
      insertPosition: index,
      mode: "insert",
      fieldsetId: props.element.id,
    },
  });

  window.dispatchEvent(event);
}
</script>

<template>
  <div
    class="element-card"
    :class="{
      selected: formBuilderStore.selectedElementId === element.id,
      dragging: isDragging,
    }"
    @click="(e) => selectElement(element.id, e)"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="element-card__header">
      <div class="element-card__drag-handle" title="Drag to reorder">
        <svg viewBox="0 0 24 24">
          <path d="M8 9h8M8 12h8M8 15h8" />
        </svg>
      </div>
      <span class="element-card__title">
        {{ element.type.charAt(0).toUpperCase() + element.type.slice(1)
        }}<span v-if="element.label">: {{ element.label }}</span>
      </span>
      <div class="element-card__actions">
        <button
          class="icon-btn"
          title="Edit"
          @click="(e) => handleEdit(e, element.id)"
        >
          <svg viewBox="0 0 24 24">
            <path
              d="M16.475 5.408l2.117 2.117a2.121 2.121 0 0 1 0 3l-9.192 9.192a2 2 0 0 1-1.414.586H5v-2.586a2 2 0 0 1 .586-1.414l9.192-9.192a2.121 2.121 0 0 1 3 0z"
            />
            <path d="M15 7l2 2" />
          </svg>
        </button>
        <button
          class="icon-btn"
          title="Delete"
          @click="(e) => handleDelete(e, element.id)"
        >
          <svg viewBox="0 0 24 24">
            <path d="M4 7h16" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" />
            <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
          </svg>
        </button>
      </div>
    </div>
    <div class="element-card__body">
      <template v-if="element.type === 'input'">
        <input
          type="text"
          :placeholder="element.placeholder"
          disabled
          @click="stopPropagation"
        />
      </template>
      <template v-else-if="element.type === 'textarea'">
        <textarea
          :placeholder="element.placeholder"
          disabled
          @click="stopPropagation"
        ></textarea>
      </template>
      <template v-else-if="element.type === 'checkbox'">
        <label class="checkbox-label" @click="stopPropagation">
          <input
            type="checkbox"
            :checked="element.checked"
            disabled
            @click="stopPropagation"
          />
          {{ element.label }}
        </label>
      </template>
      <template v-else-if="element.type === 'select'">
        <select disabled @click="stopPropagation">
          <option
            v-for="option in element.options"
            :key="option.value"
            :value="option.value"
            @click="stopPropagation"
          >
            {{ option.label }}
          </option>
        </select>
      </template>
      <template v-else-if="element.type === 'radio'">
        <div class="radio-group" @click="stopPropagation">
          <label
            v-for="option in element.options"
            :key="option.value"
            class="radio-label"
            @click="stopPropagation"
          >
            <input
              type="radio"
              :name="element.id"
              :value="option.value"
              :checked="option.value === element.defaultValue"
              disabled
              @click="stopPropagation"
            />
            {{ option.label }}
          </label>
        </div>
      </template>
      <template v-else-if="element.type === 'button'">
        <button
          :type="element.buttonType || 'button'"
          disabled
          @click="stopPropagation"
        >
          {{ element.label }}
        </button>
      </template>
      <template v-else-if="element.type === 'fieldset'">
        <div
          class="element-fieldset"
          :class="{ 'fieldset-drag-target': isFieldsetDragTarget }"
          @dragover="handleFieldsetDragOver"
          @dragleave="handleFieldsetDragLeave"
          @drop="handleFieldsetDrop"
          ref="fieldsetEl"
        >
          <div class="fieldset-legend">{{ element.label }}</div>

          <!-- Drop indicator for drag and drop -->
          <div
            v-if="isFieldsetDragTarget"
            class="drop-indicator fieldset-drop-indicator"
            :style="{ top: `${dropPosition.top}px` }"
          ></div>

          <div class="fieldset-content">
            <!-- Einfügepunkt am Anfang des Fieldsets -->
            <InsertionPoint
              :index="0"
              :fieldsetId="element.id"
              @insert="handleInsertPointClick"
            />

            <!-- Fieldset children with insertion points between them -->
            <template v-if="element.children && element.children.length > 0">
              <template
                v-for="(child, childIndex) in element.children"
                :key="child.id"
              >
                <FormElementRenderer
                  :element="child"
                  @element-drop="handleNestedElementDrop"
                />
                <InsertionPoint
                  :index="childIndex + 1"
                  :fieldsetId="element.id"
                  @insert="handleInsertPointClick"
                />
              </template>
            </template>
            <div v-else class="fieldset-empty" @click="stopPropagation">
              Drop elements here
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div @click="stopPropagation">
          {{ element.label }} ({{ element.type }})
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.element-card {
  background: var(--theme-bg-surface, #232834);
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border, #3a3f4a);
  transition: all 0.2s;
  width: 100%;
  overflow: hidden;
  margin-bottom: 0.5rem;
  cursor: grab;

  &.selected {
    border: 1px solid var(--theme-primary, #1abc9c);
    box-shadow: 0 0 0 1px rgba(26, 188, 156, 0.4);
  }

  &.dragging {
    opacity: 0.5;
    cursor: grabbing;
    transform: scale(1.02);
    border: 1px dashed var(--theme-primary, #1abc9c);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to right, #2c313c, #343b48);
    padding: 0.3rem 0.6rem;
    font-weight: 500;
    color: var(--theme-text, #fff);
  }

  &__drag-handle {
    cursor: grab;
    margin-right: 0.5rem;
    display: flex;
    align-items: center;

    svg {
      width: 16px;
      height: 16px;
      stroke: var(--theme-text-muted, #aaa);
      stroke-width: 2;
      fill: none;
    }

    &:hover svg {
      stroke: var(--theme-primary, #1abc9c);
    }
  }

  &__title {
    font-size: 0.85em;
    color: var(--theme-text, #fff);
    font-weight: 500;
    flex-grow: 1;
  }

  &__actions {
    display: flex;
    gap: 0.15rem;

    .icon-btn {
      background: none;
      border: none;
      color: var(--theme-text-muted, #aaa);
      font-size: 0.9em;
      cursor: pointer;
      padding: 0.2em;
      border-radius: 3px;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--theme-primary, #1abc9c);
        background: rgba(26, 188, 156, 0.1);
      }
    }

    svg {
      width: 16px;
      height: 16px;
      stroke-width: 1.7;
      stroke: currentColor;
      fill: none;
      display: block;
    }
  }

  &__body {
    padding: 0.5rem 0.6rem;
    background: transparent;

    textarea,
    input,
    select {
      width: 100%;
      background: rgba(0, 0, 0, 0.15);
      color: var(--theme-text, #fff);
      border: 1px solid var(--theme-border, #444);
      border-radius: 4px;
      padding: 0.3rem 0.5rem;
      font-size: 0.85rem;
      margin-bottom: 0.2rem;

      &:disabled {
        opacity: 0.8;
      }
    }

    button {
      background: var(--theme-primary, #1abc9c);
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 0.3rem 0.6rem;
      font-weight: 500;
      font-size: 0.85rem;
      cursor: not-allowed;
      opacity: 0.8;
      margin-top: 0.2rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.9em;

      input[type="checkbox"] {
        accent-color: var(--theme-primary, #1abc9c);
        width: 0.9em;
        height: 0.9em;
      }
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;

      .radio-label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.9em;
      }
    }
  }
}

.element-fieldset {
  border: 1px solid var(--theme-border, #444);
  border-radius: 6px;
  padding: 0.6rem;
  background: rgba(44, 49, 60, 0.3);
  min-height: 70px;
  position: relative;
  transition: all 0.2s ease;

  &.fieldset-drag-target {
    border-color: var(--theme-primary, #1abc9c);
    box-shadow: 0 0 0 1px rgba(26, 188, 156, 0.3);
    background: rgba(44, 49, 60, 0.5);
  }
}

.fieldset-legend {
  font-weight: 500;
  color: var(--theme-text, #fff);
  padding: 0 0.4rem;
  position: absolute;
  top: -7px;
  font-size: 0.8em;
  background: var(--theme-bg-surface, #232834);
  margin-left: 8px;
}

.fieldset-content {
  position: relative;
  width: 100%;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding-top: 0.2rem;
}

.fieldset-empty {
  color: var(--theme-text-muted);
  text-align: center;
  padding: 0.6rem;
  font-style: italic;
  font-size: 0.8em;
}

.fieldset-drop-indicator {
  left: 0.6rem;
  right: 0.6rem;
  position: absolute;
}

.drop-indicator {
  height: 2px;
  background-color: var(--theme-primary, #1abc9c);
  border-radius: 2px;
  z-index: 100;
  box-shadow: 0 0 6px 1px rgba(26, 188, 156, 0.5);
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
</style>
