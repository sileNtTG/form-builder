<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import type { FormElement } from "@/models/FormElement";
import { ref, computed, watch, onMounted } from "vue";
import { useFormBuilderStore } from "@/stores/formBuilder";
import InsertionPoint from "./InsertionPoint.vue";
import { SvgIcon } from "@/components/common";
import DropZone from "./DropZone.vue";
import FormElementRenderer from "./FormElementRenderer.vue";
import SpacerWrapper from "./SpacerWrapper.vue";

const props = defineProps<{
  element: FormElement;
  isDragging?: boolean; // Global dragging state from parent
  index?: number; // For InsertionPoint
  fieldsetId?: string; // For fieldset children
}>();
const emit = defineEmits<{
  "drag-start": [id: string];
  "drag-end": [id: string];
  click: [];
  "fieldset-drop": [
    data: {
      position: "before" | "after";
      siblingId?: string;
      parentId?: string;
      elementId?: string;
      elementType?: string;
    }
  ];
  insert: [data: { index: number; fieldsetId?: string }];
}>();

const formBuilderStore = useFormBuilderStore();
const isLocallyDragging = ref(false);
const dragStartTime = ref(0);
const elementRef = ref<HTMLElement | null>(null);

// Computed property for logging fieldset children
const fieldsetChildrenLog = computed(() => {
  if (props.element.type === "fieldset" && props.element.children) {
    const childrenToLog = props.element.children.map((c) => ({
      id: c.id.slice(-4),
      order: c.order,
      label: c.label,
      type: c.type,
    }));
    return `Fieldset ${props.element.id.slice(-4)} children (${
      childrenToLog.length
    }):\n${JSON.stringify(childrenToLog, null, 2)}`;
  }
  return ""; // Return empty string if not a fieldset or no children
});

// Fieldset drag and drop state
const isFieldsetDragOver = ref(false);
const fieldsetDropIndex = ref(-1);
const lastDropIndexUpdate = ref(0);

// Use computed property for selection state
const isSelected = computed(() => {
  return formBuilderStore.selectedElementId === props.element.id;
});

const elementTitle = computed(() => {
  const type =
    props.element.type.charAt(0).toUpperCase() + props.element.type.slice(1);
  const label = props.element.label ? `: ${props.element.label}` : "";
  return `${type}${label}`;
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
  // Only process drag start if the event target is this component's root element
  if (e.currentTarget !== e.target) {
    // This check ensures that drag events from child FormElementRenderers (e.g., elements inside a fieldset)
    // do not trigger the drag logic of the parent FormElementRenderer (the fieldset itself).
    // e.currentTarget is the element the event listener is attached to (this specific FormElementRenderer's div).
    // e.target is the element that the drag event originated from.
    // If they are not the same, it means the drag started on a child, so the parent should ignore it.
    return;
  }

  if (!e.dataTransfer) {
    console.error(
      `FormElementRenderer: No dataTransfer object in drag start event for ${props.element.id.slice(
        -8
      )}`
    );
    return;
  }

  console.log(
    `FormElementRenderer: *** STARTING DRAG *** for element ${props.element.id.slice(
      -8
    )} (${props.element.type})`
  );

  isLocallyDragging.value = true;
  dragStartTime.value = Date.now();

  // Set data for HTML5 drag & drop with multiple formats for compatibility
  try {
    e.dataTransfer.setData("text/plain", props.element.id);
    e.dataTransfer.setData("application/element-type", props.element.type);
    e.dataTransfer.setData("application/element-id", props.element.id);

    console.log(
      `FormElementRenderer: *** SET DRAG DATA *** - ID: ${props.element.id.slice(
        -8
      )}, Type: ${props.element.type}`
    );
  } catch (err) {
    // Fallback for restrictive browsers
    e.dataTransfer.setData("text", props.element.id);
    console.error(
      "FormElementRenderer: Error setting drag data, using fallback:",
      err
    );
  }

  e.dataTransfer.effectAllowed = "move";

  console.log(
    `FormElementRenderer: *** EMITTING DRAG-START EVENT *** with ID: ${props.element.id.slice(
      -8
    )}`
  );
  emit("drag-start", props.element.id);

  if (e.target instanceof HTMLElement) {
    console.log(`FormElementRenderer: Adding dragging class to target element`);
    e.target.classList.add("dragging");
    console.log(`FormElementRenderer: Using default drag image`);
  } else {
    console.warn(`FormElementRenderer: Target is not HTMLElement:`, e.target);
  }

  console.log(
    `FormElementRenderer: Drag start complete for ${props.element.id.slice(-8)}`
  );
}

// Reset drag state
function handleDragEnd(e: DragEvent) {
  console.log(`📦 ELEMENT DRAG END: ${props.element.id.slice(-8)}`);
  isLocallyDragging.value = false;

  setTimeout(() => {
    if (formBuilderStore.selectedElementId === props.element.id) {
      formBuilderStore.selectElement(null);
    }
  }, 100);

  emit("drag-end", props.element.id);
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

  // Throttle drop index calculation to reduce flickering
  const now = Date.now();
  if (now - lastDropIndexUpdate.value < 50) {
    return; // Skip update if too frequent
  }
  lastDropIndexUpdate.value = now;

  isFieldsetDragOver.value = true;

  // Berechne Drop-Index innerhalb des Fieldsets
  const dropIndex = calculateFieldsetDropIndex(e);
  if (dropIndex !== fieldsetDropIndex.value) {
    fieldsetDropIndex.value = dropIndex;
  }

  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "move";
  }
}

