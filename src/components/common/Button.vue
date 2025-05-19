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
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "md",
  iconOnly: false,
  disabled: false,
  fullWidth: false,
});

const buttonClasses = computed(() => {
  return [
    "btn",
    `btn-${props.variant}`,
    {
      "btn-sm": props.size === "sm",
      "btn-lg": props.size === "lg",
      "btn-icon": props.iconOnly,
      "btn--full": props.fullWidth,
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
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  line-height: 1.5;
  border-radius: $border-radius;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  @include transition;
  border: 1px solid transparent;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  &-default {
    background-color: var(--theme-button-default-bg);
    color: var(--theme-button-default-text);
    border-color: var(--theme-button-default-border);

    &:hover:not(:disabled) {
      background-color: var(--theme-button-default-hover-bg);
    }
  }

  &-primary {
    background-color: var(--theme-primary);
    color: var(--theme-text-inverse);
    border-color: var(--theme-primary);

    &:hover:not(:disabled) {
      background-color: var(--theme-primary-dark);
      border-color: var(--theme-primary-dark);
    }
  }

  &-secondary {
    background-color: var(--theme-secondary);
    color: var(--theme-text-inverse);
    border-color: var(--theme-secondary);

    &:hover:not(:disabled) {
      background-color: var(--theme-secondary-dark);
      border-color: var(--theme-secondary-dark);
    }
  }

  &-danger {
    background-color: var(--theme-danger);
    color: var(--theme-text-inverse);
    border-color: var(--theme-danger);

    &:hover:not(:disabled) {
      background-color: var(--theme-danger-dark);
      border-color: var(--theme-danger-dark);
    }
  }

  &-outline-primary {
    background-color: transparent;
    border: 1px solid var(--theme-primary);
    color: var(--theme-primary);

    &:hover:not(:disabled) {
      background-color: rgba(var(--theme-primary-rgb), 0.1);
    }
  }

  &-sm {
    padding: $spacing-xs $spacing-sm;
    font-size: $font-size-sm;
  }

  &-lg {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-lg;
  }

  &--full {
    width: 100%;
  }

  &-icon {
    padding: $spacing-sm;
    border-radius: 50%;

    &.btn-sm {
      padding: $spacing-xs;
    }

    &.btn-lg {
      padding: $spacing-md;
    }

    > svg,
    > img {
      width: 1em;
      height: 1em;
    }
  }

  svg,
  img {
    width: 1.2em;
    height: 1.2em;
  }

  &:not(.btn-icon) {
    slot[name="icon-left"] + slot:not([name]),
    slot:not([name]) + slot[name="icon-right"] {
      svg,
      img {
        margin-right: $spacing-xs;
      }
    }
    slot[name="icon-right"] {
      svg,
      img {
        margin-left: $spacing-xs;
      }
    }
  }
}
</style>
