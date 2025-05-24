<template>
  <div class="toasts-wrapper">
    <TransitionGroup name="toast" tag="div" class="toasts-container">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        v-bind="toast"
        @close="removeToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import Toast from "./Toast.vue";

const toastStore = useToastStore();
const { toasts, removeToast } = toastStore;
</script>

<style lang="scss" scoped>
.toasts-wrapper {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  pointer-events: none;
  width: 100%;
  max-width: 400px;
}

.toasts-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

// Toast animations
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