function handleFieldsetDragEnter(e: DragEvent) {
  if (props.element.type !== "fieldset") return;

  e.preventDefault();
  e.stopPropagation();
  isFieldsetDragOver.value = true;

  console.log(
    `FormElementRenderer: *** FIELDSET DRAGENTER *** - ID: ${props.element.id.slice(
      -8
    )}, target:`,
    e.target
  );
}

function handleFieldsetDragLeave(e: DragEvent) {
  if (props.element.type !== "fieldset") return;

  // Check if we're leaving the fieldset for another child element
  const fieldsetElement = e.currentTarget as HTMLElement;
  const relatedTarget = e.relatedTarget as HTMLElement;

  console.log(
    `FormElementRenderer: Fieldset DragLeave - ID: ${props.element.id.slice(
      -8
    )}`
  );
  console.log(`FormElementRenderer: Leave - currentTarget:`, e.currentTarget);
  console.log(`FormElementRenderer: Leave - relatedTarget:`, e.relatedTarget);

  if (
    relatedTarget &&
    fieldsetElement &&
    fieldsetElement.contains(relatedTarget)
  ) {
    console.log(
      `FormElementRenderer: Fieldset DragLeave (internal) - ID: ${props.element.id.slice(
        -8
      )}`
    );
    return; // Don't reset state if moving to child element
  }

  console.log(
    `FormElementRenderer: Fieldset DragLeave (real) - ID: ${props.element.id.slice(
      -8
    )}`
  );
  resetFieldsetDragState();
}

function handleFieldsetDrop(e: DragEvent) {
  console.log(
    `FormElementRenderer: *** FIELDSET DROP DISABLED *** - All drops go through DropZones now`
  );

  // All fieldset drops should be handled by DropZones now
  // This handler is disabled to prevent conflicts
  return;

  if (props.element.type !== "fieldset") return;
}

function calculateFieldsetDropIndex(e: DragEvent): number {
  if (props.element.type !== "fieldset" || !props.element.children) {
    return 0;
  }

  const fieldsetElement = e.currentTarget as HTMLElement;
  const fieldsetContent = fieldsetElement.querySelector(".fieldset-content");
  if (!fieldsetContent) {
    return 0;
  }

  const mouseY = e.clientY;

  // If no children, return 0
  if (!props.element.children.length) {
    return 0;
  }

  // Find all actual FormElementRenderer components (exclude drag indicators and insertion points)
  const childElements = Array.from(fieldsetContent.children).filter((child) => {
    const element = child as HTMLElement;
    return (
      element.hasAttribute("data-element-id") &&
      !element.classList.contains("insertion-point-container") &&
      !element.classList.contains("fieldset-drop-indicator") &&
      !element.classList.contains("dragging") // Exclude currently dragging element
    );
  });

  if (childElements.length === 0) {
    return 0;
  }

  // Check each element to find the best insertion point
  for (let i = 0; i < childElements.length; i++) {
    const element = childElements[i];
    const elementRect = element.getBoundingClientRect();
    const elementMiddle = elementRect.top + elementRect.height / 2;

    // If mouse is above the middle of this element, insert before it
    if (mouseY < elementMiddle) {
      return i;
    }
  }

  // If we get here, insert at the end
  return childElements.length;
}

