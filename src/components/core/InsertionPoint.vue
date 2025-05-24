<script setup lang="ts">
import { SvgIcon } from "@/components/common";

const props = defineProps<{
  index: number;
  fieldsetId?: string;
  isDragging?: boolean; // Global dragging state from parent
}>();

const emit = defineEmits<{
  insert: [{ index: number; fieldsetId?: string }];
}>();

function handleClick() {
  if (props.isDragging) return; // Don't handle clicks while dragging

  emit("insert", {
    index: props.index,
    fieldsetId: props.fieldsetId,
  });
}
</script>

<template>
  <div
    class="insertion-point-container"
    :class="{ 'insertion-point--disabled': isDragging }"
  >
    <div class="insertion-point">
      <div class="insertion-line"></div>
      <button
        class="insertion-button"
        title="Element einfügen"
        @click="handleClick"
      >
        <SvgIcon name="plus" :size="18" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.insertion-point-container {
  padding: 2px 0;
  display: flex;
  justify-content: center;
  position: relative;
  width: 100%;
  pointer-events: all;
  opacity: 0;
  transition: opacity 0.2s ease;

  /* Nur bei Hover sichtbar, AUSSER beim Dragging */
  &:hover:not(.insertion-point--disabled) {
    opacity: 1;

    .insertion-button {
      transform: translate(-50%, -50%) scale(1);
    }
  }

  /* Beim Dragging komplett ausblenden */
  &.insertion-point--disabled {
    pointer-events: none;
    opacity: 0 !important; /* Force unsichtbar beim Dragging */
  }
}

.insertion-point {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  .insertion-line {
    flex: 1;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--theme-primary) 15%,
      var(--theme-primary) 85%,
      transparent 100%
    );
  }

  .insertion-button {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(0.7);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: var(--theme-primary);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(26, 188, 156, 0.5);
    transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 5;
    color: white;

    svg {
      width: 18px;
      height: 18px;
      stroke: white;
      fill: none;
      stroke-width: 2;
      transition: transform 0.2s;
      transform: translateX(-1px);
    }

    &:hover:not(.insertion-point--disabled *) {
      transform: translate(-50%, -50%) scale(1.15);
      box-shadow: 0 3px 8px rgba(26, 188, 156, 0.7);

      svg {
        transform: translateX(-1px) rotate(90deg);
      }
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
}
</style>
