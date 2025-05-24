<template>
  <Transition name="slide-down">
    <div v-if="hasUnsavedChanges" class="unsaved-changes-indicator">
      <div class="indicator-content">
        <SvgIcon name="info" :size="16" />
        <span class="indicator-text">Ungespeicherte Änderungen</span>
        <button @click="$emit('save')" class="save-btn">Speichern</button>
        <button
          @click="$emit('discard')"
          class="discard-btn"
          title="Änderungen verwerfen"
        >
          <SvgIcon name="x" :size="14" />
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
  top: 60px; // Below the main header
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
}

.indicator-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}

.indicator-text {
  flex: 1;
  font-weight: 500;
  font-size: 0.9rem;
}

.save-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
}

.discard-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
}

// Animations
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}
</style>
