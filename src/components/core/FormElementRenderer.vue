<script setup lang="ts">
import { computed } from "vue";
import type { FormElement } from "@/models/FormElement";
import { useDragAndDrop } from "@/composables";
import { useFormBuilderStore } from "@/stores/formBuilder";
import { useNavigationStore } from "@/stores/navigation";
import { SvgIcon } from "@/components/common";
import SpacerWrapper from "./SpacerWrapper.vue";

interface Props {
  element: FormElement;
  isDragging?: boolean; // Global dragging state from parent
}

const props = defineProps<Props>();
const emit = defineEmits<{
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

const { startInternalDrag, endDrag } = useDragAndDrop();
const formBuilderStore = useFormBuilderStore();
const navigationStore = useNavigationStore();

// Use computed property for selection state
const isSelected = computed(() => {
  return formBuilderStore.selectedElementId === props.element.dataId;
});

const elementTitle = computed(() => {
  const type =
    props.element.type.charAt(0).toUpperCase() + props.element.type.slice(1);
  const label = props.element.label ? `: ${props.element.label}` : "";
  return `${type}${label}`;
});

function handleDragStart(event: DragEvent) {
  const elementId = props.element.dataId;
  const elementType = props.element.type;

  // Stop propagation to prevent parent fieldset from handling the drag
  event.stopPropagation();

  // Add dragging class to the element
  const target = event.target as HTMLElement;
  target.classList.add("dragging");

  // Set drag data for compatibility
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "all";
    event.dataTransfer.setData("application/x-element-id", elementId);
    event.dataTransfer.setData("text/plain", elementType);
  }

  // Start internal drag
  startInternalDrag(elementId, elementType);
}

function handleDragEnd(event: DragEvent) {
  // Stop propagation to prevent parent fieldset from handling the drag end
  event.stopPropagation();

  // Nur endDrag() aufrufen wenn das Event vom DIESEM Element kommt
  const target = event.target as HTMLElement;
  const elementId = target.getAttribute("data-element-id");

  // Remove dragging class
  target.classList.remove("dragging");

  // Nur reset wenn es UNSER Element ist
  if (elementId === props.element.dataId) {
    endDrag();
  }
}

function handleClick() {
  formBuilderStore.selectElement(props.element.dataId);
}

function handleElementClick(elementId: string) {
  formBuilderStore.selectElement(elementId);
}

function handleEdit(e: Event) {
  e.stopPropagation();
  formBuilderStore.selectElement(props.element.dataId);

  // Switch to Properties tab using navigation store
  navigationStore.switchToPropertiesTab();
}

function handleDelete(e: Event) {
  e.stopPropagation();
  formBuilderStore.removeElement(props.element.dataId);
}

function handleInsertPointClick(data: { index: number; fieldsetId?: string }) {
  emit("insert", data);
}

function handleFieldsetDropZoneDrop(data: {
  position: "before" | "after";
  siblingId?: string;
  parentId?: string;
  elementId?: string;
  elementType?: string;
}) {
  // Ensure the parentId is THIS fieldset's ID when emitting
  const eventData = {
    ...data,
    parentId: props.element.dataId, // Override with THIS fieldset's ID
  };

  // Emit to parent FormCanvas to handle the actual logic
  emit("fieldset-drop", eventData);
}
</script>

