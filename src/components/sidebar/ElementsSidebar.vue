<script setup lang="ts">
import { useDragAndDrop } from "@/composables";

const { startExternalDrag, endDrag } = useDragAndDrop();

interface ElementType {
  type: string;
  label: string;
  icon: string;
}

const elementTypes: ElementType[] = [
  { type: "input", label: "Text Input", icon: "📝" },
  { type: "textarea", label: "Textarea", icon: "📄" },
  { type: "button", label: "Button", icon: "🔘" },
  { type: "checkbox", label: "Checkbox", icon: "☑️" },
  { type: "select", label: "Select", icon: "📋" },
  { type: "radio", label: "Radio", icon: "🔘" },
  { type: "number", label: "Number", icon: "🔢" },
  { type: "date", label: "Date", icon: "📅" },
  { type: "fieldset", label: "Fieldset", icon: "📦" },
];

function handleDragStart(event: DragEvent, elementType: string) {
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", elementType);
    event.dataTransfer.effectAllowed = "copy";
  }
  startExternalDrag(elementType);
}

function handleDragEnd() {
  endDrag();
}
</script>

<template>
  <div class="elements-sidebar">
    <h3 class="sidebar-title">Form Elements</h3>
    <div class="elements-grid">
      <div
        v-for="element in elementTypes"
        :key="element.type"
        class="element-item"
        draggable="true"
        @dragstart="(e) => handleDragStart(e, element.type)"
        @dragend="handleDragEnd"
      >
        <span class="element-icon">{{ element.icon }}</span>
        <span class="element-label">{{ element.label }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.elements-sidebar {
  padding: 1rem;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  min-width: 250px;
  height: 100%;
}

.sidebar-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.elements-grid {
  display: grid;
  gap: 0.5rem;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    cursor: grabbing;
  }
}

.element-icon {
  font-size: 1.2rem;
}

.element-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}
</style>
