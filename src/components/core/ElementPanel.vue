<script setup lang="ts">
import { ref } from "vue";

// Form elements catalog with drag & drop functionality
const elements = ref([
  {
    type: "input",
    label: "Text Input",
    description: "Single line text input",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="element-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`,
  },
  {
    type: "textarea",
    label: "Textarea",
    description: "Multi-line text area",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="element-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>`,
  },
  {
    type: "checkbox",
    label: "Checkbox",
    description: "True/false selection",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="element-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`,
  },
  {
    type: "select",
    label: "Dropdown",
    description: "Select from options",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="element-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>`,
  },
  {
    type: "radio",
    label: "Radio Group",
    description: "Select one from multiple options",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="element-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
  },
]);

// Set up drag events
const onDragStart = (event: DragEvent, elementType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("elementType", elementType);
    event.dataTransfer.effectAllowed = "copy";

    // Add visual feedback during dragging
    if (event.target instanceof HTMLElement) {
      event.target.classList.add("dragging");

      // Remove feedback when drag ends
      const onDragEnd = () => {
        event.target instanceof HTMLElement &&
          event.target.classList.remove("dragging");
        document.removeEventListener("dragend", onDragEnd);
      };

      document.addEventListener("dragend", onDragEnd);
    }
  }
};
</script>

<template>
  <div class="element-panel-container">
    <div class="panel panel-elements">
      <div class="panel-elements__header">
        <h2 class="panel-elements__title">
          <svg
            class="panel-elements__icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
          </svg>
          Form Elements
        </h2>

        <div class="panel-elements__badge">Drag & Drop</div>
      </div>

      <div class="panel-elements__grid">
        <div
          v-for="element in elements"
          :key="element.type"
          draggable="true"
          @dragstart="onDragStart($event, element.type)"
          class="element-item"
        >
          <div class="element-icon">
            <span v-html="element.icon"></span>
          </div>
          <div class="element-item__content">
            <div class="element-item__label">{{ element.label }}</div>
            <div class="element-item__description">
              {{ element.description }}
            </div>
          </div>
        </div>
      </div>

      <div class="panel-elements__footer">
        Drag elements onto the canvas to build your form
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "../../assets/scss/abstracts" as *; // Added for SCSS variables and mixins

/* Component-specific styles for ElementPanel, including .panel and .panel-elements styles */

.panel {
  background-color: var(--theme-panel-bg);
  border-radius: $border-radius;
  box-shadow: 0 10px 15px -3px rgba(var(--theme-shadow-color-rgb), 0.12),
    0 4px 6px -2px rgba(var(--theme-shadow-color-rgb), 0.08);
  overflow: hidden;
  color: var(--theme-text);

  // Panel header (generic part, can be specialized or used as is)
  &__header {
    padding: $spacing-lg;
    border-bottom: 1px solid var(--theme-border);
    @include flex-between;

    h2,
    h3 {
      margin: 0;
      @include heading-3;
      color: var(--theme-text);
    }

    .actions {
      @include flex(row, flex-end, center);
      gap: $spacing-sm;
    }
  }

  // Panel body (generic part)
  &__body {
    padding: $spacing-md;
  }

  // Panel footer (generic part)
  &__footer {
    padding: $spacing-md;
    border-top: 1px solid var(--theme-border);
    @include flex-between;
  }
}

.element-panel-container {
  display: flex;
  justify-content: center;
}

// Styles specifically for Element Panel, extending/using .panel structure
.panel-elements {
  width: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: $spacing-lg;

  // Element panel header specifics (if any, beyond .panel__header)
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md;
  }

  &__title {
    @include heading-3;
    margin: 0;
    display: flex;
    align-items: center;
  }

  &__icon {
    height: 1rem;
    width: 1rem;
    margin-right: $spacing-sm;
    color: var(--theme-primary-light);
  }

  &__badge {
    font-size: 0.75rem;
    padding: $spacing-xs $spacing-sm;
    border-radius: 9999px;
    background-color: var(--theme-primary);
    color: var(--theme-text-inverse);
  }

  // Element panel body specifics
  &__body {
    flex: 1;
    overflow-y: auto; // This should be panel-scroll if scrollbar styles are desired
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-md;
  }

  // Element panel footer specifics (if any, beyond .panel__footer)
  &__footer {
    text-align: center;
    font-size: 0.75rem;
    color: var(--theme-text-muted);
  }
}

.element-item {
  user-select: none;
  position: relative;
  min-width: 120px;
  padding: $spacing-md;
  background-color: var(--theme-item-bg);
  border-radius: $border-radius;
  cursor: move;
  border: 1px solid var(--theme-border);
  @include transition;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--theme-text);

  &:hover {
    background-color: var(--theme-item-hover-bg);
    border-color: var(--theme-primary);
  }

  &.dragging {
    opacity: 0.5;
    border: 1px dashed var(--theme-primary);
    box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.5);
  }

  &__content {
    text-align: center;
  }

  &__label {
    font-weight: $font-weight-medium;
    font-size: $font-size-base;
  }

  &__description {
    font-size: $font-size-sm;
    color: var(--theme-text-muted);
  }
}

.element-icon {
  padding: $spacing-sm;
  background-color: var(--theme-element-icon-bg);
  border-radius: 50%;
  color: var(--theme-element-icon-color);
  margin-bottom: $spacing-md;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  // Make the span a flex container too to center its v-html content
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0; // Helps with vertical alignment of SVGs
  }

  &__svg {
    height: 1rem;
    width: 1rem;
  }
}

// Draggable element styles (from _form-elements.scss)
/* .draggable-element {
  cursor: move;
  padding: $spacing-sm;
  border: 1px solid var(--theme-border); // Use CSS var
  border-radius: $border-radius;
  @include transition;
  margin-bottom: $spacing-sm;
  background-color: var(--theme-bg-surface); // Use CSS var
  color: var(--theme-text);

  &:hover {
    border-color: var(--theme-primary);
    box-shadow: $shadow-sm;
    background-color: var(--theme-item-hover-bg); // Use CSS var
  }

  // .is-dragging is handled by the .dragging class on .element-item

  .icon {
    margin-right: $spacing-sm;
    color: var(--theme-text-muted); // Use CSS var
    width: 1rem;
    height: 1rem;
  }

  .label {
    font-weight: 500;
    // color: $text-light; // Inherits from .draggable-element
  }
} */

@media (max-width: 640px) {
  .panel-elements__grid {
    grid-template-columns: 1fr;
  }
}

// Styles for the SVG icons if needed, though they might be self-styled
:deep(.element-icon__svg) {
  // Using :deep because v-html creates content outside component scope
  width: 1.5rem; // Example size
  height: 1.5rem; // Example size
  stroke-width: 1.5; // Example stroke width, if not set in SVG string
  // color: var(--theme-icon-color); // Example theming
}
</style>
