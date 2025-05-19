<script setup lang="ts">
import { computed } from "vue";
import { useFormBuilderStore } from "../../stores/formBuilder";

const formBuilderStore = useFormBuilderStore();

const formJson = computed(() => {
  return JSON.stringify(formBuilderStore.elements, null, 2);
});
</script>

<template>
  <div class="panel json-preview-panel">
    <h2 class="panel__header">Live Form JSON</h2>
    <div class="panel__body panel-scroll">
      <pre>{{ formJson }}</pre>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/abstracts" as *;

.json-preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel__header {
  @include heading-3;
  padding: $spacing-lg;
  border-bottom: 1px solid var(--theme-border);
  color: var(--theme-text);
  flex-shrink: 0;
}

.panel__body {
  padding: $spacing-lg;
  flex-grow: 1;
  overflow: auto;
  background-color: var(--theme-bg-alt);

  pre {
    margin: 0;
    font-family: $font-mono;
    font-size: $font-size-sm;
    color: var(--theme-text-code);
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