function handleFieldsetInsertPointClick({
  index,
  fieldsetId,
}: {
  index: number;
  fieldsetId?: string;
}) {
  const event = new CustomEvent("openCommandPalette", {
    detail: {
      insertPosition: index,
      mode: "insert",
      fieldsetId: fieldsetId,
    },
  });
  window.dispatchEvent(event);
}

// Hilfsfunktion zum Erstellen von Elementen (aus FormCanvas kopiert)
function createElementByType(
  type: string,
  position: number
): FormElement | null {
  const baseProps = {
    id: crypto.randomUUID(),
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
    case "radio":
      return {
        ...baseProps,
        type: "radio",
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ],
        defaultValue: "option1",
        width: 250,
        height: 80,
      } as FormElement;
    case "button":
      return {
        ...baseProps,
        type: "button",
        buttonType: "button",
        width: 150,
        height: 48,
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
    case "fieldset":
      return {
        ...baseProps,
        type: "fieldset",
        children: [],
        width: 400,
        height: 200,
      } as FormElement;
    default:
      console.warn(`Unknown element type: ${type}`);
      return null;
  }
}

function resetFieldsetDragState() {
  isFieldsetDragOver.value = false;
  fieldsetDropIndex.value = -1;
}

function handleClick(e: Event) {
  e.stopPropagation();
  emit("click");
}

function deleteElement() {
  formBuilderStore.removeElement(props.element.id);
}

function editElement() {
  // TODO: Implement edit functionality
  console.log("Edit element:", props.element.id);
}

function handleChildClick(childId: string) {
  formBuilderStore.selectElement(childId);
}

function handleFieldsetDropZoneDrop(data: {
  position: "before" | "after";
  siblingId?: string;
  parentId?: string;
  elementId?: string;
  elementType?: string;
}) {
  console.log(
    `🎯 FIELDSET DROP RECEIVED BY RENDERER: ${
      data.elementId?.slice(-8) || data.elementType
    } ${data.position} ${
      data.siblingId?.slice(-8) || "end"
    } - Original parentId: ${data.parentId?.slice(-8) || "none"}`
  );

  // Ensure the parentId is THIS fieldset's ID when emitting
  const eventData = {
    ...data,
    parentId: props.element.id, // Override with THIS fieldset's ID
  };

  console.log(
    `🎯 FIELDSET DROP EMITTING TO CANVAS: ${
      eventData.elementId?.slice(-8) || eventData.elementType
    } ${eventData.position} ${
      eventData.siblingId?.slice(-8) || "end"
    } - Corrected parentId: ${eventData.parentId?.slice(-8)}`
  );

  // Emit to parent FormCanvas to handle the actual logic
  emit("fieldset-drop", eventData);
}

function handleInsertPointClick(data: { index: number; fieldsetId?: string }) {
  emit("insert", data);
}
</script>

