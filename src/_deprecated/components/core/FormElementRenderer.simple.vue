<script setup lang="ts">
import { computed } from "vue";
import type { FormElement } from "@/models/FormElement";
import { useDragAndDrop } from "@/composables/useDragAndDrop";

interface Props {
  element: FormElement;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [];
}>();

const { startInternalDrag, endDrag } = useDragAndDrop();

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
</script>

<template>
  <div
    class="form-element"
    :class="`form-element--${element.type}`"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="handleClick"
  >
    <div class="form-element__header">
      <h4>{{ element.label || element.type }}</h4>
    </div>
    <div class="form-element__body">
      <!-- Simple preview based on type -->
      <template v-if="element.type === 'input'">
        <input
          type="text"
          :placeholder="element.placeholder || 'Enter text'"
          disabled
        />
      </template>
      <template v-else-if="element.type === 'textarea'">
        <textarea
          :placeholder="element.placeholder || 'Enter text'"
          :rows="element.rows || 4"
          disabled
        ></textarea>
      </template>
      <template v-else-if="element.type === 'button'">
        <button disabled>
          {{ element.label || "Button" }}
        </button>
      </template>
      <template v-else-if="element.type === 'fieldset'">
        <div class="fieldset-placeholder">
          <p>Fieldset: {{ element.label }}</p>
          <p class="text-sm text-gray-500">
            {{ element.children?.length || 0 }} children
          </p>
        </div>
      </template>
      <template v-else>
        <div class="element-preview">{{ element.type }} field</div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-element {
  position: relative;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: move;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &--fieldset {
    background: #f8fafc;
    border: 2px dashed #cbd5e1;
    min-height: 100px;
  }

  &__header {
    margin-bottom: 0.5rem;

    h4 {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #374151;
    }
  }

  &__body {
    input,
    textarea,
    button,
    select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .fieldset-placeholder {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    .element-preview {
      text-align: center;
      padding: 1rem;
      background: #f3f4f6;
      border-radius: 4px;
      color: #6b7280;
      font-style: italic;
    }
  }
}
</style>