<template>
  <div
    v-if="element.type !== 'fieldset'"
    class="element-card"
    :class="{
      selected: isSelected,
    }"
    draggable="true"
    :data-element-id="element.dataId"
    :data-element-type="element.type"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click.stop="handleClick"
  >
    <div class="element-card__header">
      <div class="element-card__drag-handle">
        <SvgIcon name="grip-vertical" :size="16" />
      </div>

      <span class="element-card__title">{{ elementTitle }}</span>

      <div class="element-card__actions">
        <button class="icon-btn" @click.stop="handleEdit" title="Edit">
          <SvgIcon name="edit" :size="14" />
        </button>
        <button class="icon-btn" @click.stop="handleDelete" title="Delete">
          <SvgIcon name="trash" :size="14" />
        </button>
      </div>
    </div>

    <div class="element-card__body">
      <!-- Regular element rendering with original styles -->
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
              :name="element.dataId"
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

  <!-- Fieldset elements - separate structure -->
  <div
    v-else
    class="fieldset-container"
    :class="{ selected: isSelected }"
    :data-element-id="element.dataId"
    :data-element-type="element.type"
    @click="handleClick"
  >
    <div
      class="fieldset-header"
      draggable="true"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
    >
      <div class="fieldset-drag-handle">
        <SvgIcon name="grip-vertical" :size="16" />
      </div>
      <h3 class="fieldset-title">{{ element.label || "Untitled Fieldset" }}</h3>
      <div class="fieldset-actions">
        <button class="icon-btn" @click.stop="handleEdit" title="Edit Fieldset">
          <SvgIcon name="edit" :size="14" />
        </button>
        <button
          class="icon-btn"
          @click.stop="handleDelete"
          title="Delete Fieldset"
        >
          <SvgIcon name="trash" :size="14" />
        </button>
      </div>
    </div>
    <div class="fieldset-content">
      <template v-if="element.children && element.children.length > 0">
        <!-- First spacer: before first child -->
        <SpacerWrapper
          :index="0"
          :fieldset-id="element.dataId"
          :is-dragging="isDragging"
          position="before"
          :sibling-id="element.children[0]?.dataId"
          @insert="handleInsertPointClick"
          @drop="handleFieldsetDropZoneDrop"
        />
        <!-- Child elements with spacers between them -->
        <template
          v-for="(child, childIndex) in element.children"
          :key="child.dataId"
        >
          <FormElementRenderer
            :element="child"
            :is-dragging="isDragging"
            @fieldset-drop="handleFieldsetDropZoneDrop"
            @insert="handleInsertPointClick"
          />
          <!-- Spacer after each element (including the last) -->
          <SpacerWrapper
            :index="childIndex + 1"
            :fieldset-id="element.dataId"
            :is-dragging="isDragging"
            position="after"
            :sibling-id="child.dataId"
            @insert="handleInsertPointClick"
            @drop="handleFieldsetDropZoneDrop"
          />
        </template>
      </template>
      <!-- Empty fieldset with single SpacerWrapper -->
      <template v-else>
        <SpacerWrapper
          :index="0"
          :fieldset-id="element.dataId"
          :is-dragging="isDragging"
          position="before"
          @insert="handleInsertPointClick"
          @drop="handleFieldsetDropZoneDrop"
        />
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
  cursor: pointer;

  &.selected {
    border: 1px solid var(--theme-primary, #1abc9c);
    box-shadow: 0 0 0 1px rgba(26, 188, 156, 0.4);
  }

  &.dragging {
    opacity: 0.5;
    border: 1px dashed var(--theme-primary, #1abc9c);
    position: relative;
    z-index: 1;
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
    color: #a0aec0;
    transition: color 0.2s;

    &:hover {
      color: #1abc9c;
    }
  }

  &__title {
    font-size: 0.85rem;
    font-weight: 500;
    flex: 1;
    margin-left: 0.5rem;
  }

  &__actions {
    display: flex;
    gap: 0.2rem;
  }

  &__body {
    padding: 0.6rem;
    min-height: 40px;
    display: flex;
    align-items: center;

    // Form element styles nested inside body
    > input,
    > textarea,
    > select {
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

    > button {
      width: 100%;
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

    > .checkbox-label,
    > .radio-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--theme-text, #fff);
      cursor: pointer;
      font-size: 0.9em;

      > input[type="checkbox"],
      > input[type="radio"] {
        width: auto;
        margin: 0;
      }

      > input[type="checkbox"] {
        accent-color: var(--theme-primary, #1abc9c);
        width: 0.9em;
        height: 0.9em;
      }
    }

    > .radio-group {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
  }
}

.icon-btn {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: #1abc9c;
    background: rgba(26, 188, 156, 0.1);
  }
}

.fieldset-container {
  border: 1px solid var(--theme-border, #3a3f4a);
  border-radius: 8px;
  background: var(--theme-bg-surface, #232834);
  min-height: 100px;
  transition: all 0.2s ease;
  width: 100%;
  overflow: hidden;

  &:hover {
    border-color: var(--theme-border-hover, #4a5568);
  }

  &.selected {
    border: 1px solid var(--theme-primary, #1abc9c);
    box-shadow: 0 0 0 1px rgba(26, 188, 156, 0.4);
  }

  &.dragging {
    opacity: 0.5;
    border: 1px dashed var(--theme-primary, #1abc9c);
    position: relative;
    z-index: 1;
  }
}

.fieldset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #2c313c, #343b48);
  padding: 0.5rem 0.8rem;
  font-weight: 500;
  color: var(--theme-text, #fff);
  border-bottom: 1px solid var(--theme-border, #3a3f4a);
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.fieldset-drag-handle {
  cursor: grab;
  color: #a0aec0;
  transition: color 0.2s;
  margin-right: 0.5rem;

  &:hover {
    color: #1abc9c;
  }
}

.fieldset-title {
  font-size: 0.9rem;
  font-weight: 500;
  flex: 1;
  margin: 0;
}

.fieldset-actions {
  display: flex;
  gap: 0.2rem;
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

  // Nesting indicator line at the left edge
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

  // Child elements styling with proper nesting
  > .element-card {
    margin-bottom: 0;
    margin-left: 0;
    border-left: none;
    position: relative;

    // Remove any additional styling that creates visual noise
    &::before {
      display: none;
    }
  }
}

// Light theme styles with proper nesting
:global(.theme-light) {
  .element-card {
    background: white;
    border-color: #e2e8f0;

    &.selected {
      border-color: #059669;
      box-shadow: 0 0 0 1px rgba(5, 150, 105, 0.4);
    }

    &__header {
      background: linear-gradient(to right, #f8fafc, #f1f5f9);
      color: #1e293b;
    }

    &__drag-handle {
      color: #64748b;

      &:hover {
        color: #059669;
      }
    }

    &__body {
      > input,
      > textarea,
      > select,
      > button {
        background: #f8fafc;
        border-color: #e2e8f0;
        color: #1e293b;
      }

      > .checkbox-label,
      > .radio-label {
        color: #1e293b;
      }
    }
  }

  .icon-btn {
    color: #64748b;

    &:hover {
      color: #059669;
      background: rgba(5, 150, 105, 0.1);
    }
  }

  .fieldset-container {
    background: white;
    border-color: #e2e8f0;

    &.selected {
      border-color: #059669;
      box-shadow: 0 0 0 1px rgba(5, 150, 105, 0.4);
    }
  }

  .fieldset-header {
    background: linear-gradient(to right, #f8fafc, #f1f5f9);
    color: #1e293b;
    border-color: #e2e8f0;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  .fieldset-drag-handle {
    color: #64748b;

    &:hover {
      color: #059669;
    }
  }

  .fieldset-title {
    color: #1e293b;
  }

  .fieldset-content {
    &::before {
      background: rgba(5, 150, 105, 0.3);
    }
  }
}
</style>
