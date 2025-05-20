<script setup lang="ts">
import { computed } from "vue";
import type {
  RadioElement,
  RadioElementOption,
} from "../../models/FormElement";
import { Handle, Position } from "@vue-flow/core";

const props = defineProps<{
  id?: string;
  selected?: boolean;
  data?: {
    element: RadioElement;
    onSelect?: () => void;
  };
}>();

const localElement = computed(() => props.data?.element);

const nodeStyle = computed(() => {
  const style: Record<string, string> = {};
  if (localElement.value?.width) {
    style.width = `${localElement.value.width}px`;
  }
  // Radio groups height can be auto or fixed
  if (localElement.value?.height) {
    style.height = `${localElement.value.height}px`;
  } else {
    style.height = "auto";
  }
  return style;
});

const handleClick = () => {
  if (props.data?.onSelect) {
    props.data.onSelect();
  }
};

// Helper to generate unique IDs for radio options if needed for the label's `for` attribute
const getOptionId = (option: RadioElementOption) => {
  return `${localElement.value?.id || "radio"}-${option.value}`;
};
</script>

<template>
  <div
    v-if="localElement"
    class="form-element radio-group-element"
    :class="{ 'form-element--selected': selected }"
    :style="nodeStyle"
    @click="handleClick"
  >
    <Handle type="target" :position="Position.Top" />
    <Handle type="source" :position="Position.Bottom" />

    <div class="radio-group-wrapper">
      <label
        v-if="localElement.label"
        class="form-element__label form-element__label--block"
      >
        {{ localElement.label }}
        <span v-if="localElement.required" class="required-indicator">*</span>
      </label>
      <div class="radio-options-container">
        <div
          v-for="option in localElement.options"
          :key="option.value"
          class="radio-option"
        >
          <input
            type="radio"
            :id="getOptionId(option)"
            :name="localElement.id"
            :value="option.value"
            :checked="option.value === localElement.defaultValue"
            :required="localElement.required"
            :disabled="true"
            class="form-element__radio"
          />
          <label :for="getOptionId(option)" class="form-element__label-inline">
            {{ option.label }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-element {
  position: relative;
  background-color: var(--theme-bg-surface, #fff);
  padding: var(--spacing-md, 12px); // Increased padding for group
  border-radius: var(--border-radius, 4px);
  box-shadow: 0 1px 2px 0 var(--theme-shadow-color-rgb-008, rgba(0, 0, 0, 0.08));
  box-sizing: border-box;
  height: 100%; // Allow height to be controlled by nodeStyle
  display: flex; // To help with internal alignment if needed
  flex-direction: column; // Stack label and options vertically

  &.form-element--selected {
    // Selected state might be handled by VueFlow's outline or custom styles here
  }
}

.radio-group-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-element__label--block {
  display: block;
  font-size: var(--font-size-base, 14px);
  color: var(--theme-text, #333);
  font-weight: var(--font-weight-medium, 500);
  margin-bottom: var(--spacing-sm, 8px);

  .required-indicator {
    color: var(--theme-danger, red);
    margin-left: var(--spacing-xs, 4px);
  }
}

.radio-options-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px); // Space between radio options
}

.radio-option {
  display: flex;
  align-items: center;
}

.form-element__radio {
  margin-right: var(--spacing-sm, 8px);
  width: var(--radio-size, 16px); // Control radio size
  height: var(--radio-size, 16px);
  flex-shrink: 0;
  accent-color: var(--theme-primary); // Style the checked state color

  &:disabled {
    cursor: default;
  }
}

.form-element__label-inline {
  font-size: var(--font-size-base, 14px);
  color: var(--theme-text-secondary, #555);
  font-weight: var(--font-weight-normal, 400);
  margin-bottom: 0;
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: var(--theme-icon-subtle, #cfcfcf);
  border: 1px solid var(--theme-border-strong, #aaa);
  z-index: 10;
}
</style>
