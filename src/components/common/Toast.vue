<template>
  <div class="toast" :class="[`toast--${type}`]">
    <div class="toast__content">
      <p class="toast__text">
        <strong v-if="title" class="toast__title">{{ title }}</strong>
        {{ text }}
      </p>
    </div>
    <button v-if="closable" class="toast__close" @click="$emit('close')">
      <SvgIcon name="x" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { SvgIcon } from "@/components/common";

interface Props {
  title?: string;
  text: string;
  type: "success" | "error" | "warning" | "info";
  closable?: boolean;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
  duration: 4000,
});

const emit = defineEmits<{
  close: [];
}>();

// Auto-dismiss after duration
if (props.duration > 0) {
  setTimeout(() => {
    emit("close");
  }, props.duration);
}
</script>

<style lang="scss" scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--theme-bg-surface);
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  min-width: 300px;
  max-width: 400px;
  pointer-events: auto;

  &--success {
    border: 2px solid #10b981;
    background: linear-gradient(
      135deg,
      rgba(16, 185, 129, 0.1),
      rgba(16, 185, 129, 0.05)
    );
  }

  &--error {
    border: 2px solid #ef4444;
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.1),
      rgba(239, 68, 68, 0.05)
    );
  }

  &--warning {
    border: 2px solid #f59e0b;
    background: linear-gradient(
      135deg,
      rgba(245, 158, 11, 0.1),
      rgba(245, 158, 11, 0.05)
    );
  }

  &--info {
    border: 2px solid #3b82f6;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.1),
      rgba(59, 130, 246, 0.05)
    );
  }

  &__content {
    flex: 1;
  }

  &__text {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.4;
    color: var(--theme-text);
  }

  &__title {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }

  &__close {
    flex-shrink: 0;
    background: none;
    border: none;
    color: var(--theme-text-muted);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--theme-text);
    }
  }
}
</style>
