<script setup lang="ts">
import { computed } from "vue";
import type { FormElement } from "@/models/FormElement";
import { useDragAndDrop } from "@/composables/useDragAndDrop";
import { useFormBuilderStore } from "@/stores/formBuilder";
import { SvgIcon } from "@/components/common";

interface Props {
  element: FormElement;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [];
}>();

const { startInternalDrag, endDrag } = useDragAndDrop();
const formBuilderStore = useFormBuilderStore();

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

  // Set drag data for compatibility
  if (event.dataTransfer) {
    event.dataTransfer.setData("application/x-element-id", elementId);
    event.dataTransfer.setData("text/plain", elementType);
    event.dataTransfer.effectAllowed = "move";
  }

  // Start internal drag
  startInternalDrag(elementId, elementType);
}

function handleDragEnd() {
  endDrag();
}

function handleClick() {
  emit("click");
}

function handleEdit(e: Event) {
  e.stopPropagation();
  formBuilderStore.selectElement(props.element.dataId);
}

function handleDelete(e: Event) {
  e.stopPropagation();
  formBuilderStore.removeElement(props.element.dataId);
}
</script>

<template>
  <div
    class="element-card"
    :class="{
      selected: isSelected,
    }"
    :draggable="true"
    :data-element-id="element.dataId"
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
      <template v-else-if="element.type === 'fieldset'">
        <div class="fieldset-preview">
          <p>Fieldset: {{ element.label }}</p>
          <p class="children-count">
            {{ element.children?.length || 0 }} children
          </p>
        </div>
      </template>
      <template v-else>
        <div>{{ element.label || element.type }}</div>
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
      color: var(--theme-text, #fff);

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
        color: var(--theme-text, #fff);
      }
    }

    .fieldset-preview {
      text-align: center;
      padding: 1rem;
      color: var(--theme-text-muted, #aaa);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;

      .children-count {
        font-size: 0.8em;
        margin-top: 0.5rem;
        opacity: 0.7;
      }
    }
  }
}
</style>
