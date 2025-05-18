<template>
  <button :class="buttonClasses" :disabled="disabled">
    <slot name="icon-left"></slot>
    <slot></slot>
    <slot name="icon-right"></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "danger"
    | "outline-primary"
    | "outline-secondary"
    | "outline-danger";
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "md",
  iconOnly: false,
  disabled: false,
});

const buttonClasses = computed(() => {
  return [
    "btn",
    `btn-${props.variant}`,
    {
      "btn-sm": props.size === "sm",
      "btn-lg": props.size === "lg",
      "btn-icon": props.iconOnly,
    },
  ];
});
</script>

<style lang="scss">
/* Component-specific styles for Button.vue */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-base; // Consider $font-size-base from _fonts.scss
  font-weight: $font-weight-medium; // Use new font weight vars
  line-height: 1.5;
  border-radius: $border-radius;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  @include transition;
  border: 1px solid transparent; // Base border

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  // Default button
  &-default {
    background-color: var(--theme-button-default-bg);
    color: var(--theme-button-default-text);
    border-color: var(--theme-button-default-border);

    &:hover:not(:disabled) {
      // Define hover colors in theme or adjust brightness here
      background-color: var(--theme-button-default-hover-bg);
    }
  }

  // Primary button
  &-primary {
    background-color: var(--theme-primary);
    color: var(--theme-text-inverse); // Text on primary bg
    border-color: var(--theme-primary);

    &:hover:not(:disabled) {
      background-color: var(--theme-primary-dark);
      border-color: var(--theme-primary-dark);
    }
  }

  // Secondary button
  &-secondary {
    background-color: var(--theme-secondary);
    color: var(--theme-text-inverse);
    border-color: var(--theme-secondary);

    &:hover:not(:disabled) {
      background-color: var(--theme-secondary-dark);
      border-color: var(--theme-secondary-dark);
    }
  }

  // Danger button
  &-danger {
    background-color: var(--theme-danger);
    color: var(--theme-text-inverse); // Often white text on danger red
    border-color: var(--theme-danger);

    &:hover:not(:disabled) {
      background-color: var(--theme-danger-dark);
      border-color: var(--theme-danger-dark);
    }
  }

  // Outline buttons (Example for primary)
  &-outline-primary {
    background-color: transparent;
    border: 1px solid var(--theme-primary);
    color: var(--theme-primary);

    &:hover:not(:disabled) {
      background-color: rgba(var(--theme-primary-rgb), 0.1);
    }
  }
  // Add other outline variants (secondary, danger) similarly if needed

  // Sizes
  &-sm {
    padding: $spacing-xs $spacing-sm;
    font-size: $font-size-sm;
  }

  &-lg {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-lg;
  }

  // Full width utility class for buttons if needed
  &--full {
    width: 100%;
  }

  // Icon button
  &-icon {
    padding: $spacing-sm; // Default for md size
    border-radius: 50%;

    &.btn-sm {
      padding: $spacing-xs;
    }

    &.btn-lg {
      padding: $spacing-md;
    }

    // To ensure icons scale within the button if they are direct children
    > svg,
    > img {
      width: 1em;
      height: 1em;
    }
  }

  // For icons passed via slots, you might need to style them in the parent or add specific classes to the slots
  // This provides a base for icons slotted directly or as direct children
  svg,
  img {
    // Default icon size - can be overridden by specific button size styles or icon-only styles
    width: 1.2em; // Relative to font-size for better scalability
    height: 1.2em;
  }

  // Adjustments for icons when they are not the only content
  &:not(.btn-icon) {
    slot[name="icon-left"] + slot:not([name]),
    slot:not([name]) + slot[name="icon-right"] {
      // If there is text content, add margin to the icon
      svg,
      img {
        margin-right: $spacing-xs; // For left icon
      }
    }
    slot[name="icon-right"] {
      svg,
      img {
        margin-left: $spacing-xs; // For right icon
      }
    }
  }
}
</style>
