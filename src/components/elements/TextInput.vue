<script setup lang="ts">
import { computed } from "vue";
import type { TextInputElement } from "../../models/FormElement";

const props = defineProps<{
  element?: TextInputElement;
  modelValue?: string;
  inPreview?: boolean;
  // Node props from Vue Flow
  id?: string;
  selected?: boolean;
  data?: {
    element: TextInputElement;
    inPreview: boolean;
    onSelect: () => void;
  };
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "select"): void;
}>();

// Handle either direct element or element from data
const localElement = computed(() => props.data?.element || props.element);
const localInPreview = computed(() => props.data?.inPreview || props.inPreview);

const inputValue = computed({
  get: () => props.modelValue || "",
  set: (value: string) => emit("update:modelValue", value),
});

const handleClick = () => {
  if (!localInPreview.value) {
    if (props.data?.onSelect) {
      props.data.onSelect();
    } else {
      emit("select");
    }
  }
};
</script>

<template>
  <div
    v-if="localElement"
    class="form-element"
    :class="{
      'form-element--interactive': !localInPreview,
      'form-element--selected': selected,
    }"
    @click="handleClick"
  >
    <label
      v-if="localElement.label"
      :for="localElement.id"
      class="form-element__label"
    >
      {{ localElement.label }}
      <span v-if="localElement.required" class="required-indicator">*</span>
    </label>

    <input
      :id="localElement.id"
      type="text"
      v-model="inputValue"
      :placeholder="localElement.placeholder"
      :disabled="!localInPreview"
      :required="localElement.required"
      :minlength="localElement.minLength"
      :maxlength="localElement.maxLength"
      class="form-element__input"
      :class="{ 'form-element__input--disabled': !localInPreview }"
    />
  </div>
</template>

<style lang="scss" scoped>
// Using scoped styles for component-specific styling

.form-element {
  margin-bottom: $spacing-md;
  position: relative;
  background-color: var(--theme-bg-surface);
  padding: $spacing-md;
  border-radius: $border-radius;
  box-shadow: 0 1px 3px 0 rgba(var(--theme-shadow-color-rgb), 0.1),
    0 1px 2px 0 rgba(var(--theme-shadow-color-rgb), 0.08);

  &__input {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid var(--theme-border-input);
    border-radius: $border-radius;
    background-color: var(--theme-bg-input);
    font-size: $font-size-base;
    line-height: 1.5;
    color: var(--theme-text);
    @include transition;

    &:focus {
      outline: none;
      border-color: var(--theme-primary);
      box-shadow: 0 0 0 3px rgba(var(--theme-primary-rgb), 0.3);
    }

    &::placeholder {
      color: var(--theme-text-muted);
    }

    &--disabled {
      cursor: pointer;
      pointer-events: none;
      opacity: 0.7;
    }
  }

  &__handle {
    cursor: move;
    @include flex-center;
    position: absolute;
    top: $spacing-xs;
    right: $spacing-xs;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--theme-bg-alt);

    &:hover {
      background-color: var(--theme-item-hover-bg);
    }
  }

  &__controls {
    @include flex-between;
    margin-top: $spacing-sm;

    button {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--theme-text-muted);
      padding: $spacing-xs;
      border-radius: $border-radius-sm;

      &:hover {
        background-color: var(--theme-item-hover-bg);
        color: var(--theme-text);
      }
    }
  }

  &__label {
    display: block;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--theme-text-secondary);
    margin-bottom: $spacing-xs;

    .required-indicator {
      color: var(--theme-danger);
    }
  }

  &--interactive {
    cursor: pointer;
    border: 1px solid transparent;

    &:hover {
      border-color: var(--theme-primary-light);
    }
  }

  &--selected {
    border: 2px solid var(--theme-primary);
  }
}
</style>
