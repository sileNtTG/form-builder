<script setup lang="ts">
import { computed } from "vue";
import type { CheckboxElement } from "../../models/FormElement";
import { Handle, Position } from "@vue-flow/core";

const props = defineProps<{
  id?: string;
  selected?: boolean;
  data?: {
    element: CheckboxElement;
    onSelect?: () => void;
  };
}>();

const localElement = computed(() => props.data?.element);

const nodeStyle = computed(() => {
  const style: Record<string, string> = {};
  if (localElement.value?.width) {
    style.width = `${localElement.value.width}px`;
  }
  // Checkboxes often have a more fixed height or auto height based on label + box
  // If height is provided, use it, otherwise let content dictate or set a sensible default.
  if (localElement.value?.height) {
    style.height = `${localElement.value.height}px`;
  } else {
    style.height = "auto"; // Or a fixed default like '40px'
  }
  return style;
});

const handleClick = () => {
  if (props.data?.onSelect) {
    props.data.onSelect();
  }
};
</script>

<template>
  <div
    v-if="localElement"
    class="form-element checkbox-element"
    :class="{ 'form-element--selected': selected }"
    :style="nodeStyle"
    @click="handleClick"
  >
    <Handle type="target" :position="Position.Top" />
    <Handle type="source" :position="Position.Bottom" />

    <div class="checkbox-wrapper">
      <input
        type="checkbox"
        :id="localElement.id"
        :checked="localElement.checked"
        :required="localElement.required"
        :disabled="true"
        class="form-element__checkbox"
      />
      <label
        v-if="localElement.label"
        :for="localElement.id"
        class="form-element__label-inline"
      >
        {{ localElement.label }}
        <span v-if="localElement.required" class="required-indicator">*</span>
      </label>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-element {
  position: relative;
  background-color: var(--theme-bg-surface, #fff);
  padding: var(--spacing-sm, 8px);
  border-radius: var(--border-radius, 4px);
  box-shadow: 0 1px 2px 0 var(--theme-shadow-color-rgb-008, rgba(0, 0, 0, 0.08));
  display: flex;
  align-items: center; /* Align items vertically for checkbox + label */
  box-sizing: border-box;
  height: 100%;

  .checkbox-wrapper {
    display: flex;
    align-items: center;
  }

  &__checkbox {
    margin-right: var(--spacing-sm, 8px);
    width: var(--checkbox-size, 16px); /* Control checkbox size */
    height: var(--checkbox-size, 16px);
    flex-shrink: 0;

    &:disabled {
      cursor: default;
    }
  }

  &__label-inline {
    font-size: var(--font-size-base, 14px);
    color: var(--theme-text, #333);
    font-weight: var(--font-weight-normal, 400);
    margin-bottom: 0; /* No margin as it's inline with checkbox */

    .required-indicator {
      color: var(--theme-danger, red);
      margin-left: var(--spacing-xs, 4px);
    }
  }

  &.form-element--selected {
    // Selected state handled by VueFlow's outline on .vue-flow__node.selected
  }
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: var(--theme-icon-subtle, #cfcfcf);
  border: 1px solid var(--theme-border-strong, #aaa);
  z-index: 10;
}
</style>
