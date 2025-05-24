<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { SvgIcon } from "@/components/common";

interface Props {
  show: boolean;
  title?: string;
  closable?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
  size: "md",
});

const emit = defineEmits<{
  close: [];
  "update:show": [value: boolean];
}>();

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.closable) {
    closeModal();
  }
};

const closeModal = () => {
  emit("close");
  emit("update:show", false);
};

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget && props.closable) {
    closeModal();
  }
};

// Watch for show prop changes to handle body scroll
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
  { immediate: true }
);

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-backdrop" @click="handleBackdropClick">
        <div
          class="modal-container"
          :class="[`modal-container--${size}`]"
          @click.stop
        >
          <!-- Header -->
          <div v-if="title || closable" class="modal-header">
            <h3 v-if="title" class="modal-title">{{ title }}</h3>
            <button
              v-if="closable"
              class="modal-close"
              @click="closeModal"
              aria-label="Close modal"
            >
              <SvgIcon name="x" :size="20" />
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-container {
  background: var(--theme-bg-surface, #1a1e29);
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--theme-border, #333a44);

  &--sm {
    width: 100%;
    max-width: 400px;
  }

  &--md {
    width: 100%;
    max-width: 600px;
  }

  &--lg {
    width: 100%;
    max-width: 800px;
  }

  &--xl {
    width: 100%;
    max-width: 1200px;
  }

  &--full {
    width: 95vw;
    height: 95vh;
    max-width: none;
    max-height: none;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid var(--theme-border, #333a44);
  padding-bottom: 1rem;
  margin-bottom: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--theme-text, #eaf6f6);
}

.modal-close {
  background: none;
  border: none;
  color: var(--theme-text-muted, #aaa);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--theme-bg-alt, #2a2f3a);
    color: var(--theme-text, #eaf6f6);
  }
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  color: var(--theme-text, #eaf6f6);
}

.modal-footer {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid var(--theme-border, #333a44);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

// Transitions
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(-20px);
}
</style>
