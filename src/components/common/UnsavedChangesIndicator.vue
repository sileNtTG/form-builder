<template>
  <Transition name="slide-down">
    <div v-if="hasUnsavedChanges" class="unsaved-changes-indicator">
      <div class="indicator-content">
        <SvgIcon name="info" :size="16" />
        <span class="indicator-text">Ungespeicherte Änderungen</span>
        <div class="indicator-actions">
          <button @click="$emit('save')" class="action-btn action-btn--primary">
            Speichern
          </button>
          <button
            @click="$emit('discard')"
            class="action-btn action-btn--danger"
          >
            Änderungen verwerfen
          </button>
        </div>
        <button
          @click="$emit('discard')"
          class="close-btn"
          title="Änderungen verwerfen"
        >
          <SvgIcon name="x" :size="16" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { SvgIcon } from "@/components/common";

interface Props {
  hasUnsavedChanges: boolean;
}

defineProps<Props>();

defineEmits<{
  save: [];
  discard: [];
}>();
</script>

<style lang="scss" scoped>
.unsaved-changes-indicator {
  position: fixed;
  bottom: 20px; // 20px from bottom
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: var(--theme-bg-surface);
  border: 2px solid #f59e0b;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  min-width: 400px;
  max-width: 500px;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.1),
    rgba(245, 158, 11, 0.05)
  );
}

.indicator-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}

.indicator-text {
  flex: 1;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--theme-text);
}

.indicator-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &--primary {
    background: var(--theme-primary, #1abc9c);
    color: white;

    &:hover {
      background: var(--theme-primary-hover, #16a085);
    }
  }

  &--danger {
    background: #ef4444;
    color: white;

    &:hover {
      background: #dc2626;
    }
  }
}

.close-btn {
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

// Animations
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(100%);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(100%);
}
</style>
