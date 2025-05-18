<script setup lang="ts">
// Import necessary components
import { ref } from "vue";
import FormCanvas from "../components/core/FormCanvas.vue";
import ElementPanel from "../components/core/ElementPanel.vue";
import PropertyPanel from "../components/core/PropertyPanel.vue";
import Sidebar from "../components/core/Sidebar.vue";

// Sidebar state
const sidebarOpen = ref(true);

// Handle sidebar toggle event
const handleSidebarToggle = (isOpen: boolean) => {
  sidebarOpen.value = isOpen;
};
</script>

<template>
  <div class="app-layout">
    <!-- Sidebar component -->
    <Sidebar :initial-open="sidebarOpen" @toggle="handleSidebarToggle" />

    <!-- Main area with Canvas -->
    <div class="app-layout__main">
      <!-- Full-screen Canvas -->
      <FormCanvas />

      <!-- Property Panel as overlay on the right -->
      <div class="property-panel-overlay">
        <PropertyPanel />
      </div>

      <!-- Element Panel as overlay at the bottom -->
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

/*
.element-item {
  user-select: none;
  position: relative;
  min-width: 120px;
  padding: $spacing-sm;
  background-color: $bg-light; // This was causing an error and is redundant
  border-radius: $border-radius;
  cursor: move;
  border: 1px solid transparent;
  @include transition;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: $text-light;

  &:hover {
    background-color: $bg-lighter;
    border-color: $primary;
  }

  &.dragging {
    opacity: 0.5;
    border: 1px dashed $primary;
    box-shadow: 0 0 10px rgba($primary, 0.5);
  }
}
*/
</style>
