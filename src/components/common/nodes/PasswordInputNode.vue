// @ts-nocheck
<script setup lang="ts">
import { computed, ref } from "vue";
// import type { PasswordInputElement } from "@/models";
import { SvgIcon } from "@/components/common";

interface Props {
  // element: PasswordInputElement;
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

const showPassword = ref(false);

const inputValue = computed({
  get: () => props.modelValue || props.element.defaultValue || "",
  set: (value: string) => emit("update:modelValue", value),
});

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="password-input-node">
    <label
      v-if="element.label"
      :for="element.dataId"
      class="node-label"
      :class="{ required: element.required }"
    >
      {{ element.label }}
      <span v-if="element.required" class="required-indicator">*</span>
    </label>

    <div class="password-input-wrapper">
      <input
        :id="element.dataId"
        v-model="inputValue"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="element.placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="element.required"
        :minlength="element.minLength"
        :maxlength="element.maxLength"
        class="node-input"
      />

      <button
        type="button"
        class="password-toggle"
        @click="togglePasswordVisibility"
        :disabled="disabled"
        :title="showPassword ? 'Hide password' : 'Show password'"
      >
        <SvgIcon :name="showPassword ? 'eye-off' : 'eye'" :size="16" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.password-input-node {
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

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.node-input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 3rem; // Space for toggle button
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

  &::placeholder {
    color: var(--theme-text-muted);
  }
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--theme-text-muted);
  border-radius: 0.25rem;
  transition: all 0.2s ease;

  &:hover {
    color: var(--theme-text);
    background-color: var(--theme-bg-alt);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>
