// @ts-nocheck
<script setup lang="ts">
import { computed } from "vue";
// import type { EmailInputElement } from "@/models";

interface Props {
  // element: EmailInputElement;
  element: any;
  modelValue?: string;
  disabled?: boolean;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const inputValue = computed({
  get: () => props.modelValue || props.element.defaultValue || "",
  set: (value: string) => emit("update:modelValue", value),
});
</script>

<template>
  <div class="email-input-node">
    <label
      v-if="element.label"
      :for="element.dataId"
      class="node-label"
      :class="{ required: element.required }"
    >
      {{ element.label }}
      <span v-if="element.required" class="required-indicator">*</span>
    </label>

    <input
      :id="element.dataId"
      v-model="inputValue"
      type="email"
      :placeholder="element.placeholder || 'example@domain.com'"
      :disabled="disabled"
      :readonly="readonly"
      :required="element.required"
      class="node-input"
      autocomplete="email"
    />
  </div>
</template>

<style lang="scss" scoped>
.email-input-node {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.node-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--theme-text);
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &.required {
    font-weight: 600;
  }
}

.required-indicator {
  color: var(--theme-danger, #ef4444);
  font-weight: 600;
}

.node-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--theme-border);
  border-radius: 0.375rem;
  background-color: var(--theme-bg-input);
  color: var(--theme-text);
  font-size: 0.875rem;
  transition: all 0.2s ease;

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

  &:invalid {
    border-color: var(--theme-danger, #ef4444);
  }

  &::placeholder {
    color: var(--theme-text-muted);
  }
}
</style>
