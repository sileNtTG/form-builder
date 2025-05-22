<script setup lang="ts">
import type { FormElement } from "../../models/FormElement";
import { ref, computed, watch, onMounted } from "vue";
import { useFormBuilderStore } from "../../stores/formBuilder";

const props = defineProps<{ element: FormElement }>();
const emit = defineEmits(["drag-start", "click"]);

const formBuilderStore = useFormBuilderStore();
const isDragging = ref(false);

// Fieldset drag and drop state
const isFieldsetDragOver = ref(false);
const fieldsetDropIndex = ref(-1);

// Use computed property for selection state
const isSelected = computed(() => {
  return formBuilderStore.selectedElementId === props.element.id;
});

// Handle element selection
function selectElement(event: Event) {
  event.stopPropagation();
  emit("click");

  // Force immediate selection in the store for better reactivity
  formBuilderStore.selectElement(props.element.id);
}

function handleEdit(e: Event) {
  e.stopPropagation();
  formBuilderStore.selectElement(props.element.id);
}

function handleDelete(e: Event) {
  e.stopPropagation();
  formBuilderStore.removeElement(props.element.id);
}

function handleDragStart(e: DragEvent) {
  if (!e.dataTransfer) return;

  isDragging.value = true;

  // Set data for HTML5 drag & drop with multiple formats for compatibility
  try {
    e.dataTransfer.setData("text/plain", props.element.id);
    e.dataTransfer.setData("application/element-type", props.element.type);
    e.dataTransfer.setData("application/element-id", props.element.id);
  } catch (err) {
    // Fallback for restrictive browsers
    e.dataTransfer.setData("text", props.element.id);
  }

  e.dataTransfer.effectAllowed = "move";
  emit("drag-start", props.element.id);

  if (e.target instanceof HTMLElement) {
    e.target.classList.add("dragging");

    // Create enhanced drag image
    try {
      const ghost = e.target.cloneNode(true) as HTMLElement;
      ghost.style.transform = "scale(0.8)";
      ghost.style.opacity = "0.8";
      ghost.style.position = "absolute";
      ghost.style.top = "-1000px";
      ghost.style.left = "-1000px";
      document.body.appendChild(ghost);

      e.dataTransfer.setDragImage(ghost, 20, 20);

      setTimeout(() => {
        document.body.removeChild(ghost);
      }, 100);
    } catch (err) {
      console.error("Error creating drag image:", err);
    }
  }
}

// Reset drag state
function handleDragEnd(e: DragEvent) {
  isDragging.value = false;

  if (e.target instanceof HTMLElement) {
    e.target.classList.remove("dragging");
  }
}

function stopPropagation(e: Event) {
  e.stopPropagation();
}

// Watch for selection changes and force component update
watch(
  () => formBuilderStore.selectedElementId,
  (newId) => {
    if (newId === props.element.id) {
      console.log(`Element ${props.element.id} is now selected`);
    }
  }
);

// When the component is mounted, check if it should be selected
onMounted(() => {
  if (formBuilderStore.selectedElementId === props.element.id) {
    console.log(`Element ${props.element.id} is initially selected`);
  }
});

// Neue Funktionen für Fieldset-Drag-and-Drop
function handleFieldsetDragOver(e: DragEvent) {
  if (props.element.type !== "fieldset") return;

  e.preventDefault();
  e.stopPropagation();

  isFieldsetDragOver.value = true;

  // Berechne Drop-Index innerhalb des Fieldsets
  const dropIndex = calculateFieldsetDropIndex(e);
  fieldsetDropIndex.value = dropIndex;

  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "copy";
  }
}

function handleFieldsetDragEnter(e: DragEvent) {
  if (props.element.type !== "fieldset") return;

  e.preventDefault();
  e.stopPropagation();
  isFieldsetDragOver.value = true;
}

function handleFieldsetDragLeave(e: DragEvent) {
  if (props.element.type !== "fieldset") return;

  const related = e.relatedTarget as HTMLElement;
  const fieldsetElement = e.currentTarget as HTMLElement;

  // Nur zurücksetzen wenn wir das Fieldset wirklich verlassen
  if (!fieldsetElement.contains(related)) {
    isFieldsetDragOver.value = false;
    fieldsetDropIndex.value = -1;
  }
}

function handleFieldsetDrop(e: DragEvent) {
  if (props.element.type !== "fieldset") return;

  e.preventDefault();
  e.stopPropagation();

  const dropIndex = fieldsetDropIndex.value;

  console.log(`Drop in fieldset ${props.element.id} at position ${dropIndex}`);

  if (e.dataTransfer) {
    try {
      const elementType =
        e.dataTransfer.getData("text/plain") ||
        e.dataTransfer.getData("application/element-type");

      const elementId = e.dataTransfer.getData("application/element-id");

      if (elementId) {
        // Element verschieben
        console.log(
          `Moving element ${elementId} to fieldset ${props.element.id} at position ${dropIndex}`
        );
        formBuilderStore.moveElementToPosition(
          elementId,
          dropIndex,
          props.element.id
        );
      } else if (
        elementType &&
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
        // Neues Element erstellen
        console.log(
          `Creating new ${elementType} in fieldset ${props.element.id} at position ${dropIndex}`
        );
        const newElement = createElementByType(elementType, dropIndex);
        if (newElement) {
          formBuilderStore.addElementAtPosition(
            newElement,
            dropIndex,
            props.element.id
          );
        }
      }
    } catch (err) {
      console.error("Error handling fieldset drop:", err);
    }
  }

  // Reset
  isFieldsetDragOver.value = false;
  fieldsetDropIndex.value = -1;
}

