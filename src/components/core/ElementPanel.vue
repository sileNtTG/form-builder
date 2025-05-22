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
const handleDragStart = (e: DragEvent, elementType: string) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData("application/element-type", elementType);
    e.dataTransfer.effectAllowed = "copy";
  }
};
</script>

<template>
  <!-- Entferne das große zentrale 'Form Elements' Overlay/Panel vollständig aus dem Template. -->
  <!-- (Kein weiterer Block mit 'Form Elements' Headline, Cards oder Panel im Template.) -->

  <!-- Toolbar/Panel am unteren Rand -->
  <div class="elements-toolbar elements-toolbar--card">
    <div class="elements-toolbar__headline">
      <svg class="headline-icon" viewBox="0 0 20 20" fill="none">
        <rect
          x="3"
          y="3"
          width="14"
          height="14"
          rx="2"
          stroke="#1abc9c"
          stroke-width="1.5"
        />
        <path
          d="M6 7h8"
          stroke="#1abc9c"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M6 10h8"
          stroke="#1abc9c"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M6 13h4"
          stroke="#1abc9c"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
      Form Elements
    </div>
    <div class="elements-toolbar__inner">
      <div
        v-for="element in elements"
        :key="element.type"
        class="elements-toolbar__card"
        draggable="true"
        @dragstart="(e) => handleDragStart(e, element.type)"
      >
        <div class="icon-bg" v-html="element.icon"></div>
        <div class="elements-toolbar__label">{{ element.label }}</div>
        <div class="elements-toolbar__sublabel">{{ element.description }}</div>
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

.elements-toolbar--card {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: rgba(28, 32, 38, 0.98);
  border-top: 1.5px solid var(--theme-border, #333a44);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 0.5rem 0;
  height: auto;

  .elements-toolbar__headline {
    color: #eaf6f6;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    margin: 0.5rem 0 0.1rem 0;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    .headline-icon {
      width: 18px;
      height: 18px;
      stroke-width: 1.5;
      display: inline-block;
      vertical-align: middle;
    }
  }

  .elements-toolbar__inner {
    max-width: 1000px;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: center;
    gap: 0.7rem;
    padding: 0.7rem;
  }
  .elements-toolbar__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100px;
    min-width: 90px;
    height: 90px;
    background: #232834;
    border-radius: 14px;
    box-shadow: 0 2px 8px #0002;
    border: 1.2px solid #2c313c;
    cursor: grab;
    user-select: none;
    transition: box-shadow 0.15s, border 0.15s, background 0.15s;
    &:hover {
      border: 1.2px solid var(--theme-primary, #1abc9c);
      box-shadow: 0 4px 16px #1abc9c33;
      background: #262b36;
    }
    .icon-bg {
      background: #232834;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0.7rem auto 0.3rem auto;
      box-shadow: 0 1px 4px #0002;
      transition: background 0.15s, box-shadow 0.15s;
      svg {
        width: 24px;
        height: 24px;
        stroke-width: 2.2;
        stroke: #1abc9c;
        display: block;
      }
    }
    .elements-toolbar__label {
      font-size: 0.92rem;
      color: #eaf6f6;
      font-weight: 600;
      margin-bottom: 0.05rem;
      text-align: center;
    }
    .elements-toolbar__sublabel {
      font-size: 0.72rem;
      color: #bfc9d1;
      text-align: center;
      font-weight: 400;
      line-height: 1.1;
      margin-bottom: 0.1rem;
    }
  }
}
</style>
