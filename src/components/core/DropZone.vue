<script setup lang="ts">
import { ref } from "vue";
import { useDragAndDrop } from "@/composables";

interface Props {
  position: "before" | "after";
  siblingId?: string;
  parentId?: string;
}

const props = defineProps<Props>();
const { isDragging, handleDrop } = useDragAndDrop();

// Local state for this specific drop zone
const isHovering = ref(false);

const onDragEnter = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer!.dropEffect = "copy";
  isHovering.value = true;
};

const onDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isHovering.value = false;
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  isHovering.value = false; // Reset hover state on drop

  if (!isDragging.value) {
    return;
  }

  const elementType = event.dataTransfer?.getData("text/plain");
  const elementId = event.dataTransfer?.getData("application/x-element-id");

  // Prevent element from being dropped into itself (e.g., fieldset into its own children)
  if (elementId && elementId === props.parentId) {
    return;
  }

  const dropData = {
    position: props.position,
    siblingId: props.siblingId,
    parentId: props.parentId,
    elementId: elementId || undefined,
    elementType: elementType || undefined,
  };

  if (elementId) {
    // Moving existing element
    handleDrop(dropData);
  } else if (elementType) {
    // Creating new element
    handleDrop(dropData);
  }
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer!.dropEffect = "move";
};
</script>

<template>
  <div
    v-if="isDragging"
    class="drop-zone-container"
    :class="{
      'drop-zone-container--hovering': isHovering,
      [`drop-zone-container--${position}`]: position,
    }"
    @drop="onDrop"
    @dragover="onDragOver"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
  ></div>
</template>

<style lang="scss" scoped>
.drop-zone-container {
  height: 24px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  pointer-events: all;
  margin: 0;
  padding: 0;

  &--hovering {
    &::before {
      content: "";
      width: 90%;
      height: 4px;
      border: none;
      border-radius: 2px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        #1abc9c 20%,
        #16a085 50%,
        #1abc9c 80%,
        transparent 100%
      );
      animation: dropPulse 1.5s ease-in-out infinite;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
  }

  &--before {
    // Could add specific styling for before position
  }

  &--after {
    // Could add specific styling for after position
  }
}
</style>
