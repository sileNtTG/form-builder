<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { FormElement } from "@/models";
import { NODE_COMPONENT_MAP } from "./nodes";

interface Props {
  element: FormElement;
  modelValue?: any;
  disabled?: boolean;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: any];
}>();

// Dynamic component resolution
const nodeComponent = computed(() => {
  const componentName =
    NODE_COMPONENT_MAP[props.element.type as keyof typeof NODE_COMPONENT_MAP];

  if (!componentName) {
    console.warn(`No node component found for type: ${props.element.type}`);
    return null;
  }

  // Dynamic import based on component name
  switch (componentName) {
    case "TextInputNode":
      return defineAsyncComponent(() => import("./nodes/TextInputNode.vue"));
    case "PasswordInputNode":
      return defineAsyncComponent(
        () => import("./nodes/PasswordInputNode.vue")
      );
    case "EmailInputNode":
      return defineAsyncComponent(() => import("./nodes/EmailInputNode.vue"));
    case "TextareaNode":
      return defineAsyncComponent(() => import("./nodes/TextareaNode.vue"));
    case "CheckboxNode":
      return defineAsyncComponent(() => import("./nodes/CheckboxNode.vue"));
    case "SingleSelectNode":
      return defineAsyncComponent(() => import("./nodes/SingleSelectNode.vue"));
    case "FieldsetNode":
      return defineAsyncComponent(() => import("./nodes/FieldsetNode.vue"));
    default:
      return null;
  }
});

const handleInput = (value: any) => {
  emit("update:modelValue", value);
};
</script>

<template>
  <div class="form-node-wrapper">
    <component
      v-if="nodeComponent"
      :is="nodeComponent"
      :element="element as any"
      :model-value="modelValue"
      :disabled="disabled"
      :readonly="readonly"
      @update:model-value="handleInput"
    >
      <!-- Slot for container nodes like fieldset -->
      <slot></slot>
    </component>

    <!-- Fallback for unknown types -->
    <div v-else class="unknown-node">
      <div class="unknown-node__icon">⚠️</div>
      <div class="unknown-node__message">
        Unknown element type: <strong>{{ element.type }}</strong>
      </div>
      <div class="unknown-node__label">{{ element.label }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-node-wrapper {
  width: 100%;
}

.unknown-node {
  padding: 1rem;
  border: 2px dashed var(--theme-border);
  border-radius: 0.5rem;
  background-color: var(--theme-bg-alt);
  text-align: center;
  color: var(--theme-text-muted);

  &__icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  &__message {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  &__label {
    font-size: 0.75rem;
    font-style: italic;
  }
}
</style>
