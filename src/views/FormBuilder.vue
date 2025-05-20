<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import FormCanvas from "../components/core/FormCanvas.vue";
import ElementPanel from "../components/core/ElementPanel.vue";
import PropertyPanel from "../components/core/PropertyPanel.vue";
import { useFormBuilderStore } from "../stores/formBuilder";

const formBuilderStore = useFormBuilderStore();

const handleKeyDown = (event: KeyboardEvent) => {
  if (
    formBuilderStore.selectedElementId &&
    (event.key === "Delete" || event.key === "Backspace")
  ) {
    if (event.key === "Backspace" && !isInputFocused()) {
      event.preventDefault();
    }
    formBuilderStore.removeElement(formBuilderStore.selectedElementId);
  }
};

const isInputFocused = () => {
  return (
    document.activeElement &&
    (document.activeElement.tagName === "INPUT" ||
      document.activeElement.tagName === "TEXTAREA")
  );
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div class="form-builder-view">
    <FormCanvas />

    <div class="property-panel-overlay">
      <PropertyPanel />
    </div>

    <div class="element-panel-overlay">
      <ElementPanel />
    </div>
  </div>
</template>

<style lang="scss">
@use "@/assets/scss/abstracts" as *;

.form-builder-view {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.property-panel-overlay {
  position: absolute;
  top: $spacing-lg;
  right: $spacing-lg;
  width: 20rem;
  background-color: var(--theme-bg-surface);
  box-shadow: $shadow-lg;
  z-index: 10;
  border-radius: $border-radius-lg;
  overflow: hidden;
}

.element-panel-overlay {
  position: absolute;
  bottom: $spacing-lg;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}
</style>
