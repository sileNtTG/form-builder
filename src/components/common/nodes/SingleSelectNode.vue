<script setup lang="ts">
import { computed } from "vue";
import type { SingleSelectElement } from "@/models";

interface Props {
  element: SingleSelectElement;
  modelValue?: string;
  mode?: "preview" | "interactive";
  disabled?: boolean;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "interactive",
  disabled: false,
  readonly: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const selectedValue = computed({
  get: () =>
    props.mode === "preview"
      ? props.element.defaultValue || ""
      : props.modelValue || props.element.defaultValue || "",
  set: (value: string) =>
    props.mode === "interactive" && emit("update:modelValue", value),
});

const isDisabled = computed(() => props.mode === "preview" || props.disabled);
const hasOptions = computed(
  () => props.element.options && props.element.options.length > 0
);
</script>

<template>
  <label
    v-if="element.label"
    :for="element.dataId"
    class="node-label"
    :class="{ required: element.required }"
  >
    {{ element.label }}
    <span v-if="element.required" class="required-indicator">*</span>
  </label>

  <select
    :id="element.dataId"
    v-model="selectedValue"
    :disabled="isDisabled"
    :required="element.required"
    class="node-select"
  >
    <option v-if="element.placeholder && !element.required" value="" disabled>
      {{ element.placeholder }}
    </option>

    <option
      v-if="hasOptions"
      v-for="option in element.options"
      :key="option.value"
      :value="option.value"
      :disabled="option.disabled"
    >
      {{ option.label }}
    </option>

    <option v-if="!hasOptions" value="" disabled>No options available</option>
  </select>
</template>

<style lang="scss" scoped>
.node-label {
  @include text-small;
  font-weight: 500;
  color: var(--theme-text);
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-xs;

  &.required {
    font-weight: 600;
  }
}

.required-indicator {
  color: var(--theme-danger, #ef4444);
  font-weight: 600;
}

.node-select {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  border: 1px solid var(--theme-border);
  border-radius: $border-radius;
  background-color: var(--theme-bg-input);
  color: var(--theme-text);
  @include text-small;
  cursor: pointer;
  @include transition(all, $transition-normal);

  &:focus {
    outline: none;
    border-color: var(--theme-primary);
    box-shadow: 0 0 0 3px rgba(var(--theme-primary-rgb), 0.1);
  }

  &:disabled {
    background-color: var(--theme-bg-disabled);
    cursor: not-allowed;
    opacity: 0.6;
  }

  option {
    background-color: var(--theme-bg-input);
    color: var(--theme-text);

    &:disabled {
      color: var(--theme-text-muted);
    }
  }
}
</style>