<template>
  <div ref="elementRef">
    <!-- Regular elements (non-fieldset) -->
    <div
      v-if="element.type !== 'fieldset'"
      class="element-card"
      :class="{
        selected: isSelected,
        dragging: isLocallyDragging,
      }"
      :draggable="true"
      :data-element-id="element.id"
      :data-element-type="element.type"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @click="handleClick"
    >
      <div class="element-card__header">
        <div class="element-card__drag-handle">
          <SvgIcon name="grip-vertical" :size="16" />
        </div>

        <span class="element-card__title">{{ elementTitle }}</span>

        <div class="element-card__actions">
          <button class="icon-btn" @click.stop="editElement" title="Edit">
            <SvgIcon name="edit" :size="14" />
          </button>
          <button class="icon-btn" @click.stop="deleteElement" title="Delete">
            <SvgIcon name="trash" :size="14" />
          </button>
        </div>
      </div>

      <div class="element-card__body">
        <!-- Regular element rendering -->
        <template v-if="element.type === 'input'">
          <input type="text" :placeholder="element.placeholder" disabled />
        </template>
        <template v-else-if="element.type === 'textarea'">
          <textarea
            :placeholder="element.placeholder"
            :rows="element.rows || 4"
            disabled
          ></textarea>
        </template>
        <template v-else-if="element.type === 'checkbox'">
          <label class="checkbox-label">
            <input type="checkbox" :checked="element.checked" disabled />
            {{ element.label }}
          </label>
        </template>
        <template v-else-if="element.type === 'select'">
          <select disabled>
            <option
              v-for="option in element.options"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </template>
        <template v-else-if="element.type === 'radio'">
          <div class="radio-group">
            <label
              v-for="option in element.options"
              :key="option.value"
              class="radio-label"
            >
              <input
                type="radio"
                :name="element.id"
                :value="option.value"
                :checked="option.value === element.defaultValue"
                disabled
              />
              {{ option.label }}
            </label>
          </div>
        </template>
        <template v-else-if="element.type === 'button'">
          <button :type="element.buttonType || 'button'" disabled>
            {{ element.label }}
          </button>
        </template>
        <template v-else-if="element.type === 'number'">
          <input type="number" :min="element.min" :max="element.max" disabled />
        </template>
        <template v-else-if="element.type === 'date'">
          <input type="date" disabled />
        </template>
        <template v-else>
          <div>{{ element.label || element.type }}</div>
        </template>
      </div>
    </div>

    <!-- Fieldset elements -->
    <div
      v-else
      class="element-fieldset"
      :class="{
        'fieldset-drag-over': isFieldsetDragOver,
        selected: isSelected,
      }"
      :draggable="!isLocallyDragging"
      :data-element-id="element.id"
      :data-element-type="element.type"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @click="handleClick"
    >
      <div class="fieldset-header">
        <div class="fieldset-drag-handle">
          <SvgIcon name="grip-vertical" :size="16" />
        </div>

        <h3 class="fieldset-title">
          {{ element.label || "Untitled Fieldset" }}
        </h3>

        <div class="fieldset-actions">
          <button
            class="icon-btn"
            @click.stop="editElement"
            title="Edit Fieldset"
          >
            <SvgIcon name="edit" :size="14" />
          </button>
          <button
            class="icon-btn"
            @click.stop="deleteElement"
            title="Delete Fieldset"
          >
            <SvgIcon name="trash" :size="14" />
          </button>
        </div>
      </div>

      <div class="fieldset-content" ref="fieldsetContentRef">
        {{
          // Log the formatted string from the computed property
          fieldsetChildrenLog ? console.log(fieldsetChildrenLog) : ""
        }}
        <template v-if="element.children && element.children.length > 0">
          <!-- First spacer -->
          {{
            console.log(
              `Fieldset ${element.id.slice(
                -4
              )}: First SpacerWrapper, siblingId: ${
                element.children[0]?.id.slice(-4) || "none"
              }`
            )
          }}
          <SpacerWrapper
            :index="0"
            :fieldset-id="element.id"
            :is-dragging="isDragging"
            :sibling-id="element.children[0]?.id"
            @insert="handleFieldsetInsertPointClick"
            @drop="handleFieldsetDropZoneDrop"
          />

          <!-- Child elements with spacers between them -->
          <template
            v-for="(child, childIndex) in element.children"
            :key="child.id"
          >
            {{
              console.log(
                `Fieldset ${element.id.slice(
                  -4
                )}: Rendering child ${child.id.slice(
                  -4
                )} at index ${childIndex}`
              )
            }}
            <FormElementRenderer
              :element="child"
              :is-dragging="isDragging"
              @click="() => handleChildClick(child.id)"
              @fieldset-drop="handleFieldsetDropZoneDrop"
              @insert="handleFieldsetInsertPointClick"
            />

            <!-- Spacer after each element (except the last) -->
            <template v-if="childIndex < element.children.length - 1">
              {{
                console.log(
                  `Fieldset ${element.id.slice(
                    -4
                  )}: SpacerWrapper after ${child.id.slice(
                    -4
                  )}, next siblingId: ${
                    element.children[childIndex + 1]?.id.slice(-4) || "none"
                  }`
                )
              }}
              <SpacerWrapper
                :index="childIndex + 1"
                :fieldset-id="element.id"
                :is-dragging="isDragging"
                :sibling-id="element.children[childIndex + 1]?.id"
                @insert="handleFieldsetInsertPointClick"
                @drop="handleFieldsetDropZoneDrop"
              />
            </template>
          </template>

          <!-- Final spacer at the end -->
          {{
            console.log(
              `Fieldset ${element.id.slice(
                -4
              )}: Final SpacerWrapper, no siblingId`
            )
          }}
          <SpacerWrapper
            :index="element.children.length"
            :fieldset-id="element.id"
            :is-dragging="isDragging"
            @insert="handleFieldsetInsertPointClick"
            @drop="handleFieldsetDropZoneDrop"
          />
        </template>
        <!-- Empty state for fieldset -->
        <template v-else>
          {{
            console.log(
              `Fieldset ${element.id.slice(-4)}: Empty state SpacerWrapper`
            )
          }}
          <SpacerWrapper
            :index="0"
            :fieldset-id="element.id"
            :is-dragging="isDragging"
            @insert="handleFieldsetInsertPointClick"
            @drop="handleFieldsetDropZoneDrop"
          />
        </template>
      </div>
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
  border: 1px solid var(--theme-border, #3a3f4a);
  border-radius: 8px;
  background: var(--theme-bg-surface, #232834);
  min-height: 100px;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--theme-border-hover, #4a5568);
  }

  &.selected {
    outline: 2px solid var(--theme-primary, #1abc9c);
    outline-offset: -1px;
  }

  &.fieldset-drag-over {
    background: rgba(26, 188, 156, 0.05);
    outline: 2px dashed var(--theme-primary, #1abc9c);
    outline-offset: -1px;
    box-shadow: 0 0 15px rgba(26, 188, 156, 0.3);
  }
}

.fieldset-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(to right, #2c313c, #343b48);
  padding: 0.6rem 1rem;
  border-radius: 7px 7px 0 0;
  border-bottom: 1px solid var(--theme-border, #3a3f4a);
}

.fieldset-drag-handle {
  cursor: grab;
  margin-right: 0.8rem;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.15);
  padding: 6px;
  border-radius: 4px;
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

.fieldset-title {
  color: var(--theme-text, #fff);
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  flex-grow: 1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fieldset-actions {
  display: flex;
  gap: 0.3rem;

  .icon-btn {
    background: none;
    border: none;
    color: var(--theme-text-muted, #aaa);
    padding: 0.4rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--theme-primary, #1abc9c);
      background: rgba(26, 188, 156, 0.1);
    }

    svg {
      width: 14px;
      height: 14px;
      stroke: currentColor;
      fill: none;
    }
  }
}

.fieldset-content {
  position: relative;
  width: 100%;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0.8rem;
  padding-left: 1.2rem;

  /* Nesting indicator line at the left edge of the fieldset content */
  &::before {
    content: "";
    position: absolute;
    left: 8px;
    top: 1rem;
    bottom: 1rem;
    width: 2px;
    background: rgba(26, 188, 156, 0.3);
    border-radius: 1px;
  }

  /* Child elements styling */
  .element-card {
    margin-bottom: 0;
    margin-left: 0;
    border-left: none;
    position: relative;

    /* Remove any additional styling that creates visual noise */
    &::before {
      display: none;
    }
  }
}

.fieldset-empty {
  text-align: center;
  padding: 2rem;
  color: var(--theme-text-muted, #aaa);
  font-style: italic;
  border: 2px dashed var(--theme-border-muted, #3a3f4a);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
}
</style>
