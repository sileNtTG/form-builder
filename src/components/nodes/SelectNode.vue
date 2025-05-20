<script setup lang="ts">
import { computed } from "vue";
import type { SelectElement, SelectOption } from "../../models/FormElement";
import { Handle, Position } from "@vue-flow/core";

const props = defineProps<{
  id?: string;
  selected?: boolean;
  data?: {
    element: SelectElement;
    onSelect?: () => void;
  };
}>();

const localElement = computed(() => props.data?.element);

const nodeStyle = computed(() => {
  const style: Record<string, string> = {};
  if (localElement.value?.width) {
    style.width = `${localElement.value.width}px`;
  }
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
</script>

<template>
  <div
    v-if="localElement"
    class="form-element select-element"
    :class="{ 'form-element--selected': selected }"
    :style="nodeStyle"
    @click="handleClick"
  >
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

    <select
      :id="localElement.id"
      class="form-element__select"
      :disabled="true"
      :required="localElement.required"
      :multiple="localElement.multiple || false"
    >
      <!-- Simplified: iterate options. Add placeholder logic if model supports it -->
      <option
        v-for="option in localElement.options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
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
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;

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

  &__select {
    width: 100%;
    padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
    border: 1px solid var(--theme-border-input, #ddd);
    border-radius: var(--border-radius-sm, 3px);
    font-size: var(--font-size-base, 14px);
    line-height: 1.5;
    color: var(--theme-text, #333);
    background-color: var(--theme-bg-input, #fff);
    box-sizing: border-box;
    flex-grow: 1;

    &:disabled {
      background-color: var(--theme-bg-input-disabled, #f0f0f0);
      color: var(--theme-text-disabled, #777);
      cursor: default;
    }
  }

  &.form-element--selected {
    /* Selected state handled by VueFlow's outline */
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
