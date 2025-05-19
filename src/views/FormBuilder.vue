<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import FormCanvas from "../components/core/FormCanvas.vue";
import ElementPanel from "../components/core/ElementPanel.vue";
import PropertyPanel from "../components/core/PropertyPanel.vue";
import Sidebar from "../components/core/Sidebar.vue";
import { useFormBuilderStore } from "../stores/formBuilder";

const formBuilderStore = useFormBuilderStore();

const sidebarOpen = ref(true);

const handleSidebarToggle = (isOpen: boolean) => {
  sidebarOpen.value = isOpen;
};

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
  <div class="app-layout">
    <Sidebar :initial-open="sidebarOpen" @toggle="handleSidebarToggle" />

    <div class="app-layout__main">
      <FormCanvas />

      <div class="property-panel-overlay">
        <PropertyPanel />
      </div>

      <div class="element-panel-overlay">
        <ElementPanel />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
/* Component-specific styles for FormBuilder */

// Main form builder layout
.app-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 100vh;
  grid-template-areas: "sidebar main";
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--theme-bg);
  color: var(--theme-text);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  &__sidebar {
    grid-area: sidebar;
    overflow: hidden;
  }

  &__main {
    grid-area: main;
    position: relative;
    overflow: hidden;
  }
}

// Overlay panels
.property-panel-overlay {
  position: absolute;
  top: $spacing-lg;
  right: $spacing-lg;
  width: 20rem;
  background-color: var(--theme-bg-alt);
  box-shadow: 0 10px 15px -3px rgba(var(--theme-shadow-color-rgb), 0.12),
    0 4px 6px -2px rgba(var(--theme-shadow-color-rgb), 0.08);
  z-index: 10;
  border-radius: $border-radius;
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
