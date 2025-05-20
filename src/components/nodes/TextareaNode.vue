<script setup lang="ts">
import { computed } from "vue";
import type { TextareaElement } from "../../models/FormElement";
import { Handle, Position } from "@vue-flow/core";

const props = defineProps<{
  id?: string; // Injected by VueFlow
  selected?: boolean; // Injected by VueFlow
  // 'type' and 'position' are also injected but not explicitly typed here if not directly used
  data?: {
    element: TextareaElement; // This comes from the 'data' property of the Node object
    // We can add other custom data properties here if needed
    onSelect?: () => void;
  };
}>();

const localElement = computed(() => props.data?.element);

// If you need styles based on props.data.element.width/height for the node itself
const nodeStyle = computed(() => {
  const style: Record<string, string> = {};
  if (localElement.value?.width) {
    style.width = `${localElement.value.width}px`;
  }
  if (localElement.value?.height) {
    style.height = `${localElement.value.height}px`;
  }
  return style;
});

// Add this click handler
const handleClick = () => {
  if (props.data?.onSelect) {
    props.data.onSelect();
  }
};
</script>

<template>
  <div
    v-if="localElement"
    class="form-element textarea-element"
    :class="{ 'form-element--selected': selected }"
    :style="nodeStyle"
    @click="handleClick"
  >
    <!-- Handles for edges -->
    <Handle type="target" :position="Position.Top" />
    <Handle type="source" :position="Position.Bottom" />

    <label
      v-if="localElement.label"
      :for="localElement.id"
      class="form-element__label"
    >
      {{ localElement.label }}
      <span v-if="localElement.required" class="required-indicator">*</span>
    </label>

    <textarea
      :id="localElement.id"
      class="form-element__textarea"
      :placeholder="localElement.placeholder"
      :rows="localElement.rows || 4"
      :required="localElement.required"
      :disabled="true"
    ></textarea>
  </div>
</template>

<style lang="scss" scoped>
/* Adopt similar structure to TextInputNode.vue, assuming SCSS variables are globally available */
.form-element {
  /* Base class matching TextInputNode */
  margin-bottom: 0; /* No margin as it's a self-contained node */
  position: relative;
  background-color: var(--theme-bg-surface, #fff);
  padding: var(--spacing-md, 16px);
  border-radius: var(--border-radius, 4px);
  box-shadow: 0 1px 3px 0 var(--theme-shadow-color-rgb-01, rgba(0, 0, 0, 0.1)),
    0 1px 2px 0 var(--theme-shadow-color-rgb-008, rgba(0, 0, 0, 0.08));
  display: flex; /* Added for flex-direction */
  flex-direction: column; /* Ensure label and textarea stack */
  box-sizing: border-box;
  height: 100%; /* Make the form-element fill the node height */

  &__label {
    display: block;
    font-size: var(--font-size-sm, 12px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--theme-text-secondary, #555);
    margin-bottom: var(--spacing-xs, 4px);
    flex-shrink: 0;

    .required-indicator {
      color: var(--theme-danger, red);
    }
  }

  &__textarea {
    /* Specific class for textarea */
    width: 100%;
    flex-grow: 1;
    padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
    border: 1px solid var(--theme-border-input, #ddd);
    border-radius: var(--border-radius-sm, 3px);
    font-size: var(--font-size-base, 14px);
    line-height: 1.5;
    color: var(--theme-text, #333);
    resize: none;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: var(--theme-primary, #007bff);
      box-shadow: 0 0 0 3px var(--theme-primary-shadow, rgba(0, 123, 255, 0.3));
    }

    &::placeholder {
      color: var(--theme-text-muted, #999);
    }

    &:disabled {
      background-color: var(--theme-bg-input-disabled, #f0f0f0);
      color: var(--theme-text-disabled, #777);
      cursor: default; /* Keep default cursor for disabled state */
    }
  }

  /* Interactive state & selected state for the node itself */
  /* No direct --interactive needed if not clicking the whole box for selection */

  &.form-element--selected {
    /* This class is on the root div, so it won't be overridden by VueFlow's outline */
    /* If we want a border IN ADDITION to VueFlow's outline, define it here. */
    /* For now, relying on the outline from .vue-flow__node.selected is cleaner. */
    /* Example: border: 2px solid var(--theme-primary-dark, blue); */
  }
}

/* Handles should be minimally intrusive */
:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: var(--theme-icon-subtle, #cfcfcf);
  border: 1px solid var(--theme-border-strong, #aaa);
  z-index: 10; /* Ensure handles are above node content if overlapping */
}
</style>
