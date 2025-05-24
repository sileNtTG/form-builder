<script setup lang="ts">
import { computed } from "vue";
import { SvgIcon } from "@/components/common";

interface Props {
  published?: boolean;
  publishedAt?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showDate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  published: false,
  size: "md",
  showText: true,
  showDate: false,
});

const statusText = computed(() => {
  return props.published ? "Published" : "Draft";
});

const statusIcon = computed(() => {
  return props.published ? "check-circle" : "circle";
});

const formattedDate = computed(() => {
  if (!props.publishedAt) return "";

  const date = new Date(props.publishedAt);
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: {
      container: "publish-status--sm",
      icon: 12,
      text: "text-xs",
    },
    md: {
      container: "publish-status--md",
      icon: 14,
      text: "text-sm",
    },
    lg: {
      container: "publish-status--lg",
      icon: 16,
      text: "text-base",
    },
  };

  return sizes[props.size];
});
</script>

<template>
  <div
    class="publish-status"
    :class="[
      sizeClasses.container,
      {
        'publish-status--published': published,
        'publish-status--draft': !published,
      },
    ]"
  >
    <SvgIcon
      :name="statusIcon"
      :size="sizeClasses.icon"
      class="publish-status__icon"
    />

    <span
      v-if="showText"
      class="publish-status__text"
      :class="sizeClasses.text"
    >
      {{ statusText }}
    </span>

    <span
      v-if="showDate && published && publishedAt"
      class="publish-status__date"
      :class="sizeClasses.text"
    >
      {{ formattedDate }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/abstracts" as *;

.publish-status {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius;
  font-weight: 500;
  @include transition(all, $transition-fast);

  &--published {
    background: rgba(16, 185, 129, 0.1);
    color: var(--theme-success, #10b981);
    border: 1px solid rgba(16, 185, 129, 0.3);

    .publish-status__icon {
      color: var(--theme-success, #10b981);
    }
  }

  &--draft {
    background: rgba(156, 163, 175, 0.1);
    color: var(--theme-text-muted, #9ca3af);
    border: 1px solid rgba(156, 163, 175, 0.3);

    .publish-status__icon {
      color: var(--theme-text-muted, #9ca3af);
    }
  }

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

  &__icon {
    flex-shrink: 0;
  }

  &__text {
    white-space: nowrap;
  }

  &__date {
    opacity: 0.8;
    font-weight: 400;
    margin-left: $spacing-xs;

    &::before {
      content: "•";
      margin-right: $spacing-xs;
      opacity: 0.5;
    }
  }

  // Hover effects
  &:hover {
    &.publish-status--published {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.4);
    }

    &.publish-status--draft {
      background: rgba(156, 163, 175, 0.15);
      border-color: rgba(156, 163, 175, 0.4);
    }
  }
}

// Light theme adjustments
:global(.theme-light) {
  .publish-status {
    &--published {
      background: rgba(16, 185, 129, 0.08);
      color: #059669;
      border-color: rgba(16, 185, 129, 0.2);

      .publish-status__icon {
        color: #059669;
      }

      &:hover {
        background: rgba(16, 185, 129, 0.12);
        border-color: rgba(16, 185, 129, 0.3);
      }
    }

    &--draft {
      background: rgba(107, 114, 128, 0.08);
      color: #6b7280;
      border-color: rgba(107, 114, 128, 0.2);

      .publish-status__icon {
        color: #6b7280;
      }

      &:hover {
        background: rgba(107, 114, 128, 0.12);
        border-color: rgba(107, 114, 128, 0.3);
      }
    }
  }
}
</style>
