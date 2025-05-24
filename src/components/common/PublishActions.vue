<script setup lang="ts">
import { ref, computed } from "vue";
import { SvgIcon } from "@/components/common";

interface Props {
  published?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "icon" | "minimal";
}

const props = withDefaults(defineProps<Props>(), {
  published: false,
  disabled: false,
  loading: false,
  size: "md",
  variant: "button",
});

const emit = defineEmits<{
  publish: [];
  unpublish: [];
}>();

const isLoading = ref(false);

const actionText = computed(() => {
  return props.published ? "Unpublish" : "Publish";
});

const actionIcon = computed(() => {
  return props.published ? "eye-off" : "eye";
});

const buttonClass = computed(() => {
  const baseClasses = ["publish-action"];

  // Size classes
  baseClasses.push(`publish-action--${props.size}`);

  // Variant classes
  baseClasses.push(`publish-action--${props.variant}`);

  // State classes
  if (props.published) {
    baseClasses.push("publish-action--unpublish");
  } else {
    baseClasses.push("publish-action--publish");
  }

  if (props.disabled || props.loading || isLoading.value) {
    baseClasses.push("publish-action--disabled");
  }

  return baseClasses;
});

const handleAction = async () => {
  if (props.disabled || props.loading || isLoading.value) return;

  isLoading.value = true;

  try {
    if (props.published) {
      emit("unpublish");
    } else {
      emit("publish");
    }
  } finally {
    // Reset loading after a short delay to show feedback
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
};

const showText = computed(() => {
  return props.variant === "button" || props.variant === "minimal";
});

const showLoadingState = computed(() => {
  return props.loading || isLoading.value;
});
</script>

<template>
  <button
    :class="buttonClass"
    :disabled="disabled || loading || isLoading"
    @click="handleAction"
    :title="actionText"
  >
    <SvgIcon
      v-if="!showLoadingState"
      :name="actionIcon"
      :size="size === 'sm' ? 14 : size === 'lg' ? 18 : 16"
      class="publish-action__icon"
    />

    <SvgIcon
      v-else
      name="loader"
      :size="size === 'sm' ? 14 : size === 'lg' ? 18 : 16"
      class="publish-action__icon publish-action__spinner"
    />

    <span v-if="showText" class="publish-action__text">
      <template v-if="showLoadingState">
        {{ published ? "Unpublishing..." : "Publishing..." }}
      </template>
      <template v-else>
        {{ actionText }}
      </template>
    </span>
  </button>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/abstracts" as *;

.publish-action {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  border: none;
  border-radius: $border-radius;
  font-weight: 500;
  cursor: pointer;
  @include transition(all, $transition-fast);

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  // Size variants
  &--sm {
    padding: $spacing-xs $spacing-sm;
    font-size: 0.75rem;
  }

  &--md {
    padding: $spacing-sm $spacing-md;
    font-size: 0.875rem;
  }

  &--lg {
    padding: $spacing-md $spacing-lg;
    font-size: 1rem;
  }

  // Variant styles
  &--button {
    border: 1px solid transparent;
  }

  &--icon {
    padding: $spacing-sm;
    border-radius: 50%;
    border: 1px solid transparent;

    .publish-action__text {
      display: none;
    }
  }

  &--minimal {
    background: transparent;
    border: none;
    padding: $spacing-xs;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  // Action type styles
  &--publish {
    background: var(--theme-success, #10b981);
    color: white;
    border-color: var(--theme-success, #10b981);

    &:hover:not(.publish-action--disabled) {
      background: #059669;
      border-color: #059669;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    &.publish-action--minimal {
      background: transparent;
      color: var(--theme-success, #10b981);

      &:hover {
        background: rgba(16, 185, 129, 0.1);
      }
    }
  }

  &--unpublish {
    background: var(--theme-warning, #f59e0b);
    color: white;
    border-color: var(--theme-warning, #f59e0b);

    &:hover:not(.publish-action--disabled) {
      background: #d97706;
      border-color: #d97706;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    &.publish-action--minimal {
      background: transparent;
      color: var(--theme-warning, #f59e0b);

      &:hover {
        background: rgba(245, 158, 11, 0.1);
      }
    }
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  &__icon {
    flex-shrink: 0;
  }

  &__spinner {
    animation: spin 1s linear infinite;
  }

  &__text {
    white-space: nowrap;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Light theme adjustments
:global(.theme-light) {
  .publish-action {
    &--publish {
      background: #059669;
      border-color: #059669;

      &:hover:not(.publish-action--disabled) {
        background: #047857;
        border-color: #047857;
      }

      &.publish-action--minimal {
        color: #059669;

        &:hover {
          background: rgba(5, 150, 105, 0.1);
        }
      }
    }

    &--unpublish {
      background: #d97706;
      border-color: #d97706;

      &:hover:not(.publish-action--disabled) {
        background: #b45309;
        border-color: #b45309;
      }

      &.publish-action--minimal {
        color: #d97706;

        &:hover {
          background: rgba(217, 119, 6, 0.1);
        }
      }
    }

    &--minimal {
      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }
}
</style>
