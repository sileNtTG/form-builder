// @ts-nocheck
<script setup lang="ts">
import { computed } from "vue";
import type { TextareaElement } from "@/models";

interface Props {
  element: TextareaElement;
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

const inputValue = computed({
  get: () =>
    props.mode === "preview"
      ? props.element.defaultValue || ""
      : props.modelValue || props.element.defaultValue || "",
  set: (value: string) =>
    props.mode === "interactive" && emit("update:modelValue", value),
});

const isDisabled = computed(() => props.mode === "preview" || props.disabled);
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

  <textarea
    :id="element.dataId"
    v-model="inputValue"
    :placeholder="element.placeholder || undefined"
    :disabled="isDisabled"
    :readonly="readonly"
    :required="element.required"
    :rows="element.rows || 4"
    :cols="element.cols || undefined"
    class="node-textarea"
  ></textarea>
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

.node-textarea {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  border: 1px solid var(--theme-border);
  border-radius: $border-radius;
  background-color: var(--theme-bg-input);
  color: var(--theme-text);
  @include text-small;
  font-family: inherit;
  resize: vertical;
  min-height: 4rem;
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
    resize: none;
  }

  &::placeholder {
    color: var(--theme-text-muted);
  }
}
</style>
