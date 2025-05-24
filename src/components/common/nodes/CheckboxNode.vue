// @ts-nocheck
<script setup lang="ts">
import { computed } from "vue";
import type { CheckboxElement } from "@/models";

interface Props {
  element: CheckboxElement;
  modelValue?: boolean;
  mode?: "preview" | "interactive";
  disabled?: boolean;
  readonly?: boolean;
  variant?: "wrapper" | "default" | "block"; // UI Layout variants
}

const props = withDefaults(defineProps<Props>(), {
  mode: "interactive",
  disabled: false,
  readonly: false,
  variant: "default",
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const isChecked = computed({
  get: () =>
    props.mode === "preview"
      ? props.element.defaultValue ?? props.element.checked ?? false
      : props.modelValue ??
        props.element.defaultValue ??
        props.element.checked ??
        false,
  set: (value: boolean) =>
    props.mode === "interactive" && emit("update:modelValue", value),
});

const isDisabled = computed(() => props.mode === "preview" || props.disabled);
</script>

<template>
  <!-- Variant 1: Wrapper Style - Label umschließt Input + Text -->
  <template v-if="variant === 'wrapper' && element.label">
    <label class="checkbox-wrapper-label" :class="{ disabled: isDisabled }">
      <input
        :id="element.dataId"
        v-model="isChecked"
        type="checkbox"
        :disabled="isDisabled"
        :required="element.required"
        class="checkbox-input"
      />
      <span class="checkbox-text">
        {{ element.label }}
        <span v-if="element.required" class="required-indicator">*</span>
      </span>
    </label>
  </template>

  <!-- Variant 2: Block Style - Label über Input -->
  <template v-else-if="variant === 'block'">
    <label
      v-if="element.label"
      :for="element.dataId"
      class="checkbox-block-label"
    >
      {{ element.label }}
      <span v-if="element.required" class="required-indicator">*</span>
    </label>

    <input
      :id="element.dataId"
      v-model="isChecked"
      type="checkbox"
      :disabled="isDisabled"
      :required="element.required"
      class="checkbox-input checkbox-input--block"
    />
  </template>

  <!-- Variant 3: Default Style - Input + Label nebeneinander -->
  <template v-else>
    <input
      :id="element.dataId"
      v-model="isChecked"
      type="checkbox"
      :disabled="isDisabled"
      :required="element.required"
      class="checkbox-input"
    />

    <label
      v-if="element.label"
      :for="element.dataId"
      class="checkbox-label"
      :class="{ disabled: isDisabled }"
    >
      {{ element.label }}
      <span v-if="element.required" class="required-indicator">*</span>
    </label>
  </template>
</template>

<style lang="scss" scoped>
// Base checkbox input styles
.checkbox-input {
  margin: 0;
  width: 1.125rem;
  height: 1.125rem;
  accent-color: var(--theme-primary);
  cursor: pointer;
  flex-shrink: 0;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus {
    outline: 2px solid var(--theme-primary);
    outline-offset: 2px;
  }

  &--block {
    margin-top: $spacing-xs;
  }
}

// Variant 1: Wrapper Style
.checkbox-wrapper-label {
  @include text-small;
  color: var(--theme-text);
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .checkbox-text {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    flex: 1;
  }
}

// Variant 2: Block Style
.checkbox-block-label {
  @include text-small;
  font-weight: 500;
  color: var(--theme-text);
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-xs;
}

// Variant 3: Default Style
.checkbox-label {
  @include text-small;
  color: var(--theme-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-left: $spacing-sm;

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

// Common required indicator
.required-indicator {
  color: var(--theme-danger, #ef4444);
  font-weight: 600;
}
</style>
