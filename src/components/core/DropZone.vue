<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  position: "before" | "after";
  siblingId?: string;
  parentId?: string; // For fieldset drops
  isDragging?: boolean; // Global dragging state from parent
}>();

const emit = defineEmits<{
  drop: [
    data: {
      position: "before" | "after";
      siblingId?: string;
      parentId?: string;
      elementId?: string;
      elementType?: string;
    }
  ];
}>();

const isDragOver = ref(false);

function handleDragEnter(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  isDragOver.value = true;
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "move";
  }
}

function handleDragLeave(e: DragEvent) {
  // Only reset if actually leaving the drop zone
  const relatedTarget = e.relatedTarget as HTMLElement;
  const currentTarget = e.currentTarget as HTMLElement;

  if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
    isDragOver.value = false;
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  isDragOver.value = false;

  if (e.dataTransfer) {
    const elementId =
      e.dataTransfer.getData("application/element-id") ||
      e.dataTransfer.getData("text/plain");
    const elementType = e.dataTransfer.getData("application/element-type");

    console.log(
      `🎯 DROP ZONE: ${elementId?.slice(-8) || elementType} ${props.position} ${
        props.siblingId?.slice(-8) || "end"
      } parentId: ${props.parentId?.slice(-8) || "none"}`
    );

    emit("drop", {
      position: props.position,
      siblingId: props.siblingId,
      parentId: props.parentId,
      elementId: elementId || undefined,
      elementType: elementType || undefined,
    });
  }
}
</script>

<template>
  <!-- Only show drop zone when something is being dragged -->
  <div
    v-if="isDragging"
    class="drop-zone"
    :class="{
      'drop-zone--active': isDragOver,
      'drop-zone--before': position === 'before',
      'drop-zone--after': position === 'after',
    }"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- Zeige Drop-Indikator nur bei Hover -->
    <div class="drop-zone__indicator">
      <div class="drop-zone__line"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/abstracts/keyframes.scss";

.drop-zone {
  /* Always take some space when dragging */
  height: 8px;
  width: 100%;
  position: relative;
  margin: 8px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;

  /* Expand clickable area beyond visual boundaries */
  &::before {
    content: "";
    position: absolute;
    left: -8px;
    right: -8px;
    top: -8px;
    bottom: -8px;
  }

  &--active {
    opacity: 1;
  }

  &__indicator {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
  }

  &__line {
    width: 60%;
    height: 3px;
    background: var(--theme-primary, #1abc9c);
    border-radius: 2px;
    animation: dropPulse 1.5s infinite;
    box-shadow: 0 0 8px rgba(26, 188, 156, 0.6);
    transition: opacity 0.2s ease;
  }
}
</style>
