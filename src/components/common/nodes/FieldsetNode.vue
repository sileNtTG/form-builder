<script setup lang="ts">
import type { FieldsetElement } from "@/models";
import { computed } from "vue";

interface Props {
  element: FieldsetElement;
  mode?: "preview" | "interactive";
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "interactive",
  disabled: false,
});

const isDisabled = computed(() => props.mode === "preview" || props.disabled);
</script>

<template>
  <fieldset class="fieldset-node" :disabled="isDisabled">
    <legend v-if="element.label" class="fieldset-legend">
      {{ element.label }}
      <span v-if="element.required" class="required-indicator">*</span>
    </legend>

    <slot></slot>
  </fieldset>
</template>

<style lang="scss" scoped>
.fieldset-node {
  border: 1px solid var(--theme-border);
  border-radius: $border-radius;
  padding: $spacing-lg;
  margin: 0;
  background-color: var(--theme-bg-surface);
  @include transition(all, $transition-normal);

  &:disabled {
    opacity: 0.6;
    background-color: var(--theme-bg-disabled);
  }
}

.fieldset-legend {
  @include text-small;
  font-weight: 600;
  color: var(--theme-text);
  padding: 0 $spacing-sm;
  margin-bottom: $spacing-sm;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  background-color: var(--theme-bg-surface);
}

.required-indicator {
  color: var(--theme-danger, #ef4444);
  font-weight: 600;
}
</style>