function calculateFieldsetDropIndex(e: DragEvent): number {
  if (props.element.type !== "fieldset" || !props.element.children) return 0;

  const fieldsetContent = (e.currentTarget as HTMLElement).querySelector(
    ".fieldset-content"
  );
  if (!fieldsetContent) return 0;

  const rect = fieldsetContent.getBoundingClientRect();
  const relativeY = e.clientY - rect.top;

  const childCards = Array.from(
    fieldsetContent.querySelectorAll(".element-card")
  );

  if (childCards.length === 0) return 0;

  for (let i = 0; i < childCards.length; i++) {
    const card = childCards[i] as HTMLElement;
    const cardRect = card.getBoundingClientRect();
    const cardTop = cardRect.top - rect.top;
    const cardMiddle = cardTop + cardRect.height / 2;

    if (relativeY < cardMiddle) {
      return i;
    }
  }

  return childCards.length;
}

// Hilfsfunktion zum Erstellen von Elementen (aus FormCanvas kopiert)
function createElementByType(
  type: string,
  position: number
): FormElement | null {
  const baseProps = {
    id: crypto.randomUUID(),
    label: `Neues ${type.charAt(0).toUpperCase() + type.slice(1)}`,
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
        placeholder: "Text eingeben",
      } as FormElement;
    case "textarea":
      return {
        ...baseProps,
        type: "textarea",
        placeholder: "Text eingeben",
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
    case "fieldset":
      return {
        ...baseProps,
        type: "fieldset",
        children: [],
        width: 400,
        height: 200,
      } as FormElement;
    default:
      return null;
  }
}
</script>

<template>
  <div
    class="element-card"
    :class="{
      selected: isSelected,
      dragging: isDragging,
    }"
    @click="selectElement"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    :data-element-id="element.id"
    :data-element-type="element.type"
  >
    <div class="element-card__header">
      <div class="element-card__drag-handle" title="Drag to reorder">
        <svg viewBox="0 0 24 24">
          <path d="M8 9h8M8 12h8M8 15h8" />
        </svg>
      </div>
      <span class="element-card__title">
        {{ element.type.charAt(0).toUpperCase() + element.type.slice(1) }}
        <span v-if="element.label">: {{ element.label }}</span>
      </span>
      <div class="element-card__actions">
        <button class="icon-btn" title="Edit" @click="handleEdit">
          <svg viewBox="0 0 24 24">
            <path
              d="M16.475 5.408l2.117 2.117a2.121 2.121 0 0 1 0 3l-9.192 9.192a2 2 0 0 1-1.414.586H5v-2.586a2 2 0 0 1 .586-1.414l9.192-9.192a2.121 2.121 0 0 1 3 0z"
            />
            <path d="M15 7l2 2" />
          </svg>
        </button>
        <button class="icon-btn" title="Delete" @click="handleDelete">
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
          :class="{ 'fieldset-drag-over': isFieldsetDragOver }"
          @dragover="handleFieldsetDragOver"
          @dragenter="handleFieldsetDragEnter"
          @dragleave="handleFieldsetDragLeave"
          @drop="handleFieldsetDrop"
        >
          <div class="fieldset-legend">{{ element.label }}</div>
          <div class="fieldset-content">
            <!-- Drop-Indikator am Anfang -->
            <div
              v-if="isFieldsetDragOver && fieldsetDropIndex === 0"
              class="fieldset-drop-indicator"
            ></div>

            <template v-if="element.children && element.children.length > 0">
              <template
                v-for="(child, childIndex) in element.children"
                :key="child.id"
              >
                <FormElementRenderer
                  :element="child"
                  @drag-start="$emit('drag-start', $event)"
                />
                <!-- Drop-Indikator zwischen Elementen -->
                <div
                  v-if="
                    isFieldsetDragOver && fieldsetDropIndex === childIndex + 1
                  "
                  class="fieldset-drop-indicator"
                ></div>
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
  cursor: pointer;

  &.selected {
    border: 1px solid var(--theme-primary, #1abc9c);
    box-shadow: 0 0 0 1px rgba(26, 188, 156, 0.4);
  }

  &.dragging {
    opacity: 0.5;
    transform: scale(0.98);
    border: 1px dashed var(--theme-primary, #1abc9c);
    position: relative;
    z-index: 10;
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
    background: rgba(0, 0, 0, 0.15);
    padding: 5px;
    border-radius: 3px;
    transition: all 0.2s;

    svg {
      width: 16px;
      height: 16px;
      stroke: var(--theme-text-muted, #aaa);
      stroke-width: 2;
      fill: none;
    }

    &:hover {
      background: rgba(26, 188, 156, 0.2);
      transform: scale(1.05);

      svg {
        stroke: var(--theme-primary, #1abc9c);
      }
    }

    &:active {
      cursor: grabbing;
      background: rgba(26, 188, 156, 0.3);
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

  &.fieldset-drag-over {
    background: rgba(26, 188, 156, 0.1);
    border: 2px dashed var(--theme-primary, #1abc9c);
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
  border: 1px dashed var(--theme-border);
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: rgba(26, 188, 156, 0.05);
    border-color: var(--theme-primary);
  }
}

.fieldset-drop-indicator {
  height: 3px;
  background-color: var(--theme-primary, #1abc9c);
  border-radius: 2px;
  margin: 4px 0;
  animation: pulse 1.5s infinite;
  opacity: 0.8;
}

@keyframes pulse {
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.4;
  }
}
</style>
